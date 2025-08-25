import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import ViewHeader from "../Components/ViewHeader.jsx";

const convertUTCToBeirut = (utcString) => {
  if (!utcString) return null;
  const utcDate = new Date(utcString);
  const beirutOffset = 3 * 60; 
  return new Date(utcDate.getTime() + beirutOffset * 60 * 1000);
};

function MeetingDetailsView() {
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
      <div className="max-w-5xl mx-auto p-6 space-y-8">

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900">{meeting.title}</h1>

        {/* Start & End Date */}
        <div className="text-gray-700 text-lg space-y-1">
          <p><strong>Start:</strong> {convertUTCToBeirut(meeting.startTime)?.toLocaleString()}</p>
          <p><strong>End:</strong> {convertUTCToBeirut(meeting.endTime)?.toLocaleString()}</p>
        </div>

        {/* Agenda */}
        <div className="text-gray-800 text-lg">
          <h2 className="font-semibold mb-2">Agenda</h2>
          <p>{meeting.agenda || "No agenda provided"}</p>
        </div>

        {/* Invitees */}
        <div className="text-gray-800 text-lg">
          <h2 className="font-semibold mb-2">Invitees</h2>
          {meeting.invitees?.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {meeting.invitees.map(inv => (
                <li key={inv.id} className="flex justify-between">
                  <span>{inv.email}</span>
                  <span className="text-gray-500">{inv.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No invitees</p>
          )}
        </div>

      </div>
    </>
  );
}

export default MeetingDetailsView;
