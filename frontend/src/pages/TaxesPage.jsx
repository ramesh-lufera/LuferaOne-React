import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Modal } from 'react-bootstrap';
import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import ModuleTable, { ModuleTableToolbar, ModuleTablePagination } from '../components/ModuleTable';
import ModuleTableCell from '../components/ModuleTableCell';
import { api } from '../services/api';
import './TaxesPage.css';

const columns = [
  { label: 'Name', width: 220 },
  { label: 'Region', width: 200 },
  { label: 'Rate (%)', width: 120 },
  { label: 'Type', width: 200 },
  { label: 'Default', width: 100, align: 'center' },
  { label: 'Action', width: 128, align: 'center' },
];
const empty = { data: [], last_page: 1, total: 0 };
const typeLabels = { exclusive: 'Exclusive (add on)', inclusive: 'Inclusive (included)' };

export default function TaxesPage() {
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveErrors, setSaveErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const savePending = useRef(false);
  const deletePending = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api(`/taxes?${new URLSearchParams({ search: search.trim(), page, per_page: limit })}`, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setResult(data); })
      .catch((err) => { if (!controller.signal.aborted) { setResult(empty); setError(err.message); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [search, page, limit, refresh]);

  function openEditor(tax = {}) {
    setSaveErrors([]);
    setEditor(tax);
  }

  async function saveTax(event) {
    event.preventDefault();
    if (savePending.current) return;
    const form = new FormData(event.currentTarget);
    const body = { name: form.get('name'), region: form.get('region'), rate: form.get('rate'), type: form.get('type'), is_default: form.has('is_default') };
    savePending.current = true;
    setSaving(true);
    setSaveErrors([]);
    setSuccess('');
    try {
      const data = await api(editor.id ? `/taxes/${editor.id}` : '/taxes', { method: editor.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setEditor(null);
      setSuccess(data.message);
      setSearch('');
      setPage(1);
      setRefresh((value) => value + 1);
    } catch (err) {
      setSaveErrors(err.errors ? Object.values(err.errors).flat() : [err.message]);
    } finally {
      savePending.current = false;
      setSaving(false);
    }
  }

  async function deleteTax() {
    if (!deleteTarget || deletePending.current) return;
    deletePending.current = true;
    setDeleting(true);
    setDeleteError('');
    setSuccess('');
    try {
      const data = await api(`/taxes/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      setSuccess(data.message);
      if (page > 1 && result.data.length === 1) setPage((value) => value - 1);
      setRefresh((value) => value + 1);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      deletePending.current = false;
      setDeleting(false);
    }
  }

  return <MasterLayout>
    <ModulePageHeader title="Taxes" />
    {success && <div className="alert alert-success" role="status">{success}</div>}
    {error && <div className="alert alert-danger" role="alert">{error} <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setRefresh((value) => value + 1)}>Try again</button></div>}
    <div className="card p-0 radius-12">
      <ModuleTableToolbar id="taxes-limit" limit={limit} onLimitChange={(value) => { setLimit(value); setPage(1); }} search={search} searchLabel="Search taxes" searchMaxLength={255} onSearchChange={(value) => { setSearch(value); setPage(1); }} actions={<button type="button" className="btn btn-primary radius-8" aria-haspopup="dialog" onClick={() => openEditor()}>+ Add New Tax</button>} />
      <div className="card-body p-24">
        <ModuleTable columns={columns}>
          {loading || !result.data.length ? <tr><td colSpan={columns.length}>{loading ? 'Loading taxes…' : error ? 'Taxes unavailable.' : 'No taxes found.'}</td></tr> : result.data.map((tax) => <tr key={tax.id}>
            <td><ModuleTableCell id={`tax-name-${tax.id}`}>{tax.name}</ModuleTableCell></td>
            <td><ModuleTableCell id={`tax-region-${tax.id}`}>{tax.region}</ModuleTableCell></td>
            <td>{Number(tax.rate).toFixed(2)}%</td>
            <td>{typeLabels[tax.type]}</td>
            <td className="text-center">{tax.is_default ? <span className="badge bg-success-focus text-success-main">Yes</span> : 'No'}</td>
            <td className="text-center"><div className="d-flex align-items-center gap-10 justify-content-center flex-nowrap">
              <button type="button" className="module-table-action bg-success-focus text-success-600 w-40-px h-40-px rounded-circle" aria-label={`Edit ${tax.name}`} aria-haspopup="dialog" onClick={() => openEditor(tax)}><Icon icon="lucide:edit" /></button>
              <button type="button" className="module-table-action bg-danger-focus text-danger-600 w-40-px h-40-px rounded-circle" aria-label={`Delete ${tax.name}`} aria-haspopup="dialog" onClick={() => { setDeleteError(''); setDeleteTarget(tax); }}><Icon icon="fluent:delete-24-regular" /></button>
            </div></td>
          </tr>)}
        </ModuleTable>
        <ModuleTablePagination page={page} pages={result.last_page} from={result.from ?? 0} to={result.to ?? 0} total={result.total} loading={loading || Boolean(error)} onPageChange={setPage} label="Tax pages" />
      </div>
    </div>
    <Modal show={editor !== null} onHide={() => { if (!saving) setEditor(null); }} centered dialogClassName="tax-editor-dialog" backdrop={saving ? 'static' : true} keyboard={!saving} aria-labelledby="tax-editor-title">
      <Modal.Header closeButton={!saving}><Modal.Title as="h2" className="fs-5" id="tax-editor-title">{editor?.id ? 'Edit Tax' : 'Add New Tax'}</Modal.Title></Modal.Header>
      {editor !== null && <form key={editor.id ?? 'new'} onSubmit={saveTax}>
        <Modal.Body>
          {saveErrors.length > 0 && <div className="alert alert-danger" role="alert"><ul className="mb-0 ps-3">{saveErrors.map((message, index) => <li key={index}>{message}</li>)}</ul></div>}
          <fieldset disabled={saving}>
            <div className="mb-20"><label className="form-label" htmlFor="tax-name">Tax Name</label><input id="tax-name" name="name" className="form-control" defaultValue={editor.name ?? ''} maxLength={255} required autoFocus /></div>
            <div className="mb-20"><label className="form-label" htmlFor="tax-region">Country / Region</label><input id="tax-region" name="region" className="form-control" defaultValue={editor.region ?? 'India'} maxLength={120} required /></div>
            <div className="row g-3 mb-24">
              <div className="col-12 col-sm-6"><label className="form-label" htmlFor="tax-rate">Rate (%)</label><input id="tax-rate" name="rate" type="number" className="form-control" min="0" max="100" step="1" defaultValue={editor.rate ?? ''} required /></div>
              <div className="col-12 col-sm-6"><label className="form-label" htmlFor="tax-type">Type</label><select id="tax-type" name="type" className="form-select" defaultValue={editor.type ?? 'exclusive'}>{Object.entries(typeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
            </div>
            <label className="tax-default-check"><input type="checkbox" name="is_default" defaultChecked={editor.is_default ?? false} /> Set as default tax</label>
            <p className="tax-default-help mb-0">Only one tax can be the default for each country / region. Saving a new default replaces the previous selection.</p>
          </fieldset>
        </Modal.Body>
        <Modal.Footer><button type="button" className="btn btn-secondary radius-8" disabled={saving} onClick={() => setEditor(null)}>Close</button><button type="submit" className="btn btn-primary radius-8" disabled={saving}>{saving ? 'Saving…' : 'Save Tax'}</button></Modal.Footer>
      </form>}
    </Modal>
    <Modal show={Boolean(deleteTarget)} onHide={() => { if (!deleting) setDeleteTarget(null); }} centered backdrop={deleting ? 'static' : true} keyboard={!deleting} aria-labelledby="tax-delete-title">
      <Modal.Header closeButton={!deleting}><Modal.Title as="h2" className="fs-5" id="tax-delete-title">Delete Tax</Modal.Title></Modal.Header>
      <Modal.Body><p className="mb-0">Permanently delete <strong>{deleteTarget?.name}</strong> for {deleteTarget?.region}?</p>{deleteTarget?.is_default && <p className="mt-12 mb-0">This region will have no default tax until you select another.</p>}{deleteError && <p className="alert alert-danger mt-12 mb-0" role="alert">{deleteError}</p>}</Modal.Body>
      <Modal.Footer><button type="button" className="btn btn-outline-secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>Cancel</button><button type="button" className="btn btn-danger" disabled={deleting} onClick={deleteTax}>{deleting ? 'Deleting…' : 'Delete Tax'}</button></Modal.Footer>
    </Modal>
  </MasterLayout>;
}
