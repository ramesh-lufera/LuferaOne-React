import { Link } from 'react-router-dom';
import './Sheets.css';
import { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { api } from '../services/api';
import ModuleTable, { ModuleTablePagination, ModuleTableToolbar } from './ModuleTable';
import ModuleTableCell from './ModuleTableCell';

const columns = [
  { label: 'S.L', width: 64 },
  { label: 'Sheet Name', width: 600 },
  { label: 'Created Date', width: 180 },
  { label: 'Action', width: 180, align: 'center' },
];
const empty = { data: [], from: 0, to: 0, total: 0, last_page: 1 };

export default function SheetsLayer() {
  const [view, setView] = useState('cards');
  const [result, setResult] = useState(empty);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  useEffect(() => {
    if (search === query) return;
    const timer = setTimeout(() => { setQuery(search); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search, query]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    api(`/sheets?search=${encodeURIComponent(query)}&page=${page}&per_page=${limit}`, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setResult(data); })
      .catch((failure) => { if (!controller.signal.aborted) { setError(failure.message); setResult(empty); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, page, limit, attempt]);
  async function create(event) {
    event.preventDefault();
    if (savingRef.current) return;
    if (!name.trim()) { setFormError('Sheet Name is required.'); return; }
    savingRef.current = true; setSaving(true); setFormError('');
    try {
      const data = await api(editing ? `/sheets/${editing.id}` : '/sheets', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim() }) });
      setShow(false); setName(''); setNotice(data.message);
      setSearch(''); setQuery(''); setPage(1); setAttempt((value) => value + 1);
    } catch (failure) { setFormError(failure.errors?.name?.[0] || failure.message); }
    finally { savingRef.current = false; setSaving(false); }
  }
  async function remove() {
    if (savingRef.current) return;
    savingRef.current = true; setSaving(true); setFormError('');
    try {
      const data = await api(`/sheets/${deleting.id}`, { method: 'DELETE' });
      setDeleting(null); setNotice(data.message);
      if (result.data.length === 1 && page > 1) setPage(page - 1);
      else setAttempt((value) => value + 1);
    } catch (failure) { setFormError(failure.message); }
    finally { savingRef.current = false; setSaving(false); }
  }
  function actions(sheet) {
    return <div className="d-flex justify-content-center gap-2">
      <button type="button" className="btn btn-sm btn-outline-primary" aria-label={`Rename ${sheet.name}`} onClick={() => { setEditing(sheet); setName(sheet.name); setFormError(''); setNotice(''); setShow(true); }}>Edit</button>
      <button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Delete ${sheet.name}`} onClick={() => { setDeleting(sheet); setFormError(''); setNotice(''); }}>Delete</button>
    </div>;
  }
  return <>
    {notice && <div className="alert alert-success" role="status">{notice}</div>}
    {error && <div className="alert alert-danger" role="alert">{error} <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setAttempt((value) => value + 1)}>Try again</button></div>}
    <div className="card h-100 p-0 radius-12">
      <ModuleTableToolbar id="sheet-limit" limit={limit} onLimitChange={(value) => { setLimit(value); setPage(1); }} search={search} searchLabel="Search sheets" onSearchChange={setSearch}
        actions={<button type="button" className="btn btn-primary radius-8" onClick={() => { setEditing(null); setName(''); setFormError(''); setNotice(''); setShow(true); }}>Create Sheet</button>} />
      <div className="card-body p-24">
        <div className="sheet-view-toggle mb-24" role="group" aria-label="Sheet view">
          <button type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')} className={view === 'cards' ? 'btn btn-primary' : 'btn btn-outline-secondary'}>▦ Cards</button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')} className={view === 'list' ? 'btn btn-primary' : 'btn btn-outline-secondary'}>☷ List</button>
        </div>
        {view === 'cards' ? loading ? <p role="status">Loading sheets…</p> : !result.data.length ? <p>No sheets found.</p> : <div className="saved-sheets-grid">{result.data.map((sheet) => <div key={sheet.id} className="saved-sheet-card"><Link to={`/sheet?id=${sheet.id}`} className="d-block text-reset" aria-label={`Open ${sheet.name}`}>
          <div className="sheet-card-preview" aria-hidden="true"><div>File · Forms</div><div className="sheet-mini-grid">{Array.from({ length: 66 }, (_, index) => <span key={index} />)}</div></div>
          <div className="sheet-card-body"><div className="d-flex justify-content-between align-items-center mb-16"><span className="sheet-file-icon">▤</span><span>ID: {sheet.id}</span></div><h5>{sheet.name}</h5><p className="mb-4">Last Updated:</p><strong>{new Date(sheet.updated_at || sheet.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</strong></div>
        </Link><div className="px-24 pb-24">{actions(sheet)}</div></div>)}</div> : <ModuleTable columns={columns}>
          {loading ? <tr><td colSpan={columns.length} role="status">Loading sheets…</td></tr> : !result.data.length ? <tr><td colSpan={columns.length}>No sheets found.</td></tr> : result.data.map((sheet, index) => <tr key={sheet.id}>
            <td>{(result.from || 1) + index}</td><td><Link to={`/sheet?id=${sheet.id}`}><ModuleTableCell id={`sheet-name-${sheet.id}`}>{sheet.name}</ModuleTableCell></Link></td>
            <td>{new Date(sheet.created_at).toLocaleDateString('en-GB')}</td>
            <td className="text-center">{actions(sheet)}</td>
          </tr>)}
        </ModuleTable>}
        <ModuleTablePagination from={result.from || 0} to={result.to || 0} total={result.total} page={page} pages={result.last_page} loading={loading} onPageChange={setPage} label="Sheets pagination" />
      </div>
    </div>
    <Modal show={show} onHide={() => { if (!saving) setShow(false); }} centered backdrop={saving ? 'static' : true} keyboard={!saving} aria-labelledby="create-sheet-title">
      <Modal.Header closeButton={!saving}><Modal.Title id="create-sheet-title" as="h1" className="fs-5">{editing ? 'Rename Sheet' : 'Create Sheet'}</Modal.Title></Modal.Header>
      <form onSubmit={create}>
        <Modal.Body>
          {formError && <div className="alert alert-danger" role="alert">{formError}</div>}
          <label htmlFor="sheet-name" className="form-label">Sheet Name <span className="text-danger">*</span></label>
          <input id="sheet-name" className="form-control" value={name} onChange={(event) => { setName(event.target.value); setFormError(''); }} required maxLength={255} autoFocus disabled={saving} aria-invalid={Boolean(formError)} />
        </Modal.Body>
        <Modal.Footer><button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={() => setShow(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Create'}</button></Modal.Footer>
      </form>
    </Modal>
    <Modal show={Boolean(deleting)} onHide={() => { if (!saving) setDeleting(null); }} centered backdrop={saving ? 'static' : true} keyboard={!saving} aria-labelledby="delete-sheet-title">
      <Modal.Header closeButton={!saving}><Modal.Title id="delete-sheet-title" as="h1" className="fs-5">Delete Sheet</Modal.Title></Modal.Header>
      <Modal.Body>{formError && <div className="alert alert-danger" role="alert">{formError}</div>}Delete “{deleting?.name}” and all its cells? This cannot be undone.</Modal.Body>
      <Modal.Footer><button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={() => setDeleting(null)}>Cancel</button><button type="button" className="btn btn-danger" disabled={saving} onClick={remove}>{saving ? 'Deleting…' : 'Delete'}</button></Modal.Footer>
    </Modal>
  </>;
}
