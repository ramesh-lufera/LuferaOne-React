/* eslint-disable react/prop-types */
import { Icon } from '@iconify/react/dist/iconify.js';
import './ModuleTable.css';

export default function ModuleTable({ columns, children }) {
  return (
    <div className="table-responsive scroll-sm">
      <table
        className="table bordered-table sm-table mb-0 module-table"
        style={{
          minWidth: columns.reduce((total, column) => total + column.width, 0),
        }}
      >
        <colgroup>
          {columns.map((column) => (
            <col key={column.label} style={{ width: column.width }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={column.align ? `text-${column.align}` : undefined}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function ModuleTableToolbar({
  id,
  limit,
  onLimitChange,
  search,
  searchLabel,
  onSearchChange,
  filters,
  actions,
}) {
  return (
    <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
      <div className="d-flex align-items-center flex-wrap gap-3">
        <label htmlFor={id}>Show</label>
        <select
          id={id}
          className="form-select w-auto"
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
        >
          {[10, 20, 50].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <div className="navbar-search">
          <input
            className="bg-base h-40-px w-auto"
            aria-label={searchLabel}
            placeholder={searchLabel}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <Icon icon="ion:search-outline" className="icon" />
        </div>
        {filters}
      </div>
      {actions && <div className="d-flex gap-2">{actions}</div>}
    </div>
  );
}

export function ModuleTablePagination({
  page,
  pages,
  loading,
  from,
  to,
  total,
  onPageChange,
  label,
}) {
  const firstPage = Math.min(Math.max(page - 2, 1), Math.max(pages - 4, 1));
  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap mt-24 gap-2">
      <span>
        Showing {from} to {to} of {total} entries
      </span>
      <div className="dt-container module-pagination">
        <nav className="dt-paging" aria-label={label}>
          <button
            type="button"
            className="dt-paging-button first"
            aria-label="First page"
            disabled={loading || page <= 1}
            onClick={() => onPageChange(1)}
          >
            «
          </button>
          <button
            type="button"
            className="dt-paging-button previous"
            aria-label="Previous page"
            disabled={loading || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            ‹
          </button>
          {Array.from(
            { length: Math.min(5, pages) },
            (_, index) => firstPage + index,
          ).map((number) => (
            <button
              key={number}
              type="button"
              className={`dt-paging-button ${number === page ? 'current' : ''}`}
              aria-label={`Page ${number}`}
              aria-current={number === page ? 'page' : undefined}
              disabled={loading}
              onClick={() => onPageChange(number)}
            >
              {number}
            </button>
          ))}
          <button
            type="button"
            className="dt-paging-button next"
            aria-label="Next page"
            disabled={loading || page >= pages}
            onClick={() => onPageChange(page + 1)}
          >
            ›
          </button>
          <button
            type="button"
            className="dt-paging-button last"
            aria-label="Last page"
            disabled={loading || page >= pages}
            onClick={() => onPageChange(pages)}
          >
            »
          </button>
        </nav>
      </div>
    </div>
  );
}
