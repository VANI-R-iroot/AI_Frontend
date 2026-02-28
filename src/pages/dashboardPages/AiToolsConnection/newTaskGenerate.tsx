import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/baseUrl";
import "../../../assets/css/userDashboard/toolkit.css";
import { IoAttachSharp } from "react-icons/io5";
import { useUserStore } from "../../../zustand/userDetailsStore";
import { useNavigate } from "react-router-dom";

interface Tool {
  slug: string;
  name: string;
  id: string;
  description?: string;
  toolkit?: Toolkit;
}

interface Toolkit {
  logo?: string;
  slug?: string;
}

interface UserData {
  _id: string;
}

const NewTaskGenerate: React.FC = () => {
  const userData = useUserStore((state) => state.userData || {}) as UserData;
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState<string>("");
  const [ableableData, setAbatableData] = useState<any>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeTools, setActiveTools] = useState<Tool[]>([]);
  const userId = userData._id;

  const fetchTools = async () => {
    try {
      const response = await axiosInstance.get("/get-connected-tools");

      if (response.data.success) {
        const allTools: Tool[] = response.data.data.items || [];

        const transformedTools = allTools.map((tool) => ({
          ...tool,
          toolkit: {
            logo: tool.toolkit?.logo || "🔧",
            slug: tool.toolkit?.slug || tool.slug,
          },
        }));

        setTools(transformedTools);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
    }
  };

  const checkConnectionStatus = async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/getActiveAllData/${userId}`);

      if (response.data.success) {
        console.log("Active Data:", response.data.data);
        setAbatableData(response.data.data?.authConfigs || []);
      }
    } catch (error: any) {
      console.error("Error checking connection status:", error);
    }
  };

  useEffect(() => {
    fetchTools();
    checkConnectionStatus(userId);
  }, []);

  useEffect(() => {
    if (tools.length > 0 && ableableData?.length > 0) {
      const activeToolsList = tools.filter((tool) => {
        const isActive = ableableData.some((config: any) => {
          const toolSlug = tool.toolkit?.slug?.toLowerCase();
          const toolkitName = config.toolkitName?.toLowerCase();
          const connectionStatus = config.connectionStatus?.toLowerCase();

          return toolkitName === toolSlug && connectionStatus === "active";
        });
        return isActive;
      });

      console.log("Active Tools List:", activeToolsList);
      setActiveTools(activeToolsList);
    }
  }, [tools, ableableData]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      // Navigate with state containing userId and message
      navigate("/generated-result", {
        state: {
          userId: userId,
          message: inputValue.trim(),
        },
      });
    }
  };

  return (
    <div className="build-today-container">
      <div className="build-today-wrapper">
        {/* Main Title */}
        <h1 className="build-today-title">Do Anything By AiProd</h1>
        <h1 className="build-today-title-description">
          With 500+ app in your chat
        </h1>

        {/* Input Section */}
        <div className="build-today-input-section">
          <div className="build-today-input-card">
            <div className="build-today-input-wrapper">
              <div className="build-today-textarea-container">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="What can Rocket build for you today?"
                  className="build-today-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="build-today-input-footer">
              <div className="build-today-button-group">
                <button className="build-today-attach-button">
                  <IoAttachSharp />
                </button>
                <div className="active-user-tools-icons">
                  {activeTools.length > 0 ? (
                    activeTools.map((tool, index) => (
                      <>
                        <div
                          key={`active-${tool.id}-${index}`}
                          className="active-tool-icon"
                          title={tool.toolkit?.slug || tool.name}
                        >
                          <img
                            src={tool.toolkit?.logo}
                            alt={tool.name}
                            className="active-icon-img"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const fallback =
                                target.nextElementSibling as HTMLElement;
                              if (fallback) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />
                        </div>
                      </>
                    ))
                  ) : (
                    <span className="no-active-tools">No active tools</span>
                  )}
                </div>
                <div className="active-fallback-icon">Connected</div>
              </div>

              <button
                onClick={handleSubmit}
                className="send-button build-today-send-button"
              >
                ➤
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="build-today-section">
            <h3 className="build-today-section-title">
              Integrations we support
            </h3>

            <div className="build-today-slider-container">
              <div className="build-today-slider-wrapper">
                <div className="build-today-slider">
                  {tools.map((tool, index) => (
                    <div
                      key={`${tool.name}-${index}`}
                      className="build-today-icon-card"
                    >
                      <div className="build-today-integration-icon-container">
                        <img
                          src={tool.toolkit?.logo}
                          alt={tool.name}
                          className="build-today-integration-icon"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const fallback =
                              target.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.style.display = "flex";
                            }
                          }}
                        />
                        <div className="build-today-fallback-icon">🔧</div>
                      </div>

                      {/* Tooltip */}
                      <div className="build-today-toolkit-tooltip">
                        {tool.toolkit?.slug || tool.slug}
                        <div className="build-today-tooltip-arrow"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTaskGenerate;
