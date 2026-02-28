import React, { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useThemeStore } from "../zustand/themeStore";

import UserSidebar from "../common/userSidebar";
import AdminSidebar from "../common/adminSidebar";
import SuperAdminSidebar from "../common/superAdminSidebar";
import AppHeader from "../common/AppHeader";

interface DashboardLayoutProps {
  children: ReactNode;
  forceRole?: "user" | "admin" | "superAdmin";
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, forceRole }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [impersonateRole, setImpersonateRole] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("impersonate") === "1") return "user";
    return sessionStorage.getItem("impersonate_role");
  });
  const [isImpersonating, setIsImpersonating] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("impersonate") === "1") return true;
    return sessionStorage.getItem("impersonating") === "true";
  });
  const { userRole } = useAuth();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const toggleSidebar = () => {
    setSidebarVisible((prevState) => !prevState);
  };

  useEffect(() => {
    const handleSidebarClose = () => setSidebarVisible(false);
    window.addEventListener("sidebarClose", handleSidebarClose);
    return () => window.removeEventListener("sidebarClose", handleSidebarClose);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("impersonate") === "1") {
      sessionStorage.setItem("impersonating", "true");
      sessionStorage.setItem("impersonate_role", "user");
      setImpersonateRole("user");
      setIsImpersonating(true);
      window.dispatchEvent(new Event("impersonationChange"));
      params.delete("impersonate");
      const nextUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, []);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) {
      sessionStorage.removeItem("impersonating");
      sessionStorage.removeItem("impersonate_role");
      setIsImpersonating(false);
      setImpersonateRole(null);
      window.dispatchEvent(new Event("impersonationChange"));
    }
  }, []);

  useEffect(() => {
    const handleImpersonationChange = () => {
      setImpersonateRole(sessionStorage.getItem("impersonate_role"));
      setIsImpersonating(sessionStorage.getItem("impersonating") === "true");
    };
    window.addEventListener("storage", handleImpersonationChange);
    window.addEventListener("impersonationChange", handleImpersonationChange);
    return () => {
      window.removeEventListener("storage", handleImpersonationChange);
      window.removeEventListener("impersonationChange", handleImpersonationChange);
    };
  }, []);

  useEffect(() => {
    if (
      userRole === "admin" &&
      !isImpersonating &&
      !window.location.pathname.startsWith("/admin")
    ) {
      window.location.href = "/admin";
    }
  }, [userRole, isImpersonating]);

  // Determine which sidebar to render based on role
  const renderSidebar = () => {
    const currentRole =
      forceRole || (isImpersonating ? impersonateRole : null) || userRole;
    
    const sidebarProps = { isVisible: sidebarVisible };
    
    switch (currentRole) {
      case "admin":
        return <AdminSidebar {...sidebarProps} />;
      case "superAdmin":
        return <SuperAdminSidebar {...sidebarProps} />;
      case "user":
      default:
        return <UserSidebar {...sidebarProps} />;
    }
  };

  return (
    <div
      className={`layout ${sidebarVisible ? "sidebar-open" : "sidebar-closed"}`}
    >
      <div
        className="wrapper"
        style={{
          background: isDarkMode ? "#0a0a0a" : "#1a0e24",
        }}
      >
        {renderSidebar()}
        <AppHeader toggleSidebar={toggleSidebar} isVisible={sidebarVisible} />
        <div className="flex-grow-1 dashboard-main-body">
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
