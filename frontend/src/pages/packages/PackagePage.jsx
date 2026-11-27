/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ExternalCatalogDetails from './ExternalCatalogDetails';
import MasterLayout from '../../masterLayout/MasterLayout';
import { api } from '../../services/api';
import PackageGallery from './PackageGallery';
import './PackagePage.css';

export default function PackagePage({ external = false }) {
  return external ? <PackageDetails external /> : <MasterLayout><PackageDetails /></MasterLayout>;
}

function PackageDetails({ external = false }) {
  const { filename } = useParams();
  const { pathname, state } = useLocation();
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tab, setTab] = useState('Description');
  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    setDuration(0);
    api(`${external ? '/external' : ''}/packages/${encodeURIComponent(filename)}`, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setResult({ filename, data: data.package }); })
      .catch((error) => { if (!controller.signal.aborted) setResult({ filename, error }); });
    return () => controller.abort();
  }, [external, filename, attempt]);
  const item = result?.filename === filename ? result.data : null;
  useEffect(() => {
    if (!item) return;
    const previous = document.title;
    document.title = item.name;
    return () => { document.title = previous; };
  }, [item]);
  if (result?.filename !== filename) return <p className="p-24" role="status">Loading package…</p>;
  if (result.error) return <div className="p-24" role="alert">{result.error.status === 404 ? 'Package not found.' : result.error.message} <button onClick={() => setAttempt((value) => value + 1)}>Try again</button></div>;
  if (external) return <ExternalCatalogDetails item={item} kind="Package" />;
  const price = item.durations[duration];
  const money = (value) => Number(value).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  const enquiry = `mailto:info@luferatech.com?subject=${encodeURIComponent(`Package enquiry: ${item.name}`)}`;

  return <article className={`package-detail ${external ? 'package-detail-external' : ''}`}>
    {!external && state?.message && <p className="alert alert-success m-16" role="status">{state.message}</p>}
    {!external && <div className="package-manage"><Link to="/packages">← Packages</Link><Link to={`/package-edit?package=${encodeURIComponent(filename)}`}>Edit Package</Link><Link to={`/external${item.page_path}`}>Open external page ↗</Link></div>}
    <header className="package-hero">
      <img src={item.breadcrumb_image_url} alt="" />
      <div className="package-hero-content"><h1>{item.name}</h1>
        <nav className="package-breadcrumb" aria-label="Breadcrumb">
          <Link to={external ? '/' : '/dashboard'}><i className="ri-home-4-line" aria-hidden="true" /> Home</Link>
          <span aria-hidden="true">›</span>
          {external ? <span>Packages</span> : <Link to="/packages">Packages</Link>}
          <span aria-hidden="true">›</span><span aria-current="page">{item.name}</span>
        </nav>
      </div>
    </header>
    <div className="package-detail-content">
      <section className="package-product">
        <PackageGallery key={item.page_path} name={item.name} cover={item.package_image_url} gallery={item.gallery_image_urls ?? []} />
        <div className="package-product-info">
          <h2>{item.title}</h2>
          <p className="package-subtitle">{item.subtitle}</p>
          {item.pricing_locked ? <Link className="package-sign-in" to={`/sign-in?returnTo=${encodeURIComponent(pathname)}`}>Sign in to view pricing</Link> : <>
            <p className="package-price"><span>{money(price.price)}</span> {Number(price.preview_price) > Number(price.price) && <del>{money(price.preview_price)}</del>}</p>
          </>}
          <p className="package-short-description">{item.short_description}</p>
          <div className="package-purchase">
          {!item.pricing_locked && <>
            <div className="package-duration"><label htmlFor="package-duration" className="package-duration-label">Duration</label>
            <select id="package-duration" value={duration} onChange={(event) => setDuration(Number(event.target.value))}>{item.durations.map((row, i) => <option value={i} key={i}>{row.value} {row.unit}{Number(row.value) === 1 ? '' : 's'}</option>)}</select></div>

          </>}
          <button className="package-enquire" href={enquiry}>Shop now <span aria-hidden="true">↗</span></button>
          </div>
        </div>
      </section>
      <section className="package-tabs">
        <div role="tablist" aria-label="Package details">{['Description', 'Features'].map((label) => <button key={label} type="button" role="tab" id={`package-tab-${label.replaceAll(' ', '-')}`} aria-controls="package-tab-panel" aria-selected={tab === label} onClick={() => setTab(label)}>{label}</button>)}</div>
        <div id="package-tab-panel" role="tabpanel" aria-labelledby={`package-tab-${tab.replaceAll(' ', '-')}`} tabIndex={0}>{tab === 'Description' ? <p className="package-description">{item.description}</p> : <div className="package-detail-features"><div><h3>Inclusive</h3><ul>{item.inclusions.map((text, i) => <li key={i}>✓ {text}</li>)}</ul></div><div><h3>Exclusive</h3><ul>{item.exclusions.map((text, i) => <li key={i}>× {text}</li>)}</ul></div></div>}</div>
      </section>
    </div>
    {external && <footer className="package-footer"><span>© {new Date().getFullYear()} Lufera Infotech</span><nav><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms-condition">Terms and Conditions</Link></nav></footer>}
  </article>;
}
