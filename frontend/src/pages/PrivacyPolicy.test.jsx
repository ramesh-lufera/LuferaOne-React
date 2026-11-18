/* eslint-disable react/prop-types */
/* global jest, test, expect, afterEach */
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import PrivacyPolicySettingsPage from './PrivacyPolicySettingsPage';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import { api } from '../services/api';
import { canAccessPath } from '../helper/moduleAccess';

jest.mock('../services/api', () => ({ api: jest.fn() }));
jest.mock('../masterLayout/MasterLayout', () => function MockLayout({ children }) { return <div data-testid="application-layout"><nav aria-label="Application sidebar" /><header aria-label="Application topbar" />{children}<footer><a href="/privacy-policy">Privacy Policy</a><a href="/terms-condition">Terms and Conditions</a></footer></div>; });
jest.mock('../components/ModulePageHeader', () => function MockHeader() { return <h1>Privacy Policy</h1>; });
jest.mock('react-quill-new', () => function MockEditor({ value, onChange, readOnly }) { return <textarea aria-label="Policy editor" value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} />; });
afterEach(() => { cleanup(); jest.resetAllMocks(); });
const show = (page) => render(<MemoryRouter>{page}</MemoryRouter>);

test('loads saved editor content, saves updates and links to the public page', async () => {
  api.mockResolvedValueOnce({ policy: { content: '<h2>Saved</h2>' } });
  api.mockResolvedValueOnce({ policy: { content: '<p>Updated</p>' }, message: 'Privacy Policy saved successfully.' });
  show(<PrivacyPolicySettingsPage />);
  expect(await screen.findByLabelText('Policy editor')).toHaveValue('<h2>Saved</h2>');
  fireEvent.change(screen.getByLabelText('Policy editor'), { target: { value: '<p>Updated</p>' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save / Update' }));
  await screen.findByText('Privacy Policy saved successfully.');
  expect(api).toHaveBeenLastCalledWith('/settings/privacy-policy', expect.objectContaining({ method: 'PUT', body: JSON.stringify({ content: '<p>Updated</p>' }) }));
  expect(screen.getByRole('link', { name: 'View public Privacy Policy' })).toHaveAttribute('href', '/privacy-policy');
});

test('failed loading cannot overwrite the saved policy', async () => {
  api.mockRejectedValue(new Error('Unable to load'));
  show(<PrivacyPolicySettingsPage />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load');
  expect(screen.queryByRole('button', { name: 'Save / Update' })).not.toBeInTheDocument();
});

test('public page displays formatted API content and refreshes on focus', async () => {
  api.mockResolvedValueOnce({ policy: { content: '<h2>Saved policy</h2><ul><li>Privacy detail</li></ul>' } });
  api.mockResolvedValueOnce({ policy: { content: '<p>Latest content</p>' } });
  show(<PrivacyPolicyPage />);
  expect(await screen.findByRole('heading', { name: 'Saved policy' })).toBeInTheDocument();
  expect(screen.getByRole('listitem')).toHaveTextContent('Privacy detail');
  expect(screen.getByRole('navigation', { name: 'Application sidebar' })).toBeInTheDocument();
  expect(screen.getByRole('banner', { name: 'Application topbar' })).toBeInTheDocument();
  fireEvent(window, new Event('focus'));
  expect(await screen.findByText('Latest content')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy-policy');
});

test('public page handles unpublished policies and API failures', async () => {
  api.mockResolvedValueOnce({ policy: { content: '' } });
  show(<PrivacyPolicyPage />);
  expect(await screen.findByText('The Privacy Policy has not been published yet.')).toBeInTheDocument();
  api.mockRejectedValueOnce(new Error('Server unavailable'));
  fireEvent(window, new Event('focus'));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Server unavailable'));
});

test('public route permits guests while settings follow module permissions', () => {
  expect(canAccessPath(null, '/privacy-policy')).toBe(true);
  expect(canAccessPath(null, '/settings/privacy-policy')).toBe(false);
  expect(canAccessPath({ modules: ['privacy-policy'] }, '/settings/privacy-policy')).toBe(true);
  expect(canAccessPath({ modules: [] }, '/settings/privacy-policy')).toBe(false);
});
