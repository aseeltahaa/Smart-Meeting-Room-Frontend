import { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function RoomForm() {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [features, setFeatures] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [image, setImage] = useState(null);

  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await axios.get("/Features");
        setFeatures(res.data);
      } catch (err) {
        console.error("Failed to fetch features", err);
      }
    };
    fetchFeatures();
  }, []);

  const handleFeatureToggle = (id) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess("");
    setLoading(true);

    try {
      // Step 1: Create the room without image
      const createRes = await axios.post("/Room", {
        name,
        capacity: Number(capacity),
        location,
        featureIds: selectedFeatures,
      });

      const roomId = createRes.data.id;

      // Step 2: If image selected, upload it
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        await axios.post(`/Room/${roomId}/upload-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSuccess("✅ Room registered successfully!");
      setName("");
      setCapacity("");
      setLocation("");
      setSelectedFeatures([]);
      setImage(null);
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        if (Array.isArray(data)) {
          setErrors(data.map((e) => e.description));
        } else if (data.message) {
          setErrors([data.message]);
        } else {
          setErrors(["Failed to register room."]);
        }
      } else if (err.request) {
        setErrors(["❌ Server did not respond. Please try again later."]);
      } else {
        setErrors([`❌ ${err.message}`]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-400 text-red-700 p-3 rounded">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {success && (
        <p className="text-green-600 font-semibold border border-green-400 bg-green-50 p-2 rounded">
          {success}
        </p>
      )}

      <input
        type="text"
        placeholder="Room Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded-md px-3 py-2 outline-none focus:ring-2 ring-blue-500"
        required
      />

      <input
        type="number"
        placeholder="Capacity"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        className="border rounded-md px-3 py-2 outline-none focus:ring-2 ring-blue-500"
        min={1}
        required
      />

      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border rounded-md px-3 py-2 outline-none focus:ring-2 ring-blue-500"
        required
      />

      {/* Image upload */}
      <div className="border rounded-md p-3">
        <label className="font-semibold mb-1 block">Room Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {image && (
          <p className="text-sm text-gray-600 mt-1">Selected: {image.name}</p>
        )}
      </div>

      {/* Features multi-select */}
      <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
        <label className="font-semibold mb-1 block">Select Features</label>
        {features.length === 0 && <p className="text-gray-500">Loading...</p>}
        {features.map((f) => (
          <div key={f.id} className="flex items-center mb-1">
            <input
              type="checkbox"
              checked={selectedFeatures.includes(f.id)}
              onChange={() => handleFeatureToggle(f.id)}
              className="mr-2"
            />
            <span>{f.name}</span>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md mt-2"
      >
        {loading ? "Registering..." : "Register Room"}
      </button>
    </form>
  );
}

export default RoomForm;
