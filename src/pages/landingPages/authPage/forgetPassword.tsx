import React, { useState } from "react";
import images from "../../../assets/image/Home-02/AllIamge";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axiosInstance from "../../../utils/baseUrl";
import imgeRight from "../../../assets/image/Home-02/authPages/Thumbnail.png";

const ForgetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Email is required");

    try {
      const response = await axiosInstance.post("/send-otp", { email });
      const { status, message } = response.data;

      if (status === "success") {
        const notice = message || "OTP sent successfully!";
        toast.success(notice);
        localStorage.setItem("otp_email", email);
        setEmail("");
        navigate("/verify-Otp", { replace: true, state: { notice } });
      } else {
        toast.error(message || "Failed to send OTP.");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Something went wrong!";
      toast.error(msg);
      console.error("OTP Send Error:", msg);
    }
  };

  return (
    <>
      <div className="login-fullscreen-container">
        <div className="login-left-section">
          <div className="auth-card">
            <h2>Reset Password</h2>
            <p className="text-center mb-4">
              Please enter your registered email address
            </p>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <input
                    type="email"
                    id="email"
                    placeholder="aiprod@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="input-icon">
                    <img
                      src={images.emailIcon}
                      alt="email-icon"
                      className="social-icon"
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-signup">
                Send OTP
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

export default ForgetPassword;
