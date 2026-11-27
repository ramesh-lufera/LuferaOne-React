/* global jest, test, expect, afterEach */
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PackagesPage from './PackagesPage';
import PackageFormPage from './packages/PackageFormPage';
import PackagePage from './packages/PackagePage';
import { api } from '../services/api';

jest.mock('../services/api', () => ({ api: jest.fn() }));
// eslint-disable-next-line react/prop-types
jest.mock('../masterLayout/MasterLayout', () => function MasterLayoutStub({ children }) { return <main>{children}</main>; });
jest.mock('@iconify/react/dist/iconify.js', () => ({ Icon: () => null }));
jest.mock('@iconify/react', () => ({ Icon: () => null }));
afterEach(() => { cleanup(); jest.clearAllMocks(); });

URL.createObjectURL = jest.fn(() => 'blob:preview');
URL.revokeObjectURL = jest.fn();

const categories = [{ id: 7, name: 'LuferaOne' }];
function show(path = '/packages') {
  render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/packages" element={<PackagesPage />} />
    <Route path="/package-edit" element={<PackageFormPage />} />
    <Route path="/packages/new" element={<PackageFormPage />} />
    <Route path="/packages/:filename" element={<h1>Saved package page</h1>} />
    <Route path="/external/packages/:filename" element={<PackagePage external />} />
  </Routes></MemoryRouter>);
}

test('opens the small category/module popup and continues to a separate package form', async () => {
  api.mockImplementation((path) => Promise.resolve(path === '/packages/categories' ? { categories } : { data: [], total: 0, last_page: 1 }));
  show();
  fireEvent.click(screen.getByRole('button', { name: /Add New Package/ }));
  await screen.findByRole('option', { name: 'LuferaOne' });
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: '7' } });
  fireEvent.change(screen.getByLabelText('Module'), { target: { value: 'CRM' } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(await screen.findByRole('heading', { name: 'Add Package' })).toBeInTheDocument();
  expect(await screen.findByText('CRM')).toBeInTheDocument();
  expect(screen.getByLabelText(/Package name/)).toBeRequired();
  expect(screen.getByLabelText('Duration value 1')).toBeRequired();
  for (let index = 1; index <= 3; index += 1) {
    expect(screen.getByLabelText(`Gallery Image ${index}`)).toHaveAttribute('type', 'file');
  }
  expect(screen.queryByLabelText('Gallery Image 4')).not.toBeInTheDocument();
});

