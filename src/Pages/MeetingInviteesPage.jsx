import { useParams } from "react-router-dom";
import InviteesManager from '../Components/InviteesManager.jsx';
import Footer from '../Components/Footer.jsx';
import MeetingHeader from '../Components/MeetingHeader.jsx';

function MeetingInviteesPage() {
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
      <MeetingHeader meetingId={id} initialTab="invitees" />

      <div className="max-w-6xl mx-auto mt-8 px-4 md:px-0 space-y-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Invitees</h2>
          <InviteesManager meetingId={id} />
        </div>

        <div className="h-16" />
      </div>

      <Footer />
    </>
  );
}

export default MeetingInviteesPage;