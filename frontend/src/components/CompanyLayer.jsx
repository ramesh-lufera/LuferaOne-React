import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import PhoneCountryCodeSelect from './PhoneCountryCodeSelect';

const details = [
  ['full_name', 'Full Name', 'text', 255], ['email', 'Email', 'email', 255],
  ['phone_number', 'Phone Number', 'tel', 30], ['website', 'Website', 'text', 2048],
];
const address = [
  ['country', 'Country', 'text', 100], ['city', 'City', 'text', 100],
  ['state', 'State', 'text', 100], ['zip_code', 'Zip Code', 'text', 20],
  ['address', 'Address', 'text', 2000], ['gstin', 'GSTIN', 'text', 15],
];
const imageFields = [['logo', 'Company Logo'], ['site_logo', 'Site Logo'], ['sign_in_image', 'Sign In Image'], ['sign_up_image', 'Sign Up Image']];
const initialValues = Object.fromEntries([...details, ...address].map(([key]) => [key, '']));
initialValues.phone_country_code = '+91';
const steps = ['Company Details', 'Address & GSTIN', 'Images'];
const stepFor = (field) => details.some(([key]) => key === field) || field === 'phone_country_code' ? 1 : address.some(([key]) => key === field) ? 2 : 3;

export default function CompanyLayer() {
  const [values, setValues] = useState(initialValues);
  const [company, setCompany] = useState(null);
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});
  const [removed, setRemoved] = useState({});
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [loadError, setLoadError] = useState(false);
  const fileInputs = useRef({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [retry, setRetry] = useState(0);
  const [fileKey, setFileKey] = useState(0);
  const savingRef = useRef(false);
  const loadValues = (record) => {
    setCompany(record);
    setValues(record ? { ...initialValues, ...Object.fromEntries(Object.keys(initialValues).map((key) => [key, record[key] ?? ''])) } : { ...initialValues });
  };
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setLoadError(false);
    api('/company', { signal: controller.signal }).then(({ company: record }) => loadValues(record)).catch((err) => {
      if (err.name !== 'AbortError') { setError(err.message); setLoadError(true); }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    const urls = Object.fromEntries(Object.entries(files).filter(([, file]) => file).map(([key, file]) => [key, URL.createObjectURL(file)]));
    setPreviews(urls);
    return () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const validate = (all = false) => {
    const next = {};
    [...details, ...address].forEach(([key, label]) => {
      if ((all || stepFor(key) === step) && key !== 'website' && !values[key].trim()) next[key] = `${label} is required.`;
    });
    if (all || step === 1) {
      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Enter a valid email address.';
      if (!/^\+[1-9][0-9]{0,3}$/.test(values.phone_country_code)) next.phone_country_code = 'Enter a dial code such as +91.';
      if (values.phone_number && (!/^[0-9 ()-]{7,30}$/.test(values.phone_number) || values.phone_number.replace(/\D/g, '').length < 7 || values.phone_number.replace(/\D/g, '').length > 15)) next.phone_number = 'Enter a valid phone number.';
      if (values.website) {
        try { const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(values.website) ? values.website : `https://${values.website}`); if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) throw new Error(); }
        catch { next.website = 'Enter a valid website, such as www.example.com.'; }
      }
    }
    if (all || step === 2) {
      if (values.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(values.gstin.toUpperCase())) next.gstin = 'Enter a valid 15-character GSTIN.';
      if (values.zip_code && !/^[a-zA-Z0-9 -]+$/.test(values.zip_code)) next.zip_code = 'Enter a valid ZIP or postal code.';
    }
    Object.entries(files).forEach(([key, file]) => {
      if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024)) next[key] = 'Choose a JPG, PNG, or WebP image up to 2 MB.';
    });
    setErrors(next);
    return next;
  };
  const nextStep = (event) => { event?.preventDefault(); if (!Object.keys(validate()).length) setStep((current) => Math.min(current + 1, 3)); };
  const submit = async (event) => {
    event.preventDefault();
    if (step < 3) { nextStep(); return; }
    if (savingRef.current) return;
    const validation = validate(true);
    if (Object.keys(validation).length) { setStep(stepFor(Object.keys(validation)[0])); return; }
    savingRef.current = true; setSaving(true); setError(''); setSuccess('');
    const body = new FormData();
    Object.entries(values).forEach(([key, value]) => body.append(key, value.trim()));
    Object.entries(files).forEach(([key, file]) => { if (file) body.append(key, file); });
    Object.entries(removed).forEach(([key, value]) => { if (value) body.append(`remove_${key}`, '1'); });
    if (company) body.append('_method', 'PUT');
    try {
      const result = await api('/company', { method: 'POST', body });
      loadValues(result.company); setFiles({}); setRemoved({}); setFileKey((key) => key + 1);
      window.dispatchEvent(new Event('company-branding-updated'));
      setSuccess(result.message); setStep(1);
    } catch (err) {
      setError(err.message);
      if (err.errors) {
        const fieldErrors = Object.fromEntries(Object.entries(err.errors).map(([key, messages]) => [key, messages[0]]));
        setErrors(fieldErrors); setStep(stepFor(Object.keys(fieldErrors)[0]));
      }
    } finally { setSaving(false); savingRef.current = false; }
  };
  const update = (key, value) => { setValues((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: '' })); setSuccess(''); };
  const field = ([key, label, type, maxLength]) => <div className='col-sm-6' key={key}>
    <label htmlFor={`company-${key}`} className='form-label'>{label}{key !== 'website' && <span className='text-danger-600'> *</span>}</label>
    {key === 'phone_number' ? <div className='input-group'>
      <PhoneCountryCodeSelect id='company-phone-country-code' value={values.phone_country_code} onChange={(code) => update('phone_country_code', code)} invalid={Boolean(errors.phone_country_code)} />
      <input id={`company-${key}`} type={type} className='form-control wizard-required' value={values[key]} maxLength={maxLength} onChange={(e) => update(key, e.target.value)} aria-invalid={Boolean(errors[key])} />
    </div> : <input id={`company-${key}`} type={type} className='form-control wizard-required' value={values[key]} maxLength={maxLength} required={key !== 'website'}
      onChange={(e) => update(key, key === 'gstin' ? e.target.value.toUpperCase() : e.target.value)} aria-invalid={Boolean(errors[key])} />}
    {(errors[key] || (key === 'phone_number' && errors.phone_country_code)) && <div className='text-danger-600 text-sm mt-8' role='alert'>{errors[key] || errors.phone_country_code}</div>}
  </div>;

  if (loading) return <div className='card'><div className='card-body' role='status'>Loading company profile…</div></div>;
  if (loadError) return <div className='alert alert-danger' role='alert'>{error} <button className='btn btn-outline-danger' onClick={() => setRetry((n) => n + 1)}>Retry</button></div>;
  return <div className='card'><div className='card-body'>
    <h6 className='mb-4 text-xl'>Company</h6>
    <p className='text-neutral-500'>Complete your company profile in the steps below.</p>
    {error && <div className='alert alert-danger' role='alert'>{error} <button type='button' className='btn btn-sm btn-outline-danger' disabled={saving} onClick={() => setRetry((n) => n + 1)}>Reload company</button></div>}
    {success && <div className='alert alert-success' role='status'>{success}</div>}
    <div className='form-wizard'>
      <form noValidate onSubmit={submit} aria-label='Company profile'>
        <div className='form-wizard-header overflow-x-auto scroll-sm pb-8 my-32'>
          <ul className='list-unstyled form-wizard-list'>
            {steps.map((label, index) => <li key={label} className={`form-wizard-list__item flex-fill text-center ${step > index + 1 ? 'activated' : ''} ${step === index + 1 ? 'active' : ''}`} aria-current={step === index + 1 ? 'step' : undefined}>
              <div className='form-wizard-list__line'><span className='count'>{index + 1}</span></div>
              <span className='text text-sm'>{label}</span>
            </li>)}
          </ul>
        </div>
        <fieldset className='wizard-fieldset show' disabled={saving}>
          <h6 className='text-md text-neutral-500'>{steps[step - 1]}</h6>
          <div className='row gy-3'>
            {step === 1 && details.map(field)}
            {step === 2 && address.map(field)}
            {step === 3 && imageFields.map(([key, label]) => {
              const preview = previews[key] || (!removed[key] && company?.[`${key}_url`]);
              return <div className='col-sm-6' key={key}>
                <label className='form-label' htmlFor={`company-${key}`}>{label}</label>
                <input key={`${key}-${fileKey}`} id={`company-${key}`} ref={(element) => { fileInputs.current[key] = element; }} type='file' className='form-control' accept='image/jpeg,image/png,image/webp'
                  onChange={(e) => { const file = e.target.files[0]; setFiles((current) => ({ ...current, [key]: file })); if (file) setRemoved((current) => ({ ...current, [key]: false })); }} />
                <p className='text-secondary-light text-sm mt-8'>JPG, PNG, or WebP. Maximum 2 MB.{key === 'site_logo' && ' Used as the browser favicon. A square PNG is recommended.'}</p>
                {preview && <div className='d-flex align-items-center gap-3 mt-8'><img src={preview} alt={`${label} preview`} className='radius-8' style={{ maxWidth: 180, maxHeight: 140, objectFit: 'contain' }} />
                  <button type='button' className='btn btn-sm btn-outline-danger' onClick={() => { setFiles((current) => ({ ...current, [key]: null })); setRemoved((current) => ({ ...current, [key]: true })); if (fileInputs.current[key]) fileInputs.current[key].value = ''; }}>Remove {label.toLowerCase()}</button></div>}
                {errors[key] && <div className='text-danger-600 text-sm mt-8' role='alert'>{errors[key]}</div>}
              </div>;
            })}
            <div className='form-group d-flex flex-wrap align-items-center justify-content-end gap-8 mt-24'>
              {step > 1 && <button type='button' className='form-wizard-previous-btn btn btn-neutral-500 border-neutral-100 px-32' data-theme-exempt onClick={() => setStep((current) => current - 1)}>Back</button>}
              {step < 3 ? <button key='next-step' type='button' className='form-wizard-next-btn btn btn-primary-600 px-32' onClick={nextStep}>Next</button> :
                <button key='save-company' type='submit' className='form-wizard-submit btn btn-primary-600 px-32'>{saving ? 'Saving…' : 'Save Change'}</button>}
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  </div></div>;
}
