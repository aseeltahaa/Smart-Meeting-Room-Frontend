import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function UpdateFeature() {
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all features
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await axios.get("/Features", { headers: { Accept: "application/json" } });
        setFeatures(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setStatus("⚠️ Failed to load features.");
      }
    };
    fetchFeatures();
  }, []);

  const handleSelectFeature = (id) => {
    const feature = features.find((f) => f.id === id);
    setSelectedFeature(feature);
    setName(feature?.name || "");
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
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to update feature: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full mt-6">
      <h4 className="text-lg font-semibold mb-4">Update Feature</h4>

      {/* Feature Dropdown */}
      <select
        className="border rounded p-2 mb-4 w-full"
        value={selectedFeature?.id || ""}
        onChange={(e) => handleSelectFeature(e.target.value)}
      >
        <option value="">Select Feature</option>
        {features.map((feature) => (
          <option key={feature.id} value={feature.id}>
            {feature.name}
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
          />
          <button
            type="submit"
            className="btn bg-yellow-600 hover:bg-yellow-700 text-white"
            disabled={loading || !name.trim()}
          >
            {loading ? "Updating..." : "Update Feature"}
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

export default UpdateFeature;
