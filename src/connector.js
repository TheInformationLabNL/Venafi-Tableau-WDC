/*global tableau*/
import { getApiKey, minutesApiKeyValid } from "./auth.js";

import { tables } from "./schemas";
import {
    fetchAllCertificates,
    fetchAllDevices,
    fetchAllApplications,
    fetchLicenseCounts,
    fetchLogEvents,
} from "./data";

let connector = tableau.makeConnector();

connector.getSchema = function (schemaCallback) {
    const certificatesTable = {
        id: "all_certificates",
        alias: "All certificates",
        columns: tables.AllCertificates.columns,
    };

    const devicesTable = {
        id: "all_devices",
        alias: "All devices",
        columns: tables.AllDevices.columns,
    };

    const applicationsTable = {
        id: "all_applications",
        alias: "All applications",
        columns: tables.AllApplications.columns,
    };

    const licenseCountTable = {
        id: "license_counts",
        alias: "LicenseCounts",
        columns: tables.LicenseCounts.columns,
    };

    const logEventsTable = {
        id: "log_events",
        alias: "Log events",
        columns: tables.LogEvents.columns,
        incrementColumnId: "ServerTimestamp",
    };

    schemaCallback([certificatesTable, devicesTable, applicationsTable, licenseCountTable, logEventsTable]);
};

connector.getData = function (table, doneCallback) {
    let passwordData;

    try {
        passwordData = JSON.parse(tableau.password);
        console.log("Password data:", passwordData);
    } catch (_err) {
        console.error("tableau.password had invalid contents", _err);
        tableau.abortForAuth("tableau.password had invalid contents");
        return;
    }

    console.log("Our api key:", passwordData.apiKey);

    if (!table.tableInfo || !table.tableInfo.id) {
        tableau.log("No table-id supplid by tableau");
        doneCallback();
        return;
    }

    switch (table.tableInfo.id) {
        case "all_certificates":
            fetchAllCertificates(table, passwordData.apiKey)
                .then(() => {
                    doneCallback();
                })
                .catch(() => {
                    tableau.abortWithError("");
                });
            break;
        case "all_devices":
            fetchAllDevices(table, passwordData.apiKey)
                .then(() => {
                    doneCallback();
                })
                .catch(() => {
                    tableau.abortWithError("");
                });
            break;
        case "all_applications":
            fetchAllApplications(table, passwordData.apiKey)
                .then(() => {
                    doneCallback();
                })
                .catch(() => {
                    tableau.abortWithError("");
                });
            break;
        case "license_counts":
            fetchLicenseCounts(table, passwordData.apiKey)
                .then(() => {
                    doneCallback();
                })
                .catch(() => {
                    tableau.abortWithError("");
                });
            break;
        case "log_events":
            fetchLogEvents(table, passwordData.apiKey)
                .then(() => {
                    doneCallback();
                })
                .catch(() => {
                    tableau.abortWithError("");
                });
            break;
        default:
            tableau.log("Unknown table-id: " + table.tableInfo.id);
            doneCallback();
    }
};

connector.init = async function (initCallback) {
    console.log("init:", tableau);

    if (tableau.phase !== "gatherData") {
        console.log("We're not in gatherData, stopping init");
        initCallback();
        return;
    }

    let passwordData;
    try {
        passwordData = JSON.parse(tableau.password);
        console.log("Password data:", passwordData);
    } catch (_err) {
        console.error("tableau.password had invalid contents", _err);
        tableau.abortForAuth("tableau.password had invalid contents");
        return;
    }

    try {
        if (passwordData.password && passwordData.apiKey && tableau.connectionData) {
            // We have enough to check if the apiKey is valid

            console.log("Checking if API key is valid");
            let dateDiff = await minutesApiKeyValid(tableau.connectionData, passwordData.apiKey);

            if (dateDiff > 5) {
                console.log("Enough minutes left, lets use it");
                // We have more than 3a minute left. Let's use it!
                initCallback();
                return;
            }

            throw "apiKey is expired";
        }
    } catch (_err) {
        // We have no apiKey, it's invalid or it's expired. Clear it
        passwordData.apiKey = null;
        tableau.password = JSON.stringify(passwordData);
    }

    try {
        if (passwordData.password && tableau.username) {
            // We can try to get a new apiKey
            console.log("Trying to get new API key");

            let newKey = await getApiKey(tableau.connectionData, tableau.username, passwordData.password);

            console.log("Received a new apikey", newKey);
            passwordData.apiKey = newKey;
            tableau.password = JSON.stringify(passwordData);

            initCallback();
            return;
        } else {
            tableau.abortForAuth("No current username, password and/or apiKey present. Reauthenticate");
            return;
        }
    } catch (err) {
        // Error while getting new apiKey
        tableau.abortForAuth("Error while getting new apiKey, reauthenticate");
    }

    console.log("Asking Tableau to reauthenticatie");
    tableau.abortForAuth("No authentication present");
};

tableau.registerConnector(connector);
