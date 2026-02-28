import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

interface AdminRouteProps {
  children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  if (userRole !== "admin") {
    return <Navigate to="/admin-login" replace />;
  }

  return children ? children : <Outlet />;
};
export default AdminRoute;
