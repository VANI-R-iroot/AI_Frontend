import React, { useEffect, useMemo, useState } from "react";
import UsageStatsCard from "../../components/userDashboard/dashboardMain/payCahtCard";
import YearlyUsageChart from "../../components/userDashboard/dashboardMain/YearlyUsageChart";
import { useNavigate } from "react-router-dom";
import CommonTrailBar from "../../common/CommonTrailBar";
import DashboardNotificationList from "../../components/userDashboard/dashboardMain/userNoticesection";
import AnnouncementBanner from "../../components/userDashboard/dashboardMain/AnnouncementBanner";
import GiftAndSupport from "../../components/userDashboard/dashboardMain/giftAndSupportSection.tsx";
import DashboardInsightsPanel from "../../components/userDashboard/dashboardMain/DashboardInsightsPanel";
import ProductAnalyserFocusPanel from "../../components/userDashboard/dashboardMain/ProductAnalyserFocusPanel";
import PluginSection from "../../components/userDashboard/widgetSetup/dashboardPluginSection.tsx";
import VisitorMonitoringOnly from "../../components/userDashboard/visitorTracking/VisitorMonitoringOnly.tsx";
import { usePluginStore } from "../../zustand/pluginStore";
import { useUserStore } from "../../zustand/userDetailsStore";
import axiosInstance from "../../utils/baseUrl.ts";
import {
  FiMessageSquare,
  FiImage,
  FiCode,
  FiMic,
  FiFilm,
  FiLayers,
  FiUsers,
  FiSearch,
  FiPackage,
  FiCpu,
  FiBarChart2,
  FiLink,
} from "react-icons/fi";

interface UserData {
  email: string;
  name: string;
  _id: string;
}

type DashboardUsage = {
  tokenUsage?: {
    month?: number;
    apiTokenCalls?: number;
  };
  productUsage?: {
    month?: number;
  };
};

type QuickAccessItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  limitKey?: string;
  accent: string;
};

const quickAccessCatalog: QuickAccessItem[] = [
  {
    id: "vision",
    title: "Product Analyser",
    description: "Generate product title, descriptions, and attributes",
    link: "/aivision",
    icon: <FiSearch />,
    limitKey: "ai_vision_limit",
    accent: "#a855f7",
  },
  {
    id: "assistant",
    title: "AI Assistant",
    description: "Chat with your tailored assistant for content workflows",
    link: "/assistant",
    icon: <FiMessageSquare />,
    limitKey: "ai_chat_assistant_limit",
    accent: "#0ea5e9",
  },
  {
    id: "image",
    title: "Create Image",
    description: "Create product creatives and campaign visuals",
    link: "/imagegenerate",
    icon: <FiImage />,
    limitKey: "text_to_image_limit",
    accent: "#f97316",
  },
  {
    id: "coding",
    title: "Code Generator",
    description: "Generate snippets, components, and helper logic",
    link: "/codegenerate",
    icon: <FiCode />,
    limitKey: "ai_code_generate_limit",
    accent: "#22c55e",
  },
  {
    id: "speech-to-text",
    title: "Speech to Text",
    description: "Convert calls and voice notes into clean transcript",
    link: "/speachtotext",
    icon: <FiMic />,
    limitKey: "speech_to_text_limit",
    accent: "#06b6d4",
  },
  {
    id: "video-to-text",
    title: "Video to Text",
    description: "Extract text and summaries from video content",
    link: "/videototext",
    icon: <FiFilm />,
    limitKey: "video_to_text_limit",
    accent: "#eab308",
  },
  {
    id: "platform-connect",
    title: "Platform Connect",
    description: "Push generated content to connected stores",
    link: "/platform-connect",
    icon: <FiLayers />,
    accent: "#8b5cf6",
  },
  {
    id: "team-settings",
    title: "Team Settings",
    description: "Manage teammates, roles, and workspace permissions",
    link: "/team-settings",
    icon: <FiUsers />,
    accent: "#14b8a6",
  },
];

const hasFeatureAccess = (subscription: any, limitKey?: string) => {
  if (!limitKey) return true;
  if (!subscription) return true;
  const limit = Number(subscription?.[limitKey]);
  if (Number.isNaN(limit)) return true;
  return limit === -1 || limit > 0;
};

