import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import notificationService from "../services/notificationService";

function EditMeetingForm({ meetingId }) {
  const [formData, setFormData] = useState({
    title: "",
    agenda: "",
    startTime: "",
    endTime: "",
    status: "",
    onlineLink:"",
    roomId: "",
    userId: "",
  });

  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const [roomSearch, setRoomSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Get current user email from localStorage (for notifications)
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserEmail = currentUser?.email || "Meeting Organizer";

  const convertUTCToBeirut = (utcString) => {
    if (!utcString) return null;
    const utcDate = new Date(utcString);
    const beirutOffset = 3 * 60; // +3 hours
    return new Date(utcDate.getTime() + beirutOffset * 60 * 1000);
  };

  const convertBeirutToUTC = (selectedDate, timeString) => {
    return new Date(selectedDate.toISOString().split('T')[0] + 'T' + timeString).toISOString();
  };

  useEffect(() => {
    if (!meetingId) return;

    const fetchData = async () => {
      try {
        const [meetingRes, roomsRes, usersRes] = await Promise.all([
          api.get(`/Meeting/${meetingId}`),
          api.get("/Room"),
          api.get("/Users"),
        ]);

        const meeting = meetingRes.data;
        const startBeirut = convertUTCToBeirut(meeting.startTime);
        const endBeirut = convertUTCToBeirut(meeting.endTime);

        setFormData({
          ...meeting,
          startTime: startBeirut
            ? `${startBeirut.getFullYear()}-${String(startBeirut.getMonth() + 1).padStart(2, '0')}-${String(startBeirut.getDate()).padStart(2, '0')}T${String(startBeirut.getHours()).padStart(2, '0')}:${String(startBeirut.getMinutes()).padStart(2, '0')}`
            : '',
          endTime: endBeirut
            ? `${endBeirut.getFullYear()}-${String(endBeirut.getMonth() + 1).padStart(2, '0')}-${String(endBeirut.getDate()).padStart(2, '0')}T${String(endBeirut.getHours()).padStart(2, '0')}:${String(endBeirut.getMinutes()).padStart(2, '0')}`
            : '',
        });

        setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

        const room = roomsRes.data.find((r) => r.id === meeting.roomId);
        const user = usersRes.data.find((u) => u.id === meeting.userId);

        if (room) {
          setSelectedRoom(room);
          setRoomSearch(room.name);
        }
        if (user) {
          setSelectedUser(user);
          setUserSearch(user.email);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setStatus("❌ Failed to load meeting data or rooms/users.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meetingId]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setFormData((prev) => ({ ...prev, roomId: room.id }));
    setRoomSearch(room.name);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setFormData((prev) => ({ ...prev, userId: user.id }));
    setUserSearch(user.email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      if (formData.startTime && formData.endTime) {
        const startDate = new Date(formData.startTime);
        const endDate = new Date(formData.endTime);
        const startUTC = convertBeirutToUTC(startDate, formData.startTime.split('T')[1]);
        const endUTC = convertBeirutToUTC(endDate, formData.endTime.split('T')[1]);

        if (new Date(startUTC) >= new Date(endUTC)) {
          setStatus("❌ End time must be after start time.");
          setSaving(false);
          return;
        }

        const payload = { ...formData, startTime: startUTC, endTime: endUTC };
        await api.put(`/Meeting/${meetingId}`, payload);
        setStatus("✅ Meeting updated successfully!");

        // 🔔 Send notifications to invitees
        const meetingRes = await api.get(`/Meeting/${meetingId}`);
        const updatedMeeting = meetingRes.data;

        if (updatedMeeting.invitees && updatedMeeting.invitees.length > 0) {
          const inviteeUserIds = updatedMeeting.invitees
            .map(inv => inv.userId)
            .filter(Boolean);

          if (inviteeUserIds.length > 0) {
            await notificationService.notifyMeetingUpdated(
              inviteeUserIds,
              updatedMeeting.title || "Meeting",
              currentUserEmail
            );
            console.log("✅ Meeting update notifications sent to invitees");
          }
        }
      } else {
        setStatus("❌ Start and end times are required.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to update meeting: " + (err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading meeting details...</p>;

  const filteredRooms = !selectedRoom
    ? rooms.filter((r) => r.name.toLowerCase().includes(roomSearch.toLowerCase()))
    : [];
  const filteredUsers = !selectedUser
    ? users.filter((u) => u.email.toLowerCase().includes(userSearch.toLowerCase()))
    : [];

  return (
    <form className="bg-white p-6 rounded shadow-md max-w-lg mx-auto" onSubmit={handleSubmit}>
      <h4 className="text-lg font-semibold mb-4">Edit Meeting</h4>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> All times are displayed and should be entered in Beirut timezone. They will be automatically converted to UTC for storage.
        </p>
      </div>

      {/* Title */}
      <label className="block mb-1 font-medium">Title</label>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Meeting title"
        className="w-full border rounded px-3 py-2 mb-4"
        required
      />

      {/* Agenda */}
      <label className="block mb-1 font-medium">Agenda</label>
      <textarea
        name="agenda"
        value={formData.agenda}
        onChange={handleChange}
        placeholder="Meeting agenda"
        className="w-full border rounded px-3 py-2 mb-4"
      />

      {/* Start Time */}
      <label className="block mb-1 font-medium">Start Time (Beirut Time)</label>
      <input
        type="datetime-local"
        name="startTime"
        value={formData.startTime}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2 mb-4"
        required
      />

      {/* End Time */}
      <label className="block mb-1 font-medium">End Time (Beirut Time)</label>
      <input
        type="datetime-local"
        name="endTime"
        value={formData.endTime}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2 mb-4"
        required
      />

      {/* Status */}
      <label className="block mb-1 font-medium">Status</label>
      <input
        type="text"
        name="status"
        value={formData.status}
        onChange={handleChange}
        placeholder="Status"
        className="w-full border rounded px-3 py-2 mb-4"
      />

      {/* Link */}
      <label className="block mb-1 font-medium">Online Link</label>
      <textarea
        name="onlineLink"
        value={formData.onlineLink}
        onChange={handleChange}
        placeholder="online link"
        className="w-full border rounded px-3 py-2 mb-4"
      />


      {/* Room search */}
      <label className="block mb-1 font-medium">Room</label>
      <input
        type="text"
        value={roomSearch}
        onChange={(e) => {
          setRoomSearch(e.target.value);
          setSelectedRoom(null);
          setFormData((prev) => ({ ...prev, roomId: "" }));
        }}
        placeholder="Search Room by name"
        className="w-full border rounded px-3 py-2 mb-2"
      />
      {filteredRooms.length > 0 && (
        <ul className="border rounded mb-4 max-h-40 overflow-y-auto">
          {filteredRooms.map((room) => (
            <li
              key={room.id}
              className="px-3 py-2 cursor-pointer hover:bg-gray-200"
              onClick={() => handleRoomSelect(room)}
            >
              {room.name} ({room.capacity} seats - {room.location})
            </li>
          ))}
        </ul>
      )}

      {/* User search */}
      <label className="block mb-1 font-medium">User</label>
      <input
        type="text"
        value={userSearch}
        onChange={(e) => {
          setUserSearch(e.target.value);
          setSelectedUser(null);
          setFormData((prev) => ({ ...prev, userId: "" }));
        }}
        placeholder="Search User by email"
        className="w-full border rounded px-3 py-2 mb-2"
      />
      {filteredUsers.length > 0 && (
        <ul className="border rounded mb-4 max-h-40 overflow-y-auto">
          {filteredUsers.map((user) => (
            <li
              key={user.id}
              className="px-3 py-2 cursor-pointer hover:bg-gray-200"
              onClick={() => handleUserSelect(user)}
            >
              {user.email} ({user.roles?.[0] || "No role"})
            </li>
          ))}
        </ul>
      )}

      {status && (
        <p
          className={`mb-2 text-sm ${
            status.startsWith("✅") ? "text-green-600" : status.startsWith("❌") ? "text-red-600" : "text-yellow-600"
          }`}
        >
          {status}
        </p>
      )}

      <button
        type="submit"
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded"
        disabled={saving || !formData.roomId || !formData.userId}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

export default EditMeetingForm;
