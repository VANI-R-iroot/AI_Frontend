import React, { useState, useEffect } from "react";
import axiosInstance from "../../../utils/baseUrl";
import { toast } from "react-toastify";

type AnnouncementType = "New" | "Update" | "Maintenance" | "Info";
type AnnouncementPriority = "normal" | "high";

interface AnnouncementFormProps {
  onClose: () => void;
  editingAnnouncement: {
    _id: string;
    AnnouncementTitle: string;
    AnnouncementType: AnnouncementType;
    AnnouncementStatus: boolean;
    AnnouncementDisplayLocations?: string;
    AnnouncementPriority?: AnnouncementPriority;
  } | null;
  fetchAnnouncements?: () => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  onClose,
  editingAnnouncement,
  fetchAnnouncements,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "New" as AnnouncementType,
    active: true,
    locations: ["dashboard"],
    priority: "normal" as AnnouncementPriority,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const announcementTypes: AnnouncementType[] = [
    "New",
    "Update",
    "Maintenance",
    "Info",
  ];
  const displayLocations = ["banner", "dashboard", "sidebar", "bell"];

  useEffect(() => {
    if (editingAnnouncement) {
      setFormData({
        title: editingAnnouncement.AnnouncementTitle,
        type: editingAnnouncement.AnnouncementType,
        active: editingAnnouncement.AnnouncementStatus,
        locations: editingAnnouncement.AnnouncementDisplayLocations
          ? editingAnnouncement.AnnouncementDisplayLocations.split(",")
              .map((loc) => loc.trim().toLowerCase())
              .filter(Boolean)
          : ["dashboard"],
        priority: editingAnnouncement.AnnouncementPriority || "normal",
      });
    }
  }, [editingAnnouncement]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (editingAnnouncement) {
        // UPDATE
        const res = await axiosInstance.put(
          `/update-announcement/${editingAnnouncement._id}`,
          {
            AnnouncementTitle: formData.title,
            AnnouncementType: formData.type,
            AnnouncementStatus: formData.active,
            AnnouncementDisplayLocations: formData.locations,
            AnnouncementPriority: formData.priority,
          }
        );

        if (res.status === 200) {
          toast.success("Announcement updated successfully!");
          fetchAnnouncements?.();
          onClose();
        } else {
          toast.error("Update failed.");
        }
      } else {
        // CREATE
        const res = await axiosInstance.post("/createAnnouncement", {
          AnnouncementTitle: formData.title,
          AnnouncementType: formData.type,
          AnnouncementStatus: formData.active,
          AnnouncementDisplayLocations: formData.locations,
          AnnouncementPriority: formData.priority,
        });

        if (res.status === 200 || res.status === 201) {
          toast.success("Announcement created successfully!");
          setFormData({
            title: "",
            type: "New",
            active: true,
            locations: ["dashboard"],
            priority: "normal",
          });
          fetchAnnouncements?.();
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const toggleLocation = (loc: string) => {
    setFormData((prev) => {
      const exists = prev.locations.includes(loc);
      const nextLocations = exists
        ? prev.locations.filter((l) => l !== loc)
        : [...prev.locations, loc];
      return {
        ...prev,
        locations: nextLocations.length > 0 ? nextLocations : ["dashboard"],
      };
    });
  };

  return (
    <div className="announcement-form-overlay">
      <div className="announcement-form-container">
        <div className="announcement-form-header">
          <h2>
            {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
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
            <label style={{ margin: 0 }}> Announcement Active</label>
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
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-input ${errors.title ? "error" : ""}`}
              placeholder="Enter announcement title"
              disabled={isLoading}
              maxLength={200}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
            <div className="character-count">{formData.title.length}/200</div>
          </div>

          <div className="form-group">
            <label htmlFor="type" className="form-label">
              Type <span className="required">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="form-select"
              disabled={isLoading}
            >
              {announcementTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Display Locations</label>
            <div className="announcement-location-options">
              {displayLocations.map((loc) => (
                <label key={loc} className="announcement-location-item">
                  <input
                    type="checkbox"
                    checked={formData.locations.includes(loc)}
                    onChange={() => toggleLocation(loc)}
                    disabled={isLoading}
                  />
                  <span>{loc}</span>
                </label>
              ))}
            </div>
            <div className="announcement-helper-text">
              Select where this announcement should appear.
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="priority" className="form-label">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="form-select"
              disabled={isLoading}
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="announcement-form-actions-button">
            <button type="submit" className="" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : editingAnnouncement
                ? "Update"
                : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementForm;
