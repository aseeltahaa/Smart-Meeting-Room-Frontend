import { useParams } from "react-router-dom";
import EditMeetingForm from '../Components/EditMeetingForm.jsx';
import Footer from '../Components/Footer.jsx';
import MeetingHeader from '../Components/MeetingHeader.jsx';

function MeetingDetailsPage() {
  const { id } = useParams();

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

  return (
    <>
      <MeetingHeader meetingId={id} initialTab="details" />

      <div className="max-w-6xl mx-auto mt-8 px-4 md:px-0 space-y-8">
          <EditMeetingForm meetingId={id} />
        <div className="h-16" />
      </div>

      <Footer />
    </>
  );
}

export default MeetingDetailsPage;