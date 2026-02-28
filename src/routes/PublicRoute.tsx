import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface SuperAdminRouteProps {
  children?: React.ReactNode;
}

const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated || userRole !== "superadmin") {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default SuperAdminRoute;
