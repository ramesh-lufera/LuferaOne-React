import { useEffect, useRef, useState } from 'react';
import { matchRoutes, useLocation } from 'react-router-dom';
import routes from '../data/routes.json';
import useCompanyBranding from '../helper/useCompanyBranding';
import { PageTabTitleContext } from '../helper/usePageTabTitle';

const defaultIcon = '/assets/images/favicon.png';
const titledRoutes = [
  ...routes,
  { path: '/categories/:filename', title: 'Category' },
  { path: '/external/categories/:filename', title: 'Category' },
];

// eslint-disable-next-line react/prop-types
export default function CompanyFavicon({ children }) {
  const { images, site_title: siteTitle } = useCompanyBranding({ includeTitle: true });
  const defaultTitle = useRef(document.title);
  const siteLogoUrl = images?.site_logo_url;
  const { key, pathname } = useLocation();
  const [pageTitle, setPageTitle] = useState(null);
  const routeTitle = matchRoutes(titledRoutes, pathname)?.[0].route.title || '404';
  const pageName = pageTitle?.key === key ? pageTitle.title : routeTitle;

  useEffect(() => {
    document.title = `${siteTitle || defaultTitle.current} - ${pageName}`;
  }, [siteTitle, pageName]);

  useEffect(() => {
    let link = document.getElementById('site-favicon');
    if (!link) {
      link = document.createElement('link');
      link.id = 'site-favicon';
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.removeAttribute('type');
    link.removeAttribute('sizes');
    if (!siteLogoUrl) {
      link.href = defaultIcon;
      return;
    }
    const image = new Image();
    image.onload = () => { link.href = siteLogoUrl; };
    image.onerror = () => { link.href = defaultIcon; };
    image.src = siteLogoUrl;
    return () => { image.onload = null; image.onerror = null; };
  }, [siteLogoUrl]);
  return <PageTabTitleContext.Provider value={setPageTitle}>{children}</PageTabTitleContext.Provider>;
}
