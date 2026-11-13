import { apiUrl, getToken, clearToken } from '../helper/auth';
export async function api(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers: { Accept: 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}), ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) clearToken();
    const error = new Error(response.status >= 500 ? 'The server could not complete this request. Please try again.' : data.message || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}
