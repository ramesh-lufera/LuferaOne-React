import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Modal } from 'react-bootstrap';
import { api } from '../services/api';
import './RoleAccessLayer.css';
import ModuleTable, {
  ModuleTablePagination,
  ModuleTableToolbar,
} from './ModuleTable';
import ModuleTableCell from './ModuleTableCell';

const emptyRole = { name: '', description: '', active: true, modules: [] };
const categoryKey = (id) => `category:${id}`;

const roleColumns = [
  { label: 'S.L', width: 64 },
  { label: 'Role', width: 150 },
  { label: 'Description', width: 240 },
  { label: 'Modules', width: 260 },
  { label: 'Status', width: 150, align: 'center' },
  { label: 'Action', width: 128, align: 'center' },
];

export default function RoleAccessLayer() {
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState({});
  const [categories, setCategories] = useState([]);
  const categoryNames = new Map(categories.map(({ id, name }) => [categoryKey(id), name]));
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState(null);
  const [step, setStep] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/roles?include_categories=1');
      setRoles(data.roles);
      setModules(data.modules);
      setCategories(data.categories);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async (event) => {
    event.preventDefault();
    if (step === 1) {
      if (!draft.name.trim()) {
        setFormError('Role Name is required.');
        return;
      }
      setFormError('');
      setStep(2);
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await api(draft.id ? `/roles/${draft.id}` : '/roles', {
        method: draft.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          active: draft.active,
          modules: draft.modules.filter((key) => !key.startsWith('category:') || categoryNames.has(key)),
        }),
      });
      setDraft(null);
      setNotice(draft.id ? 'Role updated.' : 'Role saved.');
      await load();
    } catch (error) {
      if (
        ['name', 'description', 'active'].some((field) => error.errors?.[field])
      ) {
        setStep(1);
      }
      setFormError(
        Object.values(error.errors || {})
          .flat()
          .join(' ') || error.message,
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    setSaving(true);
    setFormError('');
    try {
      await api(`/roles/${deleting.id}`, { method: 'DELETE' });
      setDeleting(null);
      setNotice('Role deleted.');
      await load();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };
  const filtered = roles.filter(
    (role) =>
      `${role.name} ${role.description || ''}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === '' || String(role.active) === status),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * limit;
  const shown = filtered.slice(start, start + limit);
  const edit = (role) => {
    setStep(1);
    setFormError('');
    setDraft({ ...role, modules: [...role.modules] });
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
          <button className="btn btn-sm btn-outline-danger" onClick={load}>
            Try again
          </button>
        </div>
      )}
      <div className="card h-100 p-0 radius-12">
        <ModuleTableToolbar
          id="role-limit"
          limit={limit}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
          search={search}
          searchLabel="Search roles"
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          filters={
            <select
              className="form-select w-auto"
              aria-label="Filter role status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          }
          actions={
            <button
              className="btn btn-primary radius-8 d-flex align-items-center gap-2"
              onClick={() => edit(emptyRole)}
            >
              <Icon icon="ic:baseline-plus" />
              Add New Role
            </button>
          }
        />
        <div className="card-body p-24">
          <ModuleTable columns={roleColumns}>
            {loading ? (
              <tr>
                <td colSpan={6} role="status">
                  Loading roles...
                </td>
              </tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={6}>No roles found.</td>
              </tr>
            ) : (
              shown.map((role, index) => (
                <tr key={role.id}>
                  <td>{start + index + 1}</td>
                  <td className="fw-medium">
                    {role.name === 'super_admin'
                      ? 'Super Admin'
                      : role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </td>
                  <td>
                    <ModuleTableCell id={`role-description-${role.id}`}>
                      {role.description || '—'}
                    </ModuleTableCell>
                  </td>
                  <td>
                    <ModuleTableCell id={`role-modules-${role.id}`}>
                      {role.modules.includes('*')
                        ? 'All modules'
                        : role.modules
                            .map((key) => categoryNames.get(key) || modules[key]?.label || key)
                            .join(', ') || 'No modules'}
                    </ModuleTableCell>
                  </td>
                  <td className="text-center">
                    <span
                      className={`${role.active ? 'bg-success-focus text-success-600' : 'bg-danger-focus text-danger-600'} px-24 py-4 radius-4 fw-medium text-sm`}
                    >
                      {role.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-10 justify-content-center flex-nowrap">
                      <button
                        aria-label={`Edit ${role.name}`}
                        disabled={['admin', 'super_admin'].includes(role.name)}
                        onClick={() => edit(role)}
                        className="module-table-action bg-success-focus text-success-600 w-40-px h-40-px rounded-circle"
                      >
                        <Icon icon="lucide:edit" />
                      </button>
                      <button
                        aria-label={`Delete ${role.name}`}
                        disabled={
                          ['super_admin', 'admin', 'user', 'auditor'].includes(
                            role.name,
                          ) || role.users_count > 0
                        }
                        onClick={() => {
                          setFormError('');
                          setDeleting(role);
                        }}
                        className="module-table-action bg-danger-focus text-danger-600 w-40-px h-40-px rounded-circle"
                      >
                        <Icon icon="fluent:delete-24-regular" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </ModuleTable>
          <ModuleTablePagination
            page={currentPage}
            pages={pages}
            loading={loading}
            from={filtered.length ? start + 1 : 0}
            to={Math.min(start + limit, filtered.length)}
            total={filtered.length}
            onPageChange={setPage}
            label="Role pages"
          />
        </div>
      </div>
      <Modal
        show={Boolean(draft)}
        onHide={() => !saving && setDraft(null)}
        dialogClassName="role-wizard-dialog"
        centered
        scrollable
        aria-labelledby="role-modal-title"
      >
        <Modal.Header closeButton={!saving}>
          <Modal.Title as="h1" className="fs-5" id="role-modal-title">
            {draft?.id ? 'Edit Role' : 'Add New Role'}
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={save} className="role-wizard-form">
          <Modal.Body>
            <div className="form-wizard-header overflow-x-auto scroll-sm pb-8 my-32">
              <ul
                className="list-unstyled form-wizard-list"
                aria-label="Role setup progress"
              >
                {['Role Details', 'Permissions'].map((label, index) => (
                  <li
                    key={label}
                    className={`form-wizard-list__item flex-fill text-center ${step > index + 1 ? 'activated' : ''} ${step === index + 1 ? 'active' : ''}`}
                    aria-current={step === index + 1 ? 'step' : undefined}
                  >
                    <div className="form-wizard-list__line">
                      <span className="count">{index + 1}</span>
                    </div>
                    <span className="text text-sm">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
            {formError && (
              <div className="alert alert-danger" role="alert">
                {formError}
              </div>
            )}
            {draft && (
              <fieldset disabled={saving}>
                {step === 1 ? (
                  <div className="role-wizard-details">
                    <div>
                      <label htmlFor="role-name" className="form-label">
                        Role Name
                      </label>
                      <input
                        id="role-name"
                        autoFocus
                        required
                        maxLength={30}
                        disabled={['user', 'auditor'].includes(
                          roles.find((role) => role.id === draft.id)?.name,
                        )}
                        className="form-control"
                        placeholder="Enter Role Name"
                        value={draft.name}
                        onChange={(event) =>
                          setDraft({ ...draft, name: event.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="role-description" className="form-label">
                        Description
                      </label>
                      <textarea
                        id="role-description"
                        maxLength={1000}
                        className="form-control"
                        placeholder="Write some text"
                        rows={4}
                        value={draft.description || ''}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            description: event.target.value,
                          })
                        }
                      />
                    </div>
                    <fieldset className="role-wizard-status">
                      <legend className="form-label">Status</legend>
                      <div className="d-flex align-items-center gap-28">
                        {[true, false].map((active) => (
                          <label
                            key={String(active)}
                            className="role-wizard-choice"
                          >
                            <input
                              type="radio"
                              name="role-status"
                              checked={draft.active === active}
                              onChange={() => setDraft({ ...draft, active })}
                            />
                            <span
                              className={
                                active
                                  ? 'role-status-active'
                                  : 'role-status-inactive'
                              }
                            />
                            {active ? 'Active' : 'Inactive'}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                ) : (
                  loading ? <p role="status" className="mb-0">Loading categories…</p>
                    : error ? <p className="mb-0">Categories unavailable.</p>
                    : categories.length > 0 ? (
                    <fieldset>
                      <legend className="visually-hidden">Category permissions</legend>
                      <label className="role-wizard-choice role-wizard-select-all">
                        <input
                          type="checkbox"
                          checked={categories.every(({ id }) => draft.modules.includes(categoryKey(id)))}
                          onChange={(event) => setDraft({
                            ...draft,
                            modules: [
                              ...draft.modules.filter((key) => !categoryNames.has(key)),
                              ...(event.target.checked ? categoryNames.keys() : []),
                            ],
                          })}
                        />
                        Select All Modules
                      </label>
                      <div className="role-wizard-categories">
                        {categories.map(({ id, name }) => {
                          const key = categoryKey(id);
                          return (
                            <label key={key} className="role-wizard-choice">
                              <input
                                type="checkbox"
                                checked={draft.modules.includes(key)}
                                onChange={(event) => setDraft({
                                  ...draft,
                                  modules: event.target.checked
                                    ? [...draft.modules, key]
                                    : draft.modules.filter((value) => value !== key),
                                })}
                              />
                              {name}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  ) : <p className="mb-0">No categories found.</p>
                )}
              </fieldset>
            )}
          </Modal.Body>
          <Modal.Footer>
            {step === 1 ? (
              <button
                type="button"
                className="btn role-wizard-cancel"
                disabled={saving}
                onClick={() => setDraft(null)}
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                className="btn role-wizard-back"
                data-theme-exempt
                disabled={saving}
                onClick={() => setStep(1)}
              >
                Back
              </button>
            )}
            <button
              key={step}
              type="submit"
              className={`btn role-wizard-submit ${draft?.id && step === 2 ? 'role-wizard-update' : ''}`}
              disabled={saving || (step === 2 && (loading || Boolean(error)))}
            >
              {saving
                ? 'Saving...'
                : step === 1
                  ? 'Next'
                  : draft?.id
                    ? 'Update'
                    : 'Save'}
            </button>
          </Modal.Footer>
        </form>
      </Modal>
      <Modal
        show={Boolean(deleting)}
        onHide={() => !saving && setDeleting(null)}
        centered
        aria-labelledby="delete-role-title"
      >
        <Modal.Header closeButton={!saving}>
          <Modal.Title id="delete-role-title">Delete Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && (
            <div role="alert" className="alert alert-danger">
              {formError}
            </div>
          )}
          Delete the role “{deleting?.name}”?
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-outline-primary"
            disabled={saving}
            onClick={() => setDeleting(null)}
          >
            Cancel
          </button>
          <button className="btn btn-danger" disabled={saving} onClick={remove}>
            {saving ? 'Deleting...' : 'Delete'}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
