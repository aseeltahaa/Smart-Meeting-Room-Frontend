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

  const toggleActionItemStatus = async (itemId) => {
    try {
      const res = await axios.put(`/Meeting/${id}/action-items/${itemId}/toggle-status`);
      setActionItems((prev) =>
        prev.map((item) => (item.id === itemId ? res.data : item))
      );
    } catch (err) {
      console.error("Error toggling status:", err);
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
                  className="border rounded-lg p-4 bg-green-50 border-green-200"
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
          <div className="bg-white rounded-lg p-6">
            <div className="space-y-4">
              {otherItems.map((ai) => {
                const isDone = ai.status === "done";
                return (
                  <div
                    key={ai.id}
                    className={`border rounded-lg p-4 ${
                      isDone
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className={`font-medium break-words ${
                            isDone ? "line-through text-gray-500" : ""
                          }`}
                        >
                          {ai.description}
                        </p>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Deadline:</span>{" "}
                            {convertUTCToBeirut(ai.deadline)?.toLocaleDateString() ||
                              "-"}
                          </p>
                          <p>
                            <span className="font-medium">Status:</span>{" "}
                            <span
                              className={`capitalize ${
                                isDone
                                  ? "text-green-600 font-medium"
                                  : "text-orange-600"
                              }`}
                            >
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
                            className={`px-3 py-1 rounded text-white font-medium text-sm ${
                              ai.status === "Pending"
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
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

        {acceptedItems.length === 0 && otherItems.length === 0 && (
          <p className="text-center text-gray-500">No action items</p>
        )}
      </div>
    </>
  );
}

export default TasksView;
