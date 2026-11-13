/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router-dom';
import { apiUrl, saveToken, markTokenVerified } from '../helper/auth';

let googleLibrary;
function loadGoogleLibrary() {
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google.accounts.oauth2);
  if (!googleLibrary) {
    googleLibrary = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timeout = setTimeout(() => { script.remove(); googleLibrary = null; reject(new Error('Google sign-in timed out. Please try again.')); }, 15000);
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => { clearTimeout(timeout); resolve(window.google.accounts.oauth2); };
      script.onerror = () => { clearTimeout(timeout); script.remove(); googleLibrary = null; reject(new Error('Unable to load Google sign-in. Please try again.')); };
      document.head.appendChild(script);
    });
  }
  return googleLibrary;
}

export default function GoogleSignIn({ mode = 'signin', remember = false, terms = false, disabled = false, onBusyChange }) {
  const navigate = useNavigate();
  const client = useRef(null);
  const options = useRef({ remember, terms, disabled, onBusyChange });
  options.current = { remember, terms, disabled, onBusyChange };
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const inFlight = useRef(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    setReady(false);
    const finish = () => {
      inFlight.current = false;
      options.current.onBusyChange?.(false);
      if (active) setBusy(false);
    };
    Promise.all([
      loadGoogleLibrary(),
      fetch(apiUrl + '/auth/google/nonce', { headers: { Accept: 'application/json' }, signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error('Unable to start Google sign-in. Please try again.');
          return response.json();
        }),
    ]).then(([google, data]) => {
      if (!active) return;
      client.current = google.initCodeClient({
        client_id: clientId,
        scope: 'openid email profile',
        ux_mode: 'popup',
        select_account: true,
        error_callback: (failure) => {
          if (active) setError(failure.type === 'popup_closed' ? '' : 'Unable to open Google. Please allow popups and try again.');
          finish();
        },
        callback: async (authorization) => {
          if (!active) return;
          try {
            if (!authorization.code) {
              setError('');
              return;
            }
            const response = await fetch(apiUrl + '/auth/google/code', {
              method: 'POST',
              headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
              body: JSON.stringify({ code: authorization.code, nonce: data.nonce, mode, remember: options.current.remember, ...(mode === 'signup' ? { terms: options.current.terms } : {}) }),
              signal: AbortSignal.timeout(20000),
            });
            const result = await response.json();
            if (!response.ok || !result.token || !result.user?.id) throw new Error(result.errors?.credential?.[0] || result.errors?.terms?.[0] || result.message || 'Unable to sign in with Google.');
            if (!active) return;
            saveToken(result.token, options.current.remember);
            markTokenVerified(result.token);
            navigate('/', { replace: true });
          } catch (failure) {
            if (active) {
              setError(failure instanceof TypeError ? 'Unable to connect. Please try again.' : failure.message);
              setAttempt((value) => value + 1);
            }
          } finally {
            finish();
          }
        },
      });
      setReady(true);
    }).catch((failure) => {
      if (active) setError(failure.name === 'AbortError' ? 'Google sign-in timed out. Please try again.' : failure.message);
    }).finally(() => clearTimeout(timeout));
    return () => { active = false; controller.abort(); clearTimeout(timeout); client.current = null; };
  }, [clientId, mode, attempt, navigate]);

  const signIn = () => {
    if (disabled || inFlight.current) return;
    if (!clientId) { setError('Google sign-in is not configured.'); return; }
    if (!ready || !client.current) { setAttempt((value) => value + 1); return; }
    setError('');
    inFlight.current = true;
    setBusy(true);
    onBusyChange?.(true);
    try { client.current.requestCode(); }
    catch { inFlight.current = false; setBusy(false); onBusyChange?.(false); setError('Unable to open Google sign-in. Please try again.'); }
  };

  const buttonClass = mode === 'signup'
    ? 'signup-social fw-semibold py-16 px-24 w-100 border radius-12 text-md d-flex align-items-center justify-content-center gap-12'
    : 'fw-semibold text-primary-light py-16 px-24 w-100 border radius-12 text-md d-flex align-items-center justify-content-center gap-12 line-height-1 bg-hover-primary-50';

  return (
    <div className='w-50' aria-busy={busy}>
      <button type='button' className={buttonClass} disabled={disabled || busy} onClick={signIn}>
        <Icon icon='logos:google-icon' className='text-primary-600 text-xl line-height-1' />
        Google
      </button>
      {error && <div className='text-danger text-sm mt-8' role='alert'>{error}</div>}
    </div>
  );
}
