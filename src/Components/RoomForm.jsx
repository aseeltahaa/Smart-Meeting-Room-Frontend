import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function RoomForm({ onRoomChange }) {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [features, setFeatures] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await axios.get("/Features");
        setFeatures(Array.isArray(res.data) ? res.data : []);
      } catch {
        setStatus("❌ Failed to load features.");
      }
    };
    fetchFeatures();
  }, []);

  const handleFeatureToggle = id => {
    setSelectedFeatures(prev => (prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]));
  };

  const handleImageChange = e => {
    if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const createRes = await axios.post("/Room", {
        name,
        capacity: Number(capacity),
        location,
        featureIds: selectedFeatures
      });

      const roomId = createRes.data.id;
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        await axios.post(`/Room/${roomId}/upload-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      setStatus("✅ Room registered successfully!");
      setName(""); setCapacity(""); setLocation(""); setSelectedFeatures([]); setImage(null);
      onRoomChange?.();
    } catch {
      setStatus("❌ Failed to register room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h4 className="text-lg font-semibold">Register New Room</h4>

      {status && <p className={`text-sm ${status.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{status}</p>}

      <input type="text" placeholder="Room Name" value={name} onChange={e => setName(e.target.value)}
        className="border rounded-md px-3 py-2 w-full focus:ring-2 ring-blue-500" required />

      <input type="number" placeholder="Capacity" value={capacity} onChange={e => setCapacity(e.target.value)}
        className="border rounded-md px-3 py-2 w-full focus:ring-2 ring-blue-500" min={1} required />

      <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)}
        className="border rounded-md px-3 py-2 w-full focus:ring-2 ring-blue-500" required />

      <div className="border rounded-md p-3">
        <label className="font-semibold mb-1 block">Room Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {image && <p className="text-sm text-gray-600 mt-1">Selected: {image.name}</p>}
      </div>

      <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
        <label className="font-semibold mb-1 block">Select Features</label>
        {features.map(f => (
          <div key={f.id} className="flex items-center mb-1">
            <input type="checkbox" checked={selectedFeatures.includes(f.id)}
              onChange={() => handleFeatureToggle(f.id)} className="mr-2" />
            <span>{f.name}</span>
          </div>
        ))}
      </div>

      <button type="submit" disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md w-full">
        {loading ? "Registering..." : "Register Room"}
      </button>
    </form>
  );
}

export default RoomForm;
