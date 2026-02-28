import AllImage from "../../../assets/image/Home-02/AllIamge";
import { TbServer2 } from "react-icons/tb";

const ServiceSection = () => {
  const serviceCards = [
    {
      icon: <TbServer2 />,
      title: "Personal MCP Server",
      description:
        "Lets users quickly find answers to their questions without having to search through multiple sources.",
    },
    {
      icon: AllImage.AudioIcon,
      title: "Edit Audio Generator",
      description:
        "Lets users quickly find answers to their questions without having to search through multiple sources.",
    },
    {
      icon: AllImage.ImageIcon,
      title: "AI Image Generator",
      description:
        "Lets users quickly find answers to their questions without having to search through multiple sources.",
    },
    {
      icon: AllImage.VoiceIcon,
      title: "AI Audio Generator",
      description:
        "Lets users quickly find answers to their questions without having to search through multiple sources.",
    },
    {
      icon: AllImage.CodeIcon,
      title: "AI Code Generator",
      description:
        "Lets users quickly find answers to their questions without having to search through multiple sources.",
    },

    {
      icon: AllImage.TextIcon,
      title: "Plagiarism  Checker",
      description:
        "Lets users quickly find answers to their questions without having to search through multiple sources.",
    },
    {
      icon: AllImage.ContentDetectIcon,
      title: "grammar checker",
      description:
        "Lets users quickly find answers to their questions without having to search through multiple sources.",
    },
    {
      icon: AllImage.VideoIcon,
      title: "AI Video Generator",
      description:
        "Lets users quickly find answers to their questions without having to search through multiple sources.",
    },
  ];

  return (
    <section className="home-02-service-card-section">
      <div className="container">
        {/* AI MCP Widget Banner Section */}
        <div className="homepage-02-ai-mcp-widget-banner">
          <div className="homepage-02-widget-banner-content">
            <div className="homepage-02-widget-banner-left">
              <div className="homepage-02-widget-badge">
                <span className="homepage-02-badge-text">🚀 NEW RELEASE</span>
              </div>
              <h2 className="homepage-02-widget-title">
                Universal AI MCP Widget
              </h2>
              <p className="homepage-02-widget-subtitle">
                Revolutionary real-time AI widget that works with any platform -
                WordPress, Shopify, Wix, Laravel, PHP, JavaScript, .NET & more
              </p>

              <div className="homepage-02-widget-features">
                <div className="homepage-02-feature-item">
                  <div className="homepage-02-feature-icon">🌐</div>
                  <div className="homepage-02-feature-text">
                    <strong>Universal Compatibility</strong>
                    <span>
                      Works with WordPress, Shopify, Wix, Laravel, PHP,
                      JavaScript, .NET
                    </span>
                  </div>
                </div>
                <div className="homepage-02-feature-item">
                  <div className="homepage-02-feature-icon">📊</div>
                  <div className="homepage-02-feature-text">
                    <strong>Real-time Data Processing</strong>
                    <span>Reads Excel, Google Docs & databases instantly</span>
                  </div>
                </div>
                <div className="homepage-02-feature-item">
                  <div className="homepage-02-feature-icon">⚡</div>
                  <div className="homepage-02-feature-text">
                    <strong>One-Click Installation</strong>
                    <span>Install on any website in seconds</span>
                  </div>
                </div>
                <div className="homepage-02-feature-item">
                  <div className="homepage-02-feature-icon">🎯</div>
                  <div className="homepage-02-feature-text">
                    <strong>95% Accuracy</strong>
                    <span>Intelligent responses from your documents</span>
                  </div>
                </div>
                <div className="homepage-02-feature-item">
                  <div className="homepage-02-feature-icon">🔧</div>
                  <div className="homepage-02-feature-text">
                    <strong>WordPress Plugin Available</strong>
                    <span>Special WordPress plugin for easy integration</span>
                  </div>
                </div>
              </div>

              <div className="homepage-02-widget-cta">
                <button className="homepage-02-btn-primary-widget">
                  Get Universal Widget
                </button>
                <button className="homepage-02-btn-secondary-widget">
                  WordPress Plugin
                </button>
              </div>
            </div>
            <div className="home-02-hero-right">
              <div className="widget-showcase">
                <div className="home-02-widget-mockup">
                  <div className="home-02-widget-header">
                    <div className="home-02-widget-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div className="widget-title-bar">AI MCP Widget Pro</div>
                  </div>
                  <div className="home-02-widget-body">
                    <div className="chat-message ai-message">
                      <div className="home-02-message-avatar">🤖</div>
                      <div className="home-02-message-content">
                        Hello! I can analyze your documents, Excel files, and
                        databases in real-time. How can I help you today?
                      </div>
                    </div>
                    <div className="chat-message home-02-user-message">
                      <div className="home-02-message-content">
                        Analyze my Q4 sales data and show trends
                      </div>
                      <div className="home-02-message-avatar">👤</div>
                    </div>
                    <div className="chat-message ai-message">
                      <div className="home-02-message-avatar">🤖</div>
                      <div className="home-02-message-content">
                        I've analyzed your Q4 sales data. Revenue increased by
                        23% compared to Q3, with the highest growth in mobile
                        devices (+35%). Would you like a detailed breakdown?
                      </div>
                    </div>
                    <div className="home-02-typing-indicator">
                      <div className="home-02-message-avatar">🤖</div>
                      <div className="home-02-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {serviceCards.map((card, index) => (
            <div
              key={index}
              className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 col-xxl-3"
            >
              <div className="home-02-service-card-content">
                <div className="home-02-icon-area">
                  {typeof card.icon === "string" ? (
                    <img src={card.icon} alt={card.title} />
                  ) : (
                    card.icon
                  )}
                </div>

                <h2>{card.title}</h2>
                <p>{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
