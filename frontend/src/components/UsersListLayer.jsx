/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import { api } from '../services/api';
import { clearToken } from '../helper/auth';
import { useAccessUser } from '../helper/AccessContext';
import { Modal } from 'react-bootstrap';
import AddUserLayer from './AddUserLayer';
import UserDetailsLayer from './UserDetailsLayer';
import ModuleTable, {
  ModuleTablePagination,
  ModuleTableToolbar,
} from './ModuleTable';
import ModuleTableCell from './ModuleTableCell';

const columns = [
  { label: 'S.L', width: 64 },
  { label: 'User ID', width: 110 },
  { label: 'Name', width: 200 },
  { label: 'Email', width: 260 },
  { label: 'Username', width: 170 },
  { label: 'Phone', width: 170 },
  { label: 'Role', width: 170 },
  { label: 'Join Date', width: 150 },
  { label: 'Actions', width: 176, align: 'center' },
];
const emptyResult = { data: [], total: 0, from: 0, to: 0, last_page: 1 };
const roleLabel = (role) =>
  role === 'super_admin'
    ? 'Super Admin'
    : role.charAt(0).toUpperCase() + role.slice(1);

export default function UsersListLayer({ view = 'list' }) {
  const actor = useAccessUser();
  const navigate = useNavigate();
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const deletingRef = useRef(false);
  const [result, setResult] = useState(emptyResult);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (search === query) return;
    const timeout = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, query]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api(
      `/users?search=${encodeURIComponent(query)}&page=${page}&per_page=${limit}`,
      { signal: controller.signal },
    )
      .then((data) => {
        if (controller.signal.aborted) return;
        if (page > data.last_page) {
          setPage(data.last_page);
          return;
        }
        setResult(data);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setError(error.message);
        setResult(emptyResult);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, page, limit, attempt]);

  const canManage = (user) =>
    user.role === 'super_admin'
      ? actor?.role === 'super_admin'
      : user.role === 'admin'
        ? ['admin', 'super_admin'].includes(actor?.role)
        : true;
  const openAction = (type, user) => {
    setActionError('');
    setAction({ type, user });
  };
  const saved = (data) => {
    if (data.requires_reauthentication) {
      clearToken();
      navigate('/sign-in', { replace: true });
      return;
    }
    setAction(null);
    setNotice(data.message);
    setAttempt((value) => value + 1);
  };
  const deleted = (data = {}) => {
    if (data.requires_reauthentication) {
      clearToken();
      navigate('/sign-in', { replace: true });
      return;
    }
    setAction(null);
    setNotice('User deleted successfully.');
    if (result.data.length === 1 && page > 1) setPage(page - 1);
    else setAttempt((value) => value + 1);
  };
  const remove = async () => {
    if (deletingRef.current) return;
    deletingRef.current = true;
    setBusy(true);
    setActionError('');
    try {
      const data = await api(`/users/${action.user.id}`, { method: 'DELETE' });
      deleted(data);
    } catch (error) {
      if (error.status === 404) deleted();
      else setActionError(error.message);
    } finally {
      deletingRef.current = false;
      setBusy(false);
    }
  };

  return (
    <>
      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}
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
          id="users-limit"
          limit={limit}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
          search={search}
          searchLabel="Search users"
          onSearchChange={setSearch}
          actions={
            <Link
              to="/add-user"
              className="btn btn-primary radius-8 d-flex align-items-center gap-2"
            >
              <Icon icon="ic:baseline-plus" aria-hidden="true" />
              Add New User
            </Link>
          }
        />
        <div className="card-body p-24">
          {view === 'grid' ? (
            <div className="row gy-4">
              {loading ? (
                <p role="status">Loading users...</p>
              ) : result.data.length === 0 ? (
                <p>No users found.</p>
              ) : (
                result.data.map((user) => (
                  <div key={user.id} className="col-sm-6 col-xl-4">
                    <div className="card h-100">
                      <div className="card-body p-24">
                        <h6 className="text-break">{user.name}</h6>
                        <p className="fw-semibold">User ID: {user.user_code}</p>
                        <p className="text-break">{user.email}</p>
                        <p className="text-break">{user.username || '—'}</p>
                        <p>{user.phone || '—'}</p>
                        <p>{roleLabel(user.role)}</p>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => openAction('view', user)}
                            aria-label={`View ${user.name}`}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            disabled={!canManage(user)}
                            onClick={() => openAction('edit', user)}
                            aria-label={`Edit ${user.name}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={!canManage(user)}
                            onClick={() => openAction('delete', user)}
                            aria-label={`Delete ${user.name}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <ModuleTable columns={columns}>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} role="status">
                    Loading users...
                  </td>
                </tr>
              ) : result.data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>No users found.</td>
                </tr>
              ) : (
                result.data.map((user, index) => (
                  <tr key={user.id}>
                    <td>{result.from + index}</td>
                    <td>{user.user_code || '—'}</td>
                    <td className="fw-medium">
                      <ModuleTableCell id={`user-name-${user.id}`}>
                        {user.name}
                      </ModuleTableCell>
                    </td>
                    <td>
                      <ModuleTableCell id={`user-email-${user.id}`}>
                        {user.email}
                      </ModuleTableCell>
                    </td>
                    <td>
                      <ModuleTableCell id={`user-username-${user.id}`}>
                        {user.username || '—'}
                      </ModuleTableCell>
                    </td>
                    <td>
                      <ModuleTableCell id={`user-phone-${user.id}`}>
                        {user.phone || '—'}
                      </ModuleTableCell>
                    </td>
                    <td>
                      <ModuleTableCell id={`user-role-${user.id}`}>
                        {roleLabel(user.role)}
                      </ModuleTableCell>
                    </td>
                    <td>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center flex-nowrap gap-10">
                        <button
                          type="button"
                          className="module-table-action bg-primary-50 text-primary-600 w-40-px h-40-px rounded-circle"
                          aria-label={`View ${user.name}`}
                          title="View user"
                          onClick={() => openAction('view', user)}
                        >
                          <Icon icon="iconamoon:eye-light" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="module-table-action bg-success-focus text-success-600 w-40-px h-40-px rounded-circle"
                          aria-label={`Edit ${user.name}`}
                          title="Edit user"
                          disabled={!canManage(user)}
                          onClick={() => openAction('edit', user)}
                        >
                          <Icon icon="lucide:edit" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="module-table-action bg-danger-focus text-danger-600 w-40-px h-40-px rounded-circle"
                          aria-label={`Delete ${user.name}`}
                          title="Delete user"
                          disabled={!canManage(user)}
                          onClick={() => openAction('delete', user)}
                        >
                          <Icon
                            icon="fluent:delete-24-regular"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </ModuleTable>
          )}
          <ModuleTablePagination
            page={page}
            pages={result.last_page}
            loading={loading || Boolean(error)}
            from={result.from ?? 0}
            to={result.to ?? 0}
            total={result.total}
            onPageChange={setPage}
            label="User pages"
          />
        </div>
      </div>
      <Modal
        show={Boolean(action)}
        onHide={() => !busy && setAction(null)}
        size={action?.type === 'delete' ? undefined : 'lg'}
        centered
        scrollable
        aria-labelledby="user-action-title"
      >
        <Modal.Header closeButton={!busy}>
          <Modal.Title as="h1" className="fs-5" id="user-action-title">
            {action?.type === 'edit'
              ? 'Edit User'
              : action?.type === 'delete'
                ? 'Delete User'
                : 'User Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={action?.type === 'edit' ? 'p-0' : 'p-24'}>
          {action?.type === 'view' && (
            <UserDetailsLayer key={action.user.id} userId={action.user.id} />
          )}
          {action?.type === 'edit' && (
            <AddUserLayer
              key={action.user.id}
              userId={action.user.id}
              onSaved={saved}
              onSavingChange={setBusy}
            />
          )}
          {action?.type === 'delete' && (
            <>
              {actionError && (
                <div className="alert alert-danger" role="alert">
                  {actionError}
                </div>
              )}
              <p>
                Delete {action.user.name}? This removes their account and
                profile details.
              </p>
            </>
          )}
        </Modal.Body>
        {action?.type !== 'edit' && (
          <Modal.Footer>
            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={busy}
              onClick={() => setAction(null)}
            >
              {action?.type === 'delete' ? 'Cancel' : 'Close'}
            </button>
            {action?.type === 'delete' && (
              <button
                type="button"
                className="btn btn-danger"
                disabled={busy}
                onClick={remove}
              >
                {busy ? 'Deleting...' : 'Delete User'}
              </button>
            )}
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
}
