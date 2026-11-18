/* global jest, test, expect, afterEach */
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import InvoiceAddLayer from './InvoiceAddLayer';
import InvoiceEditLayer from './InvoiceEditLayer';
import InvoicePreviewLayer from './InvoicePreviewLayer';
import InvoiceListLayer from './InvoiceListLayer';
import { api } from '../services/api';
jest.mock('../services/api', () => ({ api: jest.fn() }));
jest.mock('@iconify/react/dist/iconify.js', () => ({ Icon: () => null }));
jest.mock('uuid', () => ({ v4: () => '00000000-0000-4000-8000-000000000001' }));
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});
const invoice = {
  id: 4,
  invoice_number: 'INV-0001-2026',
  customer_name: 'Saved Customer',
  customer_email: '',
  customer_phone: '',
  customer_address: 'Saved address',
  issued_on: '2026-11-17',
  due_on: '',
  notes: '',
  logo_url: '/historical-logo',
  items: [
    {
      description: 'Service',
      quantity: 2,
      unit: 'PC',
      unit_price: '19.99',
      line_total_cents: 3998,
    },
  ],
  total_cents: 3998,
};

test('creates through the billing page and reuses the request key on a failed save retry', async () => {
  let attempts = 0;
  api.mockImplementation(async (path, options) => {
    if (!options?.method)
      return { next_invoice_number: 'INV-0001-2026', logo_url: null };
    attempts += 1;
    if (attempts === 1) throw new Error('Connection interrupted.');
    return { invoice: { ...invoice, invoice_number: 'INV-0002-2026' } };
  });
  render(
    <MemoryRouter>
      <InvoiceAddLayer />
    </MemoryRouter>,
  );
  await screen.findByLabelText(/Customer Name/);
  fireEvent.change(screen.getByLabelText(/Customer Name/), {
    target: { value: 'New Customer' },
  });
  fireEvent.change(screen.getByLabelText('Item 1'), {
    target: { value: 'Service' },
  });
  fireEvent.change(screen.getByLabelText('Unit Price 1'), {
    target: { value: '19.99' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save Invoice' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Connection interrupted.',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save Invoice' }));
  expect(
    await screen.findByText('Invoice INV-0002-2026 created successfully.'),
  ).toBeInTheDocument();
  const saves = api.mock.calls.filter(([, options]) => options?.method);
  expect(JSON.parse(saves[0][1].body).request_id).toBe(
    JSON.parse(saves[1][1].body).request_id,
  );
  expect(JSON.parse(saves[1][1].body)).not.toHaveProperty('invoice_number');
  expect(screen.getByRole('link', { name: 'View Invoice' })).toHaveAttribute(
    'href',
    '/invoice-preview?id=4',
  );
});

test('edits saved invoice content while keeping its original number and historical logo', async () => {
  api.mockImplementation(async (path, options) =>
    options?.method ? { invoice } : { invoice },
  );
  render(
    <MemoryRouter initialEntries={['/invoice-edit?id=4']}>
      <InvoiceEditLayer />
    </MemoryRouter>,
  );
  expect(await screen.findByDisplayValue('Saved Customer')).toBeInTheDocument();
  expect(screen.getByText('INV-0001-2026')).toBeInTheDocument();
  expect(screen.getByAltText('Invoice logo')).toHaveAttribute(
    'src',
    '/historical-logo',
  );
  fireEvent.change(screen.getByLabelText('Unit Price 1'), {
    target: { value: '29.99' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Update Invoice' }));
  await screen.findByText('Invoice INV-0001-2026 updated successfully.');
  const [path, options] = api.mock.calls.find(([, options]) => options?.method);
  expect(path).toBe('/invoices/4');
  expect(options.method).toBe('PUT');
  expect(JSON.parse(options.body)).not.toHaveProperty('invoice_number');
  expect(JSON.parse(options.body)).not.toHaveProperty('request_id');
  expect(JSON.parse(options.body).items[0].unit_price).toBe('29.99');
});

test('list and preview display the persisted invoice number with working record links', async () => {
  api.mockResolvedValue({
    data: [invoice],
    from: 1,
    to: 1,
    total: 1,
    last_page: 1,
  });
  const list = render(
    <MemoryRouter>
      <InvoiceListLayer />
    </MemoryRouter>,
  );
  expect(await screen.findByText('INV-0001-2026')).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'View INV-0001-2026' }),
  ).toHaveAttribute('href', '/invoice-preview?id=4');
  expect(
    screen.getByRole('link', { name: 'Edit INV-0001-2026' }),
  ).toHaveAttribute('href', '/invoice-edit?id=4');
  list.unmount();
  api.mockResolvedValue({ invoice });
  render(
    <MemoryRouter initialEntries={['/invoice-preview?id=4']}>
      <InvoicePreviewLayer />
    </MemoryRouter>,
  );
  expect(await screen.findByText('INV-0001-2026')).toBeInTheDocument();
  expect(screen.getByText('Saved Customer')).toBeInTheDocument();
  expect(screen.getByText('Total 39.98')).toBeInTheDocument();
  expect(screen.getByAltText('Invoice logo')).toHaveAttribute(
    'src',
    '/historical-logo',
  );
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith('/invoices/4', expect.any(Object)),
  );
});
