/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { Paperclip } from '@phosphor-icons/react';
import { api } from '../services/api';

const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function AttachmentPreview({ endpoint, attachment }) {
  const [source, setSource] = useState('');
  useEffect(() => {
    if (!imageTypes.includes(attachment.mime_type)) return;
    const controller = new AbortController();
    let objectUrl;
    api(`${endpoint}/${attachment.id}/file?preview=1`, { responseType: 'blob', signal: controller.signal })
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob); setSource(objectUrl);
      }).catch(() => {});
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [endpoint, attachment.id, attachment.mime_type]);
  return source ? <img src={source} alt={`Preview of ${attachment.name}`} onError={() => setSource('')} /> : <Paperclip size={32} aria-hidden="true" />;
}

export default function SheetAttachmentsPanel({ sheetId, rowId, rowNumber, onRecordsChange, onClose }) {
  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [attempt, setAttempt] = useState(0);
  const uploadRef = useRef(false);
  const inputRef = useRef(null);
  const endpoint = `/sheets/${sheetId}/rows/${encodeURIComponent(rowId)}/attachments`;
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    api(endpoint, { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) { setAttachments(data.attachments); onRecordsChange?.(rowId, 'attachments', data.attachments.length); }
    }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [endpoint, attempt, rowId, onRecordsChange]);

  async function upload(event) {
    event.preventDefault();
    if (!file || uploadRef.current) return;
    if (file.size > 20 * 1024 * 1024) { setError('Choose a file smaller than 20 MB.'); return; }
    uploadRef.current = true; setUploading(true); setError(''); setNotice('');
    const data = new FormData(); data.append('file', file);
    try {
      const result = await api(endpoint, { method: 'POST', body: data });
      setAttachments((current) => [result.attachment, ...current]);
      onRecordsChange?.(rowId, 'attachments', attachments.length + 1);
      setFile(null); if (inputRef.current) inputRef.current.value = '';
      setNotice(result.message);
    } catch (failure) { setError(failure.errors?.file?.[0] || failure.message); }
    finally { uploadRef.current = false; setUploading(false); }
  }

  async function download(attachment) {
    if (downloading !== null) return;
    setDownloading(attachment.id); setError('');
    try {
      const blob = await api(`${endpoint}/${attachment.id}/file`, { responseType: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = attachment.name;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (failure) { setError(failure.message); }
    finally { setDownloading(null); }
  }

  return <Offcanvas show placement="end" onHide={() => { if (!uploadRef.current) onClose(); }} aria-labelledby="sheet-attachments-title" className="sheet-comments-panel sheet-attachments-panel">
    <Offcanvas.Header closeButton={!uploading}><Offcanvas.Title id="sheet-attachments-title">Task Attachments</Offcanvas.Title></Offcanvas.Header>
    <Offcanvas.Body>
      {error && <div role="alert" className="alert alert-danger">{error} <button type="button" className="btn btn-sm btn-outline-danger" disabled={loading || uploading} onClick={() => setAttempt((value) => value + 1)}>Reload attachments</button></div>}
      {notice && <p role="status" className="text-success">{notice}</p>}
      {loading ? <p role="status">Loading attachments…</p> : !attachments.length ? <p>No attachments yet.</p> : <div className="sheet-attachment-list">{attachments.map((attachment) => <article key={attachment.id} className="sheet-attachment-card">
        <div className="sheet-attachment-preview"><AttachmentPreview endpoint={endpoint} attachment={attachment} /></div>
        <div className="sheet-attachment-details">
          <button type="button" className="sheet-attachment-name" title={attachment.name} aria-label={`Download ${attachment.name}`} disabled={downloading !== null} onClick={() => download(attachment)}>{downloading === attachment.id ? 'Downloading…' : attachment.name}</button>
          <span className="sheet-attachment-row">Row {rowNumber}</span>
          <span className="sheet-attachment-author">Uploaded by {attachment.user?.name || 'Deleted user'}</span>
          <time dateTime={attachment.created_at}>{new Date(attachment.created_at).toLocaleString('en-GB')}</time>
        </div>
      </article>)}</div>}
    </Offcanvas.Body>
    <form onSubmit={upload} className="sheet-comment-compose sheet-attachment-upload">
      <label htmlFor="sheet-attachment-file" className="visually-hidden">Choose attachment</label>
      <input ref={inputRef} id="sheet-attachment-file" type="file" disabled={uploading} onChange={(event) => { setFile(event.target.files?.[0] || null); setError(''); setNotice(''); }} aria-describedby="sheet-upload-limit" />
      <small id="sheet-upload-limit">Maximum file size: 20 MB</small>
      <button type="submit" className="btn sheet-comment-send" disabled={uploading || loading || !file}>{uploading ? 'Uploading…' : 'Upload'}</button>
    </form>
  </Offcanvas>;
}
