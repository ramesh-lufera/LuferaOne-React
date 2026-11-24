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
      { name: 'gmailAppPassword', label: 'Gmail App Password', value: '', type: 'password' },
      { name: 'emailSenderName', label: 'Sender Name', value: '', maxLength: 100 },
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
const editableFields = ['emailUsername', 'gmailAppPassword', 'emailSenderName'];

export default function CredentialsPage() {
  const [values, setValues] = useState(initialValues);
  const [savedValues, setSavedValues] = useState(initialValues);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!selectedLogo) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(selectedLogo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedLogo]);

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
    const form = event.currentTarget;
    const logoInput = form.elements.namedItem('emailLogo');
    const logo = logoInput.files[0];
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const payload = new FormData();
      payload.append('_method', 'PUT');
      editableFields.forEach((field) => payload.append(field, values[field]));
      if (logo) payload.append('emailLogo', logo);
      const result = await api('/credentials', {
        method: 'POST',
        body: payload,
      });
      const saved = { ...initialValues, ...result.credentials };
      setValues(saved);
      setSavedValues(saved);
      logoInput.value = '';
      setSelectedLogo(null);
      setMessage(result.message);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = (event) => {
    event.preventDefault();
    event.currentTarget.elements.namedItem('emailLogo').value = '';
    setSelectedLogo(null);
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
                    maxLength={field.maxLength}
                    disabled={!editableFields.includes(field.name)}
                    required={editableFields.includes(field.name)}
                    onChange={(event) => {
                      setValues({ ...values, [field.name]: event.target.value });
                      setMessage('');
                    }}
                  />
                </div>
              ))}
              {section.title === 'Email' && (
                <div className="credentials-field">
                  <label htmlFor="credentials-emailLogo" className="form-label fw-semibold text-primary-light text-sm mb-8">Email Logo</label>
                  <input id="credentials-emailLogo" name="emailLogo" type="file" className="form-control radius-8" accept="image/png,image/jpeg,image/gif" aria-describedby="email-logo-help" onChange={(event) => setSelectedLogo(event.target.files[0] ?? null)} />
                  <small id="email-logo-help">{savedValues.hasEmailLogo ? 'Logo saved. Choose a file to replace it. ' : ''}PNG, JPEG, or GIF up to 512 KB.</small>
                  {(previewUrl || savedValues.emailLogoPreview) && <img className="credentials-logo-preview" src={previewUrl || savedValues.emailLogoPreview} alt="Email logo preview" />}
                </div>
              )}
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
