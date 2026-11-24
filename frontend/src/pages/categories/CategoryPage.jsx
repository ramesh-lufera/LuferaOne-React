import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { apiUrl } from '../../helper/auth';
import usePageTabTitle from '../../helper/usePageTabTitle';
import MasterLayout from '../../masterLayout/MasterLayout';
import { api } from '../../services/api';
import './CategoryPage.css';

export default function CategoryPage() {
  return <MasterLayout><CategoryDetails /></MasterLayout>;
}

// eslint-disable-next-line react/prop-types
export function CategoryDetails({ external = false, children }) {
  const { filename } = useParams();
  const { pathname } = useLocation();
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [showApi, setShowApi] = useState(false);
  const categoryName = result?.filename === filename && result.attempt === attempt ? result.category?.name : null;
  usePageTabTitle(categoryName);

  useEffect(() => {
    const controller = new AbortController();
    api(`${external ? '/external' : ''}/categories/${encodeURIComponent(filename)}`, { signal: controller.signal })
      .then(({ category }) => {
        if (!controller.signal.aborted) setResult({ filename, attempt, category });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ filename, attempt, error });
      });
    return () => controller.abort();
  }, [external, filename, attempt]);

  if (result?.filename !== filename || result.attempt !== attempt) {
    return <div className="category-detail"><p role="status">Loading category…</p></div>;
  }
  if (result.error?.status === 404) {
    return external ? <p className="py-16" role="status">Category not found.</p> : <Navigate to="/404" replace />;
  }
  if (external && result.error?.status === 401) {
    return (
      <div className="category-detail-panel">
        <p>Sign in to view this category.</p>
        <Link className="btn btn-primary" to={`/sign-in?returnTo=${encodeURIComponent(pathname)}`}>Sign In</Link>
      </div>
    );
  }
  if (result.error) {
    return (
      <div className="category-detail">
        <div className="alert alert-danger" role="alert">
          {result.error.message}{' '}
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { category } = result;
  const canonicalPath = external ? `/external${category.page_path}` : category.page_path;
  if (pathname !== canonicalPath) return <Navigate to={canonicalPath} replace />;
  const pricingItems = category.type === 'product' ? 'products' : 'packages';

  return (
    <article className={external ? 'category-detail' : 'category-detail category-detail-internal'}>
      {external ? (
        <header className="category-external-hero">
          {category.featured_image_url && <img src={category.featured_image_url} alt="" />}
          <h1>{category.name}</h1>
        </header>
      ) : (
        <header className="category-detail-header">
          <div className="category-detail-heading">
            <h1>{category.name}</h1>
            <nav aria-label="Breadcrumb">
            <span className="category-detail-breadcrumb-label">Categories</span>
            <span aria-hidden="true">/</span>
              <span aria-current="page">{category.name}</span>
            </nav>
          </div>
          <div className="category-detail-actions">
            <button type="button" aria-haspopup="dialog" onClick={() => setShowApi(true)}>API</button>
            <Link to="/categories">Manage</Link>
          </div>
        </header>
      )}

      {!external && category.featured_image_url && (
        <div className="category-detail-panel category-detail-image">
          <img src={category.featured_image_url} alt={category.name} />
        </div>
      )}

      <section className="category-detail-panel category-detail-description-panel">
        <h2>Description</h2>
        <p className="category-detail-description">{category.description || 'No description available.'}</p>
      </section>

      <section className="category-detail-panel category-detail-features-panel">
        <h2>Features</h2>
        <div className="category-detail-features">
          {[
            ['Inclusions', '✓', category.inclusions],
            ['Exclusions', '×', category.exclusions],
          ].map(([label, symbol, items]) => (
            <ul key={label} aria-label={label}>
              {items.map((item, index) => (
                <li key={index}>
                  <span className="category-detail-feature-mark" aria-hidden="true">{symbol}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ))}
          {!category.inclusions.length && !category.exclusions.length && <p>No features available.</p>}
        </div>
      </section>

      <section className="category-detail-panel category-detail-pricing-panel">
        <h2>{category.type === 'product' ? 'Products Pricing Table' : 'Packages Pricing Table'}</h2>
        <div className="category-detail-pricing">
          <p>No {pricingItems} available.</p>
        </div>
      </section>

      {external ? (
        children
      ) : (
        <Modal show={showApi} onHide={() => setShowApi(false)} centered aria-labelledby="category-api-title">
          <Modal.Header closeButton>
            <Modal.Title id="category-api-title">Category API</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <code className="text-break">GET {apiUrl}/categories/{encodeURIComponent(filename)}</code>
            <div className="mt-12">
              <Link to={`/external${category.page_path}`} className="text-primary-600">Open external category page</Link>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </article>
  );
}
