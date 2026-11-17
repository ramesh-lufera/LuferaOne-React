/* global jest, test, expect, afterEach */
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import UsersListLayer from './UsersListLayer';
import { api } from '../services/api';

jest.mock('../services/api', () => ({ api: jest.fn() }));
jest.mock('../helper/auth', () => ({ clearToken: jest.fn() }));
jest.mock('@iconify/react/dist/iconify.js', () => ({ Icon: () => null }));
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

const people = Array.from({ length: 11 }, (_, index) => ({
  id: index + 1,
  name: `Person ${index + 1}`,
  email: `person${index + 1}@example.test`,
  username: `person${index + 1}`,
  phone: null,
  role: index === 0 ? 'super_admin' : 'user',
  created_at: '2026-11-16T00:00:00Z',
}));
const responseFor = (path) => {
  const params = new URLSearchParams(path.split('?')[1]);
  const page = Number(params.get('page'));
  const limit = Number(params.get('per_page'));
  const filtered = people.filter((user) =>
    user.name.includes(params.get('search')),
  );
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);
  return {
    data,
    from: data.length ? start + 1 : null,
    to: data.length ? start + data.length : null,
    total: filtered.length,
    last_page: Math.max(1, Math.ceil(filtered.length / limit)),
  };
};

test('shows database users and supports search, page size and pagination', async () => {
  api.mockImplementation(async (path) => responseFor(path));
  render(<UsersListLayer />, { wrapper: MemoryRouter });
  await screen.findByText('Person 1');
  expect(screen.getByText('Super Admin')).toBeInTheDocument();
  expect(screen.getByText('person1@example.test')).toBeInTheDocument();
  expect(screen.getByText('person1')).toBeInTheDocument();
  expect(screen.getByText('Showing 1 to 10 of 11 entries')).toBeInTheDocument();
  const pagination = within(
    screen.getByRole('navigation', { name: 'User pages' }),
  );
  fireEvent.click(pagination.getByRole('button', { name: 'Next page' }));
  expect(await screen.findByText('Person 11')).toBeInTheDocument();
  expect(
    screen.getByText('Showing 11 to 11 of 11 entries'),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Show'), { target: { value: '20' } });
  expect(await screen.findByText('Person 1')).toBeInTheDocument();
  expect(screen.getByText('Showing 1 to 11 of 11 entries')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search users'), {
    target: { value: 'Person 11' },
  });
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith(
      '/users?search=Person%2011&page=1&per_page=20',
      expect.any(Object),
    ),
  );
  expect(
    await screen.findByText('Showing 1 to 1 of 1 entries'),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search users'), {
    target: { value: 'Nobody' },
  });
  expect(await screen.findByText('No users found.')).toBeInTheDocument();
  expect(screen.getByText('Showing 0 to 0 of 0 entries')).toBeInTheDocument();
});

test('shows request failures and reloads the list on retry', async () => {
  api
    .mockRejectedValueOnce(new Error('Unable to load users.'))
    .mockImplementation(async (path) => responseFor(path));
  render(<UsersListLayer />, { wrapper: MemoryRouter });
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unable to load users.',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('Person 1')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('view opens the selected user details including the linked profile', async () => {
  api.mockImplementation(async (path) =>
    path.startsWith('/users?')
      ? responseFor(path)
      : {
          user: {
            ...people[1],
            business_name: 'Selected Business',
            date_of_birth: '1995-02-14',
            address: '<script>plain address</script>',
            gstin: '33AEZPA0582L1Z7',
            profile_image_url: '/signed-profile',
          },
        },
  );
  render(<UsersListLayer />, { wrapper: MemoryRouter });
  await screen.findByText('Person 2');
  fireEvent.click(screen.getByRole('button', { name: 'View Person 2' }));
  const dialog = within(screen.getByRole('dialog'));
  expect(await dialog.findByText('Selected Business')).toBeInTheDocument();
  expect(dialog.getByText('person2@example.test')).toBeInTheDocument();
  expect(dialog.getByText('1995-02-14')).toBeInTheDocument();
  expect(
    dialog.getByText('<script>plain address</script>'),
  ).toBeInTheDocument();
  expect(document.querySelector('script')).toBeNull();
  expect(dialog.getByAltText('Person 2 profile')).toHaveAttribute(
    'src',
    '/signed-profile',
  );
  expect(api).toHaveBeenCalledWith('/users/2', expect.any(Object));
});

