import React, { useState } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import axiosInstance from "../../../utils/baseUrl";
import { getPasswordPolicyError } from "../../../utils/passwordPolicy";

const ChangePassword: React.FC = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });

    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else {
      const passwordPolicyError = getPasswordPolicyError(passwordData.newPassword);
      if (passwordPolicyError) {
        newErrors.newPassword = passwordPolicyError;
        isValid = false;
      }
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const response = await axiosInstance.put("/user-password-update", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.status === "success") {
        toast.success("✅ Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.data.message || "❌ Failed to change password");
      }
    } catch (error: any) {
      console.error("Password change error:", error);
      const errorMessage = error.response?.data?.message || "❌ Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password">
      <div className="mb-4">
        <h4>Change Password</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-12 input-filed-item-smart-ai">
            <label htmlFor="currentPassword" className="form-label">
              Current Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPasswords.currentPassword ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleChange}
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("currentPassword")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                  color: "#666",
                }}
              >
                {showPasswords.currentPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <div className="text-danger">{errors.currentPassword}</div>
            )}
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-12 input-filed-item-smart-ai">
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPasswords.newPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("newPassword")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                  color: "#666",
                }}
              >
                {showPasswords.newPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <div className="text-danger">{errors.newPassword}</div>
            )}
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12 input-filed-item-smart-ai">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirmPassword")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                  color: "#666",
                }}
              >
                {showPasswords.confirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="text-danger">{errors.confirmPassword}</div>
            )}
          </div>
        </div>

        <div className="d-flex profile-setting-update-button">
          <button 
            type="submit" 
            className="generate-btn btn-image"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;

