/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { apiUrl } from '../helper/auth';

export default function CatalogApiDetails({ item, kind }) {
  const [show, setShow] = useState(false);
  const resource = kind === 'Package' ? 'packages' : 'products';
  const path = item.page_path.startsWith('/external/') ? item.page_path : `/external${item.page_path}`;
  const landing = `${window.location.origin}${path}`;
  const slug = item.page_path.split('/').filter(Boolean).pop();
  const embed = `<iframe src="${landing}" title="${kind} details" width="100%" height="900" style="border:0"></iframe>`;
  return <>
    <button type="button" className="btn catalog-api-button" aria-haspopup="dialog" onClick={() => setShow(true)}>API</button>
    <Modal show={show} onHide={() => setShow(false)} centered scrollable aria-labelledby="catalog-api-title" dialogClassName="catalog-api-dialog">
      <Modal.Header closeButton><Modal.Title as="h2" className="text-xl" id="catalog-api-title">API Details</Modal.Title></Modal.Header>
      <Modal.Body>
        <CopyField label="Landing URL" value={landing} />
        <CopyField label="API URL" value={`${apiUrl}/external/${resource}/${encodeURIComponent(slug)}`} />
        <CopyField label="Embed code" value={embed} />
      </Modal.Body>
    </Modal>
  </>;
}

function CopyField({ label, value }) {
  const [status, setStatus] = useState('');
  return <div className="catalog-api-field">
    <label className="form-label">{label}</label>
    <div className="input-group"><input className="form-control" aria-label={label} value={value} readOnly onFocus={(event) => event.target.select()} /><button type="button" className="btn catalog-api-copy" aria-label={`Copy ${label}`} onClick={async () => {
      try { await navigator.clipboard.writeText(value); setStatus('Copied'); }
      catch { setStatus('Select and copy the value above.'); }
    }}>{status === 'Copied' ? 'Copied' : 'Copy'}</button></div>
    {status && <p className="text-sm mt-8 mb-0" role="status">{status}</p>}
  </div>;
}
