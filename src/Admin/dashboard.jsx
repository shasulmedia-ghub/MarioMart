import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const API_BASE = 'https://mm-api-virid.vercel.app';

export default function SalesDashboard() {
  const [salesData, setSalesData] = useState(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState(null);

  const [activeOrders, setActiveOrders] = useState([]);
  const [activeLoading, setActiveLoading] = useState(true);
  const [activeError, setActiveError] = useState(null);

  const [lowStock, setLowStock] = useState([]);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState(null);

  useEffect(() => {
    fetchTodaySales();
    fetchActiveOrders();
    fetchLowStock();
  }, []);

  const fetchTodaySales = async () => {
    try {
      setSalesLoading(true);
      const res = await fetch(`${API_BASE}/api/dashboard/today-sales`);
      if (!res.ok) throw new Error('Failed to fetch today sales');
      const data = await res.json();
      setSalesData(data);
    } catch (err) {
      setSalesError(err.message);
    } finally {
      setSalesLoading(false);
    }
  };

  const fetchActiveOrders = async () => {
    try {
      setActiveLoading(true);
      const res = await fetch(`${API_BASE}/api/dashboard/active-orders-summary`);
      if (!res.ok) throw new Error('Failed to fetch active orders');
      const data = await res.json();
      setActiveOrders(data);
    } catch (err) {
      setActiveError(err.message);
    } finally {
      setActiveLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      setStockLoading(true);
      const res = await fetch(`${API_BASE}/api/dashboard/low-stock`);
      if (!res.ok) throw new Error('Failed to fetch low stock');
      const data = await res.json();
      setLowStock(data);
    } catch (err) {
      setStockError(err.message);
    } finally {
      setStockLoading(false);
    }
  };

  const pendingCount = activeOrders.find(o => o.status === 'pending')?.order_count || 0;
  const paidCount = activeOrders.find(o => o.status === 'paid')?.order_count || 0;
  const combinedTotal = activeOrders.reduce((sum, o) => sum + parseFloat(o.total_value || 0), 0);

  return (
    <div className="app-container">
      <Navbar />
      
      <main style={{ flex: 1, marginBottom: '40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
          
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span>🍄</span> Sales Dashboard <span>⭐</span>
          </h2>

          {/* Three Summary Cards Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            
            {/* Card 1: Today's Sales */}
            <div style={{
              background: 'var(--cloud-white)', border: '4px solid var(--dark-text)',
              borderRadius: '20px', boxShadow: '0 8px 0 var(--dark-text)', padding: '24px',
            }}>
              <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.85rem', color: 'var(--mario-blue)', borderBottom: '3px solid var(--dark-text)', paddingBottom: '10px', marginTop: 0, marginBottom: '20px' }}>
                💰 Today's Sales
              </h3>
              {salesLoading ? (
                <div style={{ animation: 'pulse 1.2s infinite', textAlign: 'center' }}>Loading...</div>
              ) : salesError ? (
                <div style={{ color: 'var(--mario-red)', fontWeight: 'bold' }}>❌ {salesError}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>Total Revenue:</span>
                    <strong className="product-price" style={{ fontSize: '1.2rem', margin: 0 }}>${parseFloat(salesData?.total_revenue || 0).toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>Orders Placed:</span>
                    <strong style={{ fontSize: '1.1rem' }}>{salesData?.total_orders || 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>Avg Order Value:</span>
                    <strong style={{ fontSize: '1.1rem' }}>${parseFloat(salesData?.avg_order_value || 0).toFixed(2)}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Active Orders */}
            <div style={{
              background: 'var(--cloud-white)', border: '4px solid var(--dark-text)',
              borderRadius: '20px', boxShadow: '0 8px 0 var(--dark-text)', padding: '24px',
            }}>
              <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.85rem', color: 'var(--mario-blue)', borderBottom: '3px solid var(--dark-text)', paddingBottom: '10px', marginTop: 0, marginBottom: '20px' }}>
                📦 Active Orders
              </h3>
              {activeLoading ? (
                <div style={{ animation: 'pulse 1.2s infinite', textAlign: 'center' }}>Loading...</div>
              ) : activeError ? (
                <div style={{ color: 'var(--mario-red)', fontWeight: 'bold' }}>❌ {activeError}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>Pending Orders:</span>
                    <strong style={{ fontSize: '1.1rem' }}>{pendingCount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>Paid Orders:</span>
                    <strong style={{ fontSize: '1.1rem' }}>{paidCount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed var(--gray-border)', paddingTop: '10px' }}>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>Combined Value:</span>
                    <strong className="product-price" style={{ fontSize: '1.2rem', margin: 0 }}>${combinedTotal.toFixed(2)}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Low Stock Summary */}
            <div style={{
              background: 'var(--cloud-white)', border: '4px solid var(--dark-text)',
              borderRadius: '20px', boxShadow: '0 8px 0 var(--dark-text)', padding: '24px',
            }}>
              <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.85rem', color: 'var(--mario-blue)', borderBottom: '3px solid var(--dark-text)', paddingBottom: '10px', marginTop: 0, marginBottom: '20px' }}>
                ⚠️ Low Stock Alert
              </h3>
              {stockLoading ? (
                <div style={{ animation: 'pulse 1.2s infinite', textAlign: 'center' }}>Loading...</div>
              ) : stockError ? (
                <div style={{ color: 'var(--mario-red)', fontWeight: 'bold' }}>❌ {stockError}</div>
              ) : (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <div style={{ fontSize: '3rem', lineHeight: 1 }}>{lowStock.length}</div>
                  <p style={{ margin: '10px 0 0', fontWeight: 700, color: '#64748B' }}>Variants below 10 units</p>
                </div>
              )}
            </div>

          </div>

          {/* Data Section: Low Stock List */}
          <section style={{
            background: 'var(--cloud-white)', border: '4px solid var(--dark-text)',
            borderRadius: '20px', boxShadow: '0 8px 0 var(--dark-text)', padding: '24px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.85rem', color: 'var(--mario-blue)', borderBottom: '3px solid var(--dark-text)', paddingBottom: '10px', marginTop: 0, marginBottom: '20px' }}>
              📋 LOW STOCK DETAILS
            </h3>
            
            {stockLoading ? (
              <div style={{ animation: 'pulse 1.2s infinite', textAlign: 'center' }}>Loading low stock details...</div>
            ) : stockError ? (
              <div style={{ color: 'var(--mario-red)', fontWeight: 'bold' }}>❌ {stockError}</div>
            ) : lowStock.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748B', padding: '30px', border: '2px dashed var(--gray-border)', borderRadius: '14px' }}>
                No items are currently low on stock. All good! 🍄
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '14px', borderBottom: '3px solid var(--dark-text)', fontFamily: 'var(--font-retro)', fontSize: '0.75rem' }}>Product Name</th>
                      <th style={{ padding: '14px', borderBottom: '3px solid var(--dark-text)', fontFamily: 'var(--font-retro)', fontSize: '0.75rem' }}>Colour</th>
                      <th style={{ padding: '14px', borderBottom: '3px solid var(--dark-text)', fontFamily: 'var(--font-retro)', fontSize: '0.75rem' }}>Size</th>
                      <th style={{ padding: '14px', borderBottom: '3px solid var(--dark-text)', fontFamily: 'var(--font-retro)', fontSize: '0.75rem' }}>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((item, idx) => (
                      <tr key={idx} style={{ 
                        borderBottom: '2px solid var(--gray-border)',
                        backgroundColor: item.stock_quantity == 0 ? '#FEE2E2' : 'transparent',
                        color: item.stock_quantity == 0 ? 'var(--mario-red-dark)' : 'inherit'
                      }}>
                        <td style={{ padding: '14px', fontWeight: item.stock_quantity == 0 ? 'bold' : 'normal' }}>{item.product_name}</td>
                        <td style={{ padding: '14px' }}>{item.colour}</td>
                        <td style={{ padding: '14px' }}>{item.size}</td>
                        <td style={{ padding: '14px', fontWeight: 'bold' }}>
                          {item.stock_quantity == 0 ? 'Out of Stock' : item.stock_quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50%      { opacity: 0.5; }
            }
          `}</style>
        </div>
      </main>

      <Footer />
    </div>
  );
}