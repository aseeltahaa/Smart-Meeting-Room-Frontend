// src/Components/AdminRoute.jsx
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children, user }) => {
  if (!user || !user.isAdmin) {
    // Redirect non-admin users to home
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AdminRoute;
