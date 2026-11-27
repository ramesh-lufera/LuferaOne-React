/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Modal } from 'react-bootstrap';
import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import ModuleTable, { ModuleTableToolbar, ModuleTablePagination } from '../components/ModuleTable';
import ModuleTableCell from '../components/ModuleTableCell';
import { ImageField } from './packages/PackageFormPage';
import { api } from '../services/api';
import { apiUrl } from '../helper/auth';
import './MarketplacePage.css';

const endpoint = '/settings/marketplace';
const sliderColumns = [{ label: '#', width: 70 }, { label: 'Category', width: 280 }, { label: 'Type', width: 160 }, { label: 'Slider', width: 160 }, { label: 'Action', width: 150, align: 'center' }];
const bannerColumns = [1, 2, 3].map((i) => ({ label: `Slide ${i}`, width: 270 })).concat({ label: 'Action', width: 150, align: 'center' });

export default function MarketplacePage() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('sliders');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [dialog, setDialog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [order, setOrder] = useState([]);
  const dragIndex = useRef(null);
  const pending = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    setError('');
    api(endpoint, { signal: controller.signal }).then((result) => { if (!controller.signal.aborted) setData(result); })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [refresh]);
  function open(next) { setDialog(next); setFormError(''); }
  async function mutate(path, options) {
    if (pending.current) return;
    pending.current = true; setSaving(true); setFormError('');
    try {
      const result = await api(endpoint + path, options);
      setMessage(result.message); setDialog(null); setRefresh((value) => value + 1);
    } catch (err) { setFormError(err.errors ? Object.values(err.errors).flat().join(' ') : err.message); }
    finally { pending.current = false; setSaving(false); }
  }
  function submit(event) {
    event.preventDefault();
    const body = new FormData(event.currentTarget);
    const record = dialog.record;
    if (dialog.type === 'sliders') {
      mutate(`/sliders${record ? `/${record.id}` : ''}`, { method: record ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category_id: Number(body.get('category_id')), slider: body.get('slider') ? Number(body.get('slider')) : null }) });
    } else {
      for (let i = 0; i < 3; i++) if (!body.get(`slides[${i}][image]`)?.size) body.delete(`slides[${i}][image]`);
      if (record) body.set('_method', 'PUT');
      mutate(`/banners${record ? `/${record.id}` : ''}`, { method: 'POST', body });
    }
  }
  const rows = (data?.[tab] ?? []).filter((item) => (tab === 'sliders' ? `${item.category_name} ${item.type} ${item.slider ? `Slider ${item.slider}` : ''}` : item.slides.map((slide) => slide.title).join(' ')).toLowerCase().includes(search.toLowerCase()));
  const pages = Math.max(1, Math.ceil(rows.length / limit));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * limit;
  const visible = rows.slice(start, start + limit);
  function move(from, to) {
    if (to < 0 || to >= order.length || from === to) return;
    setOrder((items) => { const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; });
  }
  function actions(item) {
    return <div className="d-flex justify-content-center gap-10">
      <button type="button" className="module-table-action bg-success-focus text-success-600 w-40-px h-40-px rounded-circle" aria-label={`Edit ${tab === 'sliders' ? item.category_name : `banner ${item.id}`}`} onClick={() => open({ type: tab, record: item })}><Icon icon="lucide:edit" /></button>
      <button type="button" className="module-table-action bg-danger-focus text-danger-600 w-40-px h-40-px rounded-circle" aria-label={`Delete ${tab === 'sliders' ? item.category_name : `banner ${item.id}`}`} onClick={() => open({ type: 'delete', resource: tab, record: item })}><Icon icon="fluent:delete-24-regular" /></button>
    </div>;
  }
  return <MasterLayout>
    <ModulePageHeader title="Marketplace" />
    <div className="d-flex justify-content-end mb-16"><button type="button" className="btn btn-primary" onClick={() => open({ type: 'api' })}>API</button></div>
    {message && <p className="alert alert-success" role="status">{message}</p>}
    {error && <p className="alert alert-danger" role="alert">{error} <button type="button" onClick={() => setRefresh((value) => value + 1)}>Try again</button></p>}
    <div className="marketplace-settings-tabs mb-24" role="tablist" aria-label="Marketplace settings">
      {[['sliders', 'Marketplace Slider'], ['banners', 'Marketplace Banner']].map(([value, label]) => <button type="button" key={value} role="tab" id={`marketplace-${value}-tab`} aria-controls="marketplace-panel" aria-selected={tab === value} className="marketplace-settings-tab" onClick={() => { setTab(value); setPage(1); setSearch(''); }}>{label}</button>)}
    </div>
    <section className="card" id="marketplace-panel" role="tabpanel" aria-labelledby={`marketplace-${tab}-tab`}>
      <ModuleTableToolbar id="marketplace-limit" limit={limit} onLimitChange={(value) => { setLimit(value); setPage(1); }} search={search} searchLabel="Search marketplace" searchMaxLength={255} onSearchChange={(value) => { setSearch(value); setPage(1); }} actions={<>
        <button className="btn btn-primary" disabled={!data || Boolean(error)} onClick={() => open({ type: tab })}>{tab === 'sliders' ? 'Add New' : 'Add Banner'}</button>
        {tab === 'sliders' && <button className="btn btn-primary" disabled={!data?.sliders.length || Boolean(error)} onClick={() => { setOrder(data.sliders); open({ type: 'order' }); }}>Swap Marketplace</button>}
      </>} />
      <div className="card-body p-24">
        <ModuleTable columns={tab === 'sliders' ? sliderColumns : bannerColumns}>
          {!data || !visible.length ? <tr><td colSpan={tab === 'sliders' ? 5 : 4}>{error ? 'Marketplace unavailable.' : !data ? 'Loading marketplace…' : 'No records found.'}</td></tr> : visible.map((item, index) => <tr key={item.id}>
            {tab === 'sliders' ? <><td>{start + index + 1}</td><td><ModuleTableCell id={`marketplace-${item.id}`}>{item.category_name}</ModuleTableCell></td><td>{item.type}</td><td>{item.slider ? `Slider ${item.slider}` : '—'}</td></> : item.slides.map((slide, i) => <td key={i}><img className="marketplace-banner-thumb" src={slide.image_url} alt={`Slide ${i + 1}`} /><ModuleTableCell id={`banner-${item.id}-${i}`}>{slide.title}</ModuleTableCell></td>)}
            <td className="text-center">{actions(item)}</td>
          </tr>)}
        </ModuleTable>
        <ModuleTablePagination page={currentPage} pages={pages} loading={!data || Boolean(error)} from={rows.length ? start + 1 : 0} to={Math.min(start + limit, rows.length)} total={rows.length} onPageChange={setPage} label="Marketplace pages" />
      </div>
    </section>
    <Modal show={Boolean(dialog)} onHide={() => { if (!saving) setDialog(null); }} centered scrollable size={dialog?.type === 'banners' ? 'lg' : undefined} backdrop={saving ? 'static' : true} keyboard={!saving} aria-labelledby="marketplace-dialog-title">
      <Modal.Header closeButton={!saving}><Modal.Title as="h2" className="text-xl" id="marketplace-dialog-title">{dialog?.type === 'api' ? 'API Details' : dialog?.type === 'order' ? 'Swap Marketplace Order' : dialog?.type === 'delete' ? 'Delete Marketplace Record' : dialog?.type === 'banners' ? `${dialog.record ? 'Edit' : 'Add'} Marketplace Banner` : `${dialog?.record ? 'Edit' : 'Add'} Marketplace`}</Modal.Title></Modal.Header>
      {dialog && <>
        {dialog.type === 'api' ? <Modal.Body><CopyField label="Landing URL" value={`${window.location.origin}/external/marketplace`} /><CopyField label="API URL" value={`${apiUrl}/external/marketplace`} /><CopyField label="Embed code" value={`<iframe src="${window.location.origin}/external/marketplace" title="Marketplace" width="100%" height="900" style="border:0"></iframe>`} /></Modal.Body>
          : dialog.type === 'delete' ? <><Modal.Body><p>Remove {dialog.record.category_name ?? `banner ${dialog.record.id}`} from the marketplace?{dialog.resource === 'banners' && ' Its three images will also be removed.'}</p>{formError && <p className="alert alert-danger" role="alert">{formError}</p>}</Modal.Body><Modal.Footer><button className="btn btn-outline-secondary" disabled={saving} onClick={() => setDialog(null)}>Cancel</button><button className="btn btn-danger" disabled={saving} onClick={() => mutate(`/${dialog.resource}/${dialog.record.id}`, { method: 'DELETE' })}>{saving ? 'Deleting…' : 'Delete'}</button></Modal.Footer></>
          : dialog.type === 'order' ? <><Modal.Body><p>Drag categories to change their display order, or use the arrow buttons.</p><ol className="marketplace-order">{order.map((item, i) => <li key={item.id} draggable={!saving} onDragStart={() => { dragIndex.current = i; }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (dragIndex.current !== null) move(dragIndex.current, i); dragIndex.current = null; }}><span>{item.category_name}</span><div><button type="button" disabled={saving || i === 0} aria-label={`Move ${item.category_name} up`} onClick={() => move(i, i - 1)}>↑</button><button type="button" disabled={saving || i === order.length - 1} aria-label={`Move ${item.category_name} down`} onClick={() => move(i, i + 1)}>↓</button></div></li>)}</ol>{formError && <p role="alert" className="alert alert-danger">{formError}</p>}</Modal.Body><Modal.Footer><button className="btn btn-outline-secondary" disabled={saving} onClick={() => setDialog(null)}>Cancel</button><button className="btn btn-primary" disabled={saving} onClick={() => mutate('/sliders/order', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: order.map((item) => item.id) }) })}>{saving ? 'Saving…' : 'Update Order'}</button></Modal.Footer></>
          : <form className="marketplace-dialog-form" onSubmit={submit} key={`${dialog.type}-${dialog.record?.id ?? 'new'}`}><Modal.Body>{formError && <p className="alert alert-danger" role="alert">{formError}</p>}<fieldset disabled={saving}>
            {dialog.type === 'sliders' ? <><label className="form-label" htmlFor="marketplace-category">Select Category</label><select className="form-select mb-16" name="category_id" id="marketplace-category" defaultValue={dialog.record?.category_id ?? ''} required><option value="">Select category</option>{data?.categories.filter((category) => category.id === dialog.record?.category_id || !data.sliders.some((item) => item.category_id === category.id)).map((category) => <option key={category.id} value={category.id}>{category.name} ({category.type})</option>)}</select>{!data?.categories.length && <p>Create a category first.</p>}<label className="form-label" htmlFor="marketplace-slider">Slider</label><select className="form-select" name="slider" id="marketplace-slider" defaultValue={dialog.record?.slider ?? ''}><option value="">None</option>{[1, 2, 3].map((i) => <option key={i} value={i}>Slider {i}</option>)}</select></> : [0, 1, 2].map((i) => <section className="marketplace-slide-form" key={i}><h3 className="text-lg">Slide {i + 1}</h3><ImageField name={`slides[${i}][image]`} label={`Slide ${i + 1} Image`} required={!dialog.record} initialUrl={dialog.record?.slides[i]?.image_url} />{[['title', 'Title'], ['description', 'Description'], ['button_text', 'Button Text'], ['button_link', 'Button Link']].map(([key, label]) => <div className="mt-16" key={key}><label className="form-label" htmlFor={`slide-${i}-${key}`}>{label}</label>{key === 'description' ? <textarea className="form-control" id={`slide-${i}-${key}`} name={`slides[${i}][${key}]`} maxLength={5000} defaultValue={dialog.record?.slides[i]?.[key] ?? ''} /> : <input className="form-control" id={`slide-${i}-${key}`} name={`slides[${i}][${key}]`} maxLength={key === 'button_link' ? 2000 : key === 'button_text' ? 120 : 255} required defaultValue={dialog.record?.slides[i]?.[key] ?? (key === 'button_text' ? 'Explore Marketplace' : key === 'button_link' ? '#marketplace-products' : '')} />}</div>)}</section>)}
          </fieldset></Modal.Body><Modal.Footer><button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={() => setDialog(null)}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : dialog.record ? 'Update' : 'Save'}</button></Modal.Footer></form>}
      </>}
    </Modal>
  </MasterLayout>;
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  return <div className="mb-16"><label className="form-label">{label}</label><div className="d-flex gap-2"><input className="form-control" aria-label={label} readOnly value={value} /><button className="btn btn-primary" onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setFailed(false); } catch { setFailed(true); } }}>{copied ? 'Copied' : 'Copy'}</button></div>{failed && <p role="status">Select and copy the value above.</p>}</div>;
}
