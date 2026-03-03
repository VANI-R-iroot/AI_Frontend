import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/baseUrl";
import { useAuth } from "../../../context/AuthContext";
import { useUserStore } from "../../../zustand/userDetailsStore";

interface DeleteAccountProps {
  onCancel: () => void;
}

const DeleteAccount: React.FC<DeleteAccountProps> = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const userData = useUserStore((state) => state.userData);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: userData?.email || "",
  });
  const [passwordData, setPasswordData] = useState({
    password: "",
  });
  const [errors, setErrors] = useState({
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData?.email) {
      setFormData((prev) => ({ ...prev, email: userData.email }));
    }
  }, [userData?.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "email") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "password") {
      setPasswordData({ ...passwordData, [name]: value });
      setErrors({ password: "" });
    } else if (name === "deleteConfirmation") {
      setConfirmation(value);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmation.toLowerCase() !== "delete") {
      setError('Please type "delete" to confirm');
      return;
    }

    if (!formData.email || !passwordData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.delete("/user-delete-account", {
        data: {
          email: formData.email,
          password: passwordData.password,
        },
      });

      if (res.data?.status === "success") {
        toast.success("Account deleted successfully");
        logout();
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        navigate("/login", { replace: true });
      } else {
        throw new Error(res.data?.message || "Failed to delete account");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete account";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-account-form">
      <div className="header">
        <h4>Delete Account</h4>
      </div>

      <div className="warning-message">
        <p className="warning-title">
          ⚠️ Warning: This action cannot be undone
        </p>
        <p>Deleting your account will permanently remove all your data.</p>
        <p>
          Please type <strong>"delete"</strong> below to confirm.
        </p>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="input-filed-item-smart-ai mb-3">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </div>

        <div className="input-filed-item-smart-ai mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={passwordData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
          {errors.password && (
            <div className="text-danger">{errors.password}</div>
          )}
        </div>

        <div className="input-filed-item-smart-ai mb-3">
          <label htmlFor="deleteConfirmation">Type "delete" to confirm</label>
          <input
            type="text"
            id="deleteConfirmation"
            name="deleteConfirmation"
            value={confirmation}
            onChange={handleChange}
            placeholder="delete"
            autoComplete="off"
            required
          />
          {error && <p className="error text-danger">{error}</p>}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="delete-button btn btn-danger"
            disabled={loading || confirmation.toLowerCase() !== "delete"}
          >
            {loading ? "Deleting..." : "DELETE ACCOUNT"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeleteAccount;
