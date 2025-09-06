import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function AddFeatureToRoom({ refreshTrigger, onFeatureChange }) {
  const [rooms, setRooms] = useState([]);
  const [features, setFeatures] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedFeature, setSelectedFeature] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const safeParse = (data) => {
    try {
      if (typeof data === "string") return JSON.parse(data);
      return data;
    } catch (err) {
      console.error("❌ Failed to parse response:", err);
      return [];
    }
  };

  // ✅ Improved fetchData with JSON headers and error logging
  const fetchData = async () => {
    try {
      const roomsRes = await axios.get("/Room", { headers: { Accept: "application/json" } });
      const featuresRes = await axios.get("/Features", { headers: { Accept: "application/json" } });

      setRooms(Array.isArray(safeParse(roomsRes.data)) ? safeParse(roomsRes.data) : []);
      setFeatures(Array.isArray(safeParse(featuresRes.data)) ? safeParse(featuresRes.data) : []);
    } catch (err) {
      console.error(err);
      setStatus("⚠️ Failed to load rooms or features.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleAddFeature = async (e) => {
    e.preventDefault();

    if (!selectedRoom || !selectedFeature) {
      setStatus("⚠️ Please select both a room and a feature.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      await axios.post(`/Room/${selectedRoom}/features/${selectedFeature}`);
      setStatus("✅ Feature added to room successfully!");
      setSelectedRoom("");
      setSelectedFeature("");
      onFeatureChange?.();
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to add feature to room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded p-6 w-full max-w-md mt-6">
      <h2 className="text-xl font-semibold mb-4">Add Feature to Room</h2>
      <form onSubmit={handleAddFeature} className="flex flex-col gap-4">
        {/* Room Dropdown */}
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring"
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
          value={selectedFeature}
          onChange={(e) => setSelectedFeature(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring"
        >
          <option value="">Select Feature</option>
          {features.map((feature) => (
            <option key={feature.id} value={feature.id}>
              {feature.name}
            </option>
          ))}
        </select>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Feature"}
        </button>
      </form>

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

export default AddFeatureToRoom;
