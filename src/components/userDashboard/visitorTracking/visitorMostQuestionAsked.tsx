import React, { useState, useEffect } from "react";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { useUserStore } from "../../../zustand/userDetailsStore";
import { apiConfig } from "../../../utils/apiConfig";

const CACHE_KEY = "faq_analytics_cache";
const CACHE_EXPIRY_KEY = "faq_analytics_cache_expiry";
const CACHE_DURATION = 365 * 24 * 60 * 60 * 1000;

interface FAQData {
  _id: string;
  question: string;
  count: number;
  percentage: number;
  color: string;
  category?: string;
  lastAsked?: string;
}

interface CachedData {
  faqData: FAQData[];
  totalMessages: number;
  analysisDate: string;
  timestamp: number;
}

type MCPClient = Client<
  {
    method: string;
    params?: {
      [x: string]: unknown;
      _meta?: {
        [x: string]: unknown;
        progressToken?: string | number;
      };
    };
  },
  {
    method: string;
    params?: {
      [x: string]: unknown;
      _meta?: {
        [x: string]: unknown;
        progressToken?: string | number;
      };
    };
  },
  {}
>;

const FAQAnalyticsChart: React.FC = () => {
  const MCP_SERVER_URL = `${apiConfig.mcpApi}/mcpWidget`;
  const [status, setStatus] = useState("loading");
  const [client, setClient] = useState<MCPClient | null>(null);
  const userData = useUserStore((state) => state.userData);
  const [faqData, setFaqData] = useState<FAQData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"count" | "percentage">("percentage");
  const [showCount, setShowCount] = useState(10);
  const [totalMessages, setTotalMessages] = useState(0);
  const [analysisDate, setAnalysisDate] = useState<string>("");
  const [dataSource, setDataSource] = useState<"cache" | "server">("cache");

  const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  // Cache management
  const saveCacheData = (data: CachedData) => {
    try {
      setCookie(CACHE_KEY, JSON.stringify(data));
      setCookie(CACHE_EXPIRY_KEY, Date.now().toString());
    } catch (error) {
      console.warn("Failed to save cache data:", error);
    }
  };

  const getCacheData = (): CachedData | null => {
    try {
      const cachedData = getCookie(CACHE_KEY);
      const cacheExpiry = getCookie(CACHE_EXPIRY_KEY);

      if (!cachedData || !cacheExpiry) return null;

      const expiryTime = parseInt(cacheExpiry);
      const now = Date.now();

      if (now - expiryTime > CACHE_DURATION) {
        deleteCookie(CACHE_KEY);
        deleteCookie(CACHE_EXPIRY_KEY);
        return null;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.warn("Failed to get cache data:", error);
      return null;
    }
  };

  const clearCache = () => {
    deleteCookie(CACHE_KEY);
    deleteCookie(CACHE_EXPIRY_KEY);
  };

  const getColorByPercentage = (percentage: number): string => {
    if (percentage >= 15) return "#FF4444";
    if (percentage >= 12) return "#FF8C00";
    if (percentage >= 9) return "#FFD700";
    if (percentage >= 6) return "#32CD32";
    if (percentage >= 3) return "#87CEEB";
    return "#DDA0DD";
  };

  // Initialize MCP connection
  useEffect(() => {
    async function connectToServer() {
      try {
        const mcpClient = new Client({
          name: "browser-client",
          version: "1.0.0",
        });

        const transport = new StreamableHTTPClientTransport(
          new URL(MCP_SERVER_URL)
        );
        await mcpClient.connect(transport);

        setClient(mcpClient);
        setStatus("connected");
        console.log("✅ Connected to MCP server");
      } catch (err) {
        console.error("❌ MCP connection failed:", err);
        setStatus("error");
      }
    }
    connectToServer();
  }, []);

  const isValidAnalyticsData = (data: any): boolean => {
    return (
      data &&
      Array.isArray(data) &&
      data.length > 0 &&
      data.every(
        (item: any) =>
          item &&
          typeof item === "object" &&
          (item.message || item.question) &&
          typeof item.count === "number" &&
          typeof item.percentage === "number"
      )
    );
  };

  const tryParseJSON = (text: string): any => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const fetchFromServer = async (): Promise<CachedData | null> => {
    const email = userData.email;

    if (!client || !email.trim()) {
      throw new Error("MCP client not connected or email not available");
    }

    const result = await client.readResource({
      uri: `analyze://${email}` as string,
    });

    if (!result?.contents?.length) {
      throw new Error("No content received from MCP resource");
    }

    const resourceContent = result.contents[0];
    let analyticsResponse = null;

    if ((resourceContent as any).text) {
      analyticsResponse = tryParseJSON((resourceContent as any).text);
    } else if ((resourceContent as any).blob) {
      const textDecoder = new TextDecoder();
      const blob = (resourceContent as any).blob;

      let decodedText: string;
      if (blob instanceof ArrayBuffer) {
        decodedText = textDecoder.decode(blob);
      } else if (blob instanceof Uint8Array) {
        decodedText = textDecoder.decode(blob);
      } else if (Array.isArray(blob)) {
        decodedText = textDecoder.decode(new Uint8Array(blob));
      } else {
        decodedText = String(blob);
      }
      analyticsResponse = tryParseJSON(decodedText);
    }

    if (!analyticsResponse?.success) {
      throw new Error(
        analyticsResponse?.error || "Server response indicates failure"
      );
    }

    const analyticsData = analyticsResponse.data;

    if (!isValidAnalyticsData(analyticsData)) {
      if (Array.isArray(analyticsData) && analyticsData.length === 0) {
        throw new Error(
          "No FAQ data available for analysis. Users haven't asked enough questions yet."
        );
      }
      throw new Error("Invalid analytics data structure received from server");
    }

    const processedData: FAQData[] = analyticsData.map(
      (item: any, index: number) => ({
        _id: item._id || `item-${index}`,
        question: item.message || item.question || "Unknown Question",
        count: item.count || 0,
        percentage: item.percentage || 0,
        color: getColorByPercentage(item.percentage || 0),
        category: item.category || "General",
        lastAsked: item.lastAsked,
      })
    );

    return {
      faqData: processedData,
      totalMessages: analyticsResponse.totalMessages || 0,
      analysisDate: analyticsResponse.analysisDate || new Date().toISOString(),
      timestamp: Date.now(),
    };
  };

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      if (!forceRefresh) {
        const cachedData = getCacheData();
        if (cachedData) {
          setFaqData(cachedData.faqData);
          setTotalMessages(cachedData.totalMessages);
          setAnalysisDate(cachedData.analysisDate);
          setDataSource("cache");
          setLoading(false);
          console.log("✅ Data loaded from cache");
          return;
        }
      }

      // Fetch from server
      setDataSource("server");
      const serverData = await fetchFromServer();

      if (serverData) {
        setFaqData(serverData.faqData);
        setTotalMessages(serverData.totalMessages);
        setAnalysisDate(serverData.analysisDate);
        saveCacheData(serverData);
        console.log("✅ Data loaded from server and cached");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("❌ Failed to load data:", errorMessage);
      setError(errorMessage);
      setFaqData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "connected") {
      loadData();
    }
  }, [status]);

  const handleRefresh = () => {
    loadData(true);
  };

  const sortedData = [...faqData].sort((a, b) => {
    return sortBy === "count" ? b.count - a.count : b.percentage - a.percentage;
  });

  const maxValue = Math.max(
    ...sortedData.map((item) =>
      sortBy === "count" ? item.count : item.percentage
    )
  );

  const formatQuestion = (question: string, maxLength: number = 50): string => {
    return question.length > maxLength
      ? question.substring(0, maxLength) + "..."
      : question;
  };

  if (loading) {
    return (
      <div className="plugin-analyzing-chart-container">
        <div className="plugin-analyzing-chart-title">
          Most Frequently Asked Questions by Users
        </div>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading FAQ analytics...
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="plugin-analyzing-chart-container">
        <div className="plugin-analyzing-chart-title">
          Most Frequently Asked Questions by Users
        </div>
        <div style={{ textAlign: "center", padding: "2rem", color: "#ff4444" }}>
          ❌ Failed to connect to MCP server
          <br />
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (faqData.length === 0) {
    return (
      <div className="plugin-analyzing-chart-container">
        <div className="plugin-analyzing-chart-header">
          <div className="plugin-analyzing-chart-title">
            Most Frequently Asked Questions by Users
            <div
              style={{ fontSize: "0.8rem", color: "#666", marginTop: "4px" }}
            >
              📊 Data Source: {dataSource === "cache" ? "Cache" : "MCP Server"}{" "}
              | Status: {status}
            </div>
          </div>

          <button
            onClick={handleRefresh}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "1rem",
            }}
            disabled={!client || loading}
          >
            🔄 Refresh Data
          </button>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "2px dashed #dee2e6",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
          <h3 style={{ color: "#6c757d", marginBottom: "1rem" }}>
            No FAQ Data Available
          </h3>
          <p style={{ color: "#868e96", marginBottom: "1.5rem" }}>
            {error ||
              "Users haven't asked enough questions yet to generate analytics."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="plugin-analyzing-chart-container">
      <div className="plugin-analyzing-chart-header">
        <div
          className="plugin-analyzing-chart-title"
          style={{ textAlign: "center" }}
        >
          Most Frequently Asked Questions by Users
          <div
            style={{
              fontSize: "0.8rem",
              color: "#666",
              marginTop: "4px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>
              📊 Data Source: {dataSource === "cache" ? "Cache" : "MCP Server"}
            </span>
            <span style={{ display: "flex", alignItems: "center" }}>
              | MCP Status:
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: status === "connected" ? "#05df05" : "red",
                  display: "inline-block",
                  marginLeft: "6px",
                }}
              ></span>
              <span style={{ marginLeft: "4px" }}>{status}</span>
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "count" | "percentage")
            }
            style={{ padding: "0.5rem", borderRadius: "4px" }}
          >
            <option value="percentage">Sort by Percentage</option>
            <option value="count">Sort by Count</option>
          </select>

          <select
            value={showCount}
            onChange={(e) => setShowCount(parseInt(e.target.value))}
            style={{ padding: "0.5rem", borderRadius: "4px" }}
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
          </select>

          <button
            onClick={handleRefresh}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            disabled={!client || loading}
          >
            🔄 Refresh Data
          </button>

          <button
            onClick={clearCache}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🗑️ Clear Cache
          </button>
        </div>
      </div>

      <div className="plugin-analyzing-chart-content">
        <div className="plugin-analyzing-y-axis-label">
          Frequently Asked
          <br />
          Questions
        </div>

        <div className="plugin-analyzing-chart-bars">
          {sortedData.slice(0, showCount).map((item) => (
            <div key={item._id} className="plugin-analyzing-bar-row">
              <div
                className="plugin-analyzing-bar-label"
                title={item.question}
                style={{
                  cursor: "help",
                  minWidth: "200px",
                  textAlign: "left",
                  fontSize: "0.85rem",
                }}
              >
                {formatQuestion(item.question)}
                {item.category && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "#666",
                      display: "block",
                      marginTop: "2px",
                    }}
                  >
                    [{item.category}]
                  </span>
                )}
              </div>

              <div className="plugin-analyzing-bar-container">
                <div
                  className="plugin-analyzing-bar"
                  style={{
                    width: `${
                      ((sortBy === "count" ? item.count : item.percentage) /
                        maxValue) *
                      100
                    }%`,
                    backgroundColor: item.color,
                    minHeight: "24px",
                    borderRadius: "4px",
                    position: "relative",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "white",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                    }}
                  >
                    {item.count} times
                  </div>
                </div>
              </div>

              <div className="plugin-analyzing-bar-percentage">
                <strong>{item.percentage.toFixed(1)}%</strong>
                <div style={{ fontSize: "0.7rem", color: "#666" }}>
                  ({item.count})
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="plugin-analyzing-x-axis">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i}>{Math.round((maxValue / 8) * i)}</span>
          ))}
        </div>

        <div className="plugin-analyzing-x-axis-label">
          {sortBy === "count" ? "Question Count" : "Percentage (%)"}
        </div>
      </div>

      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: "#343e5733",
          borderRadius: "8px",
          fontSize: "0.9rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <strong>Total Messages:</strong> {totalMessages}
          </div>
          <div>
            <strong>Unique Questions:</strong> {sortedData.length}
          </div>
          <div>
            <strong>Most Asked:</strong>{" "}
            {formatQuestion(sortedData[0]?.question || "", 30)}
          </div>
        </div>
        <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#888" }}>
          📊 Data Source:{" "}
          {dataSource === "cache" ? "Cache (Fast)" : "Server (Fresh)"} | Cache
          Duration: {CACHE_DURATION / 60000} minutes
          {analysisDate && (
            <span>
              {" "}
              | Last Updated: {new Date(analysisDate).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQAnalyticsChart;
