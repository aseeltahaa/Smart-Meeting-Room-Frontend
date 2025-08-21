import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/login.jpg';
import logo from '../assets/logo.png';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [focusedInput, setFocusedInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFocus = (inputName) => setFocusedInput(inputName);
  const handleBlur = () => setFocusedInput('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/Auth/change-password',
        { currentPassword, newPassword, confirmNewPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(res.data || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      if (err.response) setError(err.response.data || 'Error changing password');
      else if (err.request) setError('Server did not respond. Please try again later.');
      else setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <img src={heroImage} alt="bg" className="w-full h-full object-cover" />
      </div>

      {/* Form Container */}
      <div className="relative z-20 flex justify-center items-center h-full px-4">
        <form
          className="bg-white/10 backdrop-blur-md p-12 md:p-16 rounded-xl max-w-md w-full flex flex-col gap-3 shadow-md text-white"
          onSubmit={handleSubmit}
        >
          <h1 className="text-2xl font-bold text-center mb-1">Change Password</h1>

          {/* Messages */}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-400 text-center">{success}</p>}

          {/* Current Password */}
          <div
            className={`flex items-center border-2 rounded-lg p-2 transition-colors ${
              focusedInput === 'currentPassword' ? 'border-teal-500' : 'border-white/30'
            }`}
          >
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              onFocus={() => handleFocus('currentPassword')}
              onBlur={handleBlur}
              className="bg-transparent outline-none flex-1 text-white placeholder-white/70 text-sm"
            />
          </div>

          {/* New Password */}
          <div
            className={`flex items-center border-2 rounded-lg p-2 transition-colors ${
              focusedInput === 'newPassword' ? 'border-teal-500' : 'border-white/30'
            }`}
          >
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              onFocus={() => handleFocus('newPassword')}
              onBlur={handleBlur}
              className="bg-transparent outline-none flex-1 text-white placeholder-white/70 text-sm"
            />
          </div>

          {/* Confirm New Password */}
          <div
            className={`flex items-center border-2 rounded-lg p-2 transition-colors ${
              focusedInput === 'confirmNewPassword' ? 'border-teal-500' : 'border-white/30'
            }`}
          >
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              onFocus={() => handleFocus('confirmNewPassword')}
              onBlur={handleBlur}
              className="bg-transparent outline-none flex-1 text-white placeholder-white/70 text-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-white font-medium transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ResetPassword;
