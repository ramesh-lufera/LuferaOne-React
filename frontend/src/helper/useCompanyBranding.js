import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function useCompanyBranding({ includeContact = false } = {}) {
  const [branding, setBranding] = useState({});
  useEffect(() => {
    const controller = new AbortController();
    const path = includeContact ? '/auth/branding?include_contact=1' : '/auth/branding';
    const load = () => api(path, { signal: controller.signal, cache: 'no-store' })
      .then((data) => { if (!controller.signal.aborted) setBranding(data); })
      .catch(() => { if (!controller.signal.aborted) setBranding({}); });
    load();
    window.addEventListener('focus', load);
    window.addEventListener('company-branding-updated', load);
    return () => { controller.abort(); window.removeEventListener('focus', load); window.removeEventListener('company-branding-updated', load); };
  }, [includeContact]);
  return includeContact ? branding : branding.images || {};
}
