import React from 'react';
import './App.css';
import Products from './component/Products.jsx';

function App() {
  return (
    <>
      <h1 className="mario-header">Welcome to MarioMart</h1>

      <h2 className='mario-header'>Main Content</h2>

      <Products />

      <footer className="mario-footer">
        <p className="mario-footer-credits">Copyright Capstone Project by Shahul, Johnny and YingTong</p>
      </footer>
    </>
  );
}

export default App;

