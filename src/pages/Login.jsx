import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import mmlogo from '../assets/mm_logo/mariomart_logo.jpg'
import "../App.css";

const API_LOGIN = 'https://mm-api-virid.vercel.app/api/users/login';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname ?? '/';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(API_LOGIN, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? data?.error ?? 'Login failed. Please check your credentials.');
        return;
      }

      // Support common token field shapes
      const token = data.token ?? data.accessToken ?? data.access_token ?? null;
      if (!token) {
        setError('Login succeeded but no token was returned. Please contact support.');
        return;
      }

      // Decode token to build user object
      let decoded = {};
      try { decoded = jwtDecode(token); } catch { /* ignore */ }

      const user = {
        id:    decoded.id    ?? decoded.userId ?? decoded.sub ?? data.user?.id    ?? null,
        name:  data.user.firstName + ' ' + data.user.lastName,
        email: data.user.email,
        role:  decoded.role  ?? decoded.userRole ?? data.user?.role ?? 'customer',
      };

      login(token, user);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/', { replace: true });
    } catch (err) {
      setError('Network error. Please try again.');
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
          <h1 style={styles.title}>Welcome Back!</h1>
          <p style={styles.subtitle}>Log in to your MarioMart account</p>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox} role="alert">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="login-email" style={styles.label}>Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="mario@mushroom.kingdom"
              style={styles.input}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 3px var(--mario-blue-light)')}
              onBlur={(e)  => (e.target.style.boxShadow = 'none')}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="login-password" style={styles.label}>Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={styles.input}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 3px var(--mario-blue-light)')}
              onBlur={(e)  => (e.target.style.boxShadow = 'none')}
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="mario-btn mario-btn-red"
            style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '🔄 Logging in…' : '🍄 Login'}
          </button>
        </form>

        {/* Footer link */}
        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
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
    maxWidth: '420px',
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
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
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
