import React, { useEffect, useState } from "react";
import UsageStatsCard from "../../components/userDashboard/dashboardMain/payCahtCard";
import { userDashboardAgent } from "../../DataList/data";
import YearlyUsageChart from "../../components/userDashboard/dashboardMain/YearlyUsageChart";
import { useNavigate } from "react-router-dom";
import CommonTrailBar from "../../common/CommonTrailBar";
import DashboardNotificationList from "../../components/userDashboard/dashboardMain/userNoticesection";
import AnnouncementBanner from "../../components/userDashboard/dashboardMain/AnnouncementBanner";
import GiftAndSupport from "../../components/userDashboard/dashboardMain/giftAndSupportSection.tsx";
import PluginSection from "../../components/userDashboard/widgetSetup/dashboardPluginSection.tsx";
import VisitorMonitoringOnly from "../../components/userDashboard/visitorTracking/VisitorMonitoringOnly.tsx";
import { usePluginStore } from "../../zustand/pluginStore";
import { useUserStore } from "../../zustand/userDetailsStore";
import axiosInstance from "../../utils/baseUrl.ts";

interface UserData {
  email: string;
  name: string;
  _id: string;
}

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
    navigate("/assistant");
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

  return (
    <div className="main-content-common">
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

      <div className="user-dashboard-section-01">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-5 col-xl-4">
            <UsageStatsCard />
          </div>
          <div className="col-12 col-sm-12 col-md-12 col-lg-7 col-xl-8 user-admin-line-chart-section">
            <YearlyUsageChart />
          </div>
        </div>
      </div>

      <div className="user-dashboard-section-02">
        <div className="user-dashboard-common-sub-title">
          <h2>Quick Access</h2>
          <button className="see-more-btn" onClick={quickAccess}>
            See More <span className="arrow-icon">{"->"}</span>
          </button>
        </div>
        <div className="row">
          {userDashboardAgent.map((agent, index) => (
            <div
              className={`col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 ${
                index >= 4 ? "pt-4" : ""
              }`}
              key={index}
            >
              <div
                className="dashboard-quick-access-card"
                onClick={() => navigate(agent.link)}
              >
                <img
                  src={agent.agentIcon}
                  alt={agent.text}
                  className="card-img-quick-access"
                />
                <div className="card-body">
                  <h5 className="card-title">{agent.text}</h5>
                  <p className="card-text">{agent.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="user-dashboard-section-03">
        <div className="user-dashboard-common-sub-title">
          <h2>AI Chatbot Widget Integration</h2>
          <button className="see-more-btn" onClick={handleSeeMore}>
            See More <span className="arrow-icon">{"->"}</span>
          </button>
        </div>
        <PluginSection />
      </div>

      <div className="user-dashboard-section-04">
        <div className="user-dashboard-common-sub-title">
          <h2>Announcements & widget Monitoring</h2>
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

      <div className="user-dashboard-section-05">
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

