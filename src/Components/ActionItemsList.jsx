import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import notificationService from "../services/notificationService";

function ActionItemsList({ meetingId }) {
  const [actionItems, setActionItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: "", type: "", deadline: "", email: "" });
  const [attachments, setAttachments] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [meetingData, setMeetingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Helper to extract API error messages
  const getApiErrorMessage = (err, fallback = "❌ Something went wrong.") => {
    if (err.response) {
      return err.response.data?.message || err.response.data?.error || JSON.stringify(err.response.data) || fallback;
    } else if (err.request) {
      return "❌ No response from server. Please try again.";
    } else {
      return `❌ ${err.message}`;
    }
  };

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
        setError(getApiErrorMessage(err, "❌ Failed to load action items or users."));
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

      const createdItem = res.data;
      setActionItems(prev => [...prev, createdItem]);
      setMessage("✅ Action item added!");

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
          // Refresh action items to get updated attachment URLs
          const updatedRes = await axios.get(`/Meeting/${meetingId}`);
          setActionItems(Array.isArray(updatedRes.data.actionItems) ? updatedRes.data.actionItems : []);
        } catch (uploadError) {
          console.error(uploadError);
          setError("⚠️ Action item created, but attachments failed to upload.");
        }
      }

      setNewItem({ description: "", type: "", deadline: "", email: "" });
      setAttachments([]);
      setSuggestions([]);

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
      setError(getApiErrorMessage(err, "❌ Failed to add action item."));
    }
  };

  const deleteActionItem = async (itemId) => {
    setMessage(""); setError("");
    try {
      await axios.delete(`/Meeting/${meetingId}/action-items/${itemId}`);
      setActionItems(prev => prev.filter(i => i.id !== itemId));
      setMessage("🗑️ Action item deleted!");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "❌ Failed to delete action item."));
    }
  };

  const acceptActionItem = async (itemId) => {
    setMessage(""); setError("");
    try {
      const res = await axios.put(`/Meeting/${meetingId}/action-items/${itemId}/accept`, { judgment: "Accepted" });
      setActionItems(prev => prev.map(i => i.id === itemId ? res.data : i));
      setMessage("✅ Action item accepted!");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "❌ Failed to accept action item."));
    }
  };

  const rejectActionItem = async (itemId) => {
    setMessage(""); setError("");
    try {
      const res = await axios.put(`/Meeting/${meetingId}/action-items/${itemId}/reject`, { judgment: "Rejected" });
      setActionItems(prev => prev.map(i => i.id === itemId ? res.data : i));
      setMessage("❌ Action item rejected!");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "❌ Failed to reject action item."));
    }
  };

  const handleAttachmentClick = async (fileUrl, isAssignment = false, itemId) => {
    try {
      let downloadUrl;
      const fileName = fileUrl.split("/").pop();
      if (isAssignment) {
        downloadUrl = `/files/action-items/${itemId}/assignment/${fileName}`;
      } else {
        downloadUrl = `/files/action-items/${itemId}/submission/${fileName}`;
      }

      const response = await axios.get(downloadUrl, { responseType: "blob" });
      const contentDisposition = response.headers["content-disposition"];
      let finalName = fileName;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*=UTF-8''(.+)$/);
        if (match && match[1]) finalName = decodeURIComponent(match[1]);
        else {
          const match2 = contentDisposition.match(/filename="(.+)"/);
          if (match2 && match2[1]) finalName = match2[1];
        }
      }

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", finalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download file:", err);
      alert(getApiErrorMessage(err, "❌ You are not authorized to view this file or it failed to load."));
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading action items...</p>;

  const submittedItems = actionItems.filter(i => i.status === "Submitted");
  const pendingItems = actionItems.filter(i => i.status === "Pending");

  const ActionItemCard = ({ item }) => {
    const isSubmitted = item.status === "Submitted";
    const judgment = item.judgment;
    const typeEmoji = item.type ? "📝" : "📌";

    return (
      <div className="border rounded-2xl p-5 mb-5 shadow-lg hover:shadow-xl bg-white flex flex-col gap-3 transition relative">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-lg break-words">{typeEmoji} {item.description}</p>
            <p className="text-gray-700 text-sm">Type: {item.type || "Task"}</p>
            <p className="text-gray-700 text-sm">Assigned To: {usersMap[item.assignedToUserId] || item.assignedToUserId}</p>
            <p className="text-gray-700 text-sm">Status: {item.status}</p>
            {item.deadline && <p className="text-gray-700 text-sm">Deadline: {new Date(item.deadline).toLocaleDateString()}</p>}
            {isSubmitted && <p className="text-gray-700 text-sm">Judgment: <span className={`ml-1 font-medium ${
              judgment === "Accepted" ? "text-green-600" :
              judgment === "Rejected" ? "text-red-600" :
              "text-yellow-600"
            }`}>{judgment}</span></p>}

            {/* Assignment Attachments */}
            {item.assignmentAttachmentsUrl?.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">📂 Assignment Files:</p>
                <div className="flex flex-wrap gap-2">
                  {item.assignmentAttachmentsUrl.map((fileUrl, index) => (
                    <span
                      key={index}
                      onClick={() => handleAttachmentClick(fileUrl, true, item.id)}
                      className="cursor-pointer bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm hover:bg-green-200 transition inline-block"
                      title={fileUrl.split("/").pop()}
                    >📄 {fileUrl.split("/").pop()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Submission Attachments */}
            {item.submissionAttachmentsUrl?.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">📎 Submission Files:</p>
                <div className="flex flex-wrap gap-2">
                  {item.submissionAttachmentsUrl.map((fileUrl, index) => (
                    <span
                      key={index}
                      onClick={() => handleAttachmentClick(fileUrl, false, item.id)}
                      className="cursor-pointer bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition inline-block"
                      title={fileUrl.split("/").pop()}
                    >📄 {fileUrl.split("/").pop()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-3 sm:mt-0 sm:ml-4">
            {isSubmitted && (judgment === "Unjudged" || judgment === "Rejected") && (
              <button onClick={() => acceptActionItem(item.id)} className="px-4 py-2 rounded-lg text-white font-medium text-sm bg-green-500 hover:bg-green-600 transition">✅ Accept</button>
            )}
            {isSubmitted && (judgment === "Unjudged" || judgment === "Accepted") && (
              <button onClick={() => rejectActionItem(item.id)} className="px-4 py-2 rounded-lg text-white font-medium text-sm bg-red-500 hover:bg-red-600 transition">❌ Reject</button>
            )}
            <button onClick={() => deleteActionItem(item.id)} className="px-4 py-2 rounded-lg text-white font-medium text-sm bg-gray-500 hover:bg-gray-600 transition">🗑️ Delete</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 border rounded-lg mb-6 bg-gray-50 shadow-md max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">📝 Action Items</h2>
      {message && <p className="text-green-600 mb-2 font-medium">{message}</p>}
      {error && <p className="text-red-500 mb-2 font-medium">{error}</p>}

      {/* Add New Action Item Form */}
      <div className="flex flex-col gap-3 mb-6 relative bg-white p-5 rounded-2xl shadow-md">
        <h3 className="font-medium text-gray-800 mb-2">Add New Action Item</h3>
        <input type="text" placeholder="Description *" value={newItem.description} onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))} className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        <input type="text" placeholder="Type (e.g., Task, Bug, Feature)" value={newItem.type} onChange={e => setNewItem(prev => ({ ...prev, type: e.target.value }))} className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        <input type="date" placeholder="Deadline" value={newItem.deadline} onChange={e => setNewItem(prev => ({ ...prev, deadline: e.target.value }))} className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        <div className="relative">
          <input type="email" placeholder="Assign to (email) *" value={newItem.email} onChange={e => setNewItem(prev => ({ ...prev, email: e.target.value }))} className="border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          {suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto z-10 shadow-lg">
              {suggestions.map(u => (
                <li key={u.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer transition" onClick={() => { setNewItem(prev => ({ ...prev, email: u.email })); setSuggestions([]); }}>{u.email}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border rounded-lg px-4 py-2 text-center text-gray-700 font-medium transition">
            📎 Choose Files
            <input type="file" multiple onChange={e => setAttachments(Array.from(e.target.files))} className="hidden"/>
          </label>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">{attachments.map((file, index) => (<span key={index} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{file.name}</span>))}</div>
          )}
        </div>
        <button onClick={addActionItem} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition mt-1 self-start font-medium">➕ Add Action Item</button>
      </div>

      {submittedItems.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">📤 Submitted Action Items ({submittedItems.length})</h3>
          {submittedItems.map(item => <ActionItemCard key={item.id} item={item} />)}
        </div>
      )}

      {pendingItems.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">⏳ Pending Action Items ({pendingItems.length})</h3>
          {pendingItems.map(item => <ActionItemCard key={item.id} item={item} />)}
        </div>
      )}

      {submittedItems.length === 0 && pendingItems.length === 0 && (
        <p className="text-center text-gray-500 my-8">No action items yet. Create one above!</p>
      )}
    </div>
  );
}

export default ActionItemsList;
