import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import mmlogo from '../assets/mm_logo/mariomart_logo.jpg';
import '../App.css';

const API_BASE = 'https://mm-api-virid.vercel.app';

export default function UpdateProfile() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    marketingOptIn: false,
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --------------------------------------------------
  // Load complete profile
  // --------------------------------------------------

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id || !token) {
        setApiError('Unable to identify your account.');
        setLoading(false);
        return;
      }

console.log(`${API_BASE}/api/users/${user.id}`);

      try {
        const response = await fetch(
          `${API_BASE}/api/users/${user.id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setApiError(
            data?.error ||
            data?.message ||
            'Unable to load your profile.'
          );
          return;
        }

        setForm({
          firstName: data.first_name ?? data.firstName ?? '',
          lastName: data.last_name ?? data.lastName ?? '',
          email: data.email ?? '',
          dateOfBirth: data.date_of_birth
            ? String(data.date_of_birth).slice(0, 10)
            : '',
          gender: data.gender ?? '',
          address: data.address ?? '',
          marketingOptIn: Boolean(
            data.marketing_opt_in ?? data.marketingOptIn
          ),
        });
      } catch (error) {
        console.error('Profile loading error:', error);
        setApiError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, token]);

  // --------------------------------------------------
  // Handle form changes
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: '',
    }));

    setApiError('');
  };

  // --------------------------------------------------
  // Validate
  // --------------------------------------------------

  const validate = () => {
    const errs = {};

    if (!form.firstName.trim()) {
      errs.firstName = 'First name is required.';
    }

    if (!form.lastName.trim()) {
      errs.lastName = 'Last name is required.';
    }

    if (!form.dateOfBirth) {
      errs.dateOfBirth = 'Date of birth is required.';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dob = new Date(form.dateOfBirth);

      if (dob > today) {
        errs.dateOfBirth =
          'Date of birth cannot be in the future.';
      }
    }

    if (!form.gender) {
      errs.gender = 'Gender is required.';
    }

    if (!form.address.trim()) {
      errs.address = 'Address is required.';
    }

    return errs;
  };

  // --------------------------------------------------
  // First submit - show confirmation
  // --------------------------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();

    setApiError('');

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setShowConfirm(true);
  };

  // --------------------------------------------------
  // Confirm profile change
  // --------------------------------------------------

  const confirmProfileChange = async () => {
    if (!user?.id || !token) {
      setApiError('Your session has expired. Please log in again.');
      setShowConfirm(false);
      return;
    }

    setSaving(true);
    setApiError('');

    try {
      const response = await fetch(
        `${API_BASE}/api/users/${user.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            dateOfBirth: form.dateOfBirth,
            gender: form.gender,
            address: form.address.trim(),
            marketingOptIn: Boolean(form.marketingOptIn),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setApiError(
          data?.error ||
          data?.message ||
          'Failed to update your profile.'
        );
        setShowConfirm(false);
        return;
      }

      // Update the locally stored user information.
      // Keep email and role from the existing authentication state.
      const updatedUser = {
        ...user,
        firstName: data.first_name ?? form.firstName.trim(),
        lastName: data.last_name ?? form.lastName.trim(),
        email: data.email ?? user.email,
        role: data.role ?? user.role,
      };

      // Keep the existing token.
      login(token, updatedUser);

      setShowConfirm(false);

      // Return to home after successful update.
      navigate('/', {
        replace: true,
        state: {
          profileUpdated: true,
        },
      });
    } catch (error) {
      console.error('Profile update error:', error);
      setApiError('Network error. Please try again.');
      setShowConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h1 style={styles.title}>Profile Update</h1>
            <p style={styles.subtitle}>
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <div style={styles.page}>

      <div style={styles.card}>

        {/* Close */}
        <button
          type="button"
          onClick={() => navigate('/')}
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
            Profile Update
          </h1>

          <p style={styles.subtitle}>
            Keep your MarioMart profile up to date!
          </p>
        </div>

        {/* API error */}
        {apiError && (
          <div style={styles.errorBox} role="alert">
            ❌ {apiError}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          style={styles.form}
        >

          <Field
            id="profile-firstName"
            name="firstName"
            label="First Name"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={handleChange}
            error={errors.firstName}
          />

          <Field
            id="profile-lastName"
            name="lastName"
            label="Last Name"
            type="text"
            autoComplete="family-name"
            value={form.lastName}
            onChange={handleChange}
            error={errors.lastName}
          />

          {/* Email - cannot be changed */}
          <Field
            id="profile-email"
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={() => {}}
            disabled
            helper="Email address cannot be changed."
          />

          <Field
            id="profile-dateOfBirth"
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            autoComplete="bday"
            value={form.dateOfBirth}
            onChange={handleChange}
            error={errors.dateOfBirth}
          />

          <div style={styles.field}>
            <label
              htmlFor="profile-gender"
              style={styles.label}
            >
              Gender
            </label>

            <select
              id="profile-gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.gender
                  ? 'var(--mario-red)'
                  : 'var(--dark-text)',
              }}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {errors.gender && (
              <span style={styles.fieldError}>
                {errors.gender}
              </span>
            )}
          </div>

          <div style={styles.field}>
            <label
              htmlFor="profile-address"
              style={styles.label}
            >
              Address
            </label>

            <textarea
              id="profile-address"
              name="address"
              rows={3}
              value={form.address}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.address
                  ? 'var(--mario-red)'
                  : 'var(--dark-text)',
                resize: 'vertical',
              }}
            />

            {errors.address && (
              <span style={styles.fieldError}>
                {errors.address}
              </span>
            )}
          </div>

          {/* Marketing */}
          <div style={styles.toggleField}>
            <label
              htmlFor="profile-marketingOptIn"
              style={styles.label}
            >
              Marketing Opt-In
            </label>

            <label style={styles.toggleSwitch}>
              <input
                id="profile-marketingOptIn"
                name="marketingOptIn"
                type="checkbox"
                checked={form.marketingOptIn}
                onChange={handleChange}
                style={{ display: 'none' }}
              />

              <span
                style={{
                  ...styles.toggleTrack,
                  background: form.marketingOptIn
                    ? '#22C55E'
                    : '#CBD5E1',
                }}
              >
                <span
                  style={{
                    ...styles.toggleThumb,
                    transform: form.marketingOptIn
                      ? 'translateX(20px)'
                      : 'translateX(0px)',
                  }}
                />
              </span>
            </label>
          </div>

          {/* Password */}
          <button
            type="button"
            className="mario-btn"
            onClick={() => navigate('/profile/password')}
            style={styles.passwordButton}
          >
            🔐 Change Password
          </button>

          {/* Save */}
          <button
            id="profile-submit"
            type="submit"
            disabled={saving}
            className="mario-btn mario-btn-green"
            style={{
              width: '100%',
              marginTop: '8px',
              opacity: saving ? 0.7 : 1,
            }}
          >
            ⭐ Accept Profile Change
          </button>

        </form>
      </div>

      {/* Confirmation popup */}
      {showConfirm && (
        <div style={styles.overlay}>
          <div style={styles.confirmCard}>

            <div style={styles.confirmIcon}>
              ⚠️
            </div>

            <h2 style={styles.confirmTitle}>
              Confirm Profile Change
            </h2>

            <p style={styles.confirmText}>
              Are you sure you want to update your
              profile information?
            </p>

            <div style={styles.confirmButtons}>

              <button
                type="button"
                className="mario-btn"
                onClick={() => setShowConfirm(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="mario-btn mario-btn-green"
                onClick={confirmProfileChange}
                disabled={saving}
              >
                {saving
                  ? '🔄 Saving...'
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
// Reusable field
// ======================================================

function Field({
  id,
  name,
  label,
  type,
  autoComplete,
  value,
  onChange,
  error,
  disabled = false,
  helper,
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
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          ...styles.input,
          background: disabled
            ? '#E2E8F0'
            : 'var(--gray-light)',
          color: disabled
            ? '#64748B'
            : 'var(--dark-text)',
          cursor: disabled
            ? 'not-allowed'
            : 'text',
          borderColor: error
            ? 'var(--mario-red)'
            : 'var(--dark-text)',
        }}
      />

      {helper && (
        <span style={styles.helper}>
          🔒 {helper}
        </span>
      )}

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
    transition: 'box-shadow 0.15s ease',
    boxSizing: 'border-box',
    width: '100%',
  },

  helper: {
    fontSize: '0.78rem',
    color: '#64748B',
    fontWeight: 600,
  },

  fieldError: {
    fontSize: '0.82rem',
    color: 'var(--mario-red)',
    fontWeight: 600,
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

  passwordButton: {
    width: '100%',
    marginTop: '2px',
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
