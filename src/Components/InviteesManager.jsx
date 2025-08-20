import { useState, useEffect } from "react";
import api from "../api/axiosInstance";

function InviteesManager({ meetingId }) {
  const [invitees, setInvitees] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [inviteeSearch, setInviteeSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/Users");
        setAllUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Fetch current invitees
  useEffect(() => {
    if (!meetingId) return;
    const fetchInvitees = async () => {
      try {
        const res = await api.get(`/Meeting/${meetingId}`);
        setInvitees(res.data.invitees || []);
      } catch (err) {
        console.error("Failed to load invitees:", err);
        setStatus("❌ Failed to load invitees.");
      }
    };
    fetchInvitees();
  }, [meetingId]);

  // Filter suggestions
  useEffect(() => {
    if (!inviteeSearch.trim()) return setSuggestions([]);
    const filtered = allUsers.filter(
      (u) =>
        u.email.toLowerCase().includes(inviteeSearch.toLowerCase()) &&
        !invitees.some((i) => i.userId === u.id)
    );
    setSuggestions(filtered);
  }, [inviteeSearch, allUsers, invitees]);

  const handleAddInvitee = async (user) => {
    setLoading(true);
    setStatus("");
    try {
      await api.post(`/Meeting/${meetingId}/invitees`, {
        userId: user.id,
        email: user.email,
        status: "Pending",
      });
      setInvitees((prev) => [...prev, { userId: user.id, user: user, status: "Pending" }]);
      setInviteeSearch("");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to add invitee: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInvitee = async (inviteeId) => {
    setLoading(true);
    setStatus("");
    try {
      await api.delete(`/Meeting/${meetingId}/invitees/${inviteeId}`);
      setInvitees((prev) => prev.filter((i) => i.userId !== inviteeId));
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to remove invitee: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };
console.log("Invitees:", invitees);
  return (
    <div className="bg-white p-6 rounded shadow w-full mt-6">
      <h4 className="text-lg font-semibold mb-4">Manage Invitees</h4>

      <input
        type="text"
        placeholder="Search user by email"
        value={inviteeSearch}
        onChange={(e) => setInviteeSearch(e.target.value)}
        className="border rounded p-2 w-full mb-2"
      />

      {suggestions.length > 0 && (
        <ul className="border rounded mb-2 max-h-40 overflow-auto">
          {suggestions.map((user) => (
            <li
              key={user.id}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleAddInvitee(user)}
            >
              {user.email}
            </li>
          ))}
        </ul>
      )}

      <ul className="mb-2">
        {invitees.map((i) => (
          <li key={i.userId} className="flex justify-between items-center p-2 border-b">
            <span>{i.user?.email || i.email} ({i.status})</span>
            <button
              className="text-red-600 hover:text-red-800"
              onClick={() => handleRemoveInvitee(i.userId)}
              disabled={loading}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {status && <p className="text-sm mt-2 text-red-600">{status}</p>}
    </div>
  );
}

export default InviteesManager;
