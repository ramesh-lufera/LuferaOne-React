/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import MasterLayout from '../../masterLayout/MasterLayout';
import ModulePageHeader from '../../components/ModulePageHeader';
import { api } from '../../services/api';
import './PackagePage.css';

export function ImageField({ name, label, required = true, initialUrl, removeIndex }) {
  const input = useRef(null);
  const [file, setFile] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [preview, setPreview] = useState('');
  const [fileError, setFileError] = useState('');
  function chooseFile(selectedFile) {
    const message = selectedFile?.size > 5 * 1024 * 1024 ? `${label} must be no larger than 5 MB.` : '';
    input.current.setCustomValidity(message);
    setFileError(message);
    setFile(message ? null : selectedFile ?? null);
    setRemoved(false);
  }
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <div>
    <label className="form-label" htmlFor={name}>{label} {required && <span className="text-danger">*</span>}</label>
    <label className="package-image-drop" htmlFor={name} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files.length) {
        const transfer = new DataTransfer();
        transfer.items.add(files[0]);
        input.current.files = transfer.files;
        chooseFile(files[0]);
      }
    }}>
      {(preview || (!removed && initialUrl)) ? <img src={preview || initialUrl} alt={`${label} preview`} /> : <span>Click or Drag Image Here</span>}
      <input ref={input} id={name} name={name} type="file" accept="image/jpeg,image/png,image/webp" required={required} aria-invalid={Boolean(fileError)} aria-describedby={`${name}-help`} onChange={(event) => chooseFile(event.target.files[0])} />
      {file && <span>{file.name}</span>}
    </label>
    {fileError && <p className="text-danger text-sm mt-8 mb-0" role="alert">{fileError}</p>}
    <small id={`${name}-help`}>JPEG, PNG or WebP, up to 5 MB{initialUrl && removeIndex === undefined ? '. Leave empty to keep the current image.' : ''}</small>
    {initialUrl && removeIndex !== undefined && <label className="package-checkboxes mt-8"><input type="checkbox" name="remove_gallery_images[]" value={removeIndex} checked={removed} onChange={(event) => {
      setRemoved(event.target.checked);
      setFile(null);
      input.current.value = '';
      input.current.setCustomValidity('');
      setFileError('');
    }} /> Remove gallery image {removeIndex + 1}</label>}
  </div>;
}

export function RepeatedRows({ name, label, pricing = false, initialItems = [] }) {
  const [rows, setRows] = useState(() => Array.from({ length: Math.max(1, initialItems.length) }, (_, index) => index + 1));
  const next = useRef(rows.length + 1);
  return <div className="package-repeated" role="group" aria-label={label}>
    <label className="form-label">{label} <span className="text-danger">*</span></label>
    {rows.map((id, index) => <div className={pricing ? 'package-price-row' : 'package-feature-row'} key={id}>
      {pricing ? <>
        <input className="form-control" name={`${name}[${index}][value]`} type="number" min="1" max="10000" step="1" defaultValue={initialItems[id - 1]?.value ?? ''} placeholder="Value" aria-label={`Duration value ${index + 1}`} required />
        <select className="form-select" name={`${name}[${index}][unit]`} aria-label={`Duration unit ${index + 1}`} required defaultValue={initialItems[id - 1]?.unit ?? ''}><option value="" disabled>Select Unit</option>{['day', 'week', 'month', 'year'].map((unit) => <option key={unit} value={unit}>{unit[0].toUpperCase() + unit.slice(1)}</option>)}</select>
        <input className="form-control" name={`${name}[${index}][price]`} type="number" min="0" max="99999999.99" step="0.01" defaultValue={initialItems[id - 1]?.price ?? ''} placeholder="Enter price" aria-label={`Price ${index + 1}`} required />
        <input className="form-control" name={`${name}[${index}][preview_price]`} type="number" min="0" max="99999999.99" step="0.01" defaultValue={initialItems[id - 1]?.preview_price ?? ''} placeholder="Enter preview price" aria-label={`Preview price ${index + 1}`} />
      </> : <input className="form-control" name={`${name}[]`} defaultValue={initialItems[id - 1] ?? ''} aria-label={`${label} ${index + 1}`} maxLength={255} required />}
      {index === 0 ? <button type="button" className="btn btn-success" data-theme-exempt aria-label={`Add ${label}`} disabled={rows.length >= 50} onClick={() => { const row = next.current++; setRows((current) => [...current, row]); }}>+</button> : <button type="button" className="btn btn-danger" data-theme-exempt aria-label={`Remove ${label} ${index + 1}`} onClick={() => setRows((current) => current.filter((row) => row !== id))}>−</button>}
    </div>)}
  </div>;
}

