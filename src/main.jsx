import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import NotFound from './Pages/NotFound.jsx';
import LoginPage from './Pages/LoginPage.jsx';
import AboutUs from './Pages/AboutUs.jsx';
import RoomDisplay from './Pages/RoomDisplay.jsx';
import RoomInfo from './Pages/RoomInfo.jsx';
import Profile from './Pages/Profile.jsx';
import ResetPassword from './Pages/ResetPassword.jsx';
import Notifications from './Pages/Notifications.jsx';
import MeetingDetailsPage from './Pages/MeetingDetailsPage.jsx';
import MeetingInviteesPage from './Pages/MeetingInviteesPage.jsx';
import MeetingActionsPage from './Pages/MeetingActionsPage.jsx';
import MeetingNotesPage from './Pages/MeetingNotesPage.jsx';
import MeetingDetailsView from './Pages/MeetingDetailsView.jsx';
import NotesView from './Pages/NotesView.jsx';
import TasksView from './Pages/TasksView.jsx';
import ManageUsers from './Pages/ManageUsers.jsx';
import ManageRooms from './Pages/ManageRooms.jsx';
import ManageFeatures from './Pages/ManageFeatures.jsx';
import AdminRoute from './restrict access/AdminRoutes.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './restrict access/ProtectedRoute.jsx';

const currentUser = JSON.parse(localStorage.getItem("user"));


const router = createBrowserRouter([
  // Public Routes
  { path: "/", element: <App /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/aboutus", element: <AboutUs /> },
  { path: "/RoomDisplay", element: <RoomDisplay /> },
  { path: "/room/:roomId", element: <RoomInfo /> },
  { path: "/reset-password", element: <ResetPassword /> },

  // Protected Routes (login required)
  { path: "/profile", element: <ProtectedRoute user={currentUser}><Profile /></ProtectedRoute> },
  { path: "/notifications", element: <ProtectedRoute user={currentUser}><Notifications /></ProtectedRoute> },

  // Meeting Pages (protected)
  { path: "/meetings/:id/details", element: <ProtectedRoute user={currentUser}><MeetingDetailsPage /></ProtectedRoute> },
  { path: "/meetings/:id/invitees", element: <ProtectedRoute user={currentUser}><MeetingInviteesPage /></ProtectedRoute> },
  { path: "/meetings/:id/actions", element: <ProtectedRoute user={currentUser}><MeetingActionsPage /></ProtectedRoute> },
  { path: "/meetings/:id/notes", element: <ProtectedRoute user={currentUser}><MeetingNotesPage /></ProtectedRoute> },

  // Meeting View Pages (protected)
  { path: "/meetings/:id/detailsView", element: <ProtectedRoute user={currentUser}><MeetingDetailsView /></ProtectedRoute> },
  { path: "/meetings/:id/notesView", element: <ProtectedRoute user={currentUser}><NotesView /></ProtectedRoute> },
  { path: "/meetings/:id/tasksView", element: <ProtectedRoute user={currentUser}><TasksView /></ProtectedRoute> },

  // Admin Routes (still admin-protected)
  { path: "/RoomManagement", element: <AdminRoute user={currentUser}><ManageRooms /></AdminRoute> },
  { path: "/FeatureManagement", element: <AdminRoute user={currentUser}><ManageFeatures /></AdminRoute> },
  { path: "/UserManagement", element: <AdminRoute user={currentUser}><ManageUsers /></AdminRoute> },

  // Catch-all
  { path: "*", element: <NotFound /> }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
