import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import App from './App.jsx'
import Login from './pages/login.jsx'
import Register from './pages/Register.jsx'
import UpdateProfile from './components/UpdateProfile.jsx'
import ProfilePWChange from './components/ProfilePWChange.jsx'
import AdminDashboard from './component/AdminDashboard.jsx'
import ProductDetails from './component/ProductDetails.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/"         element={<App />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<UpdateProfile />} />
<Route path="/profile/password" element={<ProfilePWChange />} />

          {/* ── Protected routes ── */}
          <Route path="/cart"    element={<ProtectedRoute><App /></ProtectedRoute>} />
          <Route path="/orders"  element={<ProtectedRoute><App /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><App /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><App /></ProtectedRoute>} />

          {/* Admin protected routes */}
          <Route path="/admin/dashboard"   element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/category"    element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/product"     element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/user"        element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/fulfillment" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          {/* Product detail — public */}
          <Route path="/ProductDetails/:id" element={<ProductDetails />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
