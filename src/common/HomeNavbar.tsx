import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MegaMenuIcon from "../assets/image/mega-menu/icon";

interface MenuSection {
  title: string;
  items: MenuItem[];
  isHot?: boolean;
}

interface MenuItem {
  title?: string;
  icon?: string;
  name: string;
  path: string;
  status?: "coming" | "hot" | "new";
}

const megaMenuData: Record<string, MenuSection[]> = {
  Pages: [
    {
      title: "DASHBOARD PAGES",
      isHot: false,
      items: [
        { name: "Dashboard User", path: "/profile" },
        { name: "Dashboard Admin", path: "/profile" },
        { name: "Profile", path: "/profile" },
        { name: "Notification", path: "/notification" },
        { name: "Chat Export", path: "/chat-export" },
        { name: "Appearance", path: "/appearance" },
        { name: "Plans and Billing", path: "/plans-billing" },
        { name: "Sessions", path: "/sessions" },
        { name: "Application", path: "/application" },
        { name: "Release notes", path: "/release-notes" },
        { name: "Help & FAQs", path: "/help-faqs" },
        { name: "Live Chat", path: "/help-faqs", status: "hot" },
        { name: "Support Ticket", path: "/help-faqs", status: "new" },
      ],
    },
    {
      title: "DASHBOARD PAGES",
      isHot: false,
      items: [
        { name: "Affiliate page", path: "/" },
        { name: "Blogs Management", path: "/help-faqs" },
        { name: "Order Management", path: "/help-faqs" },
        { name: "Project Management", path: "/help-faqs" },
        { name: "FAQ Management", path: "/help-faqs" },
        { name: "Unlimited Plugin Setup", path: "/help-faqs", status: "hot" },
        { name: "Paid User Page", path: "/help-faqs" },
        { name: "SMTP Page", path: "/help-faqs", status: "new" },
        { name: "Social Media Management", path: "/help-faqs" },
        { name: "AI Template Management", path: "/help-faqs" },
        { name: "File Management", path: "/help-faqs", status: "hot" },
      ],
    },
    {
      title: "INNER PAGES",
      isHot: false,
      items: [
        { name: "Home 01", path: "/home-01" },
        { name: "Home 02", path: "/", status: "new" },
        { name: "Blogs", path: "/blog-public-page" },
        { name: "Pricing", path: "/pricingplan" },
        { name: "Contact", path: "/contact-page" },
        { name: "Sign In", path: "/login" },
        { name: "Sign Up", path: "/register" },
        { name: "Team", path: "/team" },
        { name: "Terms & Policy", path: "/terms-policy" },
        { name: "Privacy Policy", path: "/privacy-policy" },
      ],
    },

    {
      title: "UPCOMING PAGES",
      isHot: true,
      items: [
        {
          name: "Social Media Template",
          path: "/product-description",
          status: "coming",
        },
        {
          name: "Personal Branding Template",
          path: "/product-description",
          status: "coming",
        },
        {
          name: "Market Place Template",
          path: "/product-description",
          status: "coming",
        },
      ],
    },
  ],

  Tools: [
    {
      title: "AI FEATURE",
      isHot: false,
      items: [
        {
          name: "AI Assistant",
          path: "/chat",
          icon: MegaMenuIcon.aiAssistant,
          title: "Trined Default Agent",
        },
        {
          name: "Scratch To web",
          path: "/scratch-to-web",
          icon: MegaMenuIcon.ScratchToWeb,
          title: "Image to Code",
        },
        {
          name: "Image Generator",
          path: "/image-generator",
          icon: MegaMenuIcon.createImage,
          title: "4k image Generate",
        },
        {
          name: "Imagination",
          path: "/image-generator",
          icon: MegaMenuIcon.imagination,
          title: "image quality improved, Edit",
        },
        {
          name: "AI Chat Image",
          path: "/ai-vision",
          icon: MegaMenuIcon.chatImage,
          title: "Target trine bot for business",
        },
      ],
    },
    {
      title: "AI FEATURE",
      isHot: false,
      items: [
        {
          name: "Image Caption",
          path: "/ai-vision",
          icon: MegaMenuIcon.imageCaptioning,
          title: "For social media ",
        },
        {
          name: "Image to Audio",
          path: "/ai-vision",
          icon: MegaMenuIcon.aiVision,
          title: "Visually impaired users",
        },
        {
          name: "Plagiarism check",
          path: "/ai-vision",
          icon: MegaMenuIcon.plagiarismCheck,
          title: "Target trine bot for business",
        },
        {
          name: "Content Detector",
          path: "/ai-vision",
          icon: MegaMenuIcon.aiVision,
          title: "Target trine bot for business",
          status: "hot",
        },

        {
          name: "Edit audio",
          path: "/ai-vision",
          icon: MegaMenuIcon.editAudio,
          title: "Target trine bot for business",
        },
        {
          name: "Video To Text",
          path: "/ai-vision",
          icon: MegaMenuIcon.videoToText,
          title: "Target trine bot for business",
        },
      ],
    },
    {
      title: "AI FEATURE",
      isHot: false,
      items: [
        {
          name: "AI Vision",
          path: "/ai-vision",
          icon: MegaMenuIcon.aiVision,
          title: "Target trine bot for business",
        },
        {
          name: "Web Scripting",
          path: "/ai-vision",
          icon: MegaMenuIcon.webScripting,
          title: "Target trine bot for business",
        },

        {
          name: "AI Rewriter",
          icon: MegaMenuIcon.aiRewriter,
          path: "/content-writer",
          title: "Target trine bot for business",
        },
        {
          name: "Speech to Text",
          icon: MegaMenuIcon.speechToText,
          path: "/content-detector",
          title: "Target trine bot for business",
        },
        {
          name: "AI Voice Over",
          path: "/code-assistant",
          icon: MegaMenuIcon.aiVoiceover,
          title: "Target trine bot for business",
        },
        {
          name: "AI COde Generator",
          path: "/text-analyzer",
          icon: MegaMenuIcon.codeGenerator,
          title: "Target trine bot for business",
        },
      ],
    },
    {
      title: "UPCOMING AI FEATURE",
      isHot: true,
      items: [
        {
          name: "Browser Use webUI",
          path: "/product-description",
          status: "coming",
        },
        {
          name: "Auto blog Posting",
          path: "/youtube-video",
          status: "coming",
        },
        {
          name: "AI Marketing Agent",
          path: "/grammar-check",
          status: "coming",
        },
        {
          name: "Social Medea manager",
          path: "/grammar-check",
          status: "coming",
        },
      ],
    },
  ],
};

