/* eslint-disable react/prop-types */
import { useState } from 'react';
import './AuthBrandingImage.css';

export default function AuthBrandingImage({ src, fallbackSrc, children = null, ...props }) {
  const [failedUrls, setFailedUrls] = useState([]);
  const candidate = typeof src === 'string' && src ? src : null;
  const source = candidate && !failedUrls.includes(candidate) ? candidate : fallbackSrc && !failedUrls.includes(fallbackSrc) ? fallbackSrc : null;
  if (!source) return children;
  return <img {...props} src={source} onError={() => setFailedUrls((urls) => [...urls, source])} />;
}
