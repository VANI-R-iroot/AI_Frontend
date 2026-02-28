import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../../utils/baseUrl";
import { useUserStore } from "../../../zustand/userDetailsStore";
import { toast } from "react-toastify";

interface FormDataType {
  chatbotName: string;
  domainName: string;
  targetPlatform: string;
  active: string;
  googleDocIds: string[];
}

interface CardData {
  _id: string;
  targetPlatform: string;
  chatbotName?: string;
  domainName?: string;
  active?: boolean;
  googleDocIds?: string[];
  createdAt?: string;
}

interface TrainPluginProps {
  onBack: () => void;
  pluginData: CardData | null;
  editData?: CardData | null;
}

const TrainPlugin: React.FC<TrainPluginProps> = ({
  onBack,
  pluginData,
  editData,
}) => {
  const userData = useUserStore((state) => state.userData);
  const location = useLocation();
  const editDataFromState = location.state || editData || null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    chatbotName: "",
    domainName: "",
    targetPlatform: pluginData?.targetPlatform || "",
    active: "true",
    googleDocIds: [""],
  });

  useEffect(() => {
    if (editDataFromState) {
      setFormData({
        chatbotName: editDataFromState.chatbotName || "",
        domainName: editDataFromState.domainName || "",
        targetPlatform:
          editDataFromState.targetPlatform || pluginData?.targetPlatform || "",

        active: editDataFromState.active?.toString() || "true",

        googleDocIds: editDataFromState.googleDocIds?.length
          ? editDataFromState.googleDocIds
          : [""],
      });
    } else if (pluginData?.targetPlatform) {
      setFormData((prev) => ({
        ...prev,
        targetPlatform: pluginData.targetPlatform,
      }));
    }
  }, [editDataFromState, pluginData]);

  const validateDomain = (domain: string): boolean => {
    const cleanDomain = domain.trim();

    if (!cleanDomain) return true;
    if (/[A-Z]/.test(cleanDomain)) {
      return false;
    }

    // Valid TLDs list
    const validTLDs = [
      "com",
      "net",
      "org",
      "co",
      "io",
      "ai",
      "app",
      "dev",
      "tech",
      "xyz",
      "biz",
      "info",
      "online",
      "site",
      "store",
      "cloud",
      "tools",
      "software",
      "systems",
      "me",
      "us",
      "uk",
      "in",
      "ca",
      "au",
      "de",
      "fr",
      "it",
      "es",
      "nl",
      "se",
      "ch",
      "be",
      "jp",
      "kr",
      "cn",
      "tv",
      "fm",
      "ly",
      "to",
      "vc",
      "cc",
      "ac",
      "pw",
      "pro",
      "guru",
      "solutions",
      "agency",
      "media",
      "network",
      "digital",
      "studio",
      "design",
      "support",
      "company",
      "world",
      "global",
      "life",
      "live",
      "capital",
      "finance",
      "news",
      "today",
      "group",
      "email",
      "chat",
      "social",
      "marketing",
      "center",
      "ventures",
      "consulting",
    ];

    if (
      cleanDomain.includes("://") ||
      cleanDomain.includes("/") ||
      cleanDomain.includes(" ") ||
      cleanDomain.startsWith(".") ||
      cleanDomain.endsWith(".")
    ) {
      return false;
    }

    const domainRegex =
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/;

    if (!domainRegex.test(cleanDomain)) {
      return false;
    }

    // Extract TLD and validate
    const parts = cleanDomain.split(".");
    const tld = parts[parts.length - 1];

    return validTLDs.includes(tld);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleDocIdChange = (index: number, value: string) => {
    const newGoogleDocIds = [...formData.googleDocIds];
    newGoogleDocIds[index] = value;
    setFormData((prev) => ({ ...prev, googleDocIds: newGoogleDocIds }));
  };

  const addGoogleDocId = () => {
    if (formData.googleDocIds.length < 5) {
      setFormData((prev) => ({
        ...prev,
        googleDocIds: [...prev.googleDocIds, ""],
      }));
    }
  };

  const removeGoogleDocId = (index: number) => {
    if (formData.googleDocIds.length > 1) {
      const newGoogleDocIds = formData.googleDocIds.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({ ...prev, googleDocIds: newGoogleDocIds }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!userData._id) {
      toast.error("User ID is missing. Please reload the page.");
      return;
    }
    try {
      const payload = {
        userId: userData._id,
        agentId: pluginData?._id || "",
        chatbotName: formData.chatbotName,
        targetPlatform: formData.targetPlatform,
        active: formData.active === "true",
        domainName: formData.domainName.toLowerCase().trim(),
        googleDocIds: formData.googleDocIds.filter((id) => id.trim() !== ""),
      };

      let response;

      if (editDataFromState?._id) {
        response = await axiosInstance.put(
          `/update-download-plugin-data/${editDataFromState._id}`,
          payload
        );
      } else {
        response = await axiosInstance.post("/create-trined", payload);
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(
          editDataFromState?._id
            ? "Plugin updated successfully!"
            : "Plugin created successfully!"
        );
        onBack();
      } else {
        toast.error("Failed to save plugin");
      }
    } catch (error) {
      console.error("Error saving plugin:", error);
      toast.error("An error occurred while saving the plugin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = () => {
    const newStatus = formData.active === "true" ? "false" : "true";
    setFormData((prev) => ({ ...prev, active: newStatus }));
  };

  return (
    <div className="main-content-common widget-customize-full-section">
      <div className="create-assistant">
        <div className="user-dashboard-common-sub-title">
          <h2>
            {editDataFromState?._id
              ? "Edit AI Assistant Training Data"
              : "Training AI Assistant By Your Business Data"}
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <label style={{ margin: 0 }}>Plugin Active</label>
            <div
              className={`toggle-switch ${
                formData.active === "true" ? "active" : "inactive"
              }`}
              onClick={toggleActive}
              style={{ cursor: "pointer" }}
            >
              <div className="toggle-knob"></div>
            </div>
          </div>

          <div className="cancel-admin-dashboard-button-global">
            <button onClick={onBack}>← Back</button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group input-filed-item-smart-ai">
            <label>Chatbot Name</label>
            <input
              type="text"
              name="chatbotName"
              value={formData.chatbotName}
              onChange={handleInputChange}
              required
              placeholder="Enter chatbot name"
            />
          </div>

          <div className="form-group input-filed-item-smart-ai pt-3">
            <label>Target Platform</label>
            <input
              type="text"
              name="targetPlatform"
              value={formData.targetPlatform}
              onChange={handleInputChange}
              placeholder="domain.com or subdomain.domain.com"
              readOnly={!!pluginData?.targetPlatform}
            />
          </div>

          <div className="form-group input-filed-item-smart-ai pt-3">
            <label>Enter Domain Name [Where Install Widget]</label>
            <input
              type="text"
              name="domainName"
              value={formData.domainName}
              onChange={handleInputChange}
              placeholder="domain.com or subdomain.domain.com"
              required
              style={{
                borderColor:
                  formData.domainName && !validateDomain(formData.domainName)
                    ? "#f44336"
                    : "#ddd",
              }}
            />
            {formData.domainName && !validateDomain(formData.domainName) && (
              <p
                style={{ fontSize: "12px", color: "#f44336", marginTop: "5px" }}
              >
                Invalid domain format. Use format: domain.com or
                subdomain.domain.com
              </p>
            )}
          </div>

          <div className="form-group input-filed-item-smart-ai pt-3">
            <label>Google Doc IDs (Max 5)</label>
            {formData.googleDocIds.map((docId, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <input
                  type="text"
                  value={docId}
                  onChange={(e) =>
                    handleGoogleDocIdChange(index, e.target.value)
                  }
                  placeholder={`Google Doc ID ${index + 1}`}
                  style={{ flex: 1 }}
                />

                {index === formData.googleDocIds.length - 1 &&
                  formData.googleDocIds.length < 5 && (
                    <button
                      type="button"
                      onClick={addGoogleDocId}
                      style={{
                        background: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                      }}
                    >
                      +
                    </button>
                  )}

                {formData.googleDocIds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGoogleDocId(index)}
                    style={{
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                    }}
                  >
                    -
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="admin-blog-create-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? editDataFromState?._id
                ? "Updating..."
                : "Creating..."
              : editDataFromState?._id
              ? "Update Information"
              : "Create Plugin Info"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrainPlugin;
