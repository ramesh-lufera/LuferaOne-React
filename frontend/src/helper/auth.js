export const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
import { getToken, clearToken as clearStoredToken, saveToken as saveStoredToken } from './authStorage';
export { getToken };
export const clearToken = () => { verifiedToken = null; clearStoredToken(); };
export const saveToken = (token, remember) => { verifiedToken = null; saveStoredToken(token, remember); };
let verifiedToken = null;
let verifiedAt = 0;
export const markTokenVerified = (token) => { verifiedToken = token; verifiedAt = Date.now(); };
export const hasVerifiedToken = () => Boolean(verifiedToken && verifiedToken === getToken() && Date.now() - verifiedAt < 10000);

export const signOut = async () => {
  const token = getToken();
  if (token) {
      const response = await fetch(apiUrl + '/logout', {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok && response.status !== 401) throw new Error('Sign out failed. Please try again.');
  }
  clearToken();
  window.location.assign('/sign-in');
};
