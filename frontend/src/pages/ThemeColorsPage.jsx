import { useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import MasterLayout from "../masterLayout/MasterLayout";
import ModulePageHeader from "../components/ModulePageHeader";
import { api } from "../services/api";
import "./ThemeColorsPage.css";

const palettes = [
  { id: "lufera-infotech", label: "Lufera Infotech", color: "#1d8b8d", focus: "#d8e6e7", text: "#0b1d1f" },
  { id: "blue", label: "Blue", color: "#487fff", focus: "#bfdcff" },
  { id: "magenta", label: "Magenta", color: "#8252e9", focus: "#ebd7ff" },
  { id: "orange", label: "Orange", color: "#ff9f29", focus: "#fef9c3" },
  { id: "green", label: "Green", color: "#16a34a", focus: "#dcfce7" },
  { id: "red", label: "Red", color: "#dc2626", focus: "#fee2e2" },
  { id: "blue-dark", label: "Blue Dark", color: "#2563eb", focus: "#dbeafe" },
];

const paletteStorageKey = "lufera-theme-color-palettes";
const defaultCustomColors = { color: "#487fff", focus: "#dbe9ff", text: "#000000" };

const readSavedPalettes = () => {
  const saved = JSON.parse(localStorage.getItem(paletteStorageKey) || "[]");
  const isColor = (value) => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
  if (!Array.isArray(saved) || !saved.every((palette) =>
    palette && typeof palette.id === "string" && typeof palette.label === "string" &&
    isColor(palette.color) && isColor(palette.focus) && isColor(palette.text)
  )) {
    throw new Error("Invalid saved palettes");
  }
  return saved;
};

const ThemeColorsPage = () => {
  const [showAddColor, setShowAddColor] = useState(false);
  const [savedColors, setSavedColors] = useState({ palettes: [], error: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const draftId = useRef(null);
  const [nameError, setNameError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [message, setMessage] = useState("");
  const [appliedColors, setAppliedColors] = useState(null);
  const [selectedPalette, setSelectedPalette] = useState('blue');
  const [customColors, setCustomColors] = useState(defaultCustomColors);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [editingPalette, setEditingPalette] = useState(null);
  const [deletePalette, setDeletePalette] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const busy = saving || savingSettings || deleting;
  const pageStyle = appliedColors ? {
    '--theme-page-main': appliedColors.color,
    '--theme-page-focus': appliedColors.focus,
    '--theme-page-text': appliedColors.text,
  } : undefined;

  const updateCustomColor = (field, value) => {
    setCustomColors((current) => ({ ...current, [field]: value }));
    setSelectedPalette('custom');
  };

  const selectCustomPalette = () => {
    if (busy || selectedPalette === 'custom') return;
    setSelectedPalette('custom');
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    if (savingSettings || loading) return;
    const palette = [...palettes, ...savedColors.palettes].find((item) => item.id === selectedPalette);
    const colors = selectedPalette === 'custom' ? customColors : { color: palette.color, focus: palette.focus, text: palette.text || '#000000' };
    setSavingSettings(true);
    setSettingsError("");
    try {
      const result = await api('/theme-color-palettes/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palette_id: selectedPalette, ...colors }),
      });
      setAppliedColors(result.settings);
      window.dispatchEvent(new CustomEvent('saved-theme-colors', { detail: result.settings }));
      setMessage('Colors saved and applied.');
    } catch (error) {
      setSettingsError(`Unable to save page colors. ${error.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const closeAddColor = () => {
    if (saving) return;
    setShowAddColor(false);
  };

  const openColorEditor = (palette = null) => {
    draftId.current = palette?.id || crypto.randomUUID();
    setEditingPalette(palette);
    setNameError("");
    setSaveError("");
    setShowAddColor(true);
  };

  const openDeleteColor = (palette) => {
    setDeleteError("");
    setDeletePalette(palette);
  };

  const closeDeleteColor = () => {
    if (deleting || !deletePalette) return;
    setDeletePalette(null);
  };

  const confirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const result = await api(`/theme-color-palettes/${deletePalette.id}`, { method: 'DELETE' });
      setSavedColors((current) => ({ ...current, palettes: current.palettes.filter((palette) => palette.id !== deletePalette.id) }));
      setAppliedColors(result.settings);
      setSelectedPalette((current) => current === deletePalette.id ? result.settings?.palette_id || 'blue' : current);
      if (result.settings?.palette_id === 'custom') setCustomColors(result.settings);
      setMessage(`“${deletePalette.label}” color palette deleted successfully.`);
      setDeletePalette(null);
    } catch (error) {
      setDeleteError(`Unable to delete this color. ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadColors = async () => {
      setLoading(true);
      try {
        let result = await api('/theme-color-palettes', { signal: controller.signal });
        setSavedColors({ palettes: result.palettes, error: "" });
        setAppliedColors(result.settings);
        setSelectedPalette(result.settings?.palette_id || 'blue');
        if (result.settings?.palette_id === 'custom') setCustomColors(result.settings);
        const browserPalettes = readSavedPalettes();
        for (const palette of browserPalettes) {
          await api('/theme-color-palettes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(palette),
            signal: controller.signal,
          });
        }
        if (browserPalettes.length) {
          result = await api('/theme-color-palettes', { signal: controller.signal });
          setSavedColors({ palettes: result.palettes, error: "" });
          localStorage.removeItem(paletteStorageKey);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setSavedColors((current) => ({ ...current, error: `Unable to load or import saved colors. ${error.message}` }));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadColors();
    return () => controller.abort();
  }, [attempt]);

  const saveColor = async (event) => {
    event.preventDefault();
    if (saving) return;
    const fields = new FormData(event.currentTarget);
    const label = fields.get("color-name").trim();
    if (!label) {
      setNameError("Enter a color name.");
      return;
    }
    const palette = {
      id: draftId.current,
      label,
      color: fields.get("main"),
      focus: fields.get("focus"),
      text: fields.get("text"),
    };
    setSaving(true);
    setSaveError("");
    try {
      const result = await api(editingPalette ? `/theme-color-palettes/${editingPalette.id}` : '/theme-color-palettes', {
        method: editingPalette ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(palette),
      });
      setSavedColors((current) => ({ ...current, palettes: editingPalette
        ? current.palettes.map((item) => item.id === result.palette.id ? result.palette : item)
        : [...current.palettes.filter((item) => item.id !== result.palette.id), result.palette] }));
    } catch (error) {
      setSaveError(`Unable to save this color. ${error.message}`);
      return;
    } finally {
      setSaving(false);
    }
    setShowAddColor(false);
    setMessage(`“${label}” color palette ${editingPalette ? 'updated' : 'saved'} successfully.`);
  };

  return (
    <MasterLayout>
      <div className={`theme-colors-page${appliedColors ? ' theme-colors-applied' : ''}`} style={pageStyle}>
        <ModulePageHeader title='Theme Colors' />
        {settingsError && <div className='alert alert-danger' role='alert'>{settingsError}</div>}
        {savedColors.error && (
          <div className='alert alert-danger' role='alert'>
            {savedColors.error}{' '}
            <button type='button' className='btn btn-sm btn-outline-danger' disabled={loading} onClick={() => setAttempt((current) => current + 1)}>Retry</button>
          </div>
        )}
        {loading && <p role='status'>Loading saved colors...</p>}
        {message && (
          <div className='alert alert-success d-flex align-items-center justify-content-between gap-3' role='status'>
            <span>{message}</span>
            <button type='button' className='btn-close' aria-label='Dismiss confirmation' onClick={() => setMessage("")} />
          </div>
        )}
        <div className='card p-0 radius-12'>
          <div className='card-body p-24'>
            <form onSubmit={saveSettings}>
              <section aria-labelledby='theme-colors-title'>
                <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 mb-16'>
                  <h6 id='theme-colors-title' className='text-xl mb-0'>Theme Colors</h6>
                  <button
                    type='button'
                    className='btn btn-primary radius-8 ms-auto'
                    disabled={loading || busy}
                    onClick={() => openColorEditor()}
                  >
                    + Add New Color
                  </button>
                </div>
                <div className='theme-colors-grid'>
                  {[...palettes, ...savedColors.palettes].map((palette) => (
                    <div className='theme-colors-option' key={palette.id}>
                      <input
                        className='theme-colors-input'
                        type='radio'
                        name='theme-color'
                        id={`theme-color-${palette.id}`}
                        value={palette.id}
                        checked={palette.id === selectedPalette}
                        disabled={savingSettings}
                        aria-label={`${palette.label} palette`}
                        onChange={() => {
                          setSelectedPalette(palette.id);
                        }}
                      />
                      <label className='theme-colors-palette' htmlFor={`theme-color-${palette.id}`}>
                        <span className='theme-colors-swatch'>
                          <span className='theme-colors-sample' style={{ backgroundColor: palette.color }} />
                          <span>{palette.label}</span>
                        </span>
                        <span className='theme-colors-swatch'>
                          <span className='theme-colors-sample' style={{ backgroundColor: palette.focus }} />
                          <span>Focus</span>
                        </span>
                        <span className='theme-colors-swatch'>
                          <span className='theme-colors-sample' style={{ backgroundColor: palette.text || "#000000" }} />
                          <span>Text</span>
                        </span>
                      </label>
                      {savedColors.palettes.some((item) => item.id === palette.id) && (
                        <div className='d-flex justify-content-end gap-2 mt-8'>
                          <button type='button' className='btn btn-sm btn-primary radius-8' disabled={loading || busy} aria-label={`Edit ${palette.label}`} onClick={() => openColorEditor(palette)}>Edit</button>
                          <button type='button' className='btn btn-sm btn-outline-danger radius-8' disabled={loading || busy} aria-label={`Delete ${palette.label}`} onClick={() => openDeleteColor(palette)}>Delete</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
              <section className='mt-24' aria-labelledby='custom-colors-title'>
                <h6 id='custom-colors-title' className='text-xl mb-16'>Custom Colors</h6>
                <div className='theme-colors-grid'>
                  <div className='theme-colors-option'>
                    <input type='radio' name='theme-color' className='theme-colors-input' value='custom' checked={selectedPalette === 'custom'} disabled={busy} aria-label='Custom colors palette' onChange={selectCustomPalette} />
                    <div
                      className='theme-colors-palette theme-colors-custom'
                      onClick={selectCustomPalette}

                    >
                      <label className='theme-colors-swatch'>
                        <input type='color' name='custom-main' className='theme-colors-sample theme-colors-picker' value={customColors.color} disabled={savingSettings} onChange={(event) => updateCustomColor('color', event.target.value)} />
                        <span>Main</span>
                      </label>
                      <label className='theme-colors-swatch'>
                        <input type='color' name='custom-focus' className='theme-colors-sample theme-colors-picker' value={customColors.focus} disabled={savingSettings} onChange={(event) => updateCustomColor('focus', event.target.value)} />
                        <span>Focus</span>
                      </label>
                      <label className='theme-colors-swatch'>
                        <input type='color' name='custom-text' className='theme-colors-sample theme-colors-picker' value={customColors.text} disabled={savingSettings} onChange={(event) => updateCustomColor('text', event.target.value)} />
                        <span>Text</span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>
              <div className='d-flex align-items-center justify-content-center gap-3 mt-24'>
                <button type='submit' disabled={loading || busy} className='btn btn-primary border border-primary-600 text-md px-24 py-12 radius-8'>
                  {savingSettings ? 'Saving...' : 'Save Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Modal className={`theme-colors-page${appliedColors ? ' theme-colors-applied' : ''}`} style={pageStyle} show={showAddColor} onHide={closeAddColor} centered aria-labelledby='add-color-title'>
        <Modal.Header closeButton>
          <Modal.Title as='h1' className='fs-5' id='add-color-title'>{editingPalette ? 'Edit Color' : 'Add New Color'}</Modal.Title>
        </Modal.Header>
        <form key={draftId.current} onSubmit={saveColor}>
          <Modal.Body>
            {saveError && <div className='alert alert-danger' role='alert'>{saveError}</div>}
            <div className='mb-20'>
              <label className='form-label' htmlFor='new-color-name'>Color Name</label>
              <input
                id='new-color-name'
                name='color-name'
                defaultValue={editingPalette?.label || ''}
                className='form-control radius-8'
                type='text'
                placeholder='Enter color name'
                required
                maxLength={100}
                disabled={saving}
                autoFocus
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? 'color-name-error' : undefined}
                onChange={() => setNameError("")}
              />
              {nameError && <p id='color-name-error' className='text-danger-600 mt-8 mb-0' role='alert'>{nameError}</p>}
            </div>
            {[
              { name: "main", label: "Main", value: editingPalette?.color || "#487fff" },
              { name: "focus", label: "Focus", value: editingPalette?.focus || "#dbe9ff" },
              { name: "text", label: "Text", value: editingPalette?.text || "#000000" },
            ].map((field) => (
              <div className='mb-16' key={field.name}>
                <label className='form-label' htmlFor={`new-color-${field.name}`}>{field.label}</label>
                <input
                  id={`new-color-${field.name}`}
                  name={field.name}
                  type='color'
                  className='theme-colors-sample theme-colors-picker'
                  defaultValue={field.value}
                  disabled={saving}
                />
              </div>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <button type='button' className='btn btn-outline-secondary radius-8' disabled={saving} onClick={closeAddColor}>Cancel</button>
            <button type='submit' className='btn btn-primary radius-8' disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </Modal.Footer>
        </form>
      </Modal>
      <Modal className={`theme-colors-page${appliedColors ? ' theme-colors-applied' : ''}`} style={pageStyle} show={Boolean(deletePalette)} onHide={closeDeleteColor} centered aria-labelledby='delete-color-title'>
        <Modal.Header closeButton>
          <Modal.Title as='h1' className='fs-5' id='delete-color-title'>Delete Color</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <div className='alert alert-danger' role='alert'>{deleteError}</div>}
          <p className='mb-0'>Delete the “{deletePalette?.label}” color palette?</p>
        </Modal.Body>
        <Modal.Footer>
            <button type='button' className='btn btn-outline-secondary radius-8' disabled={deleting} onClick={closeDeleteColor}>Cancel</button>
          <button type='button' className='btn btn-danger radius-8' disabled={deleting} onClick={confirmDelete}>{deleting ? 'Deleting...' : 'Delete'}</button>
        </Modal.Footer>
      </Modal>
    </MasterLayout>
  );
};

export default ThemeColorsPage;
