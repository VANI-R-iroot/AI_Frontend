import { useState, useEffect } from "react";
import adminImage from "../../assets/image/admin/allImage";
import ShortLink from "../../common/ShortLinkDashboard";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/baseUrl";
import "../../assets/css/adminDashboard/apiSettingPages/deepSeckPage.css";
import { RiGeminiFill } from "react-icons/ri";
import PageLoader from "../../common/loader";

const ProjectSettingPages = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeProvider, setActiveProvider] = useState("");
  const [isActive, setIsActive] = useState(false);

  const navigate = useNavigate();

  const handleNavigate = (path: string, provider: string) => {
    navigate(path, {
      state: {
        isActive: activeProvider === provider && isActive,
        activeProvider: activeProvider,
      },
    });
  };

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await axiosInstance.get("/get-active-api-admin");
        const data = res.data;
        setActiveProvider(data.activeProvider || "");
        setIsActive(data.isActive || false);
      } catch (error) {
        console.error("Error fetching active provider:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActive();
  }, []);

  const getCardClass = (provider: string) => {
    const baseClass = "api-setting-admin__card";
    if (activeProvider === provider && isActive) {
      return `${baseClass} api-setting-admin__card--active api-setting-admin__card--${provider}`;
    }
    return `${baseClass} api-setting-admin__card--inactive`;
  };

  const renderBadge = (provider: string) => {
    if (activeProvider === provider && isActive) {
      return (
        <div className="api-setting-admin__badge">
          <span className="api-setting-admin__badge-text">Active</span>
          <div className="api-setting-admin__badge-pulse"></div>
        </div>
      );
    }
    return null;
  };

  const renderStatusIndicator = (provider: string) => {
    return (
      <div
        className={`api-setting-admin__status ${
          activeProvider === provider && isActive
            ? "api-setting-admin__status--active"
            : "api-setting-admin__status--inactive"
        }`}
      >
        <div className="api-setting-admin__status-dot"></div>
        <span className="api-setting-admin__status-text">
          {activeProvider === provider && isActive
            ? "Connected"
            : "Disconnected"}
        </span>
      </div>
    );
  };

  return (
    <div className="api-setting-admin">
      <div className="global-link-limit-section">
        <div className="short-link-text">
          <ShortLink />
        </div>
      </div>
      <div className="api-setting-admin__container">
        <PageLoader isLoading={isLoading} />
        <div className="api-setting-admin__hero">
          <div className="api-setting-admin__hero-content">
            <h1 className="api-setting-admin__title">
              <span className="api-setting-admin__title-main">AI Provider</span>
              <span className="api-setting-admin__title-accent">
                Configuration
              </span>
            </h1>
            <p className="api-setting-admin__subtitle">
              Manage and configure your AI service providers with
              enterprise-grade settings
            </p>
          </div>
        </div>

        <div className="api-setting-admin__grid">
          <div
            className="api-setting-admin__grid-item"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div
              className={getCardClass("openai")}
              onClick={() => handleNavigate("/openai-setting", "openai")}
            >
              <div className="api-setting-admin__card-glow api-setting-admin__card-glow--openai"></div>
              {renderBadge("openai")}

              <div className="api-setting-admin__card-header">
                <div className="api-setting-admin__card-icon">
                  <img src={adminImage.ChatGpt} alt="OpenAI" />
                  <div className="api-setting-admin__card-icon-glow"></div>
                </div>
                {renderStatusIndicator("openai")}
              </div>

              <div className="api-setting-admin__card-content">
                <h3 className="api-setting-admin__card-title">OpenAI GPT</h3>
                <p className="api-setting-admin__card-description">
                  Advanced language models including GPT-4 and GPT-3.5 with
                  cutting-edge AI capabilities
                </p>
                <div className="api-setting-admin__card-features">
                  <span className="api-setting-admin__feature-tag">
                    GPT-4.5
                  </span>
                  <span className="api-setting-admin__feature-tag">GPT-4o</span>

                  <span className="api-setting-admin__feature-tag">
                    DALL·E 3
                  </span>
                  <span className="api-setting-admin__feature-tag">
                    Whisper
                  </span>
                  <span className="api-setting-admin__feature-tag">More</span>
                </div>
              </div>

              <div className="api-setting-admin__card-footer">
                <span className="api-setting-admin__card-action">
                  Configure
                </span>
                <div className="api-setting-admin__card-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div
            className="api-setting-admin__grid-item"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div
              className={getCardClass("gemini")}
              onClick={() => handleNavigate("/meta-setting", "gemini")}
            >
              <div className="api-setting-admin__card-glow api-setting-admin__card-glow--gemini"></div>
              {renderBadge("gemini")}

              <div className="api-setting-admin__card-header">
                <div className="api-setting-admin__card-icon">
                  <RiGeminiFill />
                  <div className="api-setting-admin__card-icon-glow"></div>
                </div>
                {renderStatusIndicator("gemini")}
              </div>

              <div className="api-setting-admin__card-content">
                <h3 className="api-setting-admin__card-title">Google Gemini</h3>
                <p className="api-setting-admin__card-description">
                  Google's most capable AI model with multimodal understanding
                  and reasoning
                </p>
                <div className="api-setting-admin__card-features">
                  <span className="api-setting-admin__feature-tag">
                    Multimodal
                  </span>
                  <span className="api-setting-admin__feature-tag">
                    Reasoning
                  </span>
                  <span className="api-setting-admin__feature-tag">Vision</span>
                  <span className="api-setting-admin__feature-tag">More</span>
                </div>
              </div>

              <div className="api-setting-admin__card-footer">
                <span className="api-setting-admin__card-action">
                  Configure
                </span>
                <div className="api-setting-admin__card-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div
            className="api-setting-admin__grid-item"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <div
              className={getCardClass("deepseek")}
              onClick={() => handleNavigate("/deepSeek-setting", "deepseek")}
            >
              <div className="api-setting-admin__card-glow api-setting-admin__card-glow--deepseek"></div>
              {renderBadge("deepseek")}

              <div className="api-setting-admin__card-header">
                <div className="api-setting-admin__card-icon">
                  <img src={adminImage.DeepSick} alt="DeepSeek" />
                  <div className="api-setting-admin__card-icon-glow"></div>
                </div>
                {renderStatusIndicator("deepseek")}
              </div>

              <div className="api-setting-admin__card-content">
                <h3 className="api-setting-admin__card-title">DeepSeek AI</h3>
                <p className="api-setting-admin__card-description">
                  Next-generation AI with advanced reasoning and coding
                  capabilities
                </p>
                <div className="api-setting-admin__card-features">
                  <span className="api-setting-admin__feature-tag">Coding</span>
                  <span className="api-setting-admin__feature-tag">
                    Reasoning
                  </span>
                  <span className="api-setting-admin__feature-tag">
                    Analysis
                  </span>
                  <span className="api-setting-admin__feature-tag">More</span>
                </div>
              </div>

              <div className="api-setting-admin__card-footer">
                <span className="api-setting-admin__card-action">
                  Configure
                </span>
                <div className="api-setting-admin__card-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingPages;
