import { useState } from "react";
import axios from "../api/axiosInstance";

function FeatureForm() {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess("");
    setLoading(true);

    try {
      await axios.post("/Features", { name });
      setSuccess("✅ Feature registered successfully!");
      setName("");
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        if (Array.isArray(data)) {
          setErrors(data.map((e) => e.description));
        } else if (data.message) {
          setErrors([data.message]);
        } else {
          setErrors(["Failed to register feature."]);
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

      <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ring-blue-500">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Feature Name"
          className="w-full outline-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md mt-4"
      >
        {loading ? "Registering..." : "Register Feature"}
      </button>
    </form>
  );
}

export default FeatureForm;
