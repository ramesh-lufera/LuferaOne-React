/* eslint-disable react/prop-types */
import { useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { api } from '../services/api';
import { importContent } from '../helper/sheetImport';

export default function SheetImportModal({ onClose, onImported, beforeImport }) {
  const [workbook, setWorkbook] = useState(null);
  const [worksheet, setWorksheet] = useState('');
  const [name, setName] = useState('');
  const [useHeaders, setUseHeaders] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const parserRef = useRef(null);
  const busyRef = useRef(false);
  async function choose(event) {
    const file = event.target.files?.[0]; setWorkbook(null); setError('');
    if (!file) return;
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) { setError('Choose a CSV, XLSX, or XLS file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Choose a file smaller than 5 MB.'); return; }
    setBusy(true); busyRef.current = true;
    try {
      const parser = await import('xlsx'); parserRef.current = parser;
      const buffer = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Unable to read this file.')); reader.readAsArrayBuffer(file); });
      const book = parser.read(buffer, { type: 'array', cellFormula: false, raw: true, sheetRows: 202 });
      if (!book.SheetNames.length) throw new Error('No worksheets were found in this file.');
      setWorkbook(book); setWorksheet(book.SheetNames[0]); setName(file.name.replace(/\.(csv|xlsx|xls)$/i, '').slice(0, 255));
    } catch { setError('Unable to read this file. Check that it is a valid, unencrypted CSV or Excel workbook.'); }
    finally { setBusy(false); busyRef.current = false; }
  }
  async function submit(event) {
    event.preventDefault(); if (busyRef.current || !workbook || !name.trim()) return;
    busyRef.current = true; setBusy(true); setError('');
    try {
      const parser = parserRef.current;
      const source = workbook.Sheets[worksheet];
      if (source['!ref'] && parser.utils.decode_range(source['!ref']).e.c >= 50) throw new Error('Import supports up to 50 data columns.');
      if (source['!fullref'] && parser.utils.decode_range(source['!fullref']).e.r > (useHeaders ? 200 : 199)) throw new Error('Import supports up to 200 data rows.');
      const matrix = parser.utils.sheet_to_json(source, { header: 1, raw: false, defval: '', blankrows: true });
      const content = importContent(matrix, useHeaders);
      if (beforeImport && !await beforeImport()) throw new Error('Save the current sheet successfully before importing.');
      const result = await api('/sheets/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), content }) });
      onImported(result.sheet);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); busyRef.current = false; }
  }
  return <Modal show centered onHide={() => { if (!busyRef.current) onClose(); }} aria-labelledby="sheet-import-title">
    <Modal.Header closeButton={!busy}><Modal.Title id="sheet-import-title" className="fs-5">Import Sheet</Modal.Title></Modal.Header>
    <form onSubmit={submit}><Modal.Body>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <label className="form-label" htmlFor="sheet-import-file">CSV or Excel file</label>
      <input id="sheet-import-file" className="form-control mb-16" type="file" accept=".csv,.xlsx,.xls" onChange={choose} disabled={busy} />
      {workbook && <>
        <label className="form-label" htmlFor="sheet-import-name">Sheet name</label><input id="sheet-import-name" className="form-control mb-16" value={name} maxLength={255} required disabled={busy} onChange={(event) => setName(event.target.value)} />
        <label className="form-label" htmlFor="sheet-import-tab">Worksheet</label><select id="sheet-import-tab" className="form-select mb-16" value={worksheet} disabled={busy} onChange={(event) => setWorksheet(event.target.value)}>{workbook.SheetNames.map((title) => <option key={title}>{title}</option>)}</select>
        <label className="d-flex gap-2"><input type="checkbox" checked={useHeaders} disabled={busy} onChange={(event) => setUseHeaders(event.target.checked)} />Use first row as column headers</label>
      </>}
      <p className="mt-12 mb-0 text-secondary-light">Creates a new sheet. Up to 200 rows, 50 data columns, and 5 MB. Values are imported; formulas and workbook formatting are not preserved.</p>
    </Modal.Body><Modal.Footer><button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary" disabled={busy || !workbook || !name.trim()}>{busy ? 'Importing…' : 'Import'}</button></Modal.Footer></form>
  </Modal>;
}
