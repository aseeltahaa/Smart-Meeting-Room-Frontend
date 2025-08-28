import Header from '../Components/Header.jsx';
import MeetingsManager from '../Components/MeetingsManager.jsx';
import Footer from '../Components/Footer.jsx';
import ProfileMain from '../Components/ProfileMain.jsx'
import MeetingHeapmap from '../Components/MeetingHeatmap.jsx';
function Profile() {
  return(
    <>
      <Header showGradient = {false}/>
      <ProfileMain />
      <MeetingHeapmap />
      <MeetingsManager />
      <Footer/>
    </>
  );
}

export default Profile;
