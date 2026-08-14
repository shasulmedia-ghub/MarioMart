import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react';

const API_BASE = 'https://mm-api-virid.vercel.app';
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];

export default function AdminProduct() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Expand / collapse state for variants
  const [expandedRows, setExpandedRows] = useState({});

  // Product Edit Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    product_name: '',
    description: '',
    default_image: '',
    category_id: '',
    status: true,
  });
  const [productFormError, setProductFormError] = useState('');
  const [productSubmitting, setProductSubmitting] = useState(false);

  // Variant Edit Modal State
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({
    colour: '#000000',
    size: 'M',
    unit_price: '',
    stock_quantity: 0,
    image_url: '',
    new_arrival: false,
    status: true,
  });
  const [variantFormError, setVariantFormError] = useState('');
  const [variantSubmitting, setVariantSubmitting] = useState(false);

  // Add Variant Modal State (per Product)
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [addingVariantProduct, setAddingVariantProduct] = useState(null);
  const [addVariantHeader, setAddVariantHeader] = useState({
    colour: '#FF0000',
    image_url: '',
    new_arrival: true,
  });
  const [addVariantSizes, setAddVariantSizes] = useState(
    SIZES.map((size) => ({
      size,
      selected: false,
      quantity: '',
      price: '',
    }))
  );
  const [addVariantError, setAddVariantError] = useState('');
  const [addVariantSubmitting, setAddVariantSubmitting] = useState(false);

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
      const res = await fetch(`${API_BASE}/api/categories`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || data.categories || []);
        setCategories(list);
      }
    } catch (err) {
      console.warn('Error fetching categories:', err);
    }
  };

  const fetchProductsWithVariants = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/api/productsWithVariants`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || data.products || []);
      setProducts(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProductsWithVariants();
  }, []);

  const handleAddProduct = () => {
    navigate('/admin/newProduct');
  };

  const toggleExpand = (productId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // --- Product Edit Handlers ---
  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      product_name: product.product_name || '',
      description: product.description || '',
      default_image: product.default_image || '',
      category_id: product.category_id || (categories[0]?.id ? String(categories[0].id) : ''),
      status: Boolean(product.status),
    });
    setProductFormError('');
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductFormError('');
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.product_name.trim()) {
      setProductFormError('Product name is required.');
      return;
    }
    if (!productForm.category_id) {
      setProductFormError('Category is required.');
      return;
    }

    try {
      setProductSubmitting(true);
      setProductFormError('');

      const payload = {
        category_id: Number(productForm.category_id),
        product_name: productForm.product_name.trim(),
        description: productForm.description,
        default_image: productForm.default_image,
        status: Boolean(productForm.status),
      };
      const res = await fetch(`${API_BASE}/api/products/update/${editingProduct.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update product');
      }

      closeProductModal();
      fetchProductsWithVariants();
    } catch (err) {
      setProductFormError(err.message);
    } finally {
      setProductSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (product.is_in_use) return;

    const prodName = product.product_name || `Product #${product.id}`;
    if (!window.confirm(`Are you sure you want to delete product "${prodName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/products/${product.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete product');
      }

      fetchProductsWithVariants();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Variant Edit Handlers ---
  const openEditVariantModal = (variant) => {
    setEditingVariant(variant);
    setVariantForm({
      colour: variant.colour || '#000000',
      size: variant.size || 'M',
      unit_price: variant.unit_price || '',
      stock_quantity: variant.stock_quantity ?? 0,
      image_url: variant.image_url || '',
      new_arrival: Boolean(variant.new_arrival),
      status: Boolean(variant.status),
    });

    setVariantFormError('');
    setShowVariantModal(true);
  };

  const closeVariantModal = () => {
    setShowVariantModal(false);
    setEditingVariant(null);
    setVariantFormError('');
  };

  const isValidHex = (color) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

  const handleVariantSubmit = async (e) => {
    e.preventDefault();

    try {
      setVariantSubmitting(true);
      setVariantFormError('');

      const payload = {
        colour: variantForm.colour,
        size: variantForm.size,
        unit_price: variantForm.unit_price,
        stock_quantity: Number(variantForm.stock_quantity) || 0,
        image_url: variantForm.image_url,
        new_arrival: Boolean(variantForm.new_arrival),
        status: Boolean(variantForm.status),
      };

      const res = await fetch(`${API_BASE}/api/variants/${editingVariant.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update variant');
      }

      closeVariantModal();
      fetchProductsWithVariants();
    } catch (err) {
      setVariantFormError(err.message);
    } finally {
      setVariantSubmitting(false);
    }
  };

  const handleDeleteVariant = async (variant) => {
    if (variant.is_in_use) return;

    if (!window.confirm(`Are you sure you want to delete variant #${variant.id} (${variant.colour} - ${variant.size})?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/variants/${variant.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete variant');
      }

      fetchProductsWithVariants();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Add Variant Modal Handlers (per Product) ---
  const openAddVariantModal = (product) => {
    setAddingVariantProduct(product);
    setAddVariantHeader({
      colour: '#FF0000',
      image_url: '',
      new_arrival: true,
    });
    setAddVariantSizes(
      SIZES.map((size) => ({
        size,
        selected: false,
        quantity: '',
        price: '',
      }))
    );
    setAddVariantError('');
    setShowAddVariantModal(true);
  };

  const closeAddVariantModal = () => {
    setShowAddVariantModal(false);
    setAddingVariantProduct(null);
    setAddVariantError('');
    setAddVariantHeader({
      colour: '#FF0000',
      image_url: '',
      new_arrival: true,
    });
    setAddVariantSizes(
      SIZES.map((size) => ({
        size,
        selected: false,
        quantity: '',
        price: '',
      }))
    );
  };

  const handleToggleAddVariantSize = (size) => {
    setAddVariantSizes((prev) =>
      prev.map((r) => (r.size === size ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleAddVariantQuantityChange = (size, val) => {
    const sanitized = val.replace(/[^0-9]/g, '');
    setAddVariantSizes((prev) =>
      prev.map((r) => (r.size === size ? { ...r, quantity: sanitized } : r))
    );
  };

  const handleAddVariantPriceChange = (size, val) => {
    let sanitized = val.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    setAddVariantSizes((prev) =>
      prev.map((r) => (r.size === size ? { ...r, price: sanitized } : r))
    );
  };

  const handleSaveNewVariants = async (e) => {
    e.preventDefault();
    setAddVariantError('');

    if (!addVariantHeader.colour.trim()) {
      setAddVariantError('Colour is required.');
      return;
    }
    if (!addVariantHeader.image_url.trim()) {
      setAddVariantError('Image URL is required.');
      return;
    }

    const selectedRows = addVariantSizes.filter((r) => r.selected);
    if (selectedRows.length === 0) {
      setAddVariantError('Please select at least one size variant.');
      return;
    }

    for (const row of selectedRows) {
      if (!row.quantity || parseInt(row.quantity, 10) <= 0) {
        setAddVariantError(`Please enter a valid quantity greater than 0 for size ${row.size}.`);
        return;
      }
      if (!row.price || parseFloat(row.price) <= 0) {
        setAddVariantError(`Please enter a valid price greater than 0 for size ${row.size}.`);
        return;
      }
    }

    try {
      setAddVariantSubmitting(true);
      for (const row of selectedRows) {
        const payload = {
          product_id: addingVariantProduct.id,
          colour: addVariantHeader.colour.trim(),
          size: row.size,
          unit_price: Number(row.price),
          stock_quantity: parseInt(row.quantity, 10),
          image_url: addVariantHeader.image_url.trim(),
          new_arrival: true,
        };

        const res = await fetch(`${API_BASE}/api/variants`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.message || errData.error || `Failed to create variant for size ${row.size}`
          );
        }
      }

      closeAddVariantModal();
      fetchProductsWithVariants();
    } catch (err) {
      setAddVariantError(err.message);
    } finally {
      setAddVariantSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main style={{ flex: 1, marginBottom: '40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px' }}>
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <h2 className="section-title" style={{ margin: 0 }}>
              <span>📦</span> Product Management <span>⭐</span>
            </h2>
            <button
              className="mario-btn mario-btn-green"
              onClick={handleAddProduct}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={18} /> Add New Product
            </button>
          </div>

          {/* Loading / Error / Empty States */}
          {loading ? (
            <div
              style={{
                animation: 'pulse 1.2s infinite',
                textAlign: 'center',
                padding: '40px',
                fontSize: '1.5rem',
                fontFamily: 'var(--font-main)',
              }}
            >
              Loading products and variants...
            </div>
          ) : error ? (
            <div
              style={{
                background: '#FEE2E2',
                border: '3px solid var(--mario-red)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                color: 'var(--mario-red-dark)',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>❌</div>
              <div style={{ fontWeight: 700 }}>Failed to load products</div>
              <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>{error}</div>
            </div>
          ) : products.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: '#64748B',
                padding: '40px',
                border: '2px dashed var(--gray-border)',
                borderRadius: '14px',
                background: 'var(--cloud-white)',
                fontFamily: 'var(--font-main)',
              }}
            >
              No products found.
            </div>
          ) : (
            <div
              className="desktop-table-container"
              style={{
                overflowX: 'auto',
                background: 'var(--cloud-white)',
                padding: '0px',
                border: '4px solid var(--dark-text)',
                borderRadius: '20px',
                boxShadow: '0 6px 0 var(--dark-text)',
              }}
            >
              <table className="db-details-table" style={{ margin: 0, border: 'none', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}></th>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const isExpanded = Boolean(expandedRows[product.id]);
                    const variantsList = product.variants || [];

                    return (
                      <React.Fragment key={product.id}>
                        {/* Parent Product Row */}
                        <tr style={{ background: isExpanded ? '#FFFBEB' : 'inherit' }}>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => toggleExpand(product.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px',
                                color: 'var(--dark-text)',
                              }}
                              title={isExpanded ? 'Collapse variants' : 'Expand variants'}
                            >
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                          </td>
                          <td style={{ fontWeight: 700 }}>#{product.id}</td>
                          <td>
                            {product.default_image ? (
                              <img
                                src={product.default_image}
                                alt={product.product_name}
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  border: '2px solid var(--dark-text)',
                                  background: '#fff',
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '8px',
                                  border: '2px dashed #94A3B8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.65rem',
                                  color: '#94A3B8',
                                }}
                              >
                                No Img
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--dark-text)' }}>
                            {product.product_name || '-'}
                          </td>
                          <td
                            style={{
                              fontSize: '0.85rem',
                              color: '#475569',
                              maxWidth: '220px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={product.description}
                          >
                            {product.description || '-'}
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {product.category_name || '-'}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                            {formatDate(product.created_at)}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                            {formatDate(product.updated_at)}
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: product.status ? '#DCFCE7' : '#FEE2E2',
                                color: product.status ? '#166534' : '#991B1B',
                                border: `1px solid ${product.status ? '#86EFAC' : '#FCA5A5'}`,
                              }}
                            >
                              {product.status ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                              <button
                                title={product.status ? "Add Variant" : "Cannot add variant to inactive product"}
                                className="mario-btn mario-btn-green"
                                onClick={() => openAddVariantModal(product)}
                                disabled={!product.status}
                                style={{
                                  padding: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: product.status ? 1 : 0.45,
                                  cursor: product.status ? 'pointer' : 'not-allowed',
                                }}
                              >
                                <Plus size={14} />
                              </button>
                              <button
                                title="Edit Product"
                                className="mario-btn mario-btn-blue"
                                onClick={() => openEditProductModal(product)}
                                style={{
                                  padding: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                title={
                                  product.is_in_use
                                    ? 'Cannot delete product in use'
                                    : 'Delete Product'
                                }
                                className="mario-btn mario-btn-red"
                                onClick={() => handleDeleteProduct(product)}
                                disabled={Boolean(product.is_in_use)}
                                style={{
                                  padding: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: product.is_in_use ? 0.45 : 1,
                                  cursor: product.is_in_use ? 'not-allowed' : 'pointer',
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Collapsible Variants Row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={10} style={{ padding: '16px 20px', background: '#F8FAFC' }}>
                              <div
                                style={{
                                  border: '2px solid #CBD5E1',
                                  borderRadius: '12px',
                                  background: '#FFFFFF',
                                  padding: '16px',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px',
                                  }}
                                >
                                  <h4
                                    style={{
                                      margin: 0,
                                      fontFamily: 'var(--font-main)',
                                      fontSize: '0.95rem',
                                      color: 'var(--dark-text)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                    }}
                                  >
                                    <span>🎨</span> Variants ({variantsList.length})
                                  </h4>
                                </div>

                                {variantsList.length === 0 ? (
                                  <div
                                    style={{
                                      fontSize: '0.85rem',
                                      color: '#64748B',
                                      padding: '12px',
                                      textAlign: 'center',
                                      border: '1px dashed #CBD5E1',
                                      borderRadius: '8px',
                                    }}
                                  >
                                    No variants for this product.
                                  </div>
                                ) : (
                                  <div style={{ overflowX: 'auto' }}>
                                    <table
                                      className="db-details-table"
                                      style={{
                                        margin: 0,
                                        width: '100%',
                                        fontSize: '0.85rem',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                      }}
                                    >
                                      <thead>
                                        <tr style={{ background: '#F1F5F9' }}>
                                          <th>Variant ID</th>
                                          <th>Image</th>
                                          <th>Colour</th>
                                          <th>Size</th>
                                          <th>Unit Price</th>
                                          <th>Stock</th>
                                          <th>New Arrival</th>
                                          <th>Status</th>
                                          <th>Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {variantsList.map((variant) => (
                                          <tr key={variant.id}>
                                            <td style={{ fontWeight: 600 }}>#{variant.id}</td>
                                            <td>
                                              {variant.image_url ? (
                                                <img
                                                  src={variant.image_url}
                                                  alt={variant.colour}
                                                  style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    objectFit: 'cover',
                                                    borderRadius: '6px',
                                                    border: '1px solid #CBD5E1',
                                                    background: '#fff',
                                                  }}
                                                  onError={(e) => {
                                                    e.target.style.display = 'none';
                                                  }}
                                                />
                                              ) : (
                                                <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>-</span>
                                              )}
                                            </td>
                                            <td>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span
                                                  style={{
                                                    display: 'inline-block',
                                                    width: '14px',
                                                    height: '14px',
                                                    borderRadius: '50%',
                                                    background: variant.colour || '#ccc',
                                                    border: '1px solid #64748B',
                                                  }}
                                                />
                                                <span>{variant.colour || '-'}</span>
                                              </div>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{variant.size || '-'}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--dark-text)' }}>
                                              ${Number(variant.unit_price || 0).toFixed(2)}
                                            </td>
                                            <td>{variant.stock_quantity ?? 0}</td>
                                            <td>
                                              <span
                                                style={{
                                                  display: 'inline-block',
                                                  padding: '2px 6px',
                                                  borderRadius: '8px',
                                                  fontSize: '0.7rem',
                                                  fontWeight: 600,
                                                  background: variant.new_arrival ? '#FEF3C7' : '#F1F5F9',
                                                  color: variant.new_arrival ? '#92400E' : '#64748B',
                                                }}
                                              >
                                                {variant.new_arrival ? 'Yes' : 'No'}
                                              </span>
                                            </td>
                                            <td>
                                              <span
                                                style={{
                                                  display: 'inline-block',
                                                  padding: '2px 6px',
                                                  borderRadius: '8px',
                                                  fontSize: '0.7rem',
                                                  fontWeight: 600,
                                                  background: variant.status ? '#DCFCE7' : '#FEE2E2',
                                                  color: variant.status ? '#166534' : '#991B1B',
                                                }}
                                              >
                                                {variant.status ? 'Active' : 'Inactive'}
                                              </span>
                                            </td>
                                            <td>
                                              <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                  title="Edit Variant"
                                                  className="mario-btn mario-btn-blue"
                                                  onClick={() => openEditVariantModal(variant)}
                                                  style={{
                                                    padding: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                  }}
                                                >
                                                  <Edit size={12} />
                                                </button>
                                                <button
                                                  title={
                                                    variant.is_in_use
                                                      ? 'Cannot delete variant in use'
                                                      : 'Delete Variant'
                                                  }
                                                  className="mario-btn mario-btn-red"
                                                  onClick={() => handleDeleteVariant(variant)}
                                                  disabled={Boolean(variant.is_in_use)}
                                                  style={{
                                                    padding: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    opacity: variant.is_in_use ? 0.45 : 1,
                                                    cursor: variant.is_in_use ? 'not-allowed' : 'pointer',
                                                  }}
                                                >
                                                  <Trash2 size={12} />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* PRODUCT EDIT MODAL */}
      {showProductModal && editingProduct && (
        <div className="modal-overlay" onClick={closeProductModal}>
          <div
            className="modal-content"
            style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" type="button" onClick={closeProductModal}>
              <X size={16} />
            </button>

            <div className="modal-header-section">
              <div className="modal-title-area">
                <h3 className="modal-title">Edit Product #{editingProduct.id}</h3>
              </div>
            </div>

            {productFormError && (
              <div
                style={{
                  background: '#FEE2E2',
                  border: '2px solid var(--mario-red)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: 'var(--mario-red-dark)',
                  marginBottom: '16px',
                  fontWeight: 'bold',
                }}
              >
                ❌ {productFormError}
              </div>
            )}

            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                  Product Name *
                </label>
                <input
                  className="search-input"
                  type="text"
                  value={productForm.product_name}
                  onChange={(e) => setProductForm({ ...productForm, product_name: e.target.value })}
                  placeholder="e.g. Manchester United Jersey"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                  Category *
                </label>
                <select
                  className="search-input"
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name || cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                  Description
                </label>
                <textarea
                  className="search-input"
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Product description..."
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                  Default Image URL
                </label>
                <input
                  className="search-input"
                  type="text"
                  value={productForm.default_image}
                  onChange={(e) => setProductForm({ ...productForm, default_image: e.target.value })}
                  placeholder="/image/product/item.jpg or https://..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="product_status"
                  checked={productForm.status}
                  onChange={(e) => setProductForm({ ...productForm, status: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="product_status" style={{ fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Active Status
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="mario-btn mario-btn-red" onClick={closeProductModal}>
                  Cancel
                </button>
                <button type="submit" className="mario-btn mario-btn-green" disabled={productSubmitting}>
                  {productSubmitting ? 'Saving...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VARIANT EDIT MODAL */}
      {showVariantModal && editingVariant && (
        <div className="modal-overlay" onClick={closeVariantModal}>
          <div
            className="modal-content"
            style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" type="button" onClick={closeVariantModal}>
              <X size={16} />
            </button>

            <div className="modal-header-section">
              <div className="modal-title-area">
                <h3 className="modal-title">Edit Variant #{editingVariant.id}</h3>
              </div>
            </div>

            {variantFormError && (
              <div
                style={{
                  background: '#FEE2E2',
                  border: '2px solid var(--mario-red)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: 'var(--mario-red-dark)',
                  marginBottom: '16px',
                  fontWeight: 'bold',
                }}
              >
                ❌ {variantFormError}
              </div>
            )}

            <form onSubmit={handleVariantSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Colour Field with Picker & Text Input */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                  Colour
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={isValidHex(variantForm.colour) ? variantForm.colour : '#000000'}
                    onChange={(e) => setVariantForm({ ...variantForm, colour: e.target.value })}
                    style={{
                      width: '44px',
                      height: '40px',
                      padding: 0,
                      border: '2px solid var(--dark-text)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                    title="Pick a color"
                  />
                  <input
                    className="search-input"
                    type="text"
                    value={variantForm.colour}
                    onChange={(e) => setVariantForm({ ...variantForm, colour: e.target.value })}
                    placeholder="e.g. Red or #FF0000"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* Size Select */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                  Size
                </label>
                <select
                  className="search-input"
                  value={variantForm.size}
                  onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {SIZES.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                    Unit Price ($)
                  </label>
                  <input
                    className="search-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={variantForm.unit_price}
                    onChange={(e) => setVariantForm({ ...variantForm, unit_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                    Stock Quantity
                  </label>
                  <input
                    className="search-input"
                    type="number"
                    min="0"
                    value={variantForm.stock_quantity}
                    onChange={(e) => setVariantForm({ ...variantForm, stock_quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                  Image URL
                </label>
                <input
                  className="search-input"
                  type="text"
                  value={variantForm.image_url}
                  onChange={(e) => setVariantForm({ ...variantForm, image_url: e.target.value })}
                  placeholder="/product_image/variant.jpg or https://..."
                />
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="variant_new_arrival"
                    checked={variantForm.new_arrival}
                    onChange={(e) => setVariantForm({ ...variantForm, new_arrival: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="variant_new_arrival" style={{ fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem', cursor: 'pointer' }}>
                    New Arrival
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="variant_status"
                    checked={variantForm.status}
                    onChange={(e) => setVariantForm({ ...variantForm, status: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="variant_status" style={{ fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem', cursor: 'pointer' }}>
                    Active
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="mario-btn mario-btn-red" onClick={closeVariantModal}>
                  Cancel
                </button>
                <button type="submit" className="mario-btn mario-btn-green" disabled={variantSubmitting}>
                  {variantSubmitting ? 'Saving...' : 'Update Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD VARIANT MODAL (PER PRODUCT) */}
      {showAddVariantModal && addingVariantProduct && (
        <div className="modal-overlay" onClick={closeAddVariantModal}>
          <div
            className="modal-content"
            style={{ maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" type="button" onClick={closeAddVariantModal}>
              <X size={16} />
            </button>

            <div className="modal-header-section">
              <div className="modal-title-area">
                <h3 className="modal-title">
                  Add Variants to {addingVariantProduct.product_name} (#{addingVariantProduct.id})
                </h3>
              </div>
            </div>

            {addVariantError && (
              <div
                style={{
                  background: '#FEE2E2',
                  border: '2px solid var(--mario-red)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: 'var(--mario-red-dark)',
                  marginBottom: '16px',
                  fontWeight: 'bold',
                }}
              >
                ❌ {addVariantError}
              </div>
            )}

            <form onSubmit={handleSaveNewVariants} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Colour */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                  Colour *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={isValidHex(addVariantHeader.colour) ? addVariantHeader.colour : '#FF0000'}
                    onChange={(e) => setAddVariantHeader({ ...addVariantHeader, colour: e.target.value })}
                    style={{
                      width: '44px',
                      height: '40px',
                      padding: 0,
                      border: '2px solid var(--dark-text)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                    title="Pick a color"
                  />
                  <input
                    className="search-input"
                    type="text"
                    value={addVariantHeader.colour}
                    onChange={(e) => setAddVariantHeader({ ...addVariantHeader, colour: e.target.value })}
                    placeholder="e.g. #FF0000 or Red"
                    required
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                  Image URL *
                </label>
                <input
                  className="search-input"
                  type="text"
                  value={addVariantHeader.image_url}
                  onChange={(e) => setAddVariantHeader({ ...addVariantHeader, image_url: e.target.value })}
                  placeholder="/product_image/variant.jpg or https://..."
                  required
                />
              </div>

              {/* New Arrival Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="modal_new_arrival"
                  checked={addVariantHeader.new_arrival}
                  disabled
                  style={{ width: '18px', height: '18px', cursor: 'not-allowed' }}
                />
                <label
                  htmlFor="modal_new_arrival"
                  style={{ fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem', color: '#64748B' }}
                >
                  New Arrival (Default: True)
                </label>
              </div>

              {/* Sizes Table */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                  Sizes *
                </label>
                <div
                  className="desktop-table-container"
                  style={{
                    overflowX: 'auto',
                    border: '2px solid var(--dark-text)',
                    borderRadius: '10px',
                    background: '#fff',
                  }}
                >
                  <table className="db-details-table" style={{ margin: 0, width: '100%', border: 'none', fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '50px', textAlign: 'center' }}>Select</th>
                        <th>Size</th>
                        <th>Quantity</th>
                        <th>Unit Price ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addVariantSizes.map((row) => (
                        <tr
                          key={row.size}
                          style={{
                            background: row.selected ? '#FEFCE8' : 'inherit',
                          }}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={row.selected}
                              onChange={() => handleToggleAddVariantSize(row.size)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--dark-text)' }}>
                            {row.size}
                          </td>
                          <td>
                            <input
                              className="search-input"
                              type="text"
                              inputMode="numeric"
                              disabled={!row.selected}
                              value={row.quantity}
                              onChange={(e) => handleAddVariantQuantityChange(row.size, e.target.value)}
                              placeholder={row.selected ? 'e.g. 10' : 'Disabled'}
                              style={{
                                width: '100%',
                                maxWidth: '120px',
                                padding: '4px 8px',
                                opacity: row.selected ? 1 : 0.5,
                                background: row.selected ? '#fff' : '#F1F5F9',
                              }}
                            />
                          </td>
                          <td>
                            <input
                              className="search-input"
                              type="text"
                              inputMode="decimal"
                              disabled={!row.selected}
                              value={row.price}
                              onChange={(e) => handleAddVariantPriceChange(row.size, e.target.value)}
                              placeholder={row.selected ? 'e.g. 29.90' : 'Disabled'}
                              style={{
                                width: '100%',
                                maxWidth: '120px',
                                padding: '4px 8px',
                                opacity: row.selected ? 1 : 0.5,
                                background: row.selected ? '#fff' : '#F1F5F9',
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="mario-btn mario-btn-red" onClick={closeAddVariantModal}>
                  Close
                </button>
                <button type="submit" className="mario-btn mario-btn-green" disabled={addVariantSubmitting}>
                  {addVariantSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
