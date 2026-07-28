import React from 'react'
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  return (
    <>
    <h1 className="section-title">Admin Dashboard</h1>
    <p>Welcome to the Admin Dashboard</p>

    <div>
    <button className="mario-btn-green">Add Product</button>
    <button className="mario-btn-yellow">Update Product</button>
    <button className="mario-btn-red">Delete Product</button>
    </div>
    
    <div>
    <button className="mario-btn-green">Add Category</button>
    <button className="mario-btn-yellow">Update Category</button>
    <button className="mario-btn-red">Delete Category</button>
    </div>
    </>
  )
}

export default AdminDashboard