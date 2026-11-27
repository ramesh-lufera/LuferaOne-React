const tokenKey = 'lufera_auth_token';
const sessionCookieKey = 'lufera_session_token';
const cookieOptions = () => `; Path=/; SameSite=Strict${window.location.protocol === 'https:' ? '; Secure' : ''}`;
const setSessionToken = (token) => {
  document.cookie = `${sessionCookieKey}=${encodeURIComponent(token)}${cookieOptions()}`;
};
export const getToken = () => {
  const cookie = document.cookie.split('; ').find((value) => value.startsWith(`${sessionCookieKey}=`));
  if (cookie) return decodeURIComponent(cookie.slice(sessionCookieKey.length + 1));
  const remembered = localStorage.getItem(tokenKey);
  if (remembered) return remembered;
  const legacyToken = sessionStorage.getItem(tokenKey);
  if (legacyToken) {
    setSessionToken(legacyToken);
    sessionStorage.removeItem(tokenKey);
  }
  return legacyToken;
};
export const clearToken = () => {
  sessionStorage.removeItem(tokenKey);
  localStorage.removeItem(tokenKey);
  document.cookie = `${sessionCookieKey}=; Max-Age=0${cookieOptions()}`;
};
export const saveToken = (token, remember) => {
  clearToken();
  if (remember) localStorage.setItem(tokenKey, token);
  else setSessionToken(token);
};
