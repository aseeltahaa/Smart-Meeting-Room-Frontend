import React from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import DeleteRoom from '../Components/DeleteRoom';
import DeleteFeature from '../Components/DeleteFeature';
import AddFeature from '../Components/AddFeature'; 
import DeleteFeatureFromRoom from '../Components/DeleteFeatureFromRoom';
import UpdateFeature from "../Components/UpdateFeature";
import UpdateUserRole from "../Components/UpdateUserRole";
import DeleteUser from '../Components/DeleteUser';

function AdminPanel() {
  return (
    <>
      <Header  showGradient={false}/>
      <div className="admin-container min-h-screen flex flex-col items-center p-6">
        <h2 className="text-3xl font-bold mb-6">Admin Panel</h2>

        {/* ================= USER MANAGEMENT ================= */}
        <div className="w-full max-w-3xl">
          <h3 className="text-2xl font-semibold mb-6 text-green-700">User Management</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = '/admin/register'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Register New User
            </button>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Update User Role</h4>
            <UpdateUserRole />
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3 text-red-600">Delete User</h4>
            <DeleteUser />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full max-w-3xl border-t border-gray-300 my-12"></div>

        {/* ================= ROOMS ================= */}
        <div className="w-full max-w-3xl">
          <h3 className="text-2xl font-semibold mb-6 text-green-700">Rooms</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = '/admin/rooms'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Register New Room
            </button>

            <button
              onClick={() => window.location.href = '/admin/update-room'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Update Room
            </button>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3 text-red-600">Delete Room</h4>
            <DeleteRoom />
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3 text-red-600">Delete Feature From Room</h4>
            <DeleteFeatureFromRoom />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full max-w-3xl border-t border-gray-300 my-12"></div>

        {/* ================= FEATURES ================= */}
        <div className="w-full max-w-3xl">
          <h3 className="text-2xl font-semibold mb-6 text-green-700">Features</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = '/admin/features'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Register New Feature
            </button>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Add New Feature</h4>
            <AddFeature />
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Update Feature</h4>
            <UpdateFeature />
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3 text-red-600">Delete Feature</h4>
            <DeleteFeature />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminPanel;
