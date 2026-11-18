/* global jest, test, expect, beforeEach, afterEach */
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import ViewProfileLayer from './ViewProfileLayer';
import { api } from '../services/api';
jest.mock('../services/api', () => ({ api: jest.fn() }));
const user = {
  id: 7,
  user_code: 'ABC123',
  name: 'Current User',
  email: 'current@example.test',
  username: 'current',
  phone: '+91 9876543210',
  role: 'user',
  business_name: 'Example',
  city: 'Chennai',
  profile_image_url: '/photo',
  cover_image_url: '/cover',
};
beforeEach(() => {
  URL.createObjectURL = jest.fn(() => 'blob:preview');
  URL.revokeObjectURL = jest.fn();
});
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

test('loads profile, saves details and both pictures, and displays saved values immediately and after remount', async () => {
  let saved = { ...user };
  api.mockImplementation(async (path, options) => {
    if (!options?.method) return { user: saved };
    saved = {
      ...saved,
      name: options.body.get('name'),
      profile_image_url: '/new-photo',
      cover_image_url: '/new-cover',
    };
    return { user: saved };
  });
  const view = render(<ViewProfileLayer />);
  expect(await screen.findByLabelText(/Full Name/)).toHaveValue('Current User');
  expect(screen.getByLabelText('User ID')).toHaveValue('ABC123');
  expect(screen.getByLabelText('User ID')).toHaveAttribute('readonly');
  expect(screen.getByAltText('Cover preview')).toHaveAttribute('src', '/cover');
  expect(screen.getByLabelText('Phone Number')).toHaveValue('9876543210');
  fireEvent.change(screen.getByLabelText(/Full Name/), {
    target: { value: 'Updated Name' },
  });
  const image = new File(['image'], 'picture.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('Profile Picture'), {
    target: { files: [image] },
  });
  fireEvent.change(screen.getByLabelText('Cover Picture'), {
    target: { files: [image] },
  });
  expect(await screen.findByAltText('Cover preview')).toHaveAttribute(
    'src',
    'blob:preview',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  await screen.findByText('Profile updated successfully.');
  expect(
    screen.getByRole('heading', { name: 'Updated Name' }),
  ).toBeInTheDocument();
  expect(screen.getByAltText('Cover preview')).toHaveAttribute(
    'src',
    '/new-cover',
  );
  const [, options] = api.mock.calls.find(
    ([, options]) => options?.method === 'POST',
  );
  expect(options.body.get('profile_image')).toBe(image);
  expect(options.body.get('cover_image')).toBe(image);
  expect(options.body.get('_method')).toBe('PUT');
  expect(options.body.get('phone')).toBe(user.phone);
  expect(options.body.has('password')).toBe(false);
  expect(options.body.has('user_code')).toBe(false);
  view.unmount();
  render(<ViewProfileLayer />);
  expect(await screen.findByLabelText(/Full Name/)).toHaveValue('Updated Name');
  expect(screen.getByAltText('Cover preview')).toHaveAttribute(
    'src',
    '/new-cover',
  );
});

test('shows server validation errors and validates image selection and removal', async () => {
  api.mockResolvedValueOnce({ user }).mockRejectedValueOnce(
    Object.assign(new Error('Please correct the form.'), {
      errors: { email: ['Email is already in use.'] },
    }),
  );
  render(<ViewProfileLayer />);
  await screen.findByLabelText(/Full Name/);
  fireEvent.change(screen.getByLabelText('Cover Picture'), {
    target: { files: [new File(['bad'], 'bad.txt', { type: 'text/plain' })] },
  });
  expect(
    screen.getByText('Choose a JPG, PNG, or WebP image up to 2 MB.'),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Remove cover picture' }));
  expect(screen.getByLabelText('No cover picture')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  expect(
    await screen.findByText('Email is already in use.'),
  ).toBeInTheDocument();
  expect(api.mock.calls[1][1].body.get('remove_cover_image')).toBe('1');
});

test('validates passwords, handles incorrect current password, and clears sensitive fields after success', async () => {
  api.mockResolvedValueOnce({ user });
  render(<ViewProfileLayer />);
  await screen.findByLabelText(/Full Name/);
  fireEvent.click(screen.getByRole('tab', { name: 'Change Password' }));
  const current = screen.getByLabelText(/^Current Password/);
  const password = screen.getByLabelText(/^New Password/);
  const confirm = screen.getByLabelText(/^Confirm New Password/);
  const update = screen.getByRole('button', { name: 'Update Password' });
  fireEvent.change(current, { target: { value: 'Current-Password-123!' } });
  fireEvent.change(password, { target: { value: 'weak' } });
  fireEvent.change(confirm, { target: { value: 'different' } });
  fireEvent.click(update);
  expect(
    screen.getByText('The new passwords do not match.'),
  ).toBeInTheDocument();
  expect(api).toHaveBeenCalledTimes(1);
  fireEvent.change(password, { target: { value: 'New-Password-123!' } });
  fireEvent.change(confirm, { target: { value: 'New-Password-123!' } });
  api.mockRejectedValueOnce(
    Object.assign(new Error('Invalid password.'), {
      errors: { current_password: ['The current password is incorrect.'] },
    }),
  );
  fireEvent.click(update);
  expect(
    await screen.findByText('The current password is incorrect.'),
  ).toBeInTheDocument();
  api.mockResolvedValueOnce({ message: 'Password changed successfully.' });
  fireEvent.click(update);
  await screen.findByText('Password changed successfully.');
  expect(current).toHaveValue('');
  expect(password).toHaveValue('');
  expect(confirm).toHaveValue('');
  expect(JSON.parse(api.mock.calls[2][1].body).current_password).toBe(
    'Current-Password-123!',
  );
});

test('can retry a failed profile request', async () => {
  api
    .mockRejectedValueOnce(new Error('Unable to load profile.'))
    .mockResolvedValueOnce({ user });
  render(<ViewProfileLayer />);
  fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
  await waitFor(() =>
    expect(screen.getByLabelText(/Full Name/)).toHaveValue(user.name),
  );
});
