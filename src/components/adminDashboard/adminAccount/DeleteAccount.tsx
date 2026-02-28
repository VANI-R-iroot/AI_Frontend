import React, { useState } from "react";

interface DeleteAccountProps {
  onCancel: () => void;
}

const DeleteAccount: React.FC<DeleteAccountProps> = () => {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
  });
  const [errors, setErrors] = useState({
    newPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "email") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "newPassword") {
      setPasswordData({ ...passwordData, [name]: value });
      setErrors({ newPassword: "" });
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

    try {
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: passwordData.newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      alert("Account deleted successfully");
    } catch (err: any) {
      alert(err.message || "Failed to delete account");
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
          <label htmlFor="newPassword" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
          {errors.newPassword && (
            <div className="text-danger">{errors.newPassword}</div>
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
            className="delete-button"
            disabled={confirmation.toLowerCase() !== "delete"}
          >
            DELETE ACCOUNT
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeleteAccount;
