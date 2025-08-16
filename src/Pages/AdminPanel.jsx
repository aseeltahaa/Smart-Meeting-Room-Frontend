import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import DeleteRoom from '../Components/DeleteRoom';
import DeleteFeature from '../Components/DeleteFeature';

function AdminPanel() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="admin-container min-h-screen bg-gray-100 flex flex-col items-center p-6">
        <h2 className="text-3xl font-bold mb-6">Admin Panel</h2>

        {/* Registration Buttons */}
        <button
          onClick={() => navigate('/admin/register')}
          className="mb-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Register New User
        </button>

        <button
          onClick={() => navigate('/admin/features')}
          className="mb-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Register Room Feature
        </button>

        <button
          onClick={() => navigate('/admin/rooms')}
          className="mb-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Register New Room
        </button>

        {/* Delete Components */}
        <DeleteRoom />
        <DeleteFeature />
      </div>
      <Footer />
    </>
  );
}

export default AdminPanel;
