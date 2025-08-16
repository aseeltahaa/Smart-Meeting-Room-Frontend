import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

function AdminPanel() {
  const navigate = useNavigate();

  const handleGoToRegister = () => {
    navigate('/admin/register'); // ✅ takes you to RegisterPage
  };

  return (
    <>
      <Header />
      <div className="admin-container min-h-screen bg-gray-100 flex flex-col items-center p-6">
        <h2 className="text-3xl font-bold mb-6">Admin Panel</h2>

        <button
          onClick={handleGoToRegister}
          className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Register New User
        </button>
      </div>
      <Footer />
    </>
  );
}

export default AdminPanel;
