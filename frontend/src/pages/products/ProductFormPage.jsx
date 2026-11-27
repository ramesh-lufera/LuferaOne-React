/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import MasterLayout from '../../masterLayout/MasterLayout';
import ModulePageHeader from '../../components/ModulePageHeader';
import { ImageField, RepeatedRows } from '../packages/PackageFormPage';
import { api } from '../../services/api';
import '../packages/PackagePage.css';

export default function ProductFormPage() {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const editing = pathname === '/product-edit';
  const slug = editing ? params.get('product') : null;
  const categoryId = params.get('category');
  const module = params.get('module')?.trim();
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    if (editing && !slug) return () => controller.abort();
    Promise.all([
      api('/products/categories', { signal: controller.signal }),
      api('/products/options/taxes', { signal: controller.signal }),
      editing ? api(`/products/${encodeURIComponent(slug)}`, { signal: controller.signal }) : Promise.resolve(null),
    ]).then(([data, taxData, record]) => {
      if (!controller.signal.aborted) setResult({ slug, categories: data.categories, taxes: taxData.taxes, record: record?.product });
    }).catch((error) => { if (!controller.signal.aborted) setResult({ slug, error }); });
    return () => controller.abort();
  }, [editing, slug, attempt]);
  const category = result?.categories?.find((item) => String(item.id) === categoryId);
  return <MasterLayout>
    <ModulePageHeader title={editing ? 'Edit Product' : 'Add Product'} />
    {editing && !slug ? <p className="alert alert-warning">Select a product to edit from <Link to="/products">Products</Link>.</p>
      : result?.slug === slug && result.error ? <p className="alert alert-danger" role="alert">{result.error.status === 404 ? 'Product not found.' : result.error.message} <button type="button" onClick={() => setAttempt((value) => value + 1)}>Try again</button> <Link to="/products">Back to Products</Link></p>
      : !result || result.slug !== slug ? <p role="status">Loading product form…</p>
      : !editing && (!category || !module || module.length > 255) ? <p className="alert alert-warning">Select a category and module from <Link to="/products">Add New Product</Link> to continue.</p>
      : <ProductEditor categoryId={categoryId} module={module} key={slug ?? `${categoryId}-${module}`} categories={result.categories} taxes={result.taxes} record={result.record} />}
  </MasterLayout>;
}

function ProductEditor({ categories, taxes, record, categoryId, module }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  async function save(event) {
    event.preventDefault();
    if (pending.current) return;
    const body = new FormData(event.currentTarget);
    for (const key of ['product_image', 'breadcrumb_image', ...[0, 1, 2].map((index) => `gallery_images[${index}]`)]) {
      if (!body.get(key)?.size) body.delete(key);
    }
    if (record) body.set('_method', 'PUT');
    for (const key of ['is_featured', 'requires_login']) body.set(key, body.has(key) ? '1' : '0');
    pending.current = true;
    setSaving(true);
    setErrors([]);
    try {
      const result = await api(record ? `/products/${record.id}` : '/products', { method: 'POST', body });
      navigate(result.page_path, { replace: true, state: { message: result.message } });
    } catch (error) {
      setErrors(error.errors ? Object.values(error.errors).flat() : [error.message]);
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }
  return <form className="package-form card p-24 radius-12" onSubmit={save}>
    {errors.length > 0 && <div className="alert alert-danger" role="alert"><ul className="mb-0">{errors.map((error, i) => <li key={i}>{error}</li>)}</ul></div>}
    {!categories.length && <p className="alert alert-warning">Create a category with type Product before adding a product.</p>}
    <fieldset disabled={saving}>
      <div className="package-form-images"><ImageField name="product_image" label="Product Image" required={!record} initialUrl={record?.product_image_url} /><ImageField name="breadcrumb_image" label="Breadcrumb Image" required={!record} initialUrl={record?.breadcrumb_image_url} /></div>
      {[['name', 'Product name'], ['title', 'Title'], ['subtitle', 'Subtitle'], ['description', 'Description'], ['short_description', 'Short Description']].map(([name, label]) => <div className="package-form-field" key={name}>
        <label className="form-label" htmlFor={`product-${name}`}>{label} <span className="text-danger">*</span></label>
        {name.includes('description') ? <textarea className="form-control" id={`product-${name}`} name={name} rows={3} defaultValue={record?.[name] ?? ''} maxLength={name === 'description' ? 10000 : 2000} required /> : <input className="form-control" id={`product-${name}`} name={name} defaultValue={record?.[name] ?? ''} maxLength={255} required />}
      </div>)}
      {[['price', 'Price'], ['preview_price', 'Preview Price']].map(([name, label]) => <div className="package-form-field" key={name}><label className="form-label" htmlFor={`product-${name}`}>{label} <span className="text-danger">*</span></label><input className="form-control" id={`product-${name}`} name={name} type="number" min="0" max="99999999.99" step="0.01" defaultValue={record?.[name] ?? ''} required /></div>)}
      <div className="package-form-field"><label className="form-label" htmlFor="product-duration">Duration <span className="text-danger">*</span></label><div className="package-form-images"><input className="form-control" id="product-duration" name="duration_value" type="number" min="1" max="10000" step="1" defaultValue={record?.duration_value ?? ''} required /><select className="form-select" name="duration_unit" aria-label="Duration unit" defaultValue={record?.duration_unit ?? 'day'} required>{[['day', 'Days'], ['week', 'Weeks'], ['month', 'Months'], ['year', 'Years']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
      <input type="hidden" name="category_id" value={record?.category_id ?? categoryId} />
      {!record && <input type="hidden" name="module" value={module} />}
      <div className="package-form-field"><label className="form-label" htmlFor="product-category">Category <span className="text-danger">*</span></label><input className="form-control" id="product-category" name="category" defaultValue={record?.category ?? ''} maxLength={255} required /></div>

      <div className="package-form-field"><label className="form-label" htmlFor="product-tags">Tags <span className="text-danger">*</span></label><input className="form-control" id="product-tags" name="tags" maxLength={2000} defaultValue={record?.tags ?? ''} required /></div>
      <div className="package-form-field"><p className="form-label">Features <span className="text-danger">*</span></p><div className="package-feature-columns"><RepeatedRows name="inclusions" label="Inclusive" initialItems={record?.inclusions} /><RepeatedRows name="exclusions" label="Exclusive" initialItems={record?.exclusions} /></div></div>
      <div className="package-form-field"><p className="form-label">Feature item</p><label className="package-checkboxes"><input type="checkbox" name="is_featured" defaultChecked={Boolean(record?.is_featured)} /> Mark as featured product</label></div>
      <div className="package-form-field"><p className="form-label">Is Login?</p><label className="package-checkboxes"><input type="checkbox" name="requires_login" defaultChecked={Boolean(record?.requires_login)} /> Require login to purchase</label></div>
      <details className="package-form-field"><summary className="form-label">Gallery and tax options</summary>
        <div className="package-form-field"><h2 className="text-lg">Product Gallery</h2><p>Add up to three gallery images.</p><div className="package-gallery-uploads">{[0, 1, 2].map((index) => <ImageField key={index} name={`gallery_images[${index}]`} label={`Gallery Image ${index + 1}`} required={false} initialUrl={record?.gallery_image_urls?.[index]} removeIndex={index} />)}</div></div>
        <label className="form-label" htmlFor="product-tax">Tax</label><select className="form-select" id="product-tax" name="tax_id" defaultValue={record?.tax_id ?? ''}><option value="">No tax</option>{taxes.map((tax) => <option key={tax.id} value={tax.id}>{tax.name} — {tax.region} — {tax.rate}% — {tax.type === 'inclusive' ? 'Inclusive' : 'Exclusive'}{tax.is_default ? ' (Default for region)' : ''}</option>)}</select>
      </details>
      <div className="text-center"><button className="btn btn-primary package-submit" disabled={saving || !categories.length}>{saving ? 'Saving…' : record ? 'Save Changes' : 'Submit'}</button> <Link className="btn btn-outline-secondary" to="/products" onClick={(event) => { if (saving) event.preventDefault(); }}>Cancel</Link></div>
    </fieldset>
  </form>;
}
