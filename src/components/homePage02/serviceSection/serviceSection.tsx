import {
  FiSearch,
  FiImage,
  FiMessageSquare,
  FiCode,
  FiMic,
  FiVideo,
  FiGlobe,
  FiLayers,
} from "react-icons/fi";

const ServiceSection = () => {
  const serviceCards = [
    {
      icon: <FiSearch />,
      title: "Product Analyser",
      description:
        "Generate title, short description, long description, and attributes from product images.",
    },
    {
      icon: <FiImage />,
      title: "Image Generation",
      description:
        "Create product visuals and marketing creatives for listings and campaigns.",
    },
    {
      icon: <FiMessageSquare />,
      title: "AI Assistant",
      description:
        "Draft and refine content quickly with guided AI workflows.",
    },
    {
      icon: <FiCode />,
      title: "Code Generator",
      description:
        "Generate snippets and implementation helpers for technical tasks.",
    },
    {
      icon: <FiMic />,
      title: "Speech and Voice",
      description:
        "Convert speech to text and generate voiceovers for product content.",
    },
    {
      icon: <FiVideo />,
      title: "Video to Text",
      description:
        "Extract text and insights from videos for faster content creation.",
    },
    {
      icon: <FiGlobe />,
      title: "Web and Data Tools",
      description:
        "Use scraping and analyzer tools to enrich product content with context.",
    },
    {
      icon: <FiLayers />,
      title: "Platform Connect",
      description:
        "Push generated content to connected platforms with fewer manual steps.",
    },
  ];

  return (
    <section className="home-02-service-card-section">
      <div className="container">
        <div className="homepage-02-ai-mcp-widget-banner">
          <div className="homepage-02-widget-banner-content">
            <div className="homepage-02-widget-banner-left">
              <div className="homepage-02-widget-badge">
                <span className="homepage-02-badge-text">NEW RELEASE</span>
              </div>
              <h2 className="homepage-02-widget-title">Universal AI MCP Widget</h2>
              <p className="homepage-02-widget-subtitle">
                Real-time AI widget for product data, documents, and business knowledge.
                Works across modern web platforms and CMS workflows.
              </p>

              <div className="homepage-02-widget-features">
                <div className="homepage-02-feature-item">
                  <div className="homepage-02-feature-icon">01</div>
                  <div className="homepage-02-feature-text">
                    <strong>Universal Compatibility</strong>
                    <span>Supports major website and ecommerce environments.</span>
                  </div>
                </div>
                <div className="homepage-02-feature-item">
                  <div className="homepage-02-feature-icon">02</div>
                  <div className="homepage-02-feature-text">
                    <strong>Real-time Data Processing</strong>
                    <span>Works with structured and document-based data sources.</span>
                  </div>
                </div>
                <div className="homepage-02-feature-item">
                  <div className="homepage-02-feature-icon">03</div>
                  <div className="homepage-02-feature-text">
                    <strong>Quick Installation</strong>
                    <span>Deploy in minutes with minimal setup effort.</span>
                  </div>
                </div>
              </div>

              <div className="homepage-02-widget-cta">
                <button className="homepage-02-btn-primary-widget">Get Universal Widget</button>
                <button className="homepage-02-btn-secondary-widget">WordPress Plugin</button>
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
                    <div className="widget-title-bar">AI MCP Widget</div>
                  </div>
                  <div className="home-02-widget-body">
                    <div className="chat-message ai-message">
                      <div className="home-02-message-avatar">AI</div>
                      <div className="home-02-message-content">
                        Ask for product insights, descriptions, and structured output.
                      </div>
                    </div>
                    <div className="chat-message home-02-user-message">
                      <div className="home-02-message-content">
                        Analyze this catalog image and generate listing content.
                      </div>
                      <div className="home-02-message-avatar">You</div>
                    </div>
                    <div className="chat-message ai-message">
                      <div className="home-02-message-avatar">AI</div>
                      <div className="home-02-message-content">
                        Done. Title, short description, long description, and attributes are ready.
                      </div>
                    </div>
                    <div className="home-02-typing-indicator">
                      <div className="home-02-message-avatar">AI</div>
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
