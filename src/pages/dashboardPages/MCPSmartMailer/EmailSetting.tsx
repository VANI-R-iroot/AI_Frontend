import React, { useEffect, useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaServer,
  FaLock,
  FaUser,
  FaCog,
  FaShieldAlt,
  FaRocket,
} from "react-icons/fa";
import "../../../assets/css/adminDashboard/smtpPage.css";
import axiosInstance from "../../../utils/baseUrl";
import { useUserStore } from "../../../zustand/userDetailsStore";

interface SMTPData {
  _id?: string;
  userId: string;
  smtpHost: string;
  smtpPort: number;
  senderEmail: string;
  senderName: string;
  smtpPassword: string;
  smtpEncryption: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserData {
  _id: string;
}

const SmtpPage: React.FC = () => {
  const userData = useUserStore((state) => state.userData || {}) as UserData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isExistingConfig, setIsExistingConfig] = useState(false);
  const [smtpData, setSmtpData] = useState<SMTPData>({
    userId: userData._id,
    smtpHost: "",
    smtpPort: 587,
    senderEmail: "",
    senderName: "",
    smtpPassword: "",
    smtpEncryption: "tls",
  });

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const fetchSmtpData = async () => {
      try {
        const res = await axiosInstance.get(`/email-config/${userData._id}`);

        if (res.data.success) {
          const configData = res.data.data;
          setSmtpData({
            ...configData,
            smtpPassword: "",
          });
          setIsExistingConfig(true);
          console.log("Existing SMTP configuration found");
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.log("No existing SMTP configuration found - will create new");
          setIsExistingConfig(false);
        } else {
          console.error("Failed to fetch SMTP data:", error);
          setErrorMessage("Failed to fetch SMTP configuration");
        }
      }
    };

    if (userData._id) {
      fetchSmtpData();
    }
  }, [userData._id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSmtpData((prev) => ({
      ...prev,
      [name]: name === "smtpPort" ? parseInt(value) || 587 : value,
    }));
  };

  const handleEncryptionChange = (value: string) => {
    setSmtpData((prev) => ({
      ...prev,
      smtpEncryption: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!smtpData.smtpHost.trim()) {
      setErrorMessage("SMTP Host is required");
      return false;
    }
    if (!smtpData.senderEmail.trim()) {
      setErrorMessage("Sender Email is required");
      return false;
    }
    if (!smtpData.senderName.trim()) {
      setErrorMessage("Sender Name is required");
      return false;
    }
    if (!smtpData.smtpPassword.trim()) {
      setErrorMessage("SMTP Password is required");
      return false;
    }
    if (smtpData.smtpPort <= 0 || smtpData.smtpPort > 65535) {
      setErrorMessage("Please enter a valid port number (1-65535)");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(smtpData.senderEmail)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post("/email-config", smtpData);

      if (response.data.success) {
        const action = response.data.action;
        setSuccessMessage(
          `SMTP settings ${
            action === "created" ? "created" : "updated"
          } successfully!`
        );
        setIsExistingConfig(true);

        if (response.data.data) {
          setSmtpData((prev) => ({
            ...prev,
            ...response.data.data,
            smtpPassword: "",
          }));
        }
      } else {
        setErrorMessage(
          response.data.message || "Failed to save SMTP settings"
        );
      }
    } catch (error: any) {
      console.error("Failed to save SMTP data:", error);

      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response?.data?.errors) {
        setErrorMessage(error.response.data.errors.join(", "));
      } else {
        setErrorMessage("Failed to save SMTP settings. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  return (
    <div className="main-content-common">
      <div className="container-fluid">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-badge">
            <div className="badge-icon">
              <FaRocket />
            </div>
            <span>Configuration</span>
          </div>
          <h1 className="header-title">Integration Mail Server</h1>
          <p className="header-subtitle">
            Configure your email server with enterprise-grade security and
            monitoring. Streamline your communication workflow with our advanced
            SMTP management system.
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="alert alert-success">✅ {successMessage}</div>
        )}
        {errorMessage && (
          <div className="alert alert-error">❌ {errorMessage}</div>
        )}

        {/* Main Dashboard Card */}
        <div className="dashboard-card">
          <div className="smtp-card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <div className="form-grid cols-2">
                  <div className="form-group">
                    <label className="form-label">
                      <div className="label-icon server">
                        <FaServer />
                      </div>
                      SMTP Host Address
                    </label>
                    <input
                      type="text"
                      name="smtpHost"
                      value={smtpData.smtpHost}
                      onChange={handleChange}
                      placeholder="smtp.gmail.com"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <div className="label-icon server">
                        <FaCog />
                      </div>
                      Port Number
                    </label>
                    <input
                      type="number"
                      name="smtpPort"
                      value={smtpData.smtpPort}
                      onChange={handleChange}
                      placeholder="587"
                      className="form-control"
                      min="1"
                      max="65535"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Authentication Section */}
              <div className="form-section">
                <div className="form-grid cols-3">
                  <div className="form-group">
                    <label className="form-label">
                      <div className="label-icon auth">
                        <FaUser />
                      </div>
                      Sender Email
                    </label>
                    <input
                      type="email"
                      name="senderEmail"
                      value={smtpData.senderEmail}
                      onChange={handleChange}
                      placeholder="your-email@domain.com"
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <div className="label-icon auth">
                        <FaUser />
                      </div>
                      Sender Email
                    </label>
                    <input
                      type="text"
                      name="senderName"
                      value={smtpData.senderName}
                      onChange={handleChange}
                      placeholder="your-email@domain.com"
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <div className="label-icon auth">
                        <FaLock />
                      </div>
                      SMTP Password
                    </label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="smtpPassword"
                        value={smtpData.smtpPassword}
                        onChange={handleChange}
                        placeholder={
                          isExistingConfig
                            ? "Enter new password to update"
                            : "Enter your secure password"
                        }
                        className="form-control"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="password-toggle"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="form-section">
                <div className="form-grid cols-1">
                  <div className="form-group">
                    <label className="form-label">
                      <div className="label-icon security">
                        <FaShieldAlt />
                      </div>
                      Encryption Type
                    </label>
                    <div className="encryption-select">
                      <div className="encryption-option">
                        <input
                          type="radio"
                          id="tls"
                          name="encryption"
                          value="tls"
                          checked={smtpData.smtpEncryption === "tls"}
                          onChange={(e) =>
                            handleEncryptionChange(e.target.value)
                          }
                        />
                        <label htmlFor="tls">TLS</label>
                      </div>
                      <div className="encryption-option">
                        <input
                          type="radio"
                          id="ssl"
                          name="encryption"
                          value="ssl"
                          checked={smtpData.smtpEncryption === "ssl"}
                          onChange={(e) =>
                            handleEncryptionChange(e.target.value)
                          }
                        />
                        <label htmlFor="ssl">
                          SSL (Recommended of cPanel){" "}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="submit-section">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`submit-btn ${isSubmitting ? "loading" : ""}`}
                >
                  <span className="btn-icon">✨</span>
                  {isSubmitting
                    ? "Saving Changes..."
                    : isExistingConfig
                    ? "Update Configuration"
                    : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmtpPage;
