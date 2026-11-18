import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ModuleTable from './ModuleTable';
const columns = [
  { label: 'S.L', width: 60 },
  { label: 'Item', width: 280 },
  { label: 'Qty', width: 100 },
  { label: 'Units', width: 100 },
  { label: 'Unit Price', width: 140 },
  { label: 'Total', width: 150 },
];
export default function InvoicePreviewLayer() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!/^[1-9][0-9]*$/.test(id || '')) {
      setError('Select an invoice from the Invoice List.');
      return;
    }
    const controller = new AbortController();
    setError('');
    setInvoice(null);
    api(`/invoices/${id}`, { signal: controller.signal })
      .then(({ invoice }) => {
        if (!controller.signal.aborted) setInvoice(invoice);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, [id, attempt]);
  if (error)
    return (
      <div className="alert alert-danger" role="alert">
        {error} <Link to="/invoice-list">Invoice List</Link>{' '}
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => setAttempt(attempt + 1)}
        >
          Try again
        </button>
      </div>
    );
  if (!invoice)
    return (
      <p role="status" className="p-24">
        Loading invoice...
      </p>
    );
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-end">
        <Link className="btn btn-primary" to={`/invoice-edit?id=${invoice.id}`}>
          Edit Invoice
        </Link>
      </div>
      <div className="card-body p-24">
        <div className="d-flex flex-wrap justify-content-between gap-3 border-bottom pb-24 mb-24">
          <div>
            <h6 className="text-break">{invoice.invoice_number}</h6>
            <p className="mb-8">Date Issued {invoice.issued_on}</p>
            {invoice.due_on && (
              <p className="mb-0">Date Due {invoice.due_on}</p>
            )}
          </div>
          {invoice.logo_url && (
            <img
              src={invoice.logo_url}
              alt="Invoice logo"
              style={{ maxWidth: 220, maxHeight: 110, objectFit: 'contain' }}
            />
          )}
        </div>
        <div className="mb-24">
          <h6 className="text-md">Invoice To</h6>
          <div className="fw-semibold">{invoice.customer_name}</div>
          <p className="mb-0 text-break" style={{ whiteSpace: 'pre-wrap' }}>
            {invoice.customer_address}
          </p>
          <p className="mb-0 text-break">{invoice.customer_email}</p>
          <p className="mb-0">{invoice.customer_phone}</p>
        </div>
        <ModuleTable columns={columns}>
          {invoice.items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td className="text-break" style={{ whiteSpace: 'normal' }}>
                {item.description}
              </td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{item.unit_price}</td>
              <td>{(item.line_total_cents / 100).toFixed(2)}</td>
            </tr>
          ))}
        </ModuleTable>
        <p className="fw-semibold text-end mt-24">
          Total {(invoice.total_cents / 100).toFixed(2)}
        </p>
        {invoice.notes && (
          <p className="text-break" style={{ whiteSpace: 'pre-wrap' }}>
            {invoice.notes}
          </p>
        )}
      </div>
    </div>
  );
}
