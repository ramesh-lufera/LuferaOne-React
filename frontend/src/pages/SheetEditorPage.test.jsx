/* eslint-disable react/prop-types */
/* global jest, test, expect, afterEach */
import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SheetEditorPage from './SheetEditorPage';
import { api } from '../services/api';
let mockDragEnd;
jest.mock('@dnd-kit/core', () => {
  const actual = jest.requireActual('@dnd-kit/core');
  return { ...actual, DndContext: function MockDndContext(props) { mockDragEnd = props.onDragEnd; return <actual.DndContext {...props} />; } };
});
jest.mock('../services/api', () => ({ api: jest.fn() }));
jest.mock('../masterLayout/MasterLayout', () => function MockLayout(props) { return <div>{props.children}</div>; });
jest.mock('../components/ModulePageHeader', () => function MockHeader(props) { return <h1>{props.title}</h1>; });
window.matchMedia = (query) => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
afterEach(() => { cleanup(); jest.resetAllMocks(); });
test('highlights only icons whose row has records and updates after adding a comment', async () => {
  const rows = [Array.from({ length: 4 }, () => ({ value: '' })), Array.from({ length: 4 }, () => ({ value: '' }))];
  rows[0][0].rowId = 'task-a'; rows[1][0].rowId = 'task-b';
  api.mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 0, content: { rows } }, row_activity: { comments: { 'task-a': 2 }, attachments: { 'task-b': 1 } } })
    .mockResolvedValueOnce({ comments: [] })
    .mockResolvedValueOnce({ comment: { id: 1, parent_id: null, body: 'Hello', user: { name: 'Alice' }, created_at: '2026-11-20T10:00:00Z' } });
  render(<MemoryRouter initialEntries={['/sheet?id=7']}><SheetEditorPage /></MemoryRouter>);
  const firstComments = await screen.findByRole('button', { name: 'Add or view comments for task row 1' });
  expect(firstComments).toHaveClass('sheet-task-has-records');
  expect(firstComments).toHaveAttribute('title', 'Add or view comments (2)');
  expect(screen.getByRole('button', { name: 'Add or view attachments for task row 1' })).not.toHaveClass('sheet-task-has-records');
  expect(screen.getByRole('button', { name: 'Add or view attachments for task row 2' })).toHaveClass('sheet-task-has-records');
  const secondComments = screen.getByRole('button', { name: 'Add or view comments for task row 2' });
  expect(secondComments).not.toHaveClass('sheet-task-has-records');
  fireEvent.click(secondComments);
  await screen.findByText('No comments yet.');
  fireEvent.change(screen.getByLabelText('Add a comment'), { target: { value: 'Hello' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }));
  await waitFor(() => expect(secondComments).toHaveClass('sheet-task-has-records'));
});
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
test('column menu adds, renames, deletes and undoes columns and saves their headers', async () => {
  const rows = [[{ value: '', rowId: 'task-a' }, { value: 'Keep me' }, { value: '' }, { value: '' }]];
  api.mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 0, content: { rows } } })
    .mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 1 }, message: 'Saved columns.' });
  render(<MemoryRouter initialEntries={['/sheet?id=7']}><SheetEditorPage /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: 'Column 2 options' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Add column' }));
  fireEvent.change(screen.getByLabelText('Column name'), { target: { value: 'Owner' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add', exact: true }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByLabelText('Owner row 1')).toHaveValue('');
  expect(screen.getByLabelText('Column Field 1 row 1')).toHaveValue('Keep me');
  fireEvent.click(screen.getByRole('button', { name: 'Column 3 options' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Rename column' }));
  fireEvent.change(screen.getByLabelText('Column name'), { target: { value: 'Assignee' } });
  fireEvent.click(screen.getByRole('button', { name: 'Rename', exact: true }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByLabelText('Assignee row 1')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Column 2 options' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: 'Delete column' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.queryByDisplayValue('Keep me')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(screen.getByDisplayValue('Keep me')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Redo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save Sheet', exact: true }));
  await screen.findByText('Saved columns.');
  const request = api.mock.calls.find(([, opts]) => opts?.method === 'PUT');
  expect(JSON.parse(request[1].body).content.headers).toEqual(['Tasks', 'Assignee', 'Column Field 2', 'Column Field 3']);
});
test('auto-saves the latest edits after typing stops and shows failures without losing the draft', async () => {
  const rows = [[{ value: '', rowId: 'task-a' }, { value: '' }, { value: '' }, { value: '' }]];
  api.mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 0, content: { rows } } })
    .mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 1 }, message: 'Auto-saved.' })
    .mockRejectedValueOnce(new Error('Connection lost.'));
  render(<MemoryRouter initialEntries={['/sheet?id=7']}><SheetEditorPage /></MemoryRouter>);
  const input = await screen.findByLabelText('Column Field 1 row 1');
  fireEvent.change(input, { target: { value: 'Draft' } });
  fireEvent.change(input, { target: { value: 'Final edit' } });
  await screen.findByText(/All changes saved/, {}, { timeout: 3000 });
  expect(screen.queryByText('Auto-saved.')).not.toBeInTheDocument();
  const updates = api.mock.calls.filter(([, opts]) => opts?.method === 'PUT');
  expect(updates).toHaveLength(1);
  expect(JSON.parse(updates[0][1].body).content.rows[0][1].value).toBe('Final edit');
  fireEvent.change(input, { target: { value: 'Keep this draft' } });
  await screen.findByText('Connection lost.', { exact: false }, { timeout: 3000 });
  expect(input).toHaveValue('Keep this draft');
  expect(screen.getByText(/Auto-save failed/)).toBeInTheDocument();
  expect(JSON.parse(api.mock.calls.filter(([, opts]) => opts?.method === 'PUT')[1][1].body).version).toBe(1);
});

test('dragging reorders headers and cell formatting together and auto-saves, keeping Tasks fixed', async () => {
  const rows = [[{ value: '', rowId: 'task-a' }, { value: 'Alice', bold: true }, { value: 'Review' }, { value: '' }]];
  api.mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 0, content: { rows } } })
    .mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 1 }, message: 'Order saved.' });
  render(<MemoryRouter initialEntries={['/sheet?id=7']}><SheetEditorPage /></MemoryRouter>);
  await screen.findByDisplayValue('Alice');
  act(() => mockDragEnd({ active: { id: 'column-1' }, over: { id: 'column-2' } }));
  expect(screen.getAllByRole('columnheader').slice(1).map((header) => header.textContent)).toEqual(['Tasks', 'Column Field 2', 'Column Field 1', 'Column Field 3']);
  expect(screen.getByLabelText('Column Field 1 row 1')).toHaveValue('Alice');
  expect(screen.getByLabelText('Column Field 1 row 1')).toHaveStyle({ fontWeight: 'bold' });
  act(() => mockDragEnd({ active: { id: 'column-2' }, over: { id: 'column-0' } }));
  await screen.findByText(/All changes saved/, {}, { timeout: 3000 });
  expect(screen.queryByText('Order saved.')).not.toBeInTheDocument();
  const request = api.mock.calls.find(([, opts]) => opts?.method === 'PUT');
  const content = JSON.parse(request[1].body).content;
  expect(content.headers).toEqual(['Tasks', 'Column Field 2', 'Column Field 1', 'Column Field 3']);
  expect(content.rows[0].map((cell) => cell.value)).toEqual(['', 'Review', 'Alice', '']);
  expect(content.rows[0][0].rowId).toBe('task-a');
});
test('dragging a header edge resizes its column and auto-saves the width with undo support', async () => {
  const previousPointerEvent = window.PointerEvent;
  window.PointerEvent = MouseEvent;
  const rows = [[{ value: '', rowId: 'task-a' }, { value: 'Alice' }, { value: '' }, { value: '' }]];
  api.mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 0, content: { rows, columnWidths: [180, 300, 260, 260] } } })
    .mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 1 }, message: 'Width saved.' });
  try {
    render(<MemoryRouter initialEntries={['/sheet?id=7']}><SheetEditorPage /></MemoryRouter>);
    const handle = await screen.findByRole('button', { name: 'Resize column 2: Column Field 1' });
    handle.setPointerCapture = jest.fn(); handle.releasePointerCapture = jest.fn();
    const column = document.querySelectorAll('col')[2];
    expect(column.style.width).toBe('300px');
    fireEvent.pointerDown(handle, { clientX: 300, button: 0 });
    fireEvent.pointerMove(handle, { clientX: 380 });
    expect(column.style.width).toBe('380px');
    fireEvent.pointerUp(handle, { clientX: 380 });
    await screen.findByText(/All changes saved/, {}, { timeout: 3000 });
  expect(screen.queryByText('Width saved.')).not.toBeInTheDocument();
    const update = api.mock.calls.find(([, opts]) => opts?.method === 'PUT');
    expect(JSON.parse(update[1].body).content.columnWidths).toEqual([180, 380, 260, 260]);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(column.style.width).toBe('300px');
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }));
    expect(column.style.width).toBe('380px');
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(column.style.width).toBe('370px');
  } finally { window.PointerEvent = previousPointerEvent; }
});
