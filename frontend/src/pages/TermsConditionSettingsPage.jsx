import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import { api } from '../services/api';
import './PrivacyPolicy.css';

const modules = { toolbar: [[{ header: [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], [{ align: [] }], ['link', 'clean']] };
const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'align', 'link'];

export default function TermsConditionSettingsPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    api('/settings/terms-conditions', { signal: controller.signal }).then(({ policy }) => {
      setContent(policy.content);
      setLoaded(true);
    }).catch((err) => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  async function save(event) {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      const result = await api('/settings/terms-conditions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
      setContent(result.policy.content);
      setMessage(result.message);
    } catch (err) {
      setError(err.errors?.content?.[0] || err.message);
    } finally { setSaving(false); }
  }
  return <MasterLayout>
    <ModulePageHeader title="Terms and Conditions" />
    <form className="card p-24 privacy-policy-editor" onSubmit={save}>
      {loading && <p role="status">Loading Terms and Conditions…</p>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}
      {loaded && <><label className="form-label fw-semibold" id="privacy-policy-label">Terms and Conditions content</label>
        <div aria-labelledby="privacy-policy-label"><ReactQuill theme="snow" value={content} onChange={(value) => { setContent(value); setMessage(''); }} modules={modules} formats={formats} readOnly={saving} /></div>
        <div className="d-flex flex-wrap gap-3 mt-24 align-items-center">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save / Update'}</button>
          <Link to="/terms-condition">View public Terms and Conditions</Link>
        </div></>}
    </form>
  </MasterLayout>;
}
