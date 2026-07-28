
import React from 'react';
import './App.css';
import Products from './component/Products.jsx';
import Navbar from './component/navbar.jsx';
import Hero from './component/hero.jsx';
import Footer from './component/footer.jsx';

//import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      {/* <h1 className="section-title">Welcome to MarioMart</h1> */}

      {/* <h2 className='mario-header'>Nav Bar on top</h2> */}

      <Navbar />
      {/* <Hero /> */}
      <Products />
      <Footer />

      {/* <footer className="mario-footer">
        <p className="mario-footer-credits">Copyright Capstone Project by Shahul, Johnny and YingTong</p>
      </footer> */}
    </>
  );
}

export default App;

