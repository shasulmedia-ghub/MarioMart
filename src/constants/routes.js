// =============================================
// MarioMart Route Constants
// File: src/constants/routes.js
// =============================================

const ROUTES = {
  // Public Routes
  HOME: "/",
  LOGIN: "/pages/login",
  REGISTER: "/pages/register",
  FORGOT_PASSWORD: "/components/ProfilePWChange",

  // Customer Routes
  DASHBOARD: "/pages/dashboard",
  PROFILE: "/components/UpdateProfile",

  // Product Routes (Member 2)
  PRODUCTS: "/products",
  PRODUCT_DETAILS: "/products/:id",
  SEARCH: "/search",

  // Shopping Cart (Member 3)
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDER_CONFIRMATION: "/order-confirmation",
  ORDERS: "/orders",
  ORDER_DETAILS: "/orders/:id",

  // Admin Routes (Member 2)
  ADMIN: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_CATEGORIES: "/admin/categories",

  // Error Pages
  NOT_FOUND: "*",
};

export default ROUTES;