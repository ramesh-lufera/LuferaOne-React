import { isStrongPassword } from '../helper/password';
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import PhoneCountryCodeSelect from './PhoneCountryCodeSelect';
import phoneCountryCodes from '../data/phoneCountryCodes';

const personalFields = [
  ['name', 'Full Name', 'text', 255, true],
  ['email', 'Email', 'email', 255, true],
  ['phone', 'Phone Number', 'tel', 30],
  ['date_of_birth', 'Date of Birth', 'date'],
];
const businessFields = [
  ['business_name', 'Business Name', 'text', 255],
  ['gstin', 'GSTIN', 'text', 15],
  ['address', 'Address', 'textarea', 2000],
  ['city', 'City', 'text', 100],
  ['state', 'State', 'text', 100],
  ['country', 'Country', 'text', 100],
  ['pincode', 'Pincode', 'text', 20],
];
const accountFields = [
  ['username', 'Username', 'text', 50, true],
  ['password', 'Password', 'password', 128, true],
];
const fieldGroups = [personalFields, businessFields, accountFields];
const fields = fieldGroups.flat();
const initialValues = {
  ...Object.fromEntries(fields.map(([key]) => [key, ''])),
  phone_country_code: '+91',
};
const steps = ['Personal Details', 'Business & Address', 'Account'];
const stepFor = (key) =>
  ['profile_image', 'phone_country_code'].includes(key)
    ? 1
    : fieldGroups.findIndex((group) => group.some(([field]) => field === key)) +
      1;
const autoComplete = {
  name: 'name',
  email: 'email',
  phone: 'tel-national',
  date_of_birth: 'bday',
  business_name: 'organization',
  address: 'street-address',
  city: 'address-level2',
  state: 'address-level1',
  country: 'country-name',
  pincode: 'postal-code',
  username: 'username',
  password: 'new-password',
};

const passwordError =
  'Password must contain at least 12 characters, uppercase and lowercase letters, a number, and a symbol.';

function generatePassword() {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@';
  const randomBytes = new Uint8Array(20);
  let password;
  do {
    globalThis.crypto.getRandomValues(randomBytes);
    password = Array.from(
      randomBytes,
      (value) => alphabet[value % alphabet.length],
    ).join('');
  } while (!isStrongPassword(password));
  return password;
}

export default function AddUserLayer({ userId, onSaved, onSavingChange } = {}) {
  const isEditing = Boolean(userId);
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [existingImage, setExistingImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const originalPhone = useRef(null);
  const [values, setValues] = useState(initialValues);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const usernameEdited = useRef(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const savingRef = useRef(false);
  const imageInput = useRef(null);
  const today = new Date();
  const maxBirthDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    api(`/users/${userId}`, { signal: controller.signal })
      .then(({ user }) => {
        if (controller.signal.aborted) return;
        const phone = user.phone || '';
        const prefix = phoneCountryCodes
          .filter(({ code }) => phone.startsWith(code))
          .sort((a, b) => b.code.length - a.code.length)[0]?.code;
        const phoneInput = prefix ? phone.slice(prefix.length).trim() : phone;
        const countryCode = prefix || '+91';
        originalPhone.current = { value: phone, phoneInput, countryCode };
        setValues({
          ...initialValues,
          ...Object.fromEntries(
            fields.map(([key]) => [
              key,
              key === 'password' ? '' : (user[key] ?? ''),
            ]),
          ),
          phone: phoneInput,
          phone_country_code: countryCode,
        });
        setUserCode(user.user_code || '');
        usernameEdited.current = true;
        setExistingImage(user.profile_image_url);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [userId, loadAttempt]);
  const phoneUnchanged =
    isEditing &&
    originalPhone.current &&
    values.phone === originalPhone.current.phoneInput &&
    values.phone_country_code === originalPhone.current.countryCode;

  useEffect(() => {
    if (!image) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const update = (key, value) => {
    if (key === 'username') usernameEdited.current = Boolean(value);
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === 'email' && !usernameEdited.current
        ? { username: value.trim().split('@')[0].toLowerCase() }
        : {}),
    }));
    setErrors((current) => ({
      ...current,
      [key]: undefined,
      ...(key === 'email' && !usernameEdited.current
        ? { username: undefined }
        : {}),
    }));
  };
  const validate = (all = false) => {
    const next = {};
    for (const [key, label, , , required] of fields) {
      if (
        (all || stepFor(key) === step) &&
        required &&
        !(isEditing && ['username', 'password'].includes(key)) &&
        !values[key].trim()
      )
        next[key] = `${label} is required.`;
    }
    if (all || step === 1) {
      if (
        values.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
      )
        next.email = 'Enter a valid email address.';
      if (values.phone.trim() && !phoneUnchanged) {
        if (!/^\+[1-9][0-9]{0,3}$/.test(values.phone_country_code))
          next.phone_country_code = 'Select a valid country code.';
        const phoneDigits = values.phone.replace(/\D/g, '');
        const fullDigits =
          values.phone_country_code.replace(/\D/g, '') + phoneDigits;
        if (
          !/^[0-9 ()-]{7,30}$/.test(values.phone.trim()) ||
          phoneDigits.length < 7 ||
          fullDigits.length > 15
        )
          next.phone =
            'Enter a valid phone number without the country code (up to 15 digits including the code).';
      }
      if (values.date_of_birth && values.date_of_birth > maxBirthDate)
        next.date_of_birth = 'Date of Birth cannot be in the future.';
    }
    if (all || step === 2) {
      if (
        values.gstin.trim() &&
        !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
          values.gstin.trim(),
        )
      )
        next.gstin = 'Enter a valid 15-character GSTIN.';
      if (
        values.pincode.trim() &&
        !/^[a-zA-Z0-9 -]+$/.test(values.pincode.trim())
      )
        next.pincode = 'Enter a valid postal code.';
    }
    if (all || step === 3) {
      if (
        values.username &&
        !/^[a-zA-Z0-9_.-]{3,50}$/.test(values.username.trim())
      )
        next.username =
          'Use 3 to 50 letters, numbers, periods, underscores or hyphens.';
      if (values.password && !isStrongPassword(values.password))
        next.password = passwordError;
    }
    return next;
  };
  const submit = async (event) => {
    event.preventDefault();
    if (savingRef.current) return;
    const nextErrors = validate(step === 3);
    setErrors(nextErrors);
    setError('');
    if (Object.keys(nextErrors).length) {
      setStep(stepFor(Object.keys(nextErrors)[0]) || 1);
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    onSavingChange?.(true);
    const body = new FormData();
    const phone = phoneUnchanged
      ? originalPhone.current.value
      : values.phone.trim()
        ? `${values.phone_country_code}${values.phone.replace(/\D/g, '')}`
        : '';
    for (const [key, value] of Object.entries(values)) {
      if (
        key === 'phone_country_code' ||
        (isEditing && key === 'password' && !value)
      )
        continue;
      body.append(
        key,
        key === 'password' ? value : key === 'phone' ? phone : value.trim(),
      );
    }
    if (image) body.append('profile_image', image);
    if (removeImage) body.append('remove_profile_image', '1');
    if (isEditing) body.append('_method', 'PUT');
    try {
      const data = await api(isEditing ? `/users/${userId}` : '/users', {
        method: 'POST',
        body,
      });
      if (onSaved) {
        onSaved(data);
        return;
      }
      setCreatedUser(data.user);
      setValues(initialValues);
      usernameEdited.current = false;
      setShowPassword(false);
      setImage(null);
    } catch (error) {
      const fieldErrors = Object.fromEntries(
        Object.entries(error.errors || {}).map(([key, messages]) => [
          key,
          messages[0],
        ]),
      );
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length)
        setStep(stepFor(Object.keys(fieldErrors)[0]) || 1);
      setError(error.message);
    } finally {
      savingRef.current = false;
      setSaving(false);
      onSavingChange?.(false);
    }
  };
  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setErrors((current) => ({
        ...current,
        profile_image: 'Choose a JPG, PNG or WebP image up to 2 MB.',
      }));
      event.target.value = '';
      return;
    }
    setImage(file);
    setRemoveImage(false);
    setErrors((current) => ({ ...current, profile_image: undefined }));
  };
  const field = ([key, label, type, maxLength, required]) => {
    const fieldRequired =
      Boolean(required) &&
      !(isEditing && ['username', 'password'].includes(key));
    const inputProps = {
      id: `new-user-${key}`,
      className: 'form-control wizard-required',
      value: values[key],
      maxLength,
      required: fieldRequired,
      autoComplete: autoComplete[key],
      'aria-invalid': Boolean(errors[key]),
      'aria-describedby':
        [
          key === 'password' ? 'new-user-password-help' : '',
          errors[key] ? `new-user-${key}-error` : '',
        ]
          .filter(Boolean)
          .join(' ') || undefined,
      onChange: (event) =>
        update(
          key,
          key === 'gstin'
            ? event.target.value.toUpperCase()
            : event.target.value,
        ),
    };
    return (
      <div key={key} className={type === 'textarea' ? 'col-12' : 'col-sm-6'}>
        <label htmlFor={inputProps.id} className="form-label">
          {label}
          {fieldRequired && <span className="text-danger-600"> *</span>}
        </label>
        {key === 'phone' ? (
          <>
            <div className="input-group">
              <PhoneCountryCodeSelect
                id="new-user-phone-country-code"
                value={values.phone_country_code}
                onChange={(code) => update('phone_country_code', code)}
                invalid={Boolean(errors.phone_country_code)}
              />
              <input {...inputProps} type="tel" placeholder="Phone number" />
            </div>
            {errors.phone_country_code && (
              <div className="text-danger-600 text-sm mt-8" role="alert">
                {errors.phone_country_code}
              </div>
            )}
          </>
        ) : type === 'textarea' ? (
          <textarea {...inputProps} rows={3} />
        ) : (
          <input
            {...inputProps}
            type={key === 'password' && showPassword ? 'text' : type}
            max={type === 'date' ? maxBirthDate : undefined}
            minLength={key === 'password' ? 12 : undefined}
          />
        )}
        {key === 'password' && (
          <>
            <div
              id="new-user-password-help"
              className="text-sm text-secondary-light mt-8"
            >
              {isEditing && 'Leave blank to keep the current password. '}
              Use at least 12 characters with uppercase and lowercase letters, a
              number, and a symbol.
            </div>
            <div className="d-flex flex-wrap gap-2 mt-8">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => {
                  try {
                    update('password', generatePassword());
                    setShowPassword(true);
                  } catch {
                    setErrors((current) => ({
                      ...current,
                      password:
                        'Password generation is unavailable. Enter a strong password manually.',
                    }));
                  }
                }}
              >
                Generate Password
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                aria-controls="new-user-password"
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>
          </>
        )}
        {errors[key] && (
          <div
            id={`new-user-${key}-error`}
            className="text-danger-600 text-sm mt-8"
            role="alert"
          >
            {errors[key]}
          </div>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <p className="p-24" role="status">
        Loading user...
      </p>
    );
  if (loadError)
    return (
      <div className="alert alert-danger" role="alert">
        {loadError}{' '}
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => setLoadAttempt(loadAttempt + 1)}
        >
          Try again
        </button>
      </div>
    );
  const displayedImage = preview || (!removeImage ? existingImage : null);

  if (createdUser)
    return (
      <div className="card">
        <div className="card-body p-24">
          <div className="alert alert-success" role="status">
            User {createdUser.name} created successfully. User ID:{' '}
            {createdUser.user_code}
          </div>
          <Link className="btn btn-primary" to="/users-list">
            View Users
          </Link>
        </div>
      </div>
    );

  return (
    <div className="card">
      <div className="card-body p-24">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="form-wizard">
          {isEditing && (
            <div className="mb-20">
              <label
                htmlFor="edit-user-code"
                className="form-label fw-semibold"
              >
                User ID
              </label>
              <input
                id="edit-user-code"
                className="form-control"
                value={userCode}
                readOnly
              />
            </div>
          )}
          <form
            noValidate
            onSubmit={submit}
            aria-label={isEditing ? 'Edit user' : 'Add user'}
          >
            <div className="form-wizard-header overflow-x-auto scroll-sm pb-8 my-32">
              <ul className="list-unstyled form-wizard-list">
                {steps.map((label, index) => (
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
            <fieldset className="wizard-fieldset show" disabled={saving}>
              <div className="row gy-3">
                {step === 1 && (
                  <div className="col-12">
                    <label htmlFor="new-user-image" className="form-label">
                      Profile Image
                    </label>
                    {displayedImage && (
                      <div className="mb-16">
                        <img
                          src={displayedImage}
                          alt="Profile preview"
                          className="rounded-circle object-fit-cover"
                          width={100}
                          height={100}
                        />
                      </div>
                    )}
                    <input
                      id="new-user-image"
                      ref={imageInput}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="form-control"
                      onChange={chooseImage}
                      aria-describedby="new-user-image-help"
                    />
                    <div
                      id="new-user-image-help"
                      className="text-sm text-secondary-light mt-8"
                    >
                      JPG, PNG or WebP, up to 2 MB.
                    </div>
                    {displayedImage && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger mt-8"
                        onClick={() => {
                          setImage(null);
                          setRemoveImage(true);
                          imageInput.current.value = '';
                        }}
                      >
                        Remove Image
                      </button>
                    )}
                    {errors.profile_image && (
                      <div
                        className="text-danger-600 text-sm mt-8"
                        role="alert"
                      >
                        {errors.profile_image}
                      </div>
                    )}
                  </div>
                )}
                {fieldGroups[step - 1].map(field)}
                <div className="col-12 d-flex flex-wrap align-items-center justify-content-end gap-3 mt-24">
                  {step > 1 && (
                    <button
                      type="button"
                      className="form-wizard-previous-btn btn btn-neutral-500 border-neutral-100 px-32"
                      data-theme-exempt
                      onClick={() => setStep(step - 1)}
                    >
                      Back
                    </button>
                  )}
                  <button
                    key={step}
                    type="submit"
                    className={`${step < 3 ? 'form-wizard-next-btn' : 'form-wizard-submit'} btn btn-primary-600 px-32`}
                  >
                    {saving
                      ? 'Saving...'
                      : step < 3
                        ? 'Next'
                        : isEditing
                          ? 'Update User'
                          : 'Save User'}
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}
