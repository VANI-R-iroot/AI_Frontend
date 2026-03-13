import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axiosInstance from "../../../utils/baseUrl";
import HomeNavbar from "../../../common/HomeNavbar";
import images from "../../../assets/image/Home-02/AllIamge";
import imgeRight from "../../../assets/image/Home-02/authPages/Thumbnail.png";
import { getPasswordPolicyError } from "../../../utils/passwordPolicy";

const SetNewPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [OTP, setOTP] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { email: string; OTP: string; notice?: string } | null;
    if (state?.notice) {
      setNotice(state.notice);
      toast.success(state.notice);
    }
    if (!state?.email || !state?.OTP) {
      toast.error("Missing data. Please verify OTP again.");
      navigate("/forget-password");
    } else {
      setEmail(state.email);
      setOTP(state.OTP);
    }
  }, [location.state, navigate]);

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword)
      return toast.error("All fields are required");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");
    const passwordPolicyError = getPasswordPolicyError(password);
    if (passwordPolicyError) return toast.error(passwordPolicyError);

    try {
      const response = await axiosInstance.post("/recover-password", {
        email,
        OTP,
        password,
      });

      const { status, message } = response.data;

      if (status === true || status === "true") {
        const notice = message || "Password reset successful!";
        toast.success(notice);
        navigate("/login", { replace: true, state: { notice } });
      } else {
        toast.error(message || "Failed to reset password.");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Something went wrong!";
      toast.error(msg);
    }
  };

  return (
    <>
      <HomeNavbar />
      <div className="login-fullscreen-container">
        <div className="login-left-section">
          <div className="auth-card">
            <h2>Set New Password</h2>
            {notice ? (
              <p className="text-center" style={{ color: "#22c55e" }}>
                {notice}
              </p>
            ) : null}
            <form onSubmit={handleSetNewPassword}>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="input-icon">
                    <img src={images.lockIcon} alt="lock" />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-with-icon">
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div className="input-icon">
                    <img src={images.lockIcon} alt="lock" />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-signup">
                Reset Password
              </button>
            </form>
          </div>
        </div>
        <div className="login-right-section">
          <img
            src={imgeRight}
            alt="Login Banner"
            className="login-right-image"
          />
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} style={{ zIndex: 99999 }} />
    </>
  );
};

export default SetNewPassword;
