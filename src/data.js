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

async function fetchPages(startUrl, apiKey, element, postBody) {
    let data = [];
    let workUrl = startUrl;
    while (workUrl) {
        let response;
        if (postBody) {
            response = await axios.post(workUrl, postBody, {
                headers: {
                    "X-Venafi-API-Key": apiKey,
                },
            });
        } else {
            response = await axios.get(workUrl, {
                headers: {
                    "X-Venafi-API-Key": apiKey,
                },
            });
        }

        if (response.status === 200) {
            if (element) {
                data = data.concat(response.data[element]);
            } else {
                data = data.concat(response.data);
            }
        }

        if (response.data._links && response.data._links.length && response.data._links[0].Next) {
            workUrl = response.data._links[0].Next.replace(/^\/vedsdk/, "");
            debugger;
        } else {
            workUrl = false;
        }
    }

    return data;
}

async function fetchCertificateDetail(url, certificate, apiKey) {
    let rtCert = certificate;
    console.log("Fetching detail for ", certificate.Guid);

    let response = await axios.get(`${url}/certificates/${certificate.Guid}`, {
        headers: {
            "X-Venafi-API-Key": apiKey,
        },
    });

    if (response.status == 200) {
        rtCert = Object.assign(certificate, response.data);
    }

    return rtCert;
}

async function fetchDeviceDetail(url, device, apiKey) {
    let rtDevice = device;
    console.log("Fetching detail for ", device.DN);
    let response = await axios.post(
        `${url}/config/ReadAll`,
        {
            ObjectDN: device.DN,
        },
        {
            headers: {
                "X-Venafi-API-Key": apiKey,
            },
        }
    );

    if (response.status == 200) {
        rtDevice = Object.assign(device, response.data);
    }

    return rtDevice;
}

async function fetchAllCertificates(table, apiKey) {
    const url = tableau.connectionData;

    try {
        tableau.reportProgress("Fetching certificates");
        let dataEnabled = await fetchPages(`${url}/certificates?disabled=0`, apiKey, "Certificates");
        for (let cIdx = 0; cIdx < dataEnabled.length; cIdx++) {
            dataEnabled[cIdx].disabled = false;
            dataEnabled[cIdx] = await fetchCertificateDetail(url, dataEnabled[cIdx], apiKey);
        }

        let dataDisabled = await fetchPages(`${url}/certificates?disabled=1`, apiKey, "Certificates");
        dataDisabled.forEach((c) => {
            c.disabled = true;
        });

        let tableauData = transformData(dataEnabled.concat(dataDisabled), tables.AllCertificates.columns);
        let i = 0;
        while (i < tableauData.length) {
            tableau.reportProgress(`Returning certificate-data: ${i} / ${tableauData.length}`);
            table.appendRows(tableauData.slice(i, i + 100));
            i += 100;
        }
    } catch (_err) {
        console.error("Fetch all certificates error:", _err);
        if (_err.response) {
            console.error("Response error:", _err.response);
        }
        throw _err;
    }
}

async function fetchAllDevices(table, apiKey) {
    const url = tableau.connectionData;

    try {
        tableau.reportProgress("Fetching devices");
        let data = await fetchPages(`${url}/config/FindObjectsOfClass`, apiKey, "Objects", {
            Class: "Device",
        });

        for (let dIdx = 0; dIdx < data.length; dIdx++) {
            data[dIdx] = await fetchDeviceDetail(url, data[dIdx], apiKey);
        }

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
    const url = tableau.connectionData;

    try {
        tableau.reportProgress("Fetching applications");
        let data = await fetchPages(`${url}/config/EnumerateObjectsDerivedFrom`, apiKey, "Objects", {
            DerivedFrom: "Application Base",
        });

        for (let dIdx = 0; dIdx < data.length; dIdx++) {
            data[dIdx] = await fetchDeviceDetail(url, data[dIdx], apiKey);
        }

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

function promiseTimeout(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
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
                    debugger;
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
    const url = tableau.connectionData;
    try {
        tableau.reportProgress("Fetching log-events");

        let fetchUrl = `${url}/log`;
        if (table.incrementValue) {
            let lastLog = luxon.DateTime.fromFormat(table.incrementValue, "yyyy-LL-dd HH:mm:ss");
            let lastLogDate = lastLog.toFormat("yyyy-LL-dd");
            let lastLogTime = lastLog.toFormat("HH:mm:ss");
            fetchUrl = `${url}/log?FromTime=${lastLogDate}T${lastLogTime}`;
        }
        let data = await fetchPages(fetchUrl, apiKey, "LogEvents");

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
