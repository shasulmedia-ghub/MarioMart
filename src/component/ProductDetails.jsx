import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

// FIX: Define CATEGORIES dictionary so your layout doesn't crash on render
const CATEGORIES = {
  1: 'Power-ups',
  2: 'Items & Weapons',
  3: 'Outfits & Suits'
};

function ProductDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  // FIX: Unpack using 'selectedProduct' to match your button state structure precisely
  const product = location.state?.selectedProduct;
  // Fall back to 0 if stock quantity isn't explicitly supplied in payload
  const stockQuantity = location.state?.stockQuantity ?? 0;

  // Safeguard view if someone navigates to /ProductDetails directly without choosing an item
  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#ff4444' }}>
        <h3>🍄 No Product Selected!</h3>
        <button className="mario-btn" onClick={() => navigate('/')}>Return to Shop</button>
      </div>
    );
  }

  return (
    <>
    <h2 className='section-title'>Product Details HEADER</h2>
    <div className="app-container" style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      
      {/* Moved your header inside the valid return statement block */}
      <h2 className='section-title' style={{ textAlign: 'center', marginBottom: '20px' }}>Product Details</h2>
      {/* FIX THIS PART to tie in with product name */}

      <header className="mario-header" style={{ marginBottom: '20px' }}>
        <div className="mario-brand">🌟 ITEM SPECIFICATIONS</div>
      </header>
      
      <div className="product-card" style={{ display: 'block', padding: '20px', textAlign: 'left' }}>
        <div className="product-image-container" style={{ fontSize: '4rem', textAlign: 'center', padding: '20px' }}>
          {product.image_url || '📦'}
        </div>

        <h2 className="product-title" style={{ fontSize: '1.8rem', margin: '10px 0' }}>{product.name}</h2>
        <span className="product-badge" style={{ position: 'static', display: 'inline-block', marginBottom: '15px' }}>
          {CATEGORIES[product.category_id] || 'General'}
        </span>

        <p style={{ margin: '10px 0', lineHeight: '1.5' }}>
          <strong>Description:</strong> {product.description || 'No detailed log summary description provided for this item.'}
        </p>

        <div style={{ background: 'rgba(0,0,0,0.05)', padding: '15px', borderRadius: '4px', margin: '20px 0' }}>
          <p style={{ margin: '5px 0' }}><strong>SKU Code:</strong> <code>{product.sku || 'N/A'}</code></p>
          <p style={{ margin: '5px 0' }}><strong>Unit Price Value:</strong> <span style={{ color: '#26af26', fontWeight: 'bold' }}>${parseFloat(product.price || 0).toFixed(2)}</span></p>
          <p style={{ margin: '5px 0' }}><strong>Inventory Level Count:</strong> {stockQuantity} units left</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="mario-btn mario-btn-yellow" onClick={() => navigate(-1)}>
            ⬅️ Back to Shop
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default ProductDetails;
