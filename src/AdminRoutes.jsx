import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  // Read isAdmin dynamically from localStorage
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
