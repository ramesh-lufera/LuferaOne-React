import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function useCompanyBranding({ includeContact = false, includeTitle = false } = {}) {
  const [branding, setBranding] = useState({});
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams();
    if (includeContact) query.set('include_contact', '1');
    if (includeTitle) query.set('include_title', '1');
    const path = `/auth/branding${query.size ? `?${query}` : ''}`;
    const load = () => api(path, { signal: controller.signal, cache: 'no-store' })
      .then((data) => { if (!controller.signal.aborted) setBranding(data); })
      .catch(() => { if (!controller.signal.aborted) setBranding({}); });
    load();
    window.addEventListener('focus', load);
    window.addEventListener('company-branding-updated', load);
    return () => { controller.abort(); window.removeEventListener('focus', load); window.removeEventListener('company-branding-updated', load); };
  }, [includeContact, includeTitle]);
  return includeContact || includeTitle ? branding : branding.images || {};
}
