import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import SheetColumnHeader from '../components/SheetColumnHeader';
import { Modal, Overlay, Popover } from 'react-bootstrap';
import { DotsThreeVertical, ChatCircle, Paperclip, Bell } from '@phosphor-icons/react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import SheetCommentsPanel from '../components/SheetCommentsPanel';
import SheetAttachmentsPanel from '../components/SheetAttachmentsPanel';
import SheetImportModal from '../components/SheetImportModal';
import SheetRowMenu from '../components/SheetRowMenu';
import SheetReminderModal from '../components/SheetReminderModal';
import { api } from '../services/api';
import '../components/Sheets.css';

const defaultHeaders = ['Tasks', 'Column Field 1', 'Column Field 2', 'Column Field 3'];
const taskActions = [
  { label: 'More options', icon: DotsThreeVertical },
  { label: 'Add or view comments', icon: ChatCircle },
  { label: 'Add or view attachments', icon: Paperclip },
  { label: 'Set or manage reminders', icon: Bell },
];
const blankRow = (columnCount = defaultHeaders.length) => Array.from({ length: columnCount }, (_, index) => index === 0 ? { value: '', rowId: globalThis.crypto?.randomUUID?.() || `row-${Date.now()}-${Math.random().toString(36).slice(2)}` } : { value: '' });
const initialRows = () => Array.from({ length: 10 }, () => blankRow());

