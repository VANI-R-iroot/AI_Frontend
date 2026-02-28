import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};


interface AdminRouteProps {
  children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  const adminRoles = new Set(["admin", "super_admin", "manager", "support"]);
  if (!adminRoles.has(userRole)) {
    return <Navigate to="/admin-login" replace />;
  }

  return children ? children : <Outlet />;
};

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

export { PrivateRoute, AdminRoute, SuperAdminRoute };
