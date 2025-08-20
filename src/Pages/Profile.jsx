import Header from '../Components/Header.jsx';
import MeetingsManager from '../Components/MeetingsManager.jsx';
import ProfileMain from '../Components/ProfileMain.jsx'
function Profile() {
  return(
    <>
      <Header showGradient = {false}/>
      <ProfileMain />
      <MeetingsManager />
    </>
  );
}

export default Profile;
