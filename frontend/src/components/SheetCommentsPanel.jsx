/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { api } from '../services/api';

export default function SheetCommentsPanel({ sheetId, rowId, taskName, onRecordsChange, onClose }) {
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const pendingRef = useRef(false);
  const endpoint = `/sheets/${sheetId}/rows/${encodeURIComponent(rowId)}/comments`;
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    api(endpoint, { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) { setComments(data.comments); onRecordsChange?.(rowId, 'comments', data.comments.length); }
    }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [endpoint, attempt, rowId, onRecordsChange]);

  async function submit(event, parentId = null) {
    event.preventDefault();
    if (pendingRef.current) return;
    const text = (parentId ? replies[parentId] || '' : body).trim();
    if (!text) { setError('Enter a message before submitting.'); return; }
    pendingRef.current = true; setPending(true); setError('');
    try {
      const data = await api(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: text, parent_id: parentId }) });
      setComments((current) => [...current, data.comment]);
      onRecordsChange?.(rowId, 'comments', comments.length + 1);
      if (parentId) { setReplies((current) => ({ ...current, [parentId]: '' })); setReplyTo(null); }
      else setBody('');
    } catch (failure) { setError(failure.errors?.body?.[0] || failure.message); }
    finally { pendingRef.current = false; setPending(false); }
  }

  function messages(parentId = null) {
    return comments.filter((comment) => comment.parent_id === parentId).map((comment) => <article key={comment.id} className="sheet-comment-message" aria-label={`Message from ${comment.user?.name || 'Deleted user'}`}>
      <strong className="sheet-comment-author">{comment.user?.name || 'Deleted user'}</strong>
      <p>{comment.body}</p>
      <div className="sheet-comment-meta"><time dateTime={comment.created_at} title={comment.user?.name}>{new Date(comment.created_at).toLocaleString('en-GB')}</time><span aria-hidden="true">•</span><button type="button" className="sheet-comment-reply-link" disabled={pending} aria-label={`Reply to message ${comment.id}`} onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}>Reply</button></div>
      {replyTo === comment.id && <form className="sheet-comment-reply-form" onSubmit={(event) => submit(event, comment.id)}>
        <label className="visually-hidden" htmlFor={`sheet-reply-${comment.id}`}>Your reply</label>
        <textarea id={`sheet-reply-${comment.id}`} className="form-control" placeholder="Write your reply..." rows={3} maxLength={5000} required autoFocus disabled={pending} value={replies[comment.id] || ''} onChange={(event) => setReplies({ ...replies, [comment.id]: event.target.value })} />
        <div className="sheet-comment-reply-buttons"><button type="button" className="btn sheet-comment-cancel" disabled={pending} onClick={() => setReplyTo(null)}>Cancel</button><button type="submit" className="btn sheet-comment-send" disabled={pending || !replies[comment.id]?.trim()}>Send Reply</button></div>
      </form>}
      <div className="sheet-comment-replies">{messages(comment.id)}</div>
    </article>);
  }

  return <Offcanvas show placement="end" onHide={() => { if (!pendingRef.current) onClose(); }} aria-labelledby="sheet-comments-title" className="sheet-comments-panel">
    <Offcanvas.Header closeButton={!pending}><Offcanvas.Title id="sheet-comments-title">Comments</Offcanvas.Title></Offcanvas.Header>
    <Offcanvas.Body>
      <p className="visually-hidden">{taskName || 'Untitled task'}</p>
      {error && <div role="alert" className="alert alert-danger">{error} <button type="button" className="btn btn-sm btn-outline-danger" disabled={pending || loading} onClick={() => setAttempt((value) => value + 1)}>Reload messages</button></div>}
      {loading ? <p role="status">Loading comments…</p> : <div className="sheet-comment-messages" aria-live="polite">{comments.length ? messages() : <p>No comments yet.</p>}</div>}
    </Offcanvas.Body>
    <form onSubmit={submit} className="sheet-comment-compose">
      <label htmlFor="sheet-new-comment" className="visually-hidden">Add a comment</label>
      <textarea id="sheet-new-comment" className="form-control" rows={3} required maxLength={5000} disabled={pending || loading} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a comment…" />
      <button type="submit" className="btn sheet-comment-send" disabled={pending || loading || !body.trim()}>{pending ? 'Sending…' : 'Send'}</button>
    </form>
  </Offcanvas>;
}
