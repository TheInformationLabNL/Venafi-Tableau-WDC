/*global tableau*/
import { getApiKey, getBearerToken, minutesApiKeyValid } from "./auth.js";

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

    const tableConnections = [
        {
            alias: "Devices and applications",
            tables: [
                {
                    id: "all_devices",
                    alias: "All devices",
                },
                {
                    id: "all_applications",
                    alias: "All applications",
                },
            ],
            joins: [
                {
                    left: {
                        tableAlias: "All devices",
                        columnId: "DN",
                    },
                    right: {
                        tableAlias: "All applications",
                        columnId: "Parent",
                    },
                    joinType: "left",
                },
            ],
        },
    ];

    schemaCallback(
        [certificatesTable, devicesTable, applicationsTable, licenseCountTable, logEventsTable],
        tableConnections
    );
};

function reportError(_err) {
    if (_err && _err.message) {
        tableau.abortWithError("Error in WDC: " + _err.message);
    } else {
        tableau.abortWithError("Unknown error in WDC");
    }
}

connector.getData = function (table, doneCallback) {
    let passwordData;

    try {
        passwordData = JSON.parse(tableau.password);
    } catch (_err) {
        console.error("tableau.password had invalid contents", _err);
        tableau.abortForAuth("tableau.password had invalid contents");
        return;
    }

    if (!table.tableInfo || !table.tableInfo.id) {
        tableau.log("No table-id supplied by tableau");
        tableau.abortWithError("No table-id supplied by Tableau");
        return;
    }

    handleTokenLifespan(passwordData)
        .then(() => {
            switch (table.tableInfo.id) {
                case "all_certificates":
                    tableau.log("from getData(), calling fetchAllCertificates()");
                    fetchAllCertificates(table, passwordData.apiKey)
                        .then(() => {
                            tableau.log("from getData(), fetchAllCertificates() returned OK");
                            doneCallback();
                        })
                        .catch((_err) => {
                            reportError(_err);
                        });
                    break;
                case "all_devices":
                    fetchAllDevices(table, passwordData.apiKey)
                        .then(() => {
                            doneCallback();
                        })
                        .catch((_err) => {
                            reportError(_err);
                        });
                    break;
                case "all_applications":
                    fetchAllApplications(table, passwordData.apiKey)
                        .then(() => {
                            doneCallback();
                        })
                        .catch((_err) => {
                            reportError(_err);
                        });
                    break;
                case "license_counts":
                    fetchLicenseCounts(table, passwordData.apiKey)
                        .then(() => {
                            doneCallback();
                        })
                        .catch((_err) => {
                            reportError(_err);
                        });
                    break;
                case "log_events":
                    fetchLogEvents(table, passwordData.apiKey)
                        .then(() => {
                            doneCallback();
                        })
                        .catch((_err) => {
                            reportError(_err);
                        });
                    break;
                default:
                    tableau.log("Unknown table-id: " + table.tableInfo.id);
                    tableau.abortWithError("Tableau requested an unknown table-id: " + table.tableInfo.id);
                    doneCallback();
            }
        })
        .catch(() => {
            tableau.abortWithError(
                "The WDC could not refresh it's token. Please try after starting Tableau again, or delete and re-add the datasource"
            );
        });
};

async function handleTokenLifespan(passwordData) {
    try {
        if (passwordData.password && passwordData.apiKey && tableau.connectionData) {
            // We have enough to check if the apiKey is valid

            console.log("Checking if API key is valid");
            let dateDiff = await minutesApiKeyValid(tableau.connectionData, passwordData.apiKey);

            console.log(dateDiff);
            if (dateDiff > 5) {
                console.log("Enough minutes left, lets use it");
                // We have more than 5 minutes left. Let's use it!
                return passwordData;
            }

            throw "apiKey is expired";
        }
    } catch (_err) {
        // We have no apiKey, it's invalid or it's expired. Clear it
        passwordData.apiKey = null;
    }

    if (passwordData.password && tableau.username) {
        // We can try to get a new apiKey
        console.log("Trying to get new API key");

        try {
            let newKey = await getApiKey(
                tableau.connectionData,
                tableau.username,
                passwordData.password
            );

            console.log("Received a new apikey (but not showing it here)");
            passwordData.apiKey = newKey;

            return passwordData;
        } catch (_err) {
            throw "Error in trying to get apiKey. Reauthenticate";
        }
    } else if (passwordData.refreshToken && passwordData.clientId) {
        try {
            let newKey = await getBearerToken(
                tableau.connectionData,
                passwordData.clientId,
                passwordData.refreshToken
            );

            console.log("Received a new apikey through the refreshtoken");
            passwordData.apiKey = newKey;

            return passwordData;
        } catch (_err) {
            throw "Error in trying to use refreshtoken to get apiKey. Reauthenticate";
        }
    } else {
        throw "No current username, password, clientId, refreshToken and/or apiKey present. Reauthenticate";
    }
}

connector.init = async function (initCallback) {
    tableau.log("VENAFI init callback");
    console.log("init:", tableau);

    if (tableau.phase !== "gatherData") {
        console.log("We're not in gatherData, stopping init");
        initCallback();
        return;
    }

    let passwordData;
    try {
        passwordData = JSON.parse(tableau.password);
    } catch (_err) {
        console.error("tableau.password had invalid contents", _err);
        tableau.abortForAuth("tableau.password had invalid contents");
        return;
    }

    try {
        let newPasswordData = await handleTokenLifespan(passwordData);

        tableau.password = JSON.stringify(newPasswordData);
        initCallback();
        return;
    } catch (_err) {
        tableau.abortForAuth("Error while getting new apiKey, reauthenticate");
        return;
    }
};

tableau.registerConnector(connector);
