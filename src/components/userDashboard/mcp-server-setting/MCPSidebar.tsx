import React from "react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiDatabase,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { SiGoogle, SiSlack, SiOpenai } from "react-icons/si";

type ConnectionType = "google" | "database" | "slack" | "ai";
interface Connections {
  google: boolean;
  database: boolean;
  slack: boolean;
  ai: boolean;
}

interface ServerActiveAccount {
  googleServiceAccount?: string;
  databaseConfig?: {
    host: string;
    port: string;
    database: string;
    username: string;
  };
  slackToken?: string;
  aiApiKey?: string;
}

interface MCPSidebarProps {
  activeTab: ConnectionType;
  setActiveTab: (tab: ConnectionType) => void;
  connections: Connections;
  onEdit: (configType: ConnectionType) => void;
  onDelete: (configType: ConnectionType) => void;
  serverActiveAccount?: ServerActiveAccount;
}

const MCPSidebar: React.FC<MCPSidebarProps> = ({
  activeTab,
  setActiveTab,
  connections,
  onEdit,
  onDelete,
}) => {
  const tabs = [
    { id: "google" as const, label: "Google Service", icon: SiGoogle },
    { id: "database" as const, label: "Database", icon: FiDatabase },
    { id: "slack" as const, label: "Slack Integration", icon: SiSlack },
    { id: "ai" as const, label: "AI Connection", icon: SiOpenai },
  ];

  const handleEdit = (key: ConnectionType) => {
    setActiveTab(key);
    onEdit(key);
  };

  const handleDelete = (key: ConnectionType) => {
    const confirmMessage = `Are you sure you want to delete the ${key} configuration?`;
    if (window.confirm(confirmMessage)) {
      onDelete(key);
    }
  };

  return (
    <div className="mcp-server-setting-sidebar">
      <h3 className="sidebar-title">Configuration Steps</h3>

      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isConnected = connections[tab.id];

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-item ${isActive ? "active" : ""}`}
          >
            <Icon size={20} />
            <span>{tab.label}</span>
            {isConnected && (
              <FiCheckCircle size={16} color={isActive ? "white" : "#48bb78"} />
            )}
          </button>
        );
      })}

      <div className="connection-status">
        <h4 className="status-title">Connection Status</h4>
        {(Object.entries(connections) as [ConnectionType, boolean][]).map(
          ([key, status]) => (
            <div key={key} className="status-item">
              <div className="status-info">
                {status ? (
                  <FiCheckCircle size={16} color="#48bb78" />
                ) : (
                  <FiAlertCircle size={16} color="#ed8936" />
                )}
                <span className="status-text">
                  {key === "ai" ? "AI Service" : key}
                </span>
              </div>

              {status && (
                <div className="status-actions">
                  <button
                    onClick={() => handleEdit(key)}
                    className="action-btn edit-btn"
                    title={`Edit ${key} configuration`}
                  >
                    <FiEdit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(key)}
                    className="action-btn delete-btn"
                    title={`Delete ${key} configuration`}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MCPSidebar;
