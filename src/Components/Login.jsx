import React, { useState } from 'react';
import heroImage from '../assets/login.jpg';
import './Login.css';

function Login() {
  const [focusedInput, setFocusedInput] = useState('');

  const handleFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  const handleBlur = () => {
    setFocusedInput('');
  };

  return (
    <section
      className="relative h-screen w-full"
      style={{ overflow: 'hidden', top: '-140px', marginBottom: '-140px' }}
    >
      <div
        className="absolute w-full"
        style={{ height: 'calc(100vh + 140px)' }}
      >
        <div className="bg-black inset-0 absolute z-10 opacity-50"></div>
        <img src={heroImage} alt="bg" className="w-full object-cover h-full" />
      </div>

      <div
        className="container relative z-20 flex justify-center items-center h-full px-4"
        style={{ top: window.innerWidth >= 768 ? '0px' : '35px' }}
      >
        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <h1>Login</h1>

          {/* Email Input */}
          <div
            className={`input-container ${
              focusedInput === 'email' ? 'focused' : ''
            }`}
          >
            <svg
              className="input-icon"
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
            >
              <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" />
            </svg>
            <input
              type="email"
              id="login-email"
              placeholder="Email"
              required
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
            />
          </div>

          {/* Password Input */}
          <div
            className={`input-container ${
              focusedInput === 'password' ? 'focused' : ''
            }`}
          >
            <svg
              className="input-icon"
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
            >
              <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" />
            </svg>
            <input
              type="password"
              id="login-password"
              placeholder="Password"
              required
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
            />
          </div>

          {/* Login Button */}
          <button type="submit" className="btn">
            Login
          </button>

          {/* Forgot Password link below the button */}
          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Login;
