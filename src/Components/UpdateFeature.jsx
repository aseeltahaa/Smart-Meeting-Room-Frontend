import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function UpdateFeature({ features, onFeatureChange }) {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedFeature) {
      const feature = features.find((f) => f.id === selectedFeature.id);
      setName(feature?.name || "");
    }
  }, [selectedFeature, features]);

  const handleSelectFeature = (id) => {
    const feature = features.find((f) => f.id === id);
    setSelectedFeature(feature);
    setStatus("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFeature) return;

    setLoading(true);
    setStatus("");

    try {
      await axios.put(`/Features/${selectedFeature.id}`, { name });
      setStatus("✅ Feature updated successfully!");
      setSelectedFeature(null);
      setName("");
      onFeatureChange(); // refresh feature list in parent
    } catch (err) {
      console.error(err);
      setStatus(
        "❌ " +
          (err.response?.data?.message || "Failed to update feature. Please try again later.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto space-y-4">
      <h4 className="text-lg font-semibold">Update Feature</h4>

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

      <select
        value={selectedFeature?.id || ""}
        onChange={(e) => handleSelectFeature(e.target.value)}
        className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-[#539D98]"
      >
        <option value="">Select Feature</option>
        {features.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      {selectedFeature && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded p-2"
            placeholder="Feature Name"
            required
          />
          <button
            type="submit"
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-md w-full"
            disabled={loading || !name.trim()}
          >
            {loading ? "Updating..." : "Update Feature"}
          </button>
        </form>
      )}
    </div>
  );
}

export default UpdateFeature;
