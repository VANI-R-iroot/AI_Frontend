import React, { useState } from "react";
import { useUserStore } from "../../../zustand/userDetailsStore";
import axiosInstance from "../../../utils/baseUrl";
import { toast } from "react-toastify";

const EditProfile: React.FC = () => {
  const userData = useUserStore((state) => state.userData);
  const setUserData = useUserStore((state) => state.setUserData);

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    jobRole: userData?.jobRole || "",
    email: userData?.email || "",
    phoneNumber: userData?.phoneNumber || "",
    companyName: userData?.companyName || "",
    companyWebsite: userData?.companyWebsite || "",
    addressLine: userData?.addressLine || "",
    city: userData?.city || "",
    postalCode: userData?.postalCode || "",
    country: userData?.country || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      // Append all form fields - FIXED: removed trailing space and ensured correct field names
      data.append("name", formData.name);
      data.append("jobRole", formData.jobRole);
      data.append("phoneNumber", formData.phoneNumber);
      data.append("companyName", formData.companyName);
      data.append("companyWebsite", formData.companyWebsite);
      data.append("addressLine", formData.addressLine);
      data.append("city", formData.city);
      data.append("postalCode", formData.postalCode);
      data.append("country", formData.country);

      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const res = await axiosInstance.put(`/admin-profile-update`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.status === "success") {
        setUserData(res.data.data);
        toast.success("✅ Profile updated successfully!");
      } else {
        toast.error("❌ Update failed");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error(
        err.response?.data?.message || "❌ Something went wrong while updating."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile">
      <div className="header">
        <h4>Edit Profile</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6 input-filed-item-smart-ai">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 input-filed-item-smart-ai">
            <label className="form-label">Job Role</label>
            <input
              type="text"
              name="jobRole"
              value={formData.jobRole}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6 input-filed-item-smart-ai">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
          </div>
          <div className="col-md-6 input-filed-item-smart-ai">
            <label className="form-label">Phone Number</label>
            <div className="input-group">
              <span className="input-group-text">🇺🇸</span>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6 input-filed-item-smart-ai">
            <label className="form-label">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="form-control"
            />
          </div>
          <div className="col-md-6 input-filed-item-smart-ai">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-12 input-filed-item-smart-ai">
            <label className="form-label">Company Website</label>
            <input
              type="url"
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-12 input-filed-item-smart-ai">
            <label className="form-label">Address Line</label>
            <input
              type="text"
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4 input-filed-item-smart-ai">
            <label className="form-label">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4 input-filed-item-smart-ai">
            <label className="form-label">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4 input-filed-item-smart-ai">
            <label className="form-label">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="profile-setting-update-button pt-4">
          <button
            type="submit"
            className="generate-btn btn-image"
            disabled={loading}
          >
            <span className="btn-icon">✨</span>
            {loading ? "Updating..." : "UPDATE"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;