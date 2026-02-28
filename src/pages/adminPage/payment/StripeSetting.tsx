import React, { useState, useEffect } from "react";
import { FiKey, FiSave, FiShield, FiInfo } from "react-icons/fi";
import ShortLink from "../../../common/ShortLinkDashboard";
import axiosInstance from "../../../utils/baseUrl";
import "../../../assets/css/adminDashboard/apiSettingPages/deepSeckPage.css";
import { toast } from "react-toastify";
import adminImage from "../../../assets/image/admin/allImage";

const StripeSetting: React.FC = () => {
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
  const [stripeMode, setStripeMode] = useState("sandbox");
  const [successRedirectUrl, setSuccessRedirectUrl] = useState("");
  const [cancelRedirectUrl, setCancelRedirectUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch existing Stripe configuration on component mount
  useEffect(() => {
    fetchStripeConfig();
  }, []);

  const fetchStripeConfig = async () => {
    const keyword = "stripe";
    try {
      setIsFetching(true);
      const res = await axiosInstance.get(
        `/payments/admin/payment-config/${keyword}`
      );

      if (res.status === 200 && res.data.success) {
        const config = res.data.data.gatewayConfig;
        const commonUrl = res.data.data.commonConfig;

        setStripePublicKey(config.stripePublicKey || "");
        setStripeSecretKey(config.stripeSecretKey || "");
        setStripeWebhookSecret(config.stripeWebhookSecret || "");
        setStripeMode(config.stripeMode || "sandbox");
        setSuccessRedirectUrl(commonUrl.successRedirectUrl || "");
        setCancelRedirectUrl(commonUrl.cancelRedirectUrl || "");
        setIsActive(config.isActive || false);
      }
    } catch (error: any) {
      // If 404, means no configuration exists yet - this is fine
      if (error.response && error.response.status === 404) {
        console.log("No Stripe configuration found, using defaults");
      } else {
        console.error("Fetch Stripe Config Error:", error);
        toast.error("Failed to load Stripe configuration");
      }
    } finally {
      setIsFetching(false);
    }
  };

  const updateApiStatus = async (newStatus: boolean) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post(
        "/payments/admin/update-api-status-stripe",
        {
          isActive: newStatus,
          keyword: "stripe",
        }
      );

      if (res.status === 200 || res.status === 201) {
        setIsActive(newStatus);
        toast.success("Stripe status updated successfully");
      } else {
        toast.error("Failed to update Stripe status.");
        setIsActive(!newStatus);
      }
    } catch (error: any) {
      console.error("Stripe status update error:", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.message
      ) {
        toast.error(error.response.data.message);
      } else if (error.response && error.response.status === 404) {
        toast.error(
          "Please save Stripe configuration first before activating."
        );
        setIsActive(!newStatus);
      } else {
        toast.error("Something went wrong while updating Stripe status.");
        setIsActive(!newStatus);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked;
    updateApiStatus(newStatus);
  };

  const submitStripeConfig = async () => {
    try {
      if (!stripePublicKey.trim() || !stripeSecretKey.trim()) {
        toast.error("Please enter both Stripe public and secret keys.");
        return;
      }

      setIsLoading(true);
      const res = await axiosInstance.post(
        "/payments/admin/create-stripe-config",
        {
          stripePublicKey,
          stripeSecretKey,
          stripeWebhookSecret,
          stripeMode,
          successRedirectUrl,
          cancelRedirectUrl,
          isActive,
          keyword: "stripe",
        }
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("Stripe configuration saved successfully.");
      } else {
        toast.error("Failed to save Stripe configuration.");
      }
    } catch (error: any) {
      console.error("Stripe save error:", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          "Something went wrong while saving your Stripe configuration."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching
  if (isFetching) {
    return (
      <div className="main-content-common">
        <div className="container">
          <div className="global-link-limit-section">
            <div className="short-link-text">
              <ShortLink />
            </div>
          </div>
          <div className="deepSeek-api-setting-wrapper">
            <div className="row">
              <div className="col-md-10 col-lg-8 mx-auto">
                <div className="deepSeek-api-setting-card">
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div className="deepSeek-api-setting-spinner"></div>
                    <p style={{ marginTop: "20px" }}>
                      Loading configuration...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content-common">
      <div className="container-fluid">
        {/* Short Link Section */}
        <div className="global-link-limit-section">
          <div className="short-link-text">
            <ShortLink />
          </div>
        </div>

        {/* Main Settings Section */}

        <div className="row">
          <div className="col-md-12 col-lg-12 mx-auto">
            <div className="deepSeek-api-setting-card">
              <div className="deepSeek-api-setting-header">
                <div className="deepSeek-api-setting-header-icon">
                  <img src={adminImage.stripe}></img>
                </div>
                <h2 className="deepSeek-api-setting-title">
                  Stripe Payment Configuration
                </h2>
                <p className="deepSeek-api-setting-description">
                  Connect your Stripe account to process payments securely. Your
                  API keys are encrypted and stored securely.
                </p>
              </div>

              <div className="deepSeek-api-setting-security-notice">
                <FiShield className="deepSeek-api-setting-security-icon" />
                <span>Your Stripe keys are encrypted and stored securely</span>
              </div>

              {/* Two Column Layout for Input Fields */}
              <div className="row">
                {/* Left Column */}
                <div className="col-md-12">
                  <div className="deepSeek-api-setting-input-section">
                    <label className="deepSeek-api-setting-input-label">
                      <FiShield className="deepSeek-api-setting-label-icon" />
                      Stripe Status
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <div className="project-setting-toggle">
                        <span
                          className={`project-setting-toggle-status ${
                            isActive ? "active" : "inactive"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                        <label
                          className={`project-setting-toggle-switch ${
                            isLoading ? "disabled" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={handleToggleChange}
                            disabled={isLoading}
                            className="project-setting-toggle-input"
                          />
                          <span
                            className={`project-setting-toggle-slider ${
                              isActive ? "active" : ""
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6">
                  <div className="deepSeek-api-setting-input-section">
                    <label className="deepSeek-api-setting-input-label">
                      <FiKey className="deepSeek-api-setting-label-icon" />
                      Stripe Publishable Key
                      <span className="deepSeek-api-setting-required-asterisk">
                        *
                      </span>
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <div className="deepSeek-api-setting-input-wrapper">
                        <input
                          type="text"
                          value={stripePublicKey}
                          onChange={(e) => setStripePublicKey(e.target.value)}
                          placeholder="pk_test_..."
                          className="deepSeek-api-setting-input"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                  </div>
                  <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6">
                  <div className="deepSeek-api-setting-input-section">
                    <label className="deepSeek-api-setting-input-label">
                      <FiKey className="deepSeek-api-setting-label-icon" />
                      Stripe Secret Key
                      <span className="deepSeek-api-setting-required-asterisk">
                        *
                      </span>
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <div className="deepSeek-api-setting-input-wrapper">
                        <input
                          type={showSecretKey ? "text" : "password"}
                          value={stripeSecretKey}
                          onChange={(e) => setStripeSecretKey(e.target.value)}
                          placeholder="sk_test_..."
                          className="deepSeek-api-setting-input"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="deepSeek-api-setting-toggle-visibility-btn"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          disabled={isLoading}
                        >
                          {showSecretKey ? "👁️" : "🙈"}
                        </button>
                      </div>
                    </div>
                  </div>
                  </div>
                  <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6">
                  <div className="deepSeek-api-setting-input-section">
                    <label className="deepSeek-api-setting-input-label">
                      <FiKey className="deepSeek-api-setting-label-icon" />
                      Stripe Webhook Secret
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <div className="deepSeek-api-setting-input-wrapper">
                        <input
                          type={showWebhookSecret ? "text" : "password"}
                          value={stripeWebhookSecret}
                          onChange={(e) =>
                            setStripeWebhookSecret(e.target.value)
                          }
                          placeholder="whsec_..."
                          className="deepSeek-api-setting-input"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="deepSeek-api-setting-toggle-visibility-btn"
                          onClick={() =>
                            setShowWebhookSecret(!showWebhookSecret)
                          }
                          disabled={isLoading}
                        >
                          {showWebhookSecret ? "👁️" : "🙈"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6">
                  <div className="deepSeek-api-setting-input-section">
                    <label className="deepSeek-api-setting-input-label">
                      <FiShield className="deepSeek-api-setting-label-icon" />
                      Stripe Mode
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <select
                        value={stripeMode}
                        onChange={(e) => setStripeMode(e.target.value)}
                        className="deepSeek-api-setting-input"
                        disabled={isLoading}
                      >
                        <option value="sandbox">Test Mode</option>
                        <option value="live">Live Mode</option>
                      </select>
                    </div>
                  </div>
                  </div>
                  <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6">
                  <div className="deepSeek-api-setting-input-section">
                    <label className="deepSeek-api-setting-input-label">
                      <FiInfo className="deepSeek-api-setting-label-icon" />
                      Success Redirect URL
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <input
                        type="url"
                        value={successRedirectUrl}
                        onChange={(e) => setSuccessRedirectUrl(e.target.value)}
                        placeholder="https://yoursite.com/success"
                        className="deepSeek-api-setting-input"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  </div>
                  <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6">
                  <div className="deepSeek-api-setting-input-section">
                    <label className="deepSeek-api-setting-input-label">
                      <FiInfo className="deepSeek-api-setting-label-icon" />
                      Cancel Redirect URL
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <input
                        type="url"
                        value={cancelRedirectUrl}
                        onChange={(e) => setCancelRedirectUrl(e.target.value)}
                        placeholder="https://yoursite.com/cancel"
                        className="deepSeek-api-setting-input"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  </div>
                </div>
              </div>

              <div className="deepSeek-api-setting-help-text mt-3">
                <FiInfo className="deepSeek-api-setting-info-icon" />
                <span>
                  Get your API keys from the{" "}
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="deepSeek-api-setting-help-link"
                  >
                    Stripe Dashboard
                  </a>
                </span>
              </div>

              <div className="deepSeek-api-setting-action-section ">
                <button
                  className="deepSeek-api-setting-save-btn"
                  onClick={submitStripeConfig}
                  disabled={
                    isLoading ||
                    !stripePublicKey.trim() ||
                    !stripeSecretKey.trim()
                  }
                >
                  {isLoading ? (
                    <>
                      <div className="deepSeek-api-setting-spinner"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="deepSeek-api-setting-btn-icon" />
                      <span>Save Configuration</span>
                    </>
                  )}
                </button>
              </div>

              <div className="deepSeek-api-setting-features-preview">
                <h3 className="deepSeek-api-setting-features-title">
                  What you'll unlock:
                </h3>
                <div className="deepSeek-api-setting-features-grid">
                  <div className="deepSeek-api-setting-feature-item">
                    <span className="deepSeek-api-setting-feature-icon">
                      💳
                    </span>
                    <span className="deepSeek-api-setting-feature-text">
                      Secure Payment Processing
                    </span>
                  </div>
                  <div className="deepSeek-api-setting-feature-item">
                    <span className="deepSeek-api-setting-feature-icon">
                      🔒
                    </span>
                    <span className="deepSeek-api-setting-feature-text">
                      PCI Compliant Transactions
                    </span>
                  </div>
                  <div className="deepSeek-api-setting-feature-item">
                    <span className="deepSeek-api-setting-feature-icon">
                      🌍
                    </span>
                    <span className="deepSeek-api-setting-feature-text">
                      Global Payment Support
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  );
};

export default StripeSetting;
