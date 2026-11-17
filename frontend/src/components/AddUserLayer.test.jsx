/* global jest, test, expect, beforeEach, afterEach */
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import AddUserLayer from './AddUserLayer';
import { api } from '../services/api';
jest.mock('../services/api', () => ({ api: jest.fn() }));
const originalCrypto = globalThis.crypto;
beforeEach(() => {
  URL.createObjectURL = jest.fn(() => 'blob:profile');
  URL.revokeObjectURL = jest.fn();
});
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.restoreAllMocks();
  if (originalCrypto)
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: originalCrypto,
    });
  else delete globalThis.crypto;
});
const change = (label, value) =>
  fireEvent.change(screen.getByLabelText(label, { exact: false }), {
    target: { value },
  });
const next = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));

test('creates an account with profile details through the company-style wizard', async () => {
  api.mockResolvedValue({ user: { id: 5, name: 'New User' } });
  render(
    <MemoryRouter>
      <AddUserLayer />
    </MemoryRouter>,
  );
  expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Designation')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Description')).not.toBeInTheDocument();
  change('Full Name', 'New User');
  change('Email', 'new@example.test');
  expect(
    screen.getByRole('button', { name: 'Phone country code' }),
  ).toHaveTextContent('+91');
  fireEvent.click(screen.getByRole('button', { name: 'Phone country code' }));
  const countrySearch = screen.getByRole('searchbox', {
    name: 'Search countries or calling codes',
  });
  fireEvent.change(countrySearch, { target: { value: 'United Kingdom' } });
  fireEvent.keyDown(countrySearch, { key: 'Enter' });
  expect(
    screen.getByRole('button', { name: 'Phone country code' }),
  ).toHaveTextContent('+44');
  expect(api).not.toHaveBeenCalled();
  change('Phone Number', '7700 900123');
  change('Date of Birth', '1995-02-14');
  const image = new File(['profile'], 'profile.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('Profile Image'), {
    target: { files: [image] },
  });
  expect(await screen.findByAltText('Profile preview')).toHaveAttribute(
    'src',
    'blob:profile',
  );
  next();
  change('Business Name', 'Example Business');
  change('GSTIN', '33aezpa0582l1z7');
  change('Address', '10 Test Road');
  change('City', 'Trichy');
  change('State', 'Tamil Nadu');
  change('Country', 'India');
  change('Pincode', '620001');
  next();
  change('Username', 'new.user');
  change('Password', 'Example-Password-123');
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByLabelText('Business Name')).toHaveValue(
    'Example Business',
  );
  next();
  expect(screen.getByLabelText(/Password/)).toHaveValue('Example-Password-123');
  fireEvent.click(screen.getByRole('button', { name: 'Save User' }));
  expect(
    await screen.findByText('User New User created successfully.'),
  ).toBeInTheDocument();
  const [path, options] = api.mock.calls[0];
  expect(path).toBe('/users');
  expect(options.method).toBe('POST');
  expect(options.body.get('phone')).toBe('+447700900123');
  expect(options.body.get('gstin')).toBe('33AEZPA0582L1Z7');
  expect(options.body.get('password')).toBe('Example-Password-123');
  expect(options.body.get('business_name')).toBe('Example Business');
  expect(options.body.get('date_of_birth')).toBe('1995-02-14');
  expect(options.body.get('profile_image')).toBe(image);
  expect(screen.getByRole('link', { name: 'View Users' })).toHaveAttribute(
    'href',
    '/users-list',
  );
});

test('validates steps and returns server errors to the matching step without losing data', async () => {
  const error = new Error('The email has already been taken.');
  error.errors = { email: ['The email has already been taken.'] };
  api.mockRejectedValue(error);
  render(
    <MemoryRouter>
      <AddUserLayer />
    </MemoryRouter>,
  );
  next();
  expect(screen.getByText('Full Name is required.')).toBeInTheDocument();
  change('Full Name', 'New User');
  change('Email', 'taken@example.test');
  next();
  change('GSTIN', 'invalid');
  next();
  expect(
    screen.getByText('Enter a valid 15-character GSTIN.'),
  ).toBeInTheDocument();
  change('GSTIN', '');
  next();
  change('Username', 'new.user');
  change('Password', 'short');
  fireEvent.click(screen.getByRole('button', { name: 'Save User' }));
  expect(
    screen.getByText(
      'Password must contain at least 12 characters, uppercase and lowercase letters, a number, and a symbol.',
    ),
  ).toBeInTheDocument();
  expect(api).not.toHaveBeenCalled();
  change('Password', 'Example-Password-123');
  fireEvent.click(screen.getByRole('button', { name: 'Save User' }));
  await waitFor(() =>
    expect(screen.getByLabelText(/Email/)).toHaveValue('taken@example.test'),
  );
  expect(screen.getByLabelText(/Full Name/)).toHaveValue('New User');
  expect(
    screen.getAllByText('The email has already been taken.').length,
  ).toBeGreaterThan(0);
});

test('autofills username from email, preserves edits and generates a strong password', async () => {
  api.mockResolvedValue({ user: { id: 8, name: 'New User' } });
  const random = jest.fn((bytes) => {
    bytes.set(
      Array.from(
        { length: bytes.length },
        (_, index) => [0, 26, 52, 62][index % 4],
      ),
    );
    return bytes;
  });
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: { getRandomValues: random },
  });
  render(
    <MemoryRouter>
      <AddUserLayer />
    </MemoryRouter>,
  );
  change('Full Name', 'New User');
  change('Email', 'First.Last@example.test');
  next();
  next();
  expect(screen.getByLabelText(/Username/)).toHaveValue('first.last');
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  change('Email', 'Updated@example.test');
  next();
  next();
  expect(screen.getByLabelText(/Username/)).toHaveValue('updated');
  change('Username', 'custom.username');
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  change('Email', 'Changed@example.test');
  next();
  next();
  expect(screen.getByLabelText(/Username/)).toHaveValue('custom.username');
  fireEvent.click(screen.getByRole('button', { name: 'Generate Password' }));
  const password = screen.getByLabelText('Password', { exact: false });
  expect(random).toHaveBeenCalled();
  expect(password.value).toHaveLength(20);
  expect(password.value).toMatch(/[A-Z]/);
  expect(password.value).toMatch(/[a-z]/);
  expect(password.value).toMatch(/[0-9]/);
  expect(password.value).toMatch(/[!@]/);
  expect(password).toHaveAttribute('type', 'text');
  const generated = password.value;
  fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
  expect(password).toHaveAttribute('type', 'password');
  fireEvent.click(screen.getByRole('button', { name: 'Save User' }));
  expect(
    await screen.findByText('User New User created successfully.'),
  ).toBeInTheDocument();
  expect(api.mock.calls[0][1].body.get('password')).toBe(generated);
  expect(api.mock.calls[0][1].body.get('username')).toBe('custom.username');
});
