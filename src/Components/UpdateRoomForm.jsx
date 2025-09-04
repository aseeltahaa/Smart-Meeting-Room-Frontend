import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function UpdateRoomForm({ refreshTrigger, onRoomChange }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/Room");
        setRooms(res.data || []);
      } catch {
        setStatus("❌ Failed to fetch rooms.");
      }
    };
    fetchRooms();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!selectedRoom) return;
    const room = rooms.find(r => r.id === selectedRoom);
    if (room) {
      setName(room.name); setCapacity(room.capacity); setLocation(room.location);
    }
  }, [selectedRoom, rooms]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedRoom) return;
    setLoading(true); setStatus("");

    try {
      await axios.put(`/Room/${selectedRoom}`, {
        name, capacity: Number(capacity), location
      });
      setStatus("✅ Room updated successfully!");
      onRoomChange?.();
    } catch {
      setStatus("❌ Failed to update room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h4 className="text-lg font-semibold">Update Room</h4>

      {status && <p className={`text-sm ${status.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{status}</p>}

      <select className="border rounded-md p-2 w-full" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
        <option value="">Select Room</option>
        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>

      <input type="text" placeholder="Room Name" value={name} onChange={e => setName(e.target.value)}
        className="border rounded-md px-3 py-2 w-full" required />
      <input type="number" placeholder="Capacity" value={capacity} onChange={e => setCapacity(e.target.value)}
        className="border rounded-md px-3 py-2 w-full" min={1} required />
      <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)}
        className="border rounded-md px-3 py-2 w-full" required />

      <button type="submit" disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md w-full">
        {loading ? "Updating..." : "Update Room"}
      </button>
    </form>
  );
}

export default UpdateRoomForm;
