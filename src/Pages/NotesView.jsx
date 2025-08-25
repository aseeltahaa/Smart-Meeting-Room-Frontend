import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import ViewHeader from "../Components/ViewHeader.jsx";

function NotesView() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await axios.get(`/Meeting/${id}`);
        setMeeting(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!meeting) return <p className="text-center mt-10">Meeting not found</p>;

  return (
    <>
      <ViewHeader meetingId={id} />
      <div className="max-w-5xl mx-auto p-6 space-y-4">

        {/* Notes */}
        {meeting.notes?.length > 0 ? (
          meeting.notes.map(note => (
            <div
              key={note.id}
              className="p-4 border rounded-md bg-gray-50"
            >
              <p className="text-gray-800">{note.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No notes available</p>
        )}

      </div>
    </>
  );
}

export default NotesView;
