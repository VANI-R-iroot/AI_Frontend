import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../utils/baseUrl";
import { toast } from "react-toastify";

interface FormDataType {
  chatbotName: string;
  shortTitle: string;
  targetPlatform: string;
  active: string;
  backendUrl: string;
  image?: File | null;
  imagePreview?: string;
  frontedUrl: string;
}

const SetUpPlugin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state || null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    chatbotName: "",
    shortTitle: "",
    targetPlatform: "",
    active: "true",
    image: null,
    imagePreview: "",

    frontedUrl: "",
    backendUrl: "",
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        chatbotName: editData.chatbotName || "",
        shortTitle: editData.shortTitle || "",
        targetPlatform: editData.targetPlatform || "",
        active: editData.active?.toString() || "true",
        image: null,
        imagePreview: editData.imageUrl || "",

        frontedUrl: editData.frontedUrl || "",
        backendUrl: editData.backendUrl || "",
      });
    }
  }, [editData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;

      const formDataToSend = new FormData();
      formDataToSend.append("chatbotName", formData.chatbotName);
      formDataToSend.append("frontedUrl", formData.frontedUrl);
      formDataToSend.append("shortTitle", formData.shortTitle);
      formDataToSend.append("targetPlatform", formData.targetPlatform);
      formDataToSend.append("backendUrl", formData.backendUrl || "");
      formDataToSend.append("active", (formData.active === "true").toString());

      // Add image if selected
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (editData?._id) {
        response = await axiosInstance.put(
          `/update-plugin-data/${editData._id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axiosInstance.post("/createPlugin", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.status === 201 || 200) {
        navigate("/plugin-list", { state: { refresh: true } });
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
    <div className="main-content-common">
      <div className="create-assistant-container">
        <div className="plugin-header-container">
          <div className="cancel-admin-dashboard-button-global">
            <button onClick={() => navigate("/plugin-list")}>← Back</button>
          </div>

          <div className="plugin-toggle-section">
            <label>Plugin Active</label>
            <div
              className={`toggle-switch ${
                formData.active === "true" ? "active" : "inactive"
              }`}
              onClick={toggleActive}
            >
              <div className="toggle-knob"></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group input-filed-item-smart-ai">
            <label>Upload Image</label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                onClick={handleImageClick}
                className="plugin-page-image-upload-box"
              >
                {formData.imagePreview ? (
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "inherit",
                    }}
                  />
                ) : (
                  <div style={{ textAlign: "center", color: "#f5f5f5" }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                      📷
                    </div>
                    <div>Click to upload image</div>
                    <div style={{ fontSize: "12px" }}>80x80px</div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />

              {formData.imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#ff4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>

          <div className="form-group input-filed-item-smart-ai">
            <label>Chatbot Name</label>
            <input
              type="text"
              name="chatbotName"
              value={formData.chatbotName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group input-filed-item-smart-ai">
            <label>Your fronted URL</label>
            <input
              type="text"
              name="frontedUrl"
              value={formData.frontedUrl}
              onChange={handleInputChange}
              placeholder="https://yourdomain.com"
              required
            />
          </div>
          <div className="form-group input-filed-item-smart-ai">
            <label>Your Backend URL</label>
            <input
              type="text"
              name="backendUrl"
              value={formData.backendUrl}
              onChange={handleInputChange}
              placeholder="https://yourdomain.com"
              required
            />
          </div>
          <div className="text-to-image-item">
            <label>Target Platform</label>
            <div className="select-item-data">
              <select
                className="form-select"
                name="targetPlatform"
                value={formData.targetPlatform}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Platform</option>
                <option value="Wordpress">Wordpress</option>
                <option value="PHP">PHP</option>
                <option value="React js">JavaScript web</option>
                <option value="Wix">Wix</option>
                <option value="Shopify">Shopify</option>
                <option value=".Net">.Net</option>
              </select>
            </div>
          </div>

          <div className="form-group input-filed-item-smart-ai pt-3">
            <label>Short Title</label>

            <input
              type="text"
              name="shortTitle"
              value={formData.shortTitle}
              onChange={handleInputChange}
            />
          </div>

          <button
            type="submit"
            className="admin-blog-create-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? editData?._id
                ? "Updating..."
                : "Creating..."
              : editData?._id
              ? "Update Information"
              : "Create Plugin info"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetUpPlugin;
