/* global jest, test, expect, afterEach */
import { api } from './api';
import { clearToken } from '../helper/auth';

jest.mock('../helper/auth', () => ({ apiUrl: '/api', getToken: () => 'test-token', clearToken: jest.fn() }));
afterEach(() => jest.restoreAllMocks());

test('downloads binary data with authentication without forwarding responseType to fetch', async () => {
  const blob = new Blob(['file']);
  global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) });
  expect(await api('/file', { responseType: 'blob' })).toBe(blob);
  expect(fetch).toHaveBeenCalledWith('/api/file', { headers: { Accept: 'application/json', Authorization: 'Bearer test-token' } });
});

test('binary downloads handle expired authentication as a JSON API error', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401, json: () => Promise.resolve({ message: 'Unauthenticated.' }) });
  await expect(api('/file', { responseType: 'blob' })).rejects.toMatchObject({ status: 401, message: 'Unauthenticated.' });
  expect(clearToken).toHaveBeenCalled();
});
