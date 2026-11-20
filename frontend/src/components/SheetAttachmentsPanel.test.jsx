/* global jest, test, expect, afterEach */
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import SheetAttachmentsPanel from './SheetAttachmentsPanel';
import { api } from '../services/api';

jest.mock('../services/api', () => ({ api: jest.fn() }));
window.matchMedia = (query) => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
afterEach(() => { cleanup(); jest.resetAllMocks(); });
const attachment = { id: 4, name: 'report.pdf', mime_type: 'application/pdf', user: { id: 1, name: 'Alice' }, created_at: '2026-11-20T10:00:00Z' };
const endpoint = '/sheets/7/rows/task-a/attachments';

test('shows existing attachments and uploads a file linked to the task row', async () => {
  api.mockResolvedValueOnce({ attachments: [attachment] }).mockResolvedValueOnce({ attachment: { ...attachment, id: 5, name: 'budget.pdf' }, message: 'Attachment uploaded successfully.' });
  render(<SheetAttachmentsPanel sheetId="7" rowId="task-a" rowNumber={2} onClose={jest.fn()} />);
  expect(await screen.findByRole('button', { name: 'Download report.pdf' })).toBeInTheDocument();
  expect(screen.getByText('Row 2')).toBeInTheDocument();
  expect(screen.getByText('Uploaded by Alice')).toBeInTheDocument();
  const file = new File(['budget'], 'budget.pdf', { type: 'application/pdf' });
  fireEvent.change(screen.getByLabelText('Choose attachment'), { target: { files: [file] } });
  fireEvent.click(screen.getByRole('button', { name: 'Upload', exact: true }));
  expect(await screen.findByRole('button', { name: 'Download budget.pdf' })).toBeInTheDocument();
  const request = api.mock.calls.find(([, options]) => options.method === 'POST');
  expect(request[0]).toBe(endpoint);
  expect(request[1].body.get('file')).toBe(file);
  expect(request[1].headers).toBeUndefined();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Upload', exact: true })).toBeDisabled());
});

test('failed uploads preserve the selected file for retry', async () => {
  api.mockResolvedValueOnce({ attachments: [] }).mockRejectedValueOnce(new Error('Upload failed.')).mockResolvedValueOnce({ attachment, message: 'Attachment uploaded successfully.' });
  render(<SheetAttachmentsPanel sheetId="7" rowId="task-a" rowNumber={1} onClose={jest.fn()} />);
  await screen.findByText('No attachments yet.');
  fireEvent.change(screen.getByLabelText('Choose attachment'), { target: { files: [new File(['report'], 'report.pdf')] } });
  fireEvent.click(screen.getByRole('button', { name: 'Upload', exact: true }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Upload failed.');
  fireEvent.click(screen.getByRole('button', { name: 'Upload', exact: true }));
  expect(await screen.findByRole('button', { name: 'Download report.pdf' })).toBeInTheDocument();
  expect(api.mock.calls.filter(([, options]) => options.method === 'POST')).toHaveLength(2);
});

test('loads protected image previews and releases the object URL on close', async () => {
  URL.createObjectURL = jest.fn(() => 'blob:preview');
  URL.revokeObjectURL = jest.fn();
  api.mockResolvedValueOnce({ attachments: [{ ...attachment, name: 'photo.png', mime_type: 'image/png' }] }).mockResolvedValueOnce(new Blob(['image'], { type: 'image/png' }));
  const { unmount } = render(<SheetAttachmentsPanel sheetId="7" rowId="task-a" rowNumber={1} onClose={jest.fn()} />);
  expect(await screen.findByRole('img', { name: 'Preview of photo.png' })).toHaveAttribute('src', 'blob:preview');
  expect(api).toHaveBeenCalledWith(`${endpoint}/4/file?preview=1`, expect.objectContaining({ responseType: 'blob', signal: expect.anything() }));
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
});
