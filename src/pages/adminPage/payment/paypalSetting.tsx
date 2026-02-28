import React, { useState, useEffect } from "react";
import { FiKey, FiSave, FiShield, FiInfo } from "react-icons/fi";
import ShortLink from "../../../common/ShortLinkDashboard";
import axiosInstance from "../../../utils/baseUrl";
import "../../../assets/css/adminDashboard/apiSettingPages/deepSeckPage.css";
import { toast } from "react-toastify";
import adminImage from "../../../assets/image/admin/allImage";

const PayPalSetting: React.FC = () => {
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalClientSecret, setPaypalClientSecret] = useState("");
  const [paypalWebhookId, setPaypalWebhookId] = useState("");
  const [paypalMode, setPaypalMode] = useState("sandbox");
  const [successRedirectUrl, setSuccessRedirectUrl] = useState("");
  const [cancelRedirectUrl, setCancelRedirectUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showWebhookId, setShowWebhookId] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch existing PayPal configuration on component mount
  useEffect(() => {
    fetchPayPalConfig();
  }, []);

  const fetchPayPalConfig = async () => {
    const keyword = "paypal";
    try {
      setIsFetching(true);
      const res = await axiosInstance.get(
        `/payments/admin/payment-config/${keyword}`
      );

      if (res.status === 200 && res.data.success) {
        const config = res.data.data.gatewayConfig;
        const commonUrl = res.data.data.commonConfig;
        setPaypalClientId(config.paypalClientId || "");
        setPaypalClientSecret(config.paypalClientSecret || "");
        setPaypalWebhookId(config.paypalWebhookId || "");
        setPaypalMode(config.paypalMode || "sandbox");
        setSuccessRedirectUrl(commonUrl.successRedirectUrl || "");
        setCancelRedirectUrl(commonUrl.cancelRedirectUrl || "");
        setIsActive(config.isActive || false);
      }
    } catch (error: any) {
      // If 404, means no configuration exists yet - this is fine
      if (error.response && error.response.status === 404) {
        console.log("No PayPal configuration found, using defaults");
      } else {
        console.error("Fetch PayPal Config Error:", error);
        toast.error("Failed to load PayPal configuration");
      }
    } finally {
      setIsFetching(false);
    }
  };

  const updateApiStatus = async (newStatus: boolean) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post(
        "/payments/admin/update-api-status-paypal",
        {
          isActive: newStatus,
          keyword: "paypal",
        }
      );

      if (res.status === 200 || res.status === 201) {
        setIsActive(newStatus);
        toast.success("PayPal status updated successfully");
      } else {
        toast.error("Failed to update PayPal status.");
        setIsActive(!newStatus);
      }
    } catch (error: any) {
      console.error("PayPal status update error:", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.message
      ) {
        toast.error(error.response.data.message);
      } else if (error.response && error.response.status === 404) {
        toast.error(
          "Please save PayPal configuration first before activating."
        );
        setIsActive(!newStatus);
      } else {
        toast.error("Something went wrong while updating PayPal status.");
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

  const submitPayPalConfig = async () => {
    try {
      if (!paypalClientId.trim() || !paypalClientSecret.trim()) {
        toast.error("Please enter both PayPal Client ID and Client Secret.");
        return;
      }

      setIsLoading(true);
      const res = await axiosInstance.post(
        "/payments/admin/create-paypal-config",
        {
          paypalClientId,
          paypalClientSecret,
          paypalWebhookId,
          paypalMode,
          successRedirectUrl,
          cancelRedirectUrl,
          isActive,
          keyword: "paypal",
        }
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("PayPal configuration saved successfully.");
      } else {
        toast.error("Failed to save PayPal configuration.");
      }
    } catch (error: any) {
      console.error("PayPal save error:", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          "Something went wrong while saving your PayPal configuration."
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
        <div className="global-link-limit-section">
          <div className="short-link-text">
            <ShortLink />
          </div>
        </div>

        {/* Main Settings Section */}
        <div className="row">
          <div className="col-md-12 col-lg-12 mx-auto">
            <div className="deepSeek-api-setting-card">
              {/* Header Section */}
              <div className="deepSeek-api-setting-header">
                <div className="deepSeek-api-setting-header-icon">
                  <img src={adminImage.paypal}></img>
                </div>
                <h2 className="deepSeek-api-setting-title">
                  PayPal Payment Configuration
                </h2>
                <p className="deepSeek-api-setting-description">
                  Connect your PayPal account to process payments securely. Your
                  API credentials are encrypted and stored securely.
                </p>
              </div>

              {/* Security Notice */}
              <div className="deepSeek-api-setting-security-notice">
                <FiShield className="deepSeek-api-setting-security-icon" />
                <span>
                  Your PayPal credentials are encrypted and stored securely
                </span>
              </div>

              {/* Two Column Layout for Input Fields */}
              <div className="row">
                <div className="col-md-12">
                  <div className="deepSeek-api-setting-input-section">
                    <label className="deepSeek-api-setting-input-label">
                      <FiShield className="deepSeek-api-setting-label-icon" />
                      PayPal Status
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
                {/* Left Column */}
                <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6">
                  <div className="deepSeek-api-setting-input-section">
                    <label className="deepSeek-api-setting-input-label">
                      <FiKey className="deepSeek-api-setting-label-icon" />
                      PayPal Client ID
                      <span className="deepSeek-api-setting-required-asterisk">
                        *
                      </span>
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <div className="deepSeek-api-setting-input-wrapper">
                        <input
                          type="text"
                          value={paypalClientId}
                          onChange={(e) => setPaypalClientId(e.target.value)}
                          placeholder="Enter PayPal Client ID"
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
                      PayPal Secret Key
                      <span className="deepSeek-api-setting-required-asterisk">
                        *
                      </span>
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <div className="deepSeek-api-setting-input-wrapper">
                        <input
                          type={showClientSecret ? "text" : "password"}
                          value={paypalClientSecret}
                          onChange={(e) =>
                            setPaypalClientSecret(e.target.value)
                          }
                          placeholder="Enter PayPal Secret Key"
                          className="deepSeek-api-setting-input"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="deepSeek-api-setting-toggle-visibility-btn"
                          onClick={() => setShowClientSecret(!showClientSecret)}
                          disabled={isLoading}
                        >
                          {showClientSecret ? "👁️" : "🙈"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6">
                  <div className="deepSeek-api-setting-input-section">
                    <label className="deepSeek-api-setting-input-label">
                      <FiKey className="deepSeek-api-setting-label-icon" />
                      PayPal Webhook ID
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <div className="deepSeek-api-setting-input-wrapper">
                        <input
                          type={showWebhookId ? "text" : "password"}
                          value={paypalWebhookId}
                          onChange={(e) => setPaypalWebhookId(e.target.value)}
                          placeholder="Enter PayPal Webhook ID"
                          className="deepSeek-api-setting-input"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="deepSeek-api-setting-toggle-visibility-btn"
                          onClick={() => setShowWebhookId(!showWebhookId)}
                          disabled={isLoading}
                        >
                          {showWebhookId ? "👁️" : "🙈"}
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
                      PayPal Mode
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <select
                        value={paypalMode}
                        onChange={(e) => setPaypalMode(e.target.value)}
                        className="deepSeek-api-setting-input"
                        disabled={isLoading}
                      >
                        <option value="sandbox">Sandbox Mode</option>
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
          </div>
          {/* Help Text */}
          <div className="deepSeek-api-setting-help-text">
            <FiInfo className="deepSeek-api-setting-info-icon" />
            <span>
              Get your credentials from the{" "}
              <a
                href="https://developer.paypal.com/developer/applications/"
                target="_blank"
                rel="noopener noreferrer"
                className="deepSeek-api-setting-help-link"
              >
                PayPal Developer Console
              </a>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="deepSeek-api-setting-action-section">
            <button
              className="deepSeek-api-setting-save-btn"
              onClick={submitPayPalConfig}
              disabled={
                isLoading ||
                !paypalClientId.trim() ||
                !paypalClientSecret.trim()
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

          {/* Features Preview */}
          <div className="deepSeek-api-setting-features-preview">
            <h3 className="deepSeek-api-setting-features-title">
              What you'll unlock:
            </h3>
            <div className="deepSeek-api-setting-features-grid">
              <div className="deepSeek-api-setting-feature-item">
                <span className="deepSeek-api-setting-feature-icon">💰</span>
                <span className="deepSeek-api-setting-feature-text">
                  Secure PayPal Payments
                </span>
              </div>
              <div className="deepSeek-api-setting-feature-item">
                <span className="deepSeek-api-setting-feature-icon">🔐</span>
                <span className="deepSeek-api-setting-feature-text">
                  Buyer Protection
                </span>
              </div>
              <div className="deepSeek-api-setting-feature-item">
                <span className="deepSeek-api-setting-feature-icon">🌐</span>
                <span className="deepSeek-api-setting-feature-text">
                  Global Payment Gateway
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPalSetting;
