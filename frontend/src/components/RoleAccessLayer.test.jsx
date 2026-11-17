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
import RoleAccessLayer from './RoleAccessLayer';
import AssignRoleLayer from './AssignRoleLayer';
import { api } from '../services/api';
jest.mock('../services/api', () => ({ api: jest.fn() }));
jest.mock('@iconify/react/dist/iconify.js', () => ({ Icon: () => null }));
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

const roles = [
  {
    id: 1,
    name: 'admin',
    active: true,
    modules: ['*'],
    users_count: 1,
    created_at: '2026-11-16',
  },
  {
    id: 2,
    name: 'manager',
    description: 'Team manager',
    active: true,
    modules: ['company'],
    users_count: 0,
    created_at: '2026-11-16',
  },
];
const roleData = {
  roles,
  modules: { dashboard: { label: 'Dashboard' }, company: { label: 'Company' } },
};

test('creates a role with selected modules and filters the role list', async () => {
  api.mockResolvedValue(roleData);
  render(
    <MemoryRouter>
      <RoleAccessLayer />
    </MemoryRouter>,
  );
  await screen.findByText('Manager');
  expect(screen.getByRole('button', { name: 'Edit admin' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Search roles'), {
    target: { value: 'missing' },
  });
  expect(screen.getByText('No roles found.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Add New Role' }));
  fireEvent.change(screen.getByLabelText('Role Name'), {
    target: { value: 'operations' },
  });
  const dialog = within(screen.getByRole('dialog'));
  expect(dialog.queryByLabelText('Company')).not.toBeInTheDocument();
  fireEvent.click(dialog.getByLabelText('Inactive'));
  fireEvent.click(dialog.getByRole('button', { name: 'Next' }));
  expect(api.mock.calls.some(([, options]) => options?.method)).toBe(false);
  fireEvent.click(dialog.getByLabelText('Company'));
  fireEvent.click(dialog.getByRole('button', { name: 'Back' }));
  expect(dialog.getByLabelText('Role Name')).toHaveValue('operations');
  expect(dialog.getByLabelText('Inactive')).toBeChecked();
  fireEvent.click(dialog.getByRole('button', { name: 'Next' }));
  expect(dialog.getByLabelText('Company')).toBeChecked();
  fireEvent.click(dialog.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith(
      '/roles',
      expect.objectContaining({ method: 'POST' }),
    ),
  );
  const call = api.mock.calls.find(([, options]) => options?.method === 'POST');
  expect(JSON.parse(call[1].body)).toEqual({
    name: 'operations',
    description: '',
    active: false,
    modules: ['company'],
  });
  expect(await screen.findByText('Role saved.')).toBeInTheDocument();
});

test('shows server errors in the role editor and preserves entered values', async () => {
  api.mockImplementation(async (path, options) => {
    if (options?.method) throw new Error('Role name already exists.');
    return roleData;
  });
  render(
    <MemoryRouter>
      <RoleAccessLayer />
    </MemoryRouter>,
  );
  await screen.findByText('Manager');
  fireEvent.click(screen.getByRole('button', { name: 'Edit manager' }));
  const dialog = within(screen.getByRole('dialog'));
  fireEvent.click(dialog.getByRole('button', { name: 'Next' }));
  fireEvent.click(dialog.getByRole('button', { name: 'Update' }));
  expect(
    await screen.findByText('Role name already exists.'),
  ).toBeInTheDocument();
  fireEvent.click(dialog.getByRole('button', { name: 'Back' }));
  expect(dialog.getByLabelText('Role Name')).toHaveValue('manager');
});

test('assigns a saved role to an existing user', async () => {
  api.mockImplementation(async (path) =>
    path.startsWith('/role-users?')
      ? {
          data: [
            {
              id: 7,
              name: 'Test User',
              email: 'test@example.test',
              role: 'admin',
            },
          ],
          last_page: 1,
        }
      : roleData,
  );
  render(
    <MemoryRouter>
      <AssignRoleLayer />
    </MemoryRouter>,
  );
  await screen.findByText('test@example.test');
  fireEvent.change(screen.getByLabelText('Role for test@example.test'), {
    target: { value: 'manager' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith(
      '/role-users/7',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ role: 'manager' }),
      }),
    ),
  );
  expect(
    await screen.findByText('Role assigned to Test User.'),
  ).toBeInTheDocument();
});

