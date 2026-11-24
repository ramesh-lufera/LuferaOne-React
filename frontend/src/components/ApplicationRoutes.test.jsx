/* global jest, test, expect, beforeEach, afterEach */
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ApplicationRoutes from './ApplicationRoutes';
import routes from '../data/routes.json';
import { getToken } from '../helper/auth';

jest.mock('../pages/TaxesPage', () => function TaxesPageStub() { return <h1>TaxesPage</h1>; });
jest.mock('../pages/PackagesPage', () => function PackagesPageStub() { return <h1>PackagesPage</h1>; });
jest.mock('../pages/packages/PackageFormPage', () => function PackageFormPageStub() { return <h1>PackageFormPage</h1>; });
jest.mock('../pages/packages/PackagePage', () => () => null);
jest.mock('../pages/SheetEditorPage', () => function SheetEditorPageStub() { return <h1>SheetEditorPage</h1>; });
jest.mock('../pages/SheetsPage', () => function SheetsPageStub() { return <h1>SheetsPage</h1>; });
jest.mock('../helper/auth', () => ({ apiUrl: '/api', getToken: jest.fn(), clearToken: jest.fn() }));
jest.mock('../pages/AccessDeniedPage', () => function AccessDeniedPageStub() { return <h1>AccessDeniedPage</h1>; });
jest.mock('../pages/ActivityLogPage', () => function ActivityLogPageStub() { return <h1>ActivityLogPage</h1>; });
jest.mock('../pages/AddUserPage', () => function AddUserPageStub() { return <h1>AddUserPage</h1>; });
jest.mock('../pages/AssignRolePage', () => function AssignRolePageStub() { return <h1>AssignRolePage</h1>; });
jest.mock('../pages/categories/CategoriesPage', () => function CategoriesPageStub() { return <h1>CategoriesPage</h1>; });
jest.mock('../pages/categories/CategoryPage', () => () => null);
jest.mock('../pages/CompanyPage', () => function CompanyPageStub() { return <h1>CompanyPage</h1>; });
jest.mock('../pages/CredentialsPage', () => function CredentialsPageStub() { return <h1>CredentialsPage</h1>; });
jest.mock('../pages/ErrorPage', () => function ErrorPageStub() { return <h1>ErrorPage</h1>; });
jest.mock('../pages/HomePageOne', () => function HomePageOneStub() { return <h1>HomePageOne</h1>; });
jest.mock('../pages/InvoiceAddPage', () => function InvoiceAddPageStub() { return <h1>InvoiceAddPage</h1>; });
jest.mock('../pages/InvoiceEditPage', () => function InvoiceEditPageStub() { return <h1>InvoiceEditPage</h1>; });
jest.mock('../pages/InvoiceListPage', () => function InvoiceListPageStub() { return <h1>InvoiceListPage</h1>; });
jest.mock('../pages/InvoicePreviewPage', () => function InvoicePreviewPageStub() { return <h1>InvoicePreviewPage</h1>; });
jest.mock('../pages/InvoiceSettingsPage', () => function InvoiceSettingsPageStub() { return <h1>InvoiceSettingsPage</h1>; });
jest.mock('../pages/PrivacyPolicyPage', () => function PrivacyPolicyPageStub() { return <h1>PrivacyPolicyPage</h1>; });
jest.mock('../pages/PrivacyPolicySettingsPage', () => function PrivacyPolicySettingsPageStub() { return <h1>PrivacyPolicySettingsPage</h1>; });
jest.mock('../pages/RoleAccessPage', () => function RoleAccessPageStub() { return <h1>RoleAccessPage</h1>; });
jest.mock('../pages/SignInPage', () => function SignInPageStub() { return <h1>SignInPage</h1>; });
jest.mock('../pages/SignUpPage', () => function SignUpPageStub() { return <h1>SignUpPage</h1>; });
jest.mock('../pages/TermsConditionPage', () => function TermsConditionPageStub() { return <h1>TermsConditionPage</h1>; });
jest.mock('../pages/TermsConditionSettingsPage', () => function TermsConditionSettingsPageStub() { return <h1>TermsConditionSettingsPage</h1>; });
jest.mock('../pages/ThemeColorsPage', () => function ThemeColorsPageStub() { return <h1>ThemeColorsPage</h1>; });
jest.mock('../pages/UsersGridPage', () => function UsersGridPageStub() { return <h1>UsersGridPage</h1>; });
jest.mock('../pages/UsersListPage', () => function UsersListPageStub() { return <h1>UsersListPage</h1>; });
jest.mock('../pages/ViewProfilePage', () => function ViewProfilePageStub() { return <h1>ViewProfilePage</h1>; });

const originalFetch = window.fetch;
beforeEach(() => {
  getToken.mockReturnValue('test-token');
  window.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ user: { name: 'Admin', modules: ['*'] } }) });
});
afterEach(() => { cleanup(); jest.clearAllMocks(); window.fetch = originalFetch; });
function show(path) { render(<MemoryRouter initialEntries={[path]}><ApplicationRoutes /></MemoryRouter>); }

test.each(routes)('$path opens its registered completed page', async ({ path, page }) => {
  show(path);
  expect(await screen.findByRole('heading', { name: page })).toBeInTheDocument();
});

test.each(['/currencies', '/marketplace', '/calendar', '/chat-message', '/index-2', '/forgot-password', '/error', '/unknown/deep/path'])('%s displays 404 instead of a demo or access-denied page', async (path) => {
  getToken.mockReturnValue(null);
  show(path);
  expect(await screen.findByRole('heading', { name: 'ErrorPage' })).toBeInTheDocument();
});

test('invoice record links preserve query parameters while matching the completed route', async () => {
  show('/invoice-preview?id=42');
  expect(await screen.findByRole('heading', { name: 'InvoicePreviewPage' })).toBeInTheDocument();
});

test.each(routes.filter(({ access }) => access === 'protected'))('guest cannot bypass authentication at $path', async ({ path }) => {
  getToken.mockReturnValue(null);
  show(path);
  expect(await screen.findByRole('heading', { name: 'SignInPage' })).toBeInTheDocument();
});

test('completed modules still reject users without their module permission', async () => {
  window.fetch.mockResolvedValue({ ok: true, json: async () => ({ user: { modules: ['company'] } }) });
  show('/users-list');
  expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
});

test.each(routes.filter(({ access }) => access === 'legal'))('guest can still read $path', async ({ path, page }) => {
  getToken.mockReturnValue(null);
  show(path);
  expect(await screen.findByRole('heading', { name: page })).toBeInTheDocument();
});
