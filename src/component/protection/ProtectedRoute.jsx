import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token"); // or use a cookie if secure

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;