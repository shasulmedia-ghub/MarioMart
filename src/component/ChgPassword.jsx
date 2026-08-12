import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// PLACEHOLDER endpoint — replace with actual API route when available
const API_BASE = 'https://mm-api-virid.vercel.app';

export default function ChgPassword() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors,     setErrors]     = useState({});
  const [apiError,   setApiError]   = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
    setApiSuccess('');
  };

  const validate = () => {
    const errs = {};
    if (!form.currentPassword)                   errs.currentPassword  = 'Current password is required.';
    if (!form.newPassword)                        errs.newPassword      = 'New password is required.';
    else if (form.newPassword.length < 6)         errs.newPassword      = 'Password must be at least 6 characters.';
    if (!form.confirmPassword)                    errs.confirmPassword  = 'Please confirm your new password.';
    else if (form.newPassword !== form.confirmPassword)
                                                  errs.confirmPassword  = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // PLACEHOLDER: replace :id segment and payload shape when API is finalised
      const res = await fetch(`${API_BASE}/api/users/${user.id}/password`, {
        method:  'PATCH',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          password:     form.newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setApiError(data?.message ?? data?.error ?? 'Failed to change password. Please try again.');
        return;
      }

      setApiSuccess('🎉 Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setApiError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Close / back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={styles.closeButton}
          aria-label="Go back"
        >
          ✕
        </button>

        {/* Header */}
        <div style={styles.cardHeader}>
          <h1 style={styles.title}>Change Password</h1>
          <p style={styles.subtitle}>Update your MarioMart account password</p>
        </div>

        {/* API Error */}
        {apiError && (
          <div style={styles.errorBox} role="alert">
            ❌ {apiError}
          </div>
        )}

        {/* API Success */}
        {apiSuccess && (
          <div style={styles.successBox} role="status">
            {apiSuccess}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={styles.form}>
          <Field
            id="chgpwd-current"
            name="currentPassword"
            label="Current Password"
            placeholder="Enter current password"
            value={form.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
          />
          <Field
            id="chgpwd-new"
            name="newPassword"
            label="New Password"
            placeholder="Min. 6 characters"
            value={form.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
          />
          <Field
            id="chgpwd-confirm"
            name="confirmPassword"
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <button
            id="chgpwd-submit"
            type="submit"
            disabled={loading}
            className="mario-btn mario-btn-green"
            style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '🔄 Saving…' : '🔑 Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Internal password field ─────────────────────────────────────────────── */
function Field({ id, name, label, placeholder, value, onChange, error }) {
  return (
    <div style={styles.field}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <input
        id={id}
        name={name}
        type="password"
        autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'}
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
  title: {
    fontFamily: 'var(--font-retro)',
    fontSize: '1.1rem',
    color: 'var(--mario-red)',
    textShadow: '2px 2px 0 var(--mario-yellow)',
    margin: '0 0 6px',
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
  successBox: {
    background: '#DCFCE7',
    border: '2px solid #16A34A',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#15803D',
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
  fieldError: {
    fontSize: '0.82rem',
    color: 'var(--mario-red)',
    fontWeight: 600,
  },
};
