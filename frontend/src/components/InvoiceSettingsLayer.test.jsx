/* global jest, test, expect, beforeEach, afterEach */
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import InvoiceSettingsLayer from './InvoiceSettingsLayer';
import { api } from '../services/api';
jest.mock('../services/api', () => ({ api: jest.fn() }));
const settings = {
  prefix: 'INV-',
  series: '0001',
  suffix: '-2026',
  version: 0,
  logo_url: null,
  next_invoice_number: 'INV-0001-2026',
};
beforeEach(() => {
  URL.createObjectURL = jest.fn(() => 'blob:invoice-logo');
  URL.revokeObjectURL = jest.fn();
});
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

test('loads saved formatting, uploads a logo and updates the settings including logo removal', async () => {
  api.mockImplementation(async (path, options) => {
    if (!options?.method) return { settings };
    const removed = options.body.get('remove_logo') === '1';
    return {
      message: 'Invoice settings updated successfully.',
      settings: {
        ...settings,
        series: options.body.get('series'),
        version: removed ? 2 : 1,
        logo_url: removed ? null : '/signed-logo',
      },
    };
  });
  render(<InvoiceSettingsLayer />);
  expect(await screen.findByLabelText('Series')).toHaveValue('0001');
  expect(screen.getByText('INV-0001-2026')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Series'), {
    target: { value: '0020' },
  });
  const image = new File(['logo'], 'invoice.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('Invoice Logo'), {
    target: { files: [image] },
  });
  expect(await screen.findByAltText('Invoice logo preview')).toHaveAttribute(
    'src',
    'blob:invoice-logo',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));
  await screen.findByText('Invoice settings updated successfully.');
  const save = api.mock.calls.find(
    ([, options]) => options?.method === 'POST',
  )[1];
  expect(save.body.get('series')).toBe('0020');
  expect(save.body.get('_method')).toBe('PUT');
  expect(save.body.get('version')).toBe('0');
  expect(save.body.get('logo')).toBe(image);
  expect(screen.getByLabelText('Series')).toHaveValue('0020');
  fireEvent.click(screen.getByRole('button', { name: 'Remove Logo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));
  await waitFor(() =>
    expect(api.mock.calls.filter(([, options]) => options?.method).length).toBe(
      2,
    ),
  );
  const remove = api.mock.calls.filter(([, options]) => options?.method)[1][1];
  expect(remove.body.get('remove_logo')).toBe('1');
  expect(remove.body.get('version')).toBe('1');
  await waitFor(() =>
    expect(
      screen.queryByAltText('Invoice logo preview'),
    ).not.toBeInTheDocument(),
  );
});

test('keeps the draft after a stale-settings conflict and supports reloading the current counter', async () => {
  let reads = 0;
  api.mockImplementation(async (path, options) => {
    if (options?.method)
      throw Object.assign(
        new Error('Invoice settings changed while you were editing.'),
        { status: 409 },
      );
    reads += 1;
    return {
      settings:
        reads === 1 ? settings : { ...settings, series: '0005', version: 4 },
    };
  });
  render(<InvoiceSettingsLayer />);
  await screen.findByLabelText('Prefix');
  fireEvent.change(screen.getByLabelText('Prefix'), {
    target: { value: 'BILL-' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Invoice settings changed while you were editing.',
  );
  expect(screen.getByLabelText('Prefix')).toHaveValue('BILL-');
  fireEvent.click(
    screen.getByRole('button', { name: 'Reload saved settings' }),
  );
  expect(await screen.findByLabelText('Series')).toHaveValue('0005');
  expect(screen.getByLabelText('Prefix')).toHaveValue('INV-');
});
