import React, { useState } from "react";
import { FiKey, FiSave, FiShield, FiInfo } from "react-icons/fi";
import { SiGooglegemini } from "react-icons/si";
import ShortLink from "../../../common/ShortLinkDashboard";
import axiosInstance from "../../../utils/baseUrl";
import "../../../assets/css/adminDashboard/apiSettingPages/deepSeckPage.css"
const openAiSetting: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const submitOpenaiApi = async () => {
    try {
      if (!apiKey.trim()) {
        alert("Please enter your API key.");
        return;
      }

      setIsLoading(true);
      const res = await axiosInstance.post("/create-open-api", {
        apiKey,
      });

      if (res.status === 200 || res.status === 201) {
        alert("API Key saved successfully.");
      } else {
        alert("Failed to save API Key.");
      }
    } catch (error) {
      console.error("API save error:", error);
      alert("Something went wrong while saving your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-content-common">
      <div className="container">
        <div className="global-link-limit-section">
          <div className="short-link-text">
            <ShortLink />
          </div>
        </div>

        {/* Main Settings Section */}
        <div className="deepSeek-api-setting-wrapper">
          <div className="row">
            <div className="col-md-10 col-lg-8 mx-auto">
              <div className="deepSeek-api-setting-card">
                {/* Header Section */}
                <div className="deepSeek-api-setting-header">
                  <div className="deepSeek-api-setting-header-icon">
                    <SiGooglegemini className="deepSeek-api-setting-sparkle-icon" />
                  </div>
                  <h2 className="deepSeek-api-setting-title">Gemini API Configuration</h2>
                  <p className="deepSeek-api-setting-description">
                    Connect your Gemini API to unlock advanced AI capabilities. 
                    Your API key is encrypted and stored securely.
                  </p>
                </div>

                {/* Security Notice */}
                <div className="deepSeek-api-setting-security-notice">
                  <FiShield className="deepSeek-api-setting-security-icon" />
                  <span>Your API key is encrypted and stored securely</span>
                </div>

                {/* API Key Input Section */}
                <div className="deepSeek-api-setting-input-section">
                  <label className="deepSeek-api-setting-input-label">
                    <FiKey className="deepSeek-api-setting-label-icon" />
                    Gemini API Key
                    <span className="deepSeek-api-setting-required-asterisk">*</span>
                  </label>
                  
                  <div className="deepSeek-api-setting-input-group">
                    <div className="deepSeek-api-setting-input-wrapper">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="deepSeek-api-setting-input"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="deepSeek-api-setting-toggle-visibility-btn"
                        onClick={() => setShowApiKey(!showApiKey)}
                        disabled={isLoading}
                      >
                        {showApiKey ? "👁️" : "🙈"}
                      </button>
                    </div>
                  </div>

                  {/* Help Text */}
                  <div className="deepSeek-api-setting-help-text">
                    <FiInfo className="deepSeek-api-setting-info-icon" />
                    <span>
                      Get your API key from the{" "}
                      <a 
                        href="https://platform.openai.com/api-keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="deepSeek-api-setting-help-link"
                      >
                        Gemini AI Platform
                      </a>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="deepSeek-api-setting-action-section">
                  <button
                    className="deepSeek-api-setting-save-btn"
                    onClick={submitOpenaiApi}
                    disabled={isLoading || !apiKey.trim()}
                  >
                    {isLoading ? (
                      <>
                        <div className="deepSeek-api-setting-spinner"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiSave className="deepSeek-api-setting-btn-icon" />
                        <span>Save API Key</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Features Preview */}
                <div className="deepSeek-api-setting-features-preview">
                  <h3 className="deepSeek-api-setting-features-title">What you'll unlock:</h3>
                  <div className="deepSeek-api-setting-features-grid">
                    <div className="deepSeek-api-setting-feature-item">
                      <span className="deepSeek-api-setting-feature-icon">🚀</span>
                      <span className="deepSeek-api-setting-feature-text">Advanced AI Models</span>
                    </div>
                    <div className="deepSeek-api-setting-feature-item">
                      <span className="deepSeek-api-setting-feature-icon">⚡</span>
                      <span className="deepSeek-api-setting-feature-text">Lightning Fast Responses</span>
                    </div>
                    <div className="deepSeek-api-setting-feature-item">
                      <span className="deepSeek-api-setting-feature-icon">🎯</span>
                      <span className="deepSeek-api-setting-feature-text">High Accuracy Results</span>
                    </div>
              
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

export default openAiSetting;
