import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
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
import { CartProvider } from './context/CartContext.jsx';

function App() {
  const [cartCount, setCartCount] = useState(0);

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
    //fetchCartCount();
    console.log("App useeffect");
  }, []);

  return (
    <CartProvider>
      <div className="app-container">
        <Navbar />

        {/* Page Content */}
        <main style={{ flex: 1, marginBottom: '40px' }}>
          <Outlet context={{ fetchCartCount }} />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;