const Dashboard: React.FC = () => {
  const userData = useUserStore((state) => state.userData || {}) as UserData;
  const domainNames = usePluginStore((state) => state.domainNames);
  const navigate = useNavigate();
  const [trackingStatus, setTrackingStatus] = useState<{
    totalVisitors: number;
    visitsByDate: Record<string, number>;
    countryPercentage: Record<string, string>;
  } | null>(null);
  const [welcomeNotice, setWelcomeNotice] = useState<string>("");
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [dashboardUsage, setDashboardUsage] = useState<DashboardUsage | null>(
    null
  );

  useEffect(() => {
    const notice = localStorage.getItem("login_welcome_notice");
    if (notice) {
      setWelcomeNotice(notice);
      setShowWelcomeCard(true);
      localStorage.removeItem("login_welcome_notice");
    }
  }, []);

  useEffect(() => {
    if (!showWelcomeCard) return;
    const timer = window.setTimeout(() => setShowWelcomeCard(false), 4500);
    return () => window.clearTimeout(timer);
  }, [showWelcomeCard]);

  const visitSeeMore = () => {
    navigate("/visitor-analyzer");
  };

  const handleSeeMore = () => {
    navigate("/download-widget-page");
  };

  const quickAccess = () => {
    navigate("/ai-tools-page");
  };

  const fetchTrackingData = async () => {
    const email = userData?.email;
    if (!email) {
      return;
    }
    try {
      const res = await axiosInstance.get("/get-tracking-data", {
        params: { email },
      });
      const trackingStatus = res.data.data.stats;
      const tracking = res.data.data.users;

      setTrackingStatus(trackingStatus);
      sessionStorage.setItem("UserTrackingData", JSON.stringify(tracking));
    } catch (error) {
      console.error("Fetch failed", error);
    }
  };

  useEffect(() => {
    if (domainNames && domainNames.length > 0) {
      fetchTrackingData();
    }
  }, [domainNames, userData?.email]);

  useEffect(() => {
    const fetchDashboardCoreData = async () => {
      try {
        const [subscriptionRes, usageRes] = await Promise.all([
          axiosInstance.get("/subscription/current"),
          axiosInstance.get("/api-access/usage"),
        ]);
        setCurrentSubscription(subscriptionRes?.data?.data || null);
        setDashboardUsage(usageRes?.data?.data || null);
      } catch (error) {
        console.error("Failed to fetch dashboard core data:", error);
      }
    };

    fetchDashboardCoreData();
  }, []);

  const filteredQuickAccess = quickAccessCatalog.filter((item) =>
    hasFeatureAccess(currentSubscription, item.limitKey)
  );
  const quickAccessItems =
    filteredQuickAccess.length >= 4
      ? filteredQuickAccess.slice(0, 4)
      : quickAccessCatalog.slice(0, 4);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const firstName = useMemo(() => {
    const name = String(userData?.name || "").trim();
    if (!name) return "there";
    return name.split(" ")[0];
  }, [userData?.name]);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  const overviewCards = useMemo(
    () => [
      {
        key: "products",
        label: "Products This Month",
        value: dashboardUsage?.productUsage?.month ?? 0,
        hint: "Generated content items",
        icon: <FiPackage />,
        tone: "is-orange",
      },
      {
        key: "tokens",
        label: "Tokens This Month",
        value: dashboardUsage?.tokenUsage?.month ?? 0,
        hint: "Total token consumption",
        icon: <FiCpu />,
        tone: "is-cyan",
      },
      {
        key: "calls",
        label: "API Calls",
        value: dashboardUsage?.tokenUsage?.apiTokenCalls ?? 0,
        hint: "Requests across tools",
        icon: <FiBarChart2 />,
        tone: "is-violet",
      },
      {
        key: "widgets",
        label: "Connected Widgets",
        value: domainNames?.length || 0,
        hint: "Active integration points",
        icon: <FiLink />,
        tone: "is-emerald",
      },
    ],
    [dashboardUsage, domainNames]
  );

  return (
    <div className="main-content-common dashboard-main-shell">
      <CommonTrailBar />
      <AnnouncementBanner />
      {welcomeNotice && showWelcomeCard ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(2, 6, 23, 0.58)",
            backdropFilter: "blur(2px)",
            padding: "18px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
              borderRadius: "20px",
              padding: "30px 26px",
              background: "linear-gradient(150deg, #0f172a 0%, #111827 100%)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              boxShadow: "0 28px 70px rgba(2, 6, 23, 0.7)",
              color: "#e5e7eb",
              animation: "welcomeCardSlideIn 260ms ease-out",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: "13px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#67e8f9",
                marginBottom: "10px",
              }}
            >
              Dashboard
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: "32px",
                fontWeight: 700,
                color: "#f8fafc",
                lineHeight: 1.2,
                marginBottom: "14px",
              }}
            >
              {welcomeNotice}
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: "14px",
                color: "#cbd5e1",
                marginBottom: "22px",
              }}
            >
              We are glad to see you in your workspace.
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setShowWelcomeCard(false)}
                style={{
                  background: "linear-gradient(90deg, #06b6d4 0%, #0ea5e9 100%)",
                  border: "none",
                  color: "#0b2232",
                  fontWeight: 700,
                  fontSize: "13px",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
                aria-label="Close welcome card"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <h2 className="user-dashboard-common-title">Dashboard</h2>
      <div className="dashboard-hero-card">
        <div className="dashboard-hero-main">
          <p className="dashboard-hero-eyebrow">
            {greeting}, {firstName}
          </p>
          <h3 className="dashboard-hero-title">Welcome to your AI workspace</h3>
          <p className="dashboard-hero-subtitle">
            {todayLabel} | Track usage, manage integrations, and publish faster.
          </p>
          <div className="dashboard-hero-badges">
            <span className="dashboard-hero-badge">
              Widgets: {domainNames?.length || 0}
            </span>
            <span className="dashboard-hero-badge">
              Visitors: {trackingStatus?.totalVisitors || 0}
            </span>
          </div>
        </div>
        <div className="dashboard-hero-actions">
          <button className="dashboard-hero-btn primary" onClick={() => navigate("/assistant")}>
            Open AI Assistant
          </button>
          <button className="dashboard-hero-btn" onClick={() => navigate("/platform-connect")}>
            Manage Platforms
          </button>
          <button className="dashboard-hero-btn" onClick={() => navigate("/visitor-analyzer")}>
            Open Analytics
          </button>
        </div>
      </div>

      <div className="dashboard-overview-grid dashboard-block">
        {overviewCards.map((card) => (
          <div className={`dashboard-overview-card ${card.tone}`} key={card.key}>
            <div className="dashboard-overview-head">
              <p className="dashboard-overview-label">{card.label}</p>
              <span className="dashboard-overview-icon">{card.icon}</span>
            </div>
            <h3>{card.value}</h3>
            <p className="dashboard-overview-hint">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-block">
        <ProductAnalyserFocusPanel />
      </div>

      <div className="user-dashboard-section-01 dashboard-block">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-5 col-xl-4">
            <UsageStatsCard />
          </div>
          <div className="col-12 col-sm-12 col-md-12 col-lg-7 col-xl-8 user-admin-line-chart-section">
            <YearlyUsageChart />
          </div>
        </div>
      </div>

      <div className="user-dashboard-section-06 dashboard-block">
        <DashboardInsightsPanel />
      </div>

      <div className="user-dashboard-section-02 dashboard-block">
        <div className="user-dashboard-common-sub-title dashboard-section-header">
          <div>
            <h2>Quick Access</h2>
            <p className="dashboard-section-subtext">Start from your most-used tools</p>
          </div>
          <button className="see-more-btn" onClick={quickAccess}>
            See More <span className="arrow-icon">{"->"}</span>
          </button>
        </div>
        <div className="row">
          {quickAccessItems.map((agent, index) => (
            <div
              className={`col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 ${
                index >= 4 ? "pt-4" : ""
              }`}
              key={agent.id}
            >
              <div
                className="dashboard-quick-access-card"
                onClick={() => navigate(agent.link)}
                style={{ ["--quick-accent" as any]: agent.accent }}
              >
                <div className="card-img-quick-access">{agent.icon}</div>
                <div className="quick-access-card-body">
                  <h5 className="card-title">{agent.title}</h5>
                  <p className="card-text">{agent.description}</p>
                </div>
                <div className="quick-access-open">Open</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="user-dashboard-section-03 dashboard-block">
        <div className="user-dashboard-common-sub-title dashboard-section-header">
          <div>
            <h2>Integrations</h2>
            <p className="dashboard-section-subtext">Manage your widgets and platform assets</p>
          </div>
          <button className="see-more-btn" onClick={handleSeeMore}>
            See More <span className="arrow-icon">{"->"}</span>
          </button>
        </div>
        <PluginSection />
      </div>

      <div className="user-dashboard-section-04 dashboard-block">
        <div className="user-dashboard-common-sub-title dashboard-section-header">
          <div>
            <h2>Live Monitoring</h2>
            <p className="dashboard-section-subtext">Track announcements and visitor activity in real time</p>
          </div>
          <button className="see-more-btn" onClick={visitSeeMore}>
            See More <span className="arrow-icon">{"->"}</span>
          </button>
        </div>
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-6 col-xxl-4">
            <DashboardNotificationList />
          </div>
          <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-6 col-xxl-8">
            {trackingStatus ? (
              <VisitorMonitoringOnly trackingStatus={trackingStatus} />
            ) : (
              <div className="content-section">
                <div className="section-header">
                  <div className="section-title">Visitor Monitoring</div>
                </div>
                <div className="loading-placeholder">
                  <p>Loading visitor data...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="user-dashboard-section-05 dashboard-block">
        <GiftAndSupport />
      </div>
      <style>{`
        @keyframes welcomeCardSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;


