import React, { useState, useEffect } from 'react';
//import './App.css'; // Importing your exact stylesheet

// Simulated initial database records
const MOCK_DATABASE = [
  {
    id: 1,
    title: "Super Mushroom",
    category: "Power-Up",
    price: 15.99,
    description: "Instantly doubles your size and allows you to smash through brick blocks with ease. Essential for beginners!",
    image_url: "🍄",
    stockStatus: "in"
  },
  {
    id: 2,
    title: "Fire Flower",
    category: "Power-Up",
    price: 24.99,
    description: "Grants the power of pyromancy! Toss bouncing fireballs at enemies to clear your path.",
    image_url: "🌻",
    stockStatus: "low"
  },
  {
    id: 3,
    title: "Super Star",
    category: "Invincibility",
    price: 99.99,
    description: "Grants temporary invincibility to all damage and increases running speed. Play the iconic theme music!",
    image_url: "⭐",
    stockStatus: "out"
  }
];

export default function ProductsData() {
  // State for retrieved products
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. RETRIEVE: Fetch data from backend API with fallback
  useEffect(() => {
    const fetchProductsFromDB = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/products');
        if (!res.ok) throw new Error('API response not OK');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.warn("Failed to fetch products from backend database. Using mock database fallback. Error:", err.message);
        setProducts(MOCK_DATABASE);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsFromDB();
  }, []);

  // Helper to dynamically style the stock badge based on DB value
  const getStockBadgeClass = (status) => {
    switch (status) {
      case 'in': return 'stock-badge stock-in';
      case 'low': return 'stock-badge stock-low';
      case 'out': return 'stock-badge stock-out';
      default: return 'stock-badge';
    }
  };

  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="mario-header">
        <div className="mario-brand">
          <span>🍄</span> MARIOMART DB
        </div>
        <div className="mario-nav">
          <span style={{ fontSize: '0.8rem', color: 'var(--mario-yellow)', fontFamily: 'var(--font-retro)' }}>Storefront Catalog</span>
        </div>
      </header>

      {/* Section Title */}
      <h2 className="section-title">
        <span>⭐</span> Available Products ({products.length})
      </h2>

      {/* Loading State */}
      {isLoading && (
        <div className="no-results">
          Loading MarioMart Catalog from Database...
        </div>
      )}

      {/* Product Display Grid */}
      {!isLoading && (
        <div className="product-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              {/* Category Badge */}
              <span className="product-badge">{product.category}</span>

              {/* Product Image / Icon */}
              <div className="product-image-container">
                <span className="product-image-placeholder">
                  {product.image_url}
                </span>
              </div>

              {/* Product Details */}
              <h3 className="product-title">{product.title}</h3>
              
              {/* Uses your multi-line clamp styling! */}
              <p className="product-description">{product.description}</p>

              {/* Footer with Price and Stock Status */}
              <div className="product-footer">
                <div>
                  <span className="product-price">${product.price}</span>
                  <span className={getStockBadgeClass(product.stockStatus)}>
                    {product.stockStatus === 'in' && 'IN STOCK'}
                    {product.stockStatus === 'low' && 'LOW STOCK'}
                    {product.stockStatus === 'out' && 'SOLD OUT'}
                  </span>
                </div>

                <button 
                  className="mario-btn mario-btn-red"
                  disabled={product.stockStatus === 'out'}
                  style={{ opacity: product.stockStatus === 'out' ? 0.5 : 1 }}
                >
                  {product.stockStatus === 'out' ? 'Empty' : 'Buy Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}