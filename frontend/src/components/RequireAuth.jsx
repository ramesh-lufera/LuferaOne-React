import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { apiUrl, getToken, clearToken, hasVerifiedToken } from '../helper/auth';

export default function RequireAuth() {
  const [status, setStatus] = useState(() => hasVerifiedToken() ? 'authenticated' : 'loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (hasVerifiedToken()) return;
    const controller = new AbortController();
    const token = getToken();
    if (!token) { setStatus('unauthenticated'); return; }
    setStatus('loading');
    fetch(apiUrl + '/user', {
      headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
      signal: controller.signal,
    }).then(async (response) => {
      if (response.status === 401) { clearToken(); setStatus('unauthenticated'); }
      else if (response.ok && (await response.json()).user) setStatus('authenticated');
      else setStatus('error');
    }).catch((error) => { if (error.name !== 'AbortError') setStatus('error'); });
    return () => controller.abort();
  }, [attempt]);
  if (status === 'unauthenticated') return <Navigate to='/sign-in' replace />;
  if (status === 'loading') return <p role='status' className='p-24'>Checking sign-in...</p>;
  if (status === 'error') return <div className='p-24' role='alert'>Unable to verify your sign-in. <button onClick={() => setAttempt(attempt + 1)}>Try again</button></div>;
  return <Outlet />;
}
