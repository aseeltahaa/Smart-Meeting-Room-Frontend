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
import Notifications from './Pages/Notifications.jsx';
import MeetingDetailsPage from './Pages/MeetingDetailsPage.jsx';
import MeetingInviteesPage from './Pages/MeetingInviteesPage.jsx';
import MeetingActionsPage from './Pages/MeetingActionsPage.jsx';
import MeetingNotesPage from './Pages/MeetingNotesPage.jsx';
import MeetingDetailsView from './Pages/MeetingDetailsView.jsx'
import NotesView from './Pages/NotesView.jsx';
import TasksView from './Pages/TasksView.jsx';

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
  { path: "/meetings/:id/details", element: <MeetingDetailsPage /> },
  { path: "/meetings/:id/invitees", element: <MeetingInviteesPage /> },
  { path: "/meetings/:id/actions", element: <MeetingActionsPage /> },
  { path: "/meetings/:id/notes", element: <MeetingNotesPage /> },

  // View Pages
  { path: "/meetings/:id/detailsView", element: <MeetingDetailsView /> },
  { path: "/meetings/:id/notesView", element: <NotesView /> },
  { path: "/meetings/:id/tasksView", element: <TasksView /> },

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