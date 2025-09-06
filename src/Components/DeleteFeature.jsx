import React, { useState } from "react";
import axios from "../api/axiosInstance";

function DeleteFeature({ features, onFeatureChange }) {
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState("");

  const handleDelete = async () => {
    if (!selected) return;

    setStatus(""); 
    setConfirm(false);

    try {
      await axios.delete(`/Features/${selected}`);
      setStatus("✅ Feature deleted successfully!");
      setSelected(null);
      onFeatureChange(); // refresh feature list in parent
    } catch (err) {
      console.error(err);
      setStatus(
        "❌ " +
          (err.response?.data?.message || "Failed to delete feature. Please try again later.")
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto space-y-4">
      <h4 className="text-lg font-semibold">Delete Feature</h4>

      {/* Status/Error Message */}
      {status && (
        <p
          className={`p-2 rounded-md text-sm ${
            status.startsWith("✅")
              ? "bg-green-50 text-green-600 border border-green-400"
              : "bg-red-50 text-red-600 border border-red-400"
          }`}
        >
          {status}
        </p>
      )}

      {/* Feature Select */}
      <select
        value={selected || ""}
        onChange={(e) => { setSelected(e.target.value); setConfirm(true); setStatus(""); }}
        className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-[#539D98]"
      >
        <option value="">Select Feature</option>
        {features.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      {/* Confirmation */}
      {confirm && selected && (
        <div className="flex flex-col gap-2 mt-2">
          <p>
            Are you sure you want to delete{" "}
            <strong>{features.find(f => f.id === selected)?.name}</strong>?
          </p>
          <div className="flex gap-2">
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md"
              onClick={handleDelete}
            >
              Yes, Delete
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded-md"
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

export default DeleteFeature;
