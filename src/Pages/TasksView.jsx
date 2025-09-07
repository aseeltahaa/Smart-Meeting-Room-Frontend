import { useParams } from "react-router-dom"; 
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import notificationService from '../services/notificationService';
import ViewHeader from "../Components/ViewHeader.jsx";

const API_BASE_URL = "https://localhost:7074";

const convertUTCToBeirut = (utcString) => {
  if (!utcString) return null;
  const utcDate = new Date(utcString);
  const beirutOffset = 3 * 60; // +3 hours
  return new Date(utcDate.getTime() + beirutOffset * 60 * 1000);
};

function TasksView() {
  const { id } = useParams();
  const [actionItems, setActionItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [meetingData, setMeetingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState({}); // { [itemId]: File[] }

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const [meetingRes, userRes] = await Promise.all([
          axios.get(`/Meeting/${id}`),
          axios.get(`/Users/me`)
        ]);
        setActionItems(meetingRes.data.actionItems || []);
        setMeetingData(meetingRes.data);
        setCurrentUser(userRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [id]);

  const handleFileSelect = (itemId, files) => {
    setSelectedFiles((prev) => ({ ...prev, [itemId]: Array.from(files) }));
  };

  const handleSubmit = async (itemId) => {
    try {
      const files = selectedFiles[itemId] || [];
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      if (files.length > 0) {
        await axios.post(
          `/Meeting/${id}/action-items/${itemId}/submission-attachments`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      const res = await axios.put(`/Meeting/${id}/action-items/${itemId}/toggle-status`);
      const updatedActionItem = res.data;
      
      setActionItems((prev) =>
        prev.map((item) => (item.id === itemId ? updatedActionItem : item))
      );
      setSelectedFiles((prev) => ({ ...prev, [itemId]: [] }));

      // 🔔 Send notification to meeting creator
      console.log('🔍 Notification Debug Info:', {
        hasMeetingData: !!meetingData,
        meetingUserId: meetingData?.userId,
        hasCurrentUser: !!currentUser,
        currentUserId: currentUser?.id,
        updatedActionItemStatus: updatedActionItem?.status,
        actionItemId: itemId
      });

      if (meetingData && meetingData.userId && currentUser) {
        try {
          const actionItem = actionItems.find(ai => ai.id === itemId);
          const currentUserName = currentUser.name || currentUser.email || 'User';
          const meetingTitle = meetingData.title || 'Meeting';
          
          console.log('📨 Preparing notification:', {
            creatorId: meetingData.userId,
            actionItemDescription: actionItem?.description,
            meetingTitle,
            submitterName: currentUserName,
            status: updatedActionItem.status
          });
          
          // Don't notify if current user is the meeting creator
          if (meetingData.userId === currentUser.id) {
            console.log('ℹ️ Skipping notification - user is the meeting creator');
            return;
          }
          
          if (updatedActionItem.status === 'Submitted') {
            // Notify about submission
            await notificationService.notifyActionItemSubmission(
              meetingData.userId,
              actionItem?.description || 'Action item',
              meetingTitle,
              currentUserName
            );
            console.log('✅ Submission notification sent to meeting creator');
          } else if (updatedActionItem.status === 'Pending') {
            // Notify about unsubmission
            await notificationService.notifyActionItemUnsubmission(
              meetingData.userId,
              actionItem?.description || 'Action item',
              meetingTitle,
              currentUserName
            );
            console.log('✅ Unsubmission notification sent to meeting creator');
          }
        } catch (notifError) {
          console.error('❌ Failed to send action item notification:', notifError);
          console.error('❌ Full error details:', notifError);
        }
      } else {
        console.log('❌ Missing required data for notification:', {
          meetingData: !!meetingData,
          meetingUserId: meetingData?.userId,
          currentUser: !!currentUser
        });
      }
    } catch (err) {
      console.error("Error submitting task:", err);
    }
  };

  const handleAttachmentClick = async (fileUrl, isAssignment = false, itemId) => {
    try {
      let downloadUrl;
      const fileNameFromUrl = fileUrl.split("/").pop();

      if (isAssignment) {
        downloadUrl = `/files/action-items/${itemId}/assignment/${fileNameFromUrl}`;
      } else {
        downloadUrl = `/files/action-items/${itemId}/submission/${fileNameFromUrl}`;
      }

      const response = await axios.get(downloadUrl, { responseType: "blob" });
      const contentDisposition = response.headers["content-disposition"];
      let fileName = fileNameFromUrl;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*=UTF-8''(.+)$/);
        if (match && match[1]) fileName = decodeURIComponent(match[1]);
        else {
          const match2 = contentDisposition.match(/filename="(.+)"/);
          if (match2 && match2[1]) fileName = match2[1];
        }
      }

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download file:", err);
      alert("❌ You are not authorized to view this file or it failed to load.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const myActionItems = actionItems.filter(
    (ai) => ai.assignedToUserId === currentUser?.id
  );

  return (
    <>
      <ViewHeader meetingId={id} />
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {myActionItems.length > 0 ? (
          <div className="space-y-4">
            {myActionItems.map((ai) => (
              <div
                key={ai.id}
                className={`border rounded-2xl p-5 shadow-lg hover:shadow-xl transition ${
                  ai.status === "Submitted" ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg break-words">📝 {ai.description}</p>

                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Deadline:</span>{" "}
                        {convertUTCToBeirut(ai.deadline)?.toLocaleDateString() || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        <span
                          className={`capitalize ${
                            ai.status === "Submitted" ? "text-green-600 font-medium" : "text-orange-600"
                          }`}
                        >
                          {ai.status}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Judgment:</span>{" "}
                        <span
                          className={`capitalize ${
                            ai.judgment === "Accepted"
                              ? "text-green-600 font-medium"
                              : ai.judgment === "Rejected"
                              ? "text-red-600 font-medium"
                              : "text-yellow-600"
                          }`}
                        >
                          {ai.judgment || "Unjudged"}
                        </span>
                      </p>
                    </div>

                    {/* Assignment attachments (manager) */}
                    {ai.assignmentAttachmentsUrl?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">📂 Assignment Files:</p>
                        <div className="flex flex-wrap gap-2">
                          {ai.assignmentAttachmentsUrl.map((fileUrl, index) => (
                            <span
                              key={index}
                              onClick={() => handleAttachmentClick(fileUrl, true, ai.id)}
                              className="cursor-pointer bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition"
                              title={fileUrl.split("/").pop()}
                            >
                              📄 {fileUrl.split("/").pop()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submission attachments (user) */}
                    {ai.submissionAttachmentsUrl?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">📎 Submission Files:</p>
                        <div className="flex flex-wrap gap-2">
                          {ai.submissionAttachmentsUrl.map((fileUrl, index) => (
                            <span
                              key={index}
                              onClick={() => handleAttachmentClick(fileUrl, false, ai.id)}
                              className="cursor-pointer bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm hover:bg-green-200 transition"
                              title={fileUrl.split("/").pop()}
                            >
                              📄 {fileUrl.split("/").pop()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload files if Pending */}
                    {ai.status === "Pending" && (
                      <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                        <label className="block mb-2 font-medium text-gray-700">
                          Attach Files
                        </label>
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition">
                          Choose Files
                          <input
                            type="file"
                            multiple
                            onChange={(e) => handleFileSelect(ai.id, e.target.files)}
                            className="hidden"
                          />
                        </label>
                        {selectedFiles[ai.id]?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedFiles[ai.id].map((file, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                              >
                                {file.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit / Unsubmit Button */}
                  <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleSubmit(ai.id)}
                      className={`px-4 py-2 rounded-lg text-white font-medium text-sm ${
                        ai.status === "Pending" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {ai.status === "Pending" ? "Submit" : "Unsubmit"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No action items</p>
        )}
      </div>
    </>
  );
}

export default TasksView;