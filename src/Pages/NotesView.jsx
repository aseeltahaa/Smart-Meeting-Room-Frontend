import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import notificationService from '../services/notificationService';
import ViewHeader from "../Components/ViewHeader.jsx";

function NotesView() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('Meeting Participant');

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, noteId: null });

  // Helper for API error messages
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
    fetchCurrentUser();
    fetchMeeting();
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`/Users/me`);
      setCurrentUserId(res.data.id);
      setCurrentUserName(res.data.name || res.data.email || 'Meeting Participant');
    } catch (err) {
      console.error("Failed to fetch current user:", getApiErrorMessage(err));
    }
  };

  const fetchMeeting = async () => {
    try {
      const res = await axios.get(`/Meeting/${id}`);
      setMeeting(res.data);
    } catch (err) {
      console.error("Failed to fetch meeting:", getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const res = await axios.post(`/Meeting/${id}/notes`, { content: newNote });
      setNewNote("");

      // Refresh meeting data
      await fetchMeeting();

      // 🔔 Send notifications to invitees (excluding current user)
      if (meeting?.invitees?.length > 0) {
        const inviteeUserIds = meeting.invitees
          .map(invitee => invitee.userId)
          .filter(userId => userId && userId !== currentUserId);

        if (inviteeUserIds.length > 0) {
          try {
            await notificationService.notifyNoteAdded(
              inviteeUserIds,
              meeting.title || 'Meeting',
              res.data.content || newNote,
              currentUserName
            );
            console.log("✅ Note notification sent");
          } catch (notifErr) {
            console.error("❌ Failed to send note notification:", notifErr);
          }
        }
      }

    } catch (err) {
      console.error("Failed to add note:", getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (noteId) => {
    setConfirmModal({ isOpen: true, noteId });
  };

  const handleDeleteConfirmed = async () => {
    const { noteId } = confirmModal;
    if (!noteId) return;

    try {
      await axios.delete(`/Meeting/${id}/notes/${noteId}`);
      await fetchMeeting();
    } catch (err) {
      console.error("Failed to delete note:", getApiErrorMessage(err));
    } finally {
      setConfirmModal({ isOpen: false, noteId: null });
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!meeting) return <p className="text-center mt-10">Meeting not found</p>;

  return (
    <>
      <ViewHeader meetingId={id} />
      <div className="max-w-5xl mx-auto p-6 space-y-4">

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="mb-6 space-y-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="w-full p-3 border rounded-md"
            placeholder="Write a new note..."
            rows={3}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Note"}
          </button>
        </form>

        {/* Notes */}
        {meeting.notes?.length > 0 ? (
          meeting.notes.map(note => (
            <div
              key={note.id}
              className="p-4 border rounded-md bg-gray-50 relative"
            >
              <p className="text-gray-800">{note.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(note.createdAt).toLocaleString()}
              </p>

              {note.createdByUserId === currentUserId && (
                <button
                  onClick={() => confirmDelete(note.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No notes available</p>
        )}

      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Delete Note</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false, noteId: null })}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NotesView;
