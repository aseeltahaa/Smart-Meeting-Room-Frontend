import { useState } from "react";
import axios from "../api/axiosInstance";

function AddFeature({ onFeatureChange }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      await axios.post("/Features", { name });
      setStatus("✅ Feature registered successfully!");
      setName("");
      onFeatureChange(); // refresh list in FeatureManagement
    } catch (err) {
      console.error(err);
      setStatus(
        "❌ " +
          (err.response?.data?.message || "Failed to register feature. Please try again later.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto space-y-4">
      <h4 className="text-lg font-semibold">Add New Feature</h4>

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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 ring-[#539D98]">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Feature Name"
            className="w-full outline-none text-black"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#539D98] hover:bg-[#42807f] text-white font-semibold py-2 rounded-md"
        >
          {loading ? "Registering..." : "Register Feature"}
        </button>
      </form>
    </div>
  );
}

export default AddFeature;
