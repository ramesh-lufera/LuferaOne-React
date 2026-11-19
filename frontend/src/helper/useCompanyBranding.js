import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function useCompanyBranding() {
  const [images, setImages] = useState({});
  useEffect(() => {
    const controller = new AbortController();
    const load = () => api('/auth/branding', { signal: controller.signal, cache: 'no-store' })
      .then((data) => { if (!controller.signal.aborted) setImages(data.images || {}); })
      .catch(() => { if (!controller.signal.aborted) setImages({}); });
    load();
    window.addEventListener('focus', load);
    window.addEventListener('company-branding-updated', load);
    return () => { controller.abort(); window.removeEventListener('focus', load); window.removeEventListener('company-branding-updated', load); };
  }, []);
  return images;
}
