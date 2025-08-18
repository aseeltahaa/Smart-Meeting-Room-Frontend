import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function UpdateRoomForm() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({ name: "", capacity: "", location: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ safe JSON parse helper
  const safeParse = (data) => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch (err) {
      console.error("❌ Failed to parse:", err);
      return [];
    }
  };

  // Fetch all rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/Room", { headers: { Accept: "application/json" } });
        setRooms(Array.isArray(safeParse(res.data)) ? safeParse(res.data) : []);
      } catch (err) {
        console.error(err);
        setStatus("⚠️ Failed to load rooms.");
      }
    };
    fetchRooms();
  }, []);

  const handleSelectRoom = (id) => {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity,
      location: room.location,
    });
    setStatus("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setLoading(true);
    setStatus("");

    try {
      await axios.put(`/Room/${selectedRoom.id}`, {
        name: formData.name,
        capacity: Number(formData.capacity), // ensure number
        location: formData.location,
      });
      setStatus("✅ Room updated successfully!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error updating room: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
      <label className="block mb-2 font-medium">Select Room to Update</label>
      <select
        className="w-full border rounded p-2 mb-4"
        onChange={(e) => handleSelectRoom(e.target.value)}
        value={selectedRoom?.id || ""}
      >
        <option value="">-- Select Room --</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      {selectedRoom && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Room Name"
            className="border rounded p-2"
            required
          />
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Capacity"
            className="border rounded p-2"
            required
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="border rounded p-2"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

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

export default UpdateRoomForm;
