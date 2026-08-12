import React, { useState } from 'react';

export default function AdminData({ products, setProducts, categories, setCategories }) {
  const [activeTab, setActiveTab] = useState('products');

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    product_name: '',
    category_id: '',
    description: '',
    default_image: null, // 👈 Holds the actual file object selected by the admin
    unit_price: '',          // 👈 Variant Unit Price
    stock_quantity: '50',    // 👈 Variant Stock Quantity
    size: '',                // 👈 Optional Variant Size
    colour: '',              // 👈 Optional Variant Colour
    field: '',               // 👈 Optional Variant Field
    variant_id: '0'          // 👈 Optional Variant ID
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  // ==================== PRODUCT CRUD HANDLERS ====================
  
  // const handleOpenAddProduct = () => {
  
  // }; replace with the following
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    
    // Extract the unique database ID property if categories have fetched,
    // otherwise fallback to an empty string "" so it stays controlled!
    const defaultCategoryId = categories && categories.length > 0
      ? (typeof categories[0] === 'object' ? categories[0].id : categories[0])
      : '';

    setProductForm({
      product_name: '',
      category_id: defaultCategoryId, // 👈 Guaranteed to be a defined string or ID number
      unit_price: '',
      description: '',
      default_image: null, // 👈 Reset to null on add
      stock_quantity: '50',
      size: '',
      colour: '',
      field: '',
      variant_id: '0'
    });
    setShowProductModal(true);
  };


  const handleOpenEditProduct = (product) => {
    setEditingProduct(product.id);
    
    // Extract the raw string/integer identifier key if nested object is passed
    const currentCategoryId = product.category_id && typeof product.category_id === 'object'
      ? product.category_id.id
      : product.category_id;

      const resolvedPrice = product.price !== undefined && product.price !== null 
      ? product.price 
      : (product.unit_price !== undefined && product.unit_price !== null 
          ? product.unit_price 
          : (product.unit_price !== undefined && product.unit_price !== null ? product.unit_price : ''));

    setProductForm({
      product_name: product.product_name,
      category_id: currentCategoryId || '',
      unit_price: resolvedPrice, // 👈 Ensures current price is populated
      description: product.description,
      default_image: null, // 👈 Null by default during edit unless a new file is chosen
      stock_quantity: product.stock_quantity !== undefined && product.stock_quantity !== null 
        ? product.stock_quantity 
        : (product.stock_quantity !== undefined ? product.stock_quantity : 50),
      size: product.size || '',
      colour: product.colour || '',
      field: product.field || '',
      variant_id: product.variant_id || '0'
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    const qty = parseInt(productForm.stock_quantity) || 0;
    let status = 'in';
    if (qty <= 0) status = 'out';
    else if (qty <= 10) status = 'low';

    // 💡 Auto-generate alphanumeric filename if a new file was uploaded
    let finalDefaultImageUrl = productForm.default_image;
    if (productForm.default_image && typeof productForm.default_image === 'object') {
      const fileExtension = productForm.default_image.name.split('.').pop() || 'jpg';
      const randomAlphanumeric = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      finalDefaultImageUrl = `/assets/products/${randomAlphanumeric}.${fileExtension}`;
    }

    // ✅ FIXED: Corrected category_id pointer assignment typo
    // ✅ Match backend database variant schema requirements
    const productPayload = {
      product_name: productForm.product_name,
      description: productForm.description,
      default_image: finalDefaultImageUrl, // 👈 Uses the newly generated auto filename path
      category_id: productForm.category_id, 
      unit_price: parseFloat(productForm.unit_price) || 0,
      stock_quantity: qty,
      stock_status: status,
      size: productForm.size || '',
      colour: productForm.colour || '',
      field: productForm.field || '',
      variant_id: productForm.variant_id || '0'
    };

    if (editingProduct) {
      // UPDATE Product in database
      try {
        const res = await fetch(`https://mm-api-virid.vercel.app/api/products/${editingProduct}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productPayload)
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API update failed: ${errorText}`);
        }

        const updatedFromServer = await res.json();
        
        setProducts(prev => prev.map(p => p.id === editingProduct ? updatedFromServer : p));
        alert("Product updated successfully!");
      } catch (err) {
        console.warn("DB Update failed, falling back locally:", err.message);
        setProducts(prev => prev.map(p => p.id === editingProduct ? { 
          ...p, 
          ...productForm, 
          default_image: finalDefaultImageUrl,
          unit_price: parseFloat(productForm.unit_price).toFixed(2),
          stock_quantity: qty,
          stock_status: status
        } : p));
      }
    } else {
      
  try {
        const res = await fetch('https://mm-api-virid.vercel.app/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productPayload)
        });
        
        // ✅ FIXED: Read and log the exact error message from the backend server
        if (!res.ok) {
          const errorText = await res.text();
          console.error("🔴 SERVER ERROR:", errorText); // 👈 Check your browser console for this output!
          throw new Error(`API save failed: ${errorText}`);
        }
        
        const created = await res.json();
        
        // ✅ FIXED: Push the clean database product object (with real dynamic IDs) back to your state
        setProducts(prev => [created, ...prev]);
        alert("Product has been added successfully");
      } catch (err) {
        console.warn("DB Create failed, falling back locally:", err.message);
        const newProduct = {
          id: Date.now(),
          ...productForm,
          default_image: finalDefaultImageUrl,
          unit_price: parseFloat(productForm.unit_price).toFixed(2),
          stock_quantity: qty,
          stock_status: status
        };
        setProducts(prev => [newProduct, ...prev]);
        alert("Product added locally (offline mode)");
      }
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`https://mm-api-virid.vercel.app/api/products/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('API delete failed');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.warn("DB Delete failed, deleting locally:", err.message);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // ==================== CATEGORY CRUD HANDLERS ====================

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat) => {
    // 💡 FIXED: Extract the raw ID if an object is passed, ensuring editingCategory is just the ID
    const catId = cat && typeof cat === 'object' ? cat.id : cat;
    setEditingCategory(catId);
    setCategoryName(typeof cat === 'object' ? cat.category_name : cat);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const computedSlug = categoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    if (editingCategory) {
      // ✅ UPDATE Category
      try {
        const res = await fetch(`https://mm-api-virid.vercel.app/api/categories/${editingCategory}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            categoryName: categoryName, 
            slug: computedSlug
          })
        });
        
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API update failed: ${errText}`);
        }
        
        const updatedCat = await res.json();
        
        setCategories(prev => prev.map(c => (typeof c === 'object' ? c.id === editingCategory : c === editingCategory) ? updatedCat : c));
        alert("Category updated successfully in database!");
      } catch (err) {
        console.error("Category update failed on DB:", err.message);
        alert(`Could not update category: ${err.message}`);
        return;
      }
    } else {
      // ➕ CREATE Category
      try {
        const res = await fetch('https://mm-api-virid.vercel.app/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            categoryName: categoryName, 
            slug: computedSlug         
          })
        });
        
        if (!res.ok) {
          const errFeedback = await res.text();
          throw new Error(`Server feedback rejection payload: ${errFeedback}`);
        }
        
        const newCategoryObj = await res.json();
        setCategories(prev => [...prev, newCategoryObj]);
        setCategoryName(''); 
        alert("Category saved successfully to database!");

      } catch (err) {
        console.warn("Category storage hook rejected payload, saving fallback mock:", err.message);
        setCategories(prev => [...prev, { id: Date.now(), category_name: categoryName }]);
      }
    }
    setShowCategoryModal(false);
  };



  const handleDeleteCategory = async (catToDelete) => {
    const isObj = catToDelete && typeof catToDelete === 'object';
    const displayTitle = isObj ? catToDelete.category_name : catToDelete;
    // 💡 FIXED: Safely extract the target ID number/string
    const targetId = isObj ? catToDelete.id : catToDelete;

    if (!window.confirm(`Delete category "${displayTitle}"? Products in this category will be unassigned.`)) return;

    if (targetId) {
      try {
        const res = await fetch(`https://mm-api-virid.vercel.app/api/categories/${targetId}`, {
          method: 'DELETE'
        });
        
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API delete failed: ${errText}`);
        }
        
        // Successfully deleted from database, now update state
        setCategories(prev => prev.filter(c => (typeof c === 'object' ? c.id !== targetId : c !== targetId)));
        setProducts(prev => prev.map(p => {
          const isTarget = typeof p.category_id === 'object' ? p.category_id?.id === targetId : p.category_id === targetId;
          return isTarget ? { ...p, category_id: 'Unassigned' } : p;
        }));
        
        alert("Category deleted successfully from database!");
        return;
      } catch (err) {
        console.error("DB Category delete request failed:", err.message);
        alert(`Could not delete from database: ${err.message}`);
        return; 
      }
    }

    // Local fallback mechanism loop block if data object IDs do not exist
    setCategories(prev => prev.filter(c => c !== catToDelete));
    setProducts(prev => prev.map(p => p.category_id === catToDelete ? { ...p, category_id: 'Unassigned' } : p));
  };


  return (
    <div className="app-container">
      {/* Header */}
      <header className="mario-header">
        <div className="mario-brand">
          <span>🛠️</span> ADMIN CONTROL PANEL
        </div>
        <div className="mario-nav">
          <button 
            className={`mario-btn ${activeTab === 'products' ? 'mario-btn-yellow' : ''}`}
            onClick={() => setActiveTab('products')}
            style={{ fontSize: '0.65rem' }}
          >
            Manage Products
          </button>
          <button 
            className={`mario-btn ${activeTab === 'categories' ? 'mario-btn-yellow' : ''}`}
            onClick={() => setActiveTab('categories')}
            style={{ fontSize: '0.65rem' }}
          >
            Manage Categories
          </button>
        </div>
      </header>

      {/* ==================== PRODUCTS MANAGEMENT VIEW ==================== */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>🍄 Product Catalog Management</h2>
            <button className="mario-btn mario-btn-green" onClick={handleOpenAddProduct}>
              + Add Product
            </button>
          </div>

          <div style={{ background: 'var(--cloud-white)', border: '3px solid var(--dark-text)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 0 var(--dark-text)' }}>
            <table className="db-details-table" style={{ margin: 0, border: 'none' }}>
              <thead>
                <tr>
                  <th>Image & Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>No products found in database.</td>
                  </tr>
                ) : (
                  products.map(product => {
                    // 💡 FIXED: Resolve category name dynamically from categories list or object structure
                    const resolvedCategoryName = (() => {
                      // 1. If the joined backend query already provided category_name, use it immediately!
                      if (product.category_name) {
                        return product.category_name;
                      }
                      
                      // 2. If category_id is populated as a nested object
                      if (product.category_id && typeof product.category_id === 'object') {
                        return product.category_id.category_name || "Unassigned";
                      }
                      
                      // 3. Otherwise, search through your categories state array by ID
                      const matchedCat = categories.find(c => 
                        (typeof c === 'object' && String(c.id) === String(product.category_id)) || 
                        String(c) === String(product.category_id)
                      );
                      
                      if (matchedCat) {
                        return typeof matchedCat === 'object' ? matchedCat.category_name : matchedCat;
                      }
                      return product.category_name || "Unassigned";
                    })();

                    return (
                      <tr key={product.id}>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          {product.default_image ? (
                            <img 
                              src={product.default_image.startsWith('http') || product.default_image.startsWith('/') 
                                ? product.default_image 
                                : `/uploads/products/${product.default_image}`} 
                              alt={product.product_name || 'Product Image'} 
                              style={{ 
                                maxWidth: '300px', 
                                maxHeight: '400px', 
                                width: 'auto', 
                                height: 'auto', 
                                objectFit: 'contain',
                                borderRadius: '4px',
                                display: 'block'
                              }} 
                            />
                          ) : (
                            <span style={{ color: '#888', fontStyle: 'italic' }}>No Image</span>
                          )}
                        </td>
                        <td>
                          <span className="product-badge" style={{ position: 'static' }}>
                            {resolvedCategoryName}
                          </span>
                        </td>
                        <td>
                          <span className="product-price" style={{ fontSize: '0.7rem' }}>
                            ${product.price !== undefined && product.price !== null ? product.price : (product.unit_price || '0.00')}
                          </span>
                        </td>
                        <td>
                          <span className={`stock-badge ${product.stock_status === 'in' ? 'stock-in' : product.stock_status === 'low' ? 'stock-low' : 'stock-out'}`} style={{ fontSize: '0.7rem' }}>
                            {product.stock_status ? product.stock_status.toUpperCase() : 'UNKNOWN'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', height: '100%', padding: '0 12px' }}>
                          {/* 2. WRAPPED buttons in a flex container div */}
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            <button className="mario-btn mario-btn-yellow" style={{ padding: '6px 10px', fontSize: '0.55rem' }} onClick={() => handleOpenEditProduct(product)}>
                              Edit
                            </button>
                            <button className="mario-btn mario-btn-red" style={{ padding: '6px 10px', fontSize: '0.55rem' }} onClick={() => handleDeleteProduct(product.id)}>
                              Delete
                            </button>
                            </div>
                          </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== CATEGORIES MANAGEMENT VIEW ==================== */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>🏷️ Category Management</h2>
            <button className="mario-btn mario-btn-green" onClick={handleOpenAddCategory}>
              + Add Category
            </button>
          </div>

          <div style={{ background: 'var(--cloud-white)', border: '3px solid var(--dark-text)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 0 var(--dark-text)' }}>
            <table className="db-details-table" style={{ margin: 0, border: 'none' }}>
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Associated Products Count</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* {categories.map((cat, index) => {
                  */}
                {/* replace this block with below */}
                {categories.map((cat, index) => {
                  // 1. Safely extract the display name and unique database matching properties
                  const isObj = cat && typeof cat === 'object';
                  const categoryLabel = isObj ? cat.category_name : cat;
                  const categoryIdToMatch = isObj ? cat.id : cat;

                  // 2. Fix the product count logic to match either objects or string IDs
                  const count = products.filter(p => {
                    if (!p.category_id) return false;
                    
                    // If product.category_id is an object, compare its ID
                    if (typeof p.category_id === 'object') {
                      return String(p.category_id.id) === String(categoryIdToMatch);
                    }
                    // If product.category_id is a plain string/ID, compare directly
                    return String(p.category_id) === String(categoryIdToMatch);
                  }).length;

                  return (
                    <tr key={isObj ? cat.id : index}>
                      {/* ✅ FIXED: Renders the categoryLabel string instead of the raw object */}
                      <td><strong>{categoryLabel}</strong></td>
                      <td>{count} product(s)</td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle', height: '100%', padding: '0 12px' }}>
                        {/* 💡 FIXED: Uses an inner flex container matching the cell height cleanly */}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '45px' }}>
                          <button 
                            className="mario-btn mario-btn-yellow" 
                            style={{ padding: '6px 10px', fontSize: '0.55rem' }} 
                            onClick={() => handleOpenEditCategory(cat)}
                          >
                            Edit
                          </button>
                          <button 
                            className="mario-btn mario-btn-red" 
                            style={{ padding: '6px 10px', fontSize: '0.55rem' }} 
                            onClick={() => handleDeleteCategory(cat)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== PRODUCT MODAL (CREATE / UPDATE) ==================== */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={() => setShowProductModal(false)}>X</button>
            <h3 className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Product Name:</label>
                <input 
                  type="text" 
                  required
                  value={productForm.product_name} 
                  onChange={e => setProductForm({ ...productForm, product_name: e.target.value })}
                  className="search-input" 
                  placeholder="e.g. Super Star" 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Price ($):</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0" 
                    required
                    value={productForm.unit_price}
                    onChange={e => setProductForm({ ...productForm, unit_price: e.target.value })}
                    className="search-input" 
                    placeholder="19.99" 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Upload Product Image (jpeg/png)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        // Store file object for upload and simulated folder path string for display/payload
                        const folderPath = `/assets/products/${file.name}`;
                        setProductForm({ 
                          ...productForm, 
                          default_image: file,
                          default_image: folderPath 
                        });
                      }
                    }}
                    className="search-input" 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Category:</label>
                  <select 
                    value={productForm.category_id} 
                    onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="sort-select"
                    style={{ width: '100%' }}
                  >
                    {categories.map((cat, i) => {
                      // Extract values using the exact keys from your API: id and category_name
                      const categoryValue = typeof cat === 'object' ? (cat.category_name || cat.id) : cat;
                      const categoryLabel = typeof cat === 'object' ? cat.category_name : cat;

                      return (
                        <option key={cat.id || i} value={categoryValue}>
                          {categoryLabel}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Stock Quantity:</label>
                  <input 
                    type="number" 
                    step="1" 
                    min="0"
                    required
                    value={productForm.stock_quantity} 
                    onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    className="search-input" 
                    placeholder="10" 
                  />
                </div>
              </div>
              {/* ==================== VARIANT FIELDS (Size, Colour, New Arrival) ==================== */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Size:</label>
                  <input 
                    type="text" 
                    value={productForm.size || ''} 
                    onChange={e => setProductForm({ ...productForm, size: e.target.value })}
                    className="search-input" 
                    placeholder="e.g. M, L, 42" 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Colour:</label>
                  <input 
                    type="text" 
                    value={productForm.colour || ''} 
                    onChange={e => setProductForm({ ...productForm, colour: e.target.value })}
                    className="search-input" 
                    placeholder="e.g. Red, Blue" 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="new_arrival_checkbox"
                  checked={!!productForm.new_arrival} 
                  onChange={e => setProductForm({ ...productForm, new_arrival: e.target.checked })}
                />
                <label htmlFor="new_arrival_checkbox" style={{ fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Mark as New Arrival
                </label>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Description:</label>
                <textarea 
                  required
                  rows="3"
                  value={productForm.description} 
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="search-input" 
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <button type="submit" className="mario-btn mario-btn-green" style={{ marginTop: '10px' }}>
                {editingProduct ? 'Update Product in DB' : 'Save Product to DB'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CATEGORY MODAL (CREATE / UPDATE) ==================== */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={() => setShowCategoryModal(false)}>X</button>
            <h3 className="modal-title">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Category Name:</label>
                <input 
                  type="text" 
                  required
                  value={categoryName} 
                  onChange={e => setCategoryName(e.target.value)}
                  className="search-input" 
                  placeholder="e.g. Costumes" 
                />
              </div>

              <button type="submit" className="mario-btn mario-btn-green" style={{ marginTop: '10px' }}>
                {editingCategory ? 'Update Category' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}