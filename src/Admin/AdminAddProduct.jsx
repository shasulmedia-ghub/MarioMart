import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Check, AlertCircle, Upload } from 'lucide-react';

const API_BASE = 'https://mm-api-virid.vercel.app';
const FIXED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];

export default function AdminAddProduct() {
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Product Header State
  const [productForm, setProductForm] = useState({
    category_id: '',
    product_name: '',
    description: '',
    default_image: '',
  });

  // Variant Header State
  const [variantHeader, setVariantHeader] = useState({
    colour: '#FF0000',
    image_url: '',
    new_arrival: true,
  });

  // Size Rows State
  const [sizeRows, setSizeRows] = useState(
    FIXED_SIZES.map((size) => ({
      size,
      selected: false,
      quantity: '',
      price: '',
    }))
  );

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Image Upload State
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
      setLoadingCategories(true);
      const res = await fetch(`${API_BASE}/api/categories`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || data.categories || [];
        setCategories(list);
      }
    } catch (err) {
      console.warn('Failed to fetch categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const isValidHex = (color) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

  // Size Row Handlers
  const handleToggleSelect = (size) => {
    setSizeRows((prev) =>
      prev.map((r) => (r.size === size ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleQuantityChange = (size, val) => {
    const sanitized = val.replace(/[^0-9]/g, '');
    setSizeRows((prev) =>
      prev.map((r) => (r.size === size ? { ...r, quantity: sanitized } : r))
    );
  };

  const handlePriceChange = (size, val) => {
    let sanitized = val.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    setSizeRows((prev) =>
      prev.map((r) => (r.size === size ? { ...r, price: sanitized } : r))
    );
  };

  const handledefaultImageUpload = async (fileToUpload) => {
    const file = fileToUpload || selectedFile;
    if (!file) {
      fileInputRef.current?.click();
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingImage(true);
      setUploadError('');

      let res = await fetch('/api/upload.js', {
        method: 'POST',
        body: formData,
      });

      if (res.status === 404) {
        res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
      }

      const data = await res.json();
      if (res.ok && data.url) {
        setProductForm((prev) => ({ ...prev, default_image: data.url }));
        setUploadError('');
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setProductForm({
      category_id: '',
      product_name: '',
      description: '',
      default_image: '',
    });
    setVariantHeader({
      colour: '#FF0000',
      image_url: '',
      new_arrival: true,
    });
    setSizeRows(
      FIXED_SIZES.map((size) => ({
        size,
        selected: false,
        quantity: '',
        price: '',
      }))
    );
    setSelectedFile(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // 1. Validate Product Header
    if (!productForm.category_id) {
      setErrorMessage('Please select a category.');
      return;
    }
    if (!productForm.product_name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }
    if (!productForm.description.trim()) {
      setErrorMessage('Description is required.');
      return;
    }
    if (!productForm.default_image.trim()) {
      setErrorMessage('Default image URL is required.');
      return;
    }

    // 2. Validate Variant Header
    if (!variantHeader.colour.trim()) {
      setErrorMessage('Colour is required.');
      return;
    }
    if (!variantHeader.image_url.trim()) {
      setErrorMessage('Variant image URL is required.');
      return;
    }

    // 3. Validate Size Rows
    const selectedRows = sizeRows.filter((r) => r.selected);
    if (selectedRows.length === 0) {
      setErrorMessage('Please select at least one size variant to create.');
      return;
    }

    for (const row of selectedRows) {
      if (!row.quantity || parseInt(row.quantity, 10) <= 0) {
        setErrorMessage(`Please enter a valid quantity greater than 0 for size ${row.size}.`);
        return;
      }
      if (!row.price || parseFloat(row.price) <= 0) {
        setErrorMessage(`Please enter a valid price greater than 0 for size ${row.size}.`);
        return;
      }
    }

    try {
      setSubmitting(true);

      // Step 1: Create Product
      const productPayload = {
        category_id: Number(productForm.category_id),
        product_name: productForm.product_name.trim(),
        description: productForm.description.trim(),
        default_image: productForm.default_image.trim(),
      };

      const productRes = await fetch(`${API_BASE}/api/productsOnly`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(productPayload),
      });

      if (!productRes.ok) {
        const errData = await productRes.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to create product');
      }

      const createdProduct = await productRes.json();
      const productId = createdProduct.id || createdProduct.product_id || createdProduct.data?.id;

      if (!productId) {
        throw new Error('Created product ID not returned from server');
      }

      // Step 2: Create Variants for all selected sizes
      for (const row of selectedRows) {
        const variantPayload = {
          product_id: productId,
          colour: variantHeader.colour.trim(),
          size: row.size,
          unit_price: Number(row.price),
          stock_quantity: parseInt(row.quantity, 10),
          image_url: variantHeader.image_url.trim(),
          new_arrival: true,
        };

        const variantRes = await fetch(`${API_BASE}/api/variants`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(variantPayload),
        });

        if (!variantRes.ok) {
          const errData = await variantRes.json().catch(() => ({}));
          throw new Error(
            errData.error || errData.message || `Failed to create variant for size ${row.size}`
          );
        }
      }

      // Step 3: Success
      setSuccessMessage('Product and variants saved successfully!');
      resetForm();
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while saving the product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main style={{ flex: 1, marginBottom: '40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              <span>✨</span> Add New Product <span>🍄</span>
            </h2>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div
              style={{
                background: '#DCFCE7',
                border: '3px solid #16A34A',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '20px',
                color: '#166534',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontFamily: 'var(--font-main)',
              }}
            >
              <Check size={20} /> {successMessage}
            </div>
          )}

          {/* Error Notification */}
          {errorMessage && (
            <div
              style={{
                background: '#FEE2E2',
                border: '3px solid var(--mario-red)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '20px',
                color: 'var(--mario-red-dark)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontFamily: 'var(--font-main)',
              }}
            >
              <AlertCircle size={20} /> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* ── PRODUCT DETAILS SECTION ────────────────────────── */}
            <div
              style={{
                background: 'var(--cloud-white)',
                border: '4px solid var(--dark-text)',
                borderRadius: '18px',
                boxShadow: '0 6px 0 var(--dark-text)',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <h3
                style={{
                  margin: '0 0 18px 0',
                  fontFamily: 'var(--font-main)',
                  fontSize: '1.2rem',
                  color: 'var(--dark-text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '2px dashed var(--gray-border)',
                  paddingBottom: '10px',
                }}
              >
                <span>📦</span> Product Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {/* Category */}
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
                      disabled={loadingCategories}
                    >
                      <option value="" disabled>
                        {loadingCategories ? 'Loading categories...' : 'Select Category'}
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.category_name || cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product Name */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                      Product Name *
                    </label>
                    <input
                      className="search-input"
                      type="text"
                      value={productForm.product_name}
                      onChange={(e) => setProductForm({ ...productForm, product_name: e.target.value })}
                      placeholder="e.g. Mario Classic T-Shirt"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                    Description *
                  </label>
                  <textarea
                    className="search-input"
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Enter product description..."
                    required
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                {/* Default Image URL */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                    Default Image URL *
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      className="search-input"
                      type="text"
                      value={productForm.default_image}
                      onChange={(e) => setProductForm({ ...productForm, default_image: e.target.value })}
                      placeholder="/image/product/mario-shirt.jpg or https://..."
                      required
                      style={{ flex: 1 }}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          handledefaultImageUpload(file);
                        }
                      }}
                    />
                    <button
                      type="button"
                      title="Upload Image"
                      className="mario-btn mario-btn-blue"
                      onClick={() => {
                        if (selectedFile) {
                          handledefaultImageUpload(selectedFile);
                        } else {
                          fileInputRef.current?.click();
                        }
                      }}
                      disabled={uploadingImage}
                      style={{
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Upload size={16} />
                    </button>
                  </div>

                  {selectedFile && (
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                      Selected: {selectedFile.name} {uploadingImage && '(Uploading...)'}
                    </div>
                  )}

                  {uploadError && (
                    <div style={{ color: 'var(--mario-red-dark)', fontSize: '0.85rem', marginTop: '4px', fontWeight: 'bold' }}>
                      ❌ {uploadError}
                    </div>
                  )}

                  {productForm.default_image && (
                    <div style={{ marginTop: '8px' }}>
                      <img
                        src={productForm.default_image}
                        alt="Thumbnail preview"
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
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── VARIANT & SIZES SECTION ───────────────────────── */}
            <div
              style={{
                background: 'var(--cloud-white)',
                border: '4px solid var(--dark-text)',
                borderRadius: '18px',
                boxShadow: '0 6px 0 var(--dark-text)',
                padding: '24px',
                marginBottom: '28px',
              }}
            >
              <h3
                style={{
                  margin: '0 0 18px 0',
                  fontFamily: 'var(--font-main)',
                  fontSize: '1.2rem',
                  color: 'var(--dark-text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '2px dashed var(--gray-border)',
                  paddingBottom: '10px',
                }}
              >
                <span>🎨</span> Variant & Sizing Setup
              </h3>

              {/* Variant Header Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {/* Colour */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                    Colour *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={isValidHex(variantHeader.colour) ? variantHeader.colour : '#FF0000'}
                      onChange={(e) => setVariantHeader({ ...variantHeader, colour: e.target.value })}
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
                      value={variantHeader.colour}
                      onChange={(e) => setVariantHeader({ ...variantHeader, colour: e.target.value })}
                      placeholder="e.g. #FF0000 or Red"
                      required
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                {/* Variant Image URL */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem' }}>
                    Variant Image URL *
                  </label>
                  <input
                    className="search-input"
                    type="text"
                    value={variantHeader.image_url}
                    onChange={(e) => setVariantHeader({ ...variantHeader, image_url: e.target.value })}
                    placeholder="/product_image/mario-red.jpg or https://..."
                    required
                  />
                </div>

                {/* New Arrival Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '28px' }}>
                  <input
                    type="checkbox"
                    id="add_new_arrival"
                    checked={variantHeader.new_arrival}
                    disabled
                    style={{ width: '20px', height: '20px', cursor: 'not-allowed' }}
                  />
                  <label
                    htmlFor="add_new_arrival"
                    style={{ fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.9rem', color: '#64748B' }}
                  >
                    New Arrival
                  </label>
                </div>
              </div>

              {/* Sizes Table */}
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontFamily: 'var(--font-main)', fontSize: '0.95rem' }}>
                  Select Sizes to Create *
                </label>

                <div
                  className="desktop-table-container"
                  style={{
                    overflowX: 'auto',
                    border: '2px solid var(--dark-text)',
                    borderRadius: '12px',
                    background: '#fff',
                  }}
                >
                  <table className="db-details-table" style={{ margin: 0, width: '100%', border: 'none' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>Select</th>
                        <th>Size</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeRows.map((row) => (
                        <tr
                          key={row.size}
                          style={{
                            background: row.selected ? '#FEFCE8' : 'inherit',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={row.selected}
                              onChange={() => handleToggleSelect(row.size)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
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
                              onChange={(e) => handleQuantityChange(row.size, e.target.value)}
                              placeholder={row.selected ? 'e.g. 10' : 'Disabled'}
                              style={{
                                width: '100%',
                                maxWidth: '160px',
                                padding: '6px 10px',
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
                              onChange={(e) => handlePriceChange(row.size, e.target.value)}
                              placeholder={row.selected ? 'e.g. 29.90' : 'Disabled'}
                              style={{
                                width: '100%',
                                maxWidth: '160px',
                                padding: '6px 10px',
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
            </div>

            {/* ── ACTION BUTTONS ─────────────────────────────────── */}
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="mario-btn mario-btn-red"
                onClick={resetForm}
                disabled={submitting}
              >
                Reset
              </button>
              <button
                type="submit"
                className="mario-btn mario-btn-green"
                disabled={submitting}
                style={{ minWidth: '160px' }}
              >
                {submitting ? 'Saving Product...' : '💾 Save Product'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
