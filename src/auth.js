/*global axios,luxon*/

async function getApiKey(url, username, password) {
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

async function minutesApiKeyValid(url, apiKey) {
    try {
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

export { getApiKey, minutesApiKeyValid };
