import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import AdminLogin from './component/AdminLogin.jsx';
import AdminDashboard from './component/AdminDashboard.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        
        {/* use this to test the AdminLogin and AdminDashboard page */}
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
