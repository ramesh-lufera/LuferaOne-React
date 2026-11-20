/* global jest, test, expect, afterEach */
/* eslint-disable react/prop-types */
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
function row(id, value, extra = {}) { return [{ value: '', rowId: id, ...extra }, { value, bold: true }, { value: '' }, { value: '' }]; }
async function show(rows) {
  api.mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 0, content: { rows } } });
  render(<MemoryRouter initialEntries={['/sheet?id=7']}><SheetEditorPage /></MemoryRouter>);
  await screen.findByRole('button', { name: 'More options for task row 1' });
}
async function action(index, label) {
  fireEvent.click(screen.getByRole('button', { name: `More options for task row ${index}` }));
  fireEvent.click(await screen.findByRole('menuitem', { name: label, exact: true }));
}
async function savedRows() {
  api.mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 1 }, message: 'Sheet saved successfully.' });
  fireEvent.click(screen.getByRole('button', { name: 'Save Sheet' }));
  await screen.findByText('Sheet saved successfully.');
  const request = api.mock.calls.filter(([, options]) => options?.method === 'PUT').pop();
  return JSON.parse(request[1].body).content.rows;
}

test('inserts above and below the respective row and supports undo', async () => {
  await show([row('a', 'Alpha'), row('b', 'Beta')]);
  await action(2, 'Insert Above');
  expect(screen.getByLabelText('Column Field 1 row 2')).toHaveValue('');
  expect(screen.getByLabelText('Column Field 1 row 3')).toHaveValue('Beta');
  await action(1, 'Insert Below');
  expect(screen.getAllByRole('checkbox')).toHaveLength(5);
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(screen.getAllByRole('checkbox')).toHaveLength(4);
});

test('copies text and formatting using a new identity while cutting moves the original identity', async () => {
  await show([row('a', 'Alpha'), row('b', 'Beta')]);
  await action(1, 'Copy Row');
  await action(2, 'Paste Row');
  expect(screen.getByLabelText('Column Field 1 row 3')).toHaveValue('Alpha');
  expect(screen.getByLabelText('Column Field 1 row 3')).toHaveStyle({ fontWeight: 'bold' });
  await action(1, 'Cut Row');
  await action(2, 'Paste Row');
  const rows = await savedRows();
  expect(rows.map((cells) => cells[1].value)).toEqual(['Beta', 'Alpha', 'Alpha']);
  expect(rows[1][0].rowId).toBe('a');
  expect(rows[2][0].rowId).not.toBe('a');
  expect(new Set(rows.map((cells) => cells[0].rowId)).size).toBe(3);
});

test('deletes the respective row and keeps a blank row when deleting the last row', async () => {
  await show([row('a', 'Alpha'), row('b', 'Beta')]);
  await action(1, 'Delete Row');
  expect(screen.getByLabelText('Column Field 1 row 1')).toHaveValue('Beta');
  await action(1, 'Delete Row');
  expect(screen.getByLabelText('Column Field 1 row 1')).toHaveValue('');
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
});

test('locked rows disable edits, cut and deletion, and can be unlocked', async () => {
  const locked = row('a', 'Alpha', { locked: true });
  await show([locked, row('b', 'Beta')]);
  expect(screen.getByLabelText('Column Field 1 row 1')).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'More options for task row 1' }));
  expect(await screen.findByRole('menuitem', { name: 'Delete Row' })).toBeDisabled();
  expect(screen.getByRole('menuitem', { name: 'Cut Row' })).toBeDisabled();
  api.mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 1 }, message: 'Sheet saved successfully.' });
  fireEvent.click(screen.getByRole('menuitem', { name: 'Unlock' }));
  await waitFor(() => expect(screen.getByLabelText('Column Field 1 row 1')).toBeEnabled());
  const request = api.mock.calls.find(([, options]) => options?.method === 'PUT');
  expect(JSON.parse(request[1].body).content.rows[0][0].locked).toBe(false);
});

test('reminder menu saves its time and note with the stable row id', async () => {
  await show([row('a', 'Alpha')]);
  await action(1, 'Reminder');
  const date = new Date(Date.now() + 86400000);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  fireEvent.change(screen.getByLabelText('Date and time'), { target: { value: local } });
  fireEvent.change(screen.getByLabelText('Reminder note'), { target: { value: 'Review Alpha' } });
  api.mockResolvedValueOnce({ sheet: { id: 7, name: 'Tasks', version: 1 }, message: 'Sheet saved successfully.' });
  fireEvent.click(screen.getByRole('button', { name: 'Save reminder' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  const request = api.mock.calls.find(([, options]) => options?.method === 'PUT');
  const task = JSON.parse(request[1].body).content.rows[0][0];
  expect(task.rowId).toBe('a'); expect(task.reminderNote).toBe('Review Alpha'); expect(task.reminderAt).toBe(new Date(local).toISOString());
});

test('printing renders only the selected row for the browser print dialog', async () => {
  const originalPrint = window.print;
  window.print = jest.fn();
  try {
    await show([row('a', 'Alpha'), row('b', 'Beta')]);
    await action(2, 'Print');
    expect(document.querySelector('.sheet-print-row')).toHaveTextContent('Beta');
    expect(document.querySelector('.sheet-print-row')).not.toHaveTextContent('Alpha');
    await waitFor(() => expect(window.print).toHaveBeenCalledTimes(1));
  } finally { window.print = originalPrint; }
});
