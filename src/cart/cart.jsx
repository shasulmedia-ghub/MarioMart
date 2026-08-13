import React, { useState, useEffect } from 'react';
//import { MOCK_PRODUCTS, getProductStockQuantity } from '../component/Products.jsx';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // Tracks ID of item in progress
  const { user, role, isAuthenticated, logout } = useAuth();
  const { refreshCartCount } = useCart();
  const userId = user.id;

  // Fetch cart items on component mount
  const fetchCartItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://mm-api-virid.vercel.app/api/cart/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch cart. Server responded with code ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle array vs nested object structures defensively
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && Array.isArray(data.items)) {
        items = data.items;
      } else if (data && Array.isArray(data.cart)) {
        items = data.cart;
      } else if (data && Array.isArray(data.data)) {
        items = data.data;
      }

      // Map cart items with local mock product info for details
      const resolvedItems = items.map((item, idx) => {
        // Generate a unique fallback ID if the API does not return one
        const itemUniqueId = item.id || item._id || `cart-item-${idx}`;
        const prodId = item.productId || item.product_id;
        //const matchingProduct = MOCK_PRODUCTS.find(p => String(p.id) === String(prodId));

        return {
          ...item,
          uniqueId: itemUniqueId,
          productId: prodId,
          name: item.product_name,
          image_url: item.image_url || item.default_image || '❓',
          price: Number(item.unit_price),
          quantity: Number(item.quantity),
          availableQty: Number(item.stock_quantity),
          colour: item.colour || item.color || 'Default',
          size: item.size || 'M'
        };
      });

      setCartItems(resolvedItems);
      // Auto-select all items initially
      setSelectedItemIds(new Set(resolvedItems.map(item => item.uniqueId)));

    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Mamma Mia! Could not load your shopping cart. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  // Update quantity on backend and local state
  const handleUpdateQuantity = async (item, change) => {
    const newQty = item.quantity + change;
    if (newQty < 1 || newQty > item.availableQty) return;

    setActionLoading(item.uniqueId);
    
    // Update local state first for immediate UI response
    setCartItems(prev => prev.map(i => i.uniqueId === item.uniqueId ? { ...i, quantity: newQty } : i));

    try {
      // Prepare payload
      const payload = {
        userId: userId,
        productId: item.productId,
        colour: item.colour,
        size: item.size,
        quantity: newQty,
        unitprice: item.price
      };

      // Call API defensively. If it doesn't support PUT, we catch and remain with the updated local state.
      const response = await fetch(`https://mm-api-virid.vercel.app/api/cart/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Try fallback PUT with item ID
        await fetch(`https://mm-api-virid.vercel.app/api/cart/${item.id || item._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      refreshCartCount();
    } catch (err) {
      console.warn("Failed to synchronize quantity to backend, updated locally:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Remove item from backend and local state
  const handleRemoveItem = async (item) => {
    if (window.confirm(`Are you sure you want to remove the ${item.name} from your cart? 🗑️`)) {
      setActionLoading(item.uniqueId);

      // Save previous state for rollback if needed
      const previousItems = [...cartItems];

      // Optimistic update
      setCartItems(prev => prev.filter(i => i.uniqueId !== item.uniqueId));
      setSelectedItemIds(prev => {
        const next = new Set(prev);
        next.delete(item.uniqueId);
        return next;
      });

      try {
        const itemId = item.id || item._id;
        const response = await fetch(`https://mm-api-virid.vercel.app/api/cart/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            productId: item.productId,
            colour: item.colour,
            size: item.size
          })
        });

        if (!response.ok && itemId) {
          // Try fallback DELETE with item ID
          await fetch(`https://mm-api-virid.vercel.app/api/cart/${itemId}`, {
            method: 'DELETE'
          });
        }
        refreshCartCount();
      } catch (err) {
        console.warn("Failed to delete from backend, removed locally:", err);
      } finally {
        setActionLoading(null);
        refreshCartCount();
      }
    }
  };

  // Toggle selection for an item
  const handleToggleSelect = (uniqueId) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(uniqueId)) {
        next.delete(uniqueId);
      } else {
        next.add(uniqueId);
      }
      return next;
    });
  };

  // Select/Deselect All items
  const handleToggleSelectAll = () => {
    if (selectedItemIds.size === cartItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(cartItems.map(item => item.uniqueId)));
    }
  };

  // Calculate totals
  const selectedItems = cartItems.filter(item => selectedItemIds.has(item.uniqueId));
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout! 🪙");
      return;
    }
    //alert(`Mamma Mia! Proceeding to checkout for ${selectedItems.length} item(s) totaling $${subtotal.toFixed(2)}! ⭐️`);
    navigate('/checkout', { state: { items: selectedItems, subtotal } });
  };

  return (
    <div style={{ textAlign: 'left', maxWidth: '900px', margin: '0 auto', padding: '10px 0' }}>
      
      {/* Title */}
      <h2 className="section-title">
        <span>🛒</span> Your Shopping Cart <span>🛒</span>
      </h2>

      {/* Back to Shop Navigation */}
      <button 
        className="mario-btn mario-btn-yellow" 
        onClick={() => navigate('/')}
        style={{ marginBottom: '24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        ← Back to Shop
      </button>

      {/* Main Cart Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
          🍄 Loading your inventory items...
        </div>
      ) : error && cartItems.length === 0 ? (
        <div style={{ 
          backgroundColor: '#FDE8E8', 
          border: '3px solid var(--mario-red)', 
          borderRadius: '16px', 
          padding: '24px', 
          textAlign: 'center',
          boxShadow: '0 6px 0 var(--dark-text)' 
        }}>
          <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '1rem', color: 'var(--mario-red-dark)', marginBottom: '10px' }}>
            🚫 CONNECTION ERROR
          </h3>
          <p>{error}</p>
          <button className="mario-btn mario-btn-red" onClick={fetchCartItems} style={{ fontSize: '0.75rem', marginTop: '10px' }}>
            Retry
          </button>
        </div>
      ) : cartItems.length === 0 ? (
        /* Empty State */
        <div style={{ 
          backgroundColor: 'var(--cloud-white)', 
          border: '3px solid var(--dark-text)', 
          borderRadius: '16px', 
          padding: '40px 20px', 
          textAlign: 'center',
          boxShadow: '0 6px 0 var(--dark-text)',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '16px' }}>Empty Box ❓</div>
          <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '1.1rem', color: 'var(--mario-red)', marginBottom: '12px' }}>
            YOUR CART IS EMPTY!
          </h3>
          <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto 20px' }}>
            Looks like you haven't collected any power-ups yet. Jump back into the shop and grab some items!
          </p>
          <button className="mario-btn mario-btn-green" onClick={() => navigate('/')}>
            Start Shopping 🪙
          </button>
        </div>
      ) : (
        /* Cart List and Panel */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          
          {/* Select All Row */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '12px 18px', 
            backgroundColor: 'var(--cloud-white)', 
            border: '3px solid var(--dark-text)', 
            borderRadius: '12px',
            boxShadow: '0 3px 0 var(--dark-text)'
          }}>
            <input 
              type="checkbox" 
              id="select-all"
              checked={selectedItemIds.size === cartItems.length}
              onChange={handleToggleSelectAll}
              style={{ 
                width: '20px', 
                height: '20px', 
                cursor: 'pointer',
                marginRight: '12px',
                accentColor: 'var(--mario-red)'
              }}
            />
            <label htmlFor="select-all" style={{ fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>
              Select All ({cartItems.length} items)
            </label>
          </div>

          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cartItems.map((item) => {
              const isSelected = selectedItemIds.has(item.uniqueId);
              const isUpdating = actionLoading === item.uniqueId;
              console.warn(item)
              return (
                <div 
                  key={item.uniqueId} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--cloud-white)',
                    border: '3px solid var(--dark-text)',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 6px 0 var(--dark-text)',
                    opacity: isUpdating ? 0.7 : 1,
                    transition: 'all 0.1s ease',
                    position: 'relative',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  {/* Select Checkbox */}
                  <input 
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(item.uniqueId)}
                    style={{ 
                      width: '22px', 
                      height: '22px', 
                      cursor: 'pointer',
                      accentColor: 'var(--mario-red)',
                      marginRight: '4px'
                    }}
                    aria-label={`Select ${item.name}`}
                  />

                  {/* Product Emoji Image */}
                  <div style={{
                    fontSize: '2.5rem',
                    background: 'var(--sky-bg)',
                    border: '2px solid var(--dark-text)',
                    borderRadius: '12px',
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 0 var(--dark-text)'
                  }}>
                    <img style={{ width: '100px', height: '100px' }} src={item.image_url} alt={item.name} />
                  </div>

                  {/* Product Details info */}
                  <div style={{ flex: '1', minWidth: '150px' }}>
                    <h4 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>{item.name}</h4>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#64748B', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#CBD5E1', padding: '2px 8px', borderRadius: '6px', color: 'var(--dark-text)', fontWeight: '600' }}>
                        Color: {item.colour}
                      </span>
                      <span style={{ background: '#CBD5E1', padding: '2px 8px', borderRadius: '6px', color: 'var(--dark-text)', fontWeight: '600' }}>
                        Size: {item.size}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ minWidth: '80px', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Price</span>
                    <span className="product-price" style={{ fontSize: '1.05rem', margin: 0 }}>
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity adjustment buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '4px' }}>Quantity</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => handleUpdateQuantity(item, -1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: '2px solid var(--dark-text)',
                          borderRadius: '8px',
                          backgroundColor: 'var(--mario-yellow)',
                          cursor: (item.quantity <= 1 || isUpdating) ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 0 var(--mario-yellow-dark)',
                          opacity: item.quantity <= 1 ? 0.5 : 1
                        }}
                        type="button"
                      >
                        -
                      </button>
                      <span style={{ fontFamily: 'var(--font-retro)', fontSize: '0.9rem', width: '24px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleUpdateQuantity(item, 1)}
                        disabled={item.quantity >= item.availableQty || isUpdating}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: '2px solid var(--dark-text)',
                          borderRadius: '8px',
                          backgroundColor: 'var(--mario-green)',
                          color: '#fff',
                          cursor: (item.quantity >= item.availableQty || isUpdating) ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 0 var(--mario-green-dark)',
                          opacity: item.quantity >= item.availableQty ? 0.5 : 1
                        }}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--mario-red)', marginTop: '4px', textAlign: 'center' }}>
                      Available Qty: {item.availableQty}
                    </span>
                  </div>

                  {/* Item Subtotal */}
                  <div style={{ minWidth: '90px', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Total</span>
                    <span className="product-price" style={{ fontSize: '1.05rem', color: 'var(--mario-green-dark)' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Remove Button (Trash Icon) */}
                  <button
                    onClick={() => handleRemoveItem(item)}
                    disabled={isUpdating}
                    style={{
                      background: 'none',
                      border: '2px solid var(--dark-text)',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                      backgroundColor: 'var(--cloud-white)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      boxShadow: '0 2px 0 var(--dark-text)',
                      transition: 'all 0.1s ease',
                    }}
                    type="button"
                    title="Remove item"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>

          {/* Cart Checkout Summary Panel */}
          <div style={{
            backgroundColor: 'var(--cloud-white)',
            border: '4px solid var(--dark-text)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 0 var(--dark-text)',
            marginTop: '10px'
          }}>
            <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.95rem', color: 'var(--mario-blue)', borderBottom: '3px solid var(--dark-text)', paddingBottom: '10px', marginTop: 0 }}>
              INVOICE TOTALS
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '14px 0', fontSize: '1.05rem' }}>
              <span>Items Selected:</span>
              <strong style={{ fontFamily: 'var(--font-retro)', fontSize: '0.85rem' }}>
                {selectedItems.length} / {cartItems.length}
              </strong>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '14px 0', fontSize: '1.05rem' }}>
              <span>Total Quantity:</span>
              <strong style={{ fontFamily: 'var(--font-retro)', fontSize: '0.85rem' }}>
                {selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items
              </strong>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              margin: '18px 0 24px', 
              fontSize: '1.35rem', 
              fontWeight: 'bold', 
              borderTop: '2px dashed var(--gray-border)', 
              paddingTop: '18px' 
            }}>
              <span>SUBTOTAL:</span>
              <span className="product-price" style={{ fontSize: '1.35rem' }}>
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button 
                className="mario-btn mario-btn-yellow" 
                onClick={() => navigate('/')}
                style={{ fontSize: '0.85rem' }}
              >
                Continue Shopping
              </button>
              <button 
                className="mario-btn mario-btn-green" 
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                style={{ 
                  opacity: selectedItems.length === 0 ? 0.6 : 1,
                  cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Proceed to Checkout 🪙
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Cart;
