import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import FacebookSignIn from '../components/FacebookSignIn';
import GoogleSignIn from '../components/GoogleSignIn';
import '../components/SignInLayer.css';
import { apiUrl } from '../helper/auth';

export default function MobileSignInPage() {
  const { hash } = useLocation();
  const params = new URLSearchParams(hash.slice(1));
  const state = params.get('state') || '';
  const provider = params.get('provider');
  const signingUp = params.get('mode') === 'signup';
  const action = signingUp ? 'Sign Up' : 'Sign In';
  const [returnUrl, setReturnUrl] = useState('');

  const authorizeMobile = useCallback(async (token) => {
    const response = await fetch(apiUrl + '/auth/mobile/authorize', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ state }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || !/^[a-f0-9]{64}$/.test(result.code || '')) {
      throw new Error(result.message || 'Unable to return to the app. Please try again.');
    }
    const query = new URLSearchParams({ state, code: result.code });
    const url = (signingUp ? 'luferaone://sign-up?' : 'luferaone://sign-in?') + query;
    setReturnUrl(url);
    window.location.assign(url);
  }, [signingUp, state]);

  const Provider = provider === 'google' ? GoogleSignIn : FacebookSignIn;
  const valid = /^[a-f0-9]{64}$/.test(state) && (provider === 'google' || provider === 'facebook');

  return (
    <main className="auth sign-in-panel d-flex align-items-center justify-content-center py-32 px-24">
      <div className="w-100">
        <h4>{action}</h4>
        {returnUrl ? (
          <a className="text-primary-600 fw-semibold" href={returnUrl}>Return to LuferaOne</a>
        ) : valid ? (
          <>
            <p className="mb-20">{signingUp ? 'Continue signing up for LuferaOne.' : 'Continue signing in to LuferaOne.'}</p>
            <Provider
              mode={signingUp ? 'signup' : 'signin'}
              terms={params.get('terms') === '1'}
              remember={params.get('remember') === '1'}
              onAuthenticated={authorizeMobile}
            />
          </>
        ) : (
          <p role="alert">Open {action} in LuferaOne to start again.</p>
        )}
      </div>
    </main>
  );
}
