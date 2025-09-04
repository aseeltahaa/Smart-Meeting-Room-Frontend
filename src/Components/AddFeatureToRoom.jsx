import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function AddFeatureToRoom({ refreshTrigger, onFeatureChange }) {
  const [rooms, setRooms] = useState([]);
  const [features, setFeatures] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedFeature, setSelectedFeature] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const safeParse = data => { try { return typeof data==="string"?JSON.parse(data):data; } catch { return []; } };

  const fetchData = async () => {
    try {
      const roomsRes = await axios.get("/Room"); 
      const featuresRes = await axios.get("/Features"); 
      setRooms(Array.isArray(safeParse(roomsRes.data))?safeParse(roomsRes.data):[]);
      setFeatures(Array.isArray(safeParse(featuresRes.data))?safeParse(featuresRes.data):[]);
    } catch { setStatus("⚠️ Failed to load rooms or features."); }
  };

  useEffect(()=>{ fetchData(); }, [refreshTrigger]);

  const handleAddFeature = async e => {
    e.preventDefault();
    if (!selectedRoom || !selectedFeature) { setStatus("⚠️ Please select both a room and a feature."); return; }
    setLoading(true); setStatus("");

    try {
      await axios.post(`/Room/${selectedRoom}/features/${selectedFeature}`);
      setStatus("✅ Feature added to room successfully!");
      setSelectedRoom(""); setSelectedFeature("");
      onFeatureChange?.();
    } catch { setStatus("❌ Failed to add feature to room."); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white shadow-md rounded p-6 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Add Feature to Room</h2>
      {status && <p className={`mt-2 text-sm ${status.startsWith("✅")?"text-green-600":status.startsWith("❌")?"text-red-600":"text-yellow-600"}`}>{status}</p>}
      <form onSubmit={handleAddFeature} className="flex flex-col gap-4">
        <select value={selectedRoom} onChange={e=>setSelectedRoom(e.target.value)} className="border rounded px-3 py-2 focus:outline-none focus:ring">
          <option value="">Select Room</option>
          {rooms.map(r=> <option key={r.id} value={r.id}>{r.name} ({r.capacity} seats - {r.location})</option>)}
        </select>

        <select value={selectedFeature} onChange={e=>setSelectedFeature(e.target.value)} className="border rounded px-3 py-2 focus:outline-none focus:ring">
          <option value="">Select Feature</option>
          {features.map(f=> <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>

        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">
          {loading ? "Adding..." : "Add Feature"}
        </button>
      </form>
    </div>
  );
}

export default AddFeatureToRoom;
