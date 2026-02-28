import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/baseUrl";
import {
  FaSearch,
  FaLink,
  FaCheck,
  FaSync,
  FaExternalLinkAlt,
} from "react-icons/fa";
import ShortLink from "../../../common/ShortLinkDashboard";
import PageLoader from "../../../common/loader";
import "../../../assets/css/adminDashboard/ToolsList.css";
import { useUserStore } from "../../../zustand/userDetailsStore";

interface Toolkit {
  slug: string;
  name: string;
  logo?: string;
}

interface Tool {
  slug: string;
  name: string;
  id: string;
  description?: string;
  toolkit?: Toolkit;
  tags?: string[];
  available_versions?: string[];
  no_auth: boolean;
  scopes?: string[];
  meta?: {
    description?: string;
    logo?: string;
    tools_count?: number;
    triggers_count?: number;
    categories?: Array<{
      id: string;
      name: string;
    }>;
  };
  auth_schemes?: string[];
}

interface Connection {
  connectionId: string;
  platform: string;
  status: string;
  connectedAt: string;
  lastSyncAt: string;
  dataCount: number;
  platformInfo: {
    name: string;
    display_name: string;
    logo: string | null;
    category: string;
  };
}

interface UserData {
  _id: string;
}

const ToolsList: React.FC = () => {
  const userData = useUserStore((state) => state.userData || {}) as UserData;
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [connections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform] = useState<string>("all");
  const [connectingPlatform, setConnectingPlatform] = useState<string>("");
  const [syncingPlatform, setSyncingPlatform] = useState<string>("");

  // 🔹 Fetch tools
  const fetchTools = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/all-tools");

      if (response.data.success) {
        const allTools: Tool[] = response.data.data.items || [];

        const transformedTools = allTools.map((tool) => ({
          ...tool,
          toolkit: {
            slug: tool.toolkit?.slug || tool.slug,
            name: tool.toolkit?.name || tool.name,
            logo: tool.toolkit?.logo || tool.meta?.logo,
          },
          description: tool.meta?.description || tool.description || "",
          tags:
            tool.meta?.categories?.map((cat) => cat.name) || tool.tags || [],
        }));
        console.log("Transformed Tools:", transformedTools);
        setTools(transformedTools);
      }
    } catch (err: any) {
      console.error("Error fetching tools:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolConnect = async (tool: Tool, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (tool.no_auth) {
      alert(`${tool.toolkit?.name || tool.name} tool is ready to use!`);
      return;
    }

    const platformName = tool?.id;

    const existingConnection = connections.find(
      (conn) =>
        conn.platform.toLowerCase() === platformName.toLowerCase() &&
        conn.status === "active"
    );

    if (existingConnection) {
      alert(`Already connected to ${tool.toolkit?.name || tool.name}!`);
      return;
    }

    try {
      setConnectingPlatform(platformName);
      const userId = userData._id;

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

     
      const response = await axiosInstance.post("/initiateConnection", {
        authConfigId: platformName,
        userId: userId,
      });

      if (response.data.success) {

        if (response.data.redirectUrl) {

          window.open(response.data.redirectUrl, "_blank");

        

          alert(`OAuth window opened! Complete the authentication process.`);
        } else {
          // 🔹 For tools that don't need OAuth redirect
          alert(
            `Auth config created for ${tool.toolkit?.name || tool.name}! 
          AuthConfigId: ${
            response.data.authConfigId || response.data.connectedAccountId
          }`
          );
        }

    
      } else {
        throw new Error(response.data.message || "Failed to create connection");
      }
    } catch (error: any) {
 
    } finally {
      setConnectingPlatform("");
    }
  };
  // 🔹 Manual sync
  const handleDataSync = async (
    connectionId: string,
    platformName: string,
    event?: React.MouseEvent
  ) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      setSyncingPlatform(platformName);
      const userId = userData._id;

      const response = await axiosInstance.post(`/tools/sync/${connectionId}`, {
        userId: userId,
      });

      if (response.data.success) {
        alert(
          `Data synced successfully! ${response.data.data.totalRecords} records updated.`
        );
        // await fetchConnectionStatus();
      } else {
        throw new Error(response.data.message || "Sync failed");
      }
    } catch (error: any) {
      alert(
        `Failed to sync data: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`
      );
    } finally {
      setSyncingPlatform("");
    }
  };

  // 🔹 Helpers
  const isPlatformConnected = (platformName: string) => {
    return connections.some(
      (conn) =>
        conn.platform.toLowerCase() === platformName.toLowerCase() &&
        conn.status === "active"
    );
  };

  const getConnectionInfo = (platformName: string) => {
    return connections.find(
      (conn) =>
        conn.platform.toLowerCase() === platformName.toLowerCase() &&
        conn.status === "active"
    );
  };

  // 🔹 Filter tools
  const filteredTools = tools.filter((tool) => {
    const toolName = tool.name || "";
    const toolDescription = tool.description || tool.meta?.description || "";
    const toolkitName = tool.toolkit?.name || tool.name || "";

    const matchesSearch =
      toolName.toLowerCase().includes(searchKeyWord.toLowerCase()) ||
      toolDescription.toLowerCase().includes(searchKeyWord.toLowerCase()) ||
      toolkitName.toLowerCase().includes(searchKeyWord.toLowerCase());

    const matchesPlatform =
      selectedPlatform === "all" ||
      (tool.toolkit?.slug || tool.slug) === selectedPlatform;

    return matchesSearch && matchesPlatform;
  });

  // 🔹 FIX: Unique platforms for dropdown
 
  useEffect(() => {
    fetchTools();
  }, []);



  if (isLoading) {
    return (
      <div className="tools-list-container">
        <PageLoader isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="main-content-common">
      <div className="tools-list-container">
        <div className="tools-header-section">
          <div className="short-link-text">
            <ShortLink />
          </div>

          <div className="tools-controls">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchKeyWord}
                onChange={(e) => setSearchKeyWord(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="tools-stats">
          <p>
            Showing {filteredTools.length} of {tools.length} tools 
          </p>
        </div>

        <div className="tools-grid">
          {filteredTools.map((tool, index) => {
            const toolDescription =
              tool.description || tool.meta?.description || "No description";
            const platformSlug = tool.toolkit?.slug || tool.slug;
            const isConnected = isPlatformConnected(platformSlug);
            const connectionInfo = getConnectionInfo(platformSlug);
            const isConnecting = connectingPlatform === platformSlug;
            const isSyncing = syncingPlatform === platformSlug;

            const requiresConnection = !tool.no_auth;
            const toolLogo = tool.toolkit?.logo || tool.meta?.logo;

            return (
              <div
                key={tool.slug || index}
                className={`tool-card ${isConnected ? "connected" : ""} ${
                  requiresConnection ? "clickable" : "ready"
                }`}
                onClick={(e) => handleToolConnect(tool, e)}
                style={{
                  cursor: "pointer",
                  opacity: isConnecting ? 0.7 : 1,
                  pointerEvents: isConnecting ? "none" : "auto",
                }}
              >
                <div className="tool-card-header">
                  <div className="tool-logo">
                    {toolLogo ? (
                      <img
                        src={toolLogo}
                        alt={platformSlug}
                        className="platform-logo"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          (target.nextElementSibling as HTMLElement)!.style.display =
                            "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="platform-logo-placeholder"
                      style={{ display: toolLogo ? "none" : "flex" }}
                    >
                      {platformSlug.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="tool-info">
                    <span className="platform-name">{platformSlug}</span>
                  </div>

                  <div className="connection-status">
                    {requiresConnection ? (
                      <>
                        {isConnecting ? (
                          <span className="status-badge connecting">
                            <FaSync className="spinning" /> Connecting...
                          </span>
                        ) : isConnected ? (
                          <span className="status-badge connected">
                            <FaCheck /> Connected
                          </span>
                        ) : (
                          <span className="status-badge not-connected">
                            <FaLink /> Click to Connect
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="status-badge ready">
                        <FaExternalLinkAlt /> Ready to Use
                      </span>
                    )}
                  </div>
                </div>

                <div className="tool-card-body">
                  <p className="tool-description">
                    {toolDescription.length > 150
                      ? `${toolDescription.substring(0, 150)}...`
                      : toolDescription}
                  </p>

                  {isConnected && connectionInfo && (
                    <div className="connection-info">
                      <small>
                        Last sync:{" "}
                        {new Date(
                          connectionInfo.lastSyncAt
                        ).toLocaleDateString()}
                        {" | "} Data: {connectionInfo.dataCount} records
                      </small>

                      <button
                        className="sync-button"
                        onClick={(e) =>
                          handleDataSync(
                            connectionInfo.connectionId,
                            platformSlug,
                            e
                          )
                        }
                        disabled={isSyncing}
                      >
                        {isSyncing ? (
                          <>
                            <FaSync className="spinning" /> Syncing...
                          </>
                        ) : (
                          <>
                            <FaSync /> Sync Data
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="tool-card-footer">
                  <div className="tool-tags">
                    {tool.tags?.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="tool-tag">
                        {tag}
                      </span>
                    ))}
                    {tool.tags && tool.tags.length > 3 && (
                      <span className="tool-tag more">
                        +{tool.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="no-tools-found">
            <h3>No tools found</h3>
            <p>
              Try adjusting your search criteria or select a different platform.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsList;
