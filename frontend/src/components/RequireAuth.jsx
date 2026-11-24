import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { apiUrl, getToken, clearToken } from '../helper/auth';
import { canAccessPath } from '../helper/moduleAccess';
import usePageTabTitle from '../helper/usePageTabTitle';

import {
  AccessContext,
  UpdateAccessUserContext,
} from '../helper/AccessContext';

// eslint-disable-next-line react/prop-types
export default function RequireAuth({ allowGuest = false }) {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const verifiedToken = useRef(null);
  const { pathname } = useLocation();
  const accessDenied = status === 'authenticated' && !canAccessPath(user, pathname);
  usePageTabTitle(accessDenied ? 'Access Denied' : null);
  useEffect(() => {
    const controller = new AbortController();
    const token = getToken();
    if (!token) {
      verifiedToken.current = null;
      setStatus('unauthenticated');
      return;
    }
    const isVerifiedSession = verifiedToken.current === token;
    if (!isVerifiedSession) verifiedToken.current = null;
    setStatus((current) => isVerifiedSession && current === 'authenticated' ? current : 'loading');
    fetch(apiUrl + '/user', {
      headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (controller.signal.aborted) return;
        if (response.status === 401) {
          verifiedToken.current = null;
          clearToken();
          setStatus('unauthenticated');
        } else if (response.ok) {
          const data = await response.json();
          if (controller.signal.aborted) return;
          verifiedToken.current = data.user ? token : null;
          setUser(data.user);
          setStatus(data.user ? 'authenticated' : 'error');
        } else setStatus('error');
      })
      .catch((error) => {
        if (!controller.signal.aborted && error.name !== 'AbortError') setStatus('error');
      });
    return () => controller.abort();
  }, [attempt, pathname]);
  if (status === 'unauthenticated') return allowGuest ? <Outlet /> : <Navigate to="/sign-in" replace />;
  if (status === 'loading') return null;
  if (status === 'error')
    return (
      <div className="p-24" role="alert">
        Unable to verify your access.{' '}
        <button onClick={() => setAttempt(attempt + 1)}>Try again</button>
      </div>
    );
  if (accessDenied)
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
      <UpdateAccessUserContext.Provider value={setUser}>
        <Outlet />
      </UpdateAccessUserContext.Provider>
    </AccessContext.Provider>
  );
}