test('edits role details and module permissions and refreshes the list', async () => {
  let savedRoles = [...roles];
  api.mockImplementation(async (path, options) => {
    if (options?.method === 'PUT') {
      const payload = JSON.parse(options.body);
      savedRoles = savedRoles.map((role) =>
        role.id === 2 ? { ...role, ...payload } : role,
      );
      return { message: 'Role updated.' };
    }
    return { ...roleData, roles: savedRoles };
  });
  render(
    <MemoryRouter>
      <RoleAccessLayer />
    </MemoryRouter>,
  );
  await screen.findByText('Manager');
  expect(
    screen.queryByRole('link', { name: 'Assign Roles' }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Edit manager' }));
  const dialog = within(screen.getByRole('dialog'));
  fireEvent.change(dialog.getByLabelText('Role Name'), {
    target: { value: 'operations' },
  });
  fireEvent.change(dialog.getByLabelText('Description'), {
    target: { value: 'Updated description' },
  });
  fireEvent.click(dialog.getByLabelText('Inactive'));
  fireEvent.click(dialog.getByRole('button', { name: 'Next' }));
  expect(dialog.getByLabelText('Company')).toBeChecked();
  fireEvent.click(dialog.getByLabelText('Company'));
  fireEvent.click(dialog.getByLabelText('Dashboard'));
  fireEvent.click(dialog.getByRole('button', { name: 'Update' }));
  expect(await screen.findByText('Role updated.')).toBeInTheDocument();
  expect(await screen.findByText('Operations')).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith(
    '/roles/2',
    expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({
        name: 'operations',
        description: 'Updated description',
        active: false,
        modules: ['dashboard'],
      }),
    }),
  );
});

test('confirms deletion, preserves the role after failure and supports retry', async () => {
  let savedRoles = [...roles];
  let fail = true;
  api.mockImplementation(async (path, options) => {
    if (options?.method === 'DELETE') {
      if (fail) throw new Error('Delete failed. Try again.');
      savedRoles = savedRoles.filter((role) => role.id !== 2);
      return { message: 'Role deleted.' };
    }
    return { ...roleData, roles: savedRoles };
  });
  render(
    <MemoryRouter>
      <RoleAccessLayer />
    </MemoryRouter>,
  );
  await screen.findByText('Manager');
  fireEvent.click(screen.getByRole('button', { name: 'Delete manager' }));
  expect(
    api.mock.calls.some(([, options]) => options?.method === 'DELETE'),
  ).toBe(false);
  const dialog = within(screen.getByRole('dialog'));
  fireEvent.click(dialog.getByRole('button', { name: 'Delete' }));
  expect(
    await dialog.findByText('Delete failed. Try again.'),
  ).toBeInTheDocument();
  expect(screen.getByText('Manager')).toBeInTheDocument();
  fail = false;
  fireEvent.click(dialog.getByRole('button', { name: 'Delete' }));
  expect(await screen.findByText('Role deleted.')).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.queryByText('Manager')).not.toBeInTheDocument(),
  );
  expect(api).toHaveBeenCalledWith('/roles/2', { method: 'DELETE' });
});

test('navigates role pages with numbered pagination and clamps after filtering', async () => {
  api.mockResolvedValue({
    ...roleData,
    roles: Array.from({ length: 11 }, (_, index) => ({
      ...roles[1],
      id: index + 10,
      name: `team-${index + 1}`,
    })),
  });
  render(
    <MemoryRouter>
      <RoleAccessLayer />
    </MemoryRouter>,
  );
  await screen.findByText('Team-1');
  const pagination = within(
    screen.getByRole('navigation', { name: 'Role pages' }),
  );
  expect(
    pagination.getByRole('button', { name: 'Previous page' }),
  ).toBeDisabled();
  fireEvent.click(pagination.getByRole('button', { name: 'Next page' }));
  expect(screen.getByText('Team-11')).toBeInTheDocument();
  expect(pagination.getByRole('button', { name: 'Next page' })).toBeDisabled();
  fireEvent.click(pagination.getByRole('button', { name: 'Previous page' }));
  expect(screen.getByText('Team-1')).toBeInTheDocument();
  fireEvent.click(pagination.getByRole('button', { name: 'Page 2' }));
  fireEvent.change(screen.getByLabelText('Search roles'), {
    target: { value: 'team-2' },
  });
  expect(screen.getByText('Team-2')).toBeInTheDocument();
  expect(pagination.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('assign role table searches users and changes page size using the shared controls', async () => {
  const people = Array.from({ length: 11 }, (_, index) => ({
    id: index + 1,
    name: `Person ${index + 1}`,
    email: `person${index + 1}@example.test`,
    role: 'manager',
  }));
  api.mockImplementation(async (path) => {
    if (path === '/roles') return roleData;
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
      to: start + data.length,
      total: filtered.length,
      last_page: Math.max(1, Math.ceil(filtered.length / limit)),
    };
  });
  render(
    <MemoryRouter>
      <AssignRoleLayer />
    </MemoryRouter>,
  );
  await screen.findByText('Person 1');
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
      '/role-users?search=Person%2011&page=1&per_page=20',
      expect.any(Object),
    ),
  );
  expect(
    await screen.findByText('Showing 1 to 1 of 1 entries'),
  ).toBeInTheDocument();
});
