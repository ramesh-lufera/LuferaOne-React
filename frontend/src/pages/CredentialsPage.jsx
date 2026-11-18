import { useEffect, useState } from 'react';
import { api } from '../services/api';
import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import './CredentialsPage.css';

const sections = [
  {
    title: 'Google',
    fields: [
      { name: 'googleClientId', label: 'Google Client ID', value: '' },
      { name: 'googleClientSecret', label: 'Google Client Secret', value: '', type: 'password' },
    ],
  },
  {
    title: 'Facebook',
    fields: [
      { name: 'facebookAppId', label: 'Facebook App ID', value: '' },
      { name: 'facebookAppSecret', label: 'Facebook App Secret', value: '', type: 'password' },
    ],
  },
  {
    title: 'Email',
    fields: [
      { name: 'emailUsername', label: 'Username/Email', value: '', type: 'email' },
      { name: 'gmailAppPassword', label: 'Gmail App Password', value: '' },
      { name: 'emailCommonLink', label: 'Email Common Link', value: '', type: 'url' },
      { name: 'emailImageLink', label: 'Email Image Link', value: '', type: 'url' },
    ],
  },
  {
    title: 'PayPal',
    fields: [
      { name: 'paypalClientId', label: 'PayPal Client ID', value: '' },
    ],
  },
];

const initialValues = Object.fromEntries(
  sections.flatMap((section) => section.fields.map((field) => [field.name, field.value])),
);
const signInFields = ['googleClientId', 'googleClientSecret', 'facebookAppId', 'facebookAppSecret'];

export default function CredentialsPage() {
  const [values, setValues] = useState(initialValues);
  const [savedValues, setSavedValues] = useState(initialValues);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api('/credentials', { signal: controller.signal }).then(({ credentials }) => {
      const loaded = { ...initialValues, ...credentials };
      setValues(loaded);
      setSavedValues(loaded);
    }).catch((failure) => {
      if (!controller.signal.aborted) setError(failure.message);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [attempt]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const payload = Object.fromEntries(signInFields.map((field) => [field, values[field]]));
      const result = await api('/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const saved = { ...initialValues, ...result.credentials };
      setValues(saved);
      setSavedValues(saved);
      setMessage(result.message);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setValues({ ...savedValues });
    setMessage('');
    setError('');
  };

  return (
    <MasterLayout>
      <ModulePageHeader title="Credentials" />
      <div className="credentials-page">
        <form className="credentials-form" onSubmit={save} onReset={reset} autoComplete="off">
          {loading && <p role="status">Loading credentials…</p>}
          {error && <div role="alert" className="alert alert-danger">{error} <button type="button" className="btn btn-sm btn-outline-danger" disabled={loading || saving} onClick={() => setAttempt((value) => value + 1)}>Reload</button></div>}
          <div className="credentials-provider-grid">
          {sections.map((section) => (
            <section key={section.title} className="card h-100 p-0 radius-12 overflow-hidden" aria-labelledby={`credentials-heading-${section.title}`}>
              <div className="card-header border-bottom bg-base py-16 px-24">
                <h6 id={`credentials-heading-${section.title}`} className="text-lg fw-semibold mb-0">{section.title}</h6>
              </div>
              <fieldset className="card-body p-24 credentials-section" disabled={loading || saving} aria-labelledby={`credentials-heading-${section.title}`}>
              {section.fields.map((field) => (
                <div key={field.name} className="credentials-field">
                  <label htmlFor={`credentials-${field.name}`} className="form-label fw-semibold text-primary-light text-sm mb-8">{field.label}</label>
                  <input
                    id={`credentials-${field.name}`}
                    name={field.name}
                    type={field.type || 'text'}
                    className="form-control radius-8"
                    value={values[field.name]}
                    spellCheck={false}
                    required={signInFields.includes(field.name)}
                    onChange={(event) => {
                      setValues({ ...values, [field.name]: event.target.value });
                      setMessage('');
                    }}
                  />
                </div>
              ))}
              </fieldset>
            </section>
          ))}
          </div>
          <div className="card radius-12 mt-24 p-20 d-flex flex-row flex-wrap align-items-center justify-content-end gap-12">
            <button type="reset" className="btn btn-outline-danger px-32 radius-8" disabled={loading || saving}>Reset</button>
            <button type="submit" className="btn btn-primary-600 px-32 radius-8" disabled={loading || saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
          {message && <p role="status" className="text-center mt-16 mb-0 text-success-main">{message}</p>}
        </form>
      </div>
    </MasterLayout>
  );
}
