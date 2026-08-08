import React, { useState } from 'react';
  import { useAuth } from '../context/AuthContext';

/* ============================================================
   Checkout Page
   - Reads selected items passed from the Cart page via props
   - Displays order review summary
   - Offers two payment modes: PayNow (QR) or Card Payment
   - Validates card fields before allowing payment
   - Action buttons: Back to Cart | Make Payment
   ============================================================ */

// --------------- PayNow QR Panel ---------------
const PayNowPanel = () => {
  // SVG QR-code placeholder that resembles a real QR pattern
  const seed = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0],
    [1,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1,0,1,1],
    [0,1,0,0,1,0,0,1,1,0,0,1,0,1,1,0,0,1,0],
    [1,0,1,1,0,1,1,0,1,1,0,0,1,1,0,1,1,0,1],
    [0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,0,0,1,0,1,1,0,0,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,0,1,1,0,0,1,0],
    [1,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,1,0,0,1,1,0],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0],
    [1,1,1,1,1,1,1,0,1,1,0,1,1,0,0,1,0,1,1],
  ];
  const qrCells = [];
  seed.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell)
        qrCells.push(
          <rect key={`${r}-${c}`} x={c * 10} y={r * 10} width={10} height={10} fill="#212529" />
        );
    })
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '28px 20px',
      animation: 'fadeInUp 0.35s ease'
    }}>
      {/* PayNow logo badge */}
      <div style={{
        background: 'linear-gradient(135deg, #E60012 0%, #FF5C5C 100%)',
        borderRadius: '16px',
        padding: '10px 28px',
        border: '3px solid var(--dark-text)',
        boxShadow: '0 5px 0 var(--mario-red-dark)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{ fontSize: '1.6rem' }}>⚡</span>
        <span style={{
          fontFamily: 'var(--font-retro)',
          fontSize: '0.75rem',
          color: '#fff',
          letterSpacing: '0.05em'
        }}>PayNow</span>
      </div>

      {/* QR Code SVG */}
      <div style={{
        background: '#fff',
        padding: '16px',
        borderRadius: '16px',
        border: '4px solid var(--dark-text)',
        boxShadow: '0 8px 0 var(--dark-text)',
        display: 'inline-flex',
      }}>
        <svg width={190} height={190} viewBox="0 0 190 190">
          <rect width={190} height={190} fill="#fff" />
          {qrCells}
        </svg>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 4px' }}>
          Scan with your banking app
        </p>
        <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
          Open any PayNow-supported app → Scan QR → Confirm payment
        </p>
      </div>

      <div style={{
        background: 'var(--sky-bg)',
        border: '2px dashed var(--mario-blue)',
        borderRadius: '12px',
        padding: '10px 20px',
        fontSize: '0.82rem',
        color: 'var(--mario-blue)',
        fontWeight: 600,
        textAlign: 'center'
      }}>
        🔒 Secure · Instant · No card needed
      </div>
    </div>
  );
};



// --------------- Card Payment Panel ---------------
const CARD_NETWORKS = {
  visa:       { label: 'VISA',       color: '#1a1f71' },
  mastercard: { label: 'MASTERCARD', color: '#eb001b' },
  amex:       { label: 'AMEX',       color: '#007bc1' },
  unknown:    { label: 'CARD',       color: '#64748b' },
};

function detectNetwork(num) {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n))                         return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n))                     return 'amex';
  return 'unknown';
}

