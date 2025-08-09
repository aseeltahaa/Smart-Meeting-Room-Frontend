import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import NotFound from './Pages/NotFound.jsx'
import LoginPage from './Pages/LoginPage.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/Login", element: <LoginPage/> },
  { path: "*", element: <NotFound /> }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