export default function SheetEditorPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [importing, setImporting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [createError, setCreateError] = useState('');
  const [createPending, setCreatePending] = useState(false);
  const createPendingRef = useRef(false);
  const id = params.get('id');
  const currentIdRef = useRef(id);
  currentIdRef.current = id;
  const saveLatestRef = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const validId = /^[1-9]\d*$/.test(id || '');
  const [sheet, setSheet] = useState(null);
  const [history, setHistory] = useState([initialRows()]);
  const [widthHistory, setWidthHistory] = useState([[180, 260, 260, 260]]);
  const [resizePreview, setResizePreview] = useState(null);
  const [headerHistory, setHeaderHistory] = useState([defaultHeaders]);
  const [columnMenu, setColumnMenu] = useState(null);
  const [columnDialog, setColumnDialog] = useState(null);
  const [columnName, setColumnName] = useState('');
  const [position, setPosition] = useState(0);
  const [saved, setSaved] = useState('');
  const [active, setActive] = useState([0, 0]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState('');
  const [missing, setMissing] = useState(false);
  const [message, setMessage] = useState('');
  const [rowActivity, setRowActivity] = useState({ comments: {}, attachments: {} });
  const updateRowActivity = useCallback((rowId, type, count) => {
    setRowActivity((current) => ({ ...current, [type]: { ...current[type], [rowId]: count } }));
  }, []);
  const [rowPanel, setRowPanel] = useState(null);
  const [rowMenu, setRowMenu] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [reminderRow, setReminderRow] = useState(null);
  const [printRow, setPrintRow] = useState(null);
  const [now, setNow] = useState(Date.now());
  const rows = history[position];
  const headers = headerHistory[position];
  const columnWidths = widthHistory[position];
  const displayWidths = columnWidths.map((width, index) => resizePreview?.index === index ? resizePreview.width : width);
  const menuIndex = rows.findIndex((cells) => cells[0].rowId === rowMenu?.rowId);
  const reminderIndex = rows.findIndex((cells) => cells[0].rowId === reminderRow);
  const cell = rows[active[0]]?.[active[1]] || { value: '' };
  const dirty = sheet && JSON.stringify({ rows, headers, columnWidths }) !== saved;
  useEffect(() => {
    if (!validId) return;
    const controller = new AbortController();
    setResizePreview(null); setColumnMenu(null); setColumnDialog(null); setSheet(null); setRowPanel(null); setRowMenu(null); setClipboard(null); setReminderRow(null); setError(''); setMissing(false); setActive([0, 0]); setSelected([]);
    api(`/sheets/${id}`, { signal: controller.signal }).then(({ sheet: record, row_activity }) => {
      if (controller.signal.aborted) return;
      const loaded = record.content?.rows?.map((cells, index) => cells.map((item, ci) => ci === 0 ? { ...item, rowId: item.rowId || `legacy-${record.id}-${index}` } : item)) || initialRows();
      setRowActivity(row_activity || { comments: {}, attachments: {} });
      const loadedHeaders = Array.from({ length: Math.max(...loaded.map((cells) => cells.length)) }, (_, index) => record.content?.headers?.[index] || defaultHeaders[index] || `Column Field ${index}`);
      const loadedWidths = loadedHeaders.map((_, index) => record.content?.columnWidths?.[index] || (index === 0 ? 180 : 260));
      setWidthHistory([loadedWidths]);
      setSheet(record); setHistory([loaded]); setHeaderHistory([loadedHeaders]); setPosition(0); setSaved(JSON.stringify({ rows: loaded, headers: loadedHeaders, columnWidths: loadedWidths }));
    }).catch((failure) => { if (!controller.signal.aborted) { setMissing(failure.status === 404); setError(failure.message); } });
    return () => controller.abort();
  }, [id, validId]);
  useEffect(() => {
    if (!dirty || saving || resizePreview || error || String(sheet?.id) !== id) return;
    const timer = setTimeout(() => { saveLatestRef.current(undefined, true); }, 1000);
    return () => clearTimeout(timer);
  }, [rows, headers, columnWidths, resizePreview, dirty, saving, error, id, sheet?.id]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!printRow) return;
    const timer = setTimeout(() => { window.print(); setPrintRow(null); }, 0);
    return () => clearTimeout(timer);
  }, [printRow]);
  function change(next, nextHeaders = headers, nextWidths = columnWidths) {
    const nextHistory = [...history.slice(0, position + 1), next].slice(-100);
    setWidthHistory([...widthHistory.slice(0, position + 1), nextWidths].slice(-100));
    setHeaderHistory([...headerHistory.slice(0, position + 1), nextHeaders].slice(-100));
    setHistory(nextHistory); setPosition(nextHistory.length - 1); setMessage(''); setError('');
  }
  const columnsLocked = rows.some((cells) => cells[0].locked);
  function moveColumn({ active: dragged, over }) {
    if (!over || savingRef.current || columnsLocked) return;
    const from = Number(String(dragged.id).replace('column-', ''));
    const to = Number(String(over.id).replace('column-', ''));
    if (from <= 0 || to <= 0 || from === to) return;
    change(rows.map((cells) => arrayMove(cells, from, to)), arrayMove(headers, from, to), arrayMove(columnWidths, from, to));
    setClipboard(null); setColumnMenu(null);
    setActive(([row, column]) => [row, column === from ? to : from < column && column <= to ? column - 1 : to <= column && column < from ? column + 1 : column]);
  }
  function applyColumn(event) {
    event.preventDefault();
    if (savingRef.current || !columnDialog) return;
    const { action, index } = columnDialog;
    if (action !== 'rename' && columnsLocked) return;
    if (action === 'rename') {
      if (!columnName.trim()) return;
      change(rows, headers.map((header, ci) => ci === index ? columnName.trim() : header));
    } else if (action === 'add' && headers.length < 51) {
      if (!columnName.trim()) return;
      change(rows.map((cells) => [...cells.slice(0, index + 1), { value: '' }, ...cells.slice(index + 1)]), [...headers.slice(0, index + 1), columnName.trim(), ...headers.slice(index + 1)], [...columnWidths.slice(0, index + 1), 260, ...columnWidths.slice(index + 1)]);
      setClipboard(null);
    } else if (action === 'delete' && index > 0) {
      change(rows.map((cells) => cells.filter((_, ci) => ci !== index)), headers.filter((_, ci) => ci !== index), columnWidths.filter((_, ci) => ci !== index));
      setClipboard(null);
    }
    setActive([0, 0]); setColumnDialog(null);
  }
  function patchCell(patch, row = active[0], column = active[1]) {
    if (rows[row]?.[0].locked) return;
    change(rows.map((cells, ri) => ri === row ? cells.map((current, ci) => ci === column ? { ...current, ...patch } : current) : cells));
  }
  async function save(nextRows = rows, silent = false) {
    if (savingRef.current) return false;
    if (!Array.isArray(nextRows)) nextRows = rows;
    savingRef.current = true;
    setSaving(true); setError(''); setMessage('');
    try {
      const result = await api(`/sheets/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: sheet.version, content: { rows: nextRows, headers, columnWidths } }) });
      if (currentIdRef.current !== id) return false;
      setSheet(result.sheet); setSaved(JSON.stringify({ rows: nextRows, headers, columnWidths })); setMessage(silent ? '' : result.message);
      return true;
    } catch (failure) { if (currentIdRef.current === id) setError(failure.message); }
    finally { savingRef.current = false; setSaving(false); }
  }
  saveLatestRef.current = save;
  async function createSheet(event) {
    event.preventDefault();
    if (createPendingRef.current || savingRef.current) return;
    const name = newSheetName.trim();
    if (!name) { setCreateError('Sheet Name is required.'); return; }
    createPendingRef.current = true;
    setCreatePending(true); setCreateError('');
    try {
      if (dirty && !await save()) return;
      const result = await api('/sheets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      setCreating(false);
      setMessage('');
      navigate(`/sheet?id=${result.sheet.id}`);
    } catch (failure) { setCreateError(failure.errors?.name?.[0] || failure.message); }
    finally { createPendingRef.current = false; setCreatePending(false); }
  }
  async function openRowPanel(rowIndex, type = 'comments') {
    if (savingRef.current) return;
    if ((dirty || !sheet.content?.rows) && !await save()) return;
    setRowPanel({ type, rowNumber: rowIndex + 1, rowId: rows[rowIndex][0].rowId, taskName: rows[rowIndex][0].value || `Task row ${rowIndex + 1}` });
  }
  function commitRows(next, activeRow = 0) {
    change(next); setSelected([]); setActive([activeRow, 0]); setRowMenu(null);
  }
  function handleRowAction(label, index) {
    if (savingRef.current || !rows[index]) return;
    const source = rows[index];
    if (['Cut Row', 'Delete Row', 'Reminder'].includes(label) && source[0].locked) return;
    if (label === 'Insert Above' || label === 'Insert Below') {
      if (rows.length >= 200) return;
      const at = index + (label === 'Insert Below' ? 1 : 0);
      commitRows([...rows.slice(0, at), blankRow(headers.length), ...rows.slice(at)], at);
    } else if (label === 'Copy Row' || label === 'Cut Row') {
      setClipboard({ cells: source.map((item) => ({ ...item })), sourceId: source[0].rowId, cut: label === 'Cut Row' });
      setMessage(label === 'Cut Row' ? 'Row cut. Use Paste Row to move it below another row.' : 'Row copied. Use Paste Row to insert a copy below another row.');
    } else if (label === 'Paste Row' && clipboard) {
      let next = [...rows];
      let copied = clipboard.cells.map((item) => ({ ...item }));
      if (clipboard.cut) {
        const from = next.findIndex((cells) => cells[0].rowId === clipboard.sourceId);
        if (from < 0 || next[from][0].locked || clipboard.sourceId === source[0].rowId) return;
        copied = next.splice(from, 1)[0];
      } else {
        if (rows.length >= 200) return;
        copied[0] = { ...copied[0], rowId: blankRow()[0].rowId, locked: false, reminderAt: null, reminderNote: '' };
      }
      const at = next.findIndex((cells) => cells[0].rowId === source[0].rowId) + 1;
      next.splice(at, 0, copied); commitRows(next, at);
      if (clipboard.cut) setClipboard(null);
    } else if (label === 'Delete Row') {
      const next = rows.filter((_, ri) => ri !== index);
      commitRows(next.length ? next : [blankRow(headers.length)]);
      if (clipboard?.sourceId === source[0].rowId && clipboard.cut) setClipboard(null);
    } else if (label === 'Attachments' || label === 'Comments') {
      openRowPanel(index, label.toLowerCase());
    } else if (label === 'Reminder') {
      setError('');
      setReminderRow(source[0].rowId);
    } else if (label === 'Lock' || label === 'Unlock') {
      const next = rows.map((cells, ri) => ri === index ? cells.map((item, ci) => ci === 0 ? { ...item, locked: !item.locked } : item) : cells);
      change(next); save(next);
    } else if (label === 'Print') {
      setPrintRow({ cells: source, number: index + 1 });
    }
  }
  async function saveReminder(reminderAt, reminderNote) {
    if (reminderIndex < 0 || rows[reminderIndex][0].locked) return;
    const next = rows.map((cells, ri) => ri === reminderIndex ? cells.map((item, ci) => ci === 0 ? { ...item, reminderAt, reminderNote } : item) : cells);
    change(next);
    if (await save(next)) setReminderRow(null);
  }
  function recordCount(label, rowId) {
    const type = label === 'Add or view comments' ? 'comments' : label === 'Add or view attachments' ? 'attachments' : null;
    return type ? Number(rowActivity[type]?.[rowId] || 0) : 0;
  }
  function exportCsv() {
    const csv = [headers, ...rows.map((cells) => cells.map((item) => item.value || ''))].map((values) => values.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `${sheet.name}.csv`; link.click(); URL.revokeObjectURL(url);
  }
  if (!validId || missing) return <Navigate to="/404" replace />;
  return <MasterLayout>
    <ModulePageHeader title={sheet?.name || 'Sheet'} />
    <Modal show={creating} onHide={() => { if (!createPending) setCreating(false); }} centered backdrop={createPending ? 'static' : true} keyboard={!createPending} aria-labelledby="new-sheet-title">
      <Modal.Header closeButton={!createPending}><Modal.Title id="new-sheet-title" as="h1" className="fs-5">Create new sheet</Modal.Title></Modal.Header>
      <form onSubmit={createSheet}>
        <Modal.Body>
          {createError && <div className="alert alert-danger" role="alert">{createError}</div>}
          <label htmlFor="new-sheet-name" className="form-label">Sheet Name <span className="text-danger">*</span></label>
          <input id="new-sheet-name" className="form-control" value={newSheetName} onChange={(event) => { setNewSheetName(event.target.value); setCreateError(''); }} required maxLength={255} autoFocus disabled={createPending} aria-invalid={Boolean(createError)} />
          {dirty && <p className="mt-16 mb-0">Your current sheet will be saved before creating the new sheet.</p>}
        </Modal.Body>
        <Modal.Footer><button type="button" className="btn btn-outline-secondary" disabled={createPending} onClick={() => setCreating(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={createPending}>{createPending ? 'Creating…' : 'Create'}</button></Modal.Footer>
      </form>
    </Modal>
    {error && <div className="alert alert-danger" role="alert">{error} <Link to="/sheets">Back to sheets</Link></div>}
    {rows.some((cells) => cells[0].reminderAt && new Date(cells[0].reminderAt).getTime() <= now) && <div className="alert alert-info" role="status">Due reminders: {rows.flatMap((cells, index) => cells[0].reminderAt && new Date(cells[0].reminderAt).getTime() <= now ? [`Row ${index + 1}${cells[0].reminderNote ? `: ${cells[0].reminderNote}` : ''}`] : []).join(' · ')}</div>}
    {message && <div className="alert alert-success" role="status">{message}</div>}
    {!sheet ? !error && <p role="status">Loading sheet…</p> : <section className="card p-24 sheet-workspace">
      <fieldset className="sheet-toolbar" disabled={saving} aria-label="Sheet formatting">
        <details className="sheet-file-menu"><summary>File</summary><div><button type="button" onClick={(event) => { event.currentTarget.closest('details').open = false; setNewSheetName(''); setCreateError(''); setCreating(true); }}>create</button><button type="button" onClick={save}>Save</button><button type="button" onClick={exportCsv}>Export</button><button type="button" onClick={() => setImporting(true)}>Import</button></div></details>
        <select aria-label="Font family" value={cell.fontFamily || 'Arial'} onChange={(event) => patchCell({ fontFamily: event.target.value })}>{['Arial', 'Georgia', 'Verdana'].map((font) => <option key={font}>{font}</option>)}</select>
        <select aria-label="Font size" value={cell.fontSize || 14} onChange={(event) => patchCell({ fontSize: Number(event.target.value) })}>{[12, 14, 16, 18, 24].map((size) => <option key={size}>{size}</option>)}</select>
        {[['bold', 'B'], ['italic', 'I'], ['underline', 'U']].map(([key, label]) => <button type="button" key={key} aria-label={key} aria-pressed={Boolean(cell[key])} onClick={() => patchCell({ [key]: !cell[key] })}>{label}</button>)}
        <label className="sheet-color">A<input type="color" aria-label="Text color" value={cell.color || '#111827'} onChange={(event) => patchCell({ color: event.target.value })} /></label>
        <label className="sheet-color">▨<input type="color" aria-label="Fill color" value={cell.backgroundColor || '#ffffff'} onChange={(event) => patchCell({ backgroundColor: event.target.value })} /></label>
        {['left', 'center', 'right'].map((align) => <button type="button" key={align} aria-label={`Align ${align}`} aria-pressed={(cell.textAlign || 'left') === align} onClick={() => patchCell({ textAlign: align })}>{align === 'left' ? '≡←' : align === 'right' ? '→≡' : '≡'}</button>)}
        <button type="button" aria-label="Undo" disabled={position === 0} onClick={() => setPosition(position - 1)}>↶</button>
        <button type="button" aria-label="Redo" disabled={position === history.length - 1} onClick={() => setPosition(position + 1)}>↷</button>
        <input className="sheet-search" type="search" aria-label="Search sheet cells" placeholder="Search…" value={search} onChange={(event) => setSearch(event.target.value)} />
        <button type="button" className="btn btn-primary" onClick={save}>{saving ? 'Saving…' : 'Save Sheet'}</button>
      </fieldset>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={moveColumn}><SortableContext items={headers.map((_, index) => `column-${index}`)} strategy={horizontalListSortingStrategy}><div className="sheet-grid-scroll"><table className="sheet-grid" aria-label={sheet.name} style={{ width: 70 + displayWidths.reduce((sum, width) => sum + width, 0), minWidth: 0 }}>
        <colgroup><col style={{ width: 70 }} />{displayWidths.map((width, index) => <col key={index} style={{ width }} />)}</colgroup>
        <thead><tr><th className="sheet-row-number"><input type="checkbox" aria-label="Select all rows" checked={selected.length === rows.length} onChange={(event) => setSelected(event.target.checked ? rows.map((_, index) => index) : [])} /></th>{headers.map((header, index) => <SheetColumnHeader key={index} header={header} index={index} width={displayWidths[index]} onResizePreview={(width) => setResizePreview({ index, width })} onResizeEnd={(width) => { setResizePreview(null); if (width !== columnWidths[index]) change(rows, headers, columnWidths.map((current, ci) => ci === index ? width : current)); }} onResizeCancel={() => setResizePreview(null)} disabled={saving} dragDisabled={columnsLocked} expanded={columnMenu?.index === index} onOptions={(event) => setColumnMenu(columnMenu?.index === index ? null : { index, target: event.currentTarget })} />)}</tr></thead>
        <tbody>{rows.map((cells, ri) => search && !cells.some((item) => (item.value || '').toLowerCase().includes(search.toLowerCase())) ? null : <tr key={cells[0].rowId} className={`${cells[0].locked ? 'sheet-row-locked ' : ''}${clipboard?.cut && clipboard.sourceId === cells[0].rowId ? 'sheet-row-cut' : ''}`}>
          <th scope="row"><input type="checkbox" aria-label={`Select row ${ri + 1}`} checked={selected.includes(ri)} onChange={(event) => setSelected(event.target.checked ? [...selected, ri] : selected.filter((index) => index !== ri))} /> {ri + 1}</th>
          {cells.map((item, ci) => <td key={ci} className={`${ci === 0 ? 'sheet-task-cell ' : ''}${active[0] === ri && active[1] === ci ? 'sheet-cell-active' : ''}`}><div className={ci === 0 ? 'sheet-task-content' : undefined}><input className={ci === 0 ? 'visually-hidden' : undefined} tabIndex={ci === 0 ? -1 : undefined} aria-label={`${headers[ci]} row ${ri + 1}`} value={item.value || ''} maxLength={2000} disabled={saving || Boolean(cells[0].locked)} onFocus={() => setActive([ri, ci])} onChange={(event) => patchCell({ value: event.target.value }, ri, ci)} style={{ fontFamily: item.fontFamily || 'Arial', fontSize: item.fontSize || 14, fontWeight: item.bold ? 'bold' : 'normal', fontStyle: item.italic ? 'italic' : 'normal', textDecoration: item.underline ? 'underline' : 'none', color: item.color || '#111827', backgroundColor: item.backgroundColor || '#ffffff', textAlign: item.textAlign || 'left' }} />{ci === 0 && <div className="sheet-task-actions" role="group" aria-label={`Task row ${ri + 1} actions`}>
            {taskActions.map(({ label, icon: ActionIcon }) => <button key={label} type="button" className={recordCount(label, cells[0].rowId) > 0 ? 'sheet-task-has-records' : undefined} aria-label={`${label} for task row ${ri + 1}`} title={label === 'Set or manage reminders' && cells[0].reminderAt ? `Reminder: ${new Date(cells[0].reminderAt).toLocaleString()}` : recordCount(label, cells[0].rowId) > 0 ? `${label} (${recordCount(label, cells[0].rowId)})` : label} aria-haspopup={label === 'More options' ? 'menu' : undefined} aria-expanded={label === 'More options' ? rowMenu?.rowId === cells[0].rowId : undefined} disabled={saving} onClick={label === 'More options' ? (event) => setRowMenu(rowMenu?.rowId === cells[0].rowId ? null : { rowId: cells[0].rowId, target: event.currentTarget }) : label === 'Set or manage reminders' ? () => handleRowAction('Reminder', ri) : label === 'Add or view comments' ? () => openRowPanel(ri) : label === 'Add or view attachments' ? () => openRowPanel(ri, 'attachments') : undefined}><ActionIcon size={18} weight={recordCount(label, cells[0].rowId) > 0 ? 'fill' : 'regular'} aria-hidden="true" /></button>)}
          </div>}</div></td>)}
        </tr>)}</tbody>
      </table></div></SortableContext></DndContext>
      <div className="d-flex gap-3 mt-16 align-items-center flex-wrap"><button type="button" className="btn btn-outline-primary" disabled={saving || rows.length >= 200} onClick={() => change([...rows, blankRow(headers.length)])}>+ Add Row</button>
        {selected.length > 0 && <button type="button" className="btn btn-outline-danger" disabled={saving || selected.some((index) => rows[index]?.[0].locked)} onClick={() => { const remaining = rows.filter((_, index) => !selected.includes(index)); change(remaining.length ? remaining : [blankRow(headers.length)]); setSelected([]); setActive([0, 0]); }}>Remove selected rows</button>}
        <span className="text-secondary-light" role="status" aria-live="polite">{rows.length} rows · {saving ? 'Saving…' : dirty ? error ? 'Auto-save failed. Use Save Sheet to retry.' : 'Changes pending auto-save…' : 'All changes saved'}</span></div>
    </section>}
    {columnMenu && <Overlay show target={columnMenu.target} placement="bottom-end" rootClose onHide={() => setColumnMenu(null)} transition={false} popperConfig={{ strategy: 'fixed' }}>
      <Popover id="sheet-column-menu" className="sheet-row-menu"><div role="menu" aria-label="Column options" onKeyDown={(event) => {
        if (event.key === 'Escape') { columnMenu.target.focus(); setColumnMenu(null); }
        const buttons = [...event.currentTarget.querySelectorAll('button:not(:disabled)')];
        const at = buttons.indexOf(document.activeElement);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); buttons[(at + (event.key === 'ArrowDown' ? 1 : buttons.length - 1)) % buttons.length]?.focus(); }
        if (event.key === 'Tab') setColumnMenu(null);
      }}>
        {['add', 'delete', 'rename'].map((action) => <button key={action} type="button" role="menuitem" autoFocus={action === 'rename'} disabled={saving || (action === 'add' && (headers.length >= 51 || columnsLocked)) || (action === 'delete' && (columnMenu.index === 0 || columnsLocked))} onClick={() => { setColumnDialog({ action, index: columnMenu.index }); setColumnName(action === 'rename' ? headers[columnMenu.index] : ''); setColumnMenu(null); }}>{action === 'add' ? 'Add column' : action === 'delete' ? 'Delete column' : 'Rename column'}</button>)}
        {columnMenu.index === 0 && <p className="px-16 mb-8 small">The task column is required.</p>}
        {columnsLocked && <p className="px-16 mb-8 small">Unlock rows to add or delete columns.</p>}
      </div></Popover>
    </Overlay>}
    <Modal show={Boolean(columnDialog)} onHide={() => setColumnDialog(null)} centered aria-labelledby="column-dialog-title">
      <Modal.Header closeButton><Modal.Title id="column-dialog-title" as="h1" className="fs-5">{columnDialog?.action === 'add' ? 'Add column' : columnDialog?.action === 'delete' ? 'Delete column' : 'Rename column'}</Modal.Title></Modal.Header>
      <form onSubmit={applyColumn}><Modal.Body>
        {columnDialog?.action === 'delete' ? <p>Delete “{headers[columnDialog.index]}” and its cell values? You can undo this before leaving the sheet.</p> : <><label htmlFor="sheet-column-name" className="form-label">Column name</label><input id="sheet-column-name" className="form-control" value={columnName} onChange={(event) => setColumnName(event.target.value)} required maxLength={255} autoFocus /></>}
      </Modal.Body><Modal.Footer><button type="button" className="btn btn-outline-secondary" onClick={() => setColumnDialog(null)}>Cancel</button><button type="submit" className={columnDialog?.action === 'delete' ? 'btn btn-danger' : 'btn btn-primary'} disabled={saving}>{columnDialog?.action === 'delete' ? 'Delete' : columnDialog?.action === 'add' ? 'Add' : 'Rename'}</button></Modal.Footer></form>
    </Modal>
    {rowPanel?.type === 'comments' && <SheetCommentsPanel key={`${id}-${rowPanel.rowId}`} sheetId={id} rowId={rowPanel.rowId} taskName={rowPanel.taskName} onRecordsChange={updateRowActivity} onClose={() => setRowPanel(null)} />}
    {rowPanel?.type === 'attachments' && <SheetAttachmentsPanel key={`${id}-${rowPanel.rowId}`} sheetId={id} rowId={rowPanel.rowId} rowNumber={rowPanel.rowNumber} onRecordsChange={updateRowActivity} onClose={() => setRowPanel(null)} />}
    {rowMenu && menuIndex >= 0 && <SheetRowMenu target={rowMenu.target} rowNumber={menuIndex + 1} locked={Boolean(rows[menuIndex][0].locked)} canInsert={rows.length < 200} canCut={rows.length > 1} canPaste={Boolean(clipboard && (clipboard.cut ? clipboard.sourceId !== rowMenu.rowId && rows.some((cells) => cells[0].rowId === clipboard.sourceId && !cells[0].locked) : rows.length < 200))} onClose={() => setRowMenu(null)} onAction={(label) => handleRowAction(label, menuIndex)} />}
    {reminderRow && reminderIndex >= 0 && <SheetReminderModal key={reminderRow} rowNumber={reminderIndex + 1} reminderAt={rows[reminderIndex][0].reminderAt} reminderNote={rows[reminderIndex][0].reminderNote} saving={saving} errorMessage={error} onClose={() => setReminderRow(null)} onSave={saveReminder} />}
    {printRow && createPortal(<section className="sheet-print-row"><h1>{sheet.name} · Row {printRow.number}</h1><table><thead><tr>{headers.map((header, index) => <th key={index}>{header}</th>)}</tr></thead><tbody><tr>{printRow.cells.map((item, index) => <td key={index} style={{ fontWeight: item.bold ? 'bold' : 'normal', fontStyle: item.italic ? 'italic' : 'normal', textDecoration: item.underline ? 'underline' : 'none', color: item.color, backgroundColor: item.backgroundColor, textAlign: item.textAlign, fontFamily: item.fontFamily, fontSize: item.fontSize }}>{item.value}</td>)}</tr></tbody></table></section>, document.body)}
    {importing && <SheetImportModal onClose={() => setImporting(false)} beforeImport={async () => !dirty || await save()} onImported={(record) => { setImporting(false); navigate(`/sheet?id=${record.id}`); }} />}
  </MasterLayout>;
}
