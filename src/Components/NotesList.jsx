import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";
import notificationService from "../services/notificationService";

function NotesList({ meetingId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [meetingData, setMeetingData] = useState(null);

  // Fetch notes on mount or when meetingId changes
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/Meeting/${meetingId}`);
        setMeetingData(res.data);
        setNotes(Array.isArray(res.data.notes) ? res.data.notes : []);
      } catch (err) {
        console.error(err);
        let message = "❌ Failed to load notes.";
        if (err.response) {
          message =
            err.response.data?.message || err.response.data?.error || message;
        } else if (err.request) {
          message = "❌ No response from server. Please try again.";
        } else {
          message = `❌ ${err.message}`;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) fetchNotes();
  }, [meetingId]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    setError(null);
    setMessage("");
    try {
      const res = await axios.post(`/Meeting/${meetingId}/notes`, {
        content: newNote,
      });

      setNotes((prev) => [...prev, res.data]);
      setNewNote("");
      setMessage("✅ Note added successfully!");

      if (meetingData && meetingData.invitees) {
        try {
          const inviteeUserIds = meetingData.invitees
            .map((invitee) => invitee.userId)
            .filter((userId) => userId);
          if (inviteeUserIds.length > 0) {
            await notificationService.notifyNoteAdded(
              inviteeUserIds,
              meetingData.title || "Meeting",
              res.data.content,
              "Meeting Participant"
            );
          }
        } catch (notifError) {
          console.error("❌ Failed to send note notification:", notifError);
        }
      }
    } catch (err) {
      console.error(err);

      let message = "❌ Failed to add note.";
      if (err.response) {
        message =
          err.response.data?.message ||
          err.response.data?.error ||
          JSON.stringify(err.response.data) ||
          message;
      } else if (err.request) {
        message = "❌ No response from server. Please try again.";
      } else {
        message = `❌ ${err.message}`;
      }

      setError(message);
    }
  };

  const deleteNote = async (noteId) => {
    setError(null);
    setMessage("");
    try {
      await axios.delete(`/Meeting/${meetingId}/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setMessage("✅ Note deleted successfully!");
    } catch (err) {
      console.error(err);

      let message = "❌ Failed to delete note.";
      if (err.response) {
        message =
          err.response.data?.message ||
          err.response.data?.error ||
          JSON.stringify(err.response.data) ||
          message;
      } else if (err.request) {
        message = "❌ No response from server. Please try again.";
      } else {
        message = `❌ ${err.message}`;
      }

      setError(message);
    }
  };

  if (loading) return <p>Loading notes...</p>;

  return (
    <div className="p-4 border rounded-lg mb-6 bg-white shadow">
      <h2 className="text-xl font-semibold mb-3">Notes</h2>

      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note"
          className="border px-2 py-1 rounded flex-1"
        />
        <button
          onClick={addNote}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {(notes || []).map((note) => (
          <li
            key={note.id}
            className="flex justify-between items-center border-b pb-1"
          >
            <span>{note.content}</span>
            <button
              onClick={() => deleteNote(note.id)}
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

export default NotesList;
