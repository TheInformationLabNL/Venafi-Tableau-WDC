import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";

// We need to save the credentials in this variable,
// because the contents of tableau.password will be empty
// after accessing it the first time.
let savedCredentials;

createAuthRefreshInterceptor(axios, () => refreshAndSaveCredentials());

axios.interceptors.request.use(request => {
    request.headers["X-Venafi-Api-Key"] = getApiKey();

    return request;
});

export function getApiKey({ APIKey } = getCredentials()) {
    return APIKey;
}

export function saveCredentials(credentials = getCredentials()) {
    tableau.password = JSON.stringify(credentials);
    savedCredentials = credentials;
}

export function getCredentials() {
    return (savedCredentials = savedCredentials || JSON.parse(tableau.password || "{}"));
}

export async function refreshCredentials(credentials = getCredentials()) {
    try {
        // We ask for a new APIKey using the saved username and password
        const { data } = await axios.post("/authorize", credentials);
        // And then we save the new APIKey together with the username and password
        return { ...credentials, ...data };
    } catch (error) {
        console.log({ error });
        tableau.abortForAuth("Unable to get new API key");
    }
}

export async function refreshAndSaveCredentials(credentials = getCredentials()) {
    credentials = await refreshCredentials(credentials);
    saveCredentials(credentials);
}

export function credentialsNeedRefreshing({ ValidUntil } = getCredentials()) {
    // If ValidUntil is undefined then we assume
    // that we should definitely refresh our credentials
    return !ValidUntil || new Date(ValidUntil.match(/[\d\s-:.+Z]+/)[0]) < new Date();
}

export async function refreshAndSaveCredentialsIfNeeded(credentials = getCredentials()) {
    if (credentialsNeedRefreshing(credentials)) {
        await refreshAndSaveCredentials(credentials);
    }
}
