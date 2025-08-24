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
        setStatus("❌ Failed to load users.");
      }
    };
    fetchUsers();
  }, []);

  // Fetch meeting invitees
  useEffect(() => {
    if (!meetingId) return;
    const fetchInvitees = async () => {
      try {
        const res = await api.get(`/Meeting/${meetingId}`);
        setInvitees(Array.isArray(res.data.invitees) ? res.data.invitees : []);
      } catch (err) {
        console.error("Failed to load invitees:", err);
        setStatus("❌ Failed to load invitees.");
      }
    };
    fetchInvitees();
  }, [meetingId]);

  // Filter suggestions (exclude already invited)
  useEffect(() => {
    if (!inviteeSearch.trim()) return setSuggestions([]);
    const filtered = allUsers.filter(
      (u) =>
        u.email.toLowerCase().includes(inviteeSearch.toLowerCase()) &&
        !invitees.some((i) => i.userId === u.id)
    );
    setSuggestions(filtered);
  }, [inviteeSearch, allUsers, invitees]);

  // Add invitee
  const handleAddInvitee = async (user) => {
    if (!meetingId || !user?.id) return;
    setLoading(true);
    setStatus("");
    try {
      const res = await api.post(`/Meeting/${meetingId}/invitees`, {
        userId: user.id,
        email: user.email,
      });
      setInvitees((prev) => [...prev, res.data]);
      setInviteeSearch("");
      setSuggestions([]);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to add invitee: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Remove invitee
  const handleRemoveInvitee = async (inviteeId) => {
    if (!meetingId || !inviteeId) return;
    setLoading(true);
    setStatus("");
    try {
      await api.delete(`/Meeting/${meetingId}/invitees/${inviteeId}`);
      setInvitees((prev) => prev.filter((i) => i.id !== inviteeId));
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to remove invitee: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Separate Pending and Answered
  const pendingInvitees = invitees.filter((i) => i.status === "Pending");
  const answeredInvitees = invitees.filter((i) => i.status === "Answered");

  return (
    <div className="bg-white p-6 rounded shadow w-full mt-6">
      <h4 className="text-lg font-semibold mb-4">Manage Invitees</h4>

      {/* Search box */}
      <input
        type="text"
        placeholder="Search user by email"
        value={inviteeSearch}
        onChange={(e) => setInviteeSearch(e.target.value)}
        className="border rounded p-2 w-full mb-2"
        disabled={loading}
      />

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <ul className="border rounded mb-2 max-h-40 overflow-auto bg-white">
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

      {/* Pending Invitees */}
      {pendingInvitees.length > 0 && (
        <>
          <h5 className="font-medium mt-4">Pending</h5>
          <ul className="mb-2">
            {pendingInvitees.map((i) => (
              <li
                key={i.id}
                className="flex justify-between items-center p-2 border-b"
              >
                <span>{i.email}</span>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleRemoveInvitee(i.id)}
                  disabled={loading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Answered Invitees */}
      {answeredInvitees.length > 0 && (
        <>
          <h5 className="font-medium mt-4">Answered</h5>
          <ul className="mb-2">
            {answeredInvitees.map((i) => (
              <li
                key={i.id}
                className="flex justify-between items-center p-2 border-b"
              >
                <span>
                  {i.email} –{" "}
                  <strong>{i.attendance || "No Response"}</strong>
                </span>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleRemoveInvitee(i.id)}
                  disabled={loading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Status/Error message */}
      {status && <p className="text-sm mt-2 text-red-600">{status}</p>}
    </div>
  );
}

export default InviteesManager;
