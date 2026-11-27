/* global jest, test, expect, afterEach, beforeEach */
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import MarketplacePage from './MarketplacePage';
import ExternalMarketplacePage from './ExternalMarketplacePage';
import { api } from '../services/api';
import { getToken } from '../helper/auth';

jest.mock('../services/api', () => ({ api: jest.fn() }));
jest.mock('../helper/useCompanyBranding', () => () => ({}));
jest.mock('../helper/auth', () => ({ apiUrl: '/api', getToken: jest.fn(() => 'test-token') }));
jest.mock('../components/SignInLayer', () => function SignIn() { return <div>Sign in form</div>; });
// eslint-disable-next-line react/prop-types
jest.mock('../masterLayout/MasterLayout', () => function Layout({ children }) { return <main>{children}</main>; });
jest.mock('@iconify/react', () => ({ Icon: () => null }));
beforeEach(() => getToken.mockReturnValue('test-token'));
afterEach(() => { cleanup(); jest.clearAllMocks(); });
const data = { sliders: [{ id: 1, category_id: 7, category_name: 'Software', type: 'product', slider: null }, { id: 2, category_id: 8, category_name: 'Hosting', type: 'package', slider: 2 }], banners: [], categories: [{ id: 7, name: 'Software', type: 'product' }, { id: 8, name: 'Hosting', type: 'package' }, { id: 9, name: 'Office', type: 'product' }] };
function show() {
  api.mockImplementation((path, options) => Promise.resolve(options?.method ? { message: 'Saved.' } : data));
  render(<MemoryRouter><MarketplacePage /></MemoryRouter>);
}
test('adds an available category with a slider and saves it', async () => {
  show();
  await screen.findByText('Software');
  fireEvent.click(screen.getByRole('button', { name: 'Add New' }));
  fireEvent.change(screen.getByLabelText('Select Category'), { target: { value: '9' } });
  fireEvent.change(screen.getByLabelText('Slider'), { target: { value: '3' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Save' }).closest('form'));
  await waitFor(() => expect(api).toHaveBeenCalledWith('/settings/marketplace/sliders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category_id: 9, slider: 3 }) }));
});
test('reorders categories with accessible controls and saves the full order', async () => {
  show();
  await screen.findByText('Software');
  fireEvent.click(screen.getByRole('button', { name: 'Swap Marketplace' }));
  fireEvent.click(screen.getByRole('button', { name: 'Move Hosting up' }));
  fireEvent.click(screen.getByRole('button', { name: 'Update Order' }));
  await waitFor(() => expect(api).toHaveBeenCalledWith('/settings/marketplace/sliders/order', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [2, 1] }) }));
});
test('banner form contains three complete slides and deletion requires confirmation', async () => {
  show();
  await screen.findByText('Software');
  fireEvent.click(screen.getByRole('tab', { name: 'Marketplace Banner' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add Banner' }));
  expect(screen.getAllByLabelText('Title')).toHaveLength(3);
  expect(screen.getByLabelText(/Slide 3 Image/)).toBeRequired();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('tab', { name: 'Marketplace Slider' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete Software' }));
  expect(api.mock.calls.some(([, options]) => options?.method === 'DELETE')).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));
  await waitFor(() => expect(api).toHaveBeenCalledWith('/settings/marketplace/sliders/1', { method: 'DELETE' }));
});

test('public marketplace navigates banners and links to configured categories', async () => {
  api.mockResolvedValue({ sliders: [{ id: 1, category_name: 'Software', type: 'product', page_path: '/external/categories/software' }], banners: [{ id: 1, slides: [{ title: 'First campaign', description: 'Welcome', image_url: '/one.png', button_text: 'Explore', button_link: '#marketplace-products' }, { title: 'Second campaign', image_url: '/two.png', button_text: 'Browse', button_link: '/external/categories/software' }] }] });
  render(<MemoryRouter><ExternalMarketplacePage /></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'First campaign' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Next banner' }));
  expect(screen.getByRole('heading', { name: 'Second campaign' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Software/ })).toHaveAttribute('href', '/external/categories/software');
  fireEvent.click(screen.getByRole('button', { name: 'Previous banner' }));
  expect(screen.getByRole('heading', { name: 'First campaign' })).toBeInTheDocument();
});

test('marketplace requires sign in before interacting with the page', async () => {
  getToken.mockReturnValueOnce(null);
  api.mockResolvedValue({ sliders: [], banners: [] });
  render(<MemoryRouter><ExternalMarketplacePage /></MemoryRouter>);
  expect(await screen.findByRole('dialog')).toHaveTextContent('Sign in form');
});

test('package duration controls update prices and mark unavailable plans', async () => {
  api.mockResolvedValue({ banners: [], sliders: [{ id: 1, category_name: 'Hosting', type: 'package', page_path: '/external/categories/hosting', items: [
    { id: 1, type: 'package', name: 'Starter', title: 'Starter', page_path: '/external/packages/starter', inclusions: ['Support'], durations: [{ duration: '1 month', price: '100', preview_price: '150' }, { duration: '1 year', price: '1000' }] },
    { id: 2, type: 'package', name: 'Pro', title: 'Pro', page_path: '/external/packages/pro', inclusions: [], durations: [{ duration: '1 month', price: '200' }] },
  ] }] });
  render(<MemoryRouter><ExternalMarketplacePage /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: '1 year' }));
  expect(screen.getByText(/₹1,000/)).toBeInTheDocument();
  expect(screen.getByText('Unavailable for 1 year')).toBeInTheDocument();
});
