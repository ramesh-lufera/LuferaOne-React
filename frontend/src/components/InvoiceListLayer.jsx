import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import { api } from '../services/api';
import ModuleTable, {
  ModuleTablePagination,
  ModuleTableToolbar,
} from './ModuleTable';
import ModuleTableCell from './ModuleTableCell';
const columns = [
  { label: 'S.L', width: 64 },
  { label: 'Invoice', width: 240 },
  { label: 'Customer', width: 220 },
  { label: 'Issued Date', width: 140 },
  { label: 'Due Date', width: 140 },
  { label: 'Total', width: 150 },
  { label: 'Actions', width: 128, align: 'center' },
];
const empty = { data: [], from: 0, to: 0, total: 0, last_page: 1 };
export default function InvoiceListLayer() {
  const [result, setResult] = useState(empty);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (query === search) return;
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, query]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api(
      `/invoices?search=${encodeURIComponent(query)}&page=${page}&per_page=${limit}`,
      { signal: controller.signal },
    )
      .then((data) => {
        if (!controller.signal.aborted) setResult(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setError(error.message);
          setResult(empty);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, page, limit, attempt]);
  return (
    <>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}{' '}
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => setAttempt(attempt + 1)}
          >
            Try again
          </button>
        </div>
      )}
      <div className="card h-100 p-0 radius-12">
        <ModuleTableToolbar
          id="invoice-limit"
          limit={limit}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
          search={search}
          searchLabel="Search invoices"
          onSearchChange={setSearch}
          actions={
            <Link to="/invoice-add" className="btn btn-primary radius-8">
              Create Invoice
            </Link>
          }
        />
        <div className="card-body p-24">
          <ModuleTable columns={columns}>
            {loading ? (
              <tr>
                <td colSpan={columns.length} role="status">
                  Loading invoices...
                </td>
              </tr>
            ) : !result.data.length ? (
              <tr>
                <td colSpan={columns.length}>No invoices found.</td>
              </tr>
            ) : (
              result.data.map((invoice, index) => (
                <tr key={invoice.id}>
                  <td>{result.from + index}</td>
                  <td>
                    <Link to={`/invoice-preview?id=${invoice.id}`}>
                      <ModuleTableCell id={`invoice-number-${invoice.id}`}>
                        {invoice.invoice_number}
                      </ModuleTableCell>
                    </Link>
                  </td>
                  <td>
                    <ModuleTableCell id={`invoice-customer-${invoice.id}`}>
                      {invoice.customer_name}
                    </ModuleTableCell>
                  </td>
                  <td>{invoice.issued_on}</td>
                  <td>{invoice.due_on || '—'}</td>
                  <td>{(invoice.total_cents / 100).toFixed(2)}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-10">
                      <Link
                        to={`/invoice-preview?id=${invoice.id}`}
                        aria-label={`View ${invoice.invoice_number}`}
                        className="module-table-action bg-primary-50 text-primary-600 w-40-px h-40-px rounded-circle"
                      >
                        <Icon icon="iconamoon:eye-light" />
                      </Link>
                      <Link
                        to={`/invoice-edit?id=${invoice.id}`}
                        aria-label={`Edit ${invoice.invoice_number}`}
                        className="module-table-action bg-success-focus text-success-600 w-40-px h-40-px rounded-circle"
                      >
                        <Icon icon="lucide:edit" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </ModuleTable>
          <ModuleTablePagination
            page={page}
            pages={result.last_page}
            from={result.from ?? 0}
            to={result.to ?? 0}
            total={result.total}
            loading={loading || Boolean(error)}
            onPageChange={setPage}
            label="Invoice pages"
          />
        </div>
      </div>
    </>
  );
}
