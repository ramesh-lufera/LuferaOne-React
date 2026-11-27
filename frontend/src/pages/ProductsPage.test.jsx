/* global jest, test, expect, afterEach */
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductsPage from './ProductsPage';
import ProductFormPage from './products/ProductFormPage';
import ProductPage from './products/ProductPage';
import { api } from '../services/api';
import { canAccessPath } from '../helper/moduleAccess';

jest.mock('../helper/auth', () => ({ apiUrl: '/api' }));
jest.mock('../services/api', () => ({ api: jest.fn() }));
// eslint-disable-next-line react/prop-types
jest.mock('../masterLayout/MasterLayout', () => function MasterLayoutStub({ children }) { return <main>{children}</main>; });
jest.mock('@iconify/react', () => ({ Icon: () => null }));
afterEach(() => { cleanup(); jest.clearAllMocks(); });
const product = { id: 12, name: 'CRM', title: 'CRM product', subtitle: 'For teams', description: 'Full description', short_description: 'Short description', category_id: 7, category_name: 'Software', price: '200.00', preview_price: '240.00', duration_value: 30, duration_unit: 'day', tags: 'CRM, software', is_featured: 1, requires_login: 1, inclusions: ['Support'], exclusions: ['Hardware'], gallery_image_urls: [], product_image_url: '/cover.png', breadcrumb_image_url: '/banner.png', page_path: '/products/crm' };
function show(path = '/products') {
  render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/products" element={<ProductsPage />} />
    <Route path="/products/new" element={<ProductFormPage />} />
    <Route path="/product-edit" element={<ProductFormPage />} />
    <Route path="/products/:filename" element={<h1>Saved product page</h1>} />
    <Route path="/external/products/:filename" element={<ProductPage external />} />
  </Routes></MemoryRouter>);
}
function mockForm() {
  api.mockImplementation((path, options) => {
    if (options?.method === 'POST') return Promise.resolve({ page_path: '/products/crm', message: 'Saved' });
    if (path === '/products/categories') return Promise.resolve({ categories: [{ id: 7, name: 'Software' }] });
    if (path === '/products/options/taxes') return Promise.resolve({ taxes: [] });
    if (path === '/products/crm') return Promise.resolve({ product });
    return Promise.resolve({ data: [], total: 0, last_page: 1 });
  });
}

test('asks for category and module before opening the product form', async () => {
  mockForm();
  show();
  fireEvent.click(screen.getByRole('button', { name: /Add New Product/ }));
  await screen.findByRole('option', { name: 'Software' });
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: '7' } });
  fireEvent.change(screen.getByLabelText('Module'), { target: { value: 'Sales' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Continue' }).closest('form'));
  expect(await screen.findByLabelText(/Product name/)).toBeInTheDocument();
  expect(screen.getByLabelText(/^Price/)).toBeRequired();
  expect(screen.getByLabelText(/Preview Price/)).toBeRequired();
  expect(screen.getByLabelText(/^Tags/)).toBeRequired();
  expect(screen.getByLabelText('Mark as featured product')).not.toBeChecked();
  expect(screen.getByLabelText('Require login to purchase')).not.toBeChecked();
  expect(screen.queryByLabelText(/^Module/)).not.toBeInTheDocument();
  expect(screen.getByLabelText(/^Category/)).toHaveValue('');
});

test('prefills product fields and submits updates with explicit boolean flags', async () => {
  mockForm();
  show('/product-edit?product=crm');
  expect(await screen.findByLabelText(/Product name/)).toHaveValue('CRM');
  expect(screen.getByLabelText(/^Price/)).toHaveValue(200);
  expect(screen.getByLabelText(/^Tags/)).toHaveValue('CRM, software');
  fireEvent.change(screen.getByLabelText(/^Category/), { target: { value: 'Business software' } });
  fireEvent.click(screen.getByLabelText('Mark as featured product'));
  fireEvent.click(screen.getByLabelText('Require login to purchase'));
  fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form'));
  await waitFor(() => expect(api).toHaveBeenCalledWith('/products/12', expect.objectContaining({ method: 'POST' })));
  const body = api.mock.calls.find(([path, options]) => path === '/products/12' && options?.method === 'POST')[1].body;
  expect(body.get('category')).toBe('Business software');
  expect(body.get('category_id')).toBe('7');
  expect(body.get('_method')).toBe('PUT');
  expect(body.get('is_featured')).toBe('0');
  expect(body.get('requires_login')).toBe('0');
  expect(body.has('product_image')).toBe(false);
  expect(await screen.findByRole('heading', { name: 'Saved product page' })).toBeInTheDocument();
});

test('confirms deletion before sending the request', async () => {
  api.mockImplementation((path, options) => Promise.resolve(options?.method === 'DELETE' ? { message: 'Product deleted successfully.' } : { data: [{ ...product, page_slug: 'crm' }], total: 1, last_page: 1 }));
  show();
  fireEvent.click(await screen.findByRole('button', { name: 'Delete CRM' }));
  expect(api.mock.calls.some(([, options]) => options?.method === 'DELETE')).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Delete Product' }));
  await waitFor(() => expect(api).toHaveBeenCalledWith('/products/12', { method: 'DELETE' }));
});

test('external product shows information without the purchase section', async () => {
  api.mockResolvedValue({ product: { ...product, pricing_locked: true, durations: [], price: null, preview_price: null } });
  show('/external/products/crm');
  expect(await screen.findByText('Full description')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Shop now' })).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Duration')).not.toBeInTheDocument();
  expect(screen.queryByText('₹200.00')).not.toBeInTheDocument();
});

test('product permissions apply to listing, forms and dynamic detail routes', () => {
  for (const path of ['/products', '/products/new', '/product-edit', '/products/crm']) {
    expect(canAccessPath({ modules: ['products'] }, path)).toBe(true);
    expect(canAccessPath({ modules: ['packages'] }, path)).toBe(false);
  }
});
