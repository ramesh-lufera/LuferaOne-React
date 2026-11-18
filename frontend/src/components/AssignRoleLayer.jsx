import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAccessUser } from '../helper/AccessContext';
import ModuleTable, {
  ModuleTablePagination,
  ModuleTableToolbar,
} from './ModuleTable';
import ModuleTableCell from './ModuleTableCell';

const columns = [
  { label: 'S.L', width: 64 },
  { label: 'User ID', width: 110 },
  { label: 'User', width: 190 },
  { label: 'Email', width: 260 },
  { label: 'Current Role', width: 170 },
  { label: 'Assign Role', width: 220 },
  { label: 'Action', width: 128, align: 'center' },
];

const roleLabel = (role) =>
  role === 'super_admin'
    ? 'Super Admin'
    : role.charAt(0).toUpperCase() + role.slice(1);

export default function AssignRoleLayer() {
  const actor = useAccessUser();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [choices, setChoices] = useState({});
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [range, setRange] = useState({ from: 0, to: 0, total: 0 });
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
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
    Promise.all([
      api('/roles', { signal: controller.signal }),
      api(
        `/role-users?search=${encodeURIComponent(query)}&page=${page}&per_page=${limit}`,
        {
          signal: controller.signal,
        },
      ),
    ])
      .then(([roleData, userData]) => {
        if (controller.signal.aborted) return;
        setRoles(roleData.roles);
        setUsers(userData.data);
        setChoices({});
        setPages(userData.last_page);
        setRange({
          from:
            userData.from ??
            (userData.data.length ? (page - 1) * limit + 1 : 0),
          to:
            userData.to ??
            (userData.data.length
              ? (page - 1) * limit + userData.data.length
              : 0),
          total: userData.total ?? userData.data.length,
        });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, page, limit, attempt]);
  const assign = async (user) => {
    setSaving(user.id);
    setError('');
    setNotice('');
    try {
      const role = choices[user.id];
      await api(`/role-users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? { ...item, role } : item)),
      );
      setNotice(`Role assigned to ${user.name}.`);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(null);
    }
  };
  return (
    <>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}{' '}
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => setAttempt(attempt + 1)}
          >
            Refresh
          </button>
        </div>
      )}
      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}
      <div className="card h-100 p-0 radius-12">
        <ModuleTableToolbar
          id="assign-role-limit"
          limit={limit}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
          search={search}
          searchLabel="Search users"
          onSearchChange={setSearch}
        />
        <div className="card-body p-24">
          <ModuleTable columns={columns}>
            {loading ? (
              <tr>
                <td colSpan={columns.length} role="status">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>No users found.</td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id}>
                  <td>{range.from + index}</td>
                  <td>{user.user_code || '—'}</td>
                  <td>
                    <ModuleTableCell id={`assign-user-${user.id}`}>
                      {user.name}
                    </ModuleTableCell>
                  </td>
                  <td>
                    <ModuleTableCell id={`assign-email-${user.id}`}>
                      {user.email}
                    </ModuleTableCell>
                  </td>
                  <td>{roleLabel(user.role)}</td>
                  <td>
                    <select
                      aria-label={`Role for ${user.email}`}
                      className="form-select"
                      disabled={
                        saving !== null ||
                        (user.role === 'super_admin' &&
                          actor?.role !== 'super_admin')
                      }
                      value={choices[user.id] ?? user.role}
                      onChange={(event) =>
                        setChoices({
                          ...choices,
                          [user.id]: event.target.value,
                        })
                      }
                    >
                      {!roles.some(
                        (role) => role.name === user.role && role.active,
                      ) && (
                        <option value={user.role} disabled>
                          {user.role} (unavailable)
                        </option>
                      )}
                      {roles
                        .filter((role) => role.active)
                        .map((role) => (
                          <option
                            key={role.id}
                            value={role.name}
                            disabled={
                              role.name === 'super_admin' &&
                              actor?.role !== 'super_admin'
                            }
                          >
                            {roleLabel(role.name)}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={
                        saving !== null ||
                        !choices[user.id] ||
                        choices[user.id] === user.role
                      }
                      onClick={() => assign(user)}
                    >
                      {saving === user.id ? 'Saving...' : 'Save'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </ModuleTable>
          <ModuleTablePagination
            page={page}
            pages={pages}
            loading={loading}
            from={range.from}
            to={range.to}
            total={range.total}
            onPageChange={setPage}
            label="User pages"
          />
        </div>
      </div>
    </>
  );
}
