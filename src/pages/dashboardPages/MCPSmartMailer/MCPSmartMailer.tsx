import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Calendar,
  Users,
  Sparkles,
  RefreshCw,
  Edit3,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react";
import "../../../assets/css/userDashboard/mcp/mcp-smart-mailer.css";
import axiosInstance from "../../../utils/baseUrl";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { useUserStore } from "../../../zustand/userDetailsStore";
import { apiConfig } from "../../../utils/apiConfig";
import { packageStore } from "../../../zustand/packageStore";

// Type definitions
interface EmailRange {
  value: string;
  label: string;
  count: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface GenerateEmailRequest {
  subject: string;
  emailInfo: string;
  userId: string;
}

interface GenerateEmailResponse {
  generatedContent?: string;
  content?: string;
}

interface SendEmailRequest {
  status: boolean;
  content: string;
  range: string;
  sendType: "now" | "schedule";
  scheduleDate?: string;
  scheduleTime?: string;
  userId: string;
}

type SendType = "now" | "schedule" | "";

type MCPClient = Client<
  {
    method: string;
    params?: {
      [x: string]: unknown;
      _meta?: {
        [x: string]: unknown;
        progressToken?: string | number;
      };
    };
  },
  {
    method: string;
    params?: {
      [x: string]: unknown;
      _meta?: {
        [x: string]: unknown;
        progressToken?: string | number;
      };
    };
  },
  {}
>;
interface PackageLimitData {
  aiMcpSmartMailerLimit?: number;
}

const SmartMailer: React.FC = () => {
  const packageLimitData = packageStore(
    (state) => state.packageLimitData
  ) as PackageLimitData;

  const userData = useUserStore((state) => state.userData);

  // State with proper types
  const [subject, setSubject] = useState<string>("");
  const [emailInfo, setEmailInfo] = useState<string>("");
  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [emailGenerated, setEmailGenerated] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<string>("");
  const [customRangeFrom, setCustomRangeFrom] = useState<string>("");
  const [customRangeTo, setCustomRangeTo] = useState<string>("");
  const [sendType, setSendType] = useState<SendType>("");
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [scheduleTime, setScheduleTime] = useState<string>("");
  const [hour, setHour] = useState<string>("12");
  const [minute, setMinute] = useState<string>("00");
  const [ampm, setAmpm] = useState<string>("AM");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [status, setStatus] = useState("loading");
  const [client, setClient] = useState<MCPClient | null>(null);

  const emailRanges: EmailRange[] = [
    { value: "1-10", label: "1 to 10 emails", count: 10 },
    { value: "100-200", label: "100 to 200 emails", count: 200 },
    { value: "200-300", label: "200 to 300 emails", count: 300 },
    { value: "custom", label: "Custom Range", count: 0 },
  ];

  const MCP_SERVER_URL = `${apiConfig.mcpApi}/mcpMailer`;

  useEffect(() => {
    async function connectToServer() {
      try {
        const mcpClient = new Client({
          name: "browser-client",
          version: "1.0.0",
        });

        const transport = new StreamableHTTPClientTransport(
          new URL(MCP_SERVER_URL)
        );
        await mcpClient.connect(transport);

        setClient(mcpClient);
        setStatus("connected");
        console.log("✅ Connected to MCP");
      } catch (err) {
        console.error("❌ MCP connection failed:", err);
        setStatus("error");
      }
    }

    connectToServer();
  }, []);

  // Auto-sync time format
  useEffect(() => {
    const formattedTime = `${hour}:${minute} ${ampm}`;
    setScheduleTime(formattedTime);
  }, [hour, minute, ampm]);

  // Generate email with AI
  const generateEmail = async (): Promise<void> => {
    if (!subject.trim() || !emailInfo.trim()) {
      alert("Please fill in both subject and email information.");
      return;
    }

    setIsGenerating(true);
    setEmailGenerated(false);
    setGeneratedEmail("");

    try {
      const payload: GenerateEmailRequest = {
        subject: subject.trim(),
        emailInfo: emailInfo.trim(),
        userId: userData._id,
      };

      const res = await axiosInstance.post<ApiResponse<GenerateEmailResponse>>(
        "/generate-email",
        payload
      );

      if (res.data.success && res.data.data) {
        const content =
          res.data.data.generatedContent || res.data.data.content || "";
        setGeneratedEmail(content);
        setEmailGenerated(true);
      } else {
        alert(
          "❌ Failed to generate email: " +
            (res.data.message || "Unknown error")
        );
      }
    } catch (err: any) {
      console.error("Email generation error:", err);
      alert(
        "❌ Something went wrong while generating the email: " +
          (err.response?.data?.message || err.message || "Network error")
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate email
  const regenerateEmail = (): void => {
    setEmailGenerated(false);
    setGeneratedEmail("");
    setTimeout(() => generateEmail(), 100);
  };

  // Updated handleSendNow function with MCP client integration
  const handleSendNow = async (): Promise<void> => {
    if (!client || !validateSendData()) return;

    try {
      setIsSending(true);
      if (client) {
        const result = await client.callTool({
          name: "sendMailer",
          arguments: {
            message: generatedEmail.trim(),
            userId: userData._id,
            selectedRange: getCustomRange(),
          },
        });

        if (
          result &&
          result.content &&
          Array.isArray(result.content) &&
          result.content.length > 0
        ) {
          const responseText = result.content
            .filter((item) => item.type === "text")
            .map((item) => item.text)
            .join("\n\n");

          console.log(
            "MCP Response:",
            responseText || "No text response received"
          );

          // Show success message
          alert(
            `✅ Email sent successfully to ${getRecipientCount(
              selectedRange
            )} recipients!`
          );
          // Reset form after successful send
          resetForm();
        } else {
          console.log("No MCP response received");
          alert("❌ Email sending failed. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Send email error:", err);
      alert(
        "❌ Something went wrong while sending the email: " +
          (err.response?.data?.message || err.message || "Network error")
      );
    } finally {
      setIsSending(false);
    }
  };

  // Save as draft/schedule
  const handleSaveDraft = async (): Promise<void> => {
    if (!validateScheduleData()) return;

    try {
      setIsSending(true);

      const payload: SendEmailRequest = {
        status: false,
        content: generatedEmail,
        range: getCustomRange(),
        sendType: "schedule",
        scheduleDate,
        scheduleTime,
        userId: userData._id,
      };

      const res = await axiosInstance.post<ApiResponse>(
        "/smart-mailer-schedule",
        payload
      );

      if (res.data.success) {
        alert(
          `✅ Email scheduled for ${scheduleDate} at ${scheduleTime} for ${getRecipientCount(
            selectedRange
          )} recipients.`
        );
        // Reset form after successful schedule
        resetForm();
      } else {
        alert(
          "❌ Failed to schedule email: " +
            (res.data.message || "Unknown error")
        );
      }
    } catch (err: any) {
      console.error("Schedule email error:", err);
      alert(
        "❌ Something went wrong while scheduling the email: " +
          (err.response?.data?.message || err.message || "Network error")
      );
    } finally {
      setIsSending(false);
    }
  };

  // Updated validation functions - now allows any range > 0
  const validateSendData = (): boolean => {
    if (!subject.trim()) {
      alert("Please enter an email subject.");
      return false;
    }
    if (!emailInfo.trim()) {
      alert("Please enter email information.");
      return false;
    }
    if (!generatedEmail.trim()) {
      alert("Please generate email content first.");
      return false;
    }
    if (!selectedRange) {
      alert("Please select a recipient range.");
      return false;
    }

    // Enhanced custom range validation
    if (selectedRange === "custom") {
      if (!customRangeFrom || !customRangeTo) {
        alert("Please enter both 'from' and 'to' values for custom range.");
        return false;
      }

      const from = parseInt(customRangeFrom);
      const to = parseInt(customRangeTo);

      if (isNaN(from) || isNaN(to)) {
        alert("Please enter valid numbers for custom range.");
        return false;
      }

      if (from <= 0 || to <= 0) {
        alert("Recipient count must be greater than 0.");
        return false;
      }

      if (from >= to) {
        alert("'To' value must be greater than 'From' value.");
        return false;
      }

      if (from < 1 || to > 100000) {
        alert("Range must be between 1-100,000 recipients.");
        return false;
      }
    }

    return true;
  };

  const validateScheduleData = (): boolean => {
    if (!validateSendData()) return false;

    if (!scheduleDate) {
      alert("Please select a schedule date.");
      return false;
    }
    if (!scheduleTime) {
      alert("Please select a schedule time.");
      return false;
    }

    // Convert AM/PM time to 24-hour format for validation
    const convertTo24Hour = (time12h: string): string => {
      const [time, modifier] = time12h.split(" ");
      let [hours, minutes] = time.split(":");
      if (hours === "12") {
        hours = "00";
      }
      if (modifier === "PM") {
        hours = (parseInt(hours, 10) + 12).toString();
      }
      return `${hours.padStart(2, "0")}:${minutes}`;
    };

    try {
      const time24h = convertTo24Hour(scheduleTime);
      const now = new Date();
      const scheduledDateTime = new Date(`${scheduleDate}T${time24h}`);

      if (scheduledDateTime <= now) {
        alert("Please select a future date and time for scheduling.");
        return false;
      }
    } catch (error) {
      alert("Invalid time format. Please select a valid time.");
      return false;
    }

    return true;
  };

  // Helper functions
  const getRecipientCount = (range: string): number => {
    if (range === "custom") {
      const from = parseInt(customRangeFrom) || 0;
      const to = parseInt(customRangeTo) || 0;
      return to > from ? to : from;
    }
    const rangeObj = emailRanges.find((r) => r.value === range);
    return rangeObj ? rangeObj.count : parseInt(range.split("-")[1]) || 0;
  };

  const getCustomRange = (): string => {
    if (selectedRange === "custom" && customRangeFrom && customRangeTo) {
      return `${customRangeFrom}-${customRangeTo}`;
    }
    return selectedRange;
  };

  const resetForm = (): void => {
    setSubject("");
    setEmailInfo("");
    setGeneratedEmail("");
    setEmailGenerated(false);
    setSelectedRange("");
    setCustomRangeFrom("");
    setCustomRangeTo("");
    setSendType("");
    setScheduleDate("");
    setScheduleTime("");
    setHour("12");
    setMinute("00");
    setAmpm("AM");
  };

  // Event handlers with proper typing
  const handleSubjectChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSubject(e.target.value);
  };

  const handleEmailInfoChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setEmailInfo(e.target.value);
  };

  const handleGeneratedEmailChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setGeneratedEmail(e.target.value);
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedRange(e.target.value);
    if (e.target.value !== "custom") {
      setCustomRangeFrom("");
      setCustomRangeTo("");
    }
  };

  const handleCustomRangeFromChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value.replace(/\D/g, ""); // Only numbers
    setCustomRangeFrom(value);
  };

  const handleCustomRangeToChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value.replace(/\D/g, ""); // Only numbers
    setCustomRangeTo(value);
  };

  const handleScheduleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setScheduleDate(e.target.value);
  };

