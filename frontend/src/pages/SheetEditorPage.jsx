import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DotsThreeVertical, ChatCircle, Paperclip, Bell } from '@phosphor-icons/react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import SheetCommentsPanel from '../components/SheetCommentsPanel';
import SheetAttachmentsPanel from '../components/SheetAttachmentsPanel';
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
const initialRows = () => Array.from({ length: 10 }, blankRow);

export default function SheetEditorPage() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const validId = /^[1-9]\d*$/.test(id || '');
  const [sheet, setSheet] = useState(null);
  const [history, setHistory] = useState([initialRows()]);
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
  const headers = Array.from({ length: Math.max(defaultHeaders.length, ...rows.map((cells) => cells.length)) }, (_, index) => defaultHeaders[index] || `Column Field ${index}`);
  const menuIndex = rows.findIndex((cells) => cells[0].rowId === rowMenu?.rowId);
  const reminderIndex = rows.findIndex((cells) => cells[0].rowId === reminderRow);
  const cell = rows[active[0]]?.[active[1]] || { value: '' };
  const dirty = sheet && JSON.stringify(rows) !== saved;
  useEffect(() => {
    if (!validId) return;
    const controller = new AbortController();
    setSheet(null); setRowPanel(null); setRowMenu(null); setClipboard(null); setReminderRow(null); setError(''); setMissing(false); setActive([0, 0]); setSelected([]);
    api(`/sheets/${id}`, { signal: controller.signal }).then(({ sheet: record, row_activity }) => {
      if (controller.signal.aborted) return;
      const loaded = record.content?.rows?.map((cells, index) => cells.map((item, ci) => ci === 0 ? { ...item, rowId: item.rowId || `legacy-${record.id}-${index}` } : item)) || initialRows();
      setRowActivity(row_activity || { comments: {}, attachments: {} });
      setSheet(record); setHistory([loaded]); setPosition(0); setSaved(JSON.stringify(loaded));
    }).catch((failure) => { if (!controller.signal.aborted) { setMissing(failure.status === 404); setError(failure.message); } });
    return () => controller.abort();
  }, [id, validId]);
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
  function change(next) {
    const nextHistory = [...history.slice(0, position + 1), next].slice(-100);
    setHistory(nextHistory); setPosition(nextHistory.length - 1); setMessage('');
  }
  function patchCell(patch, row = active[0], column = active[1]) {
    if (rows[row]?.[0].locked) return;
    change(rows.map((cells, ri) => ri === row ? cells.map((current, ci) => ci === column ? { ...current, ...patch } : current) : cells));
  }
  async function save(nextRows = rows) {
    if (savingRef.current) return false;
    if (!Array.isArray(nextRows)) nextRows = rows;
    savingRef.current = true;
    setSaving(true); setError(''); setMessage('');
    try {
      const result = await api(`/sheets/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: sheet.version, content: { rows: nextRows } }) });
      setSheet(result.sheet); setSaved(JSON.stringify(nextRows)); setMessage(result.message);
      return true;
    } catch (failure) { setError(failure.message); }
    finally { savingRef.current = false; setSaving(false); }
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
    {error && <div className="alert alert-danger" role="alert">{error} <Link to="/sheets">Back to sheets</Link></div>}
    {rows.some((cells) => cells[0].reminderAt && new Date(cells[0].reminderAt).getTime() <= now) && <div className="alert alert-info" role="status">Due reminders: {rows.flatMap((cells, index) => cells[0].reminderAt && new Date(cells[0].reminderAt).getTime() <= now ? [`Row ${index + 1}${cells[0].reminderNote ? `: ${cells[0].reminderNote}` : ''}`] : []).join(' · ')}</div>}
    {message && <div className="alert alert-success" role="status">{message}</div>}
    {!sheet ? !error && <p role="status">Loading sheet…</p> : <section className="card p-24 sheet-workspace">
      <fieldset className="sheet-toolbar" disabled={saving} aria-label="Sheet formatting">
        <details className="sheet-file-menu"><summary>File</summary><div><button type="button" onClick={save}>Save</button><button type="button" onClick={exportCsv}>Export CSV</button></div></details>
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
      <div className="sheet-grid-scroll"><table className="sheet-grid" aria-label={sheet.name}>
        <colgroup><col style={{ width: 70 }} /><col style={{ width: 120 }} />{headers.slice(1).map((header) => <col key={header} />)}</colgroup>
        <thead><tr><th className="sheet-row-number"><input type="checkbox" aria-label="Select all rows" checked={selected.length === rows.length} onChange={(event) => setSelected(event.target.checked ? rows.map((_, index) => index) : [])} /></th>{headers.map((header) => <th key={header} scope="col">{header}<span aria-hidden="true">⋮</span></th>)}</tr></thead>
        <tbody>{rows.map((cells, ri) => search && !cells.some((item) => (item.value || '').toLowerCase().includes(search.toLowerCase())) ? null : <tr key={cells[0].rowId} className={`${cells[0].locked ? 'sheet-row-locked ' : ''}${clipboard?.cut && clipboard.sourceId === cells[0].rowId ? 'sheet-row-cut' : ''}`}>
          <th scope="row"><input type="checkbox" aria-label={`Select row ${ri + 1}`} checked={selected.includes(ri)} onChange={(event) => setSelected(event.target.checked ? [...selected, ri] : selected.filter((index) => index !== ri))} /> {ri + 1}</th>
          {cells.map((item, ci) => <td key={ci} className={`${ci === 0 ? 'sheet-task-cell ' : ''}${active[0] === ri && active[1] === ci ? 'sheet-cell-active' : ''}`}><div className={ci === 0 ? 'sheet-task-content' : undefined}><input className={ci === 0 ? 'visually-hidden' : undefined} tabIndex={ci === 0 ? -1 : undefined} aria-label={`${headers[ci]} row ${ri + 1}`} value={item.value || ''} maxLength={2000} disabled={saving || Boolean(cells[0].locked)} onFocus={() => setActive([ri, ci])} onChange={(event) => patchCell({ value: event.target.value }, ri, ci)} style={{ fontFamily: item.fontFamily || 'Arial', fontSize: item.fontSize || 14, fontWeight: item.bold ? 'bold' : 'normal', fontStyle: item.italic ? 'italic' : 'normal', textDecoration: item.underline ? 'underline' : 'none', color: item.color || '#111827', backgroundColor: item.backgroundColor || '#ffffff', textAlign: item.textAlign || 'left' }} />{ci === 0 && <div className="sheet-task-actions" role="group" aria-label={`Task row ${ri + 1} actions`}>
            {taskActions.map(({ label, icon: ActionIcon }) => <button key={label} type="button" className={recordCount(label, cells[0].rowId) > 0 ? 'sheet-task-has-records' : undefined} aria-label={`${label} for task row ${ri + 1}`} title={label === 'Set or manage reminders' && cells[0].reminderAt ? `Reminder: ${new Date(cells[0].reminderAt).toLocaleString()}` : recordCount(label, cells[0].rowId) > 0 ? `${label} (${recordCount(label, cells[0].rowId)})` : label} aria-haspopup={label === 'More options' ? 'menu' : undefined} aria-expanded={label === 'More options' ? rowMenu?.rowId === cells[0].rowId : undefined} disabled={saving} onClick={label === 'More options' ? (event) => setRowMenu(rowMenu?.rowId === cells[0].rowId ? null : { rowId: cells[0].rowId, target: event.currentTarget }) : label === 'Set or manage reminders' ? () => handleRowAction('Reminder', ri) : label === 'Add or view comments' ? () => openRowPanel(ri) : label === 'Add or view attachments' ? () => openRowPanel(ri, 'attachments') : undefined}><ActionIcon size={18} weight={recordCount(label, cells[0].rowId) > 0 ? 'fill' : 'regular'} aria-hidden="true" /></button>)}
          </div>}</div></td>)}
        </tr>)}</tbody>
      </table></div>
      <div className="d-flex gap-3 mt-16 align-items-center flex-wrap"><button type="button" className="btn btn-outline-primary" disabled={saving || rows.length >= 200} onClick={() => change([...rows, blankRow(headers.length)])}>+ Add Row</button>
        {selected.length > 0 && <button type="button" className="btn btn-outline-danger" disabled={saving || selected.some((index) => rows[index]?.[0].locked)} onClick={() => { const remaining = rows.filter((_, index) => !selected.includes(index)); change(remaining.length ? remaining : [blankRow(headers.length)]); setSelected([]); setActive([0, 0]); }}>Remove selected rows</button>}
        <span className="text-secondary-light">{rows.length} rows · {dirty ? 'Unsaved changes' : 'Saved'}</span></div>
    </section>}
    {rowPanel?.type === 'comments' && <SheetCommentsPanel key={`${id}-${rowPanel.rowId}`} sheetId={id} rowId={rowPanel.rowId} taskName={rowPanel.taskName} onRecordsChange={updateRowActivity} onClose={() => setRowPanel(null)} />}
    {rowPanel?.type === 'attachments' && <SheetAttachmentsPanel key={`${id}-${rowPanel.rowId}`} sheetId={id} rowId={rowPanel.rowId} rowNumber={rowPanel.rowNumber} onRecordsChange={updateRowActivity} onClose={() => setRowPanel(null)} />}
    {rowMenu && menuIndex >= 0 && <SheetRowMenu target={rowMenu.target} rowNumber={menuIndex + 1} locked={Boolean(rows[menuIndex][0].locked)} canInsert={rows.length < 200} canCut={rows.length > 1} canPaste={Boolean(clipboard && (clipboard.cut ? clipboard.sourceId !== rowMenu.rowId && rows.some((cells) => cells[0].rowId === clipboard.sourceId && !cells[0].locked) : rows.length < 200))} onClose={() => setRowMenu(null)} onAction={(label) => handleRowAction(label, menuIndex)} />}
    {reminderRow && reminderIndex >= 0 && <SheetReminderModal key={reminderRow} rowNumber={reminderIndex + 1} reminderAt={rows[reminderIndex][0].reminderAt} reminderNote={rows[reminderIndex][0].reminderNote} saving={saving} errorMessage={error} onClose={() => setReminderRow(null)} onSave={saveReminder} />}
    {printRow && createPortal(<section className="sheet-print-row"><h1>{sheet.name} · Row {printRow.number}</h1><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody><tr>{printRow.cells.map((item, index) => <td key={index} style={{ fontWeight: item.bold ? 'bold' : 'normal', fontStyle: item.italic ? 'italic' : 'normal', textDecoration: item.underline ? 'underline' : 'none', color: item.color, backgroundColor: item.backgroundColor, textAlign: item.textAlign, fontFamily: item.fontFamily, fontSize: item.fontSize }}>{item.value}</td>)}</tr></tbody></table></section>, document.body)}
  </MasterLayout>;
}
