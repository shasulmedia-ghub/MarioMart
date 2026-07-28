import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";

import ProtectedRoute from "./component/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}

        <Route path="/" element={<Home />} />

        <Route path="/pages/login" element={<Login />} />

        <Route path="/pages/register" element={<Register />} />

        {/* Protected Route */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}

        <Route
          path="*"
          element={
            <div
              className="container text-center py-5"
            >
              <h1>404</h1>
              <h4>Page Not Found</h4>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;