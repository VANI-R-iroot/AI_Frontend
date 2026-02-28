import React, { ReactNode, useEffect, useState } from "react";
import AppSidebar from "../common/userSidebar";
import AppHeader from "../common/AppHeader";
import { useThemeStore } from "../zustand/themeStore";

interface DashboardLayoutProps {
  children: ReactNode;
}



const userDashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const toggleSidebar = () => {
    setSidebarVisible((prevState) => !prevState);
  };

  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    const handleSidebarClose = () => setSidebarVisible(false);
    window.addEventListener("sidebarClose", handleSidebarClose);
    return () => window.removeEventListener("sidebarClose", handleSidebarClose);
  }, []);

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
        <AppSidebar isVisible={sidebarVisible} />
        <AppHeader toggleSidebar={toggleSidebar} isVisible={sidebarVisible} />
        <div className="flex-grow-1 dashboard-main-body">
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default userDashboardLayout;