test('submits image uploads and repeatable rows, then opens the generated page', async () => {
  api.mockImplementation((path) => Promise.resolve(path === '/packages/categories' ? { categories } : { page_path: '/packages/starter' }));
  show('/packages/new?category=7&module=CRM');
  await screen.findByLabelText(/Package name/);
  fireEvent.change(screen.getByLabelText(/Package name/), { target: { value: 'Starter' } });
  fireEvent.change(screen.getByLabelText(/Package Image/), { target: { files: [new File(['image'], 'package.png', { type: 'image/png' })] } });
  fireEvent.click(screen.getByRole('button', { name: 'Add Duration & Price' }));
  expect(screen.getByLabelText('Duration value 2')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Remove Duration & Price 2' }));
  expect(screen.queryByLabelText('Duration value 2')).not.toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Packages'));
  fireEvent.click(screen.getByLabelText('Require login to show package pricing'));
  fireEvent.submit(screen.getByRole('button', { name: 'Submit' }).closest('form'));
  await waitFor(() => expect(api).toHaveBeenCalledWith('/packages', expect.objectContaining({ method: 'POST' })));
  const body = api.mock.calls.find(([path]) => path === '/packages')[1].body;
  expect(body.get('category_id')).toBe('7');
  expect(body.get('module')).toBe('CRM');
  expect(body.get('requires_login')).toBe('1');
  expect(body.getAll('addons[]')).toEqual(['packages']);
  expect(await screen.findByRole('heading', { name: 'Saved package page' })).toBeInTheDocument();
});

test('public package page shows content without the purchase section', async () => {
  api.mockResolvedValue({ package: {
    name: 'Starter', title: 'Starter package', subtitle: 'For teams', description: 'Full description', short_description: 'Short description',
    category_name: 'LuferaOne', module: 'CRM', page_path: '/packages/starter', addons: ['packages'], durations: [],
    inclusions: ['Support'], exclusions: ['Hardware'], pricing_locked: true,
  } });
  show('/external/packages/starter');
  await screen.findByText('Full description');
  expect(screen.queryByRole('link', { name: 'Shop now' })).not.toBeInTheDocument();
  expect(screen.getByText('Full description')).toBeInTheDocument();
  expect(screen.queryByLabelText('Duration')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Features' })).toBeInTheDocument();
  expect(screen.getByText('Support')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Contact Us' }));
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
});

const savedPackage = {
  id: 12, name: 'Starter', page_slug: 'starter', category_id: 7, category_name: 'LuferaOne', module: 'CRM',
  title: 'Starter title', subtitle: 'For teams', description: 'Full description', short_description: 'Short description',
  package_image_url: '/cover.png', breadcrumb_image_url: '/banner.png', gallery_image_urls: ['/one.png', '/two.png'],
  durations: [{ value: 1, unit: 'month', price: '200.00', preview_price: '240.00' }, { value: 1, unit: 'year', price: '2000.00', preview_price: null }],
  inclusions: ['Support', 'Updates'], exclusions: ['Hardware'], addons: ['packages', 'services'], gst: 18, requires_login: true,
  page_path: '/packages/starter',
};

test('edit action loads every saved field, retains images, and allows retrying a failed save', async () => {
  let saveCount = 0;
  api.mockImplementation((path) => {
    if (path === '/packages/categories') return Promise.resolve({ categories });
    if (path === '/packages/starter') return Promise.resolve({ package: savedPackage });
    if (path === '/packages/12') {
      saveCount += 1;
      return saveCount === 1 ? Promise.reject(Object.assign(new Error('Validation failed.'), { errors: { name: ['Try a different name.'] } })) : Promise.resolve({ page_path: '/packages/starter' });
    }
    return Promise.resolve({ data: [savedPackage], total: 1, last_page: 1 });
  });
  show();
  fireEvent.click(await screen.findByRole('link', { name: 'Edit Starter' }));
  expect(await screen.findByDisplayValue('Starter title')).toBeInTheDocument();
  expect(screen.getByLabelText(/Package name/)).toHaveValue('Starter');
  expect(screen.getByLabelText(/Module/)).toHaveValue('CRM');
  expect(screen.getByLabelText('Duration value 2')).toHaveValue(1);
  expect(screen.getByLabelText('Inclusive 2')).toHaveValue('Updates');
  expect(screen.getByLabelText('Add-on Services')).toBeChecked();
  expect(screen.getByLabelText('Require login to show package pricing')).toBeChecked();
  expect(screen.getByLabelText('Tax')).toHaveValue('legacy');
  expect(screen.getByLabelText('Package Image')).not.toBeRequired();
  expect(screen.getByAltText('Gallery Image 1 preview')).toHaveAttribute('src', '/one.png');
  fireEvent.change(screen.getByLabelText(/Package name/), { target: { value: 'Updated Starter' } });
  fireEvent.change(screen.getByLabelText(/Module/), { target: { value: 'Updated CRM' } });
  fireEvent.click(screen.getByLabelText('Remove gallery image 2'));
  fireEvent.click(screen.getByRole('button', { name: 'Remove Duration & Price 2' }));
  const form = screen.getByRole('button', { name: 'Save Changes' }).closest('form');
  fireEvent.submit(form);
  expect(await screen.findByText('Try a different name.')).toBeInTheDocument();
  expect(screen.getByLabelText(/Package name/)).toHaveValue('Updated Starter');
  fireEvent.submit(form);
  expect(await screen.findByRole('heading', { name: 'Saved package page' })).toBeInTheDocument();
  const body = api.mock.calls.filter(([path]) => path === '/packages/12')[1][1].body;
  expect(body.get('_method')).toBe('PUT');
  expect(body.get('name')).toBe('Updated Starter');
  expect(body.get('module')).toBe('Updated CRM');
  expect(body.has('package_image')).toBe(false);
  expect(body.has('breadcrumb_image')).toBe(false);
  expect(body.getAll('remove_gallery_images[]')).toEqual(['1']);
  expect(body.has('durations[1][value]')).toBe(false);
});

test('delete can be cancelled, retries errors, and refreshes the package list after success', async () => {
  let deleted = false;
  let deleteCount = 0;
  api.mockImplementation((path, options) => {
    if (options?.method === 'DELETE') {
      deleteCount += 1;
      if (deleteCount === 1) return Promise.reject(new Error('Delete failed. Please retry.'));
      deleted = true;
      return Promise.resolve({ message: 'Package deleted successfully.' });
    }
    return Promise.resolve({ data: deleted ? [] : [savedPackage], total: deleted ? 0 : 1, last_page: 1 });
  });
  show();
  fireEvent.click(await screen.findByRole('button', { name: 'Delete Starter' }));
  let dialog = await screen.findByRole('dialog', { name: 'Delete Package' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(deleteCount).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: 'Delete Starter' }));
  dialog = await screen.findByRole('dialog', { name: 'Delete Package' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Delete Package' }));
  expect(await screen.findByText('Delete failed. Please retry.')).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Delete Package' }));
  expect(await screen.findByText('Package deleted successfully.')).toBeInTheDocument();
  expect(await screen.findByText('No packages found.')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Edit Starter' })).not.toBeInTheDocument();
});

test('deleting the last package on a later page returns to the preceding page', async () => {
  let deleted = false;
  api.mockImplementation((path, options) => {
    if (options?.method === 'DELETE') { deleted = true; return Promise.resolve({ message: 'Deleted.' }); }
    const page = Number(new URLSearchParams(path.split('?')[1]).get('page'));
    return Promise.resolve({ data: page === 2 && !deleted ? [savedPackage] : [{ ...savedPackage, id: 13, name: 'Other' }], total: deleted ? 10 : 11, last_page: deleted ? 1 : 2 });
  });
  show();
  await screen.findByRole('link', { name: 'Edit Other' });
  fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Delete Starter' }));
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Delete Package' }));
  expect(await screen.findByRole('link', { name: 'Edit Other' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
});

const taxOptions = [
  { id: 9, name: 'GST 18%', region: 'India', rate: '18.00', type: 'exclusive', is_default: true },
  { id: 10, name: 'VAT included', region: 'United Kingdom', rate: '20.00', type: 'inclusive', is_default: false },
];

test('package tax selector lists saved records from all regions and submits the chosen tax ID', async () => {
  api.mockImplementation((path) => {
    if (path === '/packages/categories') return Promise.resolve({ categories });
    if (path === '/packages/options/taxes') return Promise.resolve({ taxes: taxOptions });
    return Promise.resolve({ page_path: '/packages/starter' });
  });
  show('/packages/new?category=7&module=CRM');
  const selector = await screen.findByLabelText('Tax');
  expect(selector).toHaveValue('');
  expect(screen.getByRole('option', { name: /GST 18%.*India.*Exclusive.*Default for region/ })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: /VAT included.*United Kingdom.*Inclusive/ })).toBeInTheDocument();
  fireEvent.change(selector, { target: { value: '10' } });
  expect(screen.getByText(/Inclusive: the entered package price already includes this tax/)).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Packages'));
  fireEvent.submit(screen.getByRole('button', { name: 'Submit' }).closest('form'));
  await screen.findByRole('heading', { name: 'Saved package page' });
  const body = api.mock.calls.find(([path]) => path === '/packages')[1].body;
  expect(body.get('tax_id')).toBe('10');
  expect(body.has('gst')).toBe(false);
});

test('editing preselects the saved tax and permits clearing it', async () => {
  api.mockImplementation((path) => {
    if (path === '/packages/categories') return Promise.resolve({ categories });
    if (path === '/packages/options/taxes') return Promise.resolve({ taxes: taxOptions });
    if (path === '/packages/starter') return Promise.resolve({ package: { ...savedPackage, gst: null, tax_id: 9 } });
    return Promise.resolve({ page_path: '/packages/starter' });
  });
  show('/package-edit?package=starter');
  const selector = await screen.findByLabelText('Tax');
  expect(selector).toHaveValue('9');
  expect(screen.getByText(/Exclusive: this tax is added to the entered package price/)).toBeInTheDocument();
  fireEvent.change(selector, { target: { value: '' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }).closest('form'));
  await screen.findByRole('heading', { name: 'Saved package page' });
  expect(api.mock.calls.find(([path]) => path === '/packages/12')[1].body.get('tax_id')).toBe('');
});

test('public package page omits pricing and gallery', async () => {
  api.mockResolvedValue({ package: { ...savedPackage, pricing_locked: false, gst: null, tax: taxOptions[0],
    durations: [{ value: 1, unit: 'month', price: '1000', tax_amount: '180.00', total_amount: '1180.00' }],
  } });
  show('/external/packages/starter');
  await screen.findByRole('heading', { name: 'Description' });
  expect(screen.queryByText('₹1,000.00')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Duration')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Zoom/ })).not.toBeInTheDocument();
  expect(screen.queryByText(/GST|Tax:|Total:/)).not.toBeInTheDocument();
});

test('oversized gallery images show a clear error before upload and a valid replacement clears it', async () => {
  api.mockImplementation((path) => Promise.resolve(path === '/packages/categories' ? { categories } : { taxes: [] }));
  show('/packages/new?category=7&module=CRM');
  const input = await screen.findByLabelText('Gallery Image 3');
  const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' });
  fireEvent.change(input, { target: { files: [oversized] } });
  expect(await screen.findByRole('alert')).toHaveTextContent('Gallery Image 3 must be no larger than 5 MB.');
  expect(input).toBeInvalid();
  fireEvent.change(input, { target: { files: [new File(['image'], 'small.png', { type: 'image/png' })] } });
  expect(input).toBeValid();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
