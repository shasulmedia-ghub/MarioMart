import React, { useState, useEffect } from 'react';
  import { useAuth } from '../context/AuthContext';

/* ============================================================
   Order History Page
   - Fetches all orders for the current user
   - Splits into "Current Orders" (pending / paid)
     and "Order History" (shipped / cancelled)
   - Each order shows a summary row; clicking "Show Details"
     expands to reveal the individual order items
   ============================================================ */

const API_BASE = 'https://mm-api-virid.vercel.app';

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
const OrderCard = ({ order }) => {
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
        {/* display shipping address here */}
        <div>
          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>📍</span>{order.shipping_address}
          </div>
        {/* display shipping address here */}
        </div>

        {/* Item count */}
        <div style={{ textAlign: 'center', minWidth: '80px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Items</div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{items.length}</div>
        </div>

        {/* Total */}
        <div style={{ textAlign: 'center', minWidth: '90px' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Total</div>
          <div className="product-price" style={{ fontSize: '1.05rem', margin: 0 }}>
            ${parseFloat(order.total_amount).toFixed(2)}
          </div>
        </div>

        {/* Status badge */}
        <StatusBadge status={order.status} />

        {/* Toggle icon */}
        <span style={{
          fontSize: '1.2rem', transition: 'transform 0.25s',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
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
            {items.map((item) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                background: 'var(--cloud-white)', border: '2px solid var(--gray-border)',
                borderRadius: '12px', flexWrap: 'wrap',
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: '50px', height: '50px', borderRadius: '8px',
                  border: '2px solid var(--dark-text)', background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  {item.default_image
                    ? <img src={item.default_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <span style={{ fontSize: '1.5rem' }}>🎮</span>}
                </div>

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

// ---- Section wrapper ----
const OrderSection = ({ title, emoji, orders, emptyMessage }) => (
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
      {emoji} {title}
    </h3>

    {orders.length === 0 ? (
      <div style={{
        textAlign: 'center', padding: '30px', color: '#94A3B8', fontSize: '0.92rem',
        border: '2px dashed var(--gray-border)', borderRadius: '14px',
      }}>
        {emptyMessage}
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    )}
  </section>
);

// ---- Main Component ----
const OrderHistory = ({ onSwitchView }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, role, isAuthenticated, logout } = useAuth();
  const userId = user.id;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/orders/user/${userId}`);
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const currentOrders = orders.filter((o) => o.status === 'pending' || o.status === 'paid');
  const historyOrders = orders.filter((o) => o.status === 'shipped' || o.status === 'cancelled');

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '10px 0' }}>

      {/* Page heading */}
      <h2 className="section-title">
        <span>📋</span> My Orders <span>🏆</span>
      </h2>

      {/* Back to Shop */}
      <button
        className="mario-btn mario-btn-yellow"
        onClick={() => onSwitchView('shop')}
        style={{ marginBottom: '24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        ← Back to Shop
      </button>

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
            NO ORDERS YET
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            Start shopping to see your orders here!
          </p>
          <button
            className="mario-btn mario-btn-green"
            onClick={() => onSwitchView('shop')}
            style={{ marginTop: '16px', fontSize: '0.88rem' }}
          >
            Start Shopping 🏁
          </button>
        </div>
      )}

      {/* Order sections */}
      {!loading && !error && orders.length > 0 && (
        <>
          <OrderSection
            title="CURRENT ORDERS"
            emoji="🔥"
            orders={currentOrders}
            emptyMessage="No active orders right now."
          />
          <OrderSection
            title="ORDER HISTORY"
            emoji="📜"
            orders={historyOrders}
            emptyMessage="No past orders yet."
          />
        </>
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
  );
};

export default OrderHistory;
