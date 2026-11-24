/* global jest, test, expect, beforeEach, afterEach */
import { render, cleanup, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import CompanyFavicon from './CompanyFavicon';
import useCompanyBranding from '../helper/useCompanyBranding';
import usePageTabTitle from '../helper/usePageTabTitle';

jest.mock('../helper/useCompanyBranding', () => jest.fn());
const OriginalImage = window.Image;
let requests;
let previousTitle;
beforeEach(() => {
  requests = [];
  previousTitle = document.title;
  window.Image = class { constructor() { requests.push(this); } };
  const link = document.createElement('link');
  link.id = 'site-favicon'; link.rel = 'icon'; link.href = '/assets/images/favicon.png';
  document.head.appendChild(link);
});
afterEach(() => { cleanup(); document.getElementById('site-favicon')?.remove(); window.Image = OriginalImage; document.title = previousTitle; });

function renderFavicon(path = '/') {
  const page = <CompanyFavicon />;
  return render(page, { wrapper: ({ children }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter> });
}

test('preloads the site logo before updating the favicon and reacts to replacements', () => {
  useCompanyBranding.mockReturnValue({ images: { site_logo_url: '/site-logo.png' } });
  const view = renderFavicon();
  const link = document.getElementById('site-favicon');
  expect(link).toHaveAttribute('href', '/assets/images/favicon.png');
  requests[0].onload();
  expect(link).toHaveAttribute('href', '/site-logo.png');
  useCompanyBranding.mockReturnValue({ images: { site_logo_url: '/replacement.png' } });
  view.rerender(<CompanyFavicon />);
  requests[1].onload();
  expect(link).toHaveAttribute('href', '/replacement.png');
});

test('missing or failed site logo restores the default favicon', () => {
  useCompanyBranding.mockReturnValue({ images: { site_logo_url: '/missing.png' } });
  const view = renderFavicon();
  requests[0].onerror();
  expect(document.getElementById('site-favicon')).toHaveAttribute('href', '/assets/images/favicon.png');
  useCompanyBranding.mockReturnValue({});
  view.rerender(<CompanyFavicon />);
  expect(document.getElementById('site-favicon')).toHaveAttribute('href', '/assets/images/favicon.png');
});

test('sets, replaces, and clears the browser tab title from company branding', () => {
  document.title = 'Default site';
  useCompanyBranding.mockReturnValue({ site_title: 'Lufera One' });
  const view = renderFavicon('/company');
  expect(document.title).toBe('Lufera One - Company');

  useCompanyBranding.mockReturnValue({ site_title: 'Lufera & Co.' });
  view.rerender(<CompanyFavicon />);
  expect(document.title).toBe('Lufera & Co. - Company');

  useCompanyBranding.mockReturnValue({ site_title: null });
  view.rerender(<CompanyFavicon />);
  expect(document.title).toBe('Default site - Company');
});

test('uses the loaded category name and updates the title when navigating to another page', () => {
  function Category() {
    usePageTabTitle('Hosting Plans');
    return <Link to="/invoice-preview?id=42">Open invoice</Link>;
  }

  useCompanyBranding.mockReturnValue({ site_title: 'Lufera One' });
  render(
    <MemoryRouter initialEntries={['/external/categories/hosting-plans']}>
      <CompanyFavicon>
        <Routes>
          <Route path="/external/categories/:filename" element={<Category />} />
          <Route path="/invoice-preview" element={null} />
        </Routes>
      </CompanyFavicon>
    </MemoryRouter>,
  );
  expect(document.title).toBe('Lufera One - Hosting Plans');

  fireEvent.click(screen.getByRole('link', { name: 'Open invoice' }));
  expect(document.title).toBe('Lufera One - Invoice Details');
});
