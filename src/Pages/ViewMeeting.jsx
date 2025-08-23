import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../Components/Header.jsx";
import Footer from "../Components/Footer.jsx";
import axios from "../api/axiosInstance";
import { FaCalendarAlt, FaClock, FaUsers, FaPaperclip } from "react-icons/fa";

const convertUTCToBeirut = (utcString) => {
  if (!utcString) return null;
  const utcDate = new Date(utcString);
  const beirutOffset = 3 * 60; // +3 hours
  return new Date(utcDate.getTime() + beirutOffset * 60 * 1000);
};

function ViewMeeting() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [meetingRes, userRes] = await Promise.all([
          axios.get(`/Meeting/${id}`),
          axios.get(`/Users/me`)
        ]);
        setMeeting(meetingRes.data);
        setCurrentUser(userRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load meeting.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleActionItemStatus = async (itemId) => {
    try {
      const res = await axios.put(`/Meeting/${id}/action-items/${itemId}/toggle-status`);
      setMeeting(prev => ({
        ...prev,
        actionItems: prev.actionItems.map(item =>
          item.id === itemId ? res.data : item
        )
      }));
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading meeting...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!meeting) return <p className="text-center mt-10">Meeting not found</p>;

  const myActionItems = meeting.actionItems?.filter(ai => ai.assignedToUserId === currentUser?.id) || [];
  const acceptedItems = myActionItems.filter(ai => ai.judgment === "Accepted");
  const otherItems = myActionItems.filter(ai => ai.judgment !== "Accepted");

  return (
    <>
      <Header showGradient={false} />
      <div className="max-w-5xl mx-auto p-6 space-y-8">

        {/* Meeting Details */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">{meeting.title}</h1>
          <p className="text-gray-600 mb-4">{meeting.agenda || "No agenda provided"}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" />
              <span>
                {convertUTCToBeirut(meeting.startTime)?.toLocaleDateString() || "-"} -{" "}
                {convertUTCToBeirut(meeting.endTime)?.toLocaleDateString() || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-500" />
              <span>
                {convertUTCToBeirut(meeting.startTime)?.toLocaleTimeString() || "-"} -{" "}
                {convertUTCToBeirut(meeting.endTime)?.toLocaleTimeString() || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Invitees */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaUsers /> Invitees
          </h2>
          {meeting.invitees?.length > 0 ? (
            <ul className="space-y-2">
              {meeting.invitees.map(inv => (
                <li key={inv.id} className="flex justify-between text-sm">
                  <span>{inv.email}</span>
                  <span className="text-gray-500">{inv.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No invitees</p>
          )}
        </div>

        {/* Accepted Action Items */}
        {acceptedItems.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Accepted Action Items</h2>
            <div className="space-y-4">
              {acceptedItems.map(ai => (
                <div key={ai.id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                  <p className="font-medium break-words">{ai.description}</p>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><span className="font-medium">Deadline:</span> {convertUTCToBeirut(ai.deadline)?.toLocaleDateString() || "-"}</p>
                    <p><span className="font-medium">Status:</span> <span className="text-green-600 font-medium">{ai.status}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Action Items */}
        {otherItems.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">My Action Items</h2>
            <div className="space-y-4">
              {otherItems.map(ai => {
                const isDone = ai.status === "done";
                return (
                  <div key={ai.id} className={`border rounded-lg p-4 ${isDone ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-medium break-words ${isDone ? 'line-through text-gray-500' : ''}`}>
                          {ai.description}
                        </p>
                        <div className="mt-2 text-sm text-gray-600">
                          <p><span className="font-medium">Deadline:</span> {convertUTCToBeirut(ai.deadline)?.toLocaleDateString() || "-"}</p>
                          <p>
                            <span className="font-medium">Status:</span>{" "}
                            <span className={`capitalize ${isDone ? 'text-green-600 font-medium' : 'text-orange-600'}`}>
                              {ai.status}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Submit / Unsubmit */}
                      {ai.status !== "done" && (
                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={() => toggleActionItemStatus(ai.id)}
                            className={`px-3 py-1 rounded text-white font-medium text-sm ${ai.status === "Pending" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                          >
                            {ai.status === "Pending" ? "Submit" : "Unsubmit"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          {meeting.notes?.length > 0 ? (
            <ul className="space-y-2">
              {meeting.notes.map(note => (
                <li key={note.id} className="border-b pb-2">
                  <p>{note.content}</p>
                  <p className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No notes available</p>
          )}
        </div>

        {/* Attachments */}
        {meeting.attachments?.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaPaperclip /> Attachments
            </h2>
            <ul className="space-y-2">
              {meeting.attachments.map(file => (
                <li key={file.id}>
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {file.fileName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
      <Footer />
    </>
  );
}

export default ViewMeeting;