function formatCardNumber(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

const CardPaymentPanel = ({ errors, cardData, onCardChange }) => {
  const network = detectNetwork(cardData.number);
  const net = CARD_NETWORKS[network];
  const maskedDisplay = cardData.number || '•••• •••• •••• ••••';

  const inputStyle = (field) => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: `2px solid ${errors[field] ? 'var(--mario-red)' : 'var(--gray-border)'}`,
    fontFamily: 'var(--font-main)',
    fontSize: '1rem',
    outline: 'none',
    background: errors[field] ? '#fff5f5' : '#fff',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  });

  return (
    <div style={{ animation: 'fadeInUp 0.35s ease', padding: '8px 0' }}>

      {/* Live Card Preview */}
      <div style={{
        background: `linear-gradient(135deg, ${net.color} 0%, #334155 100%)`,
        borderRadius: '18px',
        padding: '24px',
        color: '#fff',
        marginBottom: '24px',
        border: '3px solid var(--dark-text)',
        boxShadow: '0 8px 0 var(--dark-text)',
        position: 'relative',
        minHeight: '140px',
        overflow: 'hidden',
      }}>
        {/* Decorative background circles */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '1.4rem' }}>📶</span>
          <span style={{ fontFamily: 'var(--font-retro)', fontSize: '0.65rem', letterSpacing: '0.1em', opacity: 0.9 }}>
            {net.label}
          </span>
        </div>

        <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '0.18em', marginBottom: '18px', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
          {maskedDisplay}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', opacity: 0.85 }}>
          <div>
            <div style={{ fontSize: '0.6rem', opacity: 0.7, marginBottom: '2px' }}>CARD HOLDER</div>
            <div style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{cardData.name || 'YOUR NAME'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', opacity: 0.7, marginBottom: '2px' }}>EXPIRES</div>
            <div style={{ fontWeight: 700 }}>{cardData.expiry || 'MM/YY'}</div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Card Number */}
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '5px' }}>
            Card Number
          </label>
          <input
            id="card-number"
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={cardData.number}
            maxLength={19}
            onChange={e => onCardChange('number', formatCardNumber(e.target.value))}
            style={inputStyle('number')}
          />
          {errors.number && <p style={{ color: 'var(--mario-red)', fontSize: '0.78rem', margin: '4px 0 0', fontWeight: 600 }}>⚠ {errors.number}</p>}
        </div>

        {/* Name on Card */}
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '5px' }}>
            Name on Card
          </label>
          <input
            id="card-name"
            type="text"
            placeholder="JOHN DOE"
            value={cardData.name}
            onChange={e => onCardChange('name', e.target.value.toUpperCase())}
            style={inputStyle('name')}
          />
          {errors.name && <p style={{ color: 'var(--mario-red)', fontSize: '0.78rem', margin: '4px 0 0', fontWeight: 600 }}>⚠ {errors.name}</p>}
        </div>

        {/* Expiry & CVV side-by-side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '5px' }}>
              Expiry Date
            </label>
            <input
              id="card-expiry"
              type="text"
              inputMode="numeric"
              placeholder="MM/YY"
              value={cardData.expiry}
              maxLength={5}
              onChange={e => onCardChange('expiry', formatExpiry(e.target.value))}
              style={inputStyle('expiry')}
            />
            {errors.expiry && <p style={{ color: 'var(--mario-red)', fontSize: '0.78rem', margin: '4px 0 0', fontWeight: 600 }}>⚠ {errors.expiry}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '5px' }}>
              CVV
            </label>
            <input
              id="card-cvv"
              type="password"
              inputMode="numeric"
              placeholder="•••"
              value={cardData.cvv}
              maxLength={4}
              onChange={e => onCardChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
              style={inputStyle('cvv')}
            />
            {errors.cvv && <p style={{ color: 'var(--mario-red)', fontSize: '0.78rem', margin: '4px 0 0', fontWeight: 600 }}>⚠ {errors.cvv}</p>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748B' }}>
        <span>🔒</span>
        <span>Your payment details are encrypted and secure.</span>
      </div>
    </div>
  );
};

// --------------- Main Checkout Component ---------------
const Checkout = ({ checkoutItems = [], totalAmount = 0, onBackToCart, onPaymentSuccess }) => {

  const [paymentMode, setPaymentMode]   = useState(null); // null | 'paynow' | 'card'
  const [cardData, setCardData]         = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [cardErrors, setCardErrors]     = useState({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingAddressError, setShippingAddressError] = useState('');
  const { user, role, isAuthenticated, logout } = useAuth();

// const email variable
const email = user.email;
console.log(email);

  // Demo fallback data when no props are passed from Cart
  const items = checkoutItems.length > 0 ? checkoutItems : [
    { uniqueId: 'demo-1', name: 'Super Mushroom Cap',    colour: 'Red',    size: 'M',  price: 29.90, quantity: 2, image_url: null },
    { uniqueId: 'demo-2', name: 'Star Power Sneakers',   colour: 'Yellow', size: '42', price: 89.90, quantity: 1, image_url: null },
    { uniqueId: 'demo-3', name: 'Koopa Shell Backpack',  colour: 'Green',  size: 'L',  price: 59.90, quantity: 1, image_url: null },
  ];

  const subtotal   = totalAmount > 0 ? totalAmount : items.reduce((s, i) => s + i.price * i.quantity, 0);
  const grandTotal = subtotal; // free shipping

  // Card field change handler
  const handleCardChange = (field, value) => {
    setCardData(prev => ({ ...prev, [field]: value }));
    if (cardErrors[field]) setCardErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Card validation
  const validateCard = () => {
    const errs = {};
    const digits = cardData.number.replace(/\s/g, '');
    if (!digits || digits.length < 13)
      errs.number = 'Enter a valid card number (13–16 digits).';
    if (!cardData.name.trim() || cardData.name.trim().length < 2)
      errs.name = 'Enter the name as printed on the card.';

    const [mm, yy] = (cardData.expiry || '').split('/');
    const now      = new Date();
    const nowYear  = now.getFullYear() % 100;
    const nowMonth = now.getMonth() + 1;
    if (!mm || !yy || Number(mm) < 1 || Number(mm) > 12)
      errs.expiry = 'Enter a valid expiry (MM/YY).';
    else if (Number(yy) < nowYear || (Number(yy) === nowYear && Number(mm) < nowMonth))
      errs.expiry = 'This card has expired.';

    if (!cardData.cvv || cardData.cvv.length < 3)
      errs.cvv = 'CVV must be 3–4 digits.';

    return errs;
  };

  // Delete every purchased item from the backend cart
  const deleteCartItems = async (purchasedItems) => {
    const userId = user.id;
    await Promise.allSettled(
      purchasedItems.map(async (item) => {
        try {
          // try DELETE by item id if body-based DELETE is not supported
            const itemId = item.id || item._id;
            if (itemId) {
                console.log(itemId)
              await fetch(`https://mm-api-virid.vercel.app/api/cart/${itemId}`, {
                method: 'DELETE',
              });
            }
        } catch (err) {
          console.warn('Failed to delete cart item after payment:', item.name, err);
        }
      })
    );
  };

  // Make payment handler
  const handleMakePayment = async () => {
    // Validate shipping address
    if (!shippingAddress.trim()) {
      setShippingAddressError('Please enter a shipping address before making payment.');
      return;
    }
    if (paymentMode === null) {
      alert('🪙 Please select a payment method first!');
      return;
    }
    if (paymentMode === 'card') {
      const errs = validateCard();
      if (Object.keys(errs).length > 0) {
        setCardErrors(errs);
        return;
      }
    }
    setIsProcessing(true);
// send userid, shippingaddress and array of carditemids to create orders api end point https://mm-api-virid.vercel.app/api/orders
console.log(items);  
const response = await fetch(`https://mm-api-virid.vercel.app/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: user.id,
      shippingAddress: shippingAddress,
      cartItemIds: items.map(item => item.uniqueId),
    }),
  });

  const data = await response.json();
  console.log(data);  
    // Simulate payment processing delay then remove purchased items from cart
    await new Promise((resolve) => setTimeout(resolve, 1800));
    //await deleteCartItems(items);
    if (onPaymentSuccess) onPaymentSuccess();
    setIsProcessing(false);
    setPaymentSuccess(true);
  };

  // ---- Payment Success Screen ----
  if (paymentSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ fontSize: '5rem', marginBottom: '16px' }}>⭐</div>
        <h2 style={{ fontFamily: 'var(--font-retro)', fontSize: '1.1rem', color: 'var(--mario-green-dark)', marginBottom: '12px' }}>
          PAYMENT SUCCESS!
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#64748B', marginBottom: '28px' }}>
          Mamma Mia! Your order has been placed.<br />Get ready to power up! 🍄
        </p>
        <div style={{
          background: 'var(--cloud-white)', border: '4px solid var(--dark-text)', borderRadius: '20px',
          padding: '20px 28px', boxShadow: '0 8px 0 var(--dark-text)', marginBottom: '28px', textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
            <span>Order Total</span>
            <span style={{ color: 'var(--mario-green-dark)' }}>${grandTotal.toFixed(2)}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '6px' }}>
            Payment via {paymentMode === 'paynow' ? 'PayNow' : 'Credit / Debit Card'}
          </div>
        </div>
        <button className="mario-btn mario-btn-green" onClick={() => window.location.reload()}>
          Back to Shop 🏁
        </button>
      </div>
    );
  }

  // ---- Main Checkout UI ----
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '10px 0' }}>

      {/* Page Title */}
      <h2 className="section-title">
        <span>🧾</span> Order Review &amp; Payment <span>💰</span>
      </h2>

      {/* ── Section 1: Order Review ── */}
      <section style={{
        background: 'var(--cloud-white)', border: '4px solid var(--dark-text)', borderRadius: '20px',
        boxShadow: '0 8px 0 var(--dark-text)', padding: '24px', marginBottom: '28px',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-retro)', fontSize: '0.85rem', color: 'var(--mario-blue)',
          borderBottom: '3px solid var(--dark-text)', paddingBottom: '10px', marginTop: 0, marginBottom: '18px'
        }}>
          YOUR ORDER
        </h3>

        {/* Item rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          {items.map((item) => (
            <div key={item.uniqueId} style={{
              display: 'flex', alignItems: 'center', gap: '14px', padding: '14px',
              background: 'var(--sky-bg)', border: '2px solid var(--gray-border)', borderRadius: '14px', flexWrap: 'wrap'
            }}>
              {/* Thumbnail */}
              <div style={{
                width: '60px', height: '60px', borderRadius: '10px', border: '2px solid var(--dark-text)',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0, boxShadow: '0 3px 0 var(--dark-text)'
              }}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: '1.8rem' }}>🎮</span>}
              </div>

              {/* Name & variants */}
              <div style={{ flex: 1, minWidth: '140px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{item.name}</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#CBD5E1', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                    Color: {item.colour}
                  </span>
                  <span style={{ background: '#CBD5E1', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                    Size: {item.size}
                  </span>
                  <span style={{ background: 'var(--mario-yellow)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark-text)' }}>
                    Qty: {item.quantity}
                  </span>
                </div>
              </div>

              {/* Unit price */}
              <div style={{ textAlign: 'right', minWidth: '70px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Unit Price</div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>${item.price.toFixed(2)}</div>
              </div>

              {/* Line total */}
              <div style={{ textAlign: 'right', minWidth: '80px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Subtotal</div>
                <div className="product-price" style={{ fontSize: '1rem', margin: 0 }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order total summary */}
        <div style={{ borderTop: '2px dashed var(--gray-border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
            <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
            <span>Shipping</span>
            <span style={{ color: 'var(--mario-green-dark)', fontWeight: 700 }}>FREE 🚀</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800,
            borderTop: '2px solid var(--dark-text)', paddingTop: '12px', marginTop: '4px',
          }}>
            <span>TOTAL</span>
            <span className="product-price" style={{ fontSize: '1.3rem', margin: 0 }}>
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* ── Section 2: Payment Method ── */}
      <section style={{
        background: 'var(--cloud-white)', border: '4px solid var(--dark-text)', borderRadius: '20px',
        boxShadow: '0 8px 0 var(--dark-text)', padding: '24px', marginBottom: '28px',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-retro)', fontSize: '0.85rem', color: 'var(--mario-blue)',
          borderBottom: '3px solid var(--dark-text)', paddingBottom: '10px', marginTop: 0, marginBottom: '20px'
        }}>
          PAYMENT METHOD
        </h3>

        {/* Toggle buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>

          {/* PayNow */}
          <button
            id="payment-option-paynow"
            type="button"
            onClick={() => setPaymentMode('paynow')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              padding: '18px 12px', borderRadius: '16px',
              border: `3px solid ${paymentMode === 'paynow' ? 'var(--mario-red)' : 'var(--gray-border)'}`,
              background: paymentMode === 'paynow' ? 'linear-gradient(135deg,#fff0f0,#fff5f5)' : 'var(--sky-bg)',
              cursor: 'pointer',
              boxShadow: paymentMode === 'paynow' ? '0 5px 0 var(--mario-red-dark)' : '0 3px 0 var(--gray-border)',
              transform: paymentMode === 'paynow' ? 'translateY(-2px)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '2rem' }}>⚡</span>
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>PayNow</span>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Scan QR to pay instantly</span>
            {paymentMode === 'paynow' && (
              <span style={{ background: 'var(--mario-red)', color: '#fff', borderRadius: '20px', padding: '2px 10px', fontSize: '0.65rem', fontFamily: 'var(--font-retro)' }}>
                SELECTED
              </span>
            )}
          </button>

          {/* Card */}
          <button
            id="payment-option-card"
            type="button"
            onClick={() => setPaymentMode('card')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              padding: '18px 12px', borderRadius: '16px',
              border: `3px solid ${paymentMode === 'card' ? 'var(--mario-blue)' : 'var(--gray-border)'}`,
              background: paymentMode === 'card' ? 'linear-gradient(135deg,#f0f5ff,#f5f8ff)' : 'var(--sky-bg)',
              cursor: 'pointer',
              boxShadow: paymentMode === 'card' ? '0 5px 0 var(--mario-blue)' : '0 3px 0 var(--gray-border)',
              transform: paymentMode === 'card' ? 'translateY(-2px)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '2rem' }}>💳</span>
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Card Payment</span>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Credit or Debit card</span>
            {paymentMode === 'card' && (
              <span style={{ background: 'var(--mario-blue)', color: '#fff', borderRadius: '20px', padding: '2px 10px', fontSize: '0.65rem', fontFamily: 'var(--font-retro)' }}>
                SELECTED
              </span>
            )}
          </button>
        </div>

            {/* add shipping address pabel with textbox to enter 
            shipping address. validate for not empty value. if value is empty, show error message and prevent 
            from making payment */}
            <div style={{ marginTop: '20px', padding: '20px', border: `2px dashed ${shippingAddressError ? 'var(--mario-red)' : 'var(--gray-border)'}`, borderRadius: '14px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Shipping Address <span style={{ color: 'var(--mario-red)' }}>*</span></h3>
            <textarea
              rows="4"
              cols="50"
              placeholder="Enter your shipping address"
              required
              value={shippingAddress}
              onChange={(e) => {
                setShippingAddress(e.target.value);
                if (shippingAddressError) setShippingAddressError('');
              }}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px',
                borderRadius: '8px',
                border: `2px solid ${shippingAddressError ? 'var(--mario-red)' : 'var(--gray-border)'}`,
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                resize: 'vertical',
              }}
            />
            {shippingAddressError && (
              <p style={{ color: 'var(--mario-red)', fontSize: '0.78rem', margin: '6px 0 0', fontWeight: 600 }}>
                ⚠ {shippingAddressError}
              </p>
            )}
            </div>

        {/* Conditional payment panel */}
        {paymentMode === 'paynow' && <PayNowPanel />}
        {paymentMode === 'card' && (
          <CardPaymentPanel
            errors={cardErrors}
            cardData={cardData}
            onCardChange={handleCardChange}
          />
        )}
        {paymentMode === null && (
          <div style={{
            textAlign: 'center', padding: '24px', color: '#94A3B8', fontSize: '0.92rem',
            border: '2px dashed var(--gray-border)', borderRadius: '14px',
          }}>
            👆 Select a payment method above to continue
          </div>
        )}
      </section>

      {/* ── Section 3: Action Buttons ── */}
      <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', flexWrap: 'wrap', paddingBottom: '40px' }}>

        {/* Back to Cart */}
        <button
          id="btn-back-to-cart"
          className="mario-btn mario-btn-yellow"
          type="button"
          onClick={onBackToCart || (() => window.history.back())}
          disabled={isProcessing}
          style={{ fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ← Back to Cart
        </button>

        {/* Make Payment */}
        <button
          id="btn-make-payment"
          className="mario-btn mario-btn-green"
          type="button"
          onClick={handleMakePayment}
          disabled={isProcessing}
          style={{
            fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px',
            opacity: isProcessing ? 0.75 : 1,
            cursor: isProcessing ? 'wait' : 'pointer',
            minWidth: '170px', justifyContent: 'center'
          }}
        >
          {isProcessing ? <>⏳ Processing...</> : <>Pay ${grandTotal.toFixed(2)} 🪙</>}
        </button>
      </div>

      {/* Fade-in keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Checkout;