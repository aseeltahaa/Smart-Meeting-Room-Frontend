import React, { useState } from "react";
import RegisterForm from "../Components/RegisterForm";
import UpdateUserRole from "../Components/UpdateUserRole";
import DeleteUser from "../Components/DeleteUser";
import AdminHeader from "../Components/AdminHeader";

function UserManagement() {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <RegisterForm onUpdate={triggerRefresh} />
          <UpdateUserRole key={refreshKey} />
          <DeleteUser onUpdate={triggerRefresh} />
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
