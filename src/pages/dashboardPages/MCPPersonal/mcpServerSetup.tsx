import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiServer,
  FiFileText,
  FiInfo,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiEdit,
} from "react-icons/fi";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import "../../../assets/css/userDashboard/mcp/mcp-personal-page.css";
import axiosInstance from "../../../utils/baseUrl";
import { toast } from "react-toastify";
import { apiConfig } from "../../../utils/apiConfig";

type ToolType = {
  name: string;
  title?: string;
  description?: string;
  inputSchema: any;
  outputSchema?: any;
};

const McpServerSetup = () => {
  const [status, setStatus] = useState("loading");

  const [tools, setTools] = useState<ToolType[]>([]);
  const [googleDocIds, setGoogleDocIds] = useState<string[]>([]);
  const [newDocId, setNewDocId] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docActiveFIle, setDocActiveFIle] = useState([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

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

        setStatus("connected");

        try {
          const toolsList = await mcpClient.listTools();
          if (toolsList && toolsList.tools) {
            setTools(toolsList.tools);
          }
        } catch (error) {
          if (error instanceof Error) {
            console.log(
              "No tools available or error listing tools:",
              error.message
            );
          } else {
            console.log("Unknown error listing tools:", error);
          }
        }
      } catch (err) {
        console.error("❌ MCP connection failed:", err);
        setStatus("error");
      }
    }

    connectToServer();
  }, []);

  const addGoogleDocId = () => {
    if (newDocId.trim() && googleDocIds.length < 5) {
      setGoogleDocIds([...googleDocIds, newDocId.trim()]);
      setNewDocId("");
    }
  };

  const removeGoogleDocId = (index: number) => {
    setGoogleDocIds(googleDocIds.filter((_, i) => i !== index));
  };

  const fetchActiveGoogleDocument = async () => {
    try {
      const res = await axiosInstance.get("/get-google-personal-doc-id");

      if (res.status === 200 && res.data?.data?.length > 0) {
        const activeDocs = res.data.data[0].googleDocIds;
        setDocActiveFIle(activeDocs);
      } else {
        toast.info("No Google Doc IDs found.");
        setDocActiveFIle([]);
      }
    } catch (error) {
      console.error("Error fetching Google Doc IDs:", error);
      toast.error("Failed to load Google Doc IDs.");
    }
  };

  useEffect(() => {
    fetchActiveGoogleDocument();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!googleDocIds || googleDocIds.length === 0) {
      toast.error("Please add at least one Google Doc ID!");
      return;
    }

    if (googleDocIds.length > 5) {
      toast.error("Maximum 5 Google Doc IDs allowed!");
      return;
    }

    const invalidIds = googleDocIds.filter((id) => !isValidGoogleDocId(id));
    if (invalidIds.length > 0) {
      toast.error("Please ensure all Google Doc IDs are valid!");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = { googleDocIds: googleDocIds };
      const res = await axiosInstance.post("/google-personal-doc-id", payload);

      if (res.status === 200 || res.status === 201) {
        toast.success("Google Doc IDs submitted successfully!");
        fetchActiveGoogleDocument();
        setGoogleDocIds([]);
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } catch (error: any) {
      console.error("Error submitting Google Doc IDs:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditActiveDoc = (index: number) => {
    setEditingIndex(index);
    setEditingValue(docActiveFIle[index]);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleSaveEdit = async () => {
    if (!editingValue.trim() || !isValidGoogleDocId(editingValue)) {
      toast.error("Please enter a valid Google Doc ID!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        googleDocId: editingValue.trim(),
        index: editingIndex,
      };

      const res = await axiosInstance.put(
        "/update-google-personal-doc-id",
        payload
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("Document updated successfully!");
        const updatedDocs = [...docActiveFIle];
        setDocActiveFIle(updatedDocs);
        setEditingIndex(null);
        setEditingValue("");
      } else {
        toast.error("Failed to update document.");
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteActiveDoc = async (index: number) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        googleDocId: docActiveFIle[index],
        index: index,
      };

      const res = await axiosInstance.post(
        "/delete-google-personal-doc-id",
        payload
       
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("Document deleted successfully!");

        const updatedDocs = docActiveFIle.filter((_, i) => i !== index);
        setDocActiveFIle(updatedDocs);
      } else {
        toast.error("Failed to delete document.");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidGoogleDocId = (id: string) => {
    const googleDocRegex = /^[a-zA-Z0-9-_]{25,}$/;
    return googleDocRegex.test(id);
  };

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <FiCheck />;
      case "error":
        return <FiX />;
      default:
        return <FiServer />;
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case "connected":
        return "connected";
      case "error":
        return "error";
      default:
        return "loading";
    }
  };

  return (
    <div className="mcp-container">
      {/* Status Alert */}
      <div className={`status-alert ${getStatusClass()}`}>
        <div
          className={`status-icon ${
            status === "loading"
              ? "spinning"
              : status === "connected"
              ? "success"
              : "error"
          }`}
        >
          {getStatusIcon()}
        </div>
        <div>
          <h4 className="status-title">MCP Server Status</h4>
          <p className="status-text">
            Server is <strong>{status}</strong>
          </p>
        </div>
      </div>

      {/* Google Docs Management Card */}
      <div className="mcp-personal-glass-card">
        <div className="card-header">
          <div className="mcp-server-card-icon primary">
            <FiFileText />
          </div>
          <div>
            <h5 className="card-title">Google Documents</h5>
            <p className="card-subtitle">Manage your Google Doc IDs (Max: 5)</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="mcp-server-input-group">
              <div className="mcp-personal-mcp-server-input-wrapper">
                <input
                  type="text"
                  value={newDocId}
                  onChange={(e) => setNewDocId(e.target.value)}
                  placeholder="Enter Google Doc ID"
                  className="form-control"
                  onKeyPress={(e) => e.key === "Enter" && e.preventDefault()}
                  disabled={isSubmitting}
                />

                <div
                  className="tooltip-trigger"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <FiInfo />
                  <div className={`tooltip ${showTooltip ? "show" : ""}`}>
                    <div className="tooltip-title">Google Doc ID Demo:</div>
                    <div className="tooltip-code">
                      1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
                    </div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                      Found in the URL: docs.google.com/document/d/
                      <span style={{ color: "#4facfe" }}>YOUR_DOC_ID</span>/edit
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={addGoogleDocId}
                disabled={
                  !newDocId.trim() || googleDocIds.length >= 5 || isSubmitting
                }
                className="mcp-personal-mcp-server-btn mcp-btn-primary"
              >
                <FiPlus style={{ marginRight: "0.5rem" }} />
                Add
              </button>
            </div>

            {newDocId && !isValidGoogleDocId(newDocId) && (
              <div className="validation-message">
                <FiAlertCircle />
                <span>Please enter a valid Google Doc ID</span>
              </div>
            )}

            <div className="progress-indicator">
              {googleDocIds.length}/5 documents added
            </div>
          </div>

          {googleDocIds.length > 0 && (
            <div>
              <h6
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "1rem",
                  fontSize: "1rem",
                }}
              >
                Added Documents:
              </h6>
              <div className="mcp-doc-list">
                {googleDocIds.map((docId, index) => (
                  <div key={index} className="mcp-doc-item">
                    <div className="mcp-doc-info">
                      <div className="mcp-doc-icon">
                        <FiFileText />
                      </div>
                      <div className="mcp-doc-details">
                        <div className="mcp-doc-id">{docId}</div>
                        <div className="mcp-doc-label">
                          Document {index + 1}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGoogleDocId(index)}
                      className="btn btn-danger btn-sm"
                      disabled={isSubmitting}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {googleDocIds.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <button
                type="submit"
                disabled={isSubmitting || googleDocIds.length === 0}
                className="mcp-personal-mcp-server-btn mcp-btn-primary"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  fontSize: "1rem",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <div
                      style={{
                        display: "inline-block",
                        width: "16px",
                        height: "16px",
                        border: "2px solid #ffffff",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        marginRight: "0.5rem",
                      }}
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiCheck style={{ marginRight: "0.5rem" }} />
                    Submit Google Doc IDs ({googleDocIds.length})
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Active Documents with Edit/Delete */}
      {docActiveFIle.length > 0 && (
        <div className="mcp-personal-glass-card">
          <div className="card-header">
            <div className="mcp-server-card-icon info">
              <FiFileText />
            </div>
            <div>
              <h5 className="card-title">Active Documents</h5>
              <p className="card-subtitle">
                {docActiveFIle.length} documents connected
              </p>
            </div>
          </div>

          <div className="tools-grid">
            {docActiveFIle.map((docId, index) => (
              <div key={index} className="tool-item">
                {editingIndex === index ? (
                  <div>
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="form-control"
                      style={{ marginBottom: "0.5rem" }}
                      disabled={isSubmitting}
                    />
                    {editingValue && !isValidGoogleDocId(editingValue) && (
                      <div
                        className="validation-message"
                        style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}
                      >
                        <FiAlertCircle />
                        <span>Please enter a valid Google Doc ID</span>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={handleSaveEdit}
                        disabled={
                          isSubmitting ||
                          !editingValue.trim() ||
                          !isValidGoogleDocId(editingValue)
                        }
                        className="btn btn-success btn-sm"
                      >
                        <FiCheck />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        className="btn btn-secondary btn-sm"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h6 className="tool-name">Document {index + 1}</h6>
                    <p className="tool-description">{docId}</p>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() => handleEditActiveDoc(index)}
                        disabled={isSubmitting}
                        className="btn btn-info btn-sm"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteActiveDoc(index)}
                        disabled={isSubmitting}
                        className="btn btn-danger btn-sm"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tools Card */}
      {tools.length > 0 && (
        <div className="mcp-personal-glass-card">
          <div className="card-header">
            <div className="mcp-server-card-icon info">
              <FiServer />
            </div>
            <div>
              <h5 className="card-title">Available Tools</h5>
              <p className="card-subtitle">{tools.length} tools loaded</p>
            </div>
          </div>

          <div className="tools-grid">
            {tools.map((tool, index) => (
              <div key={index} className="tool-item">
                <h6 className="tool-name">{tool.title || tool.name}</h6>
                {tool.description && (
                  <p className="tool-description">{tool.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default McpServerSetup;
