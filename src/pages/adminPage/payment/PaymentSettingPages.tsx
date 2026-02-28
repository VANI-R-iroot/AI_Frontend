import { useState, useEffect } from "react";
import adminImage from "../../../assets/image/admin/allImage";
import ShortLink from "../../../common/ShortLinkDashboard";
import { To, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/baseUrl";
import "../../../assets/css/adminDashboard/apiSettingPages/deepSeckPage.css";

const ProjectSettingPages = () => {
  const [activeProvider, setActiveProvider] = useState("");
  const [isActive, setIsActive] = useState(false);

  const navigate = useNavigate();

  const handleNavigate = (path: To, provider: string) => {
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
      }
    };
    fetchActive();
  }, []);

  const providers = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Configure Stripe payment processing and webhook settings",
      image: adminImage.stripe,
      path: "/stripe-setting",
      status: "Connect with Stripe to process payments securely",
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Manage PayPal integration and transaction settings",
      image: adminImage.paypal,
      path: "/paypal-setting",
      status: "Integrate PayPal for worldwide payment acceptance",
    },
    {
      id: "razorpay",
      name: "Razorpay",
      description: "Manage Razorpay integration and transaction settings",
      image: adminImage.Razorpay,
      path: "/razorpay-setting",
      status: "Integrate Razorpay for worldwide payment acceptance",
    },
    {
      id: "Paystack",
      name: "Paystack",
      description: "Manage Paystack integration and transaction settings",
      image: adminImage.Paystack,
      path: "/paystack-setting",
      status: "Integrate Paystack for worldwide payment acceptance",
    },
  ];

  return (
    <>
      <div className="main-content-common ">
        <div className="global-link-limit-section">
          <div className="short-link-text">
            <ShortLink />
          </div>
        </div>
        <div className="container-fluid">


          {/* Provider Cards */}
          <div className="payment-setting-admin__providers-section">
            <div className="payment-setting-admin__section-header">
              <h2 className="payment-setting-admin__section-title">
                Available Payment Gateways
              </h2>
              <p className="payment-setting-admin__section-subtitle">
                Choose and configure your preferred payment methods
              </p>
            </div>

            <div className="row">
              {providers.map((provider) => {
                const isCurrentActive =
                  activeProvider === provider.id && isActive;

                return (
                  <div key={provider.id} className="col-md-4">
                    <div
                      className={`payment-setting-admin__provider-card ${
                        isCurrentActive ? "active" : ""
                      }`}
                      onClick={() => handleNavigate(provider.path, provider.id)}
                    >
                      {/* Active Badge */}
                      {isCurrentActive && (
                        <div className="payment-setting-admin__active-badge">
                          <i className="fas fa-crown"></i>
                          <span>Active Gateway</span>
                        </div>
                      )}

                      {/* Card Header */}
                      <div className="payment-setting-admin__card-header">
                        <div className="payment-setting-admin__card-logo">
                          <img src={provider.image} alt={provider.name} />
                        </div>
                        <div className="payment-setting-admin__card-title-section">
                          <h3 className="payment-setting-admin__card-title">
                            {provider.name}
                          </h3>
                          <div className="payment-setting-admin__card-badges">
                            <span className="payment-setting-admin__badge secure">
                              Secure
                            </span>
                            <span className="payment-setting-admin__badge reliable">
                              Reliable
                            </span>
                          </div>
                        </div>
                        <div className="payment-setting-admin__card-arrow">
                          <i className="fas fa-chevron-right"></i>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="payment-setting-admin__card-body">
                        <p className="payment-setting-admin__card-description">
                          {provider.description}
                        </p>
                        <div className="payment-setting-admin__card-features">
                          <div className="payment-setting-admin__feature-item">
                            <i className="fas fa-shield-alt"></i>
                            <span>SSL Encrypted</span>
                          </div>
                          <div className="payment-setting-admin__feature-item">
                            <i className="fas fa-globe"></i>
                            <span>Global Coverage</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="payment-setting-admin__card-footer">
                        <div className="payment-setting-admin__card-status">
                          <i
                            className={`fas ${
                              isCurrentActive ? "fa-check-circle" : "fa-cog"
                            }`}
                          ></i>
                          <span>
                            {isCurrentActive
                              ? "Currently Active"
                              : "Click to Configure"}
                          </span>
                        </div>
                      </div>

                      {/* Hover Effect */}
                      <div className="payment-setting-admin__card-overlay"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectSettingPages;
