import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../utils/baseUrl";

type ApiTokenMeta = {
  prefix: string;
  name?: string | null;
  usageCount?: number;
  lastUsedAt?: string | null;
  createdAt?: string | null;
};

type ApiTokenResponse = {
  hasActiveToken: boolean;
  hasActiveApiKey?: boolean;
  token: ApiTokenMeta | null;
  apiKey?: ApiTokenMeta | null;
};

type UsageResponse = {
  tokenUsage?: {
    total?: number;
    month?: number;
    apiTokenCalls?: number;
  };
  productUsage?: {
    total?: number;
    month?: number;
  };
};

const apiCardStyle: React.CSSProperties = {
  background: "linear-gradient(145deg, #1f2937, #111827)",
  borderRadius: "16px",
  padding: "20px",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.08)",
};

const buttonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "8px",
  padding: "10px 14px",
  fontWeight: 600,
  cursor: "pointer",
};

const ApiKeyPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [issuedToken, setIssuedToken] = useState("");
  const [tokenState, setTokenState] = useState<ApiTokenResponse>({
    hasActiveToken: false,
    token: null,
    apiKey: null,
  });
  const [usage, setUsage] = useState<UsageResponse>({});

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [tokenRes, usageRes] = await Promise.all([
        axiosInstance.get("/api-access/token"),
        axiosInstance.get("/api-access/usage"),
      ]);
      setTokenState(
        tokenRes.data?.data || {
          hasActiveToken: false,
          token: null,
          apiKey: null,
        }
      );
      setUsage(usageRes.data?.data || {});
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to load API key info";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const maskedPrefix = useMemo(() => {
    const prefix = tokenState.apiKey?.prefix || tokenState.token?.prefix || "";
    if (!prefix) return "Not generated";
    return `${prefix} ...`;
  }, [tokenState.apiKey?.prefix, tokenState.token?.prefix]);

  const handleGenerate = async (regenerate = false) => {
    setSaving(true);
    setError("");
    try {
      const endpoint = regenerate
        ? "/api-access/token/regenerate"
        : "/api-access/token/generate";
      const res = await axiosInstance.post(endpoint, {
        name: "Dashboard API Token",
      });
      setIssuedToken(res.data?.data?.apiKey || res.data?.data?.token || "");
      await loadData();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to generate API key";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async () => {
    setSaving(true);
    setError("");
    try {
      await axiosInstance.delete("/api-access/token");
      setIssuedToken("");
      await loadData();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to revoke API key";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const copyIssuedToken = async () => {
    if (!issuedToken) return;
    try {
      await navigator.clipboard.writeText(issuedToken);
      alert("API key copied");
    } catch {
      alert("Failed to copy API key");
    }
  };

  return (
    <div style={apiCardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h4 style={{ margin: 0 }}>API Key</h4>
          <p style={{ margin: "6px 0 0", opacity: 0.85, fontSize: 13 }}>
            Use <code>Authorization: Bearer &lt;api_key&gt;</code> for API access.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 14 }}>
        <div>
          <strong>Current API key:</strong> {maskedPrefix}
        </div>
        <div style={{ marginTop: 8, opacity: 0.85 }}>
          <strong>Token calls:</strong> {usage.tokenUsage?.apiTokenCalls || 0}
          {"  "} | {"  "}
          <strong>Products:</strong> {usage.productUsage?.total || 0}
        </div>
      </div>

      {issuedToken ? (
        <div style={{ marginTop: 14, background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 6 }}>New API key (shown once):</div>
          <code style={{ display: "block", wordBreak: "break-all", fontSize: 12 }}>{issuedToken}</code>
          <button
            onClick={copyIssuedToken}
            style={{ ...buttonStyle, marginTop: 10, background: "#22c55e", color: "#062b14" }}
            type="button"
          >
            Copy API Key
          </button>
        </div>
      ) : null}

      {error ? (
        <div style={{ marginTop: 12, color: "#fca5a5", fontSize: 13 }}>{error}</div>
      ) : null}

      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <button
          type="button"
          style={{ ...buttonStyle, background: "#60a5fa", color: "#0b1f3d" }}
          onClick={() => handleGenerate(false)}
          disabled={saving || loading}
        >
          Generate
        </button>
        <button
          type="button"
          style={{ ...buttonStyle, background: "#f59e0b", color: "#3f2501" }}
          onClick={() => handleGenerate(true)}
          disabled={saving || loading}
        >
          Regenerate
        </button>
        <button
          type="button"
          style={{ ...buttonStyle, background: "#f87171", color: "#3b0909" }}
          onClick={handleRevoke}
          disabled={saving || loading}
        >
          Revoke
        </button>
      </div>

      {loading ? <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>Loading...</div> : null}
    </div>
  );
};

export default ApiKeyPanel;
