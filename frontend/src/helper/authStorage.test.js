/* global test, expect, afterEach */
import { getToken, saveToken, clearToken } from './authStorage';

afterEach(() => { clearToken(); sessionStorage.clear(); localStorage.clear(); });

test('browser session survives opening a tab with empty session storage', () => {
  saveToken('session|token', false);
  sessionStorage.clear();
  expect(getToken()).toBe('session|token');
  expect(localStorage.getItem('lufera_auth_token')).toBeNull();
});

test('remember me persists in local storage', () => {
  saveToken('remembered', true);
  expect(localStorage.getItem('lufera_auth_token')).toBe('remembered');
  expect(getToken()).toBe('remembered');
});

test('existing tab session migrates to shared browser session', () => {
  sessionStorage.setItem('lufera_auth_token', 'legacy');
  expect(getToken()).toBe('legacy');
  expect(sessionStorage.getItem('lufera_auth_token')).toBeNull();
  expect(getToken()).toBe('legacy');
});

test('sign out clears shared and remembered credentials', () => {
  saveToken('session', false);
  clearToken();
  expect(getToken()).toBeNull();
  saveToken('remembered', true);
  clearToken();
  expect(getToken()).toBeNull();
});
