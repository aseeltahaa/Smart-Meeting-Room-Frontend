import React from 'react';
import '../App.css'; 
import heroImage from '../assets/main-bg.jpg';
import { Link } from 'react-router-dom';

function MainSection() {
  return (
    <section
      className="relative md:h-689px h-450 w-full"
      style={{ overflow: 'hidden', top: '-140px' }}
    >
      <div className="absolute md:h-689px h-450 w-full">
        <div className="bg-black inset-0 absolute z-10 opacity-50"></div>
        <img
          src={heroImage}
          alt="Hero"
          className="w-full object-cover h-full"
        />
      </div>

      <div className="relative mx-auto pt-24 md:pt-50 px-6 z-10" style={{ maxWidth: '1200px' }}>
        <div style={{ maxWidth: '538px' }}>
          <h1 className="text-white text-36 sm:text-60 font-bold leading-none">
            <span className="text-white">Think Smart</span>
            <br />
            <span className="text-brand-teal">Book SmartSpace</span>
          </h1>

          <p
            className="text-white text-16 sm:text-20"
            style={{ maxWidth: '499px', marginTop: '20px' }}
          >
            Book rooms fast. Avoid conflicts. Stay organized with SmartSpace.
          </p>

          <Link to="/booking">
            <button
              className="bg-white text-brand-teal-dark border-none py-28 px-12 w-full md:w-auto"
              style={{ marginTop: '30px', borderRadius: '4px' }}
            >
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default MainSection;
