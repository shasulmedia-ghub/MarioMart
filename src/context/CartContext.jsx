import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, role, isAuthenticated, token } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    const userId = user?.id || user?.userId || user?.user_id;
    if (!isAuthenticated || role !== 'customer' || !userId) {
      setCartCount(0);
      return;
    }

    try {
      const authToken = token || localStorage.getItem('mm_token');
      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const response = await fetch(`https://mm-api-virid.vercel.app/api/cart/${userId}/summary`, { headers });
      if (response.ok) {
        const data = await response.json();
        const count = data?.item_count ?? data?.itemCount ?? data?.data?.item_count ?? 0;
        setCartCount(count);
      }
    } catch (err) {
      console.error('Failed to fetch cart item count:', err);
    }
  }, [user, role, isAuthenticated, token]);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) return { cartCount: 0, refreshCartCount: () => {} };
  return ctx;
}
