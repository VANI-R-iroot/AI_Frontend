import React, { useRef, useState, useEffect } from "react";
import { FiUpload, FiDatabase } from "react-icons/fi";
import { SiGoogle, SiSlack, SiOpenai } from "react-icons/si";
import axiosInstance from "../../../utils/baseUrl";
import { useUserStore } from "../../../zustand/userDetailsStore";
import { toast } from "react-toastify";

type ConnectionType = "google" | "database" | "slack" | "ai";

interface DatabaseConfig {
  host: string;
  port: string;
  database: string;
  username: string;
}

interface FormData {
  googleServiceAccount: string;
  databaseConfig: DatabaseConfig;
  slackToken: string;
  aiApiKey: string;
}

interface Connections {
  google: boolean;
  database: boolean;
  slack: boolean;
  ai: boolean;
}

interface MCPContentProps {
  activeTab: ConnectionType;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setConnections: React.Dispatch<React.SetStateAction<Connections>>;
  testConnection: (type: ConnectionType) => void;
  editMode: ConnectionType | null;
  setEditMode: React.Dispatch<React.SetStateAction<ConnectionType | null>>;
  serverActiveAccount: any;
}

interface UserData {
  _id: string;
}

const MCPContent: React.FC<MCPContentProps> = ({
  activeTab,
  formData,
  setFormData,
  setConnections,
  editMode,
  setEditMode,
  serverActiveAccount,
}) => {
  const userData = useUserStore((state) => state.userData || {}) as UserData;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (editMode && serverActiveAccount) {
      loadExistingData(editMode);
    }
  }, [editMode, serverActiveAccount]);

  const loadExistingData = (configType: ConnectionType) => {
    if (!serverActiveAccount) return;

    switch (configType) {
      case "google":
        if (serverActiveAccount.googleServiceAccount) {
          setFormData((prev) => ({
            ...prev,
            googleServiceAccount: JSON.stringify(
              serverActiveAccount.googleServiceAccount,
              null,
              2
            ),
          }));
        }
        break;
      case "database":
        if (serverActiveAccount.databaseConfig) {
          setFormData((prev) => ({
            ...prev,
            databaseConfig: serverActiveAccount.databaseConfig,
          }));
        }
        break;
      case "slack":
        if (serverActiveAccount.slackToken) {
          setFormData((prev) => ({
            ...prev,
            slackToken: serverActiveAccount.slackToken,
          }));
        }
        break;
      case "ai":
        if (serverActiveAccount.aiApiKey) {
          setFormData((prev) => ({
            ...prev,
            aiApiKey: serverActiveAccount.aiApiKey,
          }));
        }
        break;
    }
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = userData?._id;
    if (!id) {
      alert("User ID not found");
      return;
    }

    setIsSubmitting(true);

    try {
      const serviceAccountData = JSON.parse(formData.googleServiceAccount);

      const payload = {
        id,
        googleServiceAccount: serviceAccountData,
      };

      const endpoint =
        editMode === "google"
          ? "/update-google-service-account"
          : "/google-service-account";
      const res = await axiosInstance.post(endpoint, payload);

      console.log("Google Service Account response:", res.data);

      setConnections((prev) => ({ ...prev, google: true }));
      toast.success(
        editMode === "google"
          ? "Google Service Account updated successfully!"
          : "Google Service Account configured successfully!"
      );

      setEditMode(null);
    } catch (error) {
      console.error("Google submission error:", error);

      toast.error("Failed to configure Google Service Account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDatabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = userData?._id;
    if (!id) {
      toast.error("User ID not found");

      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id,
        databaseConfig: formData.databaseConfig,
      };

      const endpoint =
        editMode === "database"
          ? "/update-database-config"
          : "/database-config";
      const res = await axiosInstance.post(endpoint, payload);

      console.log("Database config response:", res.data);

      setConnections((prev) => ({ ...prev, database: true }));

      toast.success(
        editMode === "database"
          ? "Database configuration updated successfully!"
          : "Database configuration saved successfully!"
      );

      setEditMode(null);
    } catch (error) {
      console.error("Database submission error:", error);

      toast.error("Failed to save database configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = userData?._id;
    if (!id) {
      toast.error("User ID not found");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id,
        slackToken: formData.slackToken,
      };

      const endpoint =
        editMode === "slack"
          ? "/update-slack-integration"
          : "/slack-integration";
      const res = await axiosInstance.post(endpoint, payload);

      console.log("Slack integration response:", res.data);

      setConnections((prev) => ({ ...prev, slack: true }));

      toast.success(
        editMode === "slack"
          ? "Slack integration updated successfully!"
          : "Slack integration configured successfully!"
      );

      setEditMode(null);
    } catch (error) {
      console.error("Slack submission error:", error);
      alert("Failed to configure Slack integration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = userData?._id;
    if (!id) {
      alert("User ID not found");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id,
        aiApiKey: formData.aiApiKey,
      };

      const endpoint =
        editMode === "ai" ? "/update-ai-service-config" : "/ai-service-config";
      const res = await axiosInstance.post(endpoint, payload);

      console.log("AI service response:", res.data);

      setConnections((prev) => ({ ...prev, ai: true }));
      toast.success(
        editMode === "ai"
          ? "AI service updated successfully!"
          : "AI service configured successfully!"
      );

      setEditMode(null);
    } catch (error) {
      console.error("AI submission error:", error);
      alert("Failed to configure AI service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          googleServiceAccount: result,
        }));
        setConnections((prev) => ({ ...prev, google: true }));
      };
      reader.readAsText(file);
    }
  };

  const handleInputChange = (
    section: ConnectionType | null,
    field: string,
    value: string
  ) => {
    if (section === "database") {
      setFormData((prev) => ({
        ...prev,
        databaseConfig: {
          ...prev.databaseConfig,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files[0]) {
      const event = {
        target: { files: [files[0]] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const cancelEdit = () => {
    setEditMode(null);
  };

  return (
    <div className="main-content">
      {activeTab === "google" && (
        <form onSubmit={handleGoogleSubmit}>
          <div className="content-header">
            <SiGoogle size={24} color="#667eea" />
            <h2 className="content-title">
              Google Service Account {editMode === "google" && "(Edit Mode)"}
            </h2>
          </div>

          <div
            className={`file-upload-area ${dragOver ? "dragover" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadAreaClick}
          >
            <FiUpload size={32} color="#a0aec0" className="upload-icon" />
            <p className="upload-text">
              Drop your Google Service Account JSON file here
            </p>
            <p className="upload-subtext">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="file-input"
            />
          </div>

          {formData.googleServiceAccount && (
            <div className="success-message">
              <p className="success-text">
                ✓ Service account file uploaded successfully
              </p>
            </div>
          )}

          <div className="button-group mt-3">
            <button
              type="submit"
              disabled={!formData.googleServiceAccount || isSubmitting}
              className={`btn ${
                formData.googleServiceAccount ? "btn-primary" : "btn-disabled"
              }`}
            >
              {isSubmitting
                ? "Saving..."
                : editMode === "google"
                ? "Update Configuration"
                : "Save Configuration"}
            </button>
            {editMode === "google" && (
              <button
                type="button"
                onClick={cancelEdit}
                className="btn btn-secondary ml-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {activeTab === "database" && (
        <form onSubmit={handleDatabaseSubmit}>
          <div className="content-header">
            <FiDatabase size={24} color="#667eea" />
            <h2 className="content-title">
              Database Configuration {editMode === "database" && "(Edit Mode)"}
            </h2>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Host</label>
              <input
                type="text"
                value={formData.databaseConfig.host}
                onChange={(e) =>
                  handleInputChange("database", "host", e.target.value)
                }
                placeholder="localhost"
                className="form-input"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Port</label>
              <input
                type="text"
                value={formData.databaseConfig.port}
                onChange={(e) =>
                  handleInputChange("database", "port", e.target.value)
                }
                placeholder="5432"
                className="form-input"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Database Name</label>
              <input
                type="text"
                value={formData.databaseConfig.database}
                onChange={(e) =>
                  handleInputChange("database", "database", e.target.value)
                }
                placeholder="mcp_data"
                className="form-input"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                value={formData.databaseConfig.username}
                onChange={(e) =>
                  handleInputChange("database", "username", e.target.value)
                }
                placeholder="admin"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="button-group mt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting
                ? "Saving..."
                : editMode === "database"
                ? "Update Database Config"
                : "Save Database Config"}
            </button>
            {editMode === "database" && (
              <button
                type="button"
                onClick={cancelEdit}
                className="btn btn-secondary ml-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {activeTab === "slack" && (
        <form onSubmit={handleSlackSubmit}>
          <div className="content-header">
            <SiSlack size={24} color="#667eea" />
            <h2 className="content-title">
              Slack Integration {editMode === "slack" && "(Edit Mode)"}
            </h2>
          </div>

          <div className="mb-3">
            <label className="form-label">Slack Bot Token</label>
            <input
              type="password"
              value={formData.slackToken}
              onChange={(e) =>
                handleInputChange(null, "slackToken", e.target.value)
              }
              placeholder="xoxb-your-slack-bot-token"
              className="form-input"
              required
            />
            <p className="help-text">
              Get your bot token from Slack App settings
            </p>
          </div>

          <div className="info-box">
            <h4 className="info-title">Required Slack Permissions:</h4>
            <ul className="info-list">
              <li>chat:write</li>
              <li>channels:read</li>
              <li>users:read</li>
            </ul>
          </div>

          <div className="button-group mt-3">
            <button
              type="submit"
              disabled={!formData.slackToken || isSubmitting}
              className={`btn ${
                formData.slackToken ? "btn-primary" : "btn-disabled"
              }`}
            >
              {isSubmitting
                ? "Saving..."
                : editMode === "slack"
                ? "Update Slack Config"
                : "Save Slack Config"}
            </button>
            {editMode === "slack" && (
              <button
                type="button"
                onClick={cancelEdit}
                className="btn btn-secondary ml-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {activeTab === "ai" && (
        <form onSubmit={handleAISubmit}>
          <div className="content-header">
            <SiOpenai size={24} color="#667eea" />
            <h2 className="content-title">
              AI Service Connection [ Personal & Optional ]{" "}
              {editMode === "ai" && "(Edit Mode)"}
            </h2>
          </div>

          <div className="mb-3">
            <label className="form-label">AI API Key</label>
            <input
              type="password"
              value={formData.aiApiKey}
              onChange={(e) =>
                handleInputChange(null, "aiApiKey", e.target.value)
              }
              placeholder="sk-your-ai-api-key"
              className="form-input"
              required
            />
            <p className="help-text">
              Enter your API key for AI service integration
            </p>
          </div>

          <div className="button-group mt-3">
            <button
              type="submit"
              disabled={!formData.aiApiKey || isSubmitting}
              className={`btn ${
                formData.aiApiKey ? "btn-primary" : "btn-disabled"
              }`}
            >
              {isSubmitting
                ? "Saving..."
                : editMode === "ai"
                ? "Update AI Config"
                : "Save AI Config"}
            </button>
            {editMode === "ai" && (
              <button
                type="button"
                onClick={cancelEdit}
                className="btn btn-secondary ml-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default MCPContent;
