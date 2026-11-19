import { useEffect } from 'react';
import useCompanyBranding from '../helper/useCompanyBranding';

const defaultIcon = '/assets/images/favicon.png';

export default function CompanyFavicon() {
  const images = useCompanyBranding();
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
    if (!images.site_logo_url) {
      link.href = defaultIcon;
      return;
    }
    const image = new Image();
    image.onload = () => { link.href = images.site_logo_url; };
    image.onerror = () => { link.href = defaultIcon; };
    image.src = images.site_logo_url;
    return () => { image.onload = null; image.onerror = null; };
  }, [images.site_logo_url]);
  return null;
}
