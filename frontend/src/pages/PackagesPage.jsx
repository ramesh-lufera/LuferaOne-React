import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import ModuleTable, { ModuleTableToolbar, ModuleTablePagination } from '../components/ModuleTable';
import ModuleTableCell from '../components/ModuleTableCell';
import { api } from '../services/api';

const columns = [
  { label: 'Package Name', width: 240 },
  { label: 'Category', width: 200 },
  { label: 'Module', width: 200 },
  { label: 'Action', width: 180, align: 'center' },
];
const empty = { data: [], last_page: 1, total: 0 };

export default function PackagesPage() {
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
    api(`/packages?${new URLSearchParams({ search, page, per_page: limit })}`, { signal: controller.signal })
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
    api('/packages/categories', { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setCategories(data.categories); })
      .catch((err) => { if (!controller.signal.aborted) setCategoryError(err.message); });
    return () => controller.abort();
  }, [show, refresh]);

  async function deletePackage() {
    if (!deleteTarget || deletePending.current) return;
    deletePending.current = true;
    setDeleting(true);
    setDeleteError('');
    setSuccess('');
    try {
      const data = await api(`/packages/${deleteTarget.id}`, { method: 'DELETE' });
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
    navigate(`/packages/new?${new URLSearchParams({ category: data.get('category'), module: data.get('module').trim() })}`);
  }

  return <MasterLayout>
    <ModulePageHeader title="Packages" />
    {success && <div className="alert alert-success" role="status">{success}</div>}
    {error && <div className="alert alert-danger" role="alert">{error} <button type="button" onClick={() => setRefresh((v) => v + 1)}>Try again</button></div>}
    <div className="card p-0 radius-12">
      <ModuleTableToolbar id="packages-limit" limit={limit} onLimitChange={(v) => { setLimit(v); setPage(1); }} search={search} searchLabel="Search packages" searchMaxLength={255} onSearchChange={(v) => { setSearch(v); setPage(1); }} actions={<button className="btn btn-primary radius-8" aria-haspopup="dialog" onClick={() => setShow(true)}>+ Add New Package</button>} />
      <div className="card-body p-24">
        <ModuleTable columns={columns}>
          {loading || !result.data.length ? <tr><td colSpan={4}>{loading ? 'Loading packages…' : error ? 'Packages unavailable.' : 'No packages found.'}</td></tr> : result.data.map((item) => <tr key={item.id}>
            <td><ModuleTableCell id={`package-${item.id}`}>{item.name}</ModuleTableCell></td>
            <td><ModuleTableCell id={`package-category-${item.id}`}>{item.category_name}</ModuleTableCell></td>
            <td><ModuleTableCell id={`package-module-${item.id}`}>{item.module}</ModuleTableCell></td>
            <td className="text-center"><div className="d-flex align-items-center gap-10 justify-content-center flex-nowrap">
              <Link className="module-table-action bg-primary-focus text-primary-600 w-40-px h-40-px rounded-circle" to={item.page_path} aria-label={`View ${item.name}`}><Icon icon="lucide:eye" /></Link>
              <Link className="module-table-action bg-success-focus text-success-600 w-40-px h-40-px rounded-circle" to={`/package-edit?package=${encodeURIComponent(item.page_slug)}`} aria-label={`Edit ${item.name}`}><Icon icon="lucide:edit" /></Link>
              <button type="button" className="module-table-action bg-danger-focus text-danger-600 w-40-px h-40-px rounded-circle" aria-label={`Delete ${item.name}`} aria-haspopup="dialog" onClick={() => { setDeleteError(''); setDeleteTarget(item); }}><Icon icon="fluent:delete-24-regular" /></button>
            </div></td>
          </tr>)}
        </ModuleTable>
        <ModuleTablePagination page={page} pages={result.last_page} loading={loading || Boolean(error)} from={result.from ?? 0} to={result.to ?? 0} total={result.total} onPageChange={setPage} label="Package pages" />
      </div>
    </div>
    <Modal show={show} onHide={() => setShow(false)} centered aria-labelledby="package-start-title">
      <Modal.Header closeButton><Modal.Title as="h2" className="text-xl" id="package-start-title">Add New Package</Modal.Title></Modal.Header>
      <form onSubmit={next}>
        <Modal.Body>
          {categoryError && <p className="alert alert-danger" role="alert">{categoryError} <button type="button" onClick={() => setRefresh((v) => v + 1)}>Try again</button></p>}
          <label className="form-label" htmlFor="package-category">Category</label>
          <select className="form-select mb-16" name="category" id="package-category" required disabled={!categories?.length}>
            <option value="">{categories === null ? 'Loading categories…' : categories.length ? 'Select category' : 'Create a category first'}</option>
            {categories?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <label className="form-label" htmlFor="package-module">Module</label>
          <input className="form-control" name="module" id="package-module" maxLength={255} pattern=".*\S.*" required />
        </Modal.Body>
        <Modal.Footer><button type="button" className="btn btn-outline-secondary" onClick={() => setShow(false)}>Cancel</button><button className="btn btn-primary" disabled={!categories?.length || Boolean(categoryError)}>Continue</button></Modal.Footer>
      </form>
    </Modal>
    <Modal show={Boolean(deleteTarget)} onHide={() => { if (!deleting) setDeleteTarget(null); }} backdrop={deleting ? 'static' : true} keyboard={!deleting} centered aria-labelledby="package-delete-title">
      <Modal.Header closeButton={!deleting}><Modal.Title as="h2" className="text-xl" id="package-delete-title">Delete Package</Modal.Title></Modal.Header>
      <Modal.Body>
        <p>Delete <strong>{deleteTarget?.name}</strong>? Its internal page, external page, cover, breadcrumb image, and gallery images will be permanently removed.</p>
        {deleteError && <p className="alert alert-danger" role="alert">{deleteError}</p>}
      </Modal.Body>
      <Modal.Footer><button type="button" className="btn btn-outline-secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>Cancel</button><button type="button" className="btn btn-danger" disabled={deleting} onClick={deletePackage}>{deleting ? 'Deleting…' : 'Delete Package'}</button></Modal.Footer>
    </Modal>
  </MasterLayout>;
}