test('edit loads legacy details and updates through the wizard without requiring a password', async () => {
  let list = [...people];
  const record = {
    ...people[1],
    username: null,
    phone: '+919876543210',
    business_name: 'Existing Business',
    profile_image_url: '/signed-profile',
  };
  api.mockImplementation(async (path, options) => {
    if (path.startsWith('/users?'))
      return { ...responseFor(path), data: list.slice(0, 10) };
    if (options?.method === 'POST') {
      list = list.map((user) =>
        user.id === 2 ? { ...user, name: options.body.get('name') } : user,
      );
      return {
        user: record,
        message: 'User updated successfully.',
        requires_reauthentication: false,
      };
    }
    return { user: record };
  });
  render(<UsersListLayer />, { wrapper: MemoryRouter });
  await screen.findByText('Person 2');
  fireEvent.click(screen.getByRole('button', { name: 'Edit Person 2' }));
  const dialog = within(screen.getByRole('dialog'));
  expect(await dialog.findByDisplayValue('Person 2')).toBeInTheDocument();
  expect(dialog.getByLabelText('Phone Number')).toHaveValue('9876543210');
  expect(
    dialog.getByRole('button', { name: 'Phone country code' }),
  ).toHaveTextContent('+91');
  fireEvent.change(dialog.getByLabelText(/Full Name/), {
    target: { value: 'Updated Person' },
  });
  fireEvent.click(dialog.getByRole('button', { name: 'Remove Image' }));
  fireEvent.click(dialog.getByRole('button', { name: 'Next' }));
  expect(dialog.getByLabelText('Business Name')).toHaveValue(
    'Existing Business',
  );
  fireEvent.change(dialog.getByLabelText('Business Name'), {
    target: { value: 'Updated Business' },
  });
  fireEvent.click(dialog.getByRole('button', { name: 'Next' }));
  expect(dialog.getByLabelText('Username')).toHaveValue('');
  expect(dialog.getByLabelText('Password')).toHaveValue('');
  fireEvent.click(dialog.getByRole('button', { name: 'Update User' }));
  expect(
    await screen.findByText('User updated successfully.'),
  ).toBeInTheDocument();
  expect(await screen.findByText('Updated Person')).toBeInTheDocument();
  const [path, options] = api.mock.calls.find(
    ([, options]) => options?.method === 'POST',
  );
  expect(path).toBe('/users/2');
  expect(options.body.get('_method')).toBe('PUT');
  expect(options.body.has('password')).toBe(false);
  expect(options.body.get('business_name')).toBe('Updated Business');
  expect(options.body.get('phone')).toBe('+919876543210');
  expect(options.body.get('remove_profile_image')).toBe('1');
});

test('delete requires confirmation and permits retry after a failed request', async () => {
  let removed = false;
  let fail = true;
  api.mockImplementation(async (path, options) => {
    if (options?.method === 'DELETE') {
      if (fail) throw new Error('Delete failed. Try again.');
      removed = true;
      return { message: 'User deleted successfully.' };
    }
    const result = responseFor(path);
    return {
      ...result,
      data: removed ? result.data.filter((user) => user.id !== 2) : result.data,
    };
  });
  render(<UsersListLayer />, { wrapper: MemoryRouter });
  await screen.findByText('Person 2');
  fireEvent.click(screen.getByRole('button', { name: 'Delete Person 2' }));
  expect(
    api.mock.calls.some(([, options]) => options?.method === 'DELETE'),
  ).toBe(false);
  const dialog = within(screen.getByRole('dialog'));
  fireEvent.click(dialog.getByRole('button', { name: 'Delete User' }));
  expect(
    await dialog.findByText('Delete failed. Try again.'),
  ).toBeInTheDocument();
  expect(screen.getByText('Person 2')).toBeInTheDocument();
  fail = false;
  fireEvent.click(dialog.getByRole('button', { name: 'Delete User' }));
  expect(
    await screen.findByText('User deleted successfully.'),
  ).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.queryByText('Person 2')).not.toBeInTheDocument(),
  );
  expect(api).toHaveBeenCalledWith('/users/2', { method: 'DELETE' });
});

test('deleting the final row on a page returns to the preceding page', async () => {
  let removed = false;
  api.mockImplementation(async (path, options) => {
    if (options?.method === 'DELETE') {
      removed = true;
      return { message: 'User deleted successfully.' };
    }
    if (!removed) return responseFor(path);
    return {
      data: people.slice(0, 10),
      from: 1,
      to: 10,
      total: 10,
      last_page: 1,
    };
  });
  render(<UsersListLayer />, { wrapper: MemoryRouter });
  await screen.findByText('Person 1');
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  await screen.findByText('Person 11');
  fireEvent.click(screen.getByRole('button', { name: 'Delete Person 11' }));
  fireEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: 'Delete User',
    }),
  );
  expect(await screen.findByText('Person 1')).toBeInTheDocument();
  expect(screen.getByText('Showing 1 to 10 of 10 entries')).toBeInTheDocument();
});
