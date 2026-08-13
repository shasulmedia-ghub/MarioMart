import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Edit, Trash2 } from 'lucide-react';

const API_BASE = 'https://mm-api-virid.vercel.app';

export default function AdminCat() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form, setForm] = useState({
    category_name: '',
    category_code: '',
    description: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getHeaders = () => {
    const currentToken = token || localStorage.getItem('mm_token');
    const headers = { 'Content-Type': 'application/json' };
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }
    return headers;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/api/categories`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || data.categories || []);
      setCategories(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCat(null);
    setForm({ category_name: '', slug: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCat(cat);
    setForm({
      category_name: cat.category_name || cat.name || '',
      slug: cat.slug || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCat(null);
    setFormError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.category_name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      const isEdit = Boolean(editingCat);
      const url = isEdit
        ? `${API_BASE}/api/categories/${editingCat.id}`
        : `${API_BASE}/api/categories`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        categoryName: form.category_name.trim(),
        slug: form.slug.trim() ? form.slug.trim().toLowerCase().replace(/\s+/g, '-') : form.category_name.trim().toLowerCase().replace(/\s+/g, '-'),
      };

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to ${isEdit ? 'update' : 'create'} category`);
      }

      closeModal();
      fetchCategories();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    const catName = cat.category_name || cat.name || `Category #${cat.id}`;
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/categories/${cat.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete category');
      }

      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main style={{ flex: 1, marginBottom: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              <span>🏷️</span> Category Management <span>⭐</span>
            </h2>
            <button className="mario-btn mario-btn-green" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} /> Add New Category
            </button>
          </div>

          {loading ? (
            <div style={{ animation: 'pulse 1.2s infinite', textAlign: 'center', padding: '40px', fontSize: '1.5rem', fontFamily: 'var(--font-main)' }}>Loading categories...</div>
          ) : error ? (
            <div style={{ background: '#FEE2E2', border: '3px solid var(--mario-red)', borderRadius: '16px', padding: '20px', textAlign: 'center', color: 'var(--mario-red-dark)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>❌</div>
              <div style={{ fontWeight: 700 }}>Failed to load categories</div>
              <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>{error}</div>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748B', padding: '40px', border: '2px dashed var(--gray-border)', borderRadius: '14px', background: 'var(--cloud-white)', fontFamily: 'var(--font-main)' }}>
              No categories found.
            </div>
          ) : (
            <div className="desktop-table-container" style={{ overflowX: 'auto', background: 'var(--cloud-white)', padding: '0px', border: '4px solid var(--dark-text)', borderRadius: '20px', boxShadow: '0 6px 0 var(--dark-text)' }}>
              <table className="db-details-table" style={{ margin: 0, border: 'none' }}>
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Slug</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => {
                    const catName = cat.category_name || cat.name || '-';
                    const catSlug = cat.slug || cat.code || cat.slug || '';
                    //const displayName = catCode ? `${catCode} (${catName})` : catName;

                    return (
                      <tr key={cat.id}>
                        <td style={{ fontWeight: 700 }}>
                          <span style={{ color: 'var(--dark-text)' }}>{catName}</span>
                        </td>
                        <td style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {catSlug}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              title="Edit Category"
                              className="mario-btn mario-btn-blue"
                              onClick={() => openEditModal(cat)}
                              style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              title="Delete Category"
                              className="mario-btn mario-btn-red"
                              onClick={() => handleDelete(cat)}
                              style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

      <Footer />

      {/* Modal for Add / Edit Category */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={closeModal}>X</button>
            <div className="modal-header-section">
              <div className="modal-title-area">
                <h3 className="modal-title">{editingCat ? 'Edit Category' : 'Add New Category'}</h3>
              </div>
            </div>

            {formError && (
              <div style={{ background: '#FEE2E2', border: '2px solid var(--mario-red)', borderRadius: '10px', padding: '10px', color: 'var(--mario-red-dark)', marginBottom: '16px', fontWeight: 'bold' }}>
                ❌ {formError}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>Category Name *</label>
                <input
                  className="search-input"
                  type="text"
                  value={form.category_name}
                  onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                  placeholder="e.g. T-Shirts"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>Slug</label>
                <input
                  className="search-input"
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. t-shirts"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="mario-btn mario-btn-red" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="mario-btn mario-btn-green" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingCat ? 'Update Category' : 'Save Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
