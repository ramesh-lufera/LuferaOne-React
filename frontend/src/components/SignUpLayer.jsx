import FacebookSignIn from "./FacebookSignIn";
import GoogleSignIn from "./GoogleSignIn";
import { useRef, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import "./SignUpLayer.css";

const initialValues = { name: "", email: "", phone: "", username: "", password: "", terms: false };
const fields = [
  { name: "name", label: "Name", icon: "f7:person", autoComplete: "name", maxLength: 255 },
  { name: "email", label: "Email", icon: "mage:email", type: "email", autoComplete: "email", maxLength: 255 },
  { name: "phone", label: "Phone No", icon: "solar:phone-outline", type: "tel", autoComplete: "tel", maxLength: 30 },
  { name: "username", label: "Username", icon: "solar:pen-new-square-linear", autoComplete: "username", minLength: 3, maxLength: 50 },
  { name: "password", label: "Password", icon: "solar:lock-password-outline", type: "password", autoComplete: "new-password", minLength: 8, maxLength: 128 },
];

const SignUpLayer = () => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submissionLock = useRef(false);
  const logoUrl = import.meta.env.VITE_SIGNUP_LOGO_URL;

  function changeField(event) {
    const { name, value, checked, type } = event.target;
    if (name === "username") return;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "email" ? { username: value.split("@")[0] } : {}),
    }));
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === "email" ? { username: undefined } : {}),
    }));
    setMessage("");
    setSuccess(false);
  }

  async function submit(event) {
    event.preventDefault();
    if (submissionLock.current) return;
    setErrors({});
    setMessage("");
    setSuccess(false);
    const normalized = { ...values, name: values.name.trim(), email: values.email.trim().toLowerCase(), phone: values.phone.trim(), username: values.username.trim().toLowerCase() };
    const validation = {};
    if (!normalized.name) validation.name = ["Please enter your name."];
    const phoneDigits = normalized.phone.replace(/\D/g, "");
    if (!/^\+?[0-9 ()-]+$/.test(normalized.phone) || phoneDigits.length < 7 || phoneDigits.length > 15) validation.phone = ["Enter a phone number with 7 to 15 digits."];
    if (!/^[a-z0-9_.-]{3,50}$/.test(normalized.username)) validation.username = ["Use 3–50 letters, numbers, dots, hyphens, or underscores."];
    if (Object.keys(validation).length) { setErrors(validation); return; }
    submissionLock.current = true;
    setSubmitting(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
      if (!baseUrl) throw new Error("Registration is unavailable. The API URL has not been configured.");
      const response = await fetch(`${baseUrl}/register`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(normalized),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 422) {
        setErrors(data.errors || {});
        setMessage("Please correct the highlighted fields.");
        return;
      }
      if (!response.ok) throw new Error(response.status === 429 ? "Too many registration attempts. Please try again in a minute." : "Registration is temporarily unavailable. Please try again.");
      setSuccess(true);
      setMessage(data.message || "Account created successfully. Please sign in.");
      setValues(initialValues);
      setShowPassword(false);
    } catch (error) {
      setMessage(error.name === "AbortError" ? "The request timed out. Please try again. If your account was created, you can sign in." : error instanceof TypeError ? "Unable to connect. Check your connection and try again." : error.message);
    } finally {
      clearTimeout(timeout);
      submissionLock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section className="auth signup-page bg-base d-flex flex-wrap">
      <div className="auth-left d-lg-block d-none" aria-hidden="true">
        <div className="d-flex align-items-center flex-column h-100 justify-content-center">
          <img src="/assets/images/auth/auth-img.png" alt="" />
        </div>
      </div>
      <div className="auth-right py-32 px-24 d-flex flex-column justify-content-center">
        <div className="max-w-464-px mx-auto w-100">
          <Link to="/" className="signup-logo">{logoUrl ? <img src={logoUrl} alt="LuferaInfotech" /> : <><Icon icon="solar:cloud-linear" /><span>Lufera<span>Infotech</span></span></>}</Link>
          <h4 className="mb-12">Sign Up</h4>
          <p className="mb-32 text-secondary-light text-lg">Welcome back! Enter your details</p>
          <form onSubmit={submit} aria-busy={submitting}>
            {message && <div className={`alert ${success ? "alert-success" : "alert-danger"}`} role={success ? "status" : "alert"}>{message}{success && <> <Link to="/sign-in">Sign In</Link></>}</div>}
            <fieldset disabled={submitting} className="signup-fields">
              {fields.map((field) => (
                <div className="mb-16" key={field.name}>
                  <label className="visually-hidden" htmlFor={`signup-${field.name}`}>{field.label}</label>
                  <div className="icon-field position-relative">
                    <span className="icon top-50 translate-middle-y"><Icon icon={field.icon} /></span>
                    <input id={`signup-${field.name}`} name={field.name} type={field.name === "password" && showPassword ? "text" : field.type || "text"} className={`form-control h-56-px bg-neutral-50 radius-12 ${errors[field.name] ? "is-invalid" : ""}`} placeholder={field.label} autoComplete={field.autoComplete} value={values[field.name]} readOnly={field.name === "username"} onChange={changeField} minLength={field.minLength} maxLength={field.maxLength} required aria-invalid={Boolean(errors[field.name])} aria-describedby={errors[field.name] ? `signup-${field.name}-error` : undefined} />
                    {field.name === "password" && <button type="button" className="signup-password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((current) => !current)}><i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"} aria-hidden="true" /></button>}
                  </div>
                  {errors[field.name] && <div id={`signup-${field.name}-error`} className="text-danger text-sm mt-4">{errors[field.name][0]}</div>}
                </div>
              ))}
              <div className="form-check style-check d-flex align-items-start signup-terms">
                <input className="form-check-input border border-neutral-300 mt-4" type="checkbox" name="terms" id="signup-terms" checked={values.terms} onChange={changeField} required aria-invalid={Boolean(errors.terms)} aria-describedby={errors.terms ? "signup-terms-error" : undefined} />
                <label className="form-check-label text-sm" htmlFor="signup-terms">By creating an account means you agree to the <Link to="/terms-condition">Terms &amp; Conditions</Link> and our {import.meta.env.VITE_PRIVACY_POLICY_URL ? <a href={import.meta.env.VITE_PRIVACY_POLICY_URL}>Privacy Policy</a> : <span className="signup-policy-pending" title="Privacy policy has not been configured">Privacy Policy</span>}</label>
              </div>
              {errors.terms && <div id="signup-terms-error" className="text-danger text-sm">{errors.terms[0]}</div>}
              <button type="submit" className="btn signup-submit text-sm px-12 py-16 w-100 radius-12 mt-32">{submitting ? "Creating account…" : "Sign Up"}</button>
            </fieldset>
            <div className="mt-32 center-border-horizontal text-center"><span className="bg-base z-1 px-4">Or sign up with</span></div>
            <div className="mt-32 d-flex align-items-center gap-3">
              <FacebookSignIn mode="signup" terms={values.terms} disabled={submitting} onBusyChange={(busy) => { submissionLock.current = busy; setSubmitting(busy); }} />
              <GoogleSignIn mode="signup" terms={values.terms} disabled={submitting} onBusyChange={(busy) => { submissionLock.current = busy; setSubmitting(busy); }} />
            </div>
            <div className="mt-32 text-center text-sm"><p className="mb-0">Already have an account? <Link to="/sign-in" className="fw-semibold">Sign In</Link></p></div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUpLayer;
