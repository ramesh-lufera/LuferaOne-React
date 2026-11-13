export const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
const tokenKey = 'lufera_auth_token';
export const getToken = () => sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey);
export const clearToken = () => { sessionStorage.removeItem(tokenKey); localStorage.removeItem(tokenKey); };
export const saveToken = (token, remember) => {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(tokenKey, token);
};

export const signOut = async () => {
  const token = getToken();
  try {
    if (token) {
      await fetch(apiUrl + '/logout', {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
        signal: AbortSignal.timeout(5000),
      });
    }
  } finally {
    clearToken();
    window.location.assign('/sign-in');
  }
};
