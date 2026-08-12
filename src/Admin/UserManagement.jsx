import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { UserCheck, UserX, KeyRound } from 'lucide-react';

const API_BASE = 'https://mm-api-virid.vercel.app';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  
  const [resetForm, setResetForm] = useState({ password: '', confirmPassword: '' });
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.account_status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountStatus: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, account_status: newStatus } : u));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    if (addForm.password !== addForm.confirmPassword) {
      return setAddError('Passwords do not match');
    }
    setAddLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: addForm.firstName,
          lastName: addForm.lastName,
          email: addForm.email,
          password: addForm.password,
          role: 'admin'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to add user');
      
      setShowAddModal(false);
      setAddForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
      fetchUsers();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    if (resetForm.password !== resetForm.confirmPassword) {
      return setResetError('Passwords do not match');
    }
    setResetLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/${targetUser.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetForm.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to reset password');
      
      setShowResetModal(false);
      setResetForm({ password: '', confirmPassword: '' });
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const openResetModal = (user) => {
    setTargetUser(user);
    setResetForm({ password: '', confirmPassword: '' });
    setResetError('');
    setShowResetModal(true);
  };

  return (
    <div className="app-container">
      <Navbar />
      
      <main style={{ flex: 1, marginBottom: '40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              <span>👥</span> User Management <span>⭐</span>
            </h2>
            <button className="mario-btn mario-btn-green" onClick={() => setShowAddModal(true)}>
              + Add Admin User
            </button>
          </div>

          {loading ? (
            <div style={{ animation: 'pulse 1.2s infinite', textAlign: 'center', padding: '40px', fontSize: '1.5rem' }}>Loading users...</div>
          ) : error ? (
            <div style={{ background: '#FEE2E2', border: '3px solid var(--mario-red)', borderRadius: '16px', padding: '20px', textAlign: 'center', color: 'var(--mario-red-dark)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>❌</div>
              <div style={{ fontWeight: 700 }}>Failed to load users</div>
              <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>{error}</div>
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748B', padding: '40px', border: '2px dashed var(--gray-border)', borderRadius: '14px', background: 'var(--cloud-white)' }}>
              No users found.
            </div>
          ) : (
            <>
              <div className="desktop-table-container" style={{ overflowX: 'auto', background: 'var(--cloud-white)', padding: '24px', border: '4px solid var(--dark-text)', borderRadius: '20px', boxShadow: '0 8px 0 var(--dark-text)' }}>
                <table className="db-details-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--mario-blue)' }}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={`stock-badge ${u.account_status === 'active' ? 'stock-in' : 'stock-out'}`}>
                            {u.account_status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {u.account_status === 'active' ? (
                              <button 
                                title="Deactivate"
                                className="mario-btn mario-btn-red"
                                onClick={() => handleToggleStatus(u)}
                                style={{ padding: '6px 12px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <UserX size={14} /> Deactivate
                              </button>
                            ) : (
                              <button 
                                title="Activate"
                                className="mario-btn mario-btn-green"
                                onClick={() => handleToggleStatus(u)}
                                style={{ padding: '6px 12px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <UserCheck size={14} /> Activate
                              </button>
                            )}
                            <button
                              title="Reset Password"
                              className="mario-btn mario-btn-yellow"
                              onClick={() => openResetModal(u)}
                              disabled={u.account_status !== 'active'}
                              style={{ padding: '6px 12px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px', opacity: u.account_status !== 'active' ? 0.5 : 1 }}
                            >
                              <KeyRound size={14} /> Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-cards-container product-grid">
                {users.map((u) => (
                  <div key={u.id} className="product-card">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px', color: 'var(--dark-text)' }}>{u.first_name} {u.last_name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '12px' }}>{u.email}</div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--mario-blue)' }}>
                          {u.role}
                        </span>
                        <span className={`stock-badge ${u.account_status === 'active' ? 'stock-in' : 'stock-out'}`}>
                          {u.account_status}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', borderTop: '2px solid var(--gray-border)', paddingTop: '12px' }}>
                      {u.account_status === 'active' ? (
                        <button 
                          title="Deactivate"
                          className="mario-btn mario-btn-red"
                          onClick={() => handleToggleStatus(u)}
                          style={{ padding: '8px', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                          <UserX size={16} />
                        </button>
                      ) : (
                        <button 
                          title="Activate"
                          className="mario-btn mario-btn-green"
                          onClick={() => handleToggleStatus(u)}
                          style={{ padding: '8px', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                          <UserCheck size={16} />
                        </button>
                      )}
                      <button
                        title="Reset Password"
                        className="mario-btn mario-btn-yellow"
                        onClick={() => openResetModal(u)}
                        disabled={u.account_status !== 'active'}
                        style={{ padding: '8px', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: u.account_status !== 'active' ? 0.5 : 1 }}
                      >
                        <KeyRound size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={() => setShowAddModal(false)}>X</button>
            <div className="modal-header-section">
              <div className="modal-title-area">
                <h3 className="modal-title">Add Admin User</h3>
              </div>
            </div>
            {addError && <div style={{ background: '#FEE2E2', border: '2px solid var(--mario-red)', borderRadius: '10px', padding: '10px', color: 'var(--mario-red-dark)', marginBottom: '16px', fontWeight: 'bold' }}>❌ {addError}</div>}
            
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>First Name</label>
                  <input className="search-input" value={addForm.firstName} onChange={e => setAddForm({...addForm, firstName: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>Last Name</label>
                  <input className="search-input" value={addForm.lastName} onChange={e => setAddForm({...addForm, lastName: e.target.value})} required />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>Email</label>
                <input className="search-input" type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} required />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>Role</label>
                <input className="search-input" type="text" value="admin" readOnly style={{ backgroundColor: 'var(--gray-border)', color: '#64748B' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>Password</label>
                <input className="search-input" type="password" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} required />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>Confirm Password</label>
                <input className="search-input" type="password" value={addForm.confirmPassword} onChange={e => setAddForm({...addForm, confirmPassword: e.target.value})} required />
              </div>
              
              <button type="submit" className="mario-btn mario-btn-green" disabled={addLoading} style={{ marginTop: '10px' }}>
                {addLoading ? 'Adding...' : 'Add User'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={() => setShowResetModal(false)}>X</button>
            <div className="modal-header-section">
              <div className="modal-title-area">
                <h3 className="modal-title">Reset Password</h3>
                <p style={{ fontFamily: 'var(--font-main)', color: '#64748B', margin: 0, fontWeight: 600 }}>
                  For: {targetUser?.first_name} {targetUser?.last_name}
                </p>
              </div>
            </div>
            {resetError && <div style={{ background: '#FEE2E2', border: '2px solid var(--mario-red)', borderRadius: '10px', padding: '10px', color: 'var(--mario-red-dark)', marginBottom: '16px', fontWeight: 'bold' }}>❌ {resetError}</div>}
            
            <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>New Password</label>
                <input className="search-input" type="password" value={resetForm.password} onChange={e => setResetForm({...resetForm, password: e.target.value})} required />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>Confirm New Password</label>
                <input className="search-input" type="password" value={resetForm.confirmPassword} onChange={e => setResetForm({...resetForm, confirmPassword: e.target.value})} required />
              </div>
              
              <button type="submit" className="mario-btn mario-btn-yellow" disabled={resetLoading} style={{ marginTop: '10px' }}>
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
        .desktop-table-container { display: block; }
        .mobile-cards-container { display: none; }
        @media (max-width: 768px) {
          .desktop-table-container { display: none; }
          .mobile-cards-container { display: grid; }
        }
      `}</style>
    </div>
  );
}