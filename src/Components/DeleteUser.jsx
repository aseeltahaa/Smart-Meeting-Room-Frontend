import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function DeleteUser({ onUpdate }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/Users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to load users. Please try again later.");
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setStatus("");

    try {
      await axios.delete(`/Auth/${selectedUser}`);
      setStatus("✅ User deleted successfully!");
      setSelectedUser(""); setConfirm(false);
      fetchUsers();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to delete user. Please try again later.");
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-fit w-full max-w-md mx-auto space-y-4">
      <h4 className="text-lg font-semibold text-black mb-2">Delete User</h4>

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
        onChange={(e) => { setSelectedUser(e.target.value); setConfirm(true); }}
      >
        <option value="">Select User</option>
        {users.map((user) => <option key={user.id} value={user.id}>{user.email}</option>)}
      </select>

      {confirm && selectedUser && (
        <div className="space-y-2">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{users.find(u => u.id === selectedUser)?.email}</strong>?
          </p>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md w-full whitespace-nowrap"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      )}
    </div>
  );
}

export default DeleteUser;
