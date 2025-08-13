import React, { useState } from 'react';
import logo from '../assets/logo.png';
import '../App.css';
import { Link } from 'react-router-dom';

function HeaderTest() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative" style={{ top: '-25px' }}>
      <div
        className="absolute inset-0 bg-gradient-to-b from-black to-transparent z-10 hidden md:block"
        style={{ bottom: '-40px', pointerEvents: 'none' }}
      ></div>

      <header
        className="relative z-50 mx-auto px-6 py-10 flex justify-between items-center"
        style={{ maxWidth: '1200px' }}
      >
        <div className="flex justify-center items-center relative">
          <Link to="/">
            <img src={logo} alt="Logo" style={{ marginRight: '50px', width: '50px' }} />
          </Link>
          <nav className="hidden md:inline">
            <Link to="/booking" className="text-white py-8 px-4 no-underline">Booking</Link>
            <Link to="/AboutUs" className="text-white py-8 px-4 no-underline">About Us</Link>
            <Link to="/admin" className="text-white py-8 px-4 no-underline">Admin Panel</Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4 relative">
          <div className="hidden md:flex items-center gap-4 relative">
            <Link to="/Login" className="text-white py-2 px-4 no-underline">Login</Link>
           <Link to="/profile">
            <button
              className="text-white border-none rounded-full py-3 px-5 font-bold text-sm cursor-pointer bg-[#539D98] hover:bg-[#437e79] transition-colors duration-300 ease-in-out"
            >
              Profile
            </button>
          </Link>
          </div>

        </div>

        {/* Burger menu icon */}
        <button
          className="md:hidden relative z-60 focus:outline-none focus:ring-0"
          aria-label="Open menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#e3e3e3">
          <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
          </svg>
        </button>
      </header>

      {/* Mobile menu - right side drawer */}
      {menuOpen && (
        <div className="fixed top-0 right-0 h-full w-3/4 bg-white bg-opacity-80 z-70 flex flex-col items-center justify-center md:hidden transition-all duration-300 ease-in-out">
          <nav className="flex flex-col gap-8">
            <Link to="/booking" className="text-xl" onClick={() => setMenuOpen(false)}>Booking</Link>
            <Link to="/about"  className="text-xl" onClick={() => setMenuOpen(false)}>About Us</Link>
            <Link to="/admin"  className="text-xl" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
            <Link to="/Login"  className="text-xl" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/profile" className="text-xl" onClick={() => setMenuOpen(false)}>Profile</Link> 
          </nav>

          {/* Close button */}
          <button
            className="absolute top-6 right-6 text-3xl focus:outline-none focus:ring-0 bg-white"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default HeaderTest;
