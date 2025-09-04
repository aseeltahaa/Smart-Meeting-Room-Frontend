import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function DeleteFeatureFromRoom({ refreshTrigger, onFeatureChange }) {
  const [rooms, setRooms] = useState([]);
  const [features, setFeatures] = useState([]);
  const [roomFeatures, setRoomFeatures] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedFeature, setSelectedFeature] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const safeParse = (data) => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return [];
    }
  };

  // Fetch rooms and features
  const fetchData = async () => {
    try {
      const roomsRes = await axios.get("/Room");
      const featuresRes = await axios.get("/Features");

      setRooms(Array.isArray(safeParse(roomsRes.data)) ? safeParse(roomsRes.data) : []);
      setFeatures(Array.isArray(safeParse(featuresRes.data)) ? safeParse(featuresRes.data) : []);
    } catch {
      setStatus("⚠️ Failed to load rooms or features.");
    }
  };

  useEffect(() => { fetchData(); }, [refreshTrigger]);

  // Update roomFeatures when room or features change
  useEffect(() => {
    if (!selectedRoom) {
      setRoomFeatures([]);
      setSelectedFeature("");
      return;
    }

    const room = rooms.find((r) => r.id === selectedRoom);
    if (!room || !room.featureIds) {
      setRoomFeatures([]);
      setSelectedFeature("");
      return;
    }

    const assignedFeatures = features.filter((f) => room.featureIds.includes(f.id));
    setRoomFeatures(assignedFeatures);
    setSelectedFeature("");
  }, [selectedRoom, rooms, features]);

  const handleDelete = async () => {
    if (!selectedRoom || !selectedFeature) return;

    setLoading(true);
    setStatus("");

    try {
      await axios.delete(`/Room/${selectedRoom}/features/${selectedFeature}`);
      setStatus("✅ Feature removed from room successfully!");
      setConfirm(false);

      // Update local state for immediate UI feedback
      setRoomFeatures(roomFeatures.filter((f) => f.id !== selectedFeature));
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.id === selectedRoom
            ? { ...r, featureIds: r.featureIds.filter((id) => id !== selectedFeature) }
            : r
        )
      );

      setSelectedFeature("");
      onFeatureChange?.(); // Trigger refresh in parent / sibling components
    } catch (err) {
      setStatus("❌ Failed to remove feature: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full max-w-md">
      <h4 className="text-lg font-semibold mb-4">Delete Feature from Room</h4>

      {/* Room Dropdown */}
      <select
        className="border rounded p-2 mb-4 w-full"
        value={selectedRoom}
        onChange={(e) => setSelectedRoom(e.target.value)}
      >
        <option value="">Select Room</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name} ({room.capacity} seats - {room.location})
          </option>
        ))}
      </select>

      {/* Feature Dropdown */}
      <select
        className="border rounded p-2 mb-4 w-full"
        value={selectedFeature}
        onChange={(e) => setSelectedFeature(e.target.value)}
        disabled={!selectedRoom || roomFeatures.length === 0}
      >
        <option value="">
          {roomFeatures.length === 0 ? "No features in this room" : "Select Feature"}
        </option>
        {roomFeatures.map((feature) => (
          <option key={feature.id} value={feature.id}>
            {feature.name}
          </option>
        ))}
      </select>

      {/* Delete Button */}
      <button
        className="bg-red-600 hover:bg-red-700 text-white py-2 rounded w-full"
        onClick={() => setConfirm(true)}
        disabled={!selectedRoom || !selectedFeature || loading}
      >
        Delete Selected
      </button>

      {/* Confirm Prompt */}
      {confirm && (
        <div className="flex flex-col gap-2 mt-4">
          <p>
            Are you sure you want to delete feature{" "}
            <strong>{roomFeatures.find((f) => f.id === selectedFeature)?.name}</strong> from room{" "}
            <strong>{rooms.find((r) => r.id === selectedRoom)?.name}</strong>?
          </p>
          <div className="flex gap-2">
            <button
              className="bg-red-600 hover:bg-red-700 text-white py-2 flex-1 rounded"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-black py-2 flex-1 rounded"
              onClick={() => setConfirm(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status Message */}
      {status && (
        <p
          className={`mt-2 text-sm ${
            status.startsWith("✅")
              ? "text-green-600"
              : status.startsWith("❌")
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}

export default DeleteFeatureFromRoom;
