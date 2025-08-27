import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import ViewHeader from "../Components/ViewHeader.jsx";

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
      setActionItems((prev) =>
        prev.map((item) => (item.id === itemId ? res.data : item))
      );
      setSelectedFiles((prev) => ({ ...prev, [itemId]: [] }));
    } catch (err) {
      console.error("Error submitting task:", err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const myActionItems =
    actionItems.filter((ai) => ai.assignedToUserId === currentUser?.id) || [];
  const acceptedItems = myActionItems.filter((ai) => ai.judgment === "Accepted");
  const otherItems = myActionItems.filter((ai) => ai.judgment !== "Accepted");

  return (
    <>
      <ViewHeader meetingId={id} />
      <div className="max-w-5xl mx-auto p-6 space-y-8">

        {/* Accepted Action Items */}
        {acceptedItems.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Accepted Action Items</h2>
            <div className="space-y-4">
              {acceptedItems.map((ai) => (
                <div
                  key={ai.id}
                  className="border rounded-lg p-4 bg-green-50 border-green-200 shadow-sm"
                >
                  <p className="font-medium break-words">{ai.description}</p>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Deadline:</span>{" "}
                      {convertUTCToBeirut(ai.deadline)?.toLocaleDateString() || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span className="text-green-600 font-medium">{ai.status}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Action Items */}
        {otherItems.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="space-y-4">
              {otherItems.map((ai) => (
                <div
                  key={ai.id}
                  className={`border rounded-lg p-4 shadow-sm ${
                    ai.status === "Submitted"
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div className="flex-1">
                      <p className="font-medium break-words">{ai.description}</p>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Deadline:</span>{" "}
                          {convertUTCToBeirut(ai.deadline)?.toLocaleDateString() || "-"}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>{" "}
                          <span
                            className={`capitalize ${
                              ai.status === "Submitted"
                                ? "text-green-600 font-medium"
                                : "text-orange-600"
                            }`}
                          >
                            {ai.status}
                          </span>
                        </p>
                      </div>

                      {/* Upload files only if Pending */}
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
                                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
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
                        className={`px-4 py-2 rounded text-white font-medium text-sm ${
                          ai.status === "Pending"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {ai.status === "Pending" ? "Submit" : "Unsubmit"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {acceptedItems.length === 0 && otherItems.length === 0 && (
          <p className="text-center text-gray-500">No action items</p>
        )}
      </div>
    </>
  );
}

export default TasksView;
