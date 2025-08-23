import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import NotFound from './Pages/NotFound.jsx';
import LoginPage from './Pages/LoginPage.jsx';
import AboutUs from './Pages/AboutUs.jsx';
import RoomDisplay from './Pages/RoomDisplay.jsx';
import AdminPanel from './Pages/AdminPanel.jsx';
import RegisterUser from './Pages/RegisterPage.jsx';  
import FeaturePage from './Pages/FeaturePage.jsx';
import RoomRegister from './Pages/RoomRegister.jsx';
import RoomInfo from './Pages/RoomInfo.jsx';
import UpdateRoomPage from './Pages/UpdateRoomPage.jsx';
import Profile from './Pages/Profile.jsx';
import ResetPassword from './Pages/ResetPassword.jsx';
import ViewMeeting from './Pages/ViewMeeting.jsx';
import EditMeeting from './Pages/EditMeeting.jsx';
import Notifications from './Pages/Notifications.jsx';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  // General / Main App
  { path: "/", element: <App /> },

  // Admin Routes
  { path: "/admin", element: <AdminPanel /> },
  { path: "/admin/register", element: <RegisterUser /> }, 
  { path: "/admin/features", element: <FeaturePage /> },
  { path: "/admin/rooms", element: <RoomRegister /> }, 
  { path: "/admin/update-room", element: <UpdateRoomPage /> },

  // Auth & Info Pages
  { path: "/login", element: <LoginPage /> },
  { path: "/aboutus", element: <AboutUs /> },
  { path: "/RoomDisplay", element: <RoomDisplay /> },
  { path: "/room/:roomId", element: <RoomInfo /> }, 
  { path: "/profile", element: <Profile /> },
  { path: "/reset-password", element: <ResetPassword /> },

  // Meetings Pages
  { path: "/meetings/view/:id", element: <ViewMeeting /> },
  { path: "/meetings/edit/:id", element: <EditMeeting /> },

  //Notifications
  { path : "/notifications", element: <Notifications /> },
  // Catch-all
  { path: "*", element: <NotFound /> }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
