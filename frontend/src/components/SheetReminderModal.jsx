/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Modal } from 'react-bootstrap';

export default function SheetReminderModal({ rowNumber, reminderAt, reminderNote, saving, errorMessage, onSave, onClose }) {
  const initial = reminderAt ? new Date(new Date(reminderAt).getTime() - new Date(reminderAt).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
  const [date, setDate] = useState(initial);
  const [note, setNote] = useState(reminderNote || '');
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    if (!date || !Number.isFinite(new Date(date).getTime()) || new Date(date).getTime() <= Date.now()) { setError('Choose a future date and time.'); return; }
    onSave(new Date(date).toISOString(), note.trim());
  }
  return <Modal show centered onHide={() => { if (!saving) onClose(); }} aria-labelledby="sheet-reminder-title" className="sheet-reminder-modal">
    <Modal.Header closeButton={!saving}><Modal.Title id="sheet-reminder-title">Reminder · Row {rowNumber}</Modal.Title></Modal.Header>
    <form onSubmit={submit}>
      <Modal.Body>
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        {errorMessage && <p className="alert alert-danger" role="alert">{errorMessage}</p>}
        <label htmlFor="sheet-reminder-date" className="form-label">Date and time</label>
        <input id="sheet-reminder-date" type="datetime-local" className="form-control mb-16" value={date} required disabled={saving} onChange={(event) => setDate(event.target.value)} />
        <label htmlFor="sheet-reminder-note" className="form-label">Reminder note</label>
        <textarea id="sheet-reminder-note" className="form-control" rows={3} maxLength={1000} value={note} disabled={saving} onChange={(event) => setNote(event.target.value)} />
        <small>Times use your local time zone. Due reminders appear while this sheet is open.</small>
      </Modal.Body>
      <Modal.Footer>
        {reminderAt && <button type="button" className="btn btn-outline-danger" disabled={saving} onClick={() => onSave(null, '')}>Remove reminder</button>}
        <button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={onClose}>Cancel</button>
        <button type="submit" className="btn sheet-reminder-save" disabled={saving}>{saving ? 'Saving…' : 'Save reminder'}</button>
      </Modal.Footer>
    </form>
  </Modal>;
}
