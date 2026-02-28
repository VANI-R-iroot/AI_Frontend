import React, { useState, useEffect } from "react";
import { FiKey, FiSave, FiShield, FiInfo } from "react-icons/fi";
import ShortLink from "../../../common/ShortLinkDashboard";
import adminImage from "../../../assets/image/admin/allImage";
import axiosInstance from "../../../utils/baseUrl";
import "../../../assets/css/adminDashboard/apiSettingPages/deepSeckPage.css";
import { toast } from "react-toastify";

const PaystackSetting: React.FC = () => {
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [paystackSecretKey, setPaystackSecretKey] = useState("");
  const [paystackWebhookSecret, setPaystackWebhookSecret] = useState("");
  const [paystackMode, setPaystackMode] = useState("sandbox");
  const [successRedirectUrl, setSuccessRedirectUrl] = useState("");
  const [cancelRedirectUrl, setCancelRedirectUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchPaystackConfig();
  }, []);

  const fetchPaystackConfig = async () => {
    const keyword = "paystack";
    try {
      setIsFetching(true);
      const res = await axiosInstance.get(
        `/payments/admin/payment-config/${keyword}`
      );

      if (res.status === 200 && res.data.success) {
        const config = res.data.data.gatewayConfig;
        const commonUrl = res.data.data.commonConfig;
        setPaystackPublicKey(config.paystackPublicKey || "");
        setPaystackSecretKey(config.paystackSecretKey || "");
        setPaystackWebhookSecret(config.paystackWebhookSecret || "");
        setPaystackMode(config.paystackMode || "sandbox");
        setSuccessRedirectUrl(commonUrl.successRedirectUrl || "");
        setCancelRedirectUrl(commonUrl.cancelRedirectUrl || "");
        setIsActive(config.isActive || false);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log("No Paystack configuration found, using defaults");
      } else {
        console.error("Fetch Paystack Config Error:", error);
        toast.error("Failed to load Paystack configuration");
      }
    } finally {
      setIsFetching(false);
    }
  };

  const updateApiStatus = async (newStatus: boolean) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post(
        "/payments/admin/update-api-status-paystack",
        {
          isActive: newStatus,
          keyword: "paystack",
        }
      );

      if (res.status === 200 || res.status === 201) {
        setIsActive(newStatus);
        toast.success("Paystack status updated successfully");
      } else {
        toast.error("Failed to update Paystack status.");
        setIsActive(!newStatus);
      }
    } catch (error: any) {
      console.error("Paystack status update error:", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.message
      ) {
        toast.error(error.response.data.message);
      } else if (error.response && error.response.status === 404) {
        toast.error(
          "Please save Paystack configuration first before activating."
        );
        setIsActive(!newStatus);
      } else {
        toast.error("Something went wrong while updating Paystack status.");
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

  const submitPaystackConfig = async () => {
    try {
      if (!paystackPublicKey.trim() || !paystackSecretKey.trim()) {
        toast.error("Please enter both Paystack Public Key and Secret Key.");
        return;
      }

      setIsLoading(true);
      const res = await axiosInstance.post(
        "/payments/admin/create-paystack-config",
        {
          paystackPublicKey,
          paystackSecretKey,
          paystackWebhookSecret,
          paystackMode,
          successRedirectUrl,
          cancelRedirectUrl,
          isActive,
          keyword: "paystack",
        }
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("Paystack configuration saved successfully.");
      } else {
        toast.error("Failed to save Paystack configuration.");
      }
    } catch (error: any) {
      console.error("Paystack save error:", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          "Something went wrong while saving your Paystack configuration."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="row">
          <div className="col-md-12 col-lg-12 mx-auto">
            <div className="deepSeek-api-setting-card">
              {/* Header Section */}
              <div className="deepSeek-api-setting-header">
                <div className="deepSeek-api-setting-header-icon">
                  <img src={adminImage.Paystack}></img>
                </div>
                <h2 className="deepSeek-api-setting-title">
                  Paystack Payment Configuration
                </h2>
                <p className="deepSeek-api-setting-description">
                  Connect your Paystack account to process payments securely.
                  Your API credentials are encrypted and stored securely.
                </p>
              </div>

              {/* Security Notice */}
              <div className="deepSeek-api-setting-security-notice">
                <FiShield className="deepSeek-api-setting-security-icon" />
                <span>
                  Your Paystack credentials are encrypted and stored securely
                </span>
              </div>

              {/* Two Column Layout for Input Fields */}
              <div className="row">
                <div className="col-md-12">
                  <div className="deepSeek-api-setting-input-section">
                    <label className="deepSeek-api-setting-input-label">
                      <FiShield className="deepSeek-api-setting-label-icon" />
                      Paystack Status
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
                      Paystack Public Key
                      <span className="deepSeek-api-setting-required-asterisk">
                        *
                      </span>
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <div className="deepSeek-api-setting-input-wrapper">
                        <input
                          type="text"
                          value={paystackPublicKey}
                          onChange={(e) => setPaystackPublicKey(e.target.value)}
                          placeholder="Enter Paystack Public Key"
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
                      Paystack Secret Key
                      <span className="deepSeek-api-setting-required-asterisk">
                        *
                      </span>
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <div className="deepSeek-api-setting-input-wrapper">
                        <input
                          type={showSecretKey ? "text" : "password"}
                          value={paystackSecretKey}
                          onChange={(e) => setPaystackSecretKey(e.target.value)}
                          placeholder="Enter Paystack Secret Key"
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
                      <FiShield className="deepSeek-api-setting-label-icon" />
                      Paystack Mode
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <select
                        value={paystackMode}
                        onChange={(e) => setPaystackMode(e.target.value)}
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

              {/* Help Text */}
              <div className="deepSeek-api-setting-help-text">
                <FiInfo className="deepSeek-api-setting-info-icon" />
                <span>
                  Get your credentials from the{" "}
                  <a
                    href="https://dashboard.paystack.com/#/settings/developers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="deepSeek-api-setting-help-link"
                  >
                    Paystack Dashboard
                  </a>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="deepSeek-api-setting-action-section">
                <button
                  className="deepSeek-api-setting-save-btn"
                  onClick={submitPaystackConfig}
                  disabled={
                    isLoading ||
                    !paystackPublicKey.trim() ||
                    !paystackSecretKey.trim()
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
                    <span className="deepSeek-api-setting-feature-icon">
                      💰
                    </span>
                    <span className="deepSeek-api-setting-feature-text">
                      Secure Paystack Payments
                    </span>
                  </div>
                  <div className="deepSeek-api-setting-feature-item">
                    <span className="deepSeek-api-setting-feature-icon">
                      🔐
                    </span>
                    <span className="deepSeek-api-setting-feature-text">
                      Card & Bank Payments
                    </span>
                  </div>
                  <div className="deepSeek-api-setting-feature-item">
                    <span className="deepSeek-api-setting-feature-icon">
                      🌍
                    </span>
                    <span className="deepSeek-api-setting-feature-text">
                      African Payment Gateway
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaystackSetting;
