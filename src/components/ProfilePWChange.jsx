import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import mmlogo from '../assets/mm_logo/mariomart_logo.jpg';
import '../App.css';

const API_BASE = 'https://mm-api-virid.vercel.app';

export default function ProfilePWChange() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --------------------------------------------------
  // Handle input
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: '',
    }));

    setApiError('');
  };

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  const validate = () => {
    const errs = {};

    if (!form.currentPassword) {
      errs.currentPassword =
        'Current password is required.';
    }

    if (!form.newPassword) {
      errs.newPassword =
        'New password is required.';
    } else if (form.newPassword.length < 6) {
      errs.newPassword =
        'Password must be at least 6 characters.';
    }

    if (!form.confirmPassword) {
      errs.confirmPassword =
        'Please confirm your new password.';
    } else if (
      form.newPassword !== form.confirmPassword
    ) {
      errs.confirmPassword =
        'Passwords do not match.';
    }

    if (
      form.currentPassword &&
      form.newPassword &&
      form.currentPassword === form.newPassword
    ) {
      errs.newPassword =
        'New password must be different from your current password.';
    }

    return errs;
  };

  // --------------------------------------------------
  // Submit - show confirmation
  // --------------------------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setShowConfirm(true);
  };

  // --------------------------------------------------
  // Confirm password change
  // --------------------------------------------------

  const confirmPasswordChange = async () => {
    if (!user?.id || !token) {
      setApiError(
        'Your session has expired. Please log in again.'
      );
      setShowConfirm(false);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const response = await fetch(
        `${API_BASE}/api/users/${user.id}/password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setApiError(
          data?.error ||
          data?.message ||
          'Unable to change password.'
        );
        setShowConfirm(false);
        return;
      }

      setShowConfirm(false);

      navigate('/profile', {
        replace: true,
        state: {
          passwordChanged: true,
        },
      });

    } catch (error) {
      console.error(
        'Password change error:',
        error
      );

      setApiError(
        'Network error. Please try again.'
      );

      setShowConfirm(false);

    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div style={styles.page}>

      <div style={styles.card}>

        {/* Close */}
        <button
          type="button"
          onClick={() => navigate('/profile')}
          style={styles.closeButton}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Logo */}
        <div
          className="mario-brand-logo"
          style={{ textAlign: 'center' }}
        >
          <img
            style={{ width: '100px' }}
            src={mmlogo}
            alt="MarioMart Logo"
          />
        </div>

        {/* Header */}
        <div style={styles.cardHeader}>
          <h1 style={styles.title}>
            Change Password
          </h1>

          <p style={styles.subtitle}>
            Keep your MarioMart account secure!
          </p>
        </div>

        {/* Error */}
        {apiError && (
          <div style={styles.errorBox} role="alert">
            ❌ {apiError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          style={styles.form}
        >

          <Field
            id="current-password"
            name="currentPassword"
            label="Current Password"
            value={form.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            autoComplete="current-password"
          />

          <Field
            id="new-password"
            name="newPassword"
            label="New Password"
            value={form.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            autoComplete="new-password"
          />

          <Field
            id="confirm-password"
            name="confirmPassword"
            label="Confirm New Password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          <button
            type="submit"
            className="mario-btn mario-btn-green"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '8px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            🔐 Accept Password Change
          </button>

          <button
            type="button"
            className="mario-btn"
            onClick={() => navigate('/profile')}
            style={{ width: '100%' }}
          >
            Cancel
          </button>

        </form>

      </div>

      {/* Confirmation popup */}
      {showConfirm && (
        <div style={styles.overlay}>
          <div style={styles.confirmCard}>

            <div style={styles.confirmIcon}>
              🔐
            </div>

            <h2 style={styles.confirmTitle}>
              Confirm Password Change
            </h2>

            <p style={styles.confirmText}>
              Are you sure you want to change your
              MarioMart password?
            </p>

            <div style={styles.confirmButtons}>

              <button
                type="button"
                className="mario-btn"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="mario-btn mario-btn-green"
                onClick={confirmPasswordChange}
                disabled={loading}
              >
                {loading
                  ? '🔄 Updating...'
                  : '✅ Confirm Change'}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ======================================================
// Password field
// ======================================================

function Field({
  id,
  name,
  label,
  value,
  onChange,
  error,
  autoComplete,
}) {
  return (
    <div style={styles.field}>

      <label
        htmlFor={id}
        style={styles.label}
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type="password"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        style={{
          ...styles.input,
          borderColor: error
            ? 'var(--mario-red)'
            : 'var(--dark-text)',
        }}
      />

      {error && (
        <span style={styles.fieldError}>
          {error}
        </span>
      )}

    </div>
  );
}

// ======================================================
// Styles
// ======================================================

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
    boxSizing: 'border-box',
    width: '100%',
  },

  fieldError: {
    fontSize: '0.82rem',
    color: 'var(--mario-red)',
    fontWeight: 600,
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000,
  },

  confirmCard: {
    width: '100%',
    maxWidth: '420px',
    background: 'var(--cloud-white)',
    border: '3px solid var(--dark-text)',
    borderRadius: '20px',
    boxShadow: '0 8px 0 var(--dark-text)',
    padding: '30px',
    textAlign: 'center',
  },

  confirmIcon: {
    fontSize: '2.5rem',
    marginBottom: '10px',
  },

  confirmTitle: {
    fontFamily: 'var(--font-retro)',
    fontSize: '1rem',
    color: 'var(--mario-red)',
    textShadow: '2px 2px 0 var(--mario-yellow)',
    margin: '8px 0 12px',
  },

  confirmText: {
    fontFamily: 'var(--font-main)',
    color: '#64748B',
    lineHeight: 1.5,
    marginBottom: '24px',
  },

  confirmButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
  },
};

