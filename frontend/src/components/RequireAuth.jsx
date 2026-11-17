import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { apiUrl, getToken, clearToken } from '../helper/auth';
import { canAccessPath } from '../helper/moduleAccess';

import { AccessContext } from '../helper/AccessContext';

export default function RequireAuth() {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const { pathname } = useLocation();
  useEffect(() => {
    const controller = new AbortController();
    const token = getToken();
    if (!token) {
      setStatus('unauthenticated');
      return;
    }
    setStatus('loading');
    fetch(apiUrl + '/user', {
      headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401) {
          clearToken();
          setStatus('unauthenticated');
        } else if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setStatus(data.user ? 'authenticated' : 'error');
        } else setStatus('error');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('error');
      });
    return () => controller.abort();
  }, [attempt, pathname]);
  if (status === 'unauthenticated') return <Navigate to="/sign-in" replace />;
  if (status === 'loading')
    return (
      <p role="status" className="p-24">
        Checking access...
      </p>
    );
  if (status === 'error')
    return (
      <div className="p-24" role="alert">
        Unable to verify your access.{' '}
        <button onClick={() => setAttempt(attempt + 1)}>Try again</button>
      </div>
    );
  if (!canAccessPath(user, pathname))
    return (
      <div className="p-24" role="alert">
        <h1>Access denied</h1>
        <p>
          Your role does not have access to this module. Contact your
          administrator.
        </p>
        <Link to="/">Dashboard</Link> <Link to="/sign-in">Sign in</Link>
      </div>
    );
  return (
    <AccessContext.Provider value={user}>
      <Outlet />
    </AccessContext.Provider>
  );
}
