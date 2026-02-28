import React, { useState, useEffect } from "react";
import { FiKey, FiSave, FiShield, FiInfo } from "react-icons/fi";
import ShortLink from "../../../common/ShortLinkDashboard";
import axiosInstance from "../../../utils/baseUrl";
import "../../../assets/css/adminDashboard/apiSettingPages/deepSeckPage.css";
import { toast } from "react-toastify";
import adminImage from "../../../assets/image/admin/allImage";

const RazorpaySetting: React.FC = () => {
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState("");
  const [razorpayMode, setRazorpayMode] = useState("sandbox");
  const [successRedirectUrl, setSuccessRedirectUrl] = useState("");
  const [cancelRedirectUrl, setCancelRedirectUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchRazorpayConfig();
  }, []);

  const fetchRazorpayConfig = async () => {
    const keyword = "razorpay";
    try {
      setIsFetching(true);
      const res = await axiosInstance.get(
        `/payments/admin/payment-config/${keyword}`
      );

      if (res.status === 200 && res.data.success) {
        const config = res.data.data.gatewayConfig;
        const commonUrl = res.data.data.commonConfig;

        setRazorpayKeyId(config.razorpayKeyId || "");
        setRazorpayKeySecret(config.razorpayKeySecret || "");
        setRazorpayWebhookSecret(config.razorpayWebhookSecret || "");
        setRazorpayMode(config.razorpayMode || "sandbox");
        setSuccessRedirectUrl(commonUrl.successRedirectUrl || "");
        setCancelRedirectUrl(commonUrl.cancelRedirectUrl || "");
        setIsActive(config.isActive || false);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log("No Razorpay configuration found, using defaults");
      } else {
        console.error("Fetch Razorpay Config Error:", error);
        toast.error("Failed to load Razorpay configuration");
      }
    } finally {
      setIsFetching(false);
    }
  };

  const updateApiStatus = async (newStatus: boolean) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post(
        "/payments/admin/update-api-razorpay",
        {
          isActive: newStatus,
          keyword: "razorpay",
        }
      );

      if (res.status === 200 || res.status === 201) {
        setIsActive(newStatus);
        toast.success("Razorpay status updated successfully");
      } else {
        toast.error("Failed to update Razorpay status.");
        setIsActive(!newStatus);
      }
    } catch (error: any) {
      console.error("Razorpay status update error:", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.message
      ) {
        toast.error(error.response.data.message);
      } else if (error.response && error.response.status === 404) {
        toast.error(
          "Please save Razorpay configuration first before activating."
        );
        setIsActive(!newStatus);
      } else {
        toast.error("Something went wrong while updating Razorpay status.");
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

  const submitRazorpayConfig = async () => {
    try {
      if (!razorpayKeyId.trim() || !razorpayKeySecret.trim()) {
        toast.error("Please enter both Razorpay Key ID and Key Secret.");
        return;
      }

      setIsLoading(true);
      const res = await axiosInstance.post(
        "/payments/admin/create-razorpay-config",
        {
          razorpayKeyId,
          razorpayKeySecret,
          razorpayWebhookSecret,
          razorpayMode,
          successRedirectUrl,
          cancelRedirectUrl,
          isActive,
          keyword: "razorpay",
        }
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("Razorpay configuration saved successfully.");
      } else {
        toast.error("Failed to save Razorpay configuration.");
      }
    } catch (error: any) {
      console.error("Razorpay save error:", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          "Something went wrong while saving your Razorpay configuration."
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
                  <img src={adminImage.Razorpay}></img>
                </div>
                <h2 className="deepSeek-api-setting-title">
                  Razorpay Payment Configuration
                </h2>
                <p className="deepSeek-api-setting-description">
                  Connect your Razorpay account to process payments securely.
                  Your API credentials are encrypted and stored securely.
                </p>
              </div>

              {/* Security Notice */}
              <div className="deepSeek-api-setting-security-notice">
                <FiShield className="deepSeek-api-setting-security-icon" />
                <span>
                  Your Razorpay credentials are encrypted and stored securely
                </span>
              </div>

              {/* Two Column Layout for Input Fields */}
              <div className="row">
                <div className="col-md-12">
                  <div className="deepSeek-api-setting-input-section">
                    <label className="deepSeek-api-setting-input-label">
                      <FiShield className="deepSeek-api-setting-label-icon" />
                      Razorpay Status
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
                      Razorpay Key ID
                      <span className="deepSeek-api-setting-required-asterisk">
                        *
                      </span>
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <div className="deepSeek-api-setting-input-wrapper">
                        <input
                          type="text"
                          value={razorpayKeyId}
                          onChange={(e) => setRazorpayKeyId(e.target.value)}
                          placeholder="Enter Razorpay Key ID"
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
                      Razorpay Key Secret
                      <span className="deepSeek-api-setting-required-asterisk">
                        *
                      </span>
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <div className="deepSeek-api-setting-input-wrapper">
                        <input
                          type={showKeySecret ? "text" : "password"}
                          value={razorpayKeySecret}
                          onChange={(e) => setRazorpayKeySecret(e.target.value)}
                          placeholder="Enter Razorpay Key Secret"
                          className="deepSeek-api-setting-input"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="deepSeek-api-setting-toggle-visibility-btn"
                          onClick={() => setShowKeySecret(!showKeySecret)}
                          disabled={isLoading}
                        >
                          {showKeySecret ? "👁️" : "🙈"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6">
                  <div className="deepSeek-api-setting-input-section">
                    <label className="deepSeek-api-setting-input-label">
                      <FiShield className="deepSeek-api-setting-label-icon" />
                      Razorpay Mode
                    </label>
                    <div className="deepSeek-api-setting-input-group">
                      <select
                        value={razorpayMode}
                        onChange={(e) => setRazorpayMode(e.target.value)}
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
                    href="https://dashboard.razorpay.com/app/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="deepSeek-api-setting-help-link"
                  >
                    Razorpay Dashboard
                  </a>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="deepSeek-api-setting-action-section">
                <button
                  className="deepSeek-api-setting-save-btn"
                  onClick={submitRazorpayConfig}
                  disabled={
                    isLoading ||
                    !razorpayKeyId.trim() ||
                    !razorpayKeySecret.trim()
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
                      Secure Razorpay Payments
                    </span>
                  </div>
                  <div className="deepSeek-api-setting-feature-item">
                    <span className="deepSeek-api-setting-feature-icon">
                      🔐
                    </span>
                    <span className="deepSeek-api-setting-feature-text">
                      UPI & Card Payments
                    </span>
                  </div>
                  <div className="deepSeek-api-setting-feature-item">
                    <span className="deepSeek-api-setting-feature-icon">
                      🌐
                    </span>
                    <span className="deepSeek-api-setting-feature-text">
                      Indian Payment Gateway
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

export default RazorpaySetting;
