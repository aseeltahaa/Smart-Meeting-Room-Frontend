import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/login.jpg';
import axios from '../api/axiosInstance';

function ResetPassword() {
  const [focusedInput, setFocusedInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFocus = (inputName) => setFocusedInput(inputName);
  const handleBlur = () => setFocusedInput('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess('');
    setLoading(true);

    if (newPassword !== confirmNewPassword) {
      setErrors(['New passwords do not match']);
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
      setErrors([]);
    } catch (err) {
      const apiError = err.response?.data;
      let newErrors = [];

      if (!apiError) {
        newErrors = ['Failed to change password. Please try again.'];
      } else if (typeof apiError === 'string') {
        newErrors = [apiError];
      } else if (apiError.message) {
        newErrors = [apiError.message];
      } else if (Array.isArray(apiError)) {
        // Handle array of errors [{code, description}, ...]
        newErrors = apiError.map((e) => e.description || JSON.stringify(e));
      } else if (Array.isArray(apiError.errors)) {
        newErrors = apiError.errors.map((e) => e.description || JSON.stringify(e));
      } else {
        newErrors = [JSON.stringify(apiError)];
      }

      setErrors(newErrors);
      console.error('Error changing password:', err);
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

          {/* Error messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-400 text-red-700 p-3 rounded">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success message */}
          {success && (
            <p className="text-green-600 font-semibold border border-green-400 bg-green-50 p-2 rounded">
              {success}
            </p>
          )}

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
