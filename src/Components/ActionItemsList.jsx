import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import notificationService from "../services/notificationService";

const API_BASE_URL = "https://localhost:7074"; // Use API base URL for file links

function ActionItemsList({ meetingId }) {
  const [actionItems, setActionItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: "", type: "", deadline: "", email: "" });
  const [attachments, setAttachments] = useState([]); // <-- NEW: Store files
  const [users, setUsers] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [meetingData, setMeetingData] = useState(null);
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
      // Step 1: Create the action item
      const res = await axios.post(`/Meeting/${meetingId}/action-items`, {
        description: newItem.description,
        type: newItem.type,
        deadline: newItem.deadline,
        assignedToUserId: assignedUser.id
      });

      const createdItem = res.data;
      setActionItems(prev => [...prev, createdItem]);
      setMessage("✅ Action item added!");

      // Step 2: Upload attachments if any
      if (attachments.length > 0) {
        const formData = new FormData();
        attachments.forEach(file => formData.append("files", file));

        try {
          await axios.post(
            `/Meeting/${meetingId}/action-items/${createdItem.id}/assignment-attachments`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          setMessage("✅ Action item and attachments uploaded!");
        } catch (uploadError) {
          console.error(uploadError);
          setError("⚠️ Action item created, but attachments failed to upload.");
        }
      }

      // Step 3: Reset form
      setNewItem({ description: "", type: "", deadline: "", email: "" });
      setAttachments([]); // Clear files
      setSuggestions([]);

      // Step 4: Send notification
      if (meetingData) {
        try {
          await notificationService.notifyActionItemAssignment(
            assignedUser.id,
            createdItem,
            meetingData.title || "Meeting"
          );
        } catch (notifError) {
          console.error("Failed to send notification:", notifError);
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

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading action items...</p>;

  const submittedItems = actionItems.filter(i => i.status === "Submitted");
  const otherItems = actionItems.filter(i => i.status !== "Submitted");

  const ActionItemCard = ({ item, showJudgmentButton = false }) => (
  <div className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md bg-white flex flex-col gap-3 transition">
    <div className="flex flex-col sm:flex-row sm:justify-between">
      <div className="flex-1">
        <p className="font-semibold text-gray-900 break-words">{item.description}</p>
        <p className="text-gray-700 text-sm">Type: {item.type || "Task"}</p>
        <p className="text-gray-700 text-sm">
          Assigned To: {usersMap[item.assignedToUserId] || item.assignedToUserId}
        </p>
        {showJudgmentButton ? (
          <p className="text-gray-700 text-sm">Judgment: {item.judgment}</p>
        ) : (
          <p className="text-gray-700 text-sm">Status: {item.status}</p>
        )}

        {/* Show uploaded submission files ONLY for submitted items */}
        {item.status === "Submitted" && item.submissionAttachmentsUrl?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.submissionAttachmentsUrl.map((fileUrl, index) => {
              const fileName = fileUrl.split("/").pop();
              return (
                <a
                  key={index}
                  href={`${API_BASE_URL}${fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm hover:bg-blue-200 transition"
                >
                  {fileName}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Buttons Section (Judgment if applicable, Delete always) */}
      <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col gap-2">
        {showJudgmentButton && (
          <button
            onClick={() => toggleJudgment(item.id)}
            className={`px-3 py-1 rounded text-white font-medium text-sm ${
              item.judgment === "Accepted"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {item.judgment === "Accepted" ? "Reject" : "Accept"}
          </button>
        )}
        <button
          onClick={() => deleteActionItem(item.id)}
          className="px-3 py-1 rounded text-white font-medium text-sm bg-gray-500 hover:bg-gray-600"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);


  return (
    <div className="p-6 border rounded-lg mb-6 bg-gray-50 shadow-md max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Action Items</h2>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}

      {/* Add New Action Item */}
      <div className="flex flex-col gap-3 mb-6 relative bg-white p-4 rounded-lg shadow-sm">
        <input
          type="text"
          placeholder="Description"
          value={newItem.description}
          onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
          className="border px-2 py-1 rounded w-full"
        />
        <input
          type="text"
          placeholder="Type"
          value={newItem.type}
          onChange={e => setNewItem(prev => ({ ...prev, type: e.target.value }))}
          className="border px-2 py-1 rounded w-full"
        />
        <input
          type="date"
          placeholder="Deadline"
          value={newItem.deadline}
          onChange={e => setNewItem(prev => ({ ...prev, deadline: e.target.value }))}
          className="border px-2 py-1 rounded w-full"
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
            <ul className="absolute top-full left-0 right-0 bg-white border rounded mt-1 max-h-40 overflow-y-auto z-10 shadow-sm">
              {suggestions.map(u => (
                <li
                  key={u.id}
                  className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                  onClick={() => { setNewItem(prev => ({ ...prev, email: u.email })); setSuggestions([]); }}
                >
                  {u.email}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Attachments input */}
       <div className="flex flex-col gap-2">
  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border rounded px-4 py-2 text-center text-gray-700 font-medium transition">
    Choose Files
    <input
      type="file"
      multiple
      onChange={e => setAttachments(Array.from(e.target.files))}
      className="hidden"
    />
  </label>

  {attachments.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {attachments.map((file, index) => (
        <span
          key={index}
          className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded"
        >
          {file.name}
        </span>
      ))}
    </div>
  )}
</div>


        <button
          onClick={addActionItem}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mt-1 self-start"
        >
          Add Action Item
        </button>
      </div>

      {/* Submitted Action Items */}
      {submittedItems.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">Submitted Action Items</h3>
          {submittedItems.map(item => <ActionItemCard key={item.id} item={item} showJudgmentButton />)}
        </div>
      )}

      {/* Other Action Items */}
      {otherItems.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">Other Action Items</h3>
          {otherItems.map(item => <ActionItemCard key={item.id} item={item} />)}
        </div>
      )}

      {submittedItems.length === 0 && otherItems.length === 0 && (
        <p className="text-center text-gray-500">No action items</p>
      )}
    </div>
  );
}

export default ActionItemsList;
