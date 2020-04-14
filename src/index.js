/*global tableau*/

import "./connector";
import "./style.scss";
import { getApiKey } from "./auth.js";

document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault();

    console.log("submit clicked");

    let base_url = document.getElementById("base-url").value;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    tableau.connectionData = base_url;
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
