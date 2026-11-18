import { isStrongPassword, passwordHelp } from '../helper/password';
import { useUpdateAccessUser } from '../helper/AccessContext';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import PhoneCountryCodeSelect from './PhoneCountryCodeSelect';
import phoneCountryCodes from '../data/phoneCountryCodes';

const fields = [
  ['name', 'Full Name', 'text', 255, true],
  ['email', 'Email', 'email', 255, true],
  ['username', 'Username', 'text', 50],
  ['date_of_birth', 'Date of Birth', 'date'],
  ['business_name', 'Business Name', 'text', 255],
  ['gstin', 'GSTIN', 'text', 15],
  ['address', 'Address', 'textarea', 2000],
  ['city', 'City', 'text', 100],
  ['state', 'State', 'text', 100],
  ['country', 'Country', 'text', 100],
  ['pincode', 'Pincode', 'text', 20],
];

function useImagePreview(file, saved) {
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return file ? preview || saved : saved;
}

export default function ViewProfileLayer() {
  const updateAccessUser = useUpdateAccessUser();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [tab, setTab] = useState('profile');
  const [files, setFiles] = useState({});
  const [removed, setRemoved] = useState({});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [passwords, setPasswords] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [visible, setVisible] = useState({});
  const [code, setCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [phoneChanged, setPhoneChanged] = useState(false);
  const profilePreview = useImagePreview(
    files.profile_image,
    removed.profile_image ? null : user?.profile_image_url,
  );
  const coverPreview = useImagePreview(
    files.cover_image,
    removed.cover_image ? null : user?.cover_image_url,
  );

  const populate = (next) => {
    setUser(next);
    setForm(Object.fromEntries(fields.map(([key]) => [key, next[key] || ''])));
    const country = [...phoneCountryCodes]
      .sort((a, b) => b.code.length - a.code.length)
      .find(({ code }) => next.phone?.startsWith(code));
    setCode(country?.code || '+91');
    setPhone(
      country ? next.phone.slice(country.code.length).trim() : next.phone || '',
    );
    setPhoneChanged(false);
    setFiles({});
    setRemoved({});
  };
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api('/profile', { signal: controller.signal })
      .then(({ user }) => populate(user))
      .catch((error) => {
        if (error.name !== 'AbortError')
          setError(error.message || 'Unable to load your profile.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);

  const failure = (error) => {
    setErrors(error.errors || {});
    setError(error.message || 'Unable to save changes.');
  };
  const changeTab = (next) => {
    setTab(next);
    setErrors({});
    setMessage('');
    setError('');
    setPasswords({
      current_password: '',
      password: '',
      password_confirmation: '',
    });
  };
  const upload = (key, file) => {
    setMessage('');
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setErrors((old) => ({
        ...old,
        [key]: ['Choose a JPG, PNG, or WebP image up to 2 MB.'],
      }));
      return;
    }
    setErrors((old) => ({ ...old, [key]: null }));
    setFiles((old) => ({ ...old, [key]: file }));
    setRemoved((old) => ({ ...old, [key]: false }));
  };
  const saveProfile = async (event) => {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setError('');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append(
      'phone',
      phoneChanged
        ? phone.trim()
          ? `${code} ${phone.trim()}`
          : ''
        : user.phone || '',
    );
    ['profile_image', 'cover_image'].forEach((key) => {
      if (files[key]) data.append(key, files[key]);
      if (removed[key]) data.append(`remove_${key}`, '1');
    });
    data.append('_method', 'PUT');
    setSaving(true);
    try {
      const result = await api('/profile', { method: 'POST', body: data });
      populate(result.user);
      updateAccessUser((previous) => ({ ...previous, ...result.user }));
      setMessage('Profile updated successfully.');
    } catch (error) {
      failure(error);
    } finally {
      setSaving(false);
    }
  };
  const changePassword = async (event) => {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setError('');
    const invalid = {};
    if (!isStrongPassword(passwords.password))
      invalid.password = [passwordHelp];
    if (passwords.password !== passwords.password_confirmation)
      invalid.password_confirmation = ['The new passwords do not match.'];
    if (passwords.current_password === passwords.password)
      invalid.password = [
        'The new password must be different from your current password.',
      ];
    if (Object.keys(invalid).length) {
      setErrors(invalid);
      return;
    }
    setSaving(true);
    try {
      const result = await api('/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords),
      });
      setMessage(result.message);
      setPasswords({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (error) {
      failure(error);
    } finally {
      setSaving(false);
    }
  };
  const fieldError = (key) =>
    errors[key]?.[0] ? (
      <div
        id={`error-${key}`}
        className="text-danger-600 text-sm mt-4"
        role="alert"
      >
        {errors[key][0]}
      </div>
    ) : null;
  const imageInput = (key, label) => (
    <div className="mb-20" key={key}>
      <label className="form-label fw-semibold" htmlFor={key}>
        {label}
      </label>
      <input
        id={key}
        type="file"
        className="form-control"
        accept="image/jpeg,image/png,image/webp"
        disabled={saving}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={`error-${key}`}
        onChange={(event) => {
          upload(key, event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <small className="text-secondary-light">
        JPG, PNG, or WebP. Maximum 2 MB. Changes are saved with your profile.
      </small>
      {(files[key] || (!removed[key] && user[`${key}_url`])) && (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger d-block mt-8"
          onClick={() => {
            setFiles((old) => ({ ...old, [key]: null }));
            setRemoved((old) => ({ ...old, [key]: true }));
          }}
          disabled={saving}
        >
          Remove {label.toLowerCase()}
        </button>
      )}
      {fieldError(key)}
    </div>
  );
  if (loading) return <p role="status">Loading your profile...</p>;
  if (!user)
    return (
      <div role="alert">
        {error}
        <button
          className="btn btn-primary ms-12"
          onClick={() => setAttempt((old) => old + 1)}
        >
          Try again
        </button>
      </div>
    );
  return (
    <div className="row gy-4">
      <div className="col-lg-4">
        <div className="user-grid-card border radius-16 overflow-hidden bg-base">
          {coverPreview ? (
            <img
              src={coverPreview}
              alt="Cover preview"
              style={{ width: '100%', height: 190, objectFit: 'cover' }}
            />
          ) : (
            <div
              aria-label="No cover picture"
              className="bg-primary-100"
              style={{ height: 190 }}
            />
          )}
          <div className="p-24">
            <div className="text-center border-bottom pb-20">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt={`${user.name}'s profile`}
                  className="rounded-circle object-fit-cover border border-2"
                  style={{
                    width: 128,
                    height: 128,
                    marginTop: -80,
                    position: 'relative',
                  }}
                />
              ) : (
                <div
                  className="rounded-circle bg-primary-50 text-primary-600 d-flex align-items-center justify-content-center mx-auto fw-bold"
                  style={{
                    width: 128,
                    height: 128,
                    marginTop: -80,
                    position: 'relative',
                    fontSize: 40,
                  }}
                  aria-label="Profile initials"
                >
                  {user.name?.trim().slice(0, 1).toUpperCase()}
                </div>
              )}
              <h6 className="mt-16 mb-4 text-break">{user.name}</h6>
              <p className="text-secondary-light text-break mb-8">
                {user.email}
              </p>
              <span className="badge bg-primary-50 text-primary-600 text-capitalize">
                {user.role?.replaceAll('_', ' ')}
              </span>
            </div>
            <h6 className="text-lg mt-24 mb-20">Personal Info</h6>
            <dl className="mb-0">
              {[
                ['Full Name', user.name],
                ['Business Name', user.business_name],
                ['GSTIN', user.gstin],
                ['Email', user.email],
                ['Phone Number', user.phone],
                [
                  'Date of Birth',
                  user.date_of_birth?.replace(
                    /^(\d{4})-(\d{2})-(\d{2})$/,
                    '$3/$2/$1',
                  ),
                ],
                ['Address', user.address],
                ['City', user.city],
                ['State', user.state],
                ['Country', user.country],
                ['Pin', user.pincode],
                [
                  'Role',
                  user.role
                    ?.replaceAll('_', ' ')
                    .replace(/\b\w/g, (letter) => letter.toUpperCase()),
                ],
                ['User ID', user.user_code],
              ].map(([label, value]) => (
                <div
                  className="d-grid mb-16 align-items-start gap-2"
                  style={{
                    gridTemplateColumns: 'minmax(112px, 30%) minmax(0, 1fr)',
                  }}
                  key={label}
                >
                  <dt className="text-md fw-semibold">{label}</dt>
                  <dd
                    className="d-flex text-secondary-light fw-medium mb-0"
                    style={{ minWidth: 0 }}
                  >
                    <span className="me-4" aria-hidden="true">
                      :
                    </span>
                    <span
                      style={{
                        overflowWrap: 'anywhere',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {value || '—'}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <div className="col-lg-8">
        <div className="card">
          <div className="card-body p-24">
            <div
              className="nav border-gradient-tab nav-pills mb-24"
              role="tablist"
              aria-label="Profile settings"
            >
              {[
                ['profile', 'Edit Profile'],
                ['password', 'Change Password'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  id={`tab-${key}`}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  aria-controls={`panel-${key}`}
                  disabled={saving}
                  className={`nav-link px-24 ${tab === key ? 'active' : ''}`}
                  onClick={() => changeTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            {message && (
              <div className="alert alert-success" role="status">
                {message}
              </div>
            )}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            {tab === 'profile' ? (
              <form
                id="panel-profile"
                role="tabpanel"
                aria-labelledby="tab-profile"
                onSubmit={saveProfile}
              >
                <fieldset disabled={saving}>
                  <div className="row">
                    <div className="col-sm-6">
                      {imageInput('profile_image', 'Profile Picture')}
                    </div>
                    <div className="col-sm-6">
                      {imageInput('cover_image', 'Cover Picture')}
                    </div>
                  </div>
                  <div className="row">
                    {[
                      fields[0],
                      ['user_code', 'User ID', 'text'],
                      fields[1],
                      ['phone', 'Phone Number', 'tel'],
                      ...fields.slice(2),
                    ].map(([key, label, type, max, required]) => (
                      <div
                        className={
                          key === 'address' ? 'col-12 mb-20' : 'col-sm-6 mb-20'
                        }
                        key={key}
                      >
                        <label
                          htmlFor={`profile-${key}`}
                          className="form-label fw-semibold"
                        >
                          {label}
                          {required && (
                            <span className="text-danger-600"> *</span>
                          )}
                        </label>
                        {key === 'user_code' ? (
                          <input
                            id="profile-user_code"
                            className="form-control"
                            value={user.user_code || ''}
                            readOnly
                          />
                        ) : key === 'phone' ? (
                          <div className="d-flex gap-2">
                            <PhoneCountryCodeSelect
                              id="profile-phone-code"
                              value={code}
                              onChange={(value) => {
                                setCode(value);
                                setPhoneChanged(true);
                              }}
                              invalid={Boolean(errors.phone)}
                            />
                            <input
                              id="profile-phone"
                              type="tel"
                              maxLength={30}
                              value={phone}
                              onChange={(e) => {
                                setPhone(e.target.value);
                                setPhoneChanged(true);
                              }}
                              className="form-control"
                              aria-invalid={Boolean(errors.phone)}
                              aria-describedby="error-phone"
                            />
                          </div>
                        ) : type === 'textarea' ? (
                          <textarea
                            id={`profile-${key}`}
                            className={`form-control ${errors[key] ? 'is-invalid' : ''}`}
                            rows={3}
                            maxLength={max}
                            value={form[key]}
                            onChange={(e) =>
                              setForm({ ...form, [key]: e.target.value })
                            }
                            aria-invalid={Boolean(errors[key])}
                            aria-describedby={`error-${key}`}
                          />
                        ) : (
                          <input
                            id={`profile-${key}`}
                            className={`form-control ${errors[key] ? 'is-invalid' : ''}`}
                            type={type}
                            maxLength={max}
                            required={required}
                            max={
                              type === 'date'
                                ? new Date().toLocaleDateString('en-CA')
                                : undefined
                            }
                            autoComplete={
                              key === 'email'
                                ? 'email'
                                : key === 'username'
                                  ? 'username'
                                  : undefined
                            }
                            value={form[key]}
                            onChange={(e) =>
                              setForm({ ...form, [key]: e.target.value })
                            }
                            aria-invalid={Boolean(errors[key])}
                            aria-describedby={`error-${key}`}
                          />
                        )}
                        {fieldError(key)}
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-primary" type="submit">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </fieldset>
              </form>
            ) : (
              <form
                id="panel-password"
                role="tabpanel"
                aria-labelledby="tab-password"
                onSubmit={changePassword}
              >
                <p className="text-secondary-light">
                  {passwordHelp} After changing your password, your other
                  sessions will be signed out.
                </p>
                <fieldset disabled={saving}>
                  {[
                    ['current_password', 'Current Password'],
                    ['password', 'New Password'],
                    ['password_confirmation', 'Confirm New Password'],
                  ].map(([key, label]) => (
                    <div className="mb-20" key={key}>
                      <label htmlFor={key} className="form-label fw-semibold">
                        {label} <span className="text-danger-600">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          id={key}
                          type={visible[key] ? 'text' : 'password'}
                          required
                          maxLength={128}
                          value={passwords[key]}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              [key]: e.target.value,
                            })
                          }
                          autoComplete={
                            key === 'current_password'
                              ? 'current-password'
                              : 'new-password'
                          }
                          className={`form-control ${errors[key] ? 'is-invalid' : ''}`}
                          aria-invalid={Boolean(errors[key])}
                          aria-describedby={`error-${key}`}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          aria-label={`${visible[key] ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
                          onClick={() =>
                            setVisible({ ...visible, [key]: !visible[key] })
                          }
                        >
                          {visible[key] ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {fieldError(key)}
                    </div>
                  ))}
                  <button type="submit" className="btn btn-primary">
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </fieldset>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
