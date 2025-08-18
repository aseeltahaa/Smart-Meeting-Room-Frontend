import React, { useState } from "react";
import axios from "../api/axiosInstance";

function DeleteUser() {
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState(null); // store ID after lookup

  // Lookup user by email
  const handleLookup = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setStatus("");

    try {
      const res = await axios.get(`/Users/email/${encodeURIComponent(email.trim())}`);
      if (res.data && res.data.id) {
        setUserId(res.data.id);
        setStatus("✅ User found. Ready to delete.");
        setConfirm(true);
      } else {
        setStatus("⚠️ User not found.");
        setUserId(null);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to lookup user: " + (err.response?.data || err.message));
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };

  // Delete user by ID
  const handleDelete = async () => {
    if (!userId) return;
    setLoading(true);
    setStatus("");

    try {
      await axios.delete(`/Auth/${userId}`);
      setStatus("✅ User deleted successfully!");
      setEmail("");
      setUserId(null);
      setConfirm(false);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to delete user: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow flex flex-col">
      <h4 className="text-lg font-semibold mb-3">Delete User by Email</h4>

      {/* Input for Email */}
      <div className="flex gap-2 mb-3">
        <input
          type="email"
          placeholder="Enter user email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded p-2 flex-grow"
        />
        <button
          className="btn bg-blue-600 hover:bg-blue-700 text-white px-4"
          onClick={handleLookup}
          disabled={!email.trim() || loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Confirmation */}
      {confirm && (
        <div className="flex flex-col gap-2">
          <p>Are you sure you want to delete the user with email: <strong>{email}</strong>?</p>
          <div className="flex gap-2">
            <button
              className="btn bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={loading}
            >
              Yes, Delete
            </button>
            <button
              className="btn bg-gray-300 hover:bg-gray-400 text-black"
              onClick={() => setConfirm(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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

export default DeleteUser;
