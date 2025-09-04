import { useParams } from "react-router-dom";
import EditMeetingForm from '../Components/EditMeetingForm.jsx';
import Footer from '../Components/Footer.jsx';
import MeetingHeader from '../Components/MeetingHeader.jsx';
import MeetingFileUpload from "../Components/MeetingFileUpload.jsx";
import DeleteMeeting from "../Components/DeleteMeeting.jsx"; 

function MeetingDetailsPage() {
  const { id } = useParams();

  if (!id) {
    return (
      <>
        <MeetingHeader />
        <div className="max-w-3xl mx-auto mt-12 p-4 bg-red-50 rounded shadow">
          <p className="text-red-600 font-semibold text-center">❌ Invalid meeting ID</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <MeetingHeader meetingId={id} initialTab="details" />

      <main className="max-w-6xl mx-auto mt-8 px-4 md:px-0 space-y-12">
        {/* Edit Meeting Form */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Meeting</h2>
          <EditMeetingForm meetingId={id} />
        </section>

        {/* File Upload Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Attachments</h2>
          <MeetingFileUpload meetingId={id} />
        </section>

        {/* Delete Meeting Section */}
        <section className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Danger Zone</h2>
          <DeleteMeeting meetingId={id} />
        </section>
      </main>

      {/* Add extra spacing before footer */}
      <div className="h-24" />

      <Footer />
    </>
  );
}

export default MeetingDetailsPage;
