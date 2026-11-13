import { useEffect, useMemo, useRef, useState } from 'react';
import $ from 'jquery';
import useDataTable from '../hook/useDataTable';
import { api } from '../services/api';

const capitalizeName = (name) => name ? name.charAt(0).toLocaleUpperCase() + name.slice(1) : '';

const initialFilters = { date_from: '', date_to: '', module: '', action: '', user: '' };
export default function ActivityLogLayer() {
  const tableRef = useRef(null);
  const currentFilters = useRef(initialFilters);
  const activeRequest = useRef(null);
  const requestVersion = useRef(0);
  const [filters, setFilters] = useState(initialFilters);
  const [choices, setChoices] = useState({ modules: [], actions: [], users: [], timezone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const options = useMemo(() => ({
    pageLength: 10, lengthMenu: [10, 25, 50, 100], processing: true, serverSide: true,
    searchDelay: 350, order: [[5, 'desc']],
    language: { emptyTable: 'No activities found.', zeroRecords: 'No activities match your filters.' },
    ajax: async (data, callback) => {
      activeRequest.current?.abort();
      const controller = new AbortController();
      activeRequest.current = controller;
      const version = ++requestVersion.current;
      setLoading(true); setError('');
      const params = new URLSearchParams({ draw: data.draw, start: data.start, length: data.length,
        'search[value]': data.search.value, 'order[0][column]': data.order[0]?.column ?? 5,
        'order[0][dir]': data.order[0]?.dir ?? 'desc' });
      Object.entries(currentFilters.current).forEach(([key, value]) => { if (value) params.set(key, value); });
      try {
        const result = await api(`/activity-logs?${params}`, { signal: controller.signal });
        if (version === requestVersion.current) callback(result);
      } catch (err) {
        if (err.name !== 'AbortError' && version === requestVersion.current) {
          setError(err.message);
          callback({ draw: data.draw, data: [], recordsTotal: 0, recordsFiltered: 0 });
        }
      } finally { if (version === requestVersion.current) setLoading(false); }
    },
    columns: ['serial', 'action', 'module', 'description', 'user_name', 'date_time'].map((data) => ({
      data,
      render: data === 'user_name'
        ? (value, type) => type === 'display' ? $.fn.dataTable.render.text().display(capitalizeName(value)) : value
        : $.fn.dataTable.render.text(),
    })),
  }), []);
  const instance = useDataTable(tableRef, options);
  useEffect(() => {
    const controller = new AbortController();
    api('/activity-logs/filters', { signal: controller.signal }).then(setChoices).catch((err) => { if (err.name !== 'AbortError') setError(err.message); });
    return () => controller.abort();
  }, [reload]);
  useEffect(() => () => { activeRequest.current?.abort(); requestVersion.current += 1; }, []);
  const apply = (event) => { event.preventDefault(); currentFilters.current = filters; instance.current?.ajax.reload(); };
  const reset = () => { setFilters(initialFilters); currentFilters.current = initialFilters; instance.current?.search('').ajax.reload(); };
  return <div className='card basic-data-table'>
    <div className='card-header'><h5 className='card-title mb-0'>Activity Log</h5></div>
    <div className='card-body'>
      <form onSubmit={apply} className='row g-3 mb-24'>
        {['date_from', 'date_to'].map((key) => <div className='col-sm-6 col-lg-2' key={key}>
          <label className='form-label' htmlFor={key}>{key === 'date_from' ? 'From date' : 'To date'}</label>
          <input id={key} type='date' className='form-control' value={filters[key]} min={key === 'date_to' ? filters.date_from : undefined}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} />
        </div>)}
        {['module', 'action', 'user'].map((key) => <div className='col-sm-6 col-lg-2' key={key}>
          <label className='form-label' htmlFor={key}>{key === 'user' ? 'Performed by' : key === 'module' ? 'Module' : 'Action'}</label>
          <select id={key} className='form-select' value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}>
            <option value=''>All</option>
            {key === 'user' ? choices.users.map((user, index) => <option key={`${user.value}-${index}`} value={user.value}>{capitalizeName(user.name)}</option>) :
              choices[key === 'module' ? 'modules' : 'actions'].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>)}
        <div className='col-12 d-flex gap-2'><button type='submit' className='btn btn-primary'>Apply filters</button>
          <button type='button' className='btn btn-outline-primary' onClick={reset}>Reset</button></div>
      </form>
      {error && <div className='alert alert-danger' role='alert'>{error} <button type='button' className='btn btn-sm btn-outline-danger' onClick={() => { setReload((n) => n + 1); instance.current?.ajax.reload(null, false); }}>Retry</button></div>}
      {loading && <p role='status'>Loading activities…</p>}
      <div className='table-responsive'><table ref={tableRef} className='table bordered-table mb-0' aria-label='Activity log'>
        <thead><tr>{['S.No', 'Action', 'Module', 'Description', 'Performed By', 'Date & Time'].map((column) => <th scope='col' key={column}>{column}</th>)}</tr></thead><tbody />
      </table></div>
    </div>
  </div>;
}
