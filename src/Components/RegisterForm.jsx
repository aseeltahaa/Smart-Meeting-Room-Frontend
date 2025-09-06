import { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import axios from "../api/axiosInstance";

function RegisterForm({ onUpdate }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");

  const [errors, setErrors] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setStatus("");
    setLoading(true);

    try {
      await axios.post("/Auth/register", { firstName, lastName, email, password, role });
      setStatus("✅ User registered successfully!");
      setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setRole("Employee");

      if (onUpdate) onUpdate(); // refresh other forms
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        if (Array.isArray(data)) setErrors(data.map((e) => e.description));
        else if (data.message) setErrors([data.message]);
        else setErrors(["Registration failed."]);
      } else if (err.request) setErrors(["❌ Server did not respond. Please try again later."]);
      else setErrors([`❌ ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { value: firstName, setter: setFirstName, placeholder: "First Name", icon: <FaUser className="text-gray-400 mr-2" /> },
    { value: lastName, setter: setLastName, placeholder: "Last Name", icon: <FaUser className="text-gray-400 mr-2" /> },
    { value: email, setter: setEmail, placeholder: "Email", type: "email", icon: <FaEnvelope className="text-gray-400 mr-2" /> },
    { value: password, setter: setPassword, placeholder: "Password", type: "password", icon: <FaLock className="text-gray-400 mr-2" /> },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-fit w-full max-w-md mx-auto space-y-4">
      <h4 className="text-lg font-semibold text-black mb-2">Add User</h4>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-400 text-red-700 p-2 rounded-md text-sm">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {status && (
        <p
          className={`p-2 rounded-md text-sm ${
            status.startsWith("✅")
              ? "bg-green-50 text-green-600 border border-green-400"
              : status.startsWith("❌")
              ? "bg-red-50 text-red-600 border border-red-400"
              : "bg-yellow-50 text-yellow-600 border border-yellow-400"
          }`}
        >
          {status}
        </p>
      )}

      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
        {fields.map((field, idx) => (
          <div key={idx} className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 ring-[#539D98]">
            {field.icon}
            <input
              type={field.type || "text"}
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              placeholder={field.placeholder}
              className="w-full outline-none text-black"
              required
            />
          </div>
        ))}

        <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 ring-[#539D98]">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full outline-none text-black" required>
            <option value="Employee">Employee</option>
            <option value="Guest">Guest</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#539D98] hover:bg-[#42807f] text-white font-semibold py-2 px-4 rounded-md whitespace-nowrap"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;
