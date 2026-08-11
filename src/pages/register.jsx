import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import mmlogo from '../assets/mm_logo/mariomart_logo.jpg'
import "../App.css";

const API_REGISTER = 'https://mm-api-virid.vercel.app/api/users/register';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    marketingOptIn: false,
  });
  const [errors,  setErrors]  = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear per-field error on edit
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!EMAIL_RE.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';

    if (!form.dateOfBirth) {
      errs.dateOfBirth = 'Date of birth is required.';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dob = new Date(form.dateOfBirth);
      if (dob > today) {
        errs.dateOfBirth = 'Date of birth cannot be in the future.';
      }
    }

    if (!form.gender) errs.gender = 'Gender is required.';
    if (!form.address.trim()) errs.address = 'Address is required.';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();

    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch(API_REGISTER, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          firstName: form.firstName.trim(),
          lastName:  form.lastName.trim(),
          email:     form.email.trim(),
          password:  form.password,
          dateOfBirth: form.dateOfBirth,
          gender:    form.gender,
          address:   form.address.trim(),
          marketingOptIn: Boolean(form.marketingOptIn),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data?.message ?? data?.error ?? 'Registration failed. Please try again.');
        return;
      }

      // If the API returns a token (auto-login), use it; otherwise redirect to Login
      const token = data.token ?? data.accessToken ?? data.access_token ?? null;
      if (token) {
        let decoded = {};
        try { decoded = jwtDecode(token); } catch { /* ignore */ }

        const user = {
          id:    decoded.id    ?? decoded.userId ?? decoded.sub ?? data.user?.id    ?? null,
          name:  decoded.name  ?? data.user?.name  ?? `${form.firstName.trim()} ${form.lastName.trim()}`,
          email: decoded.email ?? data.user?.email ?? form.email.trim(),
          role:  decoded.role  ?? decoded.userRole ?? data.user?.role ?? 'customer',
        };

        login(token, user);
        navigate('/', { replace: true });
      } else {
        // No token returned — redirect to Login
        navigate('/login', { state: { registered: true }, replace: true });
      }
    } catch (err) {
      setApiError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Close Button */}
        <button
          type="button"
          onClick={() => navigate('/')}
          style={styles.closeButton}
          aria-label="Close"
        >
          ✕
        </button>
            <div className="mario-brand-logo" style={{textAlign: "center"}}>
              <img style={{width:"100px"}} src={mmlogo} alt="MM_Logo" />
             </div>
        {/* Header */}
        <div style={styles.cardHeader}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join the MarioMart family!</p>
        </div>

        {/* API Error */}
        {apiError && (
          <div style={styles.errorBox} role="alert">
            ❌ {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={styles.form}>
          <Field
            id="reg-firstName" name="firstName" label="First Name"
            type="text" autoComplete="given-name" placeholder="Mario"
            value={form.firstName} onChange={handleChange} error={errors.firstName}
          />
          <Field
            id="reg-lastName" name="lastName" label="Last Name"
            type="text" autoComplete="family-name" placeholder="Bros"
            value={form.lastName} onChange={handleChange} error={errors.lastName}
          />
          <Field
            id="reg-email" name="email" label="Email"
            type="email" autoComplete="email" placeholder="mario@mariomart.com"
            value={form.email} onChange={handleChange} error={errors.email}
          />
          <Field
            id="reg-password" name="password" label="Password"
            type="password" autoComplete="new-password" placeholder="Min. 6 characters"
            value={form.password} onChange={handleChange} error={errors.password}
          />
          <Field
            id="reg-confirm-password" name="confirmPassword" label="Confirm Password"
            type="password" autoComplete="new-password" placeholder="Re-enter password"
            value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword}
          />
          <Field
            id="reg-dateOfBirth" name="dateOfBirth" label="Date of Birth"
            type="date" autoComplete="bday"
            value={form.dateOfBirth} onChange={handleChange} error={errors.dateOfBirth}
          />
          <div style={styles.field}>
            <label htmlFor="reg-gender" style={styles.label}>Gender</label>
            <select
              id="reg-gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.gender ? 'var(--mario-red)' : 'var(--dark-text)',
              }}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 3px var(--mario-blue-light)')}
              onBlur={(e)  => (e.target.style.boxShadow = 'none')}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <span style={styles.fieldError}>{errors.gender}</span>}
          </div>
          <div style={styles.field}>
            <label htmlFor="reg-address" style={styles.label}>Address</label>
            <textarea
              id="reg-address"
              name="address"
              rows={3}
              placeholder="123 Mushroom Kingdom Way"
              value={form.address}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.address ? 'var(--mario-red)' : 'var(--dark-text)',
                resize: 'vertical',
              }}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 3px var(--mario-blue-light)')}
              onBlur={(e)  => (e.target.style.boxShadow = 'none')}
            />
            {errors.address && <span style={styles.fieldError}>{errors.address}</span>}
          </div>
          <div style={styles.toggleField}>
            <label htmlFor="reg-marketingOptIn" style={styles.label}>
              Marketing Opt-In
            </label>
            <label style={styles.toggleSwitch}>
              <input
                id="reg-marketingOptIn"
                name="marketingOptIn"
                type="checkbox"
                checked={form.marketingOptIn}
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              <span style={{
                ...styles.toggleTrack,
                background: form.marketingOptIn ? '#22C55E' : '#CBD5E1',
              }}>
                <span style={{
                  ...styles.toggleThumb,
                  transform: form.marketingOptIn ? 'translateX(20px)' : 'translateX(0px)',
                }} />
              </span>
            </label>
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="mario-btn mario-btn-green"
            style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '🔄 Creating account…' : '⭐ Create Account'}
          </button>
        </form>

        {/* Footer link */}
        <p style={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

/* ── Internal reusable field ─────────────────────────────────────────────── */
function Field({ id, name, label, type, autoComplete, placeholder, value, onChange, error }) {
  return (
    <div style={styles.field}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        style={{
          ...styles.input,
          borderColor: error ? 'var(--mario-red)' : 'var(--dark-text)',
        }}
        onFocus={(e) => (e.target.style.boxShadow = '0 0 0 3px var(--mario-blue-light)')}
        onBlur={(e)  => (e.target.style.boxShadow = 'none')}
      />
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    position: 'relative',
    background: 'var(--cloud-white)',
    border: '3px solid var(--dark-text)',
    borderRadius: '20px',
    boxShadow: '0 8px 0 var(--dark-text)',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '440px',
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'transparent',
    border: '2px solid var(--dark-text)',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'var(--dark-text)',
    cursor: 'pointer',
    lineHeight: 1,
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  icon: {
    fontSize: '2.5rem',
  },
  title: {
    fontFamily: 'var(--font-retro)',
    fontSize: '1.1rem',
    color: 'var(--mario-red)',
    textShadow: '2px 2px 0 var(--mario-yellow)',
    margin: '12px 0 6px',
  },
  subtitle: {
    fontFamily: 'var(--font-main)',
    fontSize: '0.95rem',
    color: '#64748B',
    margin: 0,
  },
  errorBox: {
    background: '#FEE2E2',
    border: '2px solid var(--mario-red)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: 'var(--mario-red-dark)',
    fontWeight: 600,
    fontSize: '0.9rem',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontFamily: 'var(--font-main)',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: 'var(--dark-text)',
  },
  input: {
    padding: '12px 14px',
    fontFamily: 'var(--font-main)',
    fontSize: '1rem',
    border: '3px solid var(--dark-text)',
    borderRadius: '12px',
    outline: 'none',
    background: 'var(--gray-light)',
    color: 'var(--dark-text)',
    transition: 'box-shadow 0.15s ease',
  },
  toggleField: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '4px',
  },
  toggleSwitch: {
    position: 'relative',
    display: 'inline-block',
    width: '48px',
    height: '28px',
    cursor: 'pointer',
  },
  toggleTrack: {
    display: 'flex',
    alignItems: 'center',
    padding: '3px',
    width: '100%',
    height: '100%',
    borderRadius: '14px',
    border: '2px solid var(--dark-text)',
    transition: 'background-color 0.2s ease',
    boxSizing: 'border-box',
  },
  toggleThumb: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: '#FFFFFF',
    border: '1px solid var(--dark-text)',
    transition: 'transform 0.2s ease',
  },
  fieldError: {
    fontSize: '0.82rem',
    color: 'var(--mario-red)',
    fontWeight: 600,
  },
  footerText: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '0.95rem',
    color: '#64748B',
  },
  link: {
    color: 'var(--mario-red)',
    fontWeight: 700,
    textDecoration: 'none',
  },
};
