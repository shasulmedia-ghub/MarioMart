import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'https://mm-api-virid.vercel.app';

export default function Profile() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [profile,    setProfile]    = useState(null);
  const [form,       setForm]       = useState(null);
  const [editMode,   setEditMode]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [apiError,   setApiError]   = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  // ── Fetch profile on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`${API_BASE}/api/users/${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // API may return an array (getUsers) or a single object
        const row = Array.isArray(data) ? data[0] : data;
        setProfile(row);
        setForm(toForm(row));
      })
      .catch(() => setApiError('Failed to load profile. Please try again.'))
      .finally(() => setLoading(false));
  }, [user?.id, token]);

  // Map API snake_case → form camelCase
  function toForm(row) {
    if (!row) return null;
    return {
      firstName:      row.first_name       ?? '',
      lastName:       row.last_name        ?? '',
      dateOfBirth:    row.date_of_birth    ? row.date_of_birth.slice(0, 10) : '',
      gender:         row.gender           ?? '',
      address:        row.address          ?? '',
      marketingOptIn: Boolean(row.marketing_opt_in),
    };
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setApiError('');
    setApiSuccess('');
  };

  const handleEdit = () => {
    setApiError('');
    setApiSuccess('');
    setEditMode(true);
  };

  const handleCancel = () => {
    setForm(toForm(profile));
    setApiError('');
    setApiSuccess('');
    setEditMode(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setApiError('');
    setApiSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method:  'PUT',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName:      form.firstName,
          lastName:       form.lastName,
          dateOfBirth:    form.dateOfBirth,
          gender:         form.gender,
          address:        form.address,
          marketingOptIn: form.marketingOptIn,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setApiError(data?.message ?? data?.error ?? 'Failed to update profile. Please try again.');
        return;
      }

      // Merge updated values back into profile state
      setProfile((prev) => ({
        ...prev,
        first_name:       form.firstName,
        last_name:        form.lastName,
        date_of_birth:    form.dateOfBirth,
        gender:           form.gender,
        address:          form.address,
        marketing_opt_in: form.marketingOptIn,
      }));
      setApiSuccess('✅ Profile updated successfully!');
      setEditMode(false);
    } catch {
      setApiError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render helpers ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-retro)', fontSize: '0.9rem' }}>
            🍄 Loading profile…
          </p>
        </div>
      </div>
    );
  }

  if (!profile && apiError) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.errorBox} role="alert">❌ {apiError}</div>
          <button
            className="mario-btn mario-btn-yellow"
            style={{ width: '100%' }}
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Close button */}
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
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>
            {editMode ? 'Update your details below' : 'Your MarioMart account info'}
          </p>
        </div>

        {/* Feedback banners */}
        {apiError && (
          <div style={styles.errorBox} role="alert">❌ {apiError}</div>
        )}
        {apiSuccess && (
          <div style={styles.successBox} role="status">{apiSuccess}</div>
        )}

        {/* Fields */}
        <div style={styles.form}>
          <ReadEditField
            id="prof-firstName" name="firstName" label="First Name"
            type="text" value={form.firstName}
            editMode={editMode} onChange={handleChange}
          />
          <ReadEditField
            id="prof-lastName" name="lastName" label="Last Name"
            type="text" value={form.lastName}
            editMode={editMode} onChange={handleChange}
          />
          <ReadEditField
            id="prof-dob" name="dateOfBirth" label="Date of Birth"
            type="date" value={form.dateOfBirth}
            editMode={editMode} onChange={handleChange}
          />

          {/* Gender — select in edit, text in read */}
          <div style={styles.field}>
            <label htmlFor="prof-gender" style={styles.label}>Gender</label>
            {editMode ? (
              <select
                id="prof-gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={styles.input}
                onFocus={(e) => (e.target.style.boxShadow = '0 0 0 3px var(--mario-blue-light)')}
                onBlur={(e)  => (e.target.style.boxShadow = 'none')}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <span style={styles.readValue}>{form.gender || '—'}</span>
            )}
          </div>

          {/* Address — textarea in edit, text in read */}
          <div style={styles.field}>
            <label htmlFor="prof-address" style={styles.label}>Address</label>
            {editMode ? (
              <textarea
                id="prof-address"
                name="address"
                rows={3}
                value={form.address}
                onChange={handleChange}
                style={{ ...styles.input, resize: 'vertical' }}
                onFocus={(e) => (e.target.style.boxShadow = '0 0 0 3px var(--mario-blue-light)')}
                onBlur={(e)  => (e.target.style.boxShadow = 'none')}
              />
            ) : (
              <span style={styles.readValue}>{form.address || '—'}</span>
            )}
          </div>

          {/* Marketing opt-in */}
          <div style={styles.toggleField}>
            <label style={styles.label}>Marketing Opt-In</label>
            {editMode ? (
              <label style={styles.toggleSwitch}>
                <input
                  id="prof-marketingOptIn"
                  name="marketingOptIn"
                  type="checkbox"
                  checked={form.marketingOptIn}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                <span style={{ ...styles.toggleTrack, background: form.marketingOptIn ? '#22C55E' : '#CBD5E1' }}>
                  <span style={{ ...styles.toggleThumb, transform: form.marketingOptIn ? 'translateX(20px)' : 'translateX(0px)' }} />
                </span>
              </label>
            ) : (
              <span style={{ ...styles.readValue, fontWeight: 700, color: form.marketingOptIn ? '#16A34A' : '#64748B' }}>
                {form.marketingOptIn ? 'Yes' : 'No'}
              </span>
            )}
          </div>

          {/* Role — always read-only */}
          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <span style={{ ...styles.readValue, textTransform: 'capitalize' }}>
              {profile?.role ?? '—'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
          {editMode ? (
            <>
              <button
                id="prof-cancel"
                type="button"
                className="mario-btn mario-btn-yellow"
                style={{ flex: 1 }}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                id="prof-save"
                type="button"
                className="mario-btn mario-btn-green"
                style={{ flex: 1, opacity: saving ? 0.7 : 1 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '🔄 Saving…' : '💾 Save'}
              </button>
            </>
          ) : (
            <button
              id="prof-edit"
              type="button"
              className="mario-btn mario-btn-green"
              style={{ width: '100%' }}
              onClick={handleEdit}
            >
              ✏️ Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Read / Edit text field ──────────────────────────────────────────────── */
function ReadEditField({ id, name, label, type, value, editMode, onChange }) {
  return (
    <div style={styles.field}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      {editMode ? (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          style={styles.input}
          onFocus={(e) => (e.target.style.boxShadow = '0 0 0 3px var(--mario-blue-light)')}
          onBlur={(e)  => (e.target.style.boxShadow = 'none')}
        />
      ) : (
        <span style={styles.readValue}>{value || '—'}</span>
      )}
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
  readValue: {
    padding: '10px 14px',
    fontFamily: 'var(--font-main)',
    fontSize: '1rem',
    color: 'var(--dark-text)',
    background: 'var(--sky-bg)',
    border: '2px solid var(--gray-border, #CBD5E1)',
    borderRadius: '12px',
    display: 'block',
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
};
