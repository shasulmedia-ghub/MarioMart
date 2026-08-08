import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import AdminData from './AdminData.jsx';

const DEFAULT_CATEGORIES = ["Power-Up", "Invincibility", "Gear"];
const MOCK_DATABASE = [
  {
    id: 1,
    product_name: "Super Mushroom",
    category_id: "Power-Up",
    price: "15.99",
    description: "Instantly doubles your size and allows you to smash through brick blocks with ease. Essential for beginners!",
    image_url: "🍄",
    stockStatus: "in"
  },
  {
    id: 2,
    product_name: "Fire Flower",
    category_id: "Power-Up",
    price: "24.99",
    description: "Grants the power of pyromancy! Toss bouncing fireballs at enemies to clear your path.",
    image_url: "🌻",
    stockStatus: "low"
  },
  {
    id: 3,
    product_name: "Super Star",
    category_id: "Invincibility",
    price: "99.99",
    description: "Grants temporary invincibility to all damage and increases running speed. Play the iconic theme music!",
    image_url: "⭐",
    stockStatus: "out"
  }
];

function AdminDashboard() {
  const [products, setProducts] = useState(MOCK_DATABASE);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    const loadDBData = async () => {
      try {
        // Fetch products
        const prodRes = await fetch('https://mm-api-virid.vercel.app/api/products');
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData && prodData.length > 0) {
            setProducts(prodData);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch products for Admin Dashboard. Using mocks. Error:", err.message);
      }

      try {
        // Fetch categories
        const catRes = await fetch('https://mm-api-virid.vercel.app/api/categories');
        if (catRes.ok) {
          // changed this
          // const catData = await catRes.json();
          // const catNames = catData.map(c => c.name);
          // if (catNames.length > 0) {
          //   setCategories(catNames);
          // }
          const catData = await catRes.json();
          if (catData && catData.length > 0) {
            setCategories(catData);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch categories for Admin Dashboard. Using mocks. Error:", err.message);
      }
    };

    loadDBData();
  }, []);

  return (
    <AdminData 
      products={products}
      setProducts={setProducts}
      categories={categories}
      setCategories={setCategories}
    />
  );
}

export default AdminDashboard