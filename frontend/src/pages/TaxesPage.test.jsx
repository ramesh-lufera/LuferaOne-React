/* global jest, test, expect, afterEach */
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import TaxesPage from './TaxesPage';
import { api } from '../services/api';

jest.mock('../services/api', () => ({ api: jest.fn() }));
// eslint-disable-next-line react/prop-types
jest.mock('../masterLayout/MasterLayout', () => function MasterLayoutStub({ children }) { return <main>{children}</main>; });
jest.mock('@iconify/react/dist/iconify.js', () => ({ Icon: () => null }));
jest.mock('@iconify/react', () => ({ Icon: () => null }));
afterEach(() => { cleanup(); jest.clearAllMocks(); });
const tax = { id: 1, name: 'GST 18%', region: 'India', rate: '18.00', type: 'exclusive', is_default: true };
const list = (data = [tax]) => ({ data, total: data.length, last_page: 1, from: data.length ? 1 : 0, to: data.length });
function show() { render(<MemoryRouter><TaxesPage /></MemoryRouter>); }

test('opens the reference form, saves a tax, and refreshes the visible records', async () => {
  let saved = false;
  api.mockImplementation((path, options) => {
    if (options?.method === 'POST') { saved = true; return Promise.resolve({ message: 'Tax saved successfully.' }); }
    return Promise.resolve(list(saved ? [tax] : []));
  });
  show();
  await screen.findByText('No taxes found.');
  fireEvent.click(screen.getByRole('button', { name: /Add New Tax/ }));
  const dialog = await screen.findByRole('dialog', { name: 'Add New Tax' });
  expect(within(dialog).getByLabelText('Country / Region')).toHaveValue('India');
  fireEvent.change(screen.getByLabelText('Tax Name'), { target: { value: 'GST 18%' } });
  fireEvent.change(screen.getByLabelText('Rate (%)'), { target: { value: '18' } });
  fireEvent.click(screen.getByLabelText('Set as default tax'));
  fireEvent.click(screen.getByRole('button', { name: 'Save Tax' }));
  expect(await screen.findByText('Tax saved successfully.')).toBeInTheDocument();
  expect(await screen.findByRole('button', { name: 'Edit GST 18%' })).toBeInTheDocument();
  const call = api.mock.calls.find(([, options]) => options?.method === 'POST');
  expect(JSON.parse(call[1].body)).toEqual({ name: 'GST 18%', region: 'India', rate: '18', type: 'exclusive', is_default: true });
});

test('prefills edit fields and preserves input after a validation error for retry', async () => {
  let attempts = 0;
  api.mockImplementation((path, options) => {
    if (options?.method === 'PUT') {
      attempts += 1;
      return attempts === 1 ? Promise.reject(Object.assign(new Error('Invalid.'), { errors: { rate: ['Rate must be at most 100.'] } })) : Promise.resolve({ message: 'Tax updated successfully.' });
    }
    return Promise.resolve(list());
  });
  show();
  fireEvent.click(await screen.findByRole('button', { name: 'Edit GST 18%' }));
  expect(await screen.findByRole('dialog', { name: 'Edit Tax' })).toBeInTheDocument();
  expect(screen.getByLabelText('Tax Name')).toHaveValue('GST 18%');
  expect(screen.getByLabelText('Set as default tax')).toBeChecked();
  fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'inclusive' } });
  fireEvent.change(screen.getByLabelText('Rate (%)'), { target: { value: '12.5' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Tax' }));
  expect(await screen.findByText('Rate must be at most 100.')).toBeInTheDocument();
  expect(screen.getByLabelText('Rate (%)')).toHaveValue(12.5);
  expect(screen.getByLabelText('Type')).toHaveValue('inclusive');
  fireEvent.click(screen.getByRole('button', { name: 'Save Tax' }));
  expect(await screen.findByText('Tax updated successfully.')).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith('/taxes/1', expect.objectContaining({ method: 'PUT' }));
});

test('delete supports cancellation and retry and removes the row after success', async () => {
  let attempts = 0;
  let deleted = false;
  api.mockImplementation((path, options) => {
    if (options?.method === 'DELETE') {
      attempts += 1;
      if (attempts === 1) return Promise.reject(new Error('Unable to delete.'));
      deleted = true;
      return Promise.resolve({ message: 'Tax deleted successfully.' });
    }
    return Promise.resolve(list(deleted ? [] : [tax]));
  });
  show();
  fireEvent.click(await screen.findByRole('button', { name: 'Delete GST 18%' }));
  let dialog = await screen.findByRole('dialog', { name: 'Delete Tax' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(attempts).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: 'Delete GST 18%' }));
  dialog = await screen.findByRole('dialog', { name: 'Delete Tax' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Delete Tax' }));
  expect(await screen.findByText('Unable to delete.')).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Delete Tax' }));
  expect(await screen.findByText('Tax deleted successfully.')).toBeInTheDocument();
  expect(await screen.findByText('No taxes found.')).toBeInTheDocument();
});

test('search and page size are sent to the listing API and failed loads can retry', async () => {
  api.mockRejectedValueOnce(new Error('Tax list unavailable.')).mockResolvedValue(list());
  show();
  expect(await screen.findByText('Tax list unavailable.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  await screen.findByRole('button', { name: 'Edit GST 18%' });
  fireEvent.change(screen.getByLabelText('Search taxes'), { target: { value: 'India' } });
  await waitFor(() => expect(api).toHaveBeenCalledWith('/taxes?search=India&page=1&per_page=10', expect.anything()));
  fireEvent.change(screen.getByLabelText('Show'), { target: { value: '20' } });
  await waitFor(() => expect(api).toHaveBeenCalledWith('/taxes?search=India&page=1&per_page=20', expect.anything()));
});
