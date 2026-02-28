import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarSuperAdminItems } from "../DataList/SuperAdminSideMenu";
import adminImage from "../assets/image/admin/allImage";

import {
  MdOutlineKeyboardArrowUp,
  MdOutlineKeyboardArrowDown,
} from "react-icons/md";

interface AppSidebarProps {
  isVisible: boolean;
}

const SuperAdminSidebar: React.FC<AppSidebarProps> = ({ isVisible }) => {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    SidebarSuperAdminItems.forEach((section, sectionIndex) => {
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
              item.subItems.map((subItem: any, index: number) => (
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
              ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`sidebar ${isVisible ? "visible" : "hidden"} relative`}>
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
            <h2 className="sidebar-text">AiProd</h2>
          </Link>
        </li>

        {SidebarSuperAdminItems.map((section, sectionIndex) => (
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

                        {/* React-based tooltip for expanded sidebar */}
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
                      <Link to={item.path} className="sidebar-link">
                        <div
                          className={`sidebar-item ${isActive ? "active" : ""}`}
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

export default SuperAdminSidebar;
