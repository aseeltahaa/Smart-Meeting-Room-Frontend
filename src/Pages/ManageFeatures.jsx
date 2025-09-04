import React, { useState, useEffect } from "react";
import AdminHeader from "../Components/AdminHeader";
import FeatureForm from "../Components/FeatureForm";
import UpdateFeature from "../Components/UpdateFeature";
import DeleteFeature from "../Components/DeleteFeature";
import axios from "../api/axiosInstance";

function FeatureManagement() {
  const [features, setFeatures] = useState([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [status, setStatus] = useState("");

  // Fetch all features
  const fetchFeatures = async () => {
    setLoadingFeatures(true);
    try {
      const res = await axios.get("/Features", { headers: { Accept: "application/json" } });
      setFeatures(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setStatus("⚠️ Failed to load features. Please try again later.");
    } finally {
      setLoadingFeatures(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  // Callback when a feature is added, updated, or deleted
  const handleFeatureChange = () => {
    fetchFeatures();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Management</h1>
          <p className="text-gray-600">Manage features in the system</p>
        </div>

        {status && (
          <p className="p-2 rounded-md text-sm bg-yellow-50 text-yellow-600 border border-yellow-400 mb-4">
            {status}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <FeatureForm features={features} onFeatureChange={handleFeatureChange} />
          <UpdateFeature features={features} onFeatureChange={handleFeatureChange} />
          <DeleteFeature features={features} onFeatureChange={handleFeatureChange} />
        </div>
      </div>
    </div>
  );
}

export default FeatureManagement;
