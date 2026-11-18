import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

export default function InvoiceSettingsLayer() {
  const [settings, setSettings] = useState(null);
  const [values, setValues] = useState({ prefix: '', series: '', suffix: '' });
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [removed, setRemoved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [attempt, setAttempt] = useState(0);
  const fileInput = useRef(null);
  const savingRef = useRef(false);
  const apply = (record) => {
    setSettings(record);
    setValues({
      prefix: record.prefix,
      series: record.series,
      suffix: record.suffix,
    });
    setFile(null);
    setRemoved(false);
    setErrors({});
    if (fileInput.current) fileInput.current.value = '';
  };
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setNotice('');
    api('/invoice-settings', { signal: controller.signal })
      .then(({ settings }) => {
        if (!controller.signal.aborted) apply(settings);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    if (!file) {
      setFileUrl('');
      return;
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const chooseLogo = (event) => {
    const image = event.target.files?.[0];
    if (!image) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(image.type) ||
      image.size > 2 * 1024 * 1024
    ) {
      setErrors((current) => ({
        ...current,
        logo: 'Choose a JPG, PNG or WebP image up to 2 MB.',
      }));
      event.target.value = '';
      return;
    }
    setFile(image);
    setRemoved(false);
    setErrors((current) => ({ ...current, logo: undefined }));
    setNotice('');
  };
  const save = async (event) => {
    event.preventDefault();
    if (savingRef.current || errors.logo) return;
    if (!/^(?=.*[1-9])[0-9]{1,12}$/.test(values.series)) {
      setErrors({
        series: 'Enter a positive series of up to 12 digits, such as 0001.',
      });
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setError('');
    setNotice('');
    setErrors({});
    const body = new FormData();
    Object.entries(values).forEach(([key, value]) => body.append(key, value));
    body.append('version', settings.version);
    body.append('_method', 'PUT');
    if (file) body.append('logo', file);
    if (removed) body.append('remove_logo', '1');
    try {
      const data = await api('/invoice-settings', { method: 'POST', body });
      apply(data.settings);
      setNotice(data.message);
    } catch (error) {
      setError(error.message);
      setErrors(
        Object.fromEntries(
          Object.entries(error.errors || {}).map(([key, messages]) => [
            key,
            messages[0],
          ]),
        ),
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="card">
        <div className="card-body p-24" role="status">
          Loading invoice settings...
        </div>
      </div>
    );
  const logoUrl = fileUrl || (!removed ? settings?.logo_url : null);
  return (
    <div className="card radius-12">
      <div className="card-body p-24">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}{' '}
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              disabled={saving}
              onClick={() => setAttempt(attempt + 1)}
            >
              Reload saved settings
            </button>
          </div>
        )}
        {notice && (
          <div className="alert alert-success" role="status">
            {notice}
          </div>
        )}
        {settings && (
          <form noValidate onSubmit={save} aria-label="Invoice settings">
            <fieldset disabled={saving}>
              <div className="row gy-4">
                {[
                  ['prefix', 'Prefix', 'INV-'],
                  ['series', 'Series', '0001'],
                  ['suffix', 'Suffix', '-2026'],
                ].map(([key, label, placeholder]) => (
                  <div className="col-md-4" key={key}>
                    <label
                      className="form-label"
                      htmlFor={`invoice-setting-${key}`}
                    >
                      {label}
                    </label>
                    <input
                      id={`invoice-setting-${key}`}
                      className="form-control radius-8"
                      type="text"
                      inputMode={key === 'series' ? 'numeric' : undefined}
                      maxLength={key === 'series' ? 12 : 30}
                      value={values[key]}
                      placeholder={placeholder}
                      required={key === 'series'}
                      aria-invalid={Boolean(errors[key])}
                      onChange={(event) => {
                        setValues({ ...values, [key]: event.target.value });
                        setErrors({ ...errors, [key]: undefined });
                        setNotice('');
                      }}
                    />
                    {errors[key] && (
                      <div
                        className="text-danger-600 text-sm mt-8"
                        role="alert"
                      >
                        {errors[key]}
                      </div>
                    )}
                  </div>
                ))}
                <div className="col-12">
                  <p className="text-sm text-secondary-light mb-8">
                    Series is the next sequential number. Leading zeros are
                    preserved and previously used invoice numbers are skipped.
                  </p>
                  <div className="border radius-8 p-16">
                    <span className="text-secondary-light">
                      Invoice number preview
                    </span>
                    <output
                      className="d-block fw-semibold text-lg text-break"
                      aria-live="polite"
                    >
                      {values.prefix}
                      {values.series}
                      {values.suffix}
                    </output>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="invoice-setting-logo">
                    Invoice Logo
                  </label>
                  {logoUrl && (
                    <div className="mb-16">
                      <img
                        src={logoUrl}
                        alt="Invoice logo preview"
                        className="border radius-8 p-12"
                        style={{
                          maxWidth: 220,
                          maxHeight: 120,
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  )}
                  <input
                    ref={fileInput}
                    id="invoice-setting-logo"
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={chooseLogo}
                    aria-describedby="invoice-logo-help"
                  />
                  <div
                    className="text-sm text-secondary-light mt-8"
                    id="invoice-logo-help"
                  >
                    JPG, PNG or WebP, up to 2 MB.
                  </div>
                  {errors.logo && (
                    <div role="alert" className="text-danger-600 mt-8">
                      {errors.logo}
                    </div>
                  )}
                  {(logoUrl || errors.logo) && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger mt-12"
                      onClick={() => {
                        setFile(null);
                        setRemoved(true);
                        fileInput.current.value = '';
                        setErrors({ ...errors, logo: undefined });
                      }}
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
                <div className="col-12 d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary px-32 radius-8"
                  >
                    {saving ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        )}
      </div>
    </div>
  );
}
