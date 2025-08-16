import { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import axios from "../api/axiosInstance";

function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee"); // default role

  const [errors, setErrors] = useState([]); // store multiple errors
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess("");
    setLoading(true);

    try {
      await axios.post("/Auth/register", {
        firstName,
        lastName,
        email,
        password,
        role,
      });

      setSuccess("✅ User registered successfully!");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("Employee");
    } catch (err) {
      if (err.response) {
        const data = err.response.data;

        if (Array.isArray(data)) {
          // API returned multiple validation errors
          setErrors(data.map((e) => e.description));
        } else if (data.message) {
          // API returned a single message
          setErrors([data.message]);
        } else {
          setErrors(["Registration failed."]);
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
      {/* Error messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-400 text-red-700 p-3 rounded">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success message */}
      {success && (
        <p className="text-green-600 font-semibold border border-green-400 bg-green-50 p-2 rounded">
          {success}
        </p>
      )}

      {/* First Name */}
      <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ring-blue-500">
        <FaUser className="text-gray-400 mr-2" />
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
          className="w-full outline-none"
          required
        />
      </div>

      {/* Last Name */}
      <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ring-blue-500">
        <FaUser className="text-gray-400 mr-2" />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          className="w-full outline-none"
          required
        />
      </div>

      {/* Email */}
      <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ring-blue-500">
        <FaEnvelope className="text-gray-400 mr-2" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full outline-none"
          required
        />
      </div>

      {/* Password */}
      <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ring-blue-500">
        <FaLock className="text-gray-400 mr-2" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full outline-none"
          required
        />
      </div>

      {/* Role */}
      <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 ring-blue-500">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full outline-none"
          required
        >
          <option value="Employee">Employee</option>
          <option value="Guest">Guest</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md mt-4"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}

export default RegisterForm;
