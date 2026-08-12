import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

// ---- Status badge colours ----
const STATUS_STYLES = {
  pending:   { bg: '#FEF3C7', color: '#92400E', label: '⏳ Pending' },
  paid:      { bg: '#D1FAE5', color: '#065F46', label: '✅ Paid' },
  shipped:   { bg: '#DBEAFE', color: '#1E40AF', label: '📦 Shipped' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: '❌ Cancelled' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || { bg: '#E5E7EB', color: '#374151', label: status };
  return (
    <span style={{
      background: s.bg, color: s.color, padding: '3px 12px',
      borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
      fontFamily: 'var(--font-retro)', whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
};

// ---- Single Order Card ----
const OrderCard = ({ order, handleUpdateStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const items = order.orderItems || [];
  const createdDate = new Date(order.created_at).toLocaleDateString('en-SG', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div style={{
      background: 'var(--cloud-white)',
      border: '3px solid var(--dark-text)',
      borderRadius: '16px',
      boxShadow: '0 6px 0 var(--dark-text)',
      overflow: 'hidden',
      animation: 'fadeInUp 0.35s ease both',
    }}>
      {/* ── Summary Row ── */}
      <div
        style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px',
          padding: '18px 22px', cursor: 'pointer', userSelect: 'none',
        }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {/* Order ID & Date */}
        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{
            fontFamily: 'var(--font-retro)', fontSize: '0.7rem', color: 'var(--mario-blue)',
            marginBottom: '4px',
          }}>
            ORDER #{order.id}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>{createdDate}</div>
          <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px', fontWeight: 600 }}>
            {order.first_name} {order.last_name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{order.email}</div>
        </div>

        {/* Total */}
        <div style={{ textAlign: 'center', minWidth: '90px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Total</div>
          <div className="product-price" style={{ fontSize: '1.05rem', margin: 0 }}>
            ${parseFloat(order.total_amount).toFixed(2)}
          </div>
        </div>

        {/* Status badge */}
        <div style={{ textAlign: 'center', minWidth: '100px' }}>
          <StatusBadge status={order.status} />
        </div>
        
        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
          <button
            className="mario-btn mario-btn-green"
            onClick={() => handleUpdateStatus(order.id, 'shipped')}
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            Complete
          </button>
          <button
            className="mario-btn mario-btn-red"
            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            Cancel
          </button>
        </div>

        {/* Toggle icon */}
        <span style={{
          fontSize: '1.2rem', transition: 'transform 0.25s',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
          marginLeft: '8px'
        }}>
          ▼
        </span>
      </div>

      {/* ── Expanded Details ── */}
      {expanded && (
        <div style={{
          borderTop: '2px dashed var(--gray-border)', padding: '18px 22px',
          background: 'var(--sky-bg)',
        }}>
          {/* Shipping address */}
          {order.shipping_address && (
            <div style={{
              marginBottom: '14px', fontSize: '0.85rem', color: '#475569',
              display: 'flex', gap: '6px', alignItems: 'flex-start',
            }}>
              <span>📍</span>
              <span style={{ whiteSpace: 'pre-line' }}>{order.shipping_address}</span>
            </div>
          )}

          {/* Item list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                background: 'var(--cloud-white)', border: '2px solid var(--gray-border)',
                borderRadius: '12px', flexWrap: 'wrap',
              }}>
                {/* Name + variants */}
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.product_name}</div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#CBD5E1', padding: '2px 7px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>
                      Color: {item.colour}
                    </span>
                    <span style={{ background: '#CBD5E1', padding: '2px 7px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>
                      Size: {item.size}
                    </span>
                    <span style={{ background: 'var(--mario-yellow)', padding: '2px 7px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--dark-text)' }}>
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', minWidth: '70px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Unit</div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>${parseFloat(item.unit_price).toFixed(2)}</div>
                </div>

                {/* Line total */}
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Subtotal</div>
                  <div className="product-price" style={{ fontSize: '0.95rem', margin: 0 }}>
                    ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order total footer */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px',
            marginTop: '14px', paddingTop: '12px', borderTop: '2px solid var(--gray-border)',
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Order Total:</span>
            <span className="product-price" style={{ fontSize: '1.15rem', margin: 0 }}>
              ${parseFloat(order.total_amount).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Main Component ----
export default function Fulfillment() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://mm-api-virid.vercel.app/api/ordersActive');
      if (!response.ok) {
        throw new Error('Failed to fetch active orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`https://mm-api-virid.vercel.app/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`Failed to update order status`);
      }

      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      {/* Page Content */}
      <main style={{ flex: 1, marginBottom: '40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '10px 0' }}>
          
          {/* Page heading */}
      <h2 className="section-title">
        <span>📦</span> Fulfillment <span>🚀</span>
      </h2>

      {/* Loading state */}
      {loading && (
        <div style={{
          textAlign: 'center', padding: '60px 20px', fontSize: '1.8rem',
          animation: 'pulse 1.2s infinite',
        }}>
          🍄 Loading orders...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          background: '#FEE2E2', border: '3px solid var(--mario-red)', borderRadius: '16px',
          padding: '20px', textAlign: 'center', marginBottom: '24px',
          boxShadow: '0 6px 0 var(--mario-red-dark)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>❌</div>
          <div style={{ fontWeight: 700 }}>Failed to load orders</div>
          <div style={{ fontSize: '0.85rem', color: '#991B1B', marginTop: '4px' }}>{error}</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--cloud-white)', border: '4px solid var(--dark-text)',
          borderRadius: '20px', boxShadow: '0 8px 0 var(--dark-text)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '12px' }}>📭</div>
          <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.85rem', color: 'var(--mario-blue)', marginBottom: '10px' }}>
            NO ACTIVE ORDERS
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            All caught up!
          </p>
        </div>
      )}

      {/* Order sections */}
      {!loading && !error && orders.length > 0 && (
        <section style={{
          background: 'var(--cloud-white)',
          border: '4px solid var(--dark-text)',
          borderRadius: '20px',
          boxShadow: '0 8px 0 var(--dark-text)',
          padding: '24px',
          marginBottom: '28px',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-retro)', fontSize: '0.85rem', color: 'var(--mario-blue)',
            borderBottom: '3px solid var(--dark-text)', paddingBottom: '10px',
            marginTop: 0, marginBottom: '20px',
          }}>
            🔥 ACTIVE ORDERS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} handleUpdateStatus={handleUpdateStatus} />
            ))}
          </div>
        </section>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
      `}</style>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}