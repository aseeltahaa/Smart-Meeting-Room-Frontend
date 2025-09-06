import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function DeleteRoom({ refreshTrigger, onRoomChange }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await axios.get("/Room");
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        if (Array.isArray(data)) setErrors(data.map((e) => e.description || e));
        else if (data.message) setErrors([data.message]);
        else setErrors(["Failed to fetch rooms."]);
      } else if (err.request) {
        setErrors(["❌ Server did not respond. Please try again later."]);
      } else {
        setErrors([`❌ ${err.message}`]);
      }
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    if (!selectedRoom) return;

    setLoading(true);
    setErrors([]);
    setSuccess("");

    try {
      await axios.delete(`/Room/${selectedRoom}`);
      setSuccess("✅ Room deleted successfully!");
      setSelectedRoom("");
      setConfirm(false);
      onRoomChange?.();
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        if (Array.isArray(data)) setErrors(data.map((e) => e.description || e));
        else if (data.message) setErrors([data.message]);
        else setErrors(["Failed to delete room."]);
      } else if (err.request) {
        setErrors(["❌ Server did not respond. Please try again later."]);
      } else {
        setErrors([`❌ ${err.message}`]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-bold mb-4">Delete Room</h3>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-400 text-red-700 p-3 rounded mb-3">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {success && (
        <p className="text-green-600 font-semibold border border-green-400 bg-green-50 p-2 rounded mb-3">
          {success}
        </p>
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
