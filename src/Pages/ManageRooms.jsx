import React, { useState } from "react";
import AdminHeader from "../Components/AdminHeader";
import RoomForm from "../Components/RoomForm";
import UpdateRoomForm from "../Components/UpdateRoomForm";
import AddFeatureToRoom from "../Components/AddFeatureToRoom";
import DeleteRoom from "../Components/DeleteRoom";
import DeleteFeatureFromRoom from "../Components/DeleteFeatureFromRoom";

function RoomManagement() {
  const [refreshRooms, setRefreshRooms] = useState(0); // trigger for room updates

  const handleRoomChange = () => {
    setRefreshRooms((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Management</h1>
          <p className="text-gray-600">Manage rooms, their features, and images</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RoomForm onRoomChange={handleRoomChange} refreshTrigger={refreshRooms} />
          <UpdateRoomForm onRoomChange={handleRoomChange} refreshTrigger={refreshRooms} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <DeleteRoom onRoomChange={handleRoomChange} refreshTrigger={refreshRooms} />
          <DeleteFeatureFromRoom refreshTrigger={refreshRooms} />
          <AddFeatureToRoom refreshTrigger={refreshRooms} />
        </div>
      </div>
    </div>
  );
}

export default RoomManagement;
