import FacebookSignIn from "./FacebookSignIn";
import GoogleSignIn from "./GoogleSignIn";
import { Icon } from "@iconify/react/dist/iconify.js";

import { useEffect, useState } from "react";
import { saveToken, getToken, clearToken, markTokenVerified, apiUrl } from "../helper/auth";
import { Link, useNavigate } from "react-router-dom";
import "./SignInLayer.css";

const SignInLayer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [restoringSession, setRestoringSession] = useState(() => Boolean(getToken()));

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const controller = new AbortController();
    let active = true;
    fetch(apiUrl + '/user', {
      headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
      signal: controller.signal,
    }).then(async (response) => {
      if (!active) return;
      if (response.status === 401) {
        if (getToken() === token) clearToken();
      } else if (response.ok) {
        const data = await response.json();
        if (active && data.user) {
          markTokenVerified(token);
          navigate('/', { replace: true });
        }
      }
    }).catch(() => {
      // Keep the form available when the server cannot be reached.
    }).finally(() => {
      if (active) setRestoringSession(false);
    });
    return () => { active = false; controller.abort(); };
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || restoringSession) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(apiUrl + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, remember }),
      });
      const data = await response.json();
      if (!response.ok || !data.token) {
        setError(response.status === 401 ? 'Invalid email or password.' : response.status === 429 ? 'Too many attempts. Please try again in a minute.' : data.message || 'Unable to sign in. Please try again.');
        return;
      }
      saveToken(data.token, remember);
      markTokenVerified(data.token);
      navigate('/', { replace: true });
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className='auth bg-base d-flex flex-wrap'>
      <div className='auth-left d-lg-block d-none'>
        <div className='d-flex align-items-center flex-column h-100 justify-content-center'>
          <img src='assets/images/auth/auth-img.png' alt='' />
        </div>
      </div>
      <div className='auth-right sign-in-panel py-32 px-24 d-flex flex-column justify-content-center'>
        <div className='max-w-464-px mx-auto w-100'>
          <div>
            <Link to='/' className='sign-in-brand mb-40' aria-label='Lufera Infotech home'>
              <Icon icon='solar:cloud-outline' aria-hidden='true' />
              <span>Lufera<span className='sign-in-brand-accent'>Infotech</span></span>
            </Link>
            <h4 className='mb-12'>Sign In</h4>
            <p className='mb-32 text-secondary-light text-lg'>
              Welcome back! Enter your details
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            {error && <p role='alert' className='text-danger mb-16'>{error}</p>}
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='mage:email' />
              </span>
              <input
                type='email'
                name='email'
                aria-label='Email'
                autoComplete='username'
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Email'
              />
            </div>
            <div className='position-relative mb-20'>
              <div className='icon-field'>
                <span className='icon top-50 translate-middle-y'>
                  <Icon icon='solar:lock-password-outline' />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  aria-label='Password'
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className='form-control h-56-px bg-neutral-50 radius-12'
                  id='your-password'
                  placeholder='Password'
                />
              </div>
              <button
                type='button'
                className='password-visibility-toggle cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light'
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                aria-controls='your-password'
              >
                <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden='true' />
              </button>
            </div>
            <div className=''>
              <div className='d-flex justify-content-between gap-2'>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input border border-neutral-300'
                    type='checkbox'
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    name='remember'
                    id='remember'
                  />
                  <label className='form-check-label' htmlFor='remember'>
                    Remember me{" "}
                  </label>
                </div>
              </div>
            </div>
            <button
              type='submit'
              disabled={loading || restoringSession}
              className='btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32'
            >
              {restoringSession ? 'Checking sign-in...' : loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className='mt-32 center-border-horizontal text-center'>
              <span className='bg-base z-1 px-4'>Or sign in with</span>
            </div>
            <div className='mt-32 d-flex align-items-center gap-3'>
              <FacebookSignIn remember={remember} disabled={loading || restoringSession} onBusyChange={setLoading} />
              <GoogleSignIn remember={remember} disabled={loading || restoringSession} onBusyChange={setLoading} />
            </div>
            <div className='mt-32 text-center text-sm'>
              <p className='mb-0'>
                Don’t have an account?{" "}
                <Link to='/sign-up' className='text-primary-600 fw-semibold'>
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInLayer;
