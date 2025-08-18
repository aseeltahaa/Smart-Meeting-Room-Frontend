import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function UpdateUserRole() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");

  const availableRoles = ["Admin", "Employee", "Guest"];

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/Users", { headers: { Accept: "application/json" } });
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setStatus("⚠️ Failed to load users.");
      }
    };
    fetchUsers();
  }, []);

  // Search user by email
  const handleSearchByEmail = async () => {
    if (!emailSearch.trim()) return;
    setLoading(true);
    setStatus("");

    try {
      const res = await axios.get(`/Users/email/${encodeURIComponent(emailSearch.trim())}`);
      const user = res.data;
      console.log("Search result:", user);
      if (user && user.id) {
        setSelectedUser(user.id);
        setRole(user.roles?.[0] || "");
        setStatus("✅ User found and pre-selected.");
      } else {
        setStatus("⚠️ User not found.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to search user: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const handleUpdateRole = async () => {
    if (!selectedUser || !role) {
      setStatus("⚠️ Please select a user and a role.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      await axios.put(`/Auth/role/${selectedUser}`, { role });
      setStatus("✅ User role updated successfully!");
      setSelectedUser("");
      setRole("");
      setEmailSearch("");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to update role: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full mt-6">
      <h4 className="text-lg font-semibold mb-4">Update User Role</h4>

      {/* Search by email */}
      <div className="flex gap-2 mb-4">
        <input
          type="email"
          placeholder="Search by email"
          value={emailSearch}
          onChange={(e) => setEmailSearch(e.target.value)}
          className="border rounded p-2 flex-grow"
        />
        <button
          className="btn bg-blue-600 hover:bg-blue-700 text-white px-4"
          onClick={handleSearchByEmail}
          disabled={loading || !emailSearch.trim()}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* User Dropdown */}
      <select
        className="border rounded p-2 mb-4 w-full"
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
      >
        <option value="">Select User</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.email} ({user.roles?.[0] || "No role"})
          </option>
        ))}
      </select>

      {/* Role Dropdown */}
      <select
        className="border rounded p-2 mb-4 w-full"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Select Role</option>
        {availableRoles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      {/* Update Button */}
      <button
        className="btn bg-yellow-600 hover:bg-yellow-700 text-white w-full"
        onClick={handleUpdateRole}
        disabled={!selectedUser || !role || loading}
      >
        {loading ? "Updating..." : "Update Role"}
      </button>

      {/* Status Message */}
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

export default UpdateUserRole;
