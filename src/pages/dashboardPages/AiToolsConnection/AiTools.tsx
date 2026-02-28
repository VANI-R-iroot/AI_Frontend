import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/baseUrl";
import {
  FaSearch,
  FaCheck,
  FaSync,
  FaExternalLinkAlt,
  FaTrash,
  FaPlus,
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
  id: string;
  uuid: string;
  name: string;
  slug?: string;
  auth_scheme: string;
  description?: string;
  toolkit?: Toolkit;
  tags?: string[];
  no_auth?: boolean;
  no_of_connections?: number;
  status?: string;
  credentials?: any;
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
}

interface ConnectedToolStatus {
  authConfigId: string;
  toolkitSlug: string;
  isActive: boolean;
}

interface UserData {
  _id: string;
}

const ToolsList: React.FC = () => {
  const userData = useUserStore((state) => state.userData || {}) as UserData;
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [connectedTools, setConnectedTools] = useState<ConnectedToolStatus[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string>("");
  const [deletingConnection, setDeletingConnection] = useState<string>("");
  const [limit, setLimit] = useState<number>(100);

  const limitOptions = [50, 100, 150, 200, 250, 300, 350];

  // Fetch all tools from API
  const fetchTools = async (cursor?: string) => {
    try {
      setIsLoading(true);

      let url = `/get-connected-tools?limit=${limit}`;
      if (cursor) {
        url += `&cursor=${cursor}`;
      }

      const response = await axiosInstance.get(url);

      if (response.data.success) {
        const fetchedTools: Tool[] = response.data.data.items || [];

        // Transform tools data
        const transformedTools = fetchedTools.map((tool) => ({
          ...tool,
          toolkit: {
            slug: tool.toolkit?.slug || tool.name.toLowerCase(),
            name: tool.toolkit?.slug || tool.name,
            logo: tool.toolkit?.logo,
          },
          description: tool.meta?.description || "",
          tags: tool.meta?.categories?.map((cat) => cat.name) || [],
          no_auth: tool.auth_scheme === "NO_AUTH" || false,
        }));

        setTools(transformedTools);
   

        // After fetching tools, check connection status for all tools
        if (userData._id && transformedTools.length > 0) {
          console.log("Checking connection status for all tools...");
          checkAllToolsConnectionStatus(transformedTools);
        }
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check connection status for a single tool
  const checkConnectionStatus = async (
    userId: string,
    authConfigId: string
  ) => {
    try {
      const response = await axiosInstance.get("/usersConnectedTools", {
        params: {
          userId: userId,
          authConfigId: authConfigId,
        },
      });

      if (response.data.success) {
        const status = response.data.status;
        const isActive = status === "active";

        return { success: true, isActive };
      }
      return { success: false, isActive: false };
    } catch (error: any) {
      console.error(
        `Error checking connection status for ${authConfigId}:`,
        error
      );
      return { success: false, isActive: false };
    }
  };

  // ✅ MODIFIED: Check all tools connection status in ONE API call
  const checkAllToolsConnectionStatus = async (toolsList: Tool[]) => {
    if (!userData._id || !toolsList || toolsList.length === 0) {
      return;
    }

    try {
      const authConfigIds = toolsList.map((tool) => tool.id);
      const response = await axiosInstance.get("/usersConnectedTools", {
        params: {
          userId: userData._id,
          authConfigIds: authConfigIds.join(","),
        },
      });

      if (response.data.success && response.data.data) {
        const activeConnections = response.data.data;

        // Transform to match existing format
        const connectedToolsStatus: ConnectedToolStatus[] =
          activeConnections.map((account: any) => ({
            authConfigId: account.authConfigId,
            toolkitSlug: account.toolkitSlug,
            isActive: true,
          }));

        setConnectedTools(connectedToolsStatus);
        console.log(`Found ${connectedToolsStatus.length} active connections`);
      } else {
        setConnectedTools([]);
      }
    } catch (error) {
      console.error("Error checking all tools status:", error);
      setConnectedTools([]);
    }
  };

  // Get tool connection status by authConfigId
  const getToolConnectionStatus = (authConfigId: string) => {
    const connectedTool = connectedTools.find(
      (tool) => tool.authConfigId === authConfigId
    );

    const isConnected = connectedTool ? connectedTool.isActive : false;

    return {
      isConnected,
      authConfigId,
    };
  };

  // Handle tool connection
  const handleToolConnect = async (tool: Tool, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (tool.no_auth) {
      alert(`${tool.toolkit?.name || tool.name} tool is ready to use!`);
      return;
    }

    const platformSlug = tool.toolkit?.slug || tool.name.toLowerCase();
    const authConfigId = tool.id;

    const connectionStatus = getToolConnectionStatus(authConfigId);

    if (connectionStatus.isConnected) {
      alert(`Already connected to ${tool.toolkit?.name || tool.name}!`);
      return;
    }

    try {
      setConnectingPlatform(platformSlug);
      const userId = userData._id;

      if (!userId) {
        throw new Error("User ID not found. Please login again.");
      }

      const response = await axiosInstance.post("/initiateConnection", {
        authConfigId: authConfigId,
        userId: userId,
      });

      if (response.data.success) {
        if (response.data.redirectUrl) {
          console.log("Opening OAuth popup:", response.data.redirectUrl);

          const popup = window.open(
            response.data.redirectUrl,
            "_blank",
            "width=600,height=600,scrollbars=yes,resizable=yes"
          );

          if (popup) {
            // Check when popup closes
            const checkClosed = setInterval(async () => {
              if (popup.closed) {
                clearInterval(checkClosed);

                // Wait a bit for backend to process
                await new Promise((resolve) => setTimeout(resolve, 2000));

                // Check connection status after popup closes
                const statusResult = await checkConnectionStatus(
                  userId,
                  authConfigId
                );

                if (statusResult.isActive) {
                  alert("Successfully connected!");

                  // Update connected tools state
                  setConnectedTools((prev) => {
                    // Remove if exists and add new
                    const filtered = prev.filter(
                      (t) => t.authConfigId !== authConfigId
                    );
                    return [
                      ...filtered,
                      {
                        authConfigId: authConfigId,
                        toolkitSlug: platformSlug,
                        isActive: true,
                      },
                    ];
                  });
                } else {
                  alert("Connection is not active. Please try again.");
                }
              }
            }, 500);

            // Fallback check after 15 seconds
            setTimeout(async () => {
              if (!popup.closed) {
                console.log("Fallback check after 15 seconds...");
                const statusResult = await checkConnectionStatus(
                  userId,
                  authConfigId
                );

                if (statusResult.isActive) {
                  setConnectedTools((prev) => {
                    const filtered = prev.filter(
                      (t) => t.authConfigId !== authConfigId
                    );
                    return [
                      ...filtered,
                      {
                        authConfigId: authConfigId,
                        toolkitSlug: platformSlug,
                        isActive: true,
                      },
                    ];
                  });
                }
              }
            }, 15000);
          } else {
            alert("Popup blocked! Please allow popups and try again.");
          }
        } else {
          // No redirect URL, direct connection (API_KEY type)

          await new Promise((resolve) => setTimeout(resolve, 1000));

          const statusResult = await checkConnectionStatus(
            userId,
            authConfigId
          );

          if (statusResult.isActive) {
            alert("Successfully connected!");
            setConnectedTools((prev) => {
              const filtered = prev.filter(
                (t) => t.authConfigId !== authConfigId
              );
              return [
                ...filtered,
                {
                  authConfigId: authConfigId,
                  toolkitSlug: platformSlug,
                  isActive: true,
                },
              ];
            });
          } else {
            alert("Connection failed. Please try again.");
          }
        }
      } else {
        throw new Error(response.data.message || "Connection failed");
      }
    } catch (error: any) {
      console.error("Connection error:", error);

      let errorMessage = "Connection failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Failed to connect: ${errorMessage}`);
    } finally {
      setConnectingPlatform("");
    }
  };

  // Delete connection
  const deleteConnection = async (
    authConfigId: string,
    toolkitName: string
  ) => {
    if (
      !confirm(`Are you sure you want to delete ${toolkitName} connection?`)
    ) {
      return;
    }

    try {
      setDeletingConnection(authConfigId);
      console.log("Deleting connection:", authConfigId);

      const response = await axiosInstance.delete(
        `/delete-connection/${authConfigId}`
      );

      if (response.data.success) {
        // Remove from connected tools
        setConnectedTools((prev) =>
          prev.filter((tool) => tool.authConfigId !== authConfigId)
        );

        alert(`${toolkitName} connection deleted successfully!`);
        console.log("Connection deleted successfully");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(
        `Failed to delete: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setDeletingConnection("");
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    setLimit(newLimit);

  };

  const filteredTools = tools.filter((tool) => {
    const toolName = tool.name || "";
    const toolDescription = tool.description || tool.meta?.description || "";
    const toolkitName = tool.toolkit?.slug || tool.name || "";

    const matchesSearch =
      toolName.toLowerCase().includes(searchKeyWord.toLowerCase()) ||
      toolDescription.toLowerCase().includes(searchKeyWord.toLowerCase()) ||
      toolkitName.toLowerCase().includes(searchKeyWord.toLowerCase());

    return matchesSearch;
  });

  // Initial fetch on component mount
  useEffect(() => {
    fetchTools();
  }, []);

  // Fetch tools when limit changes
  useEffect(() => {
    if (!isLoading && limit) {
      fetchTools();
    }
  }, [limit]);

  if (isLoading) {
    return (
      <div className="tools-list-container">
        <PageLoader isLoading={isLoading} />
      </div>
    );
  }

  if (!isLoading && tools.length === 0) {
    return (
      <div className="main-content-common">
        <div className="tools-list-container">
          <div className="no-tools-found">
            <h3>No tools available</h3>
            <p>
              Unable to fetch tools data. Please check your connection and try
              again.
            </p>
            <button onClick={() => fetchTools()}>Retry</button>
          </div>
        </div>
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

            <div
              className="limit-dropdown-container"
              style={{
                marginLeft: "15px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <select
                id="limit-select"
                value={limit}
                onChange={handleLimitChange}
                style={{
                  padding: "8px 12px",
                  fontSize: "14px",
                  border: "1px solid  rgba(29, 41, 68, 0.911)",
                  borderRadius: "5px",
                  backgroundColor: "#343e5733",
                  color: "#fff",
                  cursor: "pointer",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = " rgba(29, 41, 68, 0.911)")
                }
                onBlur={(e) => (e.target.style.borderColor = "#343e5733")}
              >
                {limitOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="tools-stats">
          <p>
            Showing {filteredTools.length} of {tools.length} tools |{" "}
            {connectedTools.filter((tool) => tool.isActive).length} platforms
            connected
          </p>
        </div>

        <div className="tools-grid">
          {filteredTools.map((tool, index) => {
            const toolDescription =
              tool.description || tool.meta?.description || "No description";
            const platformSlug = tool.toolkit?.slug || tool.name.toLowerCase();
            const authConfigId = tool.id; // Use tool.id as authConfigId

            const connectionStatus = getToolConnectionStatus(authConfigId);
            const isConnecting = connectingPlatform === platformSlug;
            const isDeleting = deletingConnection === authConfigId;
            const requiresConnection = !tool.no_auth;
            const toolLogo = tool.toolkit?.logo;

            return (
              <div
                key={tool.id || index}
                className={`tool-card ${
                  connectionStatus.isConnected ? "connected" : ""
                }`}
                style={{
                  cursor: "default",
                  opacity: isConnecting || isDeleting ? 0.7 : 1,
                  pointerEvents: isConnecting || isDeleting ? "none" : "auto",
                }}
              >
                <div className="tool-card-header">
                  <div className="tool-logo-info">
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
                    <h3 className="toolkit-tool-name">{platformSlug}</h3>
                  </div>
                </div>

                <div className="tool-card-body">
                  <p className="tool-description">
                    {toolDescription.length > 100
                      ? `${toolDescription.substring(0, 100)}...`
                      : toolDescription}
                  </p>

                  <div className="connection-status">
                    {requiresConnection ? (
                      <div className="tool-actions">
                        {connectionStatus.isConnected ? (
                          <>
                            <span className="toolkit-status-badge connected">
                              <FaCheck /> Connected
                            </span>

                            <button
                              className="action-button delete-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConnection(
                                  authConfigId,
                                  tool.toolkit?.name || tool.name
                                );
                              }}
                              disabled={isDeleting}
                              title="Delete connection"
                            >
                              {isDeleting ? (
                                <FaSync className="spinning" />
                              ) : (
                                <FaTrash />
                              )}
                            </button>
                          </>
                        ) : (
                          <>
                            {isConnecting ? (
                              <span className="toolkit-status-badge connecting">
                                <FaSync className="spinning" /> Connecting...
                              </span>
                            ) : (
                              <button
                                className="action-button connect-button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log(
                                    "Connect button clicked for:",
                                    tool.name
                                  );
                                  handleToolConnect(tool, e);
                                }}
                                disabled={isConnecting}
                                title="Click to connect"
                                style={{
                                  cursor: "pointer",
                                  pointerEvents: "auto",
                                }}
                              >
                                <FaPlus /> Connect
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="tool-actions">
                        <span className="toolkit-status-badge ready">
                          <FaExternalLinkAlt /> Ready to Use
                        </span>
                      </div>
                    )}
                  </div>
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
