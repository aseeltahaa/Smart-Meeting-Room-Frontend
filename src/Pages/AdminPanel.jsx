import React from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import DeleteRoom from '../Components/DeleteRoom';
import DeleteFeature from '../Components/DeleteFeature';
import AddFeature from '../Components/AddFeature'; // Import the new component
import DeleteFeatureFromRoom from '../Components/DeleteFeatureFromRoom';

function AdminPanel() {
  return (
    <>
      <Header />
      <div className="admin-container min-h-screen bg-gray-100 flex flex-col items-center p-6">
        <h2 className="text-3xl font-bold mb-6">Admin Panel</h2>

        {/* Registration Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <button
            onClick={() => window.location.href = '/admin/register'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Register New User
          </button>

          <button
            onClick={() => window.location.href = '/admin/rooms'}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
          >
            Register New Room
          </button>

          <button
            onClick={() => window.location.href = '/admin/update-room'}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 transition"
          >
            Update Room
          </button>

          <button
            onClick={() => window.location.href = '/admin/features'}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg shadow hover:bg-pink-700 transition"
          >
            Register New Feature
          </button>
        </div>

        {/* Inline Add Feature */}
        <div className="mt-10 w-full max-w-2xl">
          <h3 className="text-xl font-semibold mb-4">Add New Feature</h3>
          <AddFeature />
        </div>

        {/* Delete Sections */}
        <div className="mt-10 w-full max-w-2xl">
          <h3 className="text-xl font-semibold mb-4">Delete Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DeleteRoom />
            <DeleteFeature />
            <DeleteFeatureFromRoom />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminPanel;
