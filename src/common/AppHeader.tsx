import React, { useState, useEffect, JSX } from "react";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import adminImage from "../assets/image/admin/allImage";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../zustand/userDetailsStore";
import Notification from "./notifications";
import SmSNotification from "./SMSnotifications";
import AnnouncementBell from "./AnnouncementBell";
import { apiConfig } from "../utils/apiConfig";
import { useThemeStore } from "../zustand/themeStore";
import { MdOutlineLightMode } from "react-icons/md";
import { PiPlugsConnectedFill } from "react-icons/pi";
import { RxDashboard } from "react-icons/rx";
import { SiLivechat } from "react-icons/si";
import { RiSecurePaymentLine, RiLogoutCircleRLine } from "react-icons/ri";
import { TbCurrencyDollar } from "react-icons/tb";
import axiosInstance from "../utils/baseUrl";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

interface AppHeaderProps {
  toggleSidebar: () => void;
  isVisible: boolean;
}

// Menu configuration by role
const menuConfig: Record<
  string,
  { title: string; icon: JSX.Element; path: string }[]
> = {
  user: [
    { title: "Dashboard", icon: <RxDashboard />, path: "/dashboard" },
    {
      title: "Support",
      icon: <img src={adminImage.FaqIcon} alt="Support" />,
      path: "/supports",
    },
    { title: "MCP Setting", icon: <SiLivechat />, path: "/mcp-server-setting" },
  ],
  admin: [
    { title: "Admin Dashboard", icon: <RxDashboard />, path: "/admin" },
    {
      title: "Widget Setting",
      icon: <PiPlugsConnectedFill />,
      path: "/plugin-list",
    },
    {
      title: "Support",
      icon: <img src={adminImage.FaqIcon} alt="Support" />,
      path: "/admin-ticket-token",
    },
    { title: "Payment", icon: <RiSecurePaymentLine />, path: "/admin-orders" },
    { title: "Live Chat", icon: <SiLivechat />, path: "/admin-live-chat" },
    { title: "Affiliate", icon: <TbCurrencyDollar />, path: "/affiliate" },
  ],
  superAdmin: [
    {
      title: "Super Admin Dashboard",
      icon: <RxDashboard />,
      path: "/super-admin",
    },
    {
      title: "Manage Users",
      icon: <PiPlugsConnectedFill />,
      path: "/manage-users",
    },
    { title: "Reports", icon: <RiSecurePaymentLine />, path: "/reports" },
    { title: "Affiliate", icon: <TbCurrencyDollar />, path: "/affiliate" },
  ],
};

const AppHeader: React.FC<AppHeaderProps> = ({ toggleSidebar, isVisible }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTimeout, setProfileTimeout] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(
    sessionStorage.getItem("impersonating") === "true"
  );

  const userData = useUserStore((state) => state.userData);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const effectiveRole = isImpersonating
    ? sessionStorage.getItem("impersonate_role") || "user"
    : userRole;

  const handleLogout = async () => {
    try {
      let logoutUrl = effectiveRole === "admin" ? "/admin-logout" : "/auth-logout";

      const response = await axiosInstance.post(logoutUrl);

      if (response.data.status === "success") {
        toast.success("Logout successful!");
        localStorage.removeItem("role");
        sessionStorage.clear();

        // Redirect based on role
        if (effectiveRole === "admin") {
          navigate("/");
        } else {
          navigate("/");
        }
      } else {
        toast.error("Logout failed!");
      }
    } catch (error: any) {
      toast.error("Logout failed!");
      console.error("Logout error:", error);
    }
  };

  // Profile hover logic
  const handleProfileMouseEnter = () => {
    if (profileTimeout) clearTimeout(profileTimeout);
    setProfileOpen(true);
  };
  const handleProfileMouseLeave = () => {
    const timeout = window.setTimeout(() => setProfileOpen(false), 100);
    setProfileTimeout(timeout);
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      setIsImpersonating(sessionStorage.getItem("impersonating") === "true");
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("impersonationChange", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("impersonationChange", handleStorage);
    };
  }, []);

  const handleStopImpersonation = async () => {
    try {
      await axiosInstance.post("/stop-impersonation");
    } catch (error) {
      console.error("Failed to stop impersonation:", error);
    } finally {
      sessionStorage.removeItem("impersonating");
      sessionStorage.removeItem("impersonate_role");
      setIsImpersonating(false);
      window.dispatchEvent(new Event("impersonationChange"));
      if (window.opener && !window.opener.closed) {
        window.opener.location.href = "/admin";
        window.opener.focus();
        window.close();
        return;
      }
      window.location.href = "/admin";
    }
  };

  return (
    <header className={`app-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isVisible ? <FaAngleLeft /> : <FaAngleRight />}
        </button>
      </div>

      <div className="header-right">
        {isImpersonating && (
          <button
            className="impersonation-stop-button"
            onClick={handleStopImpersonation}
            title="Stop impersonating and return to admin"
          >
            Stop Impersonating
          </button>
        )}
        <SmSNotification toggleSidebar={toggleSidebar} isVisible={isVisible} />
        {effectiveRole === "user" && <AnnouncementBell />}
        <Notification toggleSidebar={toggleSidebar} isVisible={isVisible} />

        <div
          className="admin-header-notification"
          onClick={toggleTheme}
          style={{ cursor: "pointer" }}
        >
          {isDarkMode ? (
            <MdOutlineLightMode size={24} color="white" />
          ) : (
            <img
              src={adminImage.lightModeIcon}
              alt="Theme Icon"
              className="notification-icon"
            />
          )}
        </div>

        <div
          className="header-user-section"
          onMouseEnter={handleProfileMouseEnter}
          onMouseLeave={handleProfileMouseLeave}
        >
          <div className="profile-container">
            <div>
              <img
                src={`${apiConfig.imageUrl}/${userData?.image}`}
                alt="User Icon"
                className="profile-avatar-icon"
              />
            </div>

            {profileOpen && (
              <div className="profile-popup">
                <div className="profile-header">
                  <h3>My Profile</h3>
                </div>

                <div className="profile-info">
                  <div className="profile-avatar">
                    <img
                      src={`${apiConfig.imageUrl}/${userData?.image}`}
                      alt="User Icon"
                    />
                  </div>
                  <div className="profile-details">
                    <h4>{userData?.name}</h4>
                    <p>{userData?.email}</p>
                    <div
                      onClick={() => navigate("/settings")}
                      className="edit-profile-link"
                    >
                      Edit Profile
                    </div>
                  </div>
                </div>

                {effectiveRole === "user" && (
                  <div className="profile-progress">
                    <div className="progress-bar">
                      <div className="progress-filled"></div>
                    </div>
                    <div className="credits-info">
                      <h5>12345/12345 credits left</h5>
                      <button
                        className="upgrade-button"
                        onClick={() => navigate("/pricingplan")}
                      >
                        <span className="plus-icon">
                          <img src={adminImage.StarPlanIcon} alt="Upgrade" />
                        </span>
                        Upgrade
                      </button>
                    </div>
                  </div>
                )}

                <div className="menu-divider"></div>

                <div className="profile-menu">
                  <ul>
                    {menuConfig[effectiveRole]?.map((item, index) => (
                      <li key={index} onClick={() => navigate(item.path)}>
                        <span className="menu-icon">{item.icon}</span>{" "}
                        {item.title}
                      </li>
                    ))}
                  </ul>

                  <div className="menu-divider02"></div>

                  <ul>
                    <li onClick={handleLogout} className="logout-item">
                      <span className="menu-icon">
                        <RiLogoutCircleRLine />
                      </span>{" "}
                      Logout
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
