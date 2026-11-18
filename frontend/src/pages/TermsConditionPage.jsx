import { useEffect, useState } from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import { api } from '../services/api';
import 'react-quill-new/dist/quill.snow.css';
import './PrivacyPolicy.css';

export default function TermsConditionPage() {
  const [policy, setPolicy] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const load = () => api('/terms-conditions', { signal: controller.signal, cache: 'no-store' })
      .then(({ policy: record }) => { setPolicy(record); setError(''); })
      .catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
    load();
    window.addEventListener('focus', load);
    return () => { controller.abort(); window.removeEventListener('focus', load); };
  }, []);
  return <MasterLayout>
    <ModulePageHeader title="Terms and Conditions" />
    <section className="privacy-policy-public card p-24">
      {error ? <p role="alert">{error}</p> : !policy ? <p role="status">Loading Terms and Conditions…</p> : policy.content ?
        <article className="ql-snow"><div className="ql-editor" dangerouslySetInnerHTML={{ __html: policy.content }} /></article> :
        <p>The Terms and Conditions have not been published yet.</p>}
    </section>
  </MasterLayout>;
}
