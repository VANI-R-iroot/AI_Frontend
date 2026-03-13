import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/baseUrl";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type UsageResponse = {
  apiFeatureUsage?: Record<string, number>;
};

type ProductItem = {
  id: string | number;
  type: string;
  title: string;
  status: string;
  createdAt: string;
};

const colors = ["#22c55e", "#0ea5e9", "#a855f7", "#f59e0b", "#ef4444"];

const featureLabels: Record<string, string> = {
  textToImage: "Text to Image",
  imageCaption: "Image Caption",
  aiChatAssistant: "AI Assistant",
  aiRewriter: "AI Rewriter",
  aiCodeGenerate: "Code Generator",
  webScripting: "Web Scripting",
  aiVision: "AI Vision",
  speechToText: "Speech to Text",
  aiVoiceover: "AI Voiceover",
  editAudio: "Edit Audio",
  videoToText: "Video to Text",
};

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const DashboardInsightsPanel: React.FC = () => {
  const [usageData, setUsageData] = useState<UsageResponse | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [usageRes, productsRes] = await Promise.all([
          axiosInstance.get("/api-access/usage"),
          axiosInstance.get("/api-access/products", { params: { limit: 120 } }),
        ]);

        setUsageData(usageRes?.data?.data || null);

        const productRows = Array.isArray(productsRes?.data?.data?.products)
          ? productsRes.data.data.products
          : [];
        setProducts(productRows);
      } catch (error) {
        console.error("Failed to fetch dashboard insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const chartData = useMemo(() => {
    const features = usageData?.apiFeatureUsage || {};
    const knownRows = Object.entries(featureLabels).map(([key, label]) => ({
      key,
      name: label,
      value: Number(features[key]) || 0,
    }));

    const extraRows = Object.entries(features)
      .filter(([key]) => !featureLabels[key])
      .map(([key, value]) => ({
        key,
        name: key,
        value: Number(value) || 0,
      }));

    const rows = [...knownRows, ...extraRows].sort((a, b) => b.value - a.value);

    const maxValue = rows[0]?.value || 1;
    return rows.map((row, index) => ({
      ...row,
      color: colors[index % colors.length],
      percent: row.value > 0 ? Math.max(6, Math.round((row.value / maxValue) * 100)) : 0,
    }));
  }, [usageData]);

  const recentActivities = useMemo(() => {
    return [...products]
      .filter((item) => String(item.type || "").toLowerCase() === "vision")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 6);
  }, [products]);

  const featureShare = useMemo(() => {
    const nonZero = chartData.filter((row) => row.value > 0);
    const total = nonZero.reduce((sum, row) => sum + row.value, 0);
    if (total === 0) return [];
    return nonZero.map((row) => ({
      ...row,
      share: Math.round((row.value / total) * 100),
    }));
  }, [chartData]);

  return (
    <div className="dashboard-insights-grid">
      <div className="dashboard-insight-card">
        <div className="dashboard-insight-header">
          <h3>Top Feature Usage</h3>
          <span>Ranked</span>
        </div>
        {loading ? (
          <div className="dashboard-loading-inline">Loading insights...</div>
        ) : chartData.length === 0 ? (
          <div className="dashboard-empty-state">
            No feature usage data available yet.
          </div>
        ) : (
          <div className="dashboard-feature-visual">
            <div className="dashboard-feature-donut-wrap">
              <div className="dashboard-feature-donut">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={featureShare}
                      dataKey="value"
                      innerRadius={42}
                      outerRadius={58}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {featureShare.map((row) => (
                        <Cell key={row.key} fill={row.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="dashboard-feature-donut-center">{featureShare[0]?.share ?? 0}%</div>
            </div>
            <div className="dashboard-feature-mini-legend">
              {featureShare.slice(0, 6).map((row) => (
                <div className="dashboard-feature-mini-item" key={`mini-${row.key}`}>
                  <span
                    className="dashboard-feature-mini-dot"
                    style={{ backgroundColor: row.color }}
                  />
                  <span className="dashboard-feature-mini-label">{row.name}</span>
                  <span className="dashboard-feature-mini-value">{row.share}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && chartData.length > 0 ? (
          <div className="dashboard-feature-rank-list">
            {chartData.map((row) => (
              <div className="dashboard-feature-rank-item" key={row.key}>
                <div className="dashboard-feature-rank-head">
                  <span className="dashboard-feature-rank-name">{row.name}</span>
                  <span className="dashboard-feature-rank-value">{row.value}</span>
                </div>
                <div className="dashboard-feature-rank-track">
                  <div
                    className="dashboard-feature-rank-fill"
                    style={{ width: `${row.percent}%`, backgroundColor: row.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="dashboard-insight-card">
        <div className="dashboard-insight-header">
          <h3>Recent Product Analyses</h3>
          <span>{recentActivities.length} records</span>
        </div>
        {loading ? (
          <div className="dashboard-loading-inline">Loading activity...</div>
        ) : recentActivities.length === 0 ? (
          <div className="dashboard-empty-state">No recent activity found.</div>
        ) : (
          <div className="dashboard-activity-list">
            {recentActivities.map((item) => (
              <div className="dashboard-activity-item" key={`${item.type}-${item.id}`}>
                <div className="dashboard-activity-main">
                  <div className="dashboard-activity-title">
                    {item.title || "Generated Content"}
                  </div>
                  <div className="dashboard-activity-meta">
                    {item.type.replace(/_/g, " ")}
                  </div>
                </div>
                <div className="dashboard-activity-side">
                  <span className="dashboard-activity-time">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                  <span
                    className={`dashboard-activity-status ${
                      String(item.status || "").toLowerCase() === "approved"
                        ? "is-approved"
                        : String(item.status || "").toLowerCase() === "rejected"
                        ? "is-rejected"
                        : "is-pending"
                    }`}
                  >
                    {item.status || "completed"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardInsightsPanel;
