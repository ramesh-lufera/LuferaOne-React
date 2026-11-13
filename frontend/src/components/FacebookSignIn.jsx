/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router-dom';
import { apiUrl, saveToken, markTokenVerified } from '../helper/auth';

let facebookLibrary;
function loadFacebookLibrary(appId, version) {
  if (!facebookLibrary) {
    facebookLibrary = new Promise((resolve, reject) => {
      let initialized = false;
      let script;
      const timeout = setTimeout(() => fail(), 15000);
      const fail = () => {
        clearTimeout(timeout);
        script?.remove();
        facebookLibrary = null;
        reject(new Error('Unable to load Facebook sign-in. Please check your connection and try again.'));
      };
      const initialize = () => {
        if (initialized) return;
        try {
          window.FB.init({ appId, version, cookie: false, xfbml: false, autoLogAppEvents: false });
          initialized = true;
          clearTimeout(timeout);
          resolve(window.FB);
        } catch { fail(); }
      };
      if (window.FB?.init) { initialize(); return; }
      window.fbAsyncInit = initialize;
      script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onerror = fail;
      document.head.appendChild(script);
    });
  }
  return facebookLibrary;
}

export default function FacebookSignIn({ mode = 'signin', remember = false, terms = false, disabled = false, onBusyChange }) {
  const navigate = useNavigate();
  const sdk = useRef(null);
  const active = useRef(false);
  const inFlight = useRef(false);
  const options = useRef({ remember, terms, disabled, onBusyChange });
  options.current = { remember, terms, disabled, onBusyChange };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
  const version = import.meta.env.VITE_FACEBOOK_GRAPH_VERSION || 'v27.0';

  useEffect(() => {
    active.current = true;
    if (!appId) return () => { active.current = false; };
    let cancelled = false;
    loadFacebookLibrary(appId, version).then((facebook) => {
      if (!cancelled) sdk.current = facebook;
    }).catch((failure) => {
      if (!cancelled) setError(failure.message);
    });
    return () => { cancelled = true; active.current = false; sdk.current = null; };
  }, [appId, version, attempt]);

  const finish = () => {
    inFlight.current = false;
    if (active.current) {
      setBusy(false);
      options.current.onBusyChange?.(false);
    }
  };

  const authenticate = async (authorization) => {
    if (!active.current) return;
    try {
      const accessToken = authorization.authResponse?.accessToken;
      if (authorization.status !== 'connected' || !accessToken) return;
      const response = await fetch(apiUrl + '/auth/facebook', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ access_token: accessToken, mode, remember: options.current.remember, ...(mode === 'signup' ? { terms: options.current.terms } : {}) }),
        signal: AbortSignal.timeout(25000),
      });
      const result = await response.json();
      if (!response.ok || !result.token || !result.user?.id) {
        throw new Error(result.errors?.facebook?.[0] || result.message || 'Unable to sign in with Facebook. Please try again.');
      }
      if (!active.current) return;
      saveToken(result.token, options.current.remember);
      markTokenVerified(result.token);
      navigate('/', { replace: true });
    } catch (failure) {
      if (active.current) setError(failure.name === 'TimeoutError' ? 'Facebook sign-in timed out. Please try again.' : failure instanceof TypeError ? 'Unable to connect. Please try again.' : failure.message);
    } finally { finish(); }
  };

  const signIn = () => {
    if (disabled || inFlight.current) return;
    setError('');
    if (!appId) { setError('Facebook sign-in is not configured.'); return; }
    if (!sdk.current) { setError('Facebook sign-in is loading. Please try again in a moment.'); setAttempt((value) => value + 1); return; }
    inFlight.current = true;
    setBusy(true);
    onBusyChange?.(true);
    try {
      sdk.current.login((authorization) => { void authenticate(authorization); }, { scope: 'public_profile,email', return_scopes: true });
    } catch {
      finish();
      setError('Unable to open Facebook. Please allow popups and try again.');
    }
  };

  const buttonClass = mode === 'signup'
    ? 'signup-social fw-semibold py-16 px-24 w-100 border radius-12 text-md d-flex align-items-center justify-content-center gap-12'
    : 'fw-semibold text-primary-light py-16 px-24 w-100 border radius-12 text-md d-flex align-items-center justify-content-center gap-12 line-height-1 bg-hover-primary-50';

  return (
    <div className='w-50' aria-busy={busy}>
      <button type='button' className={buttonClass} disabled={disabled || busy} onClick={signIn}>
        <Icon icon='ic:baseline-facebook' className='text-primary-600 text-xl line-height-1' />
        Facebook
      </button>
      {error && <div role='alert' className='text-danger text-sm mt-8'>{error}</div>}
    </div>
  );
}
