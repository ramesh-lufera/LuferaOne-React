import { useEffect, useRef, useState } from 'react';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import MasterLayout from '../masterLayout/MasterLayout';
import ModulePageHeader from '../components/ModulePageHeader';
import ModuleTable, {
  ModuleTablePagination,
  ModuleTableToolbar,
} from '../components/ModuleTable';
import ModuleTableCell from '../components/ModuleTableCell';
import { api } from '../services/api';
import './CategoriesPage.css';

const columns = [
  { label: 'Category Name', width: 200 },
  { label: 'Category URL', width: 244 },
  { label: 'Category Type', width: 184 },
  { label: 'Action', width: 116, align: 'center' },
];

const emptyCategories = { data: [], from: 0, to: 0, total: 0, last_page: 1 };

// eslint-disable-next-line react/prop-types
function CategoryItemsField({ name, label, itemLabel, initialItems = [] }) {
  const [rows, setRows] = useState(() => Array.from(
    { length: Math.max(1, initialItems.length) },
    (_, index) => index + 1,
  ));
  const nextRow = useRef(rows.length + 1);

  return (
    <div className="col-12 col-sm-6" role="group" aria-labelledby={`category-${name}-label`}>
      <label id={`category-${name}-label`} htmlFor={`category-${name}-1`} className="form-label">
        {label}
      </label>
      <div className="d-grid gap-2">
        {rows.map((row, index) => (
          <div key={row} className="d-flex gap-2">
            <input
              id={`category-${name}-${row}`}
              name={`${name}[]`}
              type="text"
              className="form-control"
              defaultValue={initialItems[row - 1] ?? ''}
              maxLength={255}
              aria-label={`${itemLabel} ${index + 1}`}
            />
            {index === 0 ? (
              <button
                type="button"
                data-theme-exempt
                className="btn btn-success flex-shrink-0 radius-8"
                aria-label={`Add ${itemLabel}`}
                disabled={rows.length >= 50}
                onClick={() => {
                  const newRow = nextRow.current++;
                  setRows((current) => [...current, newRow]);
                }}
              >
                +
              </button>
            ) : (
              <button
                type="button"
                data-theme-exempt
                className="btn btn-danger flex-shrink-0 radius-8"
                aria-label={`Remove ${itemLabel} ${index + 1}`}
                onClick={() => setRows((current) => current.filter((id) => id !== row))}
              >
                −
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [showEditor, setShowEditor] = useState(false);
  const [editSlug, setEditSlug] = useState(null);
  const [editResult, setEditResult] = useState(null);
  const [categories, setCategories] = useState(emptyCategories);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveErrors, setSaveErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const savePending = useRef(false);
  const deletePending = useRef(false);
  const editingCategory = editResult?.category;

  useEffect(() => {
    if (!showEditor || !editSlug) return;
    const controller = new AbortController();
    api(`/categories/${encodeURIComponent(editSlug)}`, { signal: controller.signal })
      .then(({ category }) => {
        if (!controller.signal.aborted) setEditResult({ category });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setEditResult({ error: error.message });
      });
    return () => controller.abort();
  }, [editSlug, showEditor]);

  function openCategoryEditor(slug = null) {
    setEditSlug(slug);
    setEditResult(null);
    setSaveErrors([]);
    setShowEditor(true);
  }

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ search: search.trim(), page, per_page: limit });
    setLoading(true);
    setListError('');
    api(`/categories?${params}`, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setCategories(result);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setCategories(emptyCategories);
          setListError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [search, page, limit, refresh]);

  async function saveCategory(event) {
    event.preventDefault();
    if (savePending.current || (editSlug && !editingCategory)) return;
    const form = event.currentTarget;
    const body = new FormData(form);
    const image = form.elements.namedItem('featured_image').files[0];
    if (image) body.set('featured_image', image);
    else body.delete('featured_image');
    body.set('requires_login', body.has('requires_login') ? '1' : '0');
    if (editingCategory) body.set('_method', 'PUT');
    savePending.current = true;
    setSaving(true);
    setSaveErrors([]);
    setSuccess('');

    try {
      const path = editingCategory ? `/categories/${editingCategory.id}` : '/categories';
      const result = await api(path, { method: 'POST', body });
      setShowEditor(false);
      setSuccess(result.message);
      setSearch('');
      setPage(1);
      setRefresh((value) => value + 1);
    } catch (error) {
      setSaveErrors(error.errors ? Object.values(error.errors).flat() : [error.message]);
    } finally {
      savePending.current = false;
      setSaving(false);
    }
  }

  async function deleteCategory() {
    if (!deleteTarget || deletePending.current) return;
    deletePending.current = true;
    setDeleting(true);
    setDeleteError('');
    setSuccess('');

    try {
      const result = await api(`/categories/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      setSuccess(result.message);
      if (page > 1 && categories.data.length === 1) {
        setPage((current) => current - 1);
      }
      setRefresh((value) => value + 1);
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      deletePending.current = false;
      setDeleting(false);
    }
  }

  return (
    <MasterLayout>
      <div className="categories-header">
        <ModulePageHeader title="Categories" />
      </div>
      {success && <div className="alert alert-success" role="status">{success}</div>}
      {listError && (
        <div className="alert alert-danger" role="alert">
          {listError}{' '}
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setRefresh((value) => value + 1)}>
            Try again
          </button>
        </div>
      )}
      <div className="card categories-card p-0 radius-12">
        <ModuleTableToolbar
          id="categories-limit"
          limit={limit}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
          search={search}
          searchLabel="Search categories"
          searchMaxLength={255}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          actions={
            <button
              type="button"
              className="btn btn-primary radius-8"
              aria-haspopup="dialog"
              onClick={() => openCategoryEditor()}
            >
              + Add New Category
            </button>
          }
        />
        <div className="card-body p-24">
          <ModuleTable columns={columns}>
            {loading || !categories.data.length ? (
              <tr>
                <td colSpan={columns.length}>
                  {loading ? 'Loading categories…' : listError ? 'Categories unavailable.' : 'No categories found.'}
                </td>
              </tr>
            ) : (
              categories.data.map(({ id, name, url, type, page_slug: slug, page_path: pagePath }) => (
                <tr key={id}>
                  <td><ModuleTableCell id={`category-name-${id}`}>{name}</ModuleTableCell></td>
                  <td>
                    <Link to={pagePath} className="text-primary-600">
                      <ModuleTableCell id={`category-url-${id}`}>{url || 'Open category'}</ModuleTableCell>
                    </Link>
                  </td>
                  <td>{type}</td>
                  <td className="text-center">
                    <div className="category-actions d-flex justify-content-center gap-1">
                      <button
                        type="button"
                        className="module-table-action bg-warning-focus text-warning-main rounded-circle"
                        aria-label={`Edit ${name}`}
                        aria-haspopup="dialog"
                        onClick={() => openCategoryEditor(slug)}
                      >
                        <PencilSimple weight="bold" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="module-table-action bg-danger-focus text-danger-main rounded-circle"
                        aria-label={`Delete ${name}`}
                        aria-haspopup="dialog"
                        onClick={() => {
                          setDeleteError('');
                          setDeleteTarget({ id, name });
                        }}
                      >
                        <Trash weight="bold" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </ModuleTable>
          <ModuleTablePagination
            page={page}
            pages={categories.last_page}
            from={categories.from ?? 0}
            to={categories.to ?? 0}
            total={categories.total}
            loading={loading || Boolean(listError)}
            onPageChange={setPage}
            label="Category pages"
          />
        </div>
      </div>
      <Modal
        show={showEditor}
        onHide={() => {
          if (!saving) setShowEditor(false);
        }}
        backdrop={saving ? 'static' : true}
        keyboard={!saving}
        centered
        scrollable
        size="lg"
        aria-labelledby="category-editor-title"
      >
        <Modal.Header closeButton={!saving}>
          <Modal.Title as="h2" id="category-editor-title" className="text-xl">
            {editSlug ? 'Edit Category' : 'Add New Category'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {saveErrors.length > 0 && (
            <div className="alert alert-danger" role="alert">
              <ul className="mb-0 ps-3">
                {saveErrors.map((message, index) => <li key={index}>{message}</li>)}
              </ul>
            </div>
          )}
          {editSlug && !editingCategory ? (
            editResult?.error
              ? <p className="alert alert-danger mb-0" role="alert">{editResult.error}</p>
              : <p role="status">Loading category…</p>
          ) : (
            <form id="category-editor-form" onSubmit={saveCategory}>
              <fieldset className="row g-3" disabled={saving}>
                  <div className="col-12">
                    <label htmlFor="category-featured-image" className="form-label">Featured Image</label>
                    {editingCategory?.featured_image_url && (
                      <div className="mb-8">
                        <img src={editingCategory.featured_image_url} alt="Current featured image" className="rounded" style={{ maxWidth: '100%', maxHeight: 100 }} />
                      </div>
                    )}
                    <input id="category-featured-image" name="featured_image" type="file" accept="image/jpeg,image/png,image/webp" className="form-control" />
                  </div>
                  <div className="col-12 col-sm-8">
                    <label htmlFor="category-name" className="form-label">Name</label>
                    <input id="category-name" name="name" type="text" className="form-control" maxLength={255} defaultValue={editingCategory?.name ?? ''} required />
                  </div>
                  <div className="col-12 col-sm-4">
                    <label htmlFor="category-type" className="form-label">Type</label>
                    <select id="category-type" name="type" className="form-select" defaultValue={editingCategory?.type ?? ''} required>
                      <option value="" disabled>Select type</option>
                      <option value="package">Package</option>
                      <option value="product">Product</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="category-description" className="form-label">Description</label>
                    <textarea id="category-description" name="description" className="form-control" rows={3} maxLength={10000} defaultValue={editingCategory?.description ?? ''} />
                  </div>
                  <div className="col-12">
                    <label htmlFor="category-url" className="form-label">URL</label>
                    <input id="category-url" name="url" type="text" className="form-control" maxLength={2048} defaultValue={editingCategory?.url ?? ''} />
                  </div>
                  <CategoryItemsField name="inclusions" label="Inclusions" itemLabel="inclusion" initialItems={editingCategory?.inclusions} />
                  <CategoryItemsField name="exclusions" label="Exclusions" itemLabel="exclusion" initialItems={editingCategory?.exclusions} />
                  <div className="col-12">
                    <div className="form-check style-check d-flex align-items-center gap-2 ps-0">
                      <input id="category-requires-login" name="requires_login" type="checkbox" className="form-check-input m-0 flex-shrink-0" defaultChecked={editingCategory?.requires_login ?? false} />
                      <label htmlFor="category-requires-login" className="form-check-label">Required as login</label>
                    </div>
                  </div>
              </fieldset>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary radius-8" disabled={saving} onClick={() => setShowEditor(false)}>
            Close
          </button>
          <button type="submit" form="category-editor-form" className="btn btn-primary radius-8" disabled={saving || Boolean(editSlug && !editingCategory)}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={Boolean(deleteTarget)}
        onHide={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        backdrop={deleting ? 'static' : true}
        keyboard={!deleting}
        centered
        aria-labelledby="category-delete-title"
      >
        <Modal.Header closeButton={!deleting}>
          <Modal.Title as="h2" id="category-delete-title" className="text-xl">Delete Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Delete <strong>{deleteTarget?.name}</strong>, its internal and external pages, and its featured image? This is permanent.
          </p>
          {deleteError && <p className="alert alert-danger mt-12 mb-0" role="alert">{deleteError}</p>}
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary radius-8" disabled={deleting} onClick={() => setDeleteTarget(null)}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger radius-8" disabled={deleting} onClick={deleteCategory}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </Modal.Footer>
      </Modal>
    </MasterLayout>
  );
}
