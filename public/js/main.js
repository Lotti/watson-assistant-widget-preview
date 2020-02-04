const API = browser || chrome;

function injectScript(id, src, scriptExtra) {
    return fetch(src).then((resp) => {
        return resp.text();
    }).then((data) => {
        data += scriptExtra;
        const script = document.createElement('script');
        script.id = id;
        script.async = false;
        script.type = 'text/javascript';
        script.innerText = data;
        document.body.appendChild(script);
    });
}

function updateUI(tabId, {domain, integrationID, region}) {
    const url = new URL(window.location.href);
    if (url.hostname.endsWith(domain) && integrationID && region) {
        try {
            const scriptId = 'watson-assistant-widget-preview';
            const scriptUrl = 'https://assistant-web.watsonplatform.net/loadWatsonAssistantChat.js';
            const scriptExtra = `
                window.loadWatsonAssistantChat({integrationID: "${integrationID}", region: "${region}"}).then((instance) => {
                    instance.render();
                }).catch((error) => {
                    console.error('loadWatsonAssistantChat', error);
                });`;
            injectScript(scriptId, scriptUrl, scriptExtra).then(() => {
                console.log('Watson Assistant Web Chat Widget injected successfully!');
            }).catch(error => {
                console.log('injectScript', error);
            });
        } catch (error) {
            console.error('updateUI tabId:', tabId, error);
        }
    }
}

// setup listener from background process
API.runtime.onMessage.addListener((data) => {
    if (data.refresh) {
        updateUI(data.tabId, data);
    }
});

API.storage.sync.get(['domain', 'integrationID', 'region']).then((data) => {
    updateUI(-1, data);
}).catch((error) => {
    console.error('API.storage.sync.get', error);
});
