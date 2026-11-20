/* eslint-disable react/prop-types */
/* global jest, test, expect, afterEach */
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SheetEditorPage from './SheetEditorPage';
import { api } from '../services/api';
jest.mock('../services/api', () => ({ api: jest.fn() }));
jest.mock('../masterLayout/MasterLayout', () => function MockLayout(props) { return <div>{props.children}</div>; });
jest.mock('../components/ModulePageHeader', () => function MockHeader(props) { return <h1>{props.title}</h1>; });
window.matchMedia = (query) => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
afterEach(() => { cleanup(); jest.resetAllMocks(); });
test('the attachment icon opens files for the respective row', async () => {
  const rows = [Array.from({ length: 4 }, () => ({ value: '' }))];
  rows[0][0] = { value: 'Planning', rowId: 'task-files' };
  api.mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 0, content: { rows } } })
    .mockResolvedValueOnce({ attachments: [{ id: 1, name: 'plan.pdf', mime_type: 'application/pdf', created_at: '2026-11-20T10:00:00Z' }] });
  render(<MemoryRouter initialEntries={['/sheet?id=7']}><SheetEditorPage /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: 'Add or view attachments for task row 1' }));
  expect(await screen.findByRole('button', { name: 'Download plan.pdf' })).toBeInTheDocument();
  expect(screen.getByText('Row 1')).toBeInTheDocument();
  expect(api).toHaveBeenLastCalledWith('/sheets/7/rows/task-files/attachments', expect.any(Object));
});
test('comments stay linked to the task after an earlier row is removed and saved', async () => {
  const rows = [Array.from({ length: 4 }, () => ({ value: '' })), Array.from({ length: 4 }, () => ({ value: '' }))];
  rows[0][0] = { value: 'First', rowId: 'task-a' };
  rows[1][0] = { value: 'Second', rowId: 'task-b' };
  api.mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 0, content: { rows } } })
    .mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 1, content: { rows: [rows[1]] } }, message: 'Sheet saved successfully.' })
    .mockResolvedValueOnce({ comments: [{ id: 20, parent_id: null, body: 'Second task comment', user: { name: 'Alice' }, created_at: '2026-11-20T10:00:00Z' }] });
  render(<MemoryRouter initialEntries={['/sheet?id=7']}><SheetEditorPage /></MemoryRouter>);
  await screen.findByDisplayValue('Second');
  fireEvent.click(screen.getByLabelText('Select row 1'));
  fireEvent.click(screen.getByRole('button', { name: 'Remove selected rows' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add or view comments for task row 1' }));
  expect(await screen.findByText('Second task comment')).toBeInTheDocument();
  expect(api).toHaveBeenLastCalledWith('/sheets/7/rows/task-b/comments', expect.any(Object));
  const request = api.mock.calls.find(([, opts]) => opts?.method === 'PUT');
  expect(JSON.parse(request[1].body).content.rows[0][0].rowId).toBe('task-b');
});
test('opens the respective sheet and saves cell text and formatting', async () => {
  api.mockResolvedValueOnce({ sheet: { id: 7, name: 'Staff Tasks', version: 0, content: null } });
  api.mockResolvedValueOnce({ sheet: { id: 7, name: 'Staff Tasks', version: 1 }, message: 'Sheet saved successfully.' });
  render(<MemoryRouter initialEntries={['/sheet?id=7']}><SheetEditorPage /></MemoryRouter>);
  await screen.findByRole('heading', { name: 'Staff Tasks' });
  expect(screen.getAllByRole('columnheader').slice(1).map((header) => header.textContent.replace('⋮', ''))).toEqual(['Tasks', 'Column Field 1', 'Column Field 2', 'Column Field 3']);
  const input = screen.getByLabelText('Column Field 1 row 1');
  fireEvent.focus(input); fireEvent.change(input, { target: { value: 'Alice' } });
  fireEvent.click(screen.getByRole('button', { name: 'bold' }));
  expect(input).toHaveStyle({ fontWeight: 'bold' });
  fireEvent.click(screen.getByRole('button', { name: 'Save Sheet', exact: true }));
  await screen.findByText('Sheet saved successfully.');
  const request = api.mock.calls.find(([, opts]) => opts?.method === 'PUT');
  expect(request[0]).toBe('/sheets/7');
  expect(JSON.parse(request[1].body).content.rows[0][1]).toEqual({ value: 'Alice', bold: true });
});
test('saved cells reload, undo and redo edits, and failed saves preserve the draft', async () => {
  const rows = [Array.from({ length: 5 }, () => ({ value: '' }))]; rows[0][0] = { value: 'Planning' };
  api.mockResolvedValueOnce({ sheet: { id: 3, name: 'Budget', version: 2, content: { rows } } }).mockRejectedValueOnce(new Error('Reload before saving again.'));
  render(<MemoryRouter initialEntries={['/sheet?id=3']}><SheetEditorPage /></MemoryRouter>);
  const cell = await screen.findByDisplayValue('Planning');
  fireEvent.change(cell, { target: { value: 'Review' } });
  fireEvent.click(screen.getByRole('button', { name: 'Undo' })); expect(cell).toHaveValue('Planning');
  fireEvent.click(screen.getByRole('button', { name: 'Redo' })); expect(cell).toHaveValue('Review');
  fireEvent.click(screen.getByRole('button', { name: 'Save Sheet', exact: true }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Reload before saving again.'));
  expect(cell).toHaveValue('Review');
});
