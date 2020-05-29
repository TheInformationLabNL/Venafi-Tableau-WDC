/*global tableau,axios,luxon*/
import { tables } from "./schemas";
import { t } from "./typy/index.js";

function transformData(data, columns) {
    let outData = [];
    data.forEach((srcRow) => {
        let outRow = {};
        columns.forEach((col) => {
            const inputValue = t(srcRow, col.source).safeObject;

            if (col.transform !== undefined) {
                outRow[col.id] = col.transform(inputValue);
            } else {
                outRow[col.id] = inputValue;
            }
        });

        outData.push(outRow);
    });

    return outData;
}

function promiseTimeout(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

/**
 * queueEntry:
 * {
 *  url: string,
 *  postBody: object,
 *  cb: function,
 *  isRetry: bool
 * }
 */

/**
 * queueObject:
 * {
 *  items: array,
 *  done: array,
 *  working: int,
 *  apiKey: string,
 *  baseUrl: string
 * }
 */

async function handleQueueEntry(queueEntry, queueObject) {
    try {
        queueObject.working++;
        queueObject.done.push(queueEntry.url);
        // tableau.log(`handleQueueEntry: working on url ${queueEntry.url}`);

        let response;
        if (queueEntry.postBody) {
            // tableau.log(`handleQueueEntry: posting a body`);
            response = await axios.post(queueEntry.url, queueEntry.postBody, {
                headers: {
                    "X-Venafi-API-Key": queueObject.apiKey,
                },
            });
        } else {
            // tableau.log(`handleQueueEntry getting a request`);
            response = await axios.get(queueEntry.url, {
                headers: {
                    "X-Venafi-API-Key": queueObject.apiKey,
                },
            });
        }

        // tableau.log(`handleQueueEntry: received a response`);
        if (response.status === 200) {
            queueEntry.cb(response);
        }

        if (response.data._links && response.data._links.length && response.data._links[0].Next) {
            if (response.data.TotalCount) {
                // If we receive a TotalCount, we can guess all the pagination URLs. Make sure we don't add them if they are already in the queue, and see if we can speed this all up
                for (let offset = 100; offset < response.data.TotalCount; offset += 100) {
                    let urlObj = new URL(queueEntry.url);
                    let searchParams = urlObj.searchParams;
                    searchParams.set("offset", offset);
                    searchParams.set("limit", 100);
                    let qs = searchParams.toString();
                    urlObj.search = qs;
                    let newUrl = urlObj.toString();

                    let i = queueObject.items.findIndex((el) => el.url == newUrl);
                    if (i == -1) {
                        i = queueObject.done.findIndex((el) => el == newUrl);
                        if (i == -1) {
                            queueObject.items.push({
                                url: newUrl,
                                cb: queueEntry.cb,
                                postBody: queueEntry.postBody,
                                isRetry: false,
                            });
                        }
                    }
                }
            }

            let newUrl = new URL(
                response.data._links[0].Next.replace(/^\/vedsdk\//i, ""),
                queueObject.baseUrl
            ).toString();

            let idx = queueObject.items.findIndex((el) => el.url == newUrl);
            if (idx == -1) {
                idx = queueObject.done.findIndex((el) => el == newUrl);
                if (idx == -1) {
                    // only add the new entry if we don't have the url in queue already
                    queueObject.items.unshift({
                        url: newUrl,
                        cb: queueEntry.cb,
                        postBody: queueEntry.postBody,
                        isRetry: false,
                    });
                }
            }
        }
    } catch (_err) {
        tableau.log(`handleQueueEntry: received error: ` + JSON.stringify(_err));
    } finally {
        queueObject.working--;
    }
}

async function runQueue(queueObject) {
    queueObject.done = [];
    queueObject.working = 0;

    let timerId = setInterval(function () {
        console.log(
            "items in queue:" +
                queueObject.items.length +
                ", urls picked up: " +
                queueObject.done.length +
                ", currently running: " +
                queueObject.working
        );
    }, 500);

    for (;;) {
        if (queueObject.working >= 16) {
            // we have 16 running processes, wait a bit
            await promiseTimeout(100);
            continue;
        }

        if (queueObject.items.length < 1) {
            // we have nothing to start
            if (queueObject.working > 0) {
                // but processes are still running.. wait on them
                await promiseTimeout(100);
                continue;
            }

            // nothing to start, nothing to wait on. We're done
            clearInterval(timerId);
            console.log("queue done");
            return true;
        }

        let queueEntry = queueObject.items.shift();
        handleQueueEntry(queueEntry, queueObject).catch((err) => {
            clearInterval(timerId);
            tableau.log(`handleQueueEntry returned an error: ` + JSON.stringify(err));
            throw err;
        });
    }
}

async function fetchAllCertificates(table, apiKey) {
    let urlObj = new URL(tableau.connectionData + "/");
    if (tableau.connectionData.endsWith("/")) {
        urlObj = new URL(tableau.connectionData);
    }

    let certificateQueue = {
        baseUrl: urlObj.toString(),
        apiKey: apiKey,
        items: [],
        done: [],
        working: 0,
    };

    try {
        tableau.reportProgress("Fetching certificates");

        tableau.log("fetchAllCertificates: start fetching enabled certs");
        let dataEnabled = [];
        let dataDisabled = [];

        let certUrl = new URL("certificates?disabled=0", urlObj);
        certificateQueue.items.push({
            url: certUrl,
            postBody: false,
            isRetry: false,
            cb: (response) => {
                if (response.data.Certificates) {
                    dataEnabled = dataEnabled.concat(response.data.Certificates);
                }
            },
        });
        certUrl = new URL("certificates?disabled=1", urlObj);
        certificateQueue.items.push({
            url: certUrl,
            postBody: false,
            isRetry: false,
            cb: (response) => {
                if (response.data.Certificates) {
                    dataDisabled = dataDisabled.concat(response.data.Certificates);
                }
            },
        });
        await runQueue(certificateQueue);

        // For the enabled certs, mark them as 'disabled = false', and add the 'fetch-detail' url to the queue
        for (let cIdx = 0; cIdx < dataEnabled.length; cIdx++) {
            dataEnabled[cIdx].disabled = false;
            let cert = dataEnabled[cIdx];

            certUrl = new URL(`certificates/${cert.Guid}`, urlObj);
            certificateQueue.items.push({
                url: certUrl,
                postBody: false,
                isRetry: false,
                cb: (response) => {
                    dataEnabled[cIdx] = Object.assign(dataEnabled[cIdx], response.data);
                },
            });
        }

        // For the disabled certs, mark them as 'disabled = true', no need to fetch detail (for now)
        dataDisabled.forEach((c) => {
            c.disabled = true;
        });

        await runQueue(certificateQueue);

        tableau.log("fetchAllCertificates: transforming data for Tableau");
        let tableauData = transformData(dataEnabled.concat(dataDisabled), tables.AllCertificates.columns);

        tableau.log("fetchAllCertificates: Returning data in chunks");
        let i = 0;
        while (i < tableauData.length) {
            tableau.reportProgress(`Returning certificate-data: ${i} / ${tableauData.length}`);
            table.appendRows(tableauData.slice(i, i + 100));
            i += 100;
        }
    } catch (_err) {
        tableau.log("fetchAllCertificates: caught an exception");
        tableau.log("fetchAllCertificates: caught an exception: " + JSON.stringify(_err));
        console.error("Fetch all certificates error:", _err);
        if (_err.response) {
            tableau.log("fetchAllCertificates: response exception");
            tableau.log("fetchAllCertificates: response exception: " + JSON.stringify(_err.response));
            console.error("Response error:", _err.response);
        }
        throw _err;
    }
}

async function fetchAllDevices(table, apiKey) {
    let urlObj = new URL(tableau.connectionData + "/");
    if (tableau.connectionData.endsWith("/")) {
        urlObj = new URL(tableau.connectionData);
    }

    let deviceQueue = {
        baseUrl: urlObj.toString(),
        apiKey: apiKey,
        items: [],
        done: [],
        working: 0,
    };

    try {
        tableau.reportProgress("Fetching devices");

        let deviceUrl = new URL("config/FindObjectsOfClass", urlObj).toString();
        let data = [];
        deviceQueue.items.push({
            url: deviceUrl,
            postBody: {
                Class: "Device",
            },
            isRetry: false,
            cb: (response) => {
                if (response.data.Objects) {
                    data = data.concat(response.data.Objects);
                }
            },
        });
        await runQueue(deviceQueue);

        for (let dIdx = 0; dIdx < data.length; dIdx++) {
            let device = data[dIdx];
            deviceUrl = new URL("config/ReadAll", urlObj).toString();
            deviceQueue.items.push({
                url: deviceUrl,
                postBody: {
                    ObjectDN: device.DN,
                },
                isRetry: false,
                cb: (response) => {
                    data[dIdx] = Object.assign(data[dIdx], response.data);
                },
            });
        }
        await runQueue(deviceQueue);

        let tableauData = transformData(data, tables.AllDevices.columns);
        let i = 0;
        while (i < tableauData.length) {
            tableau.reportProgress(`Returning device-data: ${i} / ${tableauData.length}`);
            table.appendRows(tableauData.slice(i, i + 100));
            i += 100;
        }
    } catch (_err) {
        console.error("Fetch all devices error:", _err);
        if (_err.response) {
            console.error("Response error:", _err.response);
        }
        throw _err;
    }
}

async function fetchAllApplications(table, apiKey) {
    let urlObj = new URL(tableau.connectionData + "/");
    if (tableau.connectionData.endsWith("/")) {
        urlObj = new URL(tableau.connectionData);
    }

    let appQueue = {
        baseUrl: urlObj.toString(),
        apiKey: apiKey,
        items: [],
        done: [],
        working: 0
    };

    try {
        tableau.reportProgress("Fetching applications");

        let appUrl = new URL("config/EnumerateObjectsDerivedFrom", urlObj).toString();
        let data = [];
        appQueue.items.push({
            url: appUrl,
            postBody: {
                DerivedFrom: "Application Base",
            },
            isRetry: false,
            cb: (response) => {
                if (response.data.Objects) {
                    data = data.concat(response.data.Objects);
                }
            },
        });
        await runQueue(appQueue);

        for (let dIdx = 0; dIdx < data.length; dIdx++) {
            let app = data[dIdx];

            appUrl = new URL("config/ReadAll", urlObj).toString();
            appQueue.items.push({
                url: appUrl,
                postBody: {
                    ObjectDN: app.DN,
                },
                isRetry: false,
                cb: (response) => {
                    data[dIdx] = Object.assign(data[dIdx], response.data);
                },
            });
        }
        await runQueue(appQueue);

        let tableauData = transformData(data, tables.AllApplications.columns);
        let i = 0;
        while (i < tableauData.length) {
            tableau.reportProgress(`Returning application-data: ${i} / ${tableauData.length}`);
            table.appendRows(tableauData.slice(i, i + 100));
            i += 100;
        }
    } catch (_err) {
        console.error("Fetch all applications error:", _err);
        if (_err.response) {
            console.error("Response error:", _err.response);
        }
        throw _err;
    }
}

async function fetchLicenseCounts(table, apiKey) {
    const url = tableau.connectionData;
    try {
        let waiting = true;
        while (waiting) {
            // fetch report status
            let response = await axios.post(
                `${url}/config/ReadAll`,
                {
                    ObjectDN: "\\VED\\Reports\\Licensing Report",
                },
                {
                    headers: {
                        "X-Venafi-API-Key": apiKey,
                    },
                }
            );

            if (response.status == 200) {
                if (response.data.Result && response.data.Result == 400) {
                    // Error from API, probably 'does not exist', we need to create one
                    tableau.reportProgress("License report check gave an error. Requesting a new one and trying again");
                    await axios.post(
                        `${url}/config/AddValue`,
                        {
                            ObjectDN: "\\VED\\Reports\\Licensing Report",
                            AttributeName: "Start Now",
                            Value: "1",
                        },
                        {
                            headers: {
                                "X-Venafi-API-Key": apiKey,
                            },
                        }
                    );

                    await promiseTimeout(20000);
                    continue;
                }

                let values = response.data.NameValues;

                let csvVaultId = null;
                let lastRun = null;
                let startNow = null;

                values.forEach((nv) => {
                    if (nv.Name == "CSV Vault Id") {
                        csvVaultId = nv.Values[0];
                    } else if (nv.Name == "Last Run") {
                        lastRun = luxon.DateTime.fromFormat(nv.Values[0], "LL/dd/yyyy HH:mm:ss", { zone: "UTC" });
                    } else if (nv.Name == "Start Now") {
                        startNow = nv.Values[0];
                    }
                });

                let startDiff = null;
                if (lastRun) {
                    startDiff = lastRun.diffNow("hours");
                }

                if (startDiff !== null && startDiff > 47) {
                    // this report is too old, create a new one
                    tableau.reportProgress("License report is too old, creating a new one");
                    await axios.post(
                        `${url}/config/AddValue`,
                        {
                            ObjectDN: "\\VED\\Reports\\Licensing Report",
                            AttributeName: "Start Now",
                            Value: "1",
                        },
                        {
                            headers: {
                                "X-Venafi-API-Key": apiKey,
                            },
                        }
                    );

                    await promiseTimeout(20000);
                    continue;
                }

                if (startNow !== "1") {
                    // it's not done yet, wait some more
                    tableau.reportProgress("Waiting for license-report to be completed");
                    await promiseTimeout(20000);
                    continue;
                }

                if (csvVaultId) {
                    // We have a report!
                    tableau.reportProgress("Retrieving generated license-report");
                    response = await axios.post(
                        `${url}/SecretStore/Retrieve`,
                        {
                            VaultID: csvVaultId,
                        },
                        {
                            headers: {
                                "X-Venafi-API-Key": apiKey,
                            },
                        }
                    );

                    if (response.status == 200) {
                        let data = atob(response.data.Base64Data);
                        let lines = data.split("\n");
                        data = [];
                        lines.forEach((l) => {
                            let values = l.split(",");
                            if (values.length == 2) {
                                data[values[0].trim()] = values[1].trim();
                            }
                        });
                        data = [data];

                        let tableauData = transformData(data, tables.LicenseCounts.columns);
                        let i = 0;
                        while (i < tableauData.length) {
                            tableau.reportProgress(`Returning license-count-data: ${i} / ${tableauData.length}`);
                            table.appendRows(tableauData.slice(i, i + 100));
                            i += 100;
                        }

                        waiting = false;
                    }
                }
            } else {
                // wait 20 secs, try again
                await promiseTimeout(20000);
            }
        }
    } catch (_err) {
        console.error("Fetch license-count error:", _err);
        if (_err.response) {
            console.error("Response error:", _err.response);
        }
        throw _err;
    }
}

async function fetchLogEvents(table, apiKey) {
    let urlObj = new URL(tableau.connectionData + "/");
    if (tableau.connectionData.endsWith("/")) {
        urlObj = new URL(tableau.connectionData);
    }

    let logQueue = {
        baseUrl: urlObj.toString(),
        apiKey: apiKey,
        items: [],
        done: [],
        working: 0
    };

    try {
        tableau.reportProgress("Fetching log-events");

        let logUrl = new URL("log", urlObj);
        if (table.incrementValue) {
            let lastLog = luxon.DateTime.fromFormat(table.incrementValue, "yyyy-LL-dd HH:mm:ss");
            let lastLogDate = lastLog.toFormat("yyyy-LL-dd");
            let lastLogTime = lastLog.toFormat("HH:mm:ss");

            let searchParams = new URLSearchParams();
            searchParams.FromTime = `${lastLogDate}T${lastLogTime}`;
            logUrl.search = searchParams.toString();
        }

        let data = [];
        logQueue.items.push({
            url: logUrl.toString(),
            postBody: false,
            isRetry: false,
            cb: (response) => {
                if (response.data.LogEvents) {
                    data = data.concat(response.data.LogEvents);
                }
            },
        });
        await runQueue(logQueue);

        let tableauData = transformData(data, tables.LogEvents.columns);
        let i = 0;
        while (i < tableauData.length) {
            tableau.reportProgress(`Returning log-event-data: ${i} / ${tableauData.length}`);
            table.appendRows(tableauData.slice(i, i + 100));
            i += 100;
        }
    } catch (_err) {
        console.error("Fetch log-events error:", _err);
        if (_err.response) {
            console.error("Response error:", _err.response);
        }
        throw _err;
    }
}

export { fetchAllCertificates, fetchAllDevices, fetchAllApplications, fetchLicenseCounts, fetchLogEvents };
