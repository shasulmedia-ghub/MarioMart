import React, { useState, useMemo, useEffect } from 'react';
import ProductModal from './ProductModal.jsx';


// Categories mapping helper
/* const CATEGORIES = {
  1: 'Power-ups',
  2: 'Items & Weapons',
  3: 'Outfits & Suits'
}; */

// Column definitions for the PRODUCTS Table
const DB_PRODUCTS_COLUMNS = [
  { name: 'id', type: 'UUID_or_INT', label: 'Product ID (Primary Key)' },
  { name: 'sku', type: 'VARCHAR(100) UNIQUE', label: 'Stock Keeping Unit (SKU)' },
  { name: 'category_id', type: 'INT', label: 'Category ID (Foreign Key)' },
  { name: 'name', type: 'VARCHAR(255)', label: 'Product Name' },
  { name: 'description', type: 'TEXT', label: 'Detailed Description' },
  { name: 'price', type: 'DECIMAL(10,2)', label: 'Unit Price' },
  { name: 'image_url', type: 'VARCHAR(255)', label: 'Image Resource Path' },
  { name: 'created_at', type: 'TIMESTAMP', label: 'Created Time' },
  { name: 'updated_at', type: 'TIMESTAMP', label: 'Last Updated Time' }
];

// Column definitions for the INVENTORY Table
const DB_INVENTORY_COLUMNS = [
  { name: 'product_id', type: 'VARCHAR(50)', label: 'Product ID (Foreign Key)' },
  { name: 'stock_quantity', type: 'INT', label: 'Stock Quantity Level' },
  { name: 'updated_at', type: 'TIMESTAMP', label: 'Last Stock Update Time' }
];

// MOCK_PRODUCTS representing the Products table (no stock_quantity here)
const MOCK_PRODUCTS = [
  {
    id: "prod-001",
    sku: "MM-MUSH-001",
    category_id: 1,
    name: "Super Mushroom",
    description: "A classic power-up item! Makes the user grow twice their normal size, allowing them to break brick blocks and survive an extra hit.",
    price: 10.00,
    image_url: "🍄",
    created_at: "2026-07-01T08:00:00Z",
    updated_at: "2026-07-20T10:15:00Z"
  },
  {
    id: "prod-002",
    sku: "MM-FLOW-002",
    category_id: 1,
    name: "Fire Flower",
    description: "Grants the power to throw bouncing fireballs that defeat enemies from a distance. Great for lighting up dark caves!",
    price: 25.00,
    image_url: "🔥",
    created_at: "2026-07-02T09:30:00Z",
    updated_at: "2026-07-18T14:45:00Z"
  },
  {
    id: "prod-003",
    sku: "MM-STAR-003",
    category_id: 1,
    name: "Super Star",
    description: "Become completely invincible to all hazards and enemies for a limited time! Grants a speed boost and a dazzling rainbow glow.",
    price: 99.99,
    image_url: "🌟",
    created_at: "2026-07-03T11:00:00Z",
    updated_at: "2026-07-22T08:00:00Z"
  },
  {
    id: "prod-004",
    sku: "MM-SHEL-004",
    category_id: 2,
    name: "Green Shell",
    description: "A versatile projectile that can be kicked to slide along the ground and defeat enemies. Watch out for the bounce-back!",
    price: 5.50,
    image_url: "🐢",
    created_at: "2026-07-04T13:15:00Z",
    updated_at: "2026-07-15T09:00:00Z"
  },
  {
    id: "prod-005",
    sku: "MM-SUIT-005",
    category_id: 3,
    name: "Tanooki Suit",
    description: "A magical suit that grants the ability to flutter-jump, glide through the air, and transform into an invincible stone statue.",
    price: 75.00,
    image_url: "🦝",
    created_at: "2026-07-05T14:00:00Z",
    updated_at: "2026-07-12T16:20:00Z"
  },
  {
    id: "prod-006",
    sku: "MM-YEGG-006",
    category_id: 2,
    name: "Yoshi Egg",
    description: "Hatch your very own loyal dinosaur companion! Yoshi can eat enemies, flutter jump, and carry you safely through dangerous terrains.",
    price: 50.00,
    image_url: "🥚",
    created_at: "2026-07-06T10:00:00Z",
    updated_at: "2026-07-21T11:55:00Z"
  }
];

// MOCK_INVENTORY representing the separate Inventory table/database
const MOCK_INVENTORY = [
  { product_id: "prod-001", stock_quantity: 45, updated_at: "2026-07-20T10:15:00Z" },
  { product_id: "prod-002", stock_quantity: 15, updated_at: "2026-07-18T14:45:00Z" },
  { product_id: "prod-003", stock_quantity: 1,  updated_at: "2026-07-22T08:00:00Z" },
  { product_id: "prod-004", stock_quantity: 80, updated_at: "2026-07-15T09:00:00Z" },
  { product_id: "prod-005", stock_quantity: 0,  updated_at: "2026-07-12T16:20:00Z" },
  { product_id: "prod-006", stock_quantity: 7,  updated_at: "2026-07-21T11:55:00Z" }
];

// Database join lookup helpers
const getProductStockRecord = (productId) => {
  return MOCK_INVENTORY.find(item => item.product_id === productId) || {
    product_id: productId,
    stock_quantity: 0,
    updated_at: new Date().toISOString()
  };
};

const getProductStockQuantity = (productId) => {
  return getProductStockRecord(productId).stock_quantity;
};

function Products({ onAddToCart = () => {} }) {
    const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productlist, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);


    // Fetch from database

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    //console.log('inside fetchproduct');
    //console.log(productlist);
    try {
      const res = await fetch('https://mm-api-virid.vercel.app/api/product/list');
      const data = await res.json();
      //console.log('inside try block');
      //console.log(data);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
// set the data to result
useEffect(() => {
  fetchProducts();
}, []);


  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const res = await fetch('https://mm-api-virid.vercel.app/api/categories');
        if (!res.ok) {
          throw new Error(`Failed to fetch categories: ${res.status}`);
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data || data?.categories || []);
        if (isMounted) {
          setCategories(list);
        }
      } catch (err) {
        if (isMounted) {
          setCategoriesError(err.message || 'Failed to load categories');
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  const toggleCategory = (code) => {
    setSelectedCategories((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Stock badge styling helper
  const getStockDetails = (qty) => {
    /* console.log(qty); */
    if (qty === 0) {
      return { className: 'stock-out', label: 'OUT OF STOCK' };
    }
    if (qty === 1) {
      return { className: 'stock-low', label: 'LAST ITEM LEFT!' };
    }
    if (qty < 10) {
      return { className: 'stock-low', label: 'LOW STOCK (< 10 LEFT)' };
    }
    return { className: 'stock-in', label: 'IN STOCK' };
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = productlist;
//console.log('inside filtered products');
//console.log(result);
    // Category filter — OR logic across all selected categories
    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.some(
          (code) =>
            p.category_id === code ||
            p.category_code === code ||
            String(p.category_id) === String(code) ||
            (p.category_code && String(p.category_code) === String(code))
        )
      );
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.product_name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.unit_price - b.unit_price;
        case 'price-desc':
          return b.unit_price - a.unit_price;
        case 'name-asc':
          return a.product_name.localeCompare(b.product_name);
        case 'name-desc':
          return b.product_name.localeCompare(a.product_name);
        case 'date-desc':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

    return result;
  }, [productlist, searchQuery, selectedCategories, sortBy]);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  // Format helper for timestamps
  const formatTimestamp = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

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
          <button
            type="button"
            className={`mario-btn ${showFilters ? 'mario-btn-red' : 'mario-btn-yellow'}`}
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
            aria-label="Toggle category filters"
            style={{ fontSize: '0.75rem', padding: '8px 14px', whiteSpace: 'nowrap' }}
          >
            🏷️ Filter{selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ''}
          </button>
        </div>

        {showFilters && (
          <div className="category-filters">
            <button
              type="button"
              className={`category-btn ${selectedCategories.length === 0 ? 'active' : ''}`}
              onClick={() => setSelectedCategories([])}
            >
              All Items
            </button>

            {categoriesLoading ? (
              <span style={{ fontSize: '0.85rem', color: '#64748B', alignSelf: 'center' }}>
                Loading categories...
              </span>
            ) : categoriesError ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--mario-red)', alignSelf: 'center' }}>
                Failed to load categories
              </span>
            ) : (
              categories.map((cat, idx) => {
                const code = cat.code !== undefined ? cat.code : (cat.id !== undefined ? cat.id : cat.slug);
                const label = cat.description || cat.category_name || cat.name || cat.label || String(code);
                const isSelected = selectedCategories.some((c) => String(c) === String(code));

                return (
                  <button
                    key={cat.id || cat.code || cat.slug || idx}
                    type="button"
                    className={`category-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => toggleCategory(code)}
                  >
                    {label}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => {
            const stockQty = Number(product.stock_quantity)  //getProductStockQuantity(product.id);
            const stock = getStockDetails(stockQty);
            const isOutOfStock = stockQty === 0;

            return (
              <div key={product.id} className="product-card">
                {/* Product Image Container */}
                {/* Category Badge */}
                  <div className="product-badge">
                    {product.category_name}
                  </div>
                <div className="product-image-container">
                  
                  <div className="product-image-placeholder">
                    <img 
                      src={product.default_image} 
                      alt={product.name} 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                    />
                  </div>
                </div>
                
                {/* Product Info */}
                <div style={{ textAlign: 'left', marginBottom: '12px' }}>
                  <div className="product-title">{product.product_name}</div>
                  <div style={{ marginBottom: '10px' }}>
                    <span className={`stock-badge ${stock.className}`}>
                      {stock.label}
                    </span>
                  </div>
                </div>


                {/* Product Footer (Price and Actions) */}
                <div className="product-footer">
                  <div className="product-price">
                    ${product.unit_price}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/*<button
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
                    </button> */}
                    <button
                      className="mario-btn mario-btn-red"
                      style={{ fontSize: '0.65rem', padding: '8px 12px' }}
                      onClick={() => handleOpenModal(product)}
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

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default Products;
