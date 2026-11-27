/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import SignInLayer from '../components/SignInLayer';
import useCompanyBranding from '../helper/useCompanyBranding';
import { getToken } from '../helper/auth';
import { api } from '../services/api';
import './ExternalMarketplacePage.css';

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value));

export default function ExternalMarketplacePage() {
  const branding = useCompanyBranding();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    if (!getToken()) { setSessionChecked(true); return () => controller.abort(); }
    api('/user', { signal: controller.signal }).then(() => { if (!controller.signal.aborted) setSignedIn(true); })
      .catch(() => {}).finally(() => { if (!controller.signal.aborted) setSessionChecked(true); });
    return () => controller.abort();
  }, [location.key]);
  useEffect(() => {
    const controller = new AbortController();
    setError('');
    api('/external/marketplace', { signal: controller.signal }).then((result) => { if (!controller.signal.aborted) setData(result); }).catch((err) => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [attempt, signedIn]);
  const slides = data?.banners?.flatMap((banner) => banner.slides) ?? [];
  const index = activeSlide % (slides.length || 1);
  const slide = slides[index];
  useEffect(() => {
    if (!playing || hovered || slides.length < 2 || !signedIn) return undefined;
    const timer = setInterval(() => setActiveSlide((value) => value + 1), 4500);
    return () => clearInterval(timer);
  }, [playing, hovered, slides.length, signedIn]);
  return <div className="external-marketplace">
    <div inert={sessionChecked && !signedIn ? '' : undefined} className={sessionChecked && !signedIn ? 'marketplace-locked' : ''}>
      <header className="marketplace-header"><div className="marketplace-container marketplace-navbar">
        <Link to="/external/marketplace" className="marketplace-brand">{branding.logo_url ? <img src={branding.logo_url} alt="Lufera Infotech" /> : 'Lufera Infotech'}</Link>
        <button className="marketplace-menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <nav className={menuOpen ? 'is-open' : ''} aria-label="Main navigation">
          <a href="https://luferatech.com/">Home</a><a href="https://luferatech.com/about/">About</a>
          <details><summary>Products</summary><div>{['One', 'Sheets', 'IDX', 'Cart', 'Web', 'Core'].map((name) => <a key={name} href={`https://${name.toLowerCase()}.luferatech.com/`}>Lufera{name}</a>)}</div></details>
          <a href="https://luferatech.com/contact/">Contact Us</a>
        </nav>
        <Link className="marketplace-button" to={signedIn ? '/' : '/sign-in?returnTo=%2Fexternal%2Fmarketplace'}>{signedIn ? 'Dashboard' : 'Login'}</Link>
      </div></header>
      <main className="marketplace-container">
        <h1 className="visually-hidden">Marketplace</h1>
        {error ? <p role="alert">{error} <button onClick={() => setAttempt((value) => value + 1)}>Try again</button></p> : !data ? <p role="status">Loading marketplace…</p> : <>
          {slide && <section className="marketplace-hero-section" aria-label="Marketplace banners" aria-roledescription="carousel" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <div className="marketplace-hero-viewport"><div className="marketplace-hero-track" style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}>
              {slides.map((banner, i) => <div key={i} className={`marketplace-hero hero-variant-${i % 3}`} aria-hidden={i !== index} inert={i !== index ? '' : undefined}>
                <div className="marketplace-hero-media"><img src={banner.image_url} alt="" /></div>
                <div className="marketplace-hero-copy"><h2>{banner.title}</h2><p>{banner.description}</p><a className="marketplace-button" href={banner.button_link}>{banner.button_text}</a></div>
              </div>)}
            </div></div>
            {slides.length > 1 && <div className="marketplace-hero-controls"><button aria-label="Previous banner" onClick={() => setActiveSlide((value) => (value - 1 + slides.length) % slides.length)}>←</button><div className="marketplace-hero-pagination">{slides.map((_, i) => <button key={i} className={i === index ? 'active' : ''} aria-label={`Go to banner ${i + 1}`} aria-current={i === index ? 'true' : undefined} onClick={() => setActiveSlide(i)} />)}<button className="marketplace-play" aria-label={playing ? 'Pause slideshow' : 'Play slideshow'} onClick={() => setPlaying(!playing)}>{playing ? 'Ⅱ' : '▶'}</button><span className="visually-hidden" aria-live="polite">{index + 1} / {slides.length}</span></div><button aria-label="Next banner" onClick={() => setActiveSlide((value) => (value + 1) % slides.length)}>→</button></div>}
          </section>}
          <div id="marketplace-products">{data.sliders?.map((category) => <CategorySection key={category.id} category={category} />)}</div>
          {!data.sliders?.length && !slides.length && <p>No marketplace items available.</p>}
        </>}
      </main>
      <footer className="marketplace-footer marketplace-container"><p>© {new Date().getFullYear()} Lufera Infotech</p><nav aria-label="Legal links"><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms-condition">Terms and Conditions</Link></nav></footer>
    </div>
    <Modal show={sessionChecked && !signedIn} backdrop="static" keyboard={false} centered scrollable size="xl" className="marketplace-sign-in" aria-label="Sign in to marketplace"><Modal.Body><SignInLayer returnPath="/external/marketplace" onAuthenticated={() => setSignedIn(true)} /></Modal.Body></Modal>
  </div>;
}

