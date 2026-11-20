/* global jest, test, expect, afterEach */
import { render, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SavedModuleTheme from './SavedModuleTheme';

jest.mock('./auth', () => ({ apiUrl: '/api' }));
const originalFetch = window.fetch;
const settings = { color: '#8252e9', focus: '#ebd7ff', text: '#101010' };
afterEach(() => { cleanup(); window.fetch = originalFetch; });

test.each(['/', '/invoice-list', '/404', '/settings/privacy-policy', '/company', '/categories'])('saved sidebar theme is available at %s', async (path) => {
  window.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ settings }) });
  render(<MemoryRouter initialEntries={[path]}><SavedModuleTheme /></MemoryRouter>);
  await waitFor(() => expect(document.body.style.getPropertyValue('--module-theme-main')).toBe(settings.color));
  expect(document.body.style.getPropertyValue('--module-theme-focus')).toBe(settings.focus);
  expect(document.body.style.getPropertyValue('--module-theme-text')).toBe(settings.text);
  // Keep the existing page-content styling scope separate from the sidebar.
  expect(document.body.hasAttribute('data-saved-module-theme')).toBe(['/company', '/categories'].includes(path));
});

test('saving theme colors immediately updates the sidebar variables', async () => {
  window.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ settings }) });
  render(<MemoryRouter><SavedModuleTheme /></MemoryRouter>);
  await waitFor(() => expect(document.body.style.getPropertyValue('--module-theme-main')).toBe(settings.color));
  fireEvent(window, new CustomEvent('saved-theme-colors', { detail: { color: '#dc2626', focus: '#fee2e2', text: '#222222' } }));
  expect(document.body.style.getPropertyValue('--module-theme-main')).toBe('#dc2626');
});
