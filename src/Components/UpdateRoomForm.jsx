import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function UpdateRoomForm() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({ name: "", capacity: "", location: "" });
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const safeParse = (data) => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch (err) {
      console.error("❌ Failed to parse:", err);
      return [];
    }
  };

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
    setImage(null);
    setStatus("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setLoading(true);
    setStatus("");

    try {
      // Step 1: Update room basic info
      await axios.put(`/Room/${selectedRoom.id}`, {
        name: formData.name,
        capacity: Number(formData.capacity),
        location: formData.location,
      });

      // Step 2: If new image is selected, upload it
      if (image) {
        const formDataImg = new FormData();
        formDataImg.append("file", image);
        await axios.post(`/Room/${selectedRoom.id}/upload-image`, formDataImg, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

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
          <div className="border rounded-md p-3">
            <label className="font-semibold mb-1 block">Update Room Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {image && (
              <p className="text-sm text-gray-600 mt-1">Selected: {image.name}</p>
            )}
          </div>
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
