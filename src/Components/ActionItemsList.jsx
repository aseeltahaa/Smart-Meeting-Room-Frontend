import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

function ActionItemsList({ meetingId }) {
  const [actionItems, setActionItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: "", type: "", status: "", deadline: "", email: "" });
  const [users, setUsers] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Fetch meeting action items and all users
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [meetingRes, usersRes] = await Promise.all([
          axios.get(`/Meeting/${meetingId}`),
          axios.get("/Users", { headers: { Accept: "application/json" } })
        ]);

        setActionItems(Array.isArray(meetingRes.data.actionItems) ? meetingRes.data.actionItems : []);

        const fetchedUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
        setUsers(fetchedUsers);

        const map = {};
        fetchedUsers.forEach(u => { map[u.id] = u.email; });
        setUsersMap(map);
      } catch (err) {
        console.error(err);
        setError("❌ Failed to load action items or users.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [meetingId]);

  // Update suggestions when email input changes
  useEffect(() => {
    if (!newItem.email.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = users
      .filter(u => u.email.toLowerCase().includes(newItem.email.toLowerCase()))
      .slice(0, 5); // limit to 5 suggestions
    setSuggestions(filtered);
  }, [newItem.email, users]);

  const addActionItem = async () => {
    if (!newItem.description.trim() || !newItem.email.trim()) return;

    setMessage("");
    setError("");

    // Find userId by email
    const assignedUser = users.find(u => u.email === newItem.email.trim());
    if (!assignedUser) {
      setError("⚠️ User with that email not found.");
      return;
    }

    try {
      const res = await axios.post(`/Meeting/${meetingId}/action-items`, {
        description: newItem.description,
        type: newItem.type,
        status: newItem.status,
        deadline: newItem.deadline,
        assignedToUserId: assignedUser.id
      });
      setActionItems(prev => [...prev, res.data]);
      setNewItem({ description: "", type: "", status: "", deadline: "", email: "" });
      setMessage("✅ Action item added!");
      setSuggestions([]);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to add action item.");
    }
  };

  const deleteActionItem = async (itemId) => {
    setMessage("");
    setError("");
    try {
      await axios.delete(`/Meeting/${meetingId}/action-items/${itemId}`);
      setActionItems(prev => prev.filter(item => item.id !== itemId));
      setMessage("✅ Action item deleted!");
    } catch (err) {
      console.error(err);
      setError("❌ Failed to delete action item.");
    }
  };

  if (loading) return <p>Loading action items...</p>;

  return (
    <div className="p-4 border rounded-lg mb-6 bg-white shadow relative">
      <h2 className="text-xl font-semibold mb-3">Action Items</h2>

      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="flex flex-col gap-2 mb-4 relative">
        <input
          type="text"
          placeholder="Description"
          value={newItem.description}
          onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Type"
          value={newItem.type}
          onChange={e => setNewItem(prev => ({ ...prev, type: e.target.value }))}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Status"
          value={newItem.status}
          onChange={e => setNewItem(prev => ({ ...prev, status: e.target.value }))}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          placeholder="Deadline"
          value={newItem.deadline}
          onChange={e => setNewItem(prev => ({ ...prev, deadline: e.target.value }))}
          className="border px-2 py-1 rounded"
        />
        <div className="relative">
          <input
            type="email"
            placeholder="Assign to (email)"
            value={newItem.email}
            onChange={e => setNewItem(prev => ({ ...prev, email: e.target.value }))}
            className="border px-2 py-1 rounded w-full"
          />
          {suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border rounded mt-1 max-h-40 overflow-y-auto z-10">
              {suggestions.map(u => (
                <li
                  key={u.id}
                  className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setNewItem(prev => ({ ...prev, email: u.email }));
                    setSuggestions([]);
                  }}
                >
                  {u.email}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={addActionItem}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition mt-1"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {(actionItems || []).map(item => (
          <li key={item.id} className="flex justify-between items-center border-b pb-1">
            <span>
              <strong>{item.type || "Task"}</strong> | Status: {item.status || "pending"} | Assigned To: {usersMap[item.assignedToUserId] || item.assignedToUserId}
            </span>
            <button
              onClick={() => deleteActionItem(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ActionItemsList;
