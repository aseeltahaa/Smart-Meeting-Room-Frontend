import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function DeleteRoom({ refreshTrigger, onRoomChange }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await axios.get("/Room");
      setRooms(res.data || []);
    } catch {
      setMessage({ type: "error", text: "⚠️ Failed to fetch rooms." });
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [refreshTrigger]); // <-- will re-fetch whenever parent increments trigger

  const handleDelete = async () => {
    if (!selectedRoom) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await axios.delete(`/Room/${selectedRoom}`);
      setMessage({ type: "success", text: "✅ Room deleted successfully!" });
      setSelectedRoom("");
      setConfirm(false);
      onRoomChange?.(); // notify parent to refresh other components
    } catch {
      setMessage({ type: "error", text: "❌ Failed to delete room." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-bold mb-4">Delete Room</h3>

      {message.text && (
        <div
          className={`p-2 mb-3 rounded ${
            message.type === "success"
              ? "bg-green-50 border border-green-400 text-green-700"
              : "bg-red-50 border border-red-400 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <select
        className="border rounded-md p-2 mb-4 w-full focus:ring-2 ring-red-500"
        value={selectedRoom}
        onChange={(e) => setSelectedRoom(e.target.value)}
      >
        <option value="">-- Select Room --</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name} ({room.location})
          </option>
        ))}
      </select>

      {!confirm ? (
        <button
          className="bg-red-600 hover:bg-red-700 w-full py-2 rounded-md text-white font-semibold"
          disabled={!selectedRoom}
          onClick={() => setConfirm(true)}
        >
          Delete Selected
        </button>
      ) : (
        <div className="flex flex-col gap-2 mt-3">
          <p>
            Are you sure you want to delete{" "}
            <strong>{rooms.find((r) => r.id === selectedRoom)?.name}</strong>?
          </p>
          <div className="flex gap-2">
            <button
              className="bg-red-600 hover:bg-red-700 flex-1 py-2 rounded-md text-white font-semibold"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-black flex-1 py-2 rounded-md font-semibold"
              onClick={() => setConfirm(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteRoom;
