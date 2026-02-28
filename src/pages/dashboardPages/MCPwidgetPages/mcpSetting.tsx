import React, { useState, useEffect } from "react";
import { FiServer } from "react-icons/fi";
import MCPSidebar from "../../../components/userDashboard/mcp-server-setting/MCPSidebar";
import MCPContent from "../../../components/userDashboard/mcp-server-setting/MCPContent";
import "../../../assets/css/userDashboard/mcp/mcp-server-setting.css";
import axiosInstance from "../../../utils/baseUrl";
import { toast } from "react-toastify";

type ConnectionType = "google" | "database" | "slack" | "ai";

interface Connections {
  google: boolean;
  database: boolean;
  slack: boolean;
  ai: boolean;
}

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

interface ServerActiveAccount {
  googleServiceAccount?: string;
  databaseConfig?: DatabaseConfig;
  slackToken?: string;
  aiApiKey?: string;
}

const MCPServerSetup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConnectionType>("google");
  const [serverActiveAccount, setServerActiveAccount] =
    useState<ServerActiveAccount>();
  const [editMode, setEditMode] = useState<ConnectionType | null>(null);
  const [connections, setConnections] = useState<Connections>({
    google: false,
    database: false,
    slack: false,
    ai: false,
  });

  const [formData, setFormData] = useState<FormData>({
    googleServiceAccount: "",
    databaseConfig: {
      host: "",
      port: "",
      database: "",
      username: "",
    },
    slackToken: "",
    aiApiKey: "",
  });

  const testConnection = (type: ConnectionType): void => {
   
    setTimeout(() => {
      setConnections((prev) => ({ ...prev, [type]: true }));
    }, 1000);
  };

  const fetchActiveGoogleDocument = async (): Promise<void> => {
    try {
      const res = await axiosInstance.get(
        "/get-mcp-server-configuration-data"
      );

      if (res.status === 200) {
        const activeDocs: ServerActiveAccount = res.data.data;
        console.log(activeDocs);
        setServerActiveAccount(activeDocs);

        const newConnections: Connections = {
          google: !!activeDocs?.googleServiceAccount,
          database: !!activeDocs?.databaseConfig,
          slack: !!activeDocs?.slackToken,
          ai: !!activeDocs?.aiApiKey,
        };
        setConnections(newConnections);
      } else {
        toast.info("No configuration data found.");
      }
    } catch (error) {
      console.error("Error fetching configuration data:", error);
      toast.error("Failed to load configuration data.");
    }
  };

  const handleEdit = (configType: ConnectionType): void => {
    setEditMode(configType);
  };

  const handleDelete = async (configType: ConnectionType): Promise<void> => {
    try {
      const endpoints: Record<ConnectionType, string> = {
        google: "/delete-google-service-account",
        database: "/delete-database-config",
        slack: "/delete-slack-integration",
        ai: "/delete-ai-service-config",
      };

      const res = await axiosInstance.delete(endpoints[configType]);

      if (res.status === 200) {
        toast.success(`${configType} configuration deleted successfully!`);

        setConnections((prev) => ({ ...prev, [configType]: false }));

        if (configType === "google") {
          setFormData((prev) => ({ ...prev, googleServiceAccount: "" }));
        } else if (configType === "database") {
          setFormData((prev) => ({
            ...prev,
            databaseConfig: { host: "", port: "", database: "", username: "" },
          }));
        } else if (configType === "slack") {
          setFormData((prev) => ({ ...prev, slackToken: "" }));
        } else if (configType === "ai") {
          setFormData((prev) => ({ ...prev, aiApiKey: "" }));
        }

        fetchActiveGoogleDocument();
      }
    } catch (error) {
      console.error(`Error deleting ${configType} configuration:`, error);
      toast.error(`Failed to delete ${configType} configuration.`);
    }
  };

  useEffect(() => {
    fetchActiveGoogleDocument();
  }, []);

  return (
    <div className="main-content-common">
      <div className="mcp-server-setup">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <FiServer size={32} color="white" />
            <div>
              <h1 className="header-title">MCP Server Authentication Setup</h1>
              <p className="header-subtitle">
                Configure your Model Context Protocol server connections
              </p>
            </div>
          </div>
        </div>

        <div className="mcp-server-main-container">
          <div className="row">
            {/* Sidebar */}
            <div className="col-lg-4 col-md-6 mb-4 col-sm-6">
              <MCPSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                connections={connections}
                onEdit={handleEdit}
                onDelete={handleDelete}
                serverActiveAccount={serverActiveAccount}
              />
            </div>

            {/* Main Content */}
            <div className="col-lg-8 col-md-6 col-sm-6 mcp-server-main-content-right-side">
              <MCPContent
                activeTab={activeTab}
                formData={formData}
                setFormData={setFormData}
                setConnections={setConnections}
                testConnection={testConnection}
                editMode={editMode}
                setEditMode={setEditMode}
                serverActiveAccount={serverActiveAccount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPServerSetup;
