/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { api } from '../services/api';

const fields = [
  ['user_code', 'User ID'],
  ['name', 'Full Name'],
  ['email', 'Email'],
  ['username', 'Username'],
  ['phone', 'Phone'],
  ['role', 'Role'],
  ['date_of_birth', 'Date of Birth'],
  ['business_name', 'Business Name'],
  ['gstin', 'GSTIN'],
  ['address', 'Address'],
  ['city', 'City'],
  ['state', 'State'],
  ['country', 'Country'],
  ['pincode', 'Pincode'],
  ['created_at', 'Join Date'],
];

export default function UserDetailsLayer({ userId }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setUser(null);
    setError('');
    api(`/users/${userId}`, { signal: controller.signal })
      .then(({ user }) => {
        if (!controller.signal.aborted) setUser(user);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, [userId, attempt]);
  if (error)
    return (
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
    );
  if (!user) return <p role="status">Loading user details...</p>;
  return (
    <>
      {user.profile_image_url && (
        <img
          src={user.profile_image_url}
          alt={`${user.name} profile`}
          width={100}
          height={100}
          className="rounded-circle object-fit-cover mb-24"
        />
      )}
      <dl className="row gy-3 mb-0">
        {fields.map(([key, label]) => (
          <div key={key} className={key === 'address' ? 'col-12' : 'col-sm-6'}>
            <dt className="text-sm text-secondary-light mb-8">{label}</dt>
            <dd className="mb-0 text-break" style={{ whiteSpace: 'pre-wrap' }}>
              {key === 'role' && user.role
                ? user.role === 'super_admin'
                  ? 'Super Admin'
                  : user.role.charAt(0).toUpperCase() + user.role.slice(1)
                : key === 'created_at' && user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : user[key] || '—'}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
