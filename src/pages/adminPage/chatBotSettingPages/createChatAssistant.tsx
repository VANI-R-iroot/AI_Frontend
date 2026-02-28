import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../utils/baseUrl.ts";
import PngImageUploader from "../../../common/ImageUploaderProps";
import { apiConfig } from "../../../utils/apiConfig.tsx";
import PageLoader from "../../../common/loader";

interface FormDataType {
  assistantIcon: string;
  assistantName: string;
  assistantTitle: string;
  model: string;
  randomness: string;
  frequencyPenalty: string;
  presencePenalty: string;
  maximumLength: string;
  assistantGroup: string;
  package: string;
  brandIcon: string;
  promptDescription: string;
}

const CreateChatAssistant: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state || null;
  const [isSubmitting, setIsSubmitting] = useState(true);
  const [models, setModels] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [packages, setPackages] = useState<string[]>([]);
  const [assistantAvatar, setAssistantAvatar] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    assistantIcon: "",
    assistantName: "",
    assistantTitle: "",
    model: "",
    randomness: "0.7",
    frequencyPenalty: "0.7",
    presencePenalty: "0.7",
    maximumLength: "40000",
    assistantGroup: "",
    package: "",
    brandIcon: "",
    promptDescription: "",
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [modelRes, groupRes, packageRes] = await Promise.all([
          axiosInstance.get("/getModels/1/1000/0"),
          axiosInstance.get("/getGroups/1/1000/0"),
          axiosInstance.get("/getPackages/1/1000/0"),
        ]);
        setModels(modelRes.data.data.users || []);
        setGroups(groupRes.data.data.users || []);
        setPackages(packageRes.data.data.users || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData({
        assistantIcon: editData.assistantIcon || "",
        assistantName: editData.assistantName || "",
        assistantTitle: editData.assistantTitle || "",
        model: editData.selectedModel || "",
        randomness: editData.randomness?.toString() || "0.7",
        frequencyPenalty: editData.frequencyPenalty?.toString() || "0.7",
        presencePenalty: editData.presencePenalty?.toString() || "0.7",
        maximumLength: editData.token?.toString() || "40000",
        assistantGroup: editData.assistantGroup || "",
        package: editData.packageType || "",
        brandIcon: editData.brandIcon || "",
        promptDescription: editData.promptDescription || "",
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

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value).toFixed(1) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submissionData = new FormData();

      if (assistantAvatar) {
        submissionData.append("assistantIcon", assistantAvatar);
      }

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") {
          submissionData.append(key, value);
        }
      });

      let response;
      if (editData?._id) {
        // UPDATE
        submissionData.append("id", editData._id);
        response = await axiosInstance.put("/updateAssistant", submissionData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // CREATE
        response = await axiosInstance.post(
          "/createAssistant",
          submissionData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      if (response.data.status === "success") {
        navigate("/custom-chatbot-assistant", { state: { refresh: true } });
      } else {
        alert("Failed to save assistant");
      }
    } catch (error) {
      console.error("Error saving assistant:", error);
      alert("An error occurred while saving the assistant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (file: File) => {
    setAssistantAvatar(file);
  };

  return (
    <div className="create-assistant-container">
      <PageLoader isLoading={isLoading} />
      <div className="cancel-admin-dashboard-button-global">
        <button
          onClick={() => navigate("/custom-chatbot-assistant")}
          type="button"
        >
          Cancel
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group input-filed-item-smart-ai">
          <PngImageUploader
            onImageSelect={handleImageSelect}
            required={!editData}
            minWidth={60}
            minHeight={60}
          />

          {editData && !assistantAvatar && (
            <img
              src={`${apiConfig.imageUrl}/${formData.assistantIcon}`}
              alt="Current Assistant Icon"
              style={{ width: 80, marginTop: 10 }}
            />
          )}
        </div>
        <div className="form-group input-filed-item-smart-ai">
          <label>Assistant Name</label>
          <input
            type="text"
            name="assistantName"
            value={formData.assistantName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group input-filed-item-smart-ai">
          <label>Assistant Title</label>
          <input
            type="text"
            name="assistantTitle"
            value={formData.assistantTitle}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="text-to-image-item">
          <label>Model</label>
          <div className="select-item-data">
            <select
              name="model"
              className="form-select"
              value={formData.model}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Model</option>
              {models.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-to-image-item">
          <label>Assistant Group</label>
          <div className="select-item-data">
            <select
              className="form-select"
              name="assistantGroup"
              value={formData.assistantGroup}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Group</option>
              {groups.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-to-image-item">
          <label>Package</label>
          <div className="select-item-data">
            <select
              className="form-select"
              name="package"
              value={formData.package}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Package</option>
              {packages.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group input-filed-item-smart-ai pt-3">
          <label>Brand Icon</label>
          <input
            type="text"
            name="brandIcon"
            value={formData.brandIcon}
            onChange={handleInputChange}
            placeholder="Enter FontAwesome Icon (optional)"
          />
        </div>

        <div className="admin-assistant-from-row pt-4">
          <div className="form-group half">
            <label>Randomness: {formData.randomness}</label>
            <input
              className="admin-dashboard-progress-bar"
              type="range"
              name="randomness"
              min="0"
              max="2"
              step="0.1"
              value={formData.randomness}
              onChange={handleSliderChange}
            />
          </div>

          <div className="form-group half">
            <label>Frequency Penalty: {formData.frequencyPenalty}</label>
            <input
              className="admin-dashboard-progress-bar"
              type="range"
              name="frequencyPenalty"
              min="0"
              max="2"
              step="0.1"
              value={formData.frequencyPenalty}
              onChange={handleSliderChange}
            />
          </div>
        </div>

        <div className="admin-assistant-from-row">
          <div className="form-group half">
            <label>Presence Penalty: {formData.presencePenalty}</label>
            <input
              className="admin-dashboard-progress-bar"
              type="range"
              name="presencePenalty"
              min="0"
              max="2"
              step="0.1"
              value={formData.presencePenalty}
              onChange={handleSliderChange}
            />
          </div>

          <div className="form-group half">
            <label>Maximum Length: {formData.maximumLength}</label>
            <input
              className="admin-dashboard-progress-bar"
              type="range"
              name="maximumLength"
              min="0"
              max="40000"
              step="1"
              value={formData.maximumLength}
              onChange={handleSliderChange}
            />
          </div>
        </div>
        <div className="text-to-image-item">
          <div className="smart-ai-prompt-are">
            <label>Description</label>
            <textarea
              name="promptDescription"
              value={formData.promptDescription}
              onChange={handleInputChange}
              rows={6}
              required
            />
          </div>
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
            ? "Update Assistant"
            : "Create Assistant"}
        </button>
      </form>
    </div>
  );
};

export default CreateChatAssistant;
