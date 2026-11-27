import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import ModuleTable, { ModuleTableToolbar, ModuleTablePagination } from '../components/ModuleTable';
import ModuleTableCell from '../components/ModuleTableCell';
import { api } from '../services/api';
import './CatalogTable.css';

const columns = [
  { label: 'Name', width: 340 },
  { label: 'Title', width: 190 },
  { label: 'Price', width: 160 },
  { label: 'Duration', width: 150 },
  { label: 'Status', width: 130, align: 'center' },
  { label: 'Action', width: 180, align: 'center' },
];
const formatPrice = (value) => value == null ? '—' : Number(value).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
const formatDuration = (value, unit) => value && unit ? `${value} ${unit[0].toUpperCase()}${unit.slice(1)}${Number(value) > 1 ? 's' : ''}` : '—';
const empty = { data: [], last_page: 1, total: 0 };

export default function ProductsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [show, setShow] = useState(false);
  const [categories, setCategories] = useState(null);
  const [categoryError, setCategoryError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [success, setSuccess] = useState('');
  const deletePending = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api(`/products?${new URLSearchParams({ search, page, per_page: limit })}`, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setResult(data); })
      .catch((err) => { if (!controller.signal.aborted) { setError(err.message); setResult(empty); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [search, page, limit, refresh]);

  useEffect(() => {
    if (!show) return;
    const controller = new AbortController();
    setCategories(null);
    setCategoryError('');
    api('/products/categories', { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setCategories(data.categories); })
      .catch((err) => { if (!controller.signal.aborted) setCategoryError(err.message); });
    return () => controller.abort();
  }, [show, refresh]);

  async function deleteProduct() {
    if (!deleteTarget || deletePending.current) return;
    deletePending.current = true;
    setDeleting(true);
    setDeleteError('');
    setSuccess('');
    try {
      const data = await api(`/products/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      setSuccess(data.message);
      if (page > 1 && result.data.length === 1) setPage((current) => current - 1);
      setRefresh((current) => current + 1);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      deletePending.current = false;
      setDeleting(false);
    }
  }

  function next(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    navigate(`/products/new?${new URLSearchParams({ category: data.get('category'), module: data.get('module').trim() })}`);
  }

  return <MasterLayout>
    <ModulePageHeader title="Products" />
    {success && <div className="alert alert-success" role="status">{success}</div>}
    {error && <div className="alert alert-danger" role="alert">{error} <button type="button" onClick={() => setRefresh((v) => v + 1)}>Try again</button></div>}
    <div className="card p-0 radius-12">
      <ModuleTableToolbar id="products-limit" limit={limit} onLimitChange={(v) => { setLimit(v); setPage(1); }} search={search} searchLabel="Search products" searchMaxLength={255} onSearchChange={(v) => { setSearch(v); setPage(1); }} actions={<button className="btn btn-primary radius-8" aria-haspopup="dialog" onClick={() => setShow(true)}>+ Add New Product</button>} />
      <div className="card-body p-24 catalog-table">
        <ModuleTable columns={columns}>
          {loading || !result.data.length ? <tr><td colSpan={6}>{loading ? 'Loading products…' : error ? 'Products unavailable.' : 'No products found.'}</td></tr> : result.data.map((item) => <tr key={item.id}>
            <td><ModuleTableCell id={`product-${item.id}`}><Link to={item.page_path}>{item.name}</Link></ModuleTableCell></td>
            <td><ModuleTableCell id={`product-title-${item.id}`}>{item.title || '—'}</ModuleTableCell></td>
            <td>{formatPrice(item.price)}</td>
            <td>{formatDuration(item.duration_value, item.duration_unit)}</td>
            <td className="text-center"><span className="catalog-status">Active</span></td>
            <td className="text-center"><div className="d-flex align-items-center gap-10 justify-content-center flex-nowrap">
              <Link className="module-table-action bg-primary-50 text-primary-600 w-40-px h-40-px rounded-circle" to={item.page_path} aria-label={`View ${item.name}`}><Icon icon="lucide:eye" /></Link>
              <Link className="module-table-action bg-warning-focus text-warning-600 w-40-px h-40-px rounded-circle" to={`/product-edit?product=${encodeURIComponent(item.page_slug)}`} aria-label={`Edit ${item.name}`}><Icon icon="lucide:edit" /></Link>
              <button type="button" className="module-table-action bg-danger-focus text-danger-600 w-40-px h-40-px rounded-circle" aria-label={`Delete ${item.name}`} aria-haspopup="dialog" onClick={() => { setDeleteError(''); setDeleteTarget(item); }}><Icon icon="fluent:delete-24-regular" /></button>
            </div></td>
          </tr>)}
        </ModuleTable>
        <ModuleTablePagination page={page} pages={result.last_page} loading={loading || Boolean(error)} from={result.from ?? 0} to={result.to ?? 0} total={result.total} onPageChange={setPage} label="Product pages" />
      </div>
    </div>
    <Modal show={show} onHide={() => setShow(false)} centered aria-labelledby="product-start-title">
      <Modal.Header closeButton><Modal.Title as="h2" className="text-xl" id="product-start-title">Add New Product</Modal.Title></Modal.Header>
      <form onSubmit={next}>
        <Modal.Body>
          {categoryError && <p className="alert alert-danger" role="alert">{categoryError} <button type="button" onClick={() => setRefresh((v) => v + 1)}>Try again</button></p>}
          <label className="form-label" htmlFor="product-category">Category</label>
          <select className="form-select mb-16" name="category" id="product-category" required disabled={!categories?.length}>
            <option value="">{categories === null ? 'Loading categories…' : categories.length ? 'Select category' : 'Create a category first'}</option>
            {categories?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <label className="form-label" htmlFor="product-module">Module</label>
          <input className="form-control" name="module" id="product-module" maxLength={255} pattern=".*\S.*" required />
        </Modal.Body>
        <Modal.Footer><button type="button" className="btn btn-outline-secondary" onClick={() => setShow(false)}>Cancel</button><button className="btn btn-primary" disabled={!categories?.length || Boolean(categoryError)}>Continue</button></Modal.Footer>
      </form>
    </Modal>
    <Modal show={Boolean(deleteTarget)} onHide={() => { if (!deleting) setDeleteTarget(null); }} backdrop={deleting ? 'static' : true} keyboard={!deleting} centered aria-labelledby="product-delete-title">
      <Modal.Header closeButton={!deleting}><Modal.Title as="h2" className="text-xl" id="product-delete-title">Delete Product</Modal.Title></Modal.Header>
      <Modal.Body>
        <p>Delete <strong>{deleteTarget?.name}</strong>? Its internal page, external page, cover, breadcrumb image, and gallery images will be permanently removed.</p>
        {deleteError && <p className="alert alert-danger" role="alert">{deleteError}</p>}
      </Modal.Body>
      <Modal.Footer><button type="button" className="btn btn-outline-secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>Cancel</button><button type="button" className="btn btn-danger" disabled={deleting} onClick={deleteProduct}>{deleting ? 'Deleting…' : 'Delete Product'}</button></Modal.Footer>
    </Modal>
  </MasterLayout>;
}
