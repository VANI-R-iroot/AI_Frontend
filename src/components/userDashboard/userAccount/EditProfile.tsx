import React, { useEffect, useState } from "react";
import { useUserStore } from "../../../zustand/userDetailsStore";
import axiosInstance from "../../../utils/baseUrl";
import { toast } from "react-toastify";

const phoneCodeOptions = [
  { code: "+1", label: "US/CA (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+61", label: "AU (+61)" },
  { code: "+65", label: "SG (+65)" },
  { code: "+81", label: "JP (+81)" },
  { code: "+91", label: "IN (+91)" },
  { code: "+971", label: "UAE (+971)" },
];

const splitPhoneNumber = (value: string) => {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\+\d{1,4})\s*(.*)$/);
  if (match) {
    return {
      code: match[1],
      number: match[2] || "",
    };
  }
  return { code: "+1", number: raw };
};

const EditProfile: React.FC = () => {
  const userData = useUserStore((state) => state.userData);
  const setUserData = useUserStore((state) => state.setUserData);
  const initialPhone = splitPhoneNumber(
    userData?.phone_number || userData?.phoneNumber || ""
  );

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    jobRole: userData?.job_role || userData?.jobRole || "",
    email: userData?.email || "",
    phoneNumber: initialPhone.number,
    companyName: userData?.company_name || userData?.companyName || "",
    companyWebsite: userData?.company_website || userData?.companyWebsite || "",
    addressLine: userData?.address_line || userData?.addressLine || "",
    city: userData?.city || "",
    postalCode: userData?.postal_code || userData?.postalCode || "",
    country: userData?.country || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneCountryCode, setPhoneCountryCode] = useState(initialPhone.code);

  useEffect(() => {
    const latestPhone = splitPhoneNumber(
      userData?.phone_number || userData?.phoneNumber || ""
    );
    setFormData({
      name: userData?.name || "",
      jobRole: userData?.job_role || userData?.jobRole || "",
      email: userData?.email || "",
      phoneNumber: latestPhone.number,
      companyName: userData?.company_name || userData?.companyName || "",
      companyWebsite: userData?.company_website || userData?.companyWebsite || "",
      addressLine: userData?.address_line || userData?.addressLine || "",
      city: userData?.city || "",
      postalCode: userData?.postal_code || userData?.postalCode || "",
      country: userData?.country || "",
    });
    setPhoneCountryCode(latestPhone.code);
  }, [userData]);

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
      data.append("name", formData.name);
      data.append("job_role", formData.jobRole);
      data.append(
        "phone_number",
        `${phoneCountryCode} ${String(formData.phoneNumber || "").trim()}`.trim()
      );
      data.append("company_name", formData.companyName);
      data.append("company_website", formData.companyWebsite);
      data.append("address_line", formData.addressLine);
      data.append("city", formData.city);
      data.append("postal_code", formData.postalCode);
      data.append("country", formData.country);

      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const res = await axiosInstance.put(`/user-profile-update`, data, {
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
              <select
                className="form-select"
                style={{ maxWidth: "150px" }}
                value={phoneCountryCode}
                onChange={(e) => setPhoneCountryCode(e.target.value)}
              >
                {phoneCodeOptions.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
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
