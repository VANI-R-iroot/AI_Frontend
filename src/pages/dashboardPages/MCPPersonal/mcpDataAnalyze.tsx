import React, { useEffect, useState } from "react";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { useUserStore } from "../../../zustand/userDetailsStore";
import "../../../assets/css/userDashboard/mcp/mcp-personal-data-analyge-page.css";
import { apiConfig } from "../../../utils/apiConfig";

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

const MCPClientStatus = () => {
  const userData = useUserStore((state) => state.userData);
  const [status, setStatus] = useState("loading");
  const [client, setClient] = useState<MCPClient | null>(null);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const MCP_SERVER_URL = `${apiConfig.mcpApi}/mcpDoc`;

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
        console.log("✅ Connected to MCP");
      } catch (err) {
        console.error("❌ MCP connection failed:", err);
        setStatus("error");
      }
    }

    connectToServer();
  }, []);

  const sendMessage = async () => {
    if (!client || !message.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      const result = await client.callTool({
        name: "fileReader",
        arguments: {
          message: message.trim(),
          userId: userData._id,
        },
      });

      if (
        result &&
        result.content &&
        Array.isArray(result.content) &&
        result.content.length > 0
      ) {
        const responseText = result.content
          .filter((item) => item.type === "text")
          .map((item) => item.text)
          .join("\n\n");

        setResponse(responseText || "No text response received");
      } else {
        setResponse("No response received");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setResponse(
        "Error: " + (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "🟢 MCP Server Connected & Ready";
      case "loading":
        return "🟡 Establishing MCP Connection...";
      case "error":
        return "🔴 MCP Connection Failed";
      default:
        return "⚪ Unknown Status";
    }
  };

  return (
    <div className="mcp-container">
      <div className="mcp-wrapper">
        {/* Header Section */}
        <div className="mcp-header">
          <h1 className="mcp-title">Universal Data Analyzer</h1>
          <p className="mcp-subtitle">
            (MCP) Revolutionary protocol enabling seamless connection to any
            data source. No complex integrations - just pure analysis power!
          </p>


          <div className="mcp-features-highlight">
            <div className="mcp-feature-badge">
              <span>🚀</span> Multi-Source Support
            </div>
            <div className="mcp-feature-badge">
              <span>🔗</span> MCP Protocol
            </div>
            <div className="mcp-feature-badge">
              <span>⚡</span> Real-time Analysis
            </div>
            <div className="mcp-feature-badge">
              <span>🎯</span> 95%+ Accuracy
            </div>
          </div>
          {/* Connection Status */}
          <div className="mcp-status">
            <div className="mcp-status-indicator">
              <div className={` ${status}`}></div>
              <span>{getStatusText()}</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="mcp-card">
          {status === "connected" && (
            <>
              {/* Message Input */}
              <div className="mcp-input-section">
                <label className="mcp-input-label">
                  💬 What would you like to analyze? Ask anything about your
                  data!
                </label>
                <textarea
                  className="mcp-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Examples:
                  • Analyze sales trends from Excel file
                  • Extract insights from customer database
                  • Summarize data from multiple sources
                  • Generate reports from API data"
                />
                <div className="mcp-input-controls">
                  <p className="mcp-input-hint">
                    Press Enter to send • Shift+Enter for new line
                  </p>
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || isLoading}
                    className="mcp-send-button"
                  >
                    {isLoading ? (
                      <>
                        <div className="mcp-loading-spinner"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        Analyze Data
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Response Section */}
              {(response || isLoading) && (
                <div className="mcp-response-section">
                  <h3 className="mcp-response-title">
                    <span>📊</span>
                    Analysis Results
                  </h3>
                  <div className="mcp-response-container">
                    {isLoading ? (
                      <div className="mcp-response-loading">
                        <div className="mcp-response-loading-content">
                          <div className="mcp-response-loading-spinner"></div>
                          <p className="mcp-response-loading-text">
                            Analyzing your data...
                          </p>
                          <p className="mcp-response-loading-subtext">
                            This may take a few moments
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mcp-response-text">{response}</div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {status === "error" && (
            <div className="mcp-error-state">
              <div className="mcp-error-icon">❌</div>
              <h3 className="mcp-error-title">Connection Failed</h3>
              <p className="mcp-error-description">
                Unable to connect to the MCP server. Please check if the server
                is running.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mcp-retry-button"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mcp-footer">
          <p>
            Powered by Model Context Protocol (MCP) • Enterprise-grade AI
            Analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default MCPClientStatus;
