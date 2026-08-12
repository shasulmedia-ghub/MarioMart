import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import App from './App.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AdminDashboard from './component/AdminDashboard.jsx'
import ProductDetails from './component/ProductDetails.jsx'
import Products from './component/Products.jsx'
import Cart from './cart/cart.jsx'
import Checkout from './checkout/checkout.jsx'
import OrderHistory from './order/orderHistory.jsx'
import Fulfillment from './Admin/fulfillment.jsx'
import SalesDashboard from './Admin/dashboard.jsx'
import UserManagement from './Admin/UserManagement.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── App Layout Routes ── */}
          <Route element={<App />}>
            <Route path="/"         element={<Products />} />
            <Route path="/cart"     element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/orders"   element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          </Route>

          {/* Admin protected routes */}
          <Route path="/admin/dashboard"   element={<ProtectedRoute><SalesDashboard /></ProtectedRoute>} />
          <Route path="/admin/category"    element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/product"     element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/user"        element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/fulfillment" element={<ProtectedRoute><Fulfillment /></ProtectedRoute>} />

          {/* Product detail — public */}
          <Route path="/ProductDetails/:id" element={<ProductDetails />} />

          {/* Login/Register stand-alone routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
