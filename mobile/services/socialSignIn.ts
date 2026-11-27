import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { apiRequest } from './api';

export type SocialProvider = 'Facebook' | 'Google';

export async function signInWithProvider(
  provider: SocialProvider,
  remember: boolean,
  signal: AbortSignal,
  signUp?: { terms: boolean },
) {
  const action = signUp ? 'sign-up' : 'sign-in';
  const callbackUrl = 'luferaone://' + action;
  if (Platform.OS === 'web') {
    throw new Error('Open the LuferaOne mobile app to continue with ' + provider + '.');
  }

  const attempt = await apiRequest<{ url: string; state: string; verifier: string }>('/auth/mobile/start', {
    method: 'POST',
    body: JSON.stringify({ provider: provider.toLowerCase(), remember, ...(signUp && { mode: 'signup', terms: signUp.terms }) }),
    signal,
  });
  if (signal.aborted) return null;

  const result = await WebBrowser.openAuthSessionAsync(attempt.url, callbackUrl);
  if (signal.aborted || result.type !== 'success') return null;

  const params = new URLSearchParams(result.url.slice(callbackUrl.length + 1));
  const code = params.get('code');
  if (!result.url.startsWith(callbackUrl + '?') || params.get('state') !== attempt.state || !code) {
    throw new Error(`This mobile ${action} is invalid or has expired. Please try again.`);
  }

  return apiRequest<{ token: string }>('/auth/mobile/exchange', {
    method: 'POST',
    body: JSON.stringify({ state: attempt.state, verifier: attempt.verifier, code }),
    signal,
  });
}
