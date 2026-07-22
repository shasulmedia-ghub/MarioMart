import React, { useState, useMemo } from 'react';

// Categories mapping helper
const CATEGORIES = {
  1: 'Power-ups',
  2: 'Items & Weapons',
  3: 'Outfits & Suits'
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Stock badge styling helper
  const getStockDetails = (qty) => {
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
    let result = [...MOCK_PRODUCTS];

    // Category filter
    if (selectedCategory !== null) {
      result = result.filter(p => p.category_id === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-desc':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

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
        </div>

        <div className="category-filters">
          <button
            className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All Items
          </button>
          <button
            className={`category-btn ${selectedCategory === 1 ? 'active' : ''}`}
            onClick={() => setSelectedCategory(1)}
          >
            Power-ups
          </button>
          <button
            className={`category-btn ${selectedCategory === 2 ? 'active' : ''}`}
            onClick={() => setSelectedCategory(2)}
          >
            Items & Weapons
          </button>
          <button
            className={`category-btn ${selectedCategory === 3 ? 'active' : ''}`}
            onClick={() => setSelectedCategory(3)}
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

            return (
              <div key={product.id} className="product-card">
                {/* Category Badge */}
                <div className="product-badge">
                  {CATEGORIES[product.category_id]}
                </div>

                {/* Product Image Container */}
                <div className="product-image-container">
                  <div className="product-image-placeholder">
                    {product.image_url}
                  </div>
                </div>

                {/* Product Info */}
                <div style={{ textAlign: 'left', marginBottom: '12px' }}>
                  <div className="product-title">{product.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'var(--font-retro)', marginBottom: '8px' }}>
                    SKU: {product.sku}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <span className={`stock-badge ${stock.className}`}>
                      {stock.label}
                    </span>
                  </div>
                  <div className="product-description">{product.description}</div>
                </div>

                {/* Product Footer (Price and Actions) */}
                <div className="product-footer">
                  <div className="product-price">
                    ${product.price.toFixed(2)}
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
                <div className="modal-image">
                  {selectedProduct.image_url}
                </div>
                <div className="modal-title-area">
                  <h3 className="modal-title">{selectedProduct.name}</h3>
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
                      valDisplay = `${selectedProduct.category_id} (${CATEGORIES[selectedProduct.category_id]})`;
                    } else if (col.name === 'price') {
                      valDisplay = `$${selectedProduct.price.toFixed(2)}`;
                    } else if (col.name === 'created_at' || col.name === 'updated_at') {
                      valDisplay = formatTimestamp(selectedProduct[col.name]);
                    } else {
                      valDisplay = String(selectedProduct[col.name]);
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
                      valDisplay = String(invRecord[col.name]);
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
                <button className="mario-btn mario-btn-red" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default Products;
