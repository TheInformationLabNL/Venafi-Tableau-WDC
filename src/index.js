/*global tableau*/

import "./connector";
import "./style.scss";
import { getApiKey, getBearerToken } from "./auth.js";

function formSubmitHandler(e) {
    e.preventDefault();

    console.log("submit clicked");
    document.querySelectorAll(".submit-button").forEach((el) => {
        el.className = "my submit-button is-inactive";
        el.setAttribute("disabled", "disabled");
    });
    document.querySelectorAll(".error").forEach((el) => {
        el.className = "error is-hidden";
    });

    let username = document.getElementById("username").value || null;
    let password = document.getElementById("password").value || null;

    let clientId = document.getElementById("client_id").value || null;
    let refreshToken = document.getElementById("refresh_token").value || null;

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

    if (username && password) {
        getApiKey(tableau.connectionData, username, password)
            .then((response) => {
                tableau.username = username;
                tableau.password = JSON.stringify({
                    password,
                    apiKey: response,
                });

                tableau.submit();
            })
            .catch((err) => {
                console.error("Error: ", err);
                document.querySelectorAll(".submit-button").forEach((el) => {
                    el.className = "my submit-button";
                    el.removeAttribute("disabled");
                });
                document.querySelectorAll(".error").forEach((el) => {
                    el.className = "error";
                    el.innerHTML = "Error while authenticating: " + err;
                });
            });
    } else if (clientId && refreshToken) {
        getBearerToken(tableau.connectionData, clientId, refreshToken)
            .then((response) => {
                tableau.username = "token";
                tableau.password = JSON.stringify({
                    clientId,
                    refreshToken,
                    apiKey: response,
                });

                tableau.submit();
            })
            .catch((err) => {
                console.error("Error: ", err);
                document.querySelectorAll(".submit-button").forEach((el) => {
                    el.className = "my submit-button";
                    el.removeAttribute("disabled");
                });
                document.querySelectorAll(".error").forEach((el) => {
                    el.className = "error";
                    el.innerHTML = "Error while authenticating: " + err;
                });
            });
    } else {
        document.querySelectorAll(".submit-button").forEach((el) => {
            el.className = "my submit-button";
            el.removeAttribute("disabled");
        });
        document.querySelectorAll(".error").forEach((el) => {
            el.className = "error";
            el.innerHTML = "Not all the required fields are filled";
        });
    }
}

document.getElementById("userPassForm").addEventListener("submit", formSubmitHandler);
document.getElementById("tokenForm").addEventListener("submit", formSubmitHandler);

document.getElementById("userPassButton").addEventListener("click", function (e) {
    e.preventDefault();

    document.getElementById("userPassButton").className = "";
    document.getElementById("tokenButton").className = "is-inactive";
    document.getElementById("userPassAuth").className = "";
    document.getElementById("tokenAuth").className = "is-hidden";
});

document.getElementById("tokenButton").addEventListener("click", function (e) {
    e.preventDefault();

    document.getElementById("userPassButton").className = "is-inactive";
    document.getElementById("tokenButton").className = "";
    document.getElementById("userPassAuth").className = "is-hidden";
    document.getElementById("tokenAuth").className = "";
});
