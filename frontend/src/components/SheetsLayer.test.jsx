import { MemoryRouter } from 'react-router-dom';
/* global jest, test, expect, afterEach */
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import SheetsLayer from './SheetsLayer';
import { api } from '../services/api';

jest.mock('../services/api', () => ({ api: jest.fn() }));
jest.mock('@iconify/react/dist/iconify.js', () => ({ Icon: function MockIcon() { return null; } }));
afterEach(() => { cleanup(); jest.resetAllMocks(); });
const empty = { data: [], from: null, to: null, total: 0, last_page: 1 };
const loaded = { data: [{ id: 1, name: 'Sales', created_at: '2026-11-19T10:00:00Z' }], from: 1, to: 1, total: 1, last_page: 1 };

test('renames a sheet from cards and refreshes its name', async () => {
  api.mockResolvedValueOnce(loaded).mockResolvedValueOnce({ message: 'Sheet renamed successfully.' }).mockResolvedValueOnce({ ...loaded, data: [{ ...loaded.data[0], name: 'Budget' }] });
  render(<MemoryRouter><SheetsLayer /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: 'Rename Sales' }));
  const dialog = within(screen.getByRole('dialog'));
  expect(dialog.getByLabelText(/Sheet Name/)).toHaveValue('Sales');
  fireEvent.change(dialog.getByLabelText(/Sheet Name/), { target: { value: ' Budget ' } });
  fireEvent.click(dialog.getByRole('button', { name: 'Save', exact: true }));
  expect(await screen.findByRole('link', { name: 'Open Budget' })).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith('/sheets/1', expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ name: 'Budget' }) }));
});

test('list deletion requires confirmation and preserves the sheet after a failed request', async () => {
  api.mockResolvedValueOnce(loaded).mockRejectedValueOnce(new Error('Could not delete.')).mockResolvedValueOnce({ message: 'Sheet deleted successfully.' }).mockResolvedValueOnce(empty);
  render(<MemoryRouter><SheetsLayer /></MemoryRouter>);
  await screen.findByText('Sales');
  fireEvent.click(screen.getByRole('button', { name: /List/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete Sales' }));
  expect(api).toHaveBeenCalledTimes(1);
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(api).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Delete Sales' }));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete', exact: true }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not delete.');
  expect(screen.getByRole('link', { name: 'Sales' })).toBeInTheDocument();
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete', exact: true }));
  expect(await screen.findByText('No sheets found.')).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith('/sheets/1', { method: 'DELETE' });
});

test('opens a name-only popup, creates a sheet and reloads the table', async () => {
  api.mockResolvedValueOnce(empty).mockResolvedValueOnce({ sheet: loaded.data[0], message: 'Sheet created successfully.' }).mockResolvedValueOnce(loaded);
  render(<MemoryRouter><SheetsLayer /></MemoryRouter>);
  await screen.findByText('No sheets found.');
  fireEvent.click(screen.getByRole('button', { name: 'Create Sheet' }));
  const dialog = within(screen.getByRole('dialog'));
  expect(dialog.getAllByRole('textbox')).toHaveLength(1);
  fireEvent.change(dialog.getByLabelText(/Sheet Name/), { target: { value: ' Sales ' } });
  fireEvent.click(dialog.getByRole('button', { name: 'Create', exact: true }));
  expect(await screen.findByText('Sales')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Open Sales' })).toHaveAttribute('href', '/sheet?id=1');
  expect(screen.getByText('Sheet created successfully.')).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith('/sheets', expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'Sales' }) }));
  expect(screen.getByText('Showing 1 to 1 of 1 entries')).toBeInTheDocument();
});

test('failed creation preserves the typed name and cancel does not create records', async () => {
  api.mockResolvedValueOnce(empty).mockRejectedValueOnce(Object.assign(new Error('Invalid name'), { errors: { name: ['Name is invalid.'] } }));
  render(<MemoryRouter><SheetsLayer /></MemoryRouter>);
  await screen.findByText('No sheets found.');
  fireEvent.click(screen.getByRole('button', { name: 'Create Sheet' }));
  const dialog = within(screen.getByRole('dialog'));
  fireEvent.change(dialog.getByLabelText(/Sheet Name/), { target: { value: 'Sales' } });
  fireEvent.click(dialog.getByRole('button', { name: 'Create', exact: true }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Name is invalid.');
  expect(dialog.getByLabelText(/Sheet Name/)).toHaveValue('Sales');
  fireEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
  expect(api.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(1);
});

test('search and show controls load database results', async () => {
  api.mockResolvedValue(loaded);
  render(<MemoryRouter><SheetsLayer /></MemoryRouter>);
  await screen.findByText('Sales');
  fireEvent.change(screen.getByRole('textbox', { name: 'Search sheets' }), { target: { value: 'Budget' } });
  await waitFor(() => expect(api).toHaveBeenLastCalledWith('/sheets?search=Budget&page=1&per_page=10', expect.any(Object)));
  fireEvent.change(screen.getByLabelText('Show'), { target: { value: '20' } });
  await waitFor(() => expect(api).toHaveBeenLastCalledWith('/sheets?search=Budget&page=1&per_page=20', expect.any(Object)));
});
