/*global axios,luxon,tableau*/

async function getApiKey(url, username, password) {
    tableau.log(`getApiKey: Logging in and getting apikey`);
    let response = await axios.post(`${url}/authorize/`, {
        Username: username,
        Password: password,
    });

    if (response.status === 200) {
        return response.data.APIKey;
    }

    throw {
        response: response,
        message: "Invalid status code " + response.status,
    };
}

async function getBearerToken(vedSdkUrl, clientId, refreshToken) {
    tableau.log(`getApiKey: Using refresh_token to get real token`);
    const url = vedSdkUrl.replace(/\/vedsdk$/i, "");

    let response = await axios.post(`${url}/vedauth/authorize/token`, {
        refresh_token: refreshToken,
        client_id: clientId,
    });

    if (response.status === 200) {
        return response.data.access_token || null;
    }

    throw {
        response: response,
        message: "Invalid status code " + response.status,
    };
}

async function minutesApiKeyValid(url, apiKey) {
    try {
        tableau.log(`minutesApiKeyValid: Seeing if the apiKey is still valid`);
        let response = await axios.get(`${url}/authorize/checkvalid`, {
            headers: {
                "X-Venafi-API-Key": apiKey,
            },
        });

        if (response.status === 200) {
            let timestamp = parseInt(response.data.ValidUntil.match(/\/Date\((.*)\)\//)[1]);
            let validUntil = luxon.DateTime.fromMillis(timestamp);

            let dateDiff = Math.floor(validUntil.diffNow("minutes").minutes);

            return dateDiff;
        }

        return -1;
    } catch (_err) {
        console.error(_err);
        return -1;
    }
}

export { getApiKey, getBearerToken, minutesApiKeyValid };
