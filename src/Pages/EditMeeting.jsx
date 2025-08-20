import { useParams } from "react-router-dom";
import Header from '../Components/Header.jsx';
import EditMeetingForm from '../Components/EditMeetingForm.jsx';
import InviteesManager from '../Components/InviteesManager.jsx';
import DeleteMeeting from '../Components/DeleteMeeting.jsx';
import ActionItemsList from "../Components/ActionItemsList.jsx";
import NotesList from "../Components/NotesList.jsx";
import Footer from '../Components/Footer.jsx';

function EditMeeting() {
  const { id } = useParams(); // gets the meetingId from URL

  if (!id) {
    return (
      <>
        <Header showGradient={false} />
        <div className="max-w-3xl mx-auto mt-6">
          <p className="text-red-600 font-semibold text-center">❌ Invalid meeting ID</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header showGradient={false} />

      <div className="max-w-6xl mx-auto mt-8 px-4 md:px-0 space-y-8">
        {/* Two column layout */}
        <div className="md:flex md:gap-6">
          {/* Left Column */}
          <div className="md:w-2/3 space-y-6">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Meeting Details</h2>
              <EditMeetingForm meetingId={id} />
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Invitees</h2>
              <InviteesManager meetingId={id} />
            </div>

            <div className="flex justify-center mt-6">
              <DeleteMeeting meetingId={id} />
            </div>
          </div>

          {/* Right Column */}
          <div className="md:w-1/3 space-y-6 mt-6 md:mt-0">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Action Items</h2>
              <ActionItemsList meetingId={id} />
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Notes</h2>
              <NotesList meetingId={id} />
            </div>
          </div>
        </div>

        {/* Footer padding */}
        <div className="h-16" /> {/* adds space between bottom content and footer */}
      </div>

      <Footer />
    </>
  );
}

export default EditMeeting;