export default function PackageFormPage() {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const editing = pathname === '/package-edit';
  const slug = editing ? params.get('package') : null;
  const categoryId = params.get('category');
  const module = params.get('module')?.trim();
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    if (editing && !slug) return () => controller.abort();
    Promise.all([
      api('/packages/categories', { signal: controller.signal }),
      api('/packages/options/taxes', { signal: controller.signal }),
      editing ? api(`/packages/${encodeURIComponent(slug)}`, { signal: controller.signal }) : Promise.resolve(null),
    ]).then(([data, taxData, record]) => {
      if (!controller.signal.aborted) setResult({ slug, categories: data.categories, taxes: taxData.taxes, record: record?.package });
    }).catch((error) => {
      if (!controller.signal.aborted) setResult({ slug, error });
    });
    return () => controller.abort();
  }, [editing, slug, attempt]);
  const category = result?.categories?.find((item) => String(item.id) === categoryId);
  return <MasterLayout>
    <ModulePageHeader title={editing ? 'Edit Package' : 'Add Package'} />
    {editing && !slug ? <p className="alert alert-warning">Select a package to edit from <Link to="/packages">Packages</Link>.</p>
      : result?.slug === slug && result.error ? <p className="alert alert-danger" role="alert">{result.error.status === 404 ? 'Package not found.' : result.error.message} <button type="button" onClick={() => setAttempt((value) => value + 1)}>Try again</button> <Link to="/packages">Back to Packages</Link></p>
      : !result || result.slug !== slug ? <p role="status">Loading package form…</p>
      : !editing && (!category || !module || module.length > 255) ? <p className="alert alert-warning">Select a category and module from <Link to="/packages">Add New Package</Link> to continue.</p>
      : <PackageEditor key={slug ?? `${categoryId}-${module}`} categories={result.categories} taxes={result.taxes} record={result.record} categoryId={categoryId} module={module} />}
  </MasterLayout>;
}

function PackageEditor({ categories, taxes = [], record, categoryId, module }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const [taxId, setTaxId] = useState(() => record?.tax_id ? String(record.tax_id) : record?.gst != null ? 'legacy' : '');
  const selectedTax = taxes.find((tax) => String(tax.id) === taxId);
  async function save(event) {
    event.preventDefault();
    if (pending.current) return;
    const body = new FormData(event.currentTarget);
    for (let index = 0; index < 3; index += 1) {
      const key = `gallery_images[${index}]`;
      if (!body.get(key)?.size) body.delete(key);
    }
    for (const key of ['package_image', 'breadcrumb_image']) {
      if (!body.get(key)?.size) body.delete(key);
    }
    if (body.get('tax_id') === 'legacy') {
      body.delete('tax_id');
      body.set('gst', String(record.gst));
    }
    if (record) body.set('_method', 'PUT');
    body.set('requires_login', body.has('requires_login') ? '1' : '0');
    if (!body.getAll('addons[]').length) {
      setErrors(['Select at least one add-on type.']);
      return;
    }
    pending.current = true;
    setSaving(true);
    setErrors([]);
    try {
      const result = await api(record ? `/packages/${record.id}` : '/packages', { method: 'POST', body });
      navigate(result.page_path, { replace: true, state: { message: result.message } });
    } catch (error) {
      setErrors(error.errors ? Object.values(error.errors).flat() : [error.message]);
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  return <>
      {!record && <p className="mb-16">Category: <strong>{categories.find((item) => String(item.id) === categoryId)?.name}</strong> <span className="mx-12">/</span> Module: <strong>{module}</strong></p>}
      <form className="package-form card p-24 radius-12" onSubmit={save}>
        {errors.length > 0 && <div className="alert alert-danger" role="alert"><ul className="mb-0">{errors.map((error, i) => <li key={i}>{error}</li>)}</ul></div>}
        <fieldset disabled={saving}>
          <div className="package-form-images">
            <div><label className="form-label" htmlFor="package-category-id">Category <span className="text-danger">*</span></label><select className="form-select" name="category_id" id="package-category-id" defaultValue={record?.category_id ?? categoryId} required>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
            <div><label className="form-label" htmlFor="package-module-name">Module <span className="text-danger">*</span></label><input className="form-control" name="module" id="package-module-name" defaultValue={record?.module ?? module} maxLength={255} required /></div>
          </div>
          <div className="package-form-images"><ImageField name="package_image" label="Package Image" required={!record} initialUrl={record?.package_image_url} /><ImageField name="breadcrumb_image" label="Breadcrumb Image" required={!record} initialUrl={record?.breadcrumb_image_url} /></div>
          <div className="package-form-field">
            <h2 className="text-lg mb-8">Package Gallery</h2>
            <p className="mb-16">Add up to three gallery images. Package Image appears as the first thumbnail, followed by these three images.</p>
            <div className="package-gallery-uploads">{[0, 1, 2].map((index) => <ImageField key={index} name={`gallery_images[${index}]`} label={`Gallery Image ${index + 1}`} required={false} initialUrl={record?.gallery_image_urls?.[index]} removeIndex={index} />)}</div>
          </div>
          {[['name', 'Package name'], ['title', 'Title'], ['subtitle', 'Subtitle'], ['description', 'Description'], ['short_description', 'Short Description']].map(([name, label]) => <div className="package-form-field" key={name}>
            <label className="form-label" htmlFor={`package-${name}`}>{label} <span className="text-danger">*</span></label>
            {name.includes('description') ? <textarea className="form-control" id={`package-${name}`} name={name} rows={3} defaultValue={record?.[name] ?? ''} maxLength={name === 'description' ? 10000 : 2000} required /> : <input className="form-control" id={`package-${name}`} name={name} defaultValue={record?.[name] ?? ''} maxLength={255} required />}
          </div>)}
          <RepeatedRows name="durations" label="Duration & Price" pricing initialItems={record?.durations} />
          <div className="package-form-field"><div className="form-label">Features <span className="text-danger">*</span></div><div className="package-feature-columns"><RepeatedRows name="inclusions" label="Inclusive" initialItems={record?.inclusions} /><RepeatedRows name="exclusions" label="Exclusive" initialItems={record?.exclusions} /></div></div>
          <div className="package-form-field"><p className="form-label" id="package-addons-label">Add-Ons <span className="text-danger">*</span></p><div className="package-checkboxes" role="group" aria-labelledby="package-addons-label">
            {[['packages', 'Packages'], ['products', 'Products'], ['services', 'Add-on Services']].map(([value, label]) => <label key={value}><input type="checkbox" name="addons[]" value={value} defaultChecked={record?.addons?.includes(value) ?? false} /> {label}</label>)}
          </div></div>
          <div className="package-form-field">
            <label className="form-label" htmlFor="package-tax">Tax</label>
            <select className="form-select" id="package-tax" name="tax_id" value={taxId} onChange={(event) => setTaxId(event.target.value)} aria-describedby="package-tax-help">
              <option value="">No tax</option>
              {record?.gst != null && !record.tax_id && <option value="legacy">Saved GST: {record.gst}% (legacy)</option>}
              {taxes.map((tax) => <option key={tax.id} value={tax.id}>{tax.name} — {tax.region} — {tax.rate}% — {tax.type === 'inclusive' ? 'Inclusive' : 'Exclusive'}{tax.is_default ? ' (Default for region)' : ''}</option>)}
            </select>
            <p className="text-sm mt-8 mb-0" id="package-tax-help">All regions are available. Choose the tax for the package’s intended country / region. Regional defaults are marked; no tax is selected automatically.</p>
            {!taxes.length && <p className="text-sm mt-8 mb-0">No tax records available. Create a tax in Settings → Taxes, then reload this form.</p>}
            {selectedTax && <p className="text-sm mt-8 mb-0">{selectedTax.type === 'inclusive' ? 'Inclusive: the entered package price already includes this tax.' : 'Exclusive: this tax is added to the entered package price.'} Changes to this tax record will also affect linked packages.</p>}
          </div>
          <div className="package-form-field"><p className="form-label">Is Login?</p><label className="package-checkboxes"><input type="checkbox" name="requires_login" defaultChecked={Boolean(record?.requires_login)} /> Require login to show package pricing</label></div>
          <div className="text-center"><button className="btn btn-primary package-submit" disabled={saving}>{saving ? 'Saving…' : record ? 'Save Changes' : 'Submit'}</button> <Link className="btn btn-outline-secondary" to="/packages" aria-disabled={saving} onClick={(event) => { if (saving) event.preventDefault(); }}>Cancel</Link></div>
        </fieldset>
      </form>
  </>;
}
