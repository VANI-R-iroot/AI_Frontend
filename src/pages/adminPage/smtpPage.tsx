import React, { useEffect, useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaServer,
  FaEnvelope,
  FaLock,
  FaUser,
  FaCog,
  FaShieldAlt,
  FaRocket,
} from "react-icons/fa";
import "../../assets/css/adminDashboard/smtpPage.css";
import axiosInstance from "../../utils/baseUrl";
import PageLoader from "../../common/loader";

interface SMTPData {
  _id?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUserName: string;
  smtpPassword: string;
  smtpSenderEmail: string;
  smtpSenderName: string;
  smtpEncryption: string;
}

const SmtpPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [smtpData, setSmtpData] = useState<SMTPData>({
    smtpHost: "",
    smtpPort: 587,
    smtpUserName: "",
    smtpPassword: "",
    smtpSenderEmail: "",
    smtpSenderName: "",
    smtpEncryption: "tls",
  });

  useEffect(() => {
    const fetchSmtpData = async () => {
      try {
        const res = await axiosInstance.get("/getSmtpData");
        const next = res.data?.data || {};
        setSmtpData({
          smtpHost: next.smtpHost || "",
          smtpPort: Number(next.smtpPort) || 587,
          smtpUserName: next.smtpUserName || "",
          smtpPassword: next.smtpPassword || "",
          smtpSenderEmail: next.smtpSenderEmail || "",
          smtpSenderName: next.smtpSenderName || "",
          smtpEncryption: next.smtpEncryption || "tls",
        });
        console.log("Fetching SMTP data...");
      } catch (error) {
        console.error("Failed to fetch SMTP data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSmtpData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSmtpData((prev) => ({
      ...prev,
      [name]: name === "smtpPort" ? parseInt(value) : value,
    }));
  };

  const handleEncryptionChange = (value: string) => {
    setSmtpData((prev) => ({
      ...prev,
      smtpEncryption: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Saving SMTP data:", smtpData);
      await axiosInstance.post("/updateSmtpData", smtpData);
      alert("SMTP settings updated successfully!");
    } catch (error: any) {
      alert("Failed to update SMTP info");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className=" main-content-common">
      <div className="container-fluid">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-badge">
            <div className="badge-icon">
              <FaRocket />
            </div>
            <span>Professional SMTP Configuration</span>
          </div>
          <h1 className="header-title">SMTP Settings Dashboard</h1>
          <p className="header-subtitle">
            Configure your email server with enterprise-grade security and
            monitoring. Streamline your communication workflow with our advanced
            SMTP management system.
          </p>
        </div>
        <PageLoader isLoading={isLoading} />
        {/* Main Dashboard Card */}
        <div className="dashboard-card">
          <div className="smtp-card-body">
            <form onSubmit={handleSubmit}>
              {/* Server Settings Section */}
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon server">
                    <FaServer />
                  </div>
                  <div className="section-content">
                    <h3>Server Configuration</h3>
                    <p>Configure your SMTP server connection settings</p>
                  </div>
                </div>

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
                    />
                  </div>
                </div>
              </div>

              {/* Authentication Section */}
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon auth">
                    <FaLock />
                  </div>
                  <div className="section-content">
                    <h3>Authentication Settings</h3>
                    <p>Secure your email server with proper authentication</p>
                  </div>
                </div>

                <div className="form-grid cols-2">
                  <div className="form-group">
                    <label className="form-label">
                      <div className="label-icon auth">
                        <FaUser />
                      </div>
                      Username / Email
                    </label>
                    <input
                      type="text"
                      name="smtpUserName"
                      value={smtpData.smtpUserName}
                      onChange={handleChange}
                      placeholder="your-email@domain.com"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <div className="label-icon auth">
                        <FaLock />
                      </div>
                      Password / App Password
                    </label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="smtpPassword"
                        value={smtpData.smtpPassword}
                        onChange={handleChange}
                        placeholder="Enter your secure password"
                        className="form-control"
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

              {/* Sender Information Section */}
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon sender">
                    <FaEnvelope />
                  </div>
                  <div className="section-content">
                    <h3>Sender Information</h3>
                    <p>Configure how your emails will appear to recipients</p>
                  </div>
                </div>

                <div className="form-grid cols-2">
                  <div className="form-group">
                    <label className="form-label">
                      <div className="label-icon sender">
                        <FaEnvelope />
                      </div>
                      Sender Email Address
                    </label>
                    <input
                      type="email"
                      name="smtpSenderEmail"
                      value={smtpData.smtpSenderEmail}
                      onChange={handleChange}
                      placeholder="noreply@yourcompany.com"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <div className="label-icon sender">
                        <FaUser />
                      </div>
                      Sender Display Name
                    </label>
                    <input
                      type="text"
                      name="smtpSenderName"
                      value={smtpData.smtpSenderName}
                      onChange={handleChange}
                      placeholder="Your Company Name"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon security">
                    <FaShieldAlt />
                  </div>
                  <div className="section-content">
                    <h3>Security & Encryption</h3>
                    <p>Ensure secure email transmission with encryption</p>
                  </div>
                </div>

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
                        <label htmlFor="ssl">SSL</label>
                      </div>
                      <div className="encryption-option">
                        <input
                          type="radio"
                          id="none"
                          name="encryption"
                          value="none"
                          checked={smtpData.smtpEncryption === "none"}
                          onChange={(e) =>
                            handleEncryptionChange(e.target.value)
                          }
                        />
                        <label htmlFor="none">None</label>
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
                  {isSubmitting ? "Saving Changes..." : "Save Configuration"}
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