const HomeNavbar: React.FC = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true);
  const hoverTimeoutRef = useRef<number | null>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 80) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }

    setLastScrollY(currentScrollY);
  };

  const navigate = useNavigate();

  const toggleNavbar = () => {
    setIsNavbarCollapsed(!isNavbarCollapsed);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleMenuMouseEnter = (menuName: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setOpenMenu(menuName);
  };

  const handleMenuMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 300);
  };

  return (
    <nav
      className={`custom-navbar ${!isVisible ? "hide" : ""} ${
        isScrolled ? "scrolled" : ""
      }`}
    >
      <div className="container custom-container">
        <button
          className="custom-navbar-toggler"
          type="button"
          onClick={toggleNavbar}
        >
          <span className="custom-navbar-toggler-icon"></span>
        </button>
        <span
          className="custom-navbar-brand"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          AiProd
        </span>

        <div
          className={`custom-navbar-collapse ${
            isNavbarCollapsed ? "collapsed" : ""
          }`}
        >
          <ul className="custom-navbar-nav">
            <li className="custom-nav-item">
              <span
                className={`custom-nav-link ${isActive("/") ? "active" : ""}`}
                onClick={() => navigate("/")}
              >
                Home
              </span>
            </li>

            <li
              className="custom-nav-item dropdown-container"
              onMouseEnter={() => handleMenuMouseEnter("Tools")}
              onMouseLeave={handleMenuMouseLeave}
            >
              <div className="custom-nav-link">
                Tools
                <span
                  className={`dropdown-arrow ${
                    openMenu === "Tools" ? "up" : "down"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {openMenu === "Tools" ? (
                      <polyline points="18 15 12 9 6 15"></polyline>
                    ) : (
                      <polyline points="6 9 12 15 18 9"></polyline>
                    )}
                  </svg>
                </span>
              </div>
              {openMenu === "Tools" && (
                <div className="mega-menu-container">
                  <div className="mega-menu-content">
                    <div className="mega-menu-grid">
                      {megaMenuData["Tools"].map((section, idx) => (
                        <div key={idx} className="mega-menu-section">
                          <h3 className="mega-menu-title">{section.title}</h3>
                          <ul className="mega-menu-items">
                            {section.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="mega-menu-item">
                                <a
                                  href={item.path}
                                  className="mega-menu-link"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleNavigate(item.path);
                                  }}
                                >
                                  <div className="menu-item-row">
                                    <div className="menu-item-left">
                                      {item.icon && (
                                        <img
                                          src={item.icon}
                                          alt={item.name}
                                          className="home-mega-menu-icon"
                                        />
                                      )}
                                      <div className="menu-text">
                                        <div className="menu-name">
                                          {item.name}
                                        </div>
                                        {item.title && (
                                          <div className="menu-title">
                                            {item.title}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {item.status && (
                                      <span
                                        className={`mega-menu-badge ${item.status}`}
                                      >
                                        {item.status.charAt(0).toUpperCase() +
                                          item.status.slice(1)}
                                      </span>
                                    )}
                                  </div>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </li>

            <li
              className="custom-nav-item dropdown-container"
              onMouseEnter={() => handleMenuMouseEnter("Pages")}
              onMouseLeave={handleMenuMouseLeave}
            >
              <div className="custom-nav-link">
                Pages
                <span
                  className={`dropdown-arrow ${
                    openMenu === "Pages" ? "up" : "down"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {openMenu === "Pages" ? (
                      <polyline points="18 15 12 9 6 15"></polyline>
                    ) : (
                      <polyline points="6 9 12 15 18 9"></polyline>
                    )}
                  </svg>
                </span>
              </div>
              {openMenu === "Pages" && (
                <div className="mega-menu-container">
                  <div className="mega-menu-content">
                    <div className="mega-menu-grid">
                      {megaMenuData["Pages"].map((section, idx) => (
                        <div key={idx} className="mega-menu-section">
                          <h3 className="mega-menu-title">{section.title}</h3>
                          <ul className="mega-menu-items">
                            {section.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="mega-menu-item">
                                <a
                                  href={item.path}
                                  className="mega-menu-link"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleNavigate(item.path);
                                  }}
                                >
                                  {item.name}
                                  {item.status && (
                                    <span
                                      className={`mega-menu-badge ${item.status}`}
                                    >
                                      {item.status.charAt(0).toUpperCase() +
                                        item.status.slice(1)}
                                    </span>
                                  )}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </li>

            <li className="custom-nav-item">
              <span
                className={`custom-nav-link ${
                  isActive("/blogs") ? "active" : ""
                }`}
                onClick={() => navigate("/blogs")}
              >
                Blogs
              </span>
            </li>
            <li className="custom-nav-item">
              <span
                className={`custom-nav-link ${
                  isActive("/contact") ? "active" : ""
                }`}
                onClick={() => navigate("/contact")}
              >
                Contact
              </span>
            </li>
          </ul>
        </div>
        <div className="custom-nav-actions">
          <button
            className="custom-btn-sign-in"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
          <button
            className="custom-btn-get-started"
            onClick={() => navigate("/register")}
          >
            Get Start
          </button>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;
