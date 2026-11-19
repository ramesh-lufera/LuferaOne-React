/* global jest, test, expect, beforeEach, afterEach */
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompanyLayer from './CompanyLayer';
import { api } from '../services/api';
jest.mock('../services/api', () => ({ api: jest.fn() }));
const profile = { id: 1, full_name: 'Example Company', email: 'info@example.test', phone_country_code: '+91', phone_number: '8680808204', website: 'www.example.com',
  country: 'India', city: 'Trichy', state: 'Tamil Nadu', zip_code: '620001', address: '96/1, Bharathidasan Salai', gstin: '33AEZPA0582L1Z7' };
beforeEach(() => { URL.createObjectURL = jest.fn(() => 'blob:preview'); URL.revokeObjectURL = jest.fn(); });
afterEach(() => { cleanup(); jest.clearAllMocks(); });
const change = (label, value) => fireEvent.change(screen.getByLabelText(label, { exact: false }), { target: { value } });
const next = () => fireEvent.click(screen.getByRole('button', { name: 'Next' }));
test('validates steps and creates a company using the numbered wizard', async () => {
  api.mockImplementation(async (path, options) => options?.method ? { company: profile, message: 'Company profile saved successfully.' } : { company: null });
  render(<CompanyLayer />);
  await screen.findByLabelText(/Full Name/);
  next();
  expect(screen.getByText('Full Name is required.')).toBeInTheDocument();
  change('Full Name', profile.full_name); change('Email', profile.email); change('Phone Number', profile.phone_number); change('Website', profile.website);
  next();
  change('Country', profile.country); change('City', profile.city); change('State', profile.state); change('Zip Code', profile.zip_code); change('Address', profile.address); change('GSTIN', profile.gstin);
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByLabelText(/Full Name/)).toHaveValue(profile.full_name);
  next(); next();
  const image = new File(['image'], 'logo.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('Company Logo'), { target: { files: [image] } });
  fireEvent.change(screen.getByLabelText('Site Logo'), { target: { files: [image] } });
  expect(await screen.findByAltText('Company Logo preview')).toHaveAttribute('src', 'blob:preview');
  fireEvent.click(screen.getByRole('button', { name: 'Save Change' }));
  expect(await screen.findByText('Company profile saved successfully.')).toBeInTheDocument();
  const [, options] = api.mock.calls.find(([, opts]) => opts?.method === 'POST');
  expect(options.body.get('full_name')).toBe('Example Company');
  expect(options.body.get('gstin')).toBe('33AEZPA0582L1Z7');
  expect(options.body.get('logo')).toBe(image);
  expect(options.body.get('site_logo')).toBe(image);
  expect(options.body.has('_method')).toBe(false);
});
test('loads the shared profile and submits updates rather than duplicates', async () => {
  api.mockResolvedValue({ company: profile, message: 'Saved' });
  render(<CompanyLayer />);
  await screen.findByDisplayValue('Example Company');
  expect(screen.getByRole('button', { name: 'Phone country code' })).toHaveTextContent('🇮🇳+91');
  fireEvent.click(screen.getByRole('button', { name: 'Phone country code' }));
  const countrySearch = screen.getByRole('searchbox', { name: 'Search countries or calling codes' });
  expect(countrySearch).toHaveFocus();
  fireEvent.change(countrySearch, { target: { value: 'united kingdom' } });
  expect(screen.getByRole('menuitem', { name: /\+44.*United Kingdom/ })).toBeInTheDocument();
  expect(screen.queryByRole('menuitem', { name: /\+91.*India/ })).not.toBeInTheDocument();
  fireEvent.change(countrySearch, { target: { value: 'no matching country' } });
  expect(screen.getByText('No countries found.')).toBeInTheDocument();
  fireEvent.change(countrySearch, { target: { value: '+44' } });
  fireEvent.keyDown(countrySearch, { key: 'Enter' });
  expect(screen.getByRole('button', { name: 'Phone country code' })).toHaveTextContent('🇬🇧+44');
  expect(screen.getByRole('button', { name: 'Phone country code' })).not.toHaveTextContent('United Kingdom');
  change('Full Name', 'Updated Company'); next(); next();
  fireEvent.click(screen.getByRole('button', { name: 'Save Change' }));
  await screen.findByText('Saved');
  const [, options] = api.mock.calls.find(([, opts]) => opts?.method === 'POST');
  expect(options.body.get('_method')).toBe('PUT');
  expect(options.body.get('full_name')).toBe('Updated Company');
  expect(options.body.get('phone_country_code')).toBe('+44');
  expect(options.body.get('phone_number')).toBe(profile.phone_number);
});
test('preserves an existing country code outside the dropdown list', async () => {
  api.mockResolvedValue({ company: { ...profile, phone_country_code: '+1684' }, message: 'Saved' });
  render(<CompanyLayer />);
  await screen.findByDisplayValue('Example Company');
  expect(screen.getByRole('button', { name: 'Phone country code' })).toHaveTextContent('+1684');
  next(); next();
  fireEvent.click(screen.getByRole('button', { name: 'Save Change' }));
  await screen.findByText('Saved');
  const [, options] = api.mock.calls.find(([, opts]) => opts?.method === 'POST');
  expect(options.body.get('phone_country_code')).toBe('+1684');
});
test('returns to the relevant step for backend field errors and retains input', async () => {
  const error = Object.assign(new Error('Validation failed.'), { errors: { gstin: ['GSTIN is invalid.'] } });
  api.mockImplementation(async (path, options) => { if (options?.method) throw error; return { company: profile }; });
  render(<CompanyLayer />);
  await screen.findByDisplayValue('Example Company'); next(); next();
  fireEvent.click(screen.getByRole('button', { name: 'Save Change' }));
  expect(await screen.findByText('GSTIN is invalid.')).toBeInTheDocument();
  expect(screen.getByLabelText(/GSTIN/)).toHaveValue(profile.gstin);
});
test('blocks editing after a failed load and supports retry', async () => {
  api.mockRejectedValueOnce(new Error('Offline')).mockResolvedValue({ company: profile });
  render(<CompanyLayer />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
  expect(screen.queryByRole('form')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(screen.getByLabelText(/Full Name/)).toHaveValue(profile.full_name));
});

test('rejects oversized company images before sending a save', async () => {
  api.mockResolvedValue({ company: profile });
  render(<CompanyLayer />);
  await screen.findByDisplayValue('Example Company'); next(); next();
  fireEvent.change(screen.getByLabelText('Company Logo'), { target: { files: [new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' })] } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Change' }));
  expect(await screen.findByText('Choose a JPG, PNG, or WebP image up to 2 MB.')).toBeInTheDocument();
  expect(api.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
});

test('Address Next only opens Images and cannot become the save submit button', async () => {
  api.mockResolvedValue({ company: profile, message: 'Company profile saved successfully.' });
  render(<CompanyLayer />);
  await screen.findByDisplayValue('Example Company');
  next();
  expect(screen.getByLabelText(/GSTIN/)).toBeInTheDocument();
  const nextButton = screen.getByRole('button', { name: 'Next' });
  const click = new MouseEvent('click', { bubbles: true, cancelable: true });
  fireEvent(nextButton, click);
  expect(click.defaultPrevented).toBe(true);
  expect(screen.getByLabelText('Company Logo')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save Change' })).not.toBe(nextButton);
  expect(api.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(false);
  expect(screen.queryByText('Company profile saved successfully.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Save Change' }));
  expect(await screen.findByText('Company profile saved successfully.')).toBeInTheDocument();
});

test('uploads and removes the Site Logo used for the favicon', async () => {
  api.mockResolvedValue({ company: { ...profile, site_logo_url: '/saved-site-logo.png' }, message: 'Saved' });
  render(<CompanyLayer />);
  await screen.findByDisplayValue('Example Company'); next(); next();
  expect(screen.getByAltText('Site Logo preview')).toHaveAttribute('src', '/saved-site-logo.png');
  const image = new File(['image'], 'site.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('Site Logo'), { target: { files: [image] } });
  expect(await screen.findByAltText('Site Logo preview')).toHaveAttribute('src', 'blob:preview');
  fireEvent.click(screen.getByRole('button', { name: 'Remove site logo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save Change' }));
  await screen.findByText('Saved');
  const [, options] = api.mock.calls.find(([, opts]) => opts?.method === 'POST');
  expect(options.body.get('remove_site_logo')).toBe('1');
});
