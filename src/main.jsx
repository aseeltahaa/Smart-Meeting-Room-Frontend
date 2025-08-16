import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import NotFound from './Pages/NotFound.jsx'
import LoginPage from './Pages/LoginPage.jsx'
import AboutUs from './Pages/AboutUs.jsx'
import Booking from './Pages/Booking.jsx'
import AdminPanel from './Pages/AdminPanel.jsx'
import RegisterUser from './Pages/RegisterPage.jsx'   // ✅ NEW IMPORT

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/admin", element: <AdminPanel /> },
  { path: "/admin/register", element: <RegisterUser /> }, // ✅ NEW ROUTE
  { path: "/login", element: <LoginPage /> },
  { path: "/aboutus", element: <AboutUs /> },
  { path: "/booking", element: <Booking /> },
  { path: "*", element: <NotFound /> }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
