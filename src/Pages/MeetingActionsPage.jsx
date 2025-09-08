import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import ActionItemsList from "../Components/ActionItemsList.jsx";
import Footer from '../Components/Footer.jsx';
import MeetingHeader from '../Components/MeetingHeader.jsx';
import { FaLock } from "react-icons/fa";

function MeetingActionsPage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchMeeting = async () => {
      try {
        const { data } = await axios.get(`/Meeting/${id}`);
        setMeeting(data);
      } catch (err) {
        console.error("Failed to fetch meeting:", err);
        setMeeting(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [id]);

  if (!id) {
    return (
      <>
        <MeetingHeader />
        <div className="max-w-3xl mx-auto mt-6">
          <p className="text-red-600 font-semibold text-center">❌ Invalid meeting ID</p>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!meeting) return <p className="text-center mt-10 text-red-600">Meeting not found</p>;

  const hasMeetingStarted = new Date(meeting.startTime) <= new Date();

  return (
    <>
      <MeetingHeader meetingId={id} initialTab="actions" />

      <div className="max-w-6xl mx-auto mt-8 px-4 md:px-0 space-y-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Action Items</h2>

          {hasMeetingStarted ? (
            <ActionItemsList meetingId={id} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <FaLock className="text-4xl mb-4" />
              <p className="text-lg">Action Items are locked until the meeting starts.</p>
            </div>
          )}
        </div>

        <div className="h-16" />
      </div>

      <Footer />
    </>
  );
}

export default MeetingActionsPage;
