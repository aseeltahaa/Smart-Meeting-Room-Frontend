import React, { useState } from 'react';
import heroImage from '../assets/login.jpg';
import axios from '../api/axiosInstance'; 
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
  const [focusedInput, setFocusedInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFocus = (inputName) => setFocusedInput(inputName);
  const handleBlur = () => setFocusedInput('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/Auth/login', { email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          email: res.data.email,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
        })
      );

      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      navigate('/profile');
    } catch (err) {
      if (err.response) setError(err.response.data?.message || 'Invalid email or password');
      else if (err.request) setError('Server did not respond. Please try again later.');
      else setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputContainerClasses = (focused) =>
    `flex items-center border-2 rounded-lg px-3 py-2 transition-all duration-300 ${
      focused ? 'border-[#539D98] text-[#539D98]' : 'border-white/30 text-white'
    }`;

  const inputClasses = 'bg-transparent outline-none flex-1 text-white placeholder-white/70 text-sm';

  const iconClasses = (focused) =>
    `mr-3 min-w-[24px] transition-colors duration-300 ${focused ? 'text-[#539D98]' : 'text-white/70'}`;

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-black z-10 opacity-50"></div>
        <img src={heroImage} alt="bg" className="w-full h-full object-cover" />
      </div>

      {/* Login Form Container */}
      <div className="relative z-20 flex justify-center items-center h-full px-4">
        <form
          className="bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-xl w-full max-w-md shadow-md flex flex-col gap-4 text-white"
          onSubmit={handleSubmit}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">Login</h1>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Email Input */}
          <div className={inputContainerClasses(focusedInput === 'email')}>
            <svg
              className={iconClasses(focusedInput === 'email')}
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
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              className={inputClasses}
            />
          </div>

          {/* Password Input */}
          <div className={inputContainerClasses(focusedInput === 'password')}>
            <svg
              className={iconClasses(focusedInput === 'password')}
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
              className={inputClasses}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#539D98] rounded-lg text-white text-base mt-2 hover:bg-[#437e79] transition-colors duration-300"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center mt-4 text-sm text-[#90CAC7] underline cursor-pointer">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
