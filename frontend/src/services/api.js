import { apiUrl, getToken, clearToken } from '../helper/auth';
export async function api(path, options = {}) {
  const { responseType, ...requestOptions } = options;
  const response = await fetch(`${apiUrl}${path}`, { ...requestOptions, headers: { Accept: 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}), ...options.headers } });
  if (response.ok && responseType === 'blob') return response.blob();
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) clearToken();
    const error = new Error(response.status >= 500 ? 'The server could not complete this request. Please try again.' : data.message || `Request failed (${response.status}).`);
    error.status = response.status;
    error.errors = data.errors;
    throw error;
  }
  return data;
}
