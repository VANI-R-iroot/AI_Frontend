import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PieChartData from "../../components/adminDashboard/PieChartCard";
import OrderAnalyticsData from "../../components/adminDashboard/orderAnalytics";
import TopAnalyticsData from "../../components/adminDashboard/AnalyticsCard";
import ContentGeneratedData from "../../components/adminDashboard/contentgenerateCard";
import YearlyData from "../../components/adminDashboard/YearlyUsageChart";
import UserListData from "../../components/adminDashboard/adminDashboardUserList";
import { fetchTrackingData } from "../../utils/fetchTrackingData";

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrackingData();
  }, []);

  return (
    <>
      <div className="main-content-common pt-3">
        <TopAnalyticsData />
        <div
          style={{
            marginTop: "20px",
            background: "#111827",
            border: "1px solid #374151",
            borderRadius: "10px",
            padding: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ color: "#e5e7eb" }}>
            <div style={{ fontSize: "16px", fontWeight: 700 }}>Reports Hub</div>
            <div style={{ fontSize: "13px", color: "#9ca3af" }}>
              Processed products and token usage reports (day/month and user/plan).
            </div>
          </div>
          <button
            onClick={() => navigate("/admin-analytics-logs?tab=reports")}
            style={{
              background: "#1f2937",
              color: "#f9fafb",
              border: "1px solid #4b5563",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Open Reports
          </button>
        </div>
        <div className="row pt-5 ">
          <div className="col-12 col-md-12 col-lg-12 col-xl-4 col-xxl-4">
            <YearlyData />
          </div>
          <div className="col-12 col-md-12 col-lg-12 col-xl-8 col-xxl-8">
            <OrderAnalyticsData />
          </div>
        </div>
        <div className="pt-5 ">
          <ContentGeneratedData />
        </div>

        <div className="row pt-5 ">
          <div className="col-12 col-md-12 col-lg-12 col-xl-4 col-xxl-4">
            <PieChartData />
          </div>
          <div className="col-12 col-md-12 col-lg-12 col-xl-8 col-xxl-8">
            <UserListData />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
