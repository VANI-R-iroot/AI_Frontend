import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarUserItems } from "../DataList/SideMenu";
import adminImage from "../assets/image/admin/allImage";
import { useNavigate } from "react-router-dom";
import {
  MdOutlineKeyboardArrowUp,
  MdOutlineKeyboardArrowDown,
  MdOutlineWorkspacePremium,
} from "react-icons/md";
import axiosInstance from "../utils/baseUrl";
import { useAuth } from "../context/AuthContext";

interface AppSidebarProps {
  isVisible: boolean;
}

const UserSidebar: React.FC<AppSidebarProps> = ({ isVisible }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [showTrialBanner, setShowTrialBanner] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [currentPlanLabel, setCurrentPlanLabel] = useState<string>("No active plan");
  const [showPlanExpiredNotice, setShowPlanExpiredNotice] = useState(false);
  const [sidebarAnnouncements, setSidebarAnnouncements] = useState<
    { id: string; title: string; type: string }[]
  >([]);

  useEffect(() => {
    if (userRole !== "user") {
      setShowTrialBanner(false);
      setCurrentPlanLabel("No active plan");
      setShowPlanExpiredNotice(false);
      return;
    }
    const loadSubscription = async () => {
      try {
        const res = await axiosInstance.get("/subscription/current");
        if (res.data?.success && res.data.data) {
          const sub = res.data.data;
          const status = (sub.subscription_status || sub.stripe_status || "").toLowerCase();
          const packageType = (sub.package_type || sub.title || "").toLowerCase();
          const planLabel = sub.title || sub.package_type || "Current Plan";
          const now = Date.now();
          const endsAt = sub.ends_at ? new Date(sub.ends_at).getTime() : null;
          const hasExplicitIsActive =
            sub.is_active !== undefined || sub.isActive !== undefined;
          const activeStatus = status === "active" || status === "trialing";
          const notExpiredByDate = !endsAt || endsAt > now;
          const isActive = hasExplicitIsActive
            ? (sub.is_active === true ||
                sub.is_active === 1 ||
                sub.is_active === "1" ||
                sub.isActive === true ||
                sub.isActive === 1 ||
                sub.isActive === "1" ||
                (activeStatus && notExpiredByDate))
            : (activeStatus && notExpiredByDate);
          const isExpired = Boolean(!isActive && endsAt && endsAt <= now);
          const isTrial = (status === "trialing" || packageType.includes("trial")) && isActive;

          if (isTrial) {
            if (endsAt) {
              const diffDays = Math.max(0, Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24)));
              setTrialDaysLeft(diffDays);
            }
            setShowTrialBanner(true);
            setShowPlanExpiredNotice(false);
            setCurrentPlanLabel(planLabel);
            return;
          }

          setShowTrialBanner(false);
          setTrialDaysLeft(null);
          setShowPlanExpiredNotice(isExpired);
          setCurrentPlanLabel(isExpired ? `${planLabel} (Expired)` : planLabel);
          return;
        }
        setShowTrialBanner(false);
        setTrialDaysLeft(null);
        setShowPlanExpiredNotice(false);
        if (!res.data?.data) {
          setCurrentPlanLabel("No active plan");
        }
      } catch {
        setShowTrialBanner(false);
        setTrialDaysLeft(null);
        setShowPlanExpiredNotice(false);
        setCurrentPlanLabel("No active plan");
      }
    };

    loadSubscription();
    const handleSubscriptionUpdated = () => {
      loadSubscription();
    };
    const handleWindowFocus = () => {
      loadSubscription();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadSubscription();
      }
    };

    window.addEventListener("subscription-updated", handleSubscriptionUpdated);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const intervalId = setInterval(loadSubscription, 60 * 60 * 1000);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("subscription-updated", handleSubscriptionUpdated);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userRole, location.pathname]);

  useEffect(() => {
    if (userRole !== "user") {
      setSidebarAnnouncements([]);
      return;
    }
    let isMounted = true;
    const fetchSidebarAnnouncements = async () => {
      try {
        const res = await axiosInstance.get("/active-announcement", {
          params: { location: "sidebar" },
        });
        if (!isMounted) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const mapped = list.slice(0, 3).map((item: any) => ({
          id: item._id,
          title: item.AnnouncementTitle,
          type: item.AnnouncementType,
        }));
        setSidebarAnnouncements(mapped);
      } catch {
        if (!isMounted) return;
        setSidebarAnnouncements([]);
      }
    };

    fetchSidebarAnnouncements();
    const intervalId = setInterval(fetchSidebarAnnouncements, 10000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [userRole]);

  useEffect(() => {
    SidebarUserItems.forEach((section, sectionIndex) => {
      section.items.forEach((item, itemIndex) => {
        if (item.subItems) {
          const hasActiveSubItem = item.subItems.some(
            (subItem) => subItem.path === location.pathname
          );
          if (hasActiveSubItem) {
            const globalItemIndex = sectionIndex * 100 + itemIndex;
            setActiveMenu(globalItemIndex);
          }
        }
      });
    });
  }, [location.pathname]);

  const toggleSubMenu = (index: number) => {
    setActiveMenu(activeMenu === index ? null : index);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClose = () => {
    const event = new CustomEvent("sidebarClose");
    window.dispatchEvent(event);
  };

  const clearHideTimeout = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  };

  const handleMouseEnter = (
    item: any,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!isVisible) {
      clearHideTimeout();

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setHoveredItem(`${item.label}_${Date.now()}`);
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 25,
      });

      console.log("Hovering item:", item.label);
    }
  };

  const handleMouseLeave = () => {
    if (!isVisible && !isTooltipHovered) {
      const timeout = setTimeout(() => {
        if (!isTooltipHovered) {
          setHoveredItem(null);
        }
      }, 300);
      setHideTimeout(timeout);
      console.log("Mouse left item");
    }
  };

  const handleTooltipMouseEnter = () => {
    clearHideTimeout();
    setIsTooltipHovered(true);
    console.log("Mouse entered tooltip");
  };

  const handleTooltipMouseLeave = () => {
    setIsTooltipHovered(false);
    const timeout = setTimeout(() => {
      setHoveredItem(null);
    }, 200);
    setHideTimeout(timeout);
    console.log("Mouse left tooltip");
  };

  const TooltipComponent = ({
    item,
    isSubmenu = false,
  }: {
    item: any;
    isSubmenu?: boolean;
  }) => {
    if (!hoveredItem || !hoveredItem.startsWith(item.label)) return null;

    return (
      <div
        style={{
          position: "fixed",
          left: `${tooltipPosition.left}px`,
          top: `${tooltipPosition.top}px`,
          transform: "translateY(-50%)",
          background: isSubmenu ? "#343e5733" : "#343e5733",
          backdropFilter: "blur(20px)",
          color: "#ffffff",
          padding: isSubmenu ? "12px 16px" : "8px 12px",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: "500",
          zIndex: 99999,
          pointerEvents: "auto",
          border: isSubmenu
            ? "1px solid rgba(108, 82, 255, 0.2)"
            : "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: isSubmenu
            ? "0 8px 32px rgba(29, 27, 41, 0.36)"
            : "0 8px 32px rgba(0, 0, 0, 0.4)",
          maxWidth: "240px",
          wordWrap: "break-word",
          whiteSpace: isSubmenu ? "normal" : "nowrap",
          lineHeight: isSubmenu ? "1.4" : "normal",
        }}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
      >
        {!isSubmenu ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Link
              to={item.path}
              style={{
                color: "#ffffff",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                padding: "4px 0",
                flex: 1,
              }}
              onClick={() => {
                clearHideTimeout();
                setHoveredItem(null);
              }}
            >
              {item.label}
            </Link>
            {item.isNew && (
              <span
                style={{
                  backgroundColor: "#ff4757",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: "600",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  flexShrink: 0,
                }}
              >
                NEW
              </span>
            )}
          </div>
        ) : (
          <>
            <div
              style={{
                fontWeight: "600",
                marginBottom: "8px",
                color: "#6c52ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>{item.label}</span>
              {item.isNew && (
                <span
                  style={{
                    backgroundColor: "#ff4757",
                    color: "#fff",
                    fontSize: "9px",
                    fontWeight: "600",
                    padding: "2px 6px",
                    borderRadius: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    flexShrink: 0,
                  }}
                >
                  NEW
                </span>
              )}
            </div>
            {item.subItems &&
              item.subItems.map((subItem: any, index: number) => (
                <Link
                  key={index}
                  to={subItem.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    opacity: 0.9,
                    marginBottom: "4px",
                    paddingLeft: "8px",
                    borderLeft: "2px solid rgba(108, 82, 255, 0.3)",
                    paddingTop: "4px",
                    paddingBottom: "4px",
                    color: "#ffffff",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor =
                      "rgba(69, 50, 177, 0.34)";
                    (e.target as HTMLElement).style.color = "#6c52ff";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor =
                      "transparent";
                    (e.target as HTMLElement).style.color = "#ffffff";
                  }}
                  onClick={() => {
                    clearHideTimeout();
                    setHoveredItem(null);
                  }}
                >
                  <span>• {subItem.label}</span>
                  {subItem.isNew && (
                    <span
                      style={{
                        backgroundColor: "#ff4757",
                        color: "#fff",
                        fontSize: "8px",
                        fontWeight: "600",
                        padding: "1px 4px",
                        borderRadius: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                        flexShrink: 0,
                      }}
                    >
                      NEW
                    </span>
                  )}
                </Link>
              ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`sidebar user-sidebar ${isVisible ? "visible" : "hidden"} relative`}>
      {isVisible && (
        <button onClick={handleClose} className="sidebar-close-btn">
          ✕
        </button>
      )}

      <ul className="sidebar-menu">
        <li className={`admin-sidebar-logo ${scrolled ? "scrolled" : ""}`}>
          <Link to="/dashboard">
            <img
              src={adminImage.ChatAgentIcon}
              alt="Smart AI"
              className="sidebar-icon"
            />
            <h2 className="sidebar-text"> AiProd</h2>
          </Link>
        </li>

        {SidebarUserItems.map((section, sectionIndex) => (
          <React.Fragment key={sectionIndex}>
            <div className="dashboard-sidebar-divider"></div>
            <li>
              <h3 className="site-bar-title">{section.title}</h3>
            </li>
            {section.items.map((item, itemIndex) => {
              const globalItemIndex = sectionIndex * 100 + itemIndex;
              const hasSubItems =
                Array.isArray(item.subItems) && item.subItems.length > 0;
              const isOpen = activeMenu === globalItemIndex;
              const isActive = location.pathname === item.path;
              const hasActiveSubItem = item.subItems?.some(
                (subItem) => subItem.path === location.pathname
              );

              return (
                <li
                  key={`${sectionIndex}-${itemIndex}`}
                  className="sidebar-menu-item"
                >
                  {hasSubItems ? (
                    <>
                      <div
                        className={`sidebar-item has-submenu ${
                          isActive ? "active" : ""
                        } ${hasActiveSubItem ? "has-active-subitem" : ""}`}
                        onClick={() => toggleSubMenu(globalItemIndex)}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div
                          className="menu-content"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span className="sidebar-text">{item.label}</span>
                          </div>
                          {item.isNew && (
                            <span
                              className="new-badge"
                              style={{
                                backgroundColor: "#ff4757",
                                color: "#fff",
                                fontSize: "9px",
                                fontWeight: "600",
                                padding: "2px 6px",
                                borderRadius: "10px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                animation: "pulse 2s infinite",
                                flexShrink: 0,
                              }}
                            >
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="arrow-container">
                          <span className="submenu-arrow">
                            {isOpen ? (
                              <MdOutlineKeyboardArrowUp />
                            ) : (
                              <MdOutlineKeyboardArrowDown />
                            )}
                          </span>
                        </div>

                        {isVisible && (
                          <div className="sidebar-tooltip">
                            <div className="tooltip-content">
                              <div className="tooltip-title">{item.label}</div>
                              {hasSubItems &&
                                item.subItems?.map((subItem, subIndex) => (
                                  <Link
                                    key={subIndex}
                                    to={subItem.path}
                                    className={`tooltip-subitem ${
                                      location.pathname === subItem.path
                                        ? "active"
                                        : ""
                                    }`}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      width: "100%",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      {subItem.icon && (
                                        <span className="tooltip-subicon">
                                          {subItem.icon}
                                        </span>
                                      )}
                                      <span>{subItem.label}</span>
                                    </div>
                                    {subItem.isNew && (
                                      <span
                                        style={{
                                          backgroundColor: "#ff4757",
                                          color: "#fff",
                                          fontSize: "8px",
                                          fontWeight: "600",
                                          padding: "1px 4px",
                                          borderRadius: "8px",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.3px",
                                          flexShrink: 0,
                                        }}
                                      >
                                        NEW
                                      </span>
                                    )}
                                  </Link>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {!isVisible && (
                        <TooltipComponent item={item} isSubmenu={true} />
                      )}
                    </>
                  ) : (
                    <>
                      <Link to={item.path} className="sidebar-link">
                        <div
                          className={`sidebar-item ${isActive ? "active" : ""}`}
                          onMouseEnter={(e) => handleMouseEnter(item, e)}
                          onMouseLeave={handleMouseLeave}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {item.icon &&
                              (typeof item.icon === "string" ? (
                                <img
                                  src={item.icon}
                                  alt={item.label}
                                  className="sidebar-icon"
                                />
                              ) : (
                                <span className="sidebar-icon">
                                  {item.icon}
                                </span>
                              ))}
                            <span className="sidebar-text">{item.label}</span>
                          </div>
                          {item.isNew && (
                            <span
                              className="new-badge"
                              style={{
                                backgroundColor: "#ff4757",
                                color: "#fff",
                                fontSize: "9px",
                                fontWeight: "600",
                                padding: "2px 6px",
                                borderRadius: "10px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                animation: "pulse 2s infinite",
                                flexShrink: 0,
                              }}
                            >
                              NEW
                            </span>
                          )}
                          {isVisible && (
                            <div className="sidebar-tooltip simple-tooltip">
                              <div className="tooltip-content">
                                {item.label}
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>

                      {!isVisible && (
                        <TooltipComponent item={item} isSubmenu={false} />
                      )}
                    </>
                  )}

                  {hasSubItems && isVisible && (
                    <ul className={`sidebar-submenu ${isOpen ? "open" : ""}`}>
                      {item.subItems?.map((subItem, subIndex) => {
                        const isSubItemActive =
                          location.pathname === subItem.path;
                        return (
                          <li key={subIndex}>
                            <Link
                              to={subItem.path}
                              className={`sidebar-subitem ${
                                isSubItemActive ? "active" : ""
                              }`}
                            >
                              <div
                                className="submenu-content"
                                style={{
                                  display: "flex",
                                  marginRight: "40px",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  width: "100%",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {subItem.icon && (
                                    <span className="sidebar-subicon">
                                      {subItem.icon}
                                    </span>
                                  )}
                                  <span className="sub-sidebar-text">
                                    {subItem.label}
                                  </span>
                                </div>
                                {subItem.isNew && (
                                  <span
                                    className="new-badge"
                                    style={{
                                      backgroundColor: "#ff4757",
                                      color: "#fff",
                                      fontSize: "8px",
                                      fontWeight: "600",
                                      padding: "1px 4px",
                                      borderRadius: "8px",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.3px",
                                      animation: "pulse 2s infinite",
                                      flexShrink: 0,
                                    }}
                                  >
                                    NEW
                                  </span>
                                )}
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </React.Fragment>
        ))}
      </ul>

      {userRole === "user" && (
      <div
        className="profile-section"
        style={{ display: isVisible ? "block" : "none" }}
      >
        <div
          className="current-plan-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/pricingplan")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate("/pricingplan");
            }
          }}
          aria-label="View pricing plans"
        >
          <div className="current-plan-row">
            <span className="current-plan-label">
              <MdOutlineWorkspacePremium className="current-plan-icon" />
              Current Plan
            </span>
            <span className="current-plan-value">{currentPlanLabel}</span>
          </div>
        </div>
        {showPlanExpiredNotice && (
          <p className="plan-expired-note">
            Your plan has expired. Choose a plan to continue.
          </p>
        )}
        {sidebarAnnouncements.length > 0 && (
          <div className="sidebar-announcements-card">
            <div className="sidebar-announcements-title">Updates</div>
            <div className="sidebar-announcements-list">
              {sidebarAnnouncements.map((item) => (
                <div key={item.id} className="sidebar-announcement-item">
                  <span className="sidebar-announcement-type">
                    {item.type}
                  </span>
                  <span className="sidebar-announcement-text">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
            <button
              className="sidebar-announcements-link"
              onClick={() => navigate("/dashboard")}
            >
              View all
            </button>
          </div>
        )}
        {showTrialBanner && (
          <>
            <p>{trialDaysLeft ?? 10} Days Left to access set up for your new plan.</p>
            <button onClick={() => navigate("/pricingplan")}>Upgrade to Pro</button>
          </>
        )}
      </div>
      )}

      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 71, 87, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 71, 87, 0);
          }
        }

        .current-plan-card {
          background: linear-gradient(135deg, #182a3d 0%, #1f3f66 50%, #1b2e44 100%);
          border: 1px solid #2e5b8f;
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 12px;
          box-shadow: 0 8px 20px rgba(0, 123, 255, 0.18);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .current-plan-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(0, 123, 255, 0.24);
          border-color: #3a70ad;
        }

        .current-plan-card:focus {
          outline: 2px solid #4da3ff;
          outline-offset: 2px;
        }

        .current-plan-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .current-plan-label {
          font-size: 11px;
          color: #b9d6ff;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .current-plan-icon {
          font-size: 14px;
          color: #ffd166;
          flex-shrink: 0;
        }

        .current-plan-value {
          font-size: 14px;
          color: #ffffff;
          font-weight: 700;
          text-align: right;
        }

        .current-plan-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.12);
          margin: 10px 0;
        }

        .plan-expired-note {
          margin: 0 0 10px;
          font-size: 12px;
          color: #ffb26b;
        }

        .sidebar-announcements-card {
          margin-top: 16px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(108, 82, 255, 0.2);
          background: rgba(26, 24, 39, 0.65);
          box-shadow: 0 8px 16px rgba(13, 12, 22, 0.3);
        }

        .sidebar-announcements-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #a8c6ff;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .sidebar-announcements-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-announcement-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px 10px;
          border-radius: 10px;
          background: rgba(52, 62, 87, 0.35);
        }

        .sidebar-announcement-type {
          font-size: 10px;
          text-transform: uppercase;
          color: #ffd166;
          letter-spacing: 0.4px;
        }

        .sidebar-announcement-text {
          font-size: 12px;
          color: #e6eefc;
          line-height: 1.3;
        }

        .sidebar-announcements-link {
          margin-top: 10px;
          width: 100%;
          border: 1px solid rgba(108, 82, 255, 0.35);
          background: transparent;
          color: #b9d6ff;
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 8px;
          cursor: pointer;
        }

        .sidebar-announcements-link:hover {
          background: rgba(108, 82, 255, 0.15);
        }
      `}</style>
    </div>
  );
};

export default UserSidebar;
