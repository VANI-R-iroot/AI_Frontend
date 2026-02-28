import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface SuperAdminRouteProps {
  children?: React.ReactNode;
}

const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/super-admin-login" replace />;
  }

  if (userRole !== "superAdmin") {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default SuperAdminRoute;
