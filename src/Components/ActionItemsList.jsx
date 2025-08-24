import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import notificationService from "../services/notificationService"; // Import the service

function ActionItemsList({ meetingId }) {
  const [actionItems, setActionItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: "", type: "", deadline: "", email: "" });
  const [users, setUsers] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [meetingData, setMeetingData] = useState(null); // Store meeting data
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [meetingRes, usersRes] = await Promise.all([
          axios.get(`/Meeting/${meetingId}`),
          axios.get("/Users")
        ]);
        
        // Store meeting data for notifications
        setMeetingData(meetingRes.data);
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

  useEffect(() => {
    if (!newItem.email.trim()) return setSuggestions([]);
    const filtered = users
      .filter(u => u.email.toLowerCase().includes(newItem.email.toLowerCase()))
      .slice(0, 5);
    setSuggestions(filtered);
  }, [newItem.email, users]);

  const addActionItem = async () => {
    if (!newItem.description.trim() || !newItem.email.trim()) return;

    setMessage(""); setError("");
    const assignedUser = users.find(u => u.email === newItem.email.trim());
    if (!assignedUser) { setError("⚠️ User not found."); return; }

    try {
      const res = await axios.post(`/Meeting/${meetingId}/action-items`, {
        description: newItem.description,
        type: newItem.type,
        deadline: newItem.deadline,
        assignedToUserId: assignedUser.id
      });
      
      setActionItems(prev => [...prev, res.data]);
      setNewItem({ description: "", type: "", deadline: "", email: "" });
      setSuggestions([]);
      setMessage("✅ Action item added!");

      // 🔔 Send notification to assigned user
      if (meetingData) {
        try {
          await notificationService.notifyActionItemAssignment(
            assignedUser.id,
            res.data,
            meetingData.title || 'Meeting'
          );
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
          // Don't show error to user - notification failure shouldn't break the flow
        }
      }
    } catch (err) {
      console.error(err);
      setError("❌ Failed to add action item.");
    }
  };

  const deleteActionItem = async (itemId) => {
    setMessage(""); setError("");
    try {
      await axios.delete(`/Meeting/${meetingId}/action-items/${itemId}`);
      setActionItems(prev => prev.filter(i => i.id !== itemId));
      setMessage("✅ Action item deleted!");
    } catch (err) {
      console.error(err);
      setError("❌ Failed to delete action item.");
    }
  };

  const toggleJudgment = async (itemId) => {
    setMessage(""); setError("");
    try {
      const res = await axios.put(`/Meeting/${meetingId}/action-items/${itemId}/toggle-judgment`);
      setActionItems(prev => prev.map(i => i.id === itemId ? res.data : i));
      setMessage("✅ Judgment updated!");
    } catch (err) {
      console.error(err);
      setError("❌ Failed to update judgment.");
    }
  };

  if (loading) return <p>Loading action items...</p>;

  const submittedItems = actionItems.filter(i => i.status === "Submitted");
  const otherItems = actionItems.filter(i => i.status !== "Submitted");

  const ActionItemCard = ({ item, showJudgmentButton = false }) => (
  <div className="border rounded-lg p-3 mb-3 shadow-sm hover:shadow-md bg-white flex flex-col gap-2">
    <div className="flex justify-between">
      <div className="flex-1">
        <p className="font-semibold text-gray-900 break-words">{item.description}</p>
        <p className="text-gray-700 text-sm">Type: {item.type || "Task"}</p>
        <p className="text-gray-700 text-sm">Assigned To: {usersMap[item.assignedToUserId] || item.assignedToUserId}</p>
        {showJudgmentButton ? (
          <p className="text-gray-700 text-sm">Judgment: {item.judgment}</p>
        ) : (
          <p className="text-gray-700 text-sm">Status: {item.status}</p>
        )}
      </div>
    </div>

    {showJudgmentButton && (
      <div className="flex flex-col gap-1 mt-2">
        <button
          onClick={() => toggleJudgment(item.id)}
          className={`px-2 py-1 rounded text-white font-medium text-sm ${
            item.judgment === "Accepted" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {item.judgment === "Accepted" ? "Reject" : "Accept"}
        </button>
        <button
          onClick={() => deleteActionItem(item.id)}
          className={`px-2 py-1 rounded text-white font-medium text-sm ${
            item.judgment === "Accepted" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          Delete
        </button>
      </div>
    )}
  </div>
);

  return (
    <div className="p-4 border rounded-lg mb-6 bg-gray-50 shadow">
      <h2 className="text-xl font-semibold mb-3">Action Items</h2>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}

      {/* Add New */}
      <div className="flex flex-col gap-2 mb-6 relative bg-white p-4 rounded-lg shadow-sm">
        <input
          type="text" placeholder="Description" value={newItem.description}
          onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
          className="border px-2 py-1 rounded w-full"
        />
        <input
          type="text" placeholder="Type" value={newItem.type}
          onChange={e => setNewItem(prev => ({ ...prev, type: e.target.value }))}
          className="border px-2 py-1 rounded w-full"
        />
        <input
          type="date" placeholder="Deadline" value={newItem.deadline}
          onChange={e => setNewItem(prev => ({ ...prev, deadline: e.target.value }))}
          className="border px-2 py-1 rounded w-full"
        />
        <div className="relative">
          <input
            type="email" placeholder="Assign to (email)" value={newItem.email}
            onChange={e => setNewItem(prev => ({ ...prev, email: e.target.value }))}
            className="border px-2 py-1 rounded w-full"
          />
          {suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border rounded mt-1 max-h-40 overflow-y-auto z-10">
              {suggestions.map(u => (
                <li key={u.id} className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                    onClick={() => { setNewItem(prev => ({ ...prev, email: u.email })); setSuggestions([]); }}>
                  {u.email}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={addActionItem} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition mt-1">Add</button>
      </div>

      {/* Submitted */}
      {submittedItems.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Submitted Action Items</h3>
          {submittedItems.map(item => <ActionItemCard key={item.id} item={item} showJudgmentButton />)}
        </div>
      )}

      {/* Other */}
      {otherItems.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Other Action Items</h3>
          {otherItems.map(item => <ActionItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}

export default ActionItemsList;