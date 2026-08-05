import SettingsForm from './components/SettingsForm.jsx';

export default function App() {
  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Browser Extension</p>
        <h1>Watson Assistant Widget Preview</h1>
        <p className="lede">
          Save a target domain plus Watson Assistant credentials, then inject the widget on
          matching pages.
        </p>
        <SettingsForm />
      </section>
    </main>
  );
}
