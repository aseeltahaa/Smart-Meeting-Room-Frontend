import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function UpdateUserRole() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const availableRoles = ["Admin", "Employee", "Guest"];

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/Users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setStatus("⚠️ Failed to load users. Please try again later.");
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdateRole = async () => {
    if (!selectedUser || !role) { 
      setStatus("⚠️ Please select a user and a role."); 
      return; 
    }
    setLoading(true); setStatus("");
    try {
      await axios.put(`/Auth/role/${selectedUser}`, { role });
      setStatus("✅ User role updated successfully!");
      setSelectedUser(""); setRole("");
      fetchUsers(); // refresh dropdown
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to update role. Please try again later.");
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-fit w-full max-w-md mx-auto space-y-4">
      <h4 className="text-lg font-semibold text-black mb-2">Update User Role</h4>

      {status && (
        <p className={`p-2 rounded-md text-sm ${
          status.startsWith("✅")
            ? "bg-green-50 text-green-600 border border-green-400"
            : status.startsWith("❌")
            ? "bg-red-50 text-red-600 border border-red-400"
            : "bg-yellow-50 text-yellow-600 border border-yellow-400"
        }`}>{status}</p>
      )}

      <select
        className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-[#539D98]"
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
      >
        <option value="">Select User</option>
        {users.map((user) => <option key={user.id} value={user.id}>{user.email} ({user.roles?.[0] || "No role"})</option>)}
      </select>

      <select
        className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-[#539D98]"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Select Role</option>
        {availableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      <button
        className="bg-[#539D98] hover:bg-[#42807f] text-white font-semibold py-2 px-4 rounded-md whitespace-nowrap w-full"
        onClick={handleUpdateRole}
        disabled={!selectedUser || !role || loading}
      >
        {loading ? "Updating..." : "Update Role"}
      </button>
    </div>
  );
}

export default UpdateUserRole;
