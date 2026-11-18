/* global jest, test, expect, afterEach, global */
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import { useAccessUser } from '../helper/AccessContext';
import { getToken } from '../helper/auth';

jest.mock('../helper/auth', () => ({ apiUrl: '/api', getToken: jest.fn(), clearToken: jest.fn() }));
const originalFetch = global.fetch;
afterEach(() => { cleanup(); jest.resetAllMocks(); global.fetch = originalFetch; });
function LegalContent() {
  const user = useAccessUser();
  return <p>{user ? `Signed in as ${user.name}` : 'Guest legal page'}</p>;
}
function show(allowGuest = true) {
  render(<MemoryRouter initialEntries={['/privacy-policy']}><Routes>
    <Route element={<RequireAuth allowGuest={allowGuest} />}>
      <Route path="/privacy-policy" element={<LegalContent />} />
    </Route>
    <Route path="/sign-in" element={<p>Sign in</p>} />
  </Routes></MemoryRouter>);
}
test('legal view remains available without a login', async () => {
  getToken.mockReturnValue(null);
  show();
  expect(await screen.findByText('Guest legal page')).toBeInTheDocument();
});
test('signed-in legal view receives the user context needed by application navigation', async () => {
  getToken.mockReturnValue('test-token');
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ user: { name: 'Admin', modules: ['*'] } }) });
  show();
  expect(await screen.findByText('Signed in as Admin')).toBeInTheDocument();
});
test('other application routes still require login by default', async () => {
  getToken.mockReturnValue(null);
  show(false);
  expect(await screen.findByText('Sign in')).toBeInTheDocument();
});
