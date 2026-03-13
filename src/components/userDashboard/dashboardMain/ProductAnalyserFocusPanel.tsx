import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/baseUrl";

type VisionItem = {
  id?: string | number;
  title?: string | null;
  score?: number | null;
  analysis_status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  createdAt?: string | null;
};

const toStatus = (value: unknown) => String(value || "pending").toLowerCase();

const ProductAnalyserFocusPanel: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<VisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisionData = async () => {
      try {
        const res = await axiosInstance.get("/vision/list?filter=recent&status=all");
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        setRows(list);
      } catch (error) {
        console.error("Failed to load vision focus data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisionData();
  }, []);

  const metrics = useMemo(() => {
    const total = rows.length;
    const approved = rows.filter((r) => toStatus(r.analysis_status) === "approved").length;
    const pending = rows.filter((r) => toStatus(r.analysis_status) === "pending").length;
    const rejected = rows.filter((r) => toStatus(r.analysis_status) === "rejected").length;

    const scored = rows
      .map((r) => Number(r.score))
      .filter((v) => Number.isFinite(v));
    const avgScore =
      scored.length > 0 ? Math.round(scored.reduce((sum, v) => sum + v, 0) / scored.length) : 0;
    const highConfidence = scored.filter((v) => v >= 80).length;

    const approvedPct = total ? Math.round((approved / total) * 100) : 0;
    const pendingPct = total ? Math.round((pending / total) * 100) : 0;
    const rejectedPct = total ? Math.round((rejected / total) * 100) : 0;

    return {
      total,
      approved,
      pending,
      rejected,
      avgScore,
      highConfidence,
      approvedPct,
      pendingPct,
      rejectedPct,
    };
  }, [rows]);

  return (
    <div className="product-analyser-focus">
      <div className="product-analyser-focus-head">
        <div>
          <h3>Product Analyser Focus</h3>
          <p>Vision performance snapshot for recent analyses</p>
        </div>
        <div className="product-analyser-focus-actions">
          <button type="button" onClick={() => navigate("/aivision")}>
            Open Analyser
          </button>
          <button type="button" onClick={() => navigate("/platform-connect")}>
            Publish Flow
          </button>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading-inline">Loading analyser metrics...</div>
      ) : (
        <div className="product-analyser-focus-grid">
          <div className="product-focus-card">
            <span>Total Analyses</span>
            <strong>{metrics.total}</strong>
          </div>
          <div className="product-focus-card">
            <span>Average Confidence</span>
            <strong>{metrics.avgScore}%</strong>
          </div>
          <div className="product-focus-card">
            <span>High Confidence</span>
            <strong>{metrics.highConfidence}</strong>
          </div>
          <div className="product-focus-card">
            <span>Approved</span>
            <strong>{metrics.approved}</strong>
          </div>

          <div className="product-focus-status-bar">
            <div className="status-row">
              <label>Approved</label>
              <span>{metrics.approvedPct}%</span>
            </div>
            <div className="status-track">
              <div className="status-fill is-approved" style={{ width: `${metrics.approvedPct}%` }} />
            </div>
          </div>
          <div className="product-focus-status-bar">
            <div className="status-row">
              <label>Pending</label>
              <span>{metrics.pendingPct}%</span>
            </div>
            <div className="status-track">
              <div className="status-fill is-pending" style={{ width: `${metrics.pendingPct}%` }} />
            </div>
          </div>
          <div className="product-focus-status-bar">
            <div className="status-row">
              <label>Rejected</label>
              <span>{metrics.rejectedPct}%</span>
            </div>
            <div className="status-track">
              <div className="status-fill is-rejected" style={{ width: `${metrics.rejectedPct}%` }} />
            </div>
          </div>
          <div className="product-focus-card subdued">
            <span>Pending Queue</span>
            <strong>{metrics.pending}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAnalyserFocusPanel;

