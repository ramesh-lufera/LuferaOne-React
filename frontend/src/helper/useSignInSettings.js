import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function useSignInSettings(attempt) {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setSettings(null);
    setError('');
    api('/auth/settings', { signal: controller.signal, cache: 'no-store' })
      .then(setSettings)
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message);
      });
    return () => controller.abort();
  }, [attempt]);

  return { settings, error };
}
