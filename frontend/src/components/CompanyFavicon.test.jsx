/* global jest, test, expect, beforeEach, afterEach */
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompanyFavicon from './CompanyFavicon';
import useCompanyBranding from '../helper/useCompanyBranding';

jest.mock('../helper/useCompanyBranding', () => jest.fn());
const OriginalImage = window.Image;
let requests;
beforeEach(() => {
  requests = [];
  window.Image = class { constructor() { requests.push(this); } };
  const link = document.createElement('link');
  link.id = 'site-favicon'; link.rel = 'icon'; link.href = '/assets/images/favicon.png';
  document.head.appendChild(link);
});
afterEach(() => { cleanup(); document.getElementById('site-favicon')?.remove(); window.Image = OriginalImage; });

test('preloads the site logo before updating the favicon and reacts to replacements', () => {
  useCompanyBranding.mockReturnValue({ site_logo_url: '/site-logo.png' });
  const view = render(<CompanyFavicon />);
  const link = document.getElementById('site-favicon');
  expect(link).toHaveAttribute('href', '/assets/images/favicon.png');
  requests[0].onload();
  expect(link).toHaveAttribute('href', '/site-logo.png');
  useCompanyBranding.mockReturnValue({ site_logo_url: '/replacement.png' });
  view.rerender(<CompanyFavicon />);
  requests[1].onload();
  expect(link).toHaveAttribute('href', '/replacement.png');
});

test('missing or failed site logo restores the default favicon', () => {
  useCompanyBranding.mockReturnValue({ site_logo_url: '/missing.png' });
  const view = render(<CompanyFavicon />);
  requests[0].onerror();
  expect(document.getElementById('site-favicon')).toHaveAttribute('href', '/assets/images/favicon.png');
  useCompanyBranding.mockReturnValue({});
  view.rerender(<CompanyFavicon />);
  expect(document.getElementById('site-favicon')).toHaveAttribute('href', '/assets/images/favicon.png');
});
