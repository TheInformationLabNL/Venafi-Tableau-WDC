/*global tableau*/

import "./connector";
import "./style.scss";
import { getApiKey } from "./auth.js";

document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault();

    console.log("submit clicked");

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    const currentURL = new URL(window.location.href);
    let base_url = `${currentURL.protocol}//${currentURL.host}/VEDSDK`;
    tableau.connectionData = base_url;

    const qsParams = new URLSearchParams(currentURL.search);
    if (qsParams) {
        if (qsParams.has("baseUrl")) {
            tableau.connectionData = qsParams.get("baseUrl");
        }
    }

    tableau.connectionName = "Venafi " + tableau.connectionData;

    getApiKey(tableau.connectionData, username, password)
        .then((response) => {
            console.log("Received api key", response);
            tableau.username = username;
            tableau.password = JSON.stringify({
                password,
                apiKey: response,
            });

            tableau.submit();
        })
        .catch((err) => {
            console.error("Error:", err);
        });
});
