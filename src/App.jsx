import React, { useState, useEffect } from 'react';
import './App.css';
import Products from './component/Products.jsx';
import ProductsData from './component/ProductsData.jsx';
import UserProducts from './component/UserProducts.jsx';
import ProductDetails from './component/ProductDetails';

//import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cart from './cart/cart.jsx';
import Checkout from './checkout/checkout.jsx';
import OrderHistory from './order/orderHistory.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProductModal from './components/ProductModal.jsx';

function App() {
  const [view, setView] = useState('shop'); // 'shop' | 'cart' | 'checkout' | 'orders'
  const [cartCount, setCartCount] = useState(0);
  const [checkoutData, setCheckoutData] = useState({ items: [], subtotal: 0 });

  // Central navigation handler — Cart passes ('checkout', payload) or ('shop')
  const handleSwitchView = (targetView, payload = {}) => {
    if (targetView === 'checkout' && payload.items) {
      setCheckoutData({ items: payload.items, subtotal: payload.subtotal || 0 });
    }
    setView(targetView);
  };

  const fetchCartCount = async () => {
    try {
      const response = await fetch('https://mm-api-virid.vercel.app/api/cart/1');
      if (response.ok) {
        const data = await response.json();
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

        // Count sum of quantities of items in cart
        const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
        setCartCount(count);
      }
    } catch (err) {
      console.warn("Error fetching cart count:", err);
    }
  };

      {/* <Products/> */}
      {/* <ProductsData/> */}
      <UserProducts/>

      

  useEffect(() => {
    fetchCartCount();
  }, [view]);

  return (
    <div className="app-container">
      <Navbar onSwitchView={handleSwitchView} />

      {/* Page Content */}
      <main style={{ flex: 1, marginBottom: '40px' }}>
        {view === 'shop' ? (
          <Products onAddToCartSuccess={fetchCartCount} />
        ) : view === 'cart' ? (
          <Cart onSwitchView={handleSwitchView} />
        ) : view === 'orders' ? (
          <OrderHistory onSwitchView={handleSwitchView} />
        ) : (
          <Checkout
            checkoutItems={checkoutData.items}
            totalAmount={checkoutData.subtotal}
            onBackToCart={() => setView('cart')}
            onPaymentSuccess={fetchCartCount}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
