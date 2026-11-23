/* global jest, test, expect, afterEach */
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SheetImportModal from './SheetImportModal';
import { api } from '../services/api';
jest.mock('../services/api', () => ({ api: jest.fn() }));
afterEach(() => { cleanup(); jest.resetAllMocks(); });

test('imports CSV as a new sheet and preserves a failed import for retry', async () => {
  const onImported = jest.fn();
  const beforeImport = jest.fn().mockResolvedValue(true);
  api.mockRejectedValueOnce(new Error('Please retry.')).mockResolvedValueOnce({ sheet: { id: 99 } });
  render(<SheetImportModal onClose={jest.fn()} beforeImport={beforeImport} onImported={onImported} />);
  fireEvent.change(screen.getByLabelText('CSV or Excel file'), { target: { files: [new File(['Name,Count\nAlpha,12'], 'Budget.csv', { type: 'text/csv' })] } });
  expect(await screen.findByLabelText('Sheet name')).toHaveValue('Budget');
  fireEvent.click(screen.getByRole('button', { name: 'Import', exact: true }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Please retry.');
  expect(screen.getByLabelText('Sheet name')).toHaveValue('Budget');
  fireEvent.click(screen.getByRole('button', { name: 'Import', exact: true }));
  await waitFor(() => expect(onImported).toHaveBeenCalledWith({ id: 99 }));
  const body = JSON.parse(api.mock.calls[0][1].body);
  expect(api.mock.calls[0][0]).toBe('/sheets/import');
  expect(body.content.headers).toEqual(['Tasks', 'Name', 'Count', 'Column Field 3']);
  expect(body.content.rows[0][1].value).toBe('Alpha');
  expect(beforeImport).toHaveBeenCalledTimes(2);
});