  const handleScheduleTimeChange = (
    type: "hour" | "minute" | "ampm",
    value: string
  ): void => {
    if (type === "hour") setHour(value);
    if (type === "minute") setMinute(value);
    if (type === "ampm") setAmpm(value);
  };

  const handleSendTypeChange = (type: SendType): void => {
    setSendType(type);
  };

  const canSendNow: boolean =
    emailGenerated && !!selectedRange && getRecipientCount(selectedRange) > 0;
  const canSaveDraft: boolean =
    emailGenerated &&
    !!selectedRange &&
    getRecipientCount(selectedRange) > 0 &&
    !!scheduleDate &&
    !!scheduleTime;

  return (
    <div className="smartMailer-container">
      <div className="smartMailer-wrapper">
        {/* Header Section */}

        <div className="smartMailer-header">
          <div className="smartMailer-title-section">
            <div className="smartMailer-title-icon">
              <Mail className="smartMailer-icon-large" />
            </div>
            <div>
              <h1 className="smartMailer-title">SmartMailer Pro</h1>
              <p className="smartMailer-subtitle">
                MCP & AI-Powered Email Campaign Generator & Scheduler
              </p>
              {/* MCP Connection Status */}
              <div className="smartMailer-connection-status">
                <div
                  className={`smartMailer-status-dot ${
                    status === "connected"
                      ? "connected"
                      : status === "error"
                      ? "error"
                      : "loading"
                  }`}
                ></div>
                <span className="smartMailer-status-text">
                  {status === "connected"
                    ? "MCP Connected"
                    : status === "error"
                    ? "MCP Connection Failed"
                    : "Connecting..."}
                </span>
              </div>
            </div>
          </div>

          <div className="smartMailer-features">
            <div className="smartMailer-feature-badge">
              <Sparkles className="smartMailer-badge-icon" />
              <span>AI Generation</span>
            </div>
            <div className="smartMailer-feature-badge">
              <Users className="smartMailer-badge-icon" />
              <span>Bulk Sending</span>
            </div>
            <div className="smartMailer-feature-badge">
              <Calendar className="smartMailer-badge-icon" />
              <span>Smart Scheduling</span>
            </div>
            <div className="smartMailer-feature-badge">
              <CheckCircle className="smartMailer-badge-icon" />
              <span>Auto Delivery</span>
            </div>
          </div>
        </div>

        {/* Limit Display Section */}
        <div className="smartMailer-limit-section">
          <div className="smartMailer-limit-card">
            <div className="smartMailer-limit-info">
              <span className="smartMailer-limit-label">
                Smart Mailer Limit:
              </span>
              <span className="smartMailer-limit-value">
                {userData?.apiUseAiMcpSmartMailerLimit || 0} /{" "}
                {packageLimitData?.aiMcpSmartMailerLimit || 0}
              </span>
            </div>
            <div className="smartMailer-limit-bar">
              <div
                className="smartMailer-limit-progress"
                style={{
                  width: `${
                    ((userData?.apiUseAiMcpSmartMailerLimit || 0) /
                      (packageLimitData?.aiMcpSmartMailerLimit || 1)) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="smartMailer-card">
          {/* Email Input Section */}
          <div className="smartMailer-section">
            <h3 className="smartMailer-section-title">
              <Edit3 className="smartMailer-section-icon" />
              Email Content Setup
            </h3>

            <div className="smartMailer-input-group">
              <label className="smartMailer-label">Email Subject *</label>
              <input
                type="text"
                className="smartMailer-input"
                value={subject}
                onChange={handleSubjectChange}
                placeholder="Enter your email subject line"
                disabled={isGenerating}
              />
            </div>

            <div className="smartMailer-input-group">
              <label className="smartMailer-label">
                Email Information & Context *
              </label>
              <textarea
                className="smartMailer-textarea"
                value={emailInfo}
                onChange={handleEmailInfoChange}
                placeholder="Describe what this email is about. Include key points, offers, announcements, or any specific information you want to include..."
                rows={4}
                disabled={isGenerating}
              />
            </div>

            <button
              onClick={generateEmail}
              disabled={!subject.trim() || !emailInfo.trim() || isGenerating}
              className="smartMailer-generate-button"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="smartMailer-spin smartMailer-button-icon" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="smartMailer-button-icon" />
                  Generate Email with AI
                </>
              )}
            </button>
          </div>

          {/* Generated Email Section */}
          {(emailGenerated || isGenerating) && (
            <div className="smartMailer-section">
              <div className="smartMailer-section-header">
                <h3 className="smartMailer-section-title">
                  <FileText className="smartMailer-section-icon" />
                  Generated Email Content
                </h3>
                {emailGenerated && (
                  <button
                    onClick={regenerateEmail}
                    className="smartMailer-regenerate-button"
                    disabled={isGenerating}
                  >
                    <RefreshCw className="smartMailer-button-icon" />
                    Regenerate
                  </button>
                )}
              </div>

              <div className="smartMailer-email-preview">
                {isGenerating ? (
                  <div className="smartMailer-generating">
                    <div className="smartMailer-generating-spinner"></div>
                    <p className="smartMailer-generating-text">
                      AI is crafting your perfect email...
                    </p>
                  </div>
                ) : (
                  <textarea
                    className="smartMailer-generated-content"
                    value={generatedEmail}
                    onChange={handleGeneratedEmailChange}
                    rows={12}
                    placeholder="Generated email content will appear here..."
                  />
                )}
              </div>
            </div>
          )}

          {/* Recipient Selection */}
          {emailGenerated && (
            <div className="smartMailer-section">
              <h3 className="smartMailer-section-title">
                <Users className="smartMailer-section-icon" />
                Select Recipients *
              </h3>

              <div className="smartMailer-range-selector">
                {emailRanges.map((range: EmailRange) => (
                  <label key={range.value} className="smartMailer-range-option">
                    <input
                      type="radio"
                      name="emailRange"
                      value={range.value}
                      checked={selectedRange === range.value}
                      onChange={handleRangeChange}
                      className="smartMailer-radio"
                      disabled={isSending}
                    />
                    <div className="smartMailer-range-card">
                      <div className="smartMailer-range-label">
                        {range.label}
                      </div>
                      {range.value !== "custom" && (
                        <div className="smartMailer-range-count">
                          {range.count} recipients
                        </div>
                      )}
                    </div>
                  </label>
                ))}

                {/* Custom Range Inputs */}
                {selectedRange === "custom" && (
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#202122ff",
                      borderRadius: "8px",
                      border: "2px solid #323333ff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          minWidth: "120px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#ffffff",
                            marginBottom: "4px",
                          }}
                        >
                          From:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 1"
                          value={customRangeFrom}
                          onChange={handleCustomRangeFromChange}
                          className="smartMailer-input"
                          style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                          }}
                          disabled={isSending}
                        />
                      </div>

                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#ffffff",
                          margin: "0 8px",
                        }}
                      >
                        to
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          minWidth: "120px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#ffffff",
                            marginBottom: "4px",
                          }}
                        >
                          To:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 1000"
                          value={customRangeTo}
                          onChange={handleCustomRangeToChange}
                          className="smartMailer-input"
                          style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                          }}
                          disabled={isSending}
                        />
                      </div>
                    </div>

                    {customRangeFrom && customRangeTo && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "8px 12px",
                          backgroundColor:
                            getRecipientCount("custom") > 0
                              ? "#e8f5e8"
                              : "#ffebee",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color:
                            getRecipientCount("custom") > 0
                              ? "#2e7d32"
                              : "#c62828",
                          fontWeight: "500",
                        }}
                      >
                        {getRecipientCount("custom") > 0 ? (
                          <>
                            📧 Total Recipients: {getRecipientCount("custom")}{" "}
                            emails
                          </>
                        ) : (
                          <>
                            ⚠️ Invalid range: 'To' must be greater than 'From'
                            and both must be greater than 0
                          </>
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      💡 Enter any range from 1 to 100,000 recipients (From must
                      be less than To)
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Send Options */}
          {emailGenerated &&
            selectedRange &&
            getRecipientCount(selectedRange) > 0 && (
              <div className="smartMailer-section">
                <h3 className="smartMailer-section-title">
                  <Send className="smartMailer-section-icon" />
                  Delivery Options
                </h3>

                <div className="smartMailer-send-options">
                  <div className="smartMailer-option-group">
                    <button
                      onClick={() => handleSendTypeChange("now")}
                      className={`smartMailer-option-button ${
                        sendType === "now" ? "active" : ""
                      }`}
                      disabled={isSending}
                    >
                      <Send className="smartMailer-button-icon" />
                      Send Now
                    </button>

                    <button
                      onClick={() => handleSendTypeChange("schedule")}
                      className={`smartMailer-option-button ${
                        sendType === "schedule" ? "active" : ""
                      }`}
                      disabled={isSending}
                    >
                      <Calendar className="smartMailer-button-icon" />
                      Schedule Email
                    </button>
                  </div>

                  {/* Send Now Section */}
                  {sendType === "now" && (
                    <div className="smartMailer-send-now-section">
                      <div className="smartMailer-send-ready">
                        <CheckCircle className="smartMailer-success-icon" />
                        <div>
                          <p className="smartMailer-ready-text">
                            Ready to send!
                          </p>
                          <p className="smartMailer-ready-subtext">
                            Email will be sent to{" "}
                            {getRecipientCount(selectedRange)} recipients
                            immediately
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Schedule Section */}
                  {sendType === "schedule" && (
                    <div className="smartMailer-schedule-section">
                      <div className="smartMailer-schedule-inputs">
                        <div className="smartMailer-input-group">
                          <label className="smartMailer-label">
                            <Calendar className="smartMailer-label-icon" />
                            Schedule Date *
                          </label>
                          <input
                            type="date"
                            className="smartMailer-input"
                            value={scheduleDate}
                            onChange={handleScheduleDateChange}
                            min={new Date().toISOString().split("T")[0]}
                            disabled={isSending}
                          />
                        </div>

                        <div className="smartMailer-input-group">
                          <label className="smartMailer-label">
                            <Clock className="smartMailer-label-icon" />
                            Schedule Time *
                          </label>

                          {/* AM/PM Time Picker */}
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "center",
                            }}
                          >
                            <select
                              value={hour}
                              onChange={(e) =>
                                handleScheduleTimeChange("hour", e.target.value)
                              }
                              className="smartMailer-input"
                              style={{ minWidth: "70px" }}
                              disabled={isSending}
                            >
                              {Array.from({ length: 12 }, (_, i) => {
                                const h = (i + 1).toString().padStart(2, "0");
                                return (
                                  <option key={h} value={h}>
                                    {h}
                                  </option>
                                );
                              })}
                            </select>

                            <span style={{ color: "#666", fontSize: "16px" }}>
                              :
                            </span>

                            <select
                              value={minute}
                              onChange={(e) =>
                                handleScheduleTimeChange(
                                  "minute",
                                  e.target.value
                                )
                              }
                              className="smartMailer-input"
                              style={{ minWidth: "70px" }}
                              disabled={isSending}
                            >
                              {Array.from({ length: 60 }, (_, i) => {
                                const m = i.toString().padStart(2, "0");
                                return (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                );
                              })}
                            </select>

                            <select
                              value={ampm}
                              onChange={(e) =>
                                handleScheduleTimeChange("ampm", e.target.value)
                              }
                              className="smartMailer-input"
                              style={{ minWidth: "70px" }}
                              disabled={isSending}
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>

                          {/* Time Preview */}
                          <div
                            style={{
                              marginTop: "8px",
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "4px",
                              fontSize: "14px",
                              color: "#666",
                            }}
                          >
                            Selected Time: {scheduleTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="smartMailer-action-buttons">
                    {sendType === "now" && (
                      <button
                        onClick={handleSendNow}
                        disabled={!canSendNow || isSending}
                        className="smartMailer-send-button"
                      >
                        {isSending ? (
                          <>
                            <div className="smartMailer-spinner"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="smartMailer-button-icon" />
                            Send Email Now ({getRecipientCount(
                              selectedRange
                            )}{" "}
                            recipients)
                          </>
                        )}
                      </button>
                    )}

                    {sendType === "schedule" && (
                      <button
                        onClick={handleSaveDraft}
                        disabled={!canSaveDraft || isSending}
                        className="smartMailer-draft-button"
                      >
                        {isSending ? (
                          <>
                            <div className="smartMailer-spinner"></div>
                            Scheduling...
                          </>
                        ) : (
                          <>
                            <Calendar className="smartMailer-button-icon" />
                            Schedule Email ({getRecipientCount(
                              selectedRange
                            )}{" "}
                            recipients)
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
        {/* Footer */}
        <div className="smartMailer-footer">
          <p>
            Powered by SmartMailer Pro • AI-Enhanced Email Marketing Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartMailer;
