import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Modern clean fallback map layout tracker if any values are missing strings
const CATEGORIES_DISPLAY_NAMES = {
  'Power-Up': 'Power-ups',
  'Invincibility': 'Items & Weapons',
  'Gear': 'Outfits & Suits'
};

function UserProducts({ onAddToCart = () => {} }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ ADDED: State to hold database categories
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch data from your backend API on component mount
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        // 1. Fetch products from database
        const prodResponse = await fetch('https://mm-api-virid.vercel.app/api/products');
        if (!prodResponse.ok) throw new Error('Failed to fetch shop products');
        const prodData = await prodResponse.json();
        setProducts(prodData);
        
        // 2. ✅ ADDED: Fetch live categories from database for matching lookups
        const catResponse = await fetch('https://mm-api-virid.vercel.app/api/categories');
        if (catResponse.ok) {
          const catData = await catResponse.json();
          setCategories(catData);
        }

        // Map inventory structures safely
        const mappedInventory = prodData.map(item => ({
          product_id: item.id,
          stock_quantity: item.stock_quantity !== undefined ? item.stock_quantity : 15,
          updated_at: item.inventory_updated_at || item.updated_at
        }));
        setInventory(mappedInventory);
      } catch (err) {
        console.error("Database connection error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, []);

  const getProductStockRecord = (productId) => {
    return inventory.find(item => item.product_id === productId) || {
      product_id: productId,
      stock_quantity: 15,
      updated_at: new Date().toISOString()
    };
  };

  const getProductStockQuantity = (productId) => {
    return getProductStockRecord(productId).stock_quantity;
  };

  const getStockDetails = (qty) => {
    if (qty === 0) return { className: 'stock-out', label: 'OUT OF STOCK' };
    if (qty === 1) return { className: 'stock-low', label: 'LAST ITEM LEFT!' };
    if (qty < 10) return { className: 'stock-low', label: 'LOW STOCK (< 10 LEFT)' };
    return { className: 'stock-in', label: 'IN STOCK' };
  };

  // Filter and sort products using dynamic properties state data
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== null) {
      result = result.filter(p => {
        if (!p.category_id) return false;
        
        const catName = typeof p.category_id === 'object' 
          ? p.category_id.category_name 
          : p.category_id;
          
        const catId = typeof p.category_id === 'object' ? p.category_id.id : p.category_id;

        return String(catId) === String(selectedCategory) || 
               String(catName).toLowerCase() === String(selectedCategory).toLowerCase();
      });
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.product_name || '').toLowerCase().includes(q) || 
        (p.description || '').toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'price-desc': return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        case 'name-asc': return (a.product_name || '').localeCompare(b.product_name || '');
        case 'name-desc': return (b.product_name || '').localeCompare(b.product_name || '');
        case 'date-desc': return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        default: return 0;
      }
    });

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return <div className="no-results" style={{ textAlign: 'center', padding: '50px' }}>Loading items from database...</div>;
  }

  return (
    <div className="products-section">
      <h2 className="section-title">
        <span>⭐</span> MarioMart Item Shop <span>⭐</span>
      </h2>

      {/* Controls: Search, Sort and Category Filters */}
      <div className="controls-container">
        <div className="search-sort-row">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search items by name or description..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name-asc">Sort by: Name (A-Z)</option>
            <option value="name-desc">Sort by: Name (Z-A)</option>
            <option value="price-asc">Sort by: Price (Low to High)</option>
            <option value="price-desc">Sort by: Price (High to Low)</option>
            <option value="date-desc">Sort by: Newest Arrivals</option>
          </select>
        </div>

        <div className="category-filters">
          <button
            className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All Items
          </button>
          <button
            className={`category-btn ${selectedCategory === 'Power-Up' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('Power-Up')}
          >
            Power-ups
          </button>
          <button
            className={`category-btn ${selectedCategory === 'Invincibility' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('Invincibility')}
          >
            Items & Weapons
          </button>
          <button
            className={`category-btn ${selectedCategory === 'Gear' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('Gear')}
          >
            Outfits & Suits
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => {
            const stockQty = getProductStockQuantity(product.id);
            const stock = getStockDetails(stockQty);
            const isOutOfStock = stockQty === 0;

            // ✅ FIXED: Category matching block uses CATEGORIES_LOOKUP cleanly
            const categoryDisplay = (() => {
              if (product.category_id && typeof product.category_id === 'object') {
                return product.category_id.category_name;
              }
              const match = categories.find(c => String(c.id) === String(product.category_id));
              if (match) return match.category_name;
              return CATEGORIES_DISPLAY_NAMES[product.category_id] || product.category_id || "General Item";
            })();

            return (
              <div key={product.id} className="product-card">
                <div className="product-badge">
                  {categoryDisplay}
                </div>
                <div className="product-image-container">
                  <div className="product-image-placeholder">
                    {/* ✅ FIXED: Use image_url emoji (🍄, 🌻) instead of broken image paths */}
                    {product.image_url || "📦"}
                  </div>
                </div>
                
                <div style={{ textAlign: 'left', marginBottom: '12px' }}>
                  {/* ✅ FIXED: Changed product.name to product.product_name */}
                  <div className="product-title">{product.product_name || "Unknown Product"}</div>
                  <div style={{ marginBottom: '10px' }}>
                    <span className={`stock-badge ${stock.className}`}>
                      {stock.label}
                    </span>
                  </div>
                </div>

                <div className="product-footer">
                  <div className="product-price">
                    ${Number(product.price || 0).toFixed(2)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      className="mario-btn mario-btn-green"
                      style={{ 
                        fontSize: '0.65rem', 
                        padding: '8px 12px',
                        opacity: isOutOfStock ? 0.6 : 1,
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() => !isOutOfStock && onAddToCart(product)}
                      disabled={isOutOfStock}
                    >
                      Buy
                    </button>
                    <button
                      className="mario-btn mario-btn-red"
                      style={{ fontSize: '0.65rem', padding: '8px 12px' }}
                      onClick={() => navigate(`/ProductDetails/${product.id}`, { state: { selectedProduct: product } })}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-results">
            🚫 Mamma Mia! No items found matching your search.
          </div>
        )}
      </div>

      {/* Database Schema Details Modal */}
      {selectedProduct && (() => {
        const stockQty = getProductStockQuantity(selectedProduct.id);
        const invRecord = getProductStockRecord(selectedProduct.id);
        const stock = getStockDetails(stockQty);

        return (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                X
              </button>
              
              <div className="modal-header-section">
                <div className="modal-image" style={{ fontSize: '3rem', textAlign: 'center' }}>
                  {/* ✅ FIXED: Use image_url emoji instead of broken image_url inside modal */}
                  {selectedProduct.image_url || "📦"}
                </div>
                <div className="modal-title-area">
                  {/* ✅ FIXED: Changed selectedProduct.name to selectedProduct.product_name */}
                  <h3 className="modal-title">{selectedProduct.product_name || "Unknown Product"}</h3>
                  <span className={`stock-badge ${stock.className}`}>
                    {stock.label}
                  </span>
                </div>
              </div>

              {/* PRODUCTS Table details */}
              <div className="db-table-title">
                📁 PRODUCTS Table (Product Details Database)
              </div>

              <table className="db-details-table">
                <thead>
                  <tr>
                    <th>Column Name</th>
                    <th>Column Value</th>
                  </tr>
                </thead>
                <tbody>
                  {DB_PRODUCTS_COLUMNS.map(col => {
                    let valDisplay = '';
                    
                    if (col.name === 'category_id') {
                      // ✅ FIXED: Safely unpacks relational objects to avoid [object Object] crashes
                      const displayCat = selectedProduct.category_id && typeof selectedProduct.category_id === 'object'
                        ? selectedProduct.category_id.category_name
                        : (CATEGORIES_DISPLAY_NAMES[selectedProduct.category_id] || selectedProduct.category_id);
                      valDisplay = String(displayCat || 'General Item');
                    } else if (col.name === 'name') {
                      // ✅ FIXED: Maps table visual description tracker back onto your real column key
                      valDisplay = String(selectedProduct.product_name || '');
                    } else if (col.name === 'image_url') {
                      // ✅ FIXED: Redirects preview rows to output emoji fields 
                      valDisplay = String(selectedProduct.image_url || '📦');
                    } else if (col.name === 'price') {
                      valDisplay = `$${Number(selectedProduct.price || 0).toFixed(2)}`;
                    } else if (col.name === 'created_at' || col.name === 'updated_at') {
                      valDisplay = formatTimestamp(selectedProduct[col.name]);
                    } else {
                      valDisplay = String(selectedProduct[col.name] ?? '');
                    }

                    return (
                      <tr key={col.name}>
                        <th>
                          <span className="db-column-name">{col.name}</span>
                          <span className="db-type-badge">{col.type}</span>
                          <div style={{ fontSize: '0.7rem', fontWeight: 'normal', color: '#64748B', marginTop: '4px', textTransform: 'none', fontFamily: 'var(--font-main)' }}>
                            {col.label}
                          </div>
                        </th>
                        <td>{valDisplay}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* INVENTORY Table details */}
              <div className="db-table-title">
                📁 INVENTORY Table (Separate Stock Level Database)
              </div>

              <table className="db-details-table">
                <thead>
                  <tr>
                    <th>Column Name</th>
                    <th>Column Value</th>
                  </tr>
                </thead>
                <tbody>
                  {DB_INVENTORY_COLUMNS.map(col => {
                    let valDisplay = '';
                    if (col.name === 'updated_at') {
                      valDisplay = formatTimestamp(invRecord[col.name]);
                    } else {
                      valDisplay = String(invRecord[col.name] ?? '');
                    }

                    return (
                      <tr key={col.name}>
                        <th>
                          <span className="db-column-name">{col.name}</span>
                          <span className="db-type-badge">{col.type}</span>
                          <div style={{ fontSize: '0.7rem', fontWeight: 'normal', color: '#64748B', marginTop: '4px', textTransform: 'none', fontFamily: 'var(--font-main)' }}>
                            {col.label}
                          </div>
                        </th>
                        <td>{valDisplay}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  className="mario-btn mario-btn-green"
                  onClick={() => {
                    if (stockQty > 0) {
                      onAddToCart(selectedProduct);
                      handleCloseModal();
                    }
                  }}
                  disabled={stockQty === 0}
                  style={{ opacity: stockQty === 0 ? 0.6 : 1 }}
                >
                  Add To Cart
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default UserProducts;