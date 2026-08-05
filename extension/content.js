const API = globalThis.browser ?? globalThis.chrome;

const SCRIPT_ID = 'watson-assistant-widget-preview';
const SCRIPT_SOURCE = 'https://assistant-web.watsonplatform.net/loadWatsonAssistantChat.js';
const DEFAULT_SETTINGS = {
  domain: '',
  integrationID: '',
  region: '',
};

function normalizeDomain(domain) {
  return String(domain ?? '')
    .trim()
    .replace(/^https?:\/\//iu, '')
    .replace(/\/.*$/u, '')
    .replace(/^\*\./u, '')
    .toLowerCase();
}

function matchesDomain(domain) {
  if (!domain) {
    return false;
  }

  const hostname = window.location.hostname.toLowerCase();
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

async function injectWidget(config) {
  const normalizedDomain = normalizeDomain(config.domain);
  const integrationID = String(config.integrationID ?? '').trim();
  const region = String(config.region ?? '').trim();

  if (!matchesDomain(normalizedDomain) || !integrationID || !region) {
    return;
  }

  const configKey = `${normalizedDomain}|${integrationID}|${region}`;
  if (document.documentElement.dataset.watsonAssistantWidgetPreview === configKey) {
    return;
  }

  document.getElementById(SCRIPT_ID)?.remove();
  document.documentElement.dataset.watsonAssistantWidgetPreview = configKey;

  const response = await fetch(SCRIPT_SOURCE);
  if (!response.ok) {
    throw new Error(`Unable to load Watson Assistant script: ${response.status}`);
  }

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = false;
  script.type = 'text/javascript';
  script.textContent = `
${await response.text()}
window.loadWatsonAssistantChat({
  integrationID: ${JSON.stringify(integrationID)},
  region: ${JSON.stringify(region)}
}).then((instance) => {
  instance.render();
}).catch((error) => {
  console.error('loadWatsonAssistantChat', error);
});
`;

  (document.body ?? document.documentElement).append(script);
}

API.runtime.onMessage.addListener((message) => {
  if (message?.refresh) {
    void injectWidget(message.config ?? message).catch((error) => {
      console.error('refreshWidget', error);
    });
  }
});

void API.storage.sync
  .get(Object.keys(DEFAULT_SETTINGS))
  .then((settings) => injectWidget(settings))
  .catch((error) => {
    console.error('API.storage.sync.get', error);
  });
