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
  const [currentUser, setCurrentUser] = useState(null); // from /Users/me

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

  const markActionItemDone = async (itemId, actionItem) => {
    try {
      await axios.put(`/api/Meeting/${id}/action-items/${itemId}`, {
        assignedToUserId: actionItem.assignedToUserId,
        deadline: actionItem.deadline,
        status: "done",
        type: actionItem.type,
        description: actionItem.description
      });
      setMeeting((prev) => ({
        ...prev,
        actionItems: prev.actionItems.map((item) =>
          item.id === itemId ? { ...item, status: "done" } : item
        ),
      }));
    } catch (err) {
      console.error("Error updating action item:", err);
    }
  };

  // Helper function to get assignee email
  const getAssigneeEmail = (assignedToUserId) => {
    const assignee = meeting?.invitees?.find(inv => inv.userId === assignedToUserId);
    return assignee ? assignee.email : 'Unknown User';
  };

  if (loading) return <p className="text-center mt-10">Loading meeting...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!meeting) return <p className="text-center mt-10">Meeting not found</p>;

  return (
    <>
      <Header showGradient={false} />
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Meeting Details */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">{meeting.title}</h1>
          <p className="text-gray-600 mb-4">{meeting.agenda}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" />
              <span>
                {convertUTCToBeirut(meeting.startTime)?.toLocaleDateString()} -{" "}
                {convertUTCToBeirut(meeting.endTime)?.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-500" />
              <span>
                {convertUTCToBeirut(meeting.startTime)?.toLocaleTimeString()} -{" "}
                {convertUTCToBeirut(meeting.endTime)?.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Invitees */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaUsers /> Invitees
          </h2>
          <ul className="space-y-2">
            {meeting.invitees.map((inv) => (
              <li key={inv.id} className="flex justify-between text-sm">
                <span>{inv.email}</span>
                <span className="text-gray-500">{inv.status}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Items */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">My Action Items</h2>
          {meeting.actionItems && meeting.actionItems.filter(ai => ai.assignedToUserId === currentUser?.id).length > 0 ? (
            <div className="space-y-4">
              {meeting.actionItems
                .filter(ai => ai.assignedToUserId === currentUser?.id)
                .map((ai) => {
                  const isDone = ai.status === "done";
                  
                  return (
                    <div
                      key={ai.id}
                      className={`border rounded-lg p-4 ${isDone ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => !isDone && markActionItemDone(ai.id, ai)}
                              className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                              disabled={isDone}
                            />
                            <p className={`font-medium ${isDone ? 'line-through text-gray-500' : ''}`}>
                              {ai.description}
                            </p>
                          </div>
                          
                          <div className="ml-8 space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">Deadline:</span>{" "}
                              {convertUTCToBeirut(ai.deadline)?.toLocaleDateString()}
                            </p>
                            <p>
                              <span className="font-medium">Status:</span>{" "}
                              <span className={`capitalize ${isDone ? 'text-green-600 font-medium' : 'text-orange-600'}`}>
                                {ai.status}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No action items assigned to you</p>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          {meeting.notes && meeting.notes.length > 0 ? (
            <ul className="space-y-2">
              {meeting.notes.map((note) => (
                <li key={note.id} className="border-b pb-2">
                  <p>{note.content}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
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
              {meeting.attachments.map((file) => (
                <li key={file.id}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
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