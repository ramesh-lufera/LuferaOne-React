/* global jest, test, expect, afterEach */
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import SheetCommentsPanel from './SheetCommentsPanel';
import { api } from '../services/api';

jest.mock('../services/api', () => ({ api: jest.fn() }));
window.matchMedia = (query) => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
afterEach(() => { cleanup(); jest.resetAllMocks(); });
const message = { id: 10, parent_id: null, body: 'Please review', user: { name: 'Alice' }, created_at: '2026-11-20T10:00:00Z' };
const endpoint = '/sheets/7/rows/task-a/comments';

test('loads saved messages, posts comments and opens an inline reply form', async () => {
  api.mockResolvedValueOnce({ comments: [message] }).mockResolvedValueOnce({ comment: { ...message, id: 11, body: 'New comment' } }).mockResolvedValueOnce({ comment: { ...message, id: 12, parent_id: 10, body: 'Reviewed' } });
  render(<SheetCommentsPanel sheetId="7" rowId="task-a" taskName="Planning" onClose={jest.fn()} />);
  expect(await screen.findByText('Please review')).toBeInTheDocument();
  expect(screen.getByText('Alice')).toBeVisible();
  fireEvent.change(screen.getByLabelText('Add a comment'), { target: { value: ' New comment ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send', exact: true }));
  await waitFor(() => expect(screen.getByLabelText('Add a comment')).toHaveValue(''));
  expect(await screen.findByText('New comment')).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith(endpoint, expect.objectContaining({ method: 'POST', body: JSON.stringify({ body: 'New comment', parent_id: null }) }));
  fireEvent.click(screen.getByRole('button', { name: 'Reply to message 10' }));
  fireEvent.change(screen.getByLabelText('Your reply'), { target: { value: 'Reviewed' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send Reply' }));
  expect(await screen.findByText('Reviewed')).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith(endpoint, expect.objectContaining({ method: 'POST', body: JSON.stringify({ body: 'Reviewed', parent_id: 10 }) }));
  await waitFor(() => expect(screen.queryByLabelText('Your reply')).not.toBeInTheDocument());
});

test('failed reply preserves the draft and can be retried', async () => {
  api.mockResolvedValueOnce({ comments: [message] }).mockRejectedValueOnce(new Error('Could not save reply.')).mockResolvedValueOnce({ comment: { ...message, id: 12, parent_id: 10, body: 'Try again' } });
  render(<SheetCommentsPanel sheetId="7" rowId="task-a" taskName="Planning" onClose={jest.fn()} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Reply to message 10' }));
  fireEvent.change(screen.getByLabelText('Your reply'), { target: { value: 'Try again' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send Reply' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not save reply.');
  expect(screen.getByLabelText('Your reply')).toHaveValue('Try again');
  fireEvent.click(screen.getByRole('button', { name: 'Send Reply' }));
  expect(await screen.findByText('Try again')).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByLabelText('Your reply')).not.toBeInTheDocument());
});
