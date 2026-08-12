import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoSrc from '../assets/mm_logo/mariomart_logo.jpg';

export default function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Which dropdown is open: null | 'profile' | 'admin' | 'sales'
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  // Close any open dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggle = (menu) => setOpenMenu((prev) => (prev === menu ? null : menu));
  const close  = () => setOpenMenu(null);

  const handleLogout = () => {
    close();
    logout();
    navigate('/');
  };

  return (
    <header className="mario-header" ref={navRef}>
      {/* ── LEFT: Logo + Brand ─────────────────────────────── */}
      <Link
        to="/"
        className="mario-brand"
        style={{ textDecoration: 'none', gap: '12px' }}
        onClick={close}
      >
        <img
          src={logoSrc}
          alt="MarioMart logo"
          style={{
            height: '48px',
            width: '48px',
            objectFit: 'cover',
            borderRadius: '10px',
            border: '2px solid var(--dark-text)',
            boxShadow: '0 3px 0 var(--mario-red-dark)',
            flexShrink: 0,
          }}
        />
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{ fontFamily: 'var(--font-retro)', fontSize: '1rem', color: 'var(--mario-yellow)', textShadow: '2px 2px 0 var(--mario-red-dark)' }}>
            MarioMart
          </span>
          <span style={{ fontFamily: 'var(--font-main)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', fontWeight: 400, letterSpacing: '0.3px' }}>
            For the Super Shoppers!
          </span>
        </span>
      </Link>

      {/* ── RIGHT: Conditional nav items ───────────────────── */}
      <nav className="mario-nav" style={{ position: 'relative' }}>
        {!isAuthenticated ? (
          /* ── Logged out ── */
          <>
            <Link to="/login"    className="mario-nav-link" onClick={close} style={{ textDecoration: 'none' }}>Login</Link>
            <Link to="/register" className="mario-nav-link" onClick={close} style={{ textDecoration: 'none' }}>Register</Link>
          </>
        ) : role === 'customer' ? (
          /* ── Customer ── */
          <>
            <Link
              to="/cart"
              className="cart-button"
              onClick={() => {
                close();
              }}
              style={{ textDecoration: 'none' }}
              aria-label="View shopping cart"
            >
              <span>🛒</span> Cart
            </Link>
            <Link
              to="/orders"
              className="mario-nav-link"
              onClick={() => {
                close();
              }}
              style={{ textDecoration: 'none' }}
            >
              📋 Orders
            </Link>
            <ProfileDropdown openMenu={openMenu} toggle={toggle} close={close} handleLogout={handleLogout} />
          </>
        ) : role === 'admin' ? (
          /* ── Admin ── */
          <>
            {/* Admin dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => toggle('admin')}
                className="mario-nav-link"
                aria-haspopup="true"
                aria-expanded={openMenu === 'admin'}
                style={{ background: 'none', border: 'none', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: openMenu === 'admin' ? 'var(--mario-yellow)' : 'var(--cloud-white)' }}
              >
                🛡️ Admin <span style={{ fontSize: '0.7em' }}>▾</span>
              </button>
              {openMenu === 'admin' && (
                <DropdownMenu
                  items={[
                    { label: 'Category', to: '/admin/category' },
                    { label: 'Product',  to: '/admin/product'  },
                    { label: 'User',     to: '/admin/user'     },
                  ]}
                  onClose={close}
                />
              )}
            </div>

            {/* Sales dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => toggle('sales')}
                className="mario-nav-link"
                aria-haspopup="true"
                aria-expanded={openMenu === 'sales'}
                style={{ background: 'none', border: 'none', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: openMenu === 'sales' ? 'var(--mario-yellow)' : 'var(--cloud-white)' }}
              >
                📊 Sales <span style={{ fontSize: '0.7em' }}>▾</span>
              </button>
              {openMenu === 'sales' && (
                <DropdownMenu
                  items={[
                    { label: 'Dashboard',   to: '/admin/dashboard'   },
                    { label: 'Fulfillment', to: '/admin/fulfillment' },
                  ]}
                  onClose={close}
                />
              )}
            </div>

            <ProfileDropdown openMenu={openMenu} toggle={toggle} close={close} handleLogout={handleLogout} />
          </>
        ) : null}
      </nav>
    </header>
  );
}

/* ── Shared profile icon + dropdown ─────────────────────────────────────── */
function ProfileDropdown({ openMenu, toggle, close, handleLogout }) {
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => toggle('profile')}
        aria-haspopup="true"
        aria-expanded={openMenu === 'profile'}
        aria-label="User profile menu"
        style={{ background: 'none', border: '2px solid var(--mario-yellow)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'var(--mario-yellow)', transition: 'transform 0.1s ease' }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        👤
      </button>
      {openMenu === 'profile' && (
        <DropdownMenu
          items={[
            { label: 'Update Profile', to: '/profile' },
            { label: 'Logout', onClick: handleLogout },
          ]}
          onClose={close}
        />
      )}
    </div>
  );
}

/* ── Generic dropdown list ───────────────────────────────────────────────── */
function DropdownMenu({ items, onClose }) {
  return (
    <ul
      role="menu"
      style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: '160px', background: 'var(--cloud-white)', border: '3px solid var(--dark-text)', borderRadius: '12px', boxShadow: '0 6px 0 var(--dark-text)', listStyle: 'none', margin: 0, padding: '6px 0', zIndex: 200 }}
    >
      {items.map((item) => (
        <li key={item.label} role="none">
          {item.to ? (
            <Link
              to={item.to}
              role="menuitem"
              onClick={onClose}
              style={{ display: 'block', padding: '10px 16px', fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--dark-text)', textDecoration: 'none', borderRadius: '6px', margin: '2px 4px' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sky-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {item.label}
            </Link>
          ) : (
            <button
              role="menuitem"
              onClick={item.onClick}
              style={{ display: 'block', width: '100%', padding: '10px 16px', fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--mario-red)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px', margin: '2px 4px', boxSizing: 'border-box' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sky-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {item.label}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
