/* global jest, test, expect, afterEach */
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AuthBrandingImage from './AuthBrandingImage';
import useCompanyBranding from '../helper/useCompanyBranding';
import SignInLayer from './SignInLayer';
import { api } from '../services/api';
import { saveToken } from '../helper/auth';

jest.mock('@iconify/react/dist/iconify.js', () => ({ Icon: function MockIcon() { return null; } }));
jest.mock('../services/api', () => ({ api: jest.fn() }));
jest.mock('../helper/auth', () => ({ apiUrl: '/api', getToken: jest.fn(() => null), saveToken: jest.fn(), clearToken: jest.fn(), markTokenVerified: jest.fn() }));
jest.mock('./GoogleSignIn', () => function MockGoogle() { return null; });
jest.mock('./FacebookSignIn', () => function MockFacebook() { return null; });
const originalFetch = window.fetch;
afterEach(() => { cleanup(); jest.resetAllMocks(); window.fetch = originalFetch; });

test('dynamic image falls back to the original asset and removes broken images if that also fails', () => {
  render(<AuthBrandingImage src="/dynamic.png" fallbackSrc="/assets/images/auth/auth-img.png" alt="Illustration" />);
  fireEvent.error(screen.getByRole('img'));
  expect(screen.getByRole('img')).toHaveAttribute('src', '/assets/images/auth/auth-img.png');
  fireEvent.error(screen.getByRole('img'));
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('logo falls back through the configured logo to default branding and accepts a replacement URL', () => {
  const view = render(<AuthBrandingImage src="/logo.png" fallbackSrc="/configured.png" alt="Company logo"><span>LuferaInfotech</span></AuthBrandingImage>);
  fireEvent.error(screen.getByRole('img'));
  expect(screen.getByRole('img')).toHaveAttribute('src', '/configured.png');
  fireEvent.error(screen.getByRole('img'));
  expect(screen.getByText('LuferaInfotech')).toBeInTheDocument();
  view.rerender(<AuthBrandingImage src="/new-logo.png" fallbackSrc="/configured.png" alt="Company logo"><span>LuferaInfotech</span></AuthBrandingImage>);
  expect(screen.getByRole('img')).toHaveAttribute('src', '/new-logo.png');
});

function BrandingPreview() {
  const images = useCompanyBranding();
  return <><AuthBrandingImage src={images.sign_in_image_url} fallbackSrc="/default-signin.png" alt="Sign in art" />
    <AuthBrandingImage src={images.sign_up_image_url} fallbackSrc="/default-signup.png" alt="Sign up art" />
    <AuthBrandingImage src={images.logo_url} alt="Company logo"><span>Default brand</span></AuthBrandingImage></>;
}

test('loads both illustrations and logo and refreshes changed Company images on focus', async () => {
  api.mockResolvedValueOnce({ images: { sign_in_image_url: '/signin.png', sign_up_image_url: '/signup.png', logo_url: '/logo.png' } });
  api.mockResolvedValueOnce({ images: { sign_in_image_url: '/new-signin.png', sign_up_image_url: null, logo_url: null } });
  render(<BrandingPreview />);
  await waitFor(() => expect(screen.getByAltText('Sign in art')).toHaveAttribute('src', '/signin.png'));
  expect(screen.getByAltText('Sign up art')).toHaveAttribute('src', '/signup.png');
  expect(screen.getByAltText('Company logo')).toHaveAttribute('src', '/logo.png');
  fireEvent(window, new Event('focus'));
  await waitFor(() => expect(screen.getByAltText('Sign in art')).toHaveAttribute('src', '/new-signin.png'));
  expect(screen.getByAltText('Sign up art')).toHaveAttribute('src', '/default-signup.png');
  expect(screen.getByText('Default brand')).toBeInTheDocument();
});

test('API failure keeps original artwork and branding available', async () => {
  api.mockRejectedValue(new Error('Unavailable'));
  render(<BrandingPreview />);
  await waitFor(() => expect(api).toHaveBeenCalled());
  expect(screen.getByAltText('Sign in art')).toHaveAttribute('src', '/default-signin.png');
  expect(screen.getByAltText('Sign up art')).toHaveAttribute('src', '/default-signup.png');
  expect(screen.getByText('Default brand')).toBeInTheDocument();
});

test('sign in displays Company images above the unchanged working login form', async () => {
  api.mockResolvedValue({ images: { sign_in_image_url: '/signin.png', logo_url: '/logo.png' } });
  window.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'signed-in-token' }) });
  const view = render(<MemoryRouter><SignInLayer /></MemoryRouter>);
  await waitFor(() => expect(screen.getByAltText('Company logo')).toHaveAttribute('src', '/logo.png'));
  expect(view.container.querySelector('.auth-left img')).toHaveAttribute('src', '/signin.png');
  expect(view.container.querySelector('.sign-in-brand')).toContainElement(screen.getByAltText('Company logo'));
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
  await waitFor(() => expect(saveToken).toHaveBeenCalledWith('signed-in-token', false));
  expect(window.fetch).toHaveBeenCalledWith('/api/login', expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'admin@example.com', password: 'password123', remember: false }) }));
});

test('saving a Company profile refreshes the branding without a page reload', async () => {
  api.mockResolvedValueOnce({ images: { logo_url: '/old-logo.png' } });
  api.mockResolvedValueOnce({ images: { logo_url: '/new-logo.png' } });
  render(<BrandingPreview />);
  await waitFor(() => expect(screen.getByAltText('Company logo')).toHaveAttribute('src', '/old-logo.png'));
  fireEvent(window, new Event('company-branding-updated'));
  await waitFor(() => expect(screen.getByAltText('Company logo')).toHaveAttribute('src', '/new-logo.png'));
});
