/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { api } from '../services/api';
import ModuleTable from './ModuleTable';

const columns = [
  { label: 'S.L', width: 60 },
  { label: 'Item', width: 260 },
  { label: 'Qty', width: 110 },
  { label: 'Units', width: 100 },
  { label: 'Unit Price', width: 150 },
  { label: 'Total', width: 130 },
  { label: 'Action', width: 90, align: 'center' },
];
const newItem = () => ({
  key: uuid(),
  description: '',
  quantity: 1,
  unit: '',
  unit_price: '0.00',
});
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const fields = [
  ['customer_name', 'Customer Name', 'text', 255, true],
  ['customer_email', 'Customer Email', 'email', 255],
  ['customer_phone', 'Customer Phone', 'tel', 30],
  ['issued_on', 'Date Issued', 'date', undefined, true],
  ['due_on', 'Date Due', 'date'],
  ['customer_address', 'Customer Address', 'textarea', 2000],
  ['notes', 'Notes', 'textarea', 2000],
];

export default function InvoiceFormLayer({ invoiceId = null }) {
  const [values, setValues] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    issued_on: today(),
    due_on: '',
    notes: '',
  });
  const [items, setItems] = useState(() => [newItem()]);
  const [requestId] = useState(() => uuid());
  const [number, setNumber] = useState('');
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const savingRef = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadFailed(false);
    setError('');
    api(invoiceId ? `/invoices/${invoiceId}` : '/invoices/next-number', {
      signal: controller.signal,
    })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (invoiceId) {
          const record = data.invoice;
          setValues(
            Object.fromEntries(fields.map(([key]) => [key, record[key] ?? ''])),
          );
          setItems(
            record.items.map((item) => ({
              key: uuid(),
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unit_price: item.unit_price,
            })),
          );
          setNumber(record.invoice_number);
          setLogo(record.logo_url);
        } else {
          setNumber(data.next_invoice_number || '');
          setLogo(data.logo_url);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setError(error.message);
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [invoiceId, attempt]);
  const changeItem = (index, field, value) =>
    setItems((current) =>
      current.map((item, position) =>
        position === index ? { ...item, [field]: value } : item,
      ),
    );
  const lineTotal = (item) =>
    Number(item.quantity || 0) * Math.round(Number(item.unit_price || 0) * 100);
  const total = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const save = async (event) => {
    event.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    setErrors({});
    const data = {
      ...values,
      items: items.map(({ description, quantity, unit, unit_price }) => ({
        description,
        quantity: Number(quantity),
        unit,
        unit_price,
      })),
    };
    if (!invoiceId) data.request_id = requestId;
    try {
      const result = await api(
        invoiceId ? `/invoices/${invoiceId}` : '/invoices',
        {
          method: invoiceId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      );
      setSaved(result.invoice);
    } catch (error) {
      setError(error.message);
      setErrors(error.errors || {});
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  if (loading)
    return (
      <p className="p-24" role="status">
        Loading invoice...
      </p>
    );
  if (loadFailed)
    return (
      <div className="alert alert-danger" role="alert">
        {error}{' '}
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => setAttempt(attempt + 1)}
        >
          Try again
        </button>
      </div>
    );
  if (saved)
    return (
      <div className="card">
        <div className="card-body p-24">
          <div className="alert alert-success" role="status">
            Invoice {saved.invoice_number} {invoiceId ? 'updated' : 'created'}{' '}
            successfully.
          </div>
          <div className="d-flex gap-2">
            <Link
              to={`/invoice-preview?id=${saved.id}`}
              className="btn btn-primary"
            >
              View Invoice
            </Link>
            <Link to="/invoice-list" className="btn btn-outline-primary">
              Invoice List
            </Link>
          </div>
        </div>
      </div>
    );
  return (
    <div className="card">
      <div className="card-body p-24">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-24">
          <div>
            <span className="text-secondary-light">Invoice Number</span>
            <div className="text-xl fw-semibold text-break">
              {number || 'Assigned on save'}
            </div>
            {!invoiceId && (
              <p className="text-sm text-secondary-light mb-0">
                Preview. The invoice number is assigned when saved.
              </p>
            )}
          </div>
          {logo && (
            <img
              src={logo}
              alt="Invoice logo"
              style={{ maxWidth: 200, maxHeight: 100, objectFit: 'contain' }}
            />
          )}
        </div>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
            {Object.keys(errors).length > 0 && (
              <ul className="mb-0">
                {Object.entries(errors).map(([key, messages]) => (
                  <li key={key}>{messages.join(' ')}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <form
          onSubmit={save}
          aria-label={invoiceId ? 'Edit invoice' : 'Create invoice'}
        >
          <fieldset disabled={saving}>
            <div className="row gy-3 mb-24">
              {fields.map(([key, label, type, maxLength, required]) => (
                <div
                  className={type === 'textarea' ? 'col-12' : 'col-md-6'}
                  key={key}
                >
                  <label htmlFor={`billing-${key}`} className="form-label">
                    {label}
                    {required ? ' *' : ''}
                  </label>
                  {type === 'textarea' ? (
                    <textarea
                      id={`billing-${key}`}
                      className="form-control"
                      rows={2}
                      maxLength={maxLength}
                      value={values[key]}
                      onChange={(event) =>
                        setValues({ ...values, [key]: event.target.value })
                      }
                    />
                  ) : (
                    <input
                      id={`billing-${key}`}
                      type={type}
                      className="form-control"
                      required={required}
                      maxLength={maxLength}
                      min={key === 'due_on' ? values.issued_on : undefined}
                      value={values[key]}
                      onChange={(event) =>
                        setValues({ ...values, [key]: event.target.value })
                      }
                      aria-invalid={Boolean(errors[key])}
                    />
                  )}
                </div>
              ))}
            </div>
            <ModuleTable columns={columns}>
              {items.map((item, index) => (
                <tr key={item.key}>
                  <td>{index + 1}</td>
                  <td>
                    <input
                      required
                      aria-label={`Item ${index + 1}`}
                      className="form-control"
                      maxLength={500}
                      value={item.description}
                      onChange={(event) =>
                        changeItem(index, 'description', event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      required
                      aria-label={`Quantity ${index + 1}`}
                      className="form-control"
                      type="number"
                      min={1}
                      max={10000}
                      step={1}
                      value={item.quantity}
                      onChange={(event) =>
                        changeItem(index, 'quantity', event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`Units ${index + 1}`}
                      className="form-control"
                      maxLength={30}
                      value={item.unit}
                      onChange={(event) =>
                        changeItem(index, 'unit', event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      required
                      aria-label={`Unit Price ${index + 1}`}
                      className="form-control"
                      type="number"
                      min={0}
                      max="9999999.99"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(event) =>
                        changeItem(index, 'unit_price', event.target.value)
                      }
                    />
                  </td>
                  <td>{(lineTotal(item) / 100).toFixed(2)}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      disabled={items.length === 1}
                      aria-label={`Remove item ${index + 1}`}
                      onClick={() =>
                        setItems(
                          items.filter((_, position) => position !== index),
                        )
                      }
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </ModuleTable>
            <div className="d-flex justify-content-between flex-wrap align-items-center gap-3 mt-16">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setItems([...items, newItem()])}
                disabled={items.length >= 100}
              >
                Add Item
              </button>
              <div className="fw-semibold">
                Total {(total / 100).toFixed(2)}
              </div>
            </div>
            <div className="d-flex justify-content-end mt-24">
              <button className="btn btn-primary px-32" type="submit">
                {saving
                  ? 'Saving...'
                  : invoiceId
                    ? 'Update Invoice'
                    : 'Save Invoice'}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
