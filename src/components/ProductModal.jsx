import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function ProductModal({ product, onClose }) {
  const { user } = useAuth();
  const { refreshCartCount } = useCart();
  const userId = user?.id;

  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedColour, setSelectedColour] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        console.log(product);
        const res = await fetch(`https://mm-api-virid.vercel.app/api/products/${product.id}/details`);
        if (!res.ok) throw new Error('Failed to fetch product details');
        const data = await res.json();
        
        if (isMounted) {
          const variantsData = Array.isArray(data) ? data : data.data || data.variants || [];
          setVariants(variantsData);

          if (variantsData.length > 0) {
            const firstColour = variantsData[0].colour;
            setSelectedColour(firstColour);
            
            const sizesForColour = variantsData.filter(v => v.colour === firstColour);
            if (sizesForColour.length > 0) {
              setSelectedSize(sizesForColour[0].size);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    if (product?.id) {
      fetchDetails();
    }
    return () => { isMounted = false; };
  }, [product?.id]);

  const colours = useMemo(() => {
    const distinctColours = new Set(variants.map(v => v.colour));
    return Array.from(distinctColours).filter(Boolean);
  }, [variants]);

  const sizes = useMemo(() => {
    return variants.filter(v => v.colour === selectedColour).map(v => v.size).filter(Boolean);
  }, [variants, selectedColour]);

  const selectedVariant = useMemo(() => {
    return variants.find(v => v.colour === selectedColour && v.size === selectedSize) 
      || variants.find(v => v.colour === selectedColour) 
      || variants[0];
  }, [variants, selectedColour, selectedSize]);

  const handleColourClick = (colour) => {
    setSelectedColour(colour);
    const sizesForColour = variants.filter(v => v.colour === colour);
    if (sizesForColour.length > 0) {
      setSelectedSize(sizesForColour[0].size);
    } else {
      setSelectedSize('');
    }
  };

  const handleAddToCart = async () => {
    if (!userId) {
      setFeedbackError('Please login to add to cart.');
      return;
    }
    
    if (!selectedVariant && variants.length > 0) return;
console.log(selectedVariant);

    try {
      setAddingToCart(true);
      setFeedbackMsg('');
      setFeedbackError('');

      // Determine unit price - fallback to product.unit_price or product.price
      const unitPrice = selectedVariant 
        ? (selectedVariant.unitPrice || selectedVariant.unit_price || selectedVariant.price) 
        : (product.unit_price || product.price || 0);

      const payload = {
        userId,
        productId: product.id,
        colour: selectedColour,
        size: selectedSize,
        quantity: 1,
        unitPrice: Number(unitPrice),
        variantId: selectedVariant.variant_id
      };

      const response = await fetch(`https://mm-api-virid.vercel.app/api/cart/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      refreshCartCount();
      setFeedbackMsg('Added to cart!');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      setFeedbackError('Error adding to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const displayImage = selectedVariant?.image_url || product.default_image || product.image_url;
  const stockQuantity = selectedVariant 
    ? Number(selectedVariant.stock_quantity || 0) 
    : Number(product.stock_quantity || 0);
  
  const getStockDetails = (qty) => {
    if (qty === 0) return { className: 'stock-out', label: 'OUT OF STOCK' };
    if (qty === 1) return { className: 'stock-low', label: 'LAST ITEM LEFT!' };
    if (qty < 10) return { className: 'stock-low', label: 'LOW STOCK (< 10 LEFT)' };
    return { className: 'stock-in', label: 'IN STOCK' };
  };

  const stock = getStockDetails(stockQuantity);
  const productName = product.product_name || product.name;
  const categoryName = product.category_name || product.category_id;
  const price = selectedVariant 
    ? (selectedVariant.unitPrice || selectedVariant.unit_price || selectedVariant.price) 
    : (product.unit_price || product.price || 0);

  // Helper for colour mapping to valid CSS
  const getCssColour = (col) => {
    const map = {
      'red': '#ff0000',
      'blue': '#0000ff',
      'green': '#008000',
      'yellow': '#ffff00',
      'black': '#000000',
      'white': '#ffffff',
      'grey': '#808080',
      'gray': '#808080',
      'orange': '#ffa500',
      'purple': '#800080',
      'pink': '#ffc0cb'
    };
    const normalized = col.toLowerCase().trim();
    return map[normalized] || normalized;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          X
        </button>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-main)' }}>Loading details...</div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mario-red)', fontFamily: 'var(--font-main)' }}>{error}</div>
        ) : (
          <>
            <div className="modal-header-section" style={{ borderBottom: 'none', display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div className="product-image-placeholder" style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
                {displayImage && (displayImage.startsWith('http') || displayImage.startsWith('/')) ? (
                   <img src={displayImage} alt={productName} style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                ) : (
                   <div style={{ fontSize: '6rem' }}>{displayImage || '📦'}</div>
                )}
              </div>
              <div className="modal-title-area" style={{ width: '100%' }}>
                <h3 className="modal-title">{productName}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '8px', fontFamily: 'var(--font-main)' }}>
                  {categoryName && `Category: ${categoryName}`}
                </p>
                <p style={{ fontSize: '0.95rem', marginBottom: '12px', fontFamily: 'var(--font-main)' }}>
                  {product.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--dark-text)' }}>
                  <span>${Number(price).toFixed(2)}</span>
                  <span className={`stock-badge ${stock.className}`}>
                    {stock.label} {/*({stockQuantity} available)*/}
                  </span>
                </div>
              </div>
            </div>

            {colours.length > 0 && (
              <div style={{ padding: '15px 20px', borderTop: '1px solid #e2e8f0', fontFamily: 'var(--font-main)' }}>
                <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>Select Colour:</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {colours.map(col => {
                    const isSelected = selectedColour === col;
                    return (
                      <button
                        key={col}
                        onClick={() => handleColourClick(col)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: getCssColour(col),
                          border: isSelected ? '3px solid var(--mario-red, #E52521)' : '2px solid #ccc',
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 0 8px rgba(229,37,33,0.5)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                        title={col}
                        aria-label={`Select colour ${col}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div style={{ padding: '15px 20px', borderTop: '1px solid #e2e8f0', fontFamily: 'var(--font-main)' }}>
                <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>Select Size:</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {sizes.map(sz => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: isSelected ? '2px solid var(--mario-red, #E52521)' : '1px solid #cbd5e1',
                          backgroundColor: isSelected ? '#fee2e2' : '#f8fafc',
                          color: isSelected ? '#991b1b' : '#334155',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 'bold' : '500',
                          transition: 'all 0.2s ease',
                          fontSize: '0.9rem'
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '10px', padding: '15px 20px', borderTop: '1px solid #e2e8f0' }}>
              {feedbackMsg && <span style={{ color: '#16a34a', fontWeight: 'bold', marginRight: 'auto', fontSize: '0.9rem' }}>✅ {feedbackMsg}</span>}
              {feedbackError && <span style={{ color: '#dc2626', fontWeight: 'bold', marginRight: 'auto', fontSize: '0.9rem' }}>❌ {feedbackError}</span>}
              
              <button 
                className="mario-btn mario-btn-green"
                onClick={handleAddToCart}
                disabled={stockQuantity === 0 || addingToCart}
                style={{ opacity: stockQuantity === 0 || addingToCart ? 0.6 : 1 }}
              >
                {addingToCart ? 'Adding...' : 'Add To Cart'}
              </button>
              <button className="mario-btn mario-btn-red" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductModal;
