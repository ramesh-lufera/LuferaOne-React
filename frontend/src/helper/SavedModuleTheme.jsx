import { useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiUrl } from './auth';
import './SavedModuleTheme.css';

const themedPaths = new Set([
  '/sign-in',
  '/sign-up',
  '/activity-log',
  '/users-list',
  '/add-user',
  '/view-profile',
  '/roles-permissions',
  '/role-access',
  '/assign-role',
  '/credentials',
  '/company',
  '/theme-colors',
  '/invoice-settings',
]);

const primaryVariables = [
  '--primary-50', '--primary-100', '--primary-200', '--primary-300',
  '--primary-400', '--primary-500', '--primary-600', '--primary-700',
  '--primary-800', '--primary-900', '--primary-light', '--primary-light-white',
  '--brand', '--button-secondary',
];

const validSettings = (value) => value && ['color', 'focus', 'text'].every((key) => /^#[0-9a-f]{6}$/i.test(value[key]));

export default function SavedModuleTheme() {
  const { pathname } = useLocation();
  const path = pathname.toLowerCase().replace(/\/+$/, '');
  const enabled = themedPaths.has(path);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const receiveSavedColors = (event) => {
      if (!validSettings(event.detail)) return;
      controller.abort();
      setSettings(event.detail);
    };
    window.addEventListener('saved-theme-colors', receiveSavedColors);
    fetch(`${apiUrl}/theme-color-settings`, { signal: controller.signal, cache: 'no-store', headers: { Accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load theme colors.');
        const result = await response.json();
        if (!controller.signal.aborted) setSettings(validSettings(result.settings) ? result.settings : null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setSettings(null);
      });
    return () => {
      controller.abort();
      window.removeEventListener('saved-theme-colors', receiveSavedColors);
    };
  }, [enabled, path]);

  useLayoutEffect(() => {
    if (!enabled || !settings) return;
    const body = document.body;
    const previousAttribute = body.getAttribute('data-saved-module-theme');
    const template = window.getComputedStyle(document.documentElement);
    const variables = {
      '--module-theme-main': settings.color,
      '--module-theme-main-rgb': [1, 3, 5].map((offset) => parseInt(settings.color.slice(offset, offset + 2), 16)).join(', '),
      '--module-theme-focus': settings.focus,
      '--module-theme-text': settings.text,
      ...Object.fromEntries(primaryVariables.map((key) => [
        `--module-default${key.slice(1)}`, template.getPropertyValue(key).trim(),
      ])),
    };
    const previousValues = Object.keys(variables).map((key) => [key, body.style.getPropertyValue(key)]);
    body.setAttribute('data-saved-module-theme', '');
    Object.entries(variables).forEach(([key, value]) => body.style.setProperty(key, value));
    return () => {
      if (previousAttribute === null) body.removeAttribute('data-saved-module-theme');
      else body.setAttribute('data-saved-module-theme', previousAttribute);
      previousValues.forEach(([key, value]) => {
        if (value) body.style.setProperty(key, value);
        else body.style.removeProperty(key);
      });
    };
  }, [enabled, settings]);

  return null;
}