function CategorySection({ category }) {
  const track = useRef(null);
  const [duration, setDuration] = useState('');
  const items = category.items ?? [];
  const durations = [...new Set(items.flatMap((item) => (item.durations ?? []).map((entry) => entry.duration)))];
  const selectedDuration = durations.includes(duration) ? duration : durations[0];
  const scroll = (direction) => {
    const element = track.current;
    if (!element) return;
    const card = element.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(element).columnGap || '0') : element.clientWidth;
    element.scrollBy({ left: direction * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return <section className={`marketplace-category marketplace-layout-${category.type === 'package' ? 'package' : category.slider || 1}`} aria-label={category.category_name}>
    <div className="marketplace-category-intro"><h2><Link to={category.page_path}>{category.category_name}</Link></h2><div className="marketplace-decoration" aria-hidden="true"><span /><i /><i /><i /><span /></div>
      {category.image_url && <div className="marketplace-category-image"><img src={category.image_url} alt={category.category_name} /></div>}
      <div className="marketplace-category-bottom"><div>{category.description && <><h3>Description</h3><p>{category.description}</p></>}</div></div>
    </div>
    {durations.length > 1 && <div className="marketplace-duration-tabs" role="group" aria-label={`${category.category_name} duration`}>{durations.map((value) => <button key={value} aria-pressed={value === selectedDuration} onClick={() => setDuration(value)}>{value}</button>)}</div>}
    <div className="marketplace-catalog-slider">{items.length > 1 && <div className="marketplace-category-arrows"><button aria-label={`Previous ${category.category_name}`} onClick={() => scroll(-1)}>←</button><button aria-label={`Next ${category.category_name}`} onClick={() => scroll(1)}>→</button></div>}
    <div className="marketplace-catalog-track" ref={track} tabIndex={items.length ? 0 : undefined} aria-label={`${category.category_name} items`}>
      {items.map((item) => <CatalogCard key={item.id} item={item} duration={selectedDuration} categoryName={category.category_name} />)}
    </div>
    </div>
    {!items.length && <p className="marketplace-category-empty">{category.requires_login ? 'Sign in to explore this category.' : 'No items available in this category yet.'}</p>}
  </section>;
}

function CatalogCard({ item, duration, categoryName }) {
  const variant = item.durations?.find((entry) => entry.duration === duration);
  const price = item.type === 'package' ? variant?.price : item.price;
  const oldPrice = item.type === 'package' ? variant?.preview_price : item.preview_price;
  const unavailable = item.type === 'package' && !variant && !item.pricing_locked;
  return <article className="marketplace-catalog-card">
    {item.type !== 'package' && <img className="marketplace-card-image" src={item.banner_url || item.image_url} alt="" loading="lazy" />}
    <div className="marketplace-card-content">
      {item.type !== 'package' && <img className="marketplace-card-thumb" src={item.image_url} alt="" loading="lazy" />}
      <div><h3><Link to={item.page_path}>{item.type === 'package' ? item.title : item.name}</Link></h3><p>{item.type === 'package' ? item.subtitle : item.short_description}</p>
      {item.pricing_locked ? <p>Sign in to view pricing</p> : unavailable ? <p>Unavailable for {duration}</p> : price != null && <p className="marketplace-price">{Number(oldPrice) > Number(price) && <del>{money(oldPrice)}</del>}<strong>{money(price)}</strong>{variant && <span> / {variant.duration}</span>}</p>}
      <div className="marketplace-card-actions"><Link className="marketplace-button" to={item.page_path}>View More</Link><a className="marketplace-button marketplace-button-outline" href={`mailto:info@luferatech.com?subject=${encodeURIComponent(`Purchase enquiry: ${item.name}${variant ? ` (${variant.duration})` : ''}`)}`}>Enquire Now</a></div>
      {item.type === 'package' ? <ul>{item.inclusions?.slice(0, 5).map((feature, i) => <li key={i}>✓ {feature}</li>)}</ul> : <p className="marketplace-card-meta">{categoryName}{item.tags && ` · ${item.tags}`}</p>}
      </div>
    </div>
  </article>;
}
