/* global jest, afterEach, test, expect */
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivityLogLayer from './ActivityLogLayer';
import { api } from '../services/api';
jest.mock('../services/api', () => ({ api: jest.fn() }));
afterEach(() => { cleanup(); jest.clearAllMocks(); });
function mockApi() {
  api.mockImplementation(async (path) => {
    if (path === '/activity-logs/filters') return { modules: ['Authentication'], actions: ['Sign In'], users: [{ value: 'id:1', name: 'actor' }], timezone: 'Asia/Kolkata' };
    const params = new URLSearchParams(path.split('?')[1]);
    return { draw: Number(params.get('draw')), recordsTotal: 21, recordsFiltered: 21,
      data: [{ serial: Number(params.get('start')) + 1, action: 'Sign In', module: 'Authentication', description: '<script>unsafe</script>', user_name: 'actor', date_time: '13 Nov 2026 12:30:00' }] };
  });
}
test('uses template server controls and escapes database content', async () => {
  mockApi(); render(<ActivityLogLayer />);
  expect(await screen.findByText('Actor', { selector: 'td' })).toBeInTheDocument();
  expect(screen.getByText('<script>unsafe</script>')).toBeInTheDocument();
  expect(document.querySelector('tbody script')).toBeNull();
  expect(screen.getByRole('columnheader', { name: /Date & Time/ })).toBeInTheDocument();
  expect(screen.getByText('13 Nov 2026 12:30:00')).toBeInTheDocument();
  await screen.findByRole('option', { name: 'Actor' });
  fireEvent.change(screen.getByLabelText('Module'), { target: { value: 'Authentication' } });
  fireEvent.change(screen.getByLabelText('Action'), { target: { value: 'Sign In' } });
  fireEvent.change(screen.getByLabelText('Performed by'), { target: { value: 'id:1' } });
  fireEvent.change(screen.getByLabelText('From date'), { target: { value: '2026-11-13' } });
  fireEvent.click(screen.getByText('Apply filters'));
  await waitFor(() => expect(api.mock.calls.some(([path]) => path.includes('module=Authentication') && path.includes('action=Sign+In') && path.includes('user=id%3A1') && path.includes('date_from=2026-11-13'))).toBe(true));
  fireEvent.click(document.querySelector('th:nth-child(2)'));
  await waitFor(() => expect(api.mock.calls.some(([path]) => path.includes('order%5B0%5D%5Bcolumn%5D=1'))).toBe(true));
  fireEvent.click(document.querySelector('.dt-paging-button.next'));
  await waitFor(() => expect(api.mock.calls.some(([path]) => path.includes('start=10'))).toBe(true));
  fireEvent.input(document.querySelector('input[type="search"]'), { target: { value: 'Actor' } });
  await waitFor(() => expect(api.mock.calls.some(([path]) => path.includes('search%5Bvalue%5D=Actor'))).toBe(true));
  fireEvent.click(screen.getByText('Reset'));
  await waitFor(() => expect(api.mock.calls.at(-1)[0]).not.toContain('module=Authentication'));
});
test('recovers from API errors using retry', async () => {
  api.mockRejectedValue(new Error('Connection failed'));
  render(<ActivityLogLayer />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Connection failed');
  mockApi(); fireEvent.click(screen.getByText('Retry'));
  expect(await screen.findByText('Actor', { selector: 'td' })).toBeInTheDocument();
});
