import { readFileSync } from 'fs';
import { join } from 'path';
/* global jest, test, expect, beforeEach, afterEach, __dirname */
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import useCompanyBranding from '../helper/useCompanyBranding';
import MasterLayout from '../masterLayout/MasterLayout';
import { AccessContext } from '../helper/AccessContext';
import { completedPaths, navigationTarget } from '../helper/navigation';
import routes from '../data/routes.json';
import { moduleForPath } from '../helper/moduleAccess';

jest.mock('@iconify/react/dist/iconify.js', () => ({ Icon: function MockIcon() { return null; } }));
jest.mock('../helper/auth', () => ({ signOut: jest.fn().mockResolvedValue() }));
jest.mock('../helper/ThemeToggleButton', () => function MockTheme() { return null; });
jest.mock('../helper/useCompanyBranding', () => jest.fn(() => ({})));
beforeEach(() => { useCompanyBranding.mockReturnValue({}); });
afterEach(() => { cleanup(); useCompanyBranding.mockReturnValue({}); });
function show(modules, path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><AccessContext.Provider value={{ name: 'Admin', role: 'admin', modules }}><MasterLayout><p>Module content</p></MasterLayout></AccessContext.Provider></MemoryRouter>);
}

test('sidebar, account menu, and footer contain valid links with placeholders pointing to 404', () => {
  const view = show(['*']);
  for (const link of view.container.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href');
    if (href === '/#') continue;
    expect(completedPaths).toContain(href);
  }
  expect(screen.getByRole('link', { name: 'Currencies' })).toHaveAttribute('href', '/404');
  expect(screen.getByRole('link', { name: 'Marketplace' })).toHaveAttribute('href', '/404');
  expect(screen.queryByText('Inbox')).not.toBeInTheDocument();
  expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument();
  expect(screen.queryByText('Widgets')).not.toBeInTheDocument();
  const footer = screen.getByRole('contentinfo');
  expect(within(footer).getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy-policy');
  expect(within(footer).getByRole('link', { name: 'Terms and Conditions' })).toHaveAttribute('href', '/terms-condition');
});

test('sidebar and account settings remain filtered by existing module permissions', () => {
  const view = show(['users']);
  const sidebar = within(view.container.querySelector('aside'));
  expect(sidebar.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
  expect(sidebar.queryByRole('link', { name: 'Company' })).not.toBeInTheDocument();
  expect(sidebar.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  expect(sidebar.queryByRole('link', { name: 'Invoice' })).not.toBeInTheDocument();
});

test('sidebar submenu opens for the current page and can be collapsed', () => {
  show(['*'], '/company');
  const toggle = screen.getByRole('button', { name: 'Settings' });
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('completed protected routes all retain a module permission and route paths are unique', () => {
  expect(new Set(completedPaths).size).toBe(completedPaths.length);
  for (const route of routes.filter(({ access }) => access === 'protected')) {
    expect(moduleForPath(route.path)).toBeDefined();
  }
  expect(navigationTarget('/invoice-preview?id=42')).toBe('/invoice-preview?id=42');
  expect(navigationTarget('/currencies')).toBe('/404');
});

test('all screenshot menus are retained in order with future modules linked to 404', () => {
  const view = show(['*']);
  const sidebar = view.container.querySelector('aside');
  const menu = sidebar.querySelector('#sidebar-menu');
  const labels = Array.from(menu.children).map((item) => item.querySelector('a')?.textContent);
  expect(labels).toEqual(['Dashboard', 'LuferaSheets', 'Billing', 'Inventory', 'Settings', 'Log-Out']);
  for (const title of ['Form Builder', 'Subscriptions', 'Payment History', 'Add on Services', 'Package', 'Product', 'Backup', 'Bank Details', 'Buy For Customer', 'Currencies', 'Marketplace', 'Promotion', 'Taxes']) {
    expect(within(sidebar).getByRole('link', { name: title })).toHaveAttribute('href', '/404');
  }
  expect(within(sidebar).getByRole('link', { name: 'Sheets' })).toHaveAttribute('href', '/sheets');
  expect(within(sidebar).getByRole('link', { name: 'Invoice' })).toHaveAttribute('href', '/invoice-list');
  expect(within(sidebar).getByRole('link', { name: 'Category' })).toHaveAttribute('href', '/categories');
  expect(within(sidebar).getByRole('link', { name: 'Roles' })).toHaveAttribute('href', '/roles-permissions');
  expect(menu.firstElementChild).toHaveClass('sidebar-dashboard');
  expect(menu.children[1]).toHaveClass('sidebar-bottom-start');
});

test('404 does not expand every group sharing a placeholder destination', () => {
  show(['*'], '/404');
  for (const title of ['LuferaSheets', 'Billing', 'Inventory', 'Settings']) {
    expect(screen.getByRole('button', { name: title })).toHaveAttribute('aria-expanded', 'false');
  }
});

test('expanded sidebar uses Company Logo and minimized sidebar uses Site Logo with fallbacks', () => {
  useCompanyBranding.mockReturnValue({ logo_url: '/company-logo.png', site_logo_url: '/site-logo.png' });
  const view = show(['*']);
  const logos = view.container.querySelectorAll('.sidebar-logo img');
  expect(logos).toHaveLength(3);
  expect(logos[0]).toHaveAttribute('src', '/company-logo.png');
  expect(logos[1]).toHaveAttribute('src', '/company-logo.png');
  expect(logos[2]).toHaveAttribute('src', '/site-logo.png');
  fireEvent.error(logos[2]);
  expect(view.container.querySelector('.sidebar-logo .logo-icon')).toHaveAttribute('src', '/assets/images/logo-icon.png');
  fireEvent.error(logos[0]);
  expect(view.container.querySelector('.sidebar-logo .light-logo')).toHaveAttribute('src', '/assets/images/logo.png');
});

test('restoring the sidebar preserves the topbar notifications and profile menu', () => {
  const view = show(['*']);
  const topbar = within(view.container.querySelector('.navbar-header'));
  expect(topbar.getByText('Notifications')).toBeInTheDocument();
  expect(topbar.getByRole('link', { name: 'See All Notification' })).toBeInTheDocument();
  expect(topbar.getByAltText('Profile')).toBeInTheDocument();
  const settings = within(view.container.querySelector('.sidebar-submenu#sidebar-settings'));
  const labels = settings.getAllByRole('link').map((link) => link.textContent.trim());
  expect(labels.indexOf('Assign Role')).toBe(labels.indexOf('Activity Log') + 1);
  expect(labels).not.toContain('Users');
});

test.each(['LuferaSheets', 'Billing', 'Inventory', 'Settings'])('%s expands beyond the template zero-height rule', (title) => {
  const style = document.createElement('style');
  const legacyCss = readFileSync(join(__dirname, '../../public/assets/css/extra.css'), 'utf8');
  const zeroHeightRule = legacyCss.match(/\.sidebar-menu \.dropdown \.sidebar-submenu \{[^}]*\}/)[0];
  style.textContent = zeroHeightRule + readFileSync(join(__dirname, '../masterLayout/Sidebar.css'), 'utf8');
  document.head.appendChild(style);
  try {
    const view = show(['*']);
    const toggle = within(view.container.querySelector('aside')).getByRole('button', { name: title });
    const submenu = document.getElementById(toggle.getAttribute('aria-controls'));
    expect(window.getComputedStyle(submenu).display).toBe('none');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(window.getComputedStyle(submenu).display).toBe('block');
    expect(window.getComputedStyle(submenu).maxHeight).toBe('none');
    fireEvent.click(toggle);
    expect(window.getComputedStyle(submenu).display).toBe('none');
  } finally { style.remove(); }
});
