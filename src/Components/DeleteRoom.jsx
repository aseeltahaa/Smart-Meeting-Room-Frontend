import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function DeleteRoom() {
  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get("/Room");
      setRooms(res.data);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to fetch rooms." });
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    try {
      for (const id of selected) {
        await axios.delete(`/Room/${id}`);
      }
      setMessage({ type: "success", text: "Room(s) deleted successfully!" });
      setSelected([]);
      setConfirm(false);
      fetchRooms();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete selected rooms." });
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-bold mb-4">Delete Rooms</h3>

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

      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-4">
        {rooms.map((room) => (
          <label key={room.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(room.id)}
              onChange={() => toggleSelect(room.id)}
            />
            {room.name} ({room.location})
          </label>
        ))}
      </div>

      {!confirm && (
        <button
          className="btn bg-red-600 hover:bg-red-700"
          disabled={selected.length === 0}
          onClick={() => setConfirm(true)}
        >
          Delete Selected
        </button>
      )}

      {confirm && (
        <div className="flex flex-col gap-2">
          <p>Are you sure you want to delete {selected.length} room(s)?</p>
          <div className="flex gap-2">
            <button
              className="btn bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Yes, Delete
            </button>
            <button
              className="btn bg-gray-300 hover:bg-gray-400 text-black"
              onClick={() => setConfirm(false)}
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
