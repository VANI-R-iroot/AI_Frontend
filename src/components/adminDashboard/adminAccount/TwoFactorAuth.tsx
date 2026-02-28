import React, { useState } from "react";

interface TwoFactorAuthProps {
  onCancel: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");

  const handleToggle2FA = () => {
    if (is2FAEnabled) {
      setIs2FAEnabled(false);
    } else {
      setIs2FAEnabled(true);
    }
  };

  const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
    setError("");
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      setError("Please enter verification code");
      return;
    }

    if (verificationCode.length !== 6) {
      setError("Verification code should be 6 digits");
      return;
    }
  };

  return (
    <div className="two-factor-auth">
      <div className="header">
        <h1>Two-Factor Authentication</h1>
      </div>

      <div className="toggle-container">
        <p>Enable Two-Factor Authentication</p>
        <div className="toggle-switch">
          <input
            type="checkbox"
            id="twoFactorToggle"
            checked={is2FAEnabled}
            onChange={handleToggle2FA}
          />
          <label htmlFor="twoFactorToggle"></label>
        </div>
      </div>

      {is2FAEnabled && (
        <>
          <div className="qr-section">
            <p>Scan this QR code with your authenticator app</p>
            <div className="qr-placeholder">
              <p>QR Code would appear here</p>
            </div>
            <p className="backup-code">
              Or use this code: <strong>ABCDEF123456</strong>
            </p>
          </div>

          <form onSubmit={handleVerify}>
            <div className="form-group">
              <div className="form-field full-width">
                <label htmlFor="verificationCode">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={handleVerificationChange}
                  placeholder="000000"
                  maxLength={6}
                />
                {error && <p className="error">{error}</p>}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-button">
                CANCEL
              </button>
              <button type="submit" className="verify-button">
                VERIFY
              </button>
            </div>
          </form>
        </>
      )}

      {!is2FAEnabled && (
        <div className="info-message">
          <p>
            Two-factor authentication adds an extra layer of security to your
            account.
          </p>
          <p>
            When enabled, you'll need both your password and a verification code
            from your phone to sign in.
          </p>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;
