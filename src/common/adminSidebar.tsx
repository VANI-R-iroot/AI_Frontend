import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarAdminItems } from "../DataList/AdminSideMenu.tsx";
import adminImage from "../assets/image/admin/allImage";
import axiosInstance from "../utils/baseUrl";
import { useAuth } from "../context/AuthContext";

import {
  MdOutlineKeyboardArrowUp,
  MdOutlineKeyboardArrowDown,
} from "react-icons/md";

interface AppSidebarProps {
  isVisible: boolean;
}

const AdminSidebar: React.FC<AppSidebarProps> = ({ isVisible }) => {
  const location = useLocation();
  const { userRole } = useAuth();

  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [permissionKeys, setPermissionKeys] = useState<string[]>([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPermissions = async () => {
      if (userRole === "super_admin") {
        setPermissionsLoaded(true);
        return;
      }
      try {
        const response = await axiosInstance.get(
          "/admin/access/me/permissions"
        );
        const keys =
          response.data?.data?.map((item: any) => item.perm_key) || [];
        if (isMounted) {
          setPermissionKeys(keys);
        }
      } catch (error) {
        console.error("Failed to load admin permissions:", error);
      } finally {
        if (isMounted) {
          setPermissionsLoaded(true);
        }
      }
    };

    fetchPermissions();

    return () => {
      isMounted = false;
    };
  }, [userRole]);

  useEffect(() => {
    SidebarAdminItems.forEach((section, sectionIndex) => {
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

  // Clear any existing timeout
  const clearHideTimeout = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  };

  // Enhanced mouse enter handler with better hover management
  const handleMouseEnter = (
    item: any,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!isVisible) {
      clearHideTimeout();

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setHoveredItem(`${item.label}_${Date.now()}`); // Unique identifier
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

  const hasAnyPermission = (permissions?: string[]) => {
    if (!permissions || permissions.length === 0) return true;
    if (userRole === "super_admin") return true;
    if (!permissionsLoaded) return true;
    return permissions.some((perm) => permissionKeys.includes(perm));
  };

  const isDisabled = (permissions?: string[]) => {
    if (!permissions || permissions.length === 0) return false;
    if (userRole === "super_admin") return false;
    if (!permissionsLoaded) return false;
    return !hasAnyPermission(permissions);
  };

  const TooltipComponent = ({
    item,
    isSubmenu = false,
  }: {
    item: any;
    isSubmenu?: boolean;
  }) => {
    if (!hoveredItem || !hoveredItem.startsWith(item.label)) return null;
    const itemDisabled = isDisabled(item.permissions);

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
          itemDisabled ? (
            <div
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                textDecoration: "none",
                display: "block",
                padding: "4px 0",
                cursor: "not-allowed",
              }}
            >
              {item.label} (No access)
            </div>
          ) : (
            <Link
              to={item.path}
              style={{
                color: "#ffffff",
                textDecoration: "none",
                display: "block",
                padding: "4px 0",
              }}
              onClick={() => {
                clearHideTimeout();
                setHoveredItem(null);
              }}
            >
              {item.label}
            </Link>
          )
        ) : (
          <>
            <div
              style={{
                fontWeight: "600",
                marginBottom: "8px",
                color: "#6c52ff",
              }}
            >
              {item.label}
            </div>
            {item.subItems &&
              item.subItems.map((subItem: any, index: number) => {
                const subDisabled = isDisabled(subItem.permissions);
                if (subDisabled) {
                  return (
                    <div
                      key={index}
                      style={{
                        display: "block",
                        fontSize: "12px",
                        opacity: 0.5,
                        marginBottom: "4px",
                        paddingLeft: "8px",
                        borderLeft: "2px solid rgba(108, 82, 255, 0.2)",
                        paddingTop: "4px",
                        paddingBottom: "4px",
                        color: "#ffffff",
                        cursor: "not-allowed",
                      }}
                    >
                      • {subItem.label} (No access)
                    </div>
                  );
                }
                return (
                  <Link
                    key={index}
                    to={subItem.path}
                    style={{
                      display: "block",
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
                    • {subItem.label}
                  </Link>
                );
              })}
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className={`sidebar admin-sidebar ${
        isVisible ? "visible" : "hidden"
      } relative`}
    >
      {isVisible && (
        <button onClick={handleClose} className="sidebar-close-btn">
          ✕
        </button>
      )}

      <ul className="sidebar-menu admin-sidebar-menu">
        <li className={`admin-sidebar-logo ${scrolled ? "scrolled" : ""}`}>
          <Link to="/dashboard">
            <img
              src={adminImage.ChatAgentIcon}
              alt="Smart AI"
              className="sidebar-icon"
            />
            <h2 className="sidebar-text">AiProd</h2>
          </Link>
        </li>

        {SidebarAdminItems.map((section, sectionIndex) => (
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
              const itemDisabled = isDisabled(item.permissions);

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
                        } ${hasActiveSubItem ? "has-active-subitem" : ""} ${
                          itemDisabled ? "disabled" : ""
                        }`}
                        onClick={() => {
                          if (itemDisabled) return;
                          toggleSubMenu(globalItemIndex);
                        }}
                        style={{ cursor: itemDisabled ? "not-allowed" : "pointer" }}
                        onMouseEnter={(e) => handleMouseEnter(item, e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="menu-content">
                          <span className="sidebar-icon">{item.icon}</span>
                          <span className="sidebar-text">{item.label}</span>
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
                                  >
                                    {subItem.icon && (
                                      <span className="tooltip-subicon">
                                        {subItem.icon}
                                      </span>
                                    )}
                                    <span>{subItem.label}</span>
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
                      {itemDisabled ? (
                        <div className="sidebar-link disabled">
                          <div
                            className={`sidebar-item ${
                              isActive ? "active" : ""
                            } disabled`}
                            onMouseEnter={(e) => handleMouseEnter(item, e)}
                            onMouseLeave={handleMouseLeave}
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
                            <span className="sidebar-text">
                              {item.label} (No access)
                            </span>

                            {isVisible && (
                              <div className="sidebar-tooltip simple-tooltip">
                                <div className="tooltip-content">
                                  {item.label} (No access)
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Link to={item.path} className="sidebar-link">
                          <div
                            className={`sidebar-item ${
                              isActive ? "active" : ""
                            }`}
                            onMouseEnter={(e) => handleMouseEnter(item, e)}
                            onMouseLeave={handleMouseLeave}
                          >
                            {item.icon &&
                              (typeof item.icon === "string" ? (
                                <img
                                  src={item.icon}
                                  alt={item.label}
                                  className="sidebar-icon"
                                />
                              ) : (
                                <span className="sidebar-icon">{item.icon}</span>
                              ))}
                            <span className="sidebar-text">{item.label}</span>

                            {isVisible && (
                              <div className="sidebar-tooltip simple-tooltip">
                                <div className="tooltip-content">
                                  {item.label}
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>
                      )}

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
                        const subDisabled = isDisabled(subItem.permissions);
                        return (
                          <li key={subIndex}>
                            {subDisabled ? (
                              <div
                                className={`sidebar-subitem ${
                                  isSubItemActive ? "active" : ""
                                } disabled`}
                              >
                                <div className="submenu-content">
                                  {subItem.icon && (
                                    <span className="sidebar-subicon">
                                      {subItem.icon}
                                    </span>
                                  )}
                                  <span className="sub-sidebar-text">
                                    {subItem.label} (No access)
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <Link
                                to={subItem.path}
                                className={`sidebar-subitem ${
                                  isSubItemActive ? "active" : ""
                                }`}
                              >
                                <div className="submenu-content">
                                  {subItem.icon && (
                                    <span className="sidebar-subicon">
                                      {subItem.icon}
                                    </span>
                                  )}
                                  <span className="sub-sidebar-text">
                                    {subItem.label}
                                  </span>
                                </div>
                              </Link>
                            )}
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
    </div>
  );
};

export default AdminSidebar;
