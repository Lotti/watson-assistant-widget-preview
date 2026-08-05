import { useEffect, useState } from 'react';

const API = globalThis.browser ?? globalThis.chrome;

const DEFAULT_SETTINGS = {
  domain: '',
  integrationID: '',
  region: '',
};

function normalizeDomain(domain) {
  return domain
    .trim()
    .replace(/^https?:\/\//iu, '')
    .replace(/\/.*$/u, '')
    .replace(/^\*\./u, '')
    .toLowerCase();
}

async function refreshMatchingTabs(settings) {
  const normalizedDomain = normalizeDomain(settings.domain);
  if (!normalizedDomain) {
    return;
  }

  const tabs = await API.tabs.query({
    url: [`*://${normalizedDomain}/*`, `*://*.${normalizedDomain}/*`],
  });

  await Promise.allSettled(
    tabs.map((tab) =>
      API.tabs.sendMessage(tab.id, {
        config: { ...settings, domain: normalizedDomain },
        refresh: true,
      }),
    ),
  );
}

export default function SettingsForm() {
  const [formValues, setFormValues] = useState(DEFAULT_SETTINGS);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ kind: 'idle', message: '' });

  useEffect(() => {
    let isCancelled = false;

    async function loadSettings() {
      try {
        const stored = await API.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
        if (!isCancelled) {
          setFormValues({
            domain: stored.domain ?? DEFAULT_SETTINGS.domain,
            integrationID: stored.integrationID ?? DEFAULT_SETTINGS.integrationID,
            region: stored.region ?? DEFAULT_SETTINGS.region,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          setStatus({
            kind: 'error',
            message: `Unable to load stored settings: ${error.message}`,
          });
        }
      } finally {
        if (!isCancelled) {
          setIsLoaded(true);
        }
      }
    }

    void loadSettings();

    return () => {
      isCancelled = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
    setIsDirty(true);
    setStatus({ kind: 'idle', message: '' });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const storedSettings = {
      ...formValues,
      domain: normalizeDomain(formValues.domain),
      integrationID: formValues.integrationID.trim(),
      region: formValues.region.trim(),
    };

    setIsSaving(true);
    setStatus({ kind: 'idle', message: '' });

    try {
      await API.storage.sync.set(storedSettings);
      await refreshMatchingTabs(storedSettings);
      setFormValues(storedSettings);
      setIsDirty(false);
      setStatus({ kind: 'success', message: 'Settings saved and matching tabs refreshed.' });
    } catch (error) {
      setStatus({ kind: 'error', message: `Unable to save settings: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Target domain</span>
        <input
          name="domain"
          onChange={handleChange}
          placeholder="example.com"
          spellCheck="false"
          type="text"
          value={formValues.domain}
        />
      </label>

      <label className="field">
        <span>Integration ID</span>
        <input
          name="integrationID"
          onChange={handleChange}
          spellCheck="false"
          type="text"
          value={formValues.integrationID}
        />
      </label>

      <label className="field">
        <span>Region</span>
        <input
          name="region"
          onChange={handleChange}
          placeholder="eu-de"
          spellCheck="false"
          type="text"
          value={formValues.region}
        />
      </label>

      <div className="actions">
        <button disabled={!isLoaded || !isDirty || isSaving} type="submit">
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {status.message ? (
        <p className={`status status-${status.kind}`} role="status">
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
