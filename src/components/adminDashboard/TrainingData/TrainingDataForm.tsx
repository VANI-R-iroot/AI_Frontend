import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/baseUrl";
import { toast } from "react-toastify";

interface TrainingDataFormProps {
  onClose: () => void;
  editingTrainingData: {
    _id: string;
    TrainingDataTitle: string;
    TrainingDataStatus: boolean;
  } | null;
  fetchTrainingData?: () => void;
}

const TrainingDataForm: React.FC<TrainingDataFormProps> = ({
  onClose,
  editingTrainingData,
  fetchTrainingData,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    active: true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingTrainingData) {
      setFormData({
        title: editingTrainingData.TrainingDataTitle,
        active: editingTrainingData.TrainingDataStatus,
      });
    }
  }, [editingTrainingData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.title.length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    if (!selectedFile && !editingTrainingData) {
      newErrors.file = "File is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedExtensions = [".txt", ".doc", ".docx", ".pdf"];
    const fileName = file.name.toLowerCase();
    const isValidFile = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidFile) {
      setErrors((prev) => ({
        ...prev,
        file: "Only .txt, .doc, .docx, and .pdf files are allowed",
      }));
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setErrors((prev) => ({
      ...prev,
      file: "",
    }));
  };

  const removeFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("TrainingDataStatus", String(formData.active));

      if (selectedFile) {
        formDataToSend.append("file", selectedFile);
      }

      if (editingTrainingData) {
        const res = await axiosInstance.put(
          `/update-training-data/${editingTrainingData._id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.status === 200) {
          toast.success("Training data updated successfully!");
          fetchTrainingData?.();
          onClose();
        } else {
          toast.error("Update failed.");
        }
      } else {
        const res = await axiosInstance.post(
          "/createTrainingData",
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.status === 200 || res.status === 201) {
          toast.success("Training data created successfully!");
          setFormData({ title: "", active: true });
          setSelectedFile(null);
          fetchTrainingData?.();
          onClose();
        } else {
          toast.error("Creation failed.");
        }
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error?.response?.data?.message || "Submission failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const toggleActive = () => {
    setFormData((prev) => ({
      ...prev,
      active: !prev.active,
    }));
  };

  return (
    <div className="announcement-form-overlay">
      <div className="announcement-form-container">
        <div className="announcement-form-header">
          <h2>
            {editingTrainingData
              ? "Edit Training Data"
              : "Upload Training Data"}
          </h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="announcement-form">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <label style={{ margin: 0 }}>Training Data Active</label>
            <div
              className={`toggle-switch ${
                formData.active ? "active" : "inactive"
              }`}
              onClick={toggleActive}
              style={{ cursor: "pointer" }}
            >
              <div className="toggle-knob"></div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              File Title <span className="required">*</span>
            </label>
            <textarea
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-input ${errors.title ? "error" : ""}`}
              placeholder="Enter training data title"
              disabled={isLoading}
              maxLength={200}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
            <div className="character-count">{formData.title.length}/200</div>
          </div>

          <div className="form-group">
            <label htmlFor="file" className="form-label">
              Upload File <span className="required">*</span>
            </label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleFileChange}
              className={`form-input ${errors.file ? "error" : ""}`}
              disabled={isLoading}
              accept=".txt,.doc,.docx,.pdf"
            />
            {errors.file && (
              <span className="error-message">{errors.file}</span>
            )}
            {selectedFile && (
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ fontSize: "0.9rem", color: "#666" }}>
                  Selected: {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={removeFile}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc3545",
                    cursor: "pointer",
                    fontSize: "1rem",
                    padding: "0 0.5rem",
                  }}
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>
            )}
            <div
              style={{
                fontSize: "0.85rem",
                color: "#666",
                marginTop: "0.25rem",
              }}
            >
              Only .txt, .doc, .docx, and .pdf files are allowed
            </div>
          </div>

          <div className="announcement-form-actions-button">
            <button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : editingTrainingData
                ? "Update"
                : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingDataForm;
