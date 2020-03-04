import "./object.entries.polyfill";
import "./connector";
import "./style.styl";
import axios from "axios";
import "core-js/features/promise";
import { refreshAndSaveCredentials } from "./auth";

let corsProxy = "https://www.webdataconnector.net:8889";
axios.defaults.baseURL = `${corsProxy}/https://101419193.dev.lab.venafi.com/vedsdk`;

document.getElementById("form").addEventListener("submit", async event => {
    event.preventDefault();

    let base_url = document.getElementById("base-url").value;
    let Username = document.getElementById("username").value;
    let Password = document.getElementById("password").value;

    tableau.connectionData = base_url || axios.defaults.baseURL;
    await refreshAndSaveCredentials({ Username, Password });
    tableau.submit();
});
