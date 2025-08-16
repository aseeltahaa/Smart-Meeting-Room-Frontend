import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function DeleteFeature() {
  const [features, setFeatures] = useState([]);
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const res = await axios.get("/Features");
      setFeatures(res.data);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to fetch features." });
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
        await axios.delete(`/Features/${id}`);
      }
      setMessage({ type: "success", text: "Feature(s) deleted successfully!" });
      setSelected([]);
      setConfirm(false);
      fetchFeatures();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete selected features." });
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-bold mb-4">Delete Features</h3>

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
        {features.map((feature) => (
          <label key={feature.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(feature.id)}
              onChange={() => toggleSelect(feature.id)}
            />
            {feature.name}
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
          <p>Are you sure you want to delete {selected.length} feature(s)?</p>
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

export default DeleteFeature;
