import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axiosInstance from "../../../utils/baseUrl";
import VerificationInput from "react-verification-input";
import imgeRight from "../../../assets/image/Home-02/authPages/Thumbnail.png";

const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [OTP, setOtp] = useState("");
  const [email, setEmail] = useState<string | null>("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const noticeFromState = (location.state as { notice?: string } | null)?.notice;
    if (noticeFromState) {
      setNotice(noticeFromState);
      toast.success(noticeFromState);
      setTimeout(() => {
        navigate(location.pathname + location.search, { replace: true, state: null });
      }, 0);
    }
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem("otp_email", emailParam);
      return;
    }
    const storedEmail = localStorage.getItem("otp_email");
    if (!storedEmail) {
      toast.error("Email missing. Redirecting to reset page...");
      navigate("/forget-password");
    } else {
      setEmail(storedEmail);
    }
  }, [location.search, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!OTP.trim()) return toast.error("OTP is required");
    if (!email) return toast.error("Email missing. Go back and try again.");

    try {
      const response = await axiosInstance.post("/otp-verify", { email, OTP });
      const { status, message } = response.data;

      if (status === "success") {
        const notice = message || "OTP verified!";
        toast.success(notice);
        localStorage.removeItem("otp_email");

        navigate("/set-password", {
          state: { email, OTP, notice },
          replace: true,
        });
      } else {
        toast.error(message || "Invalid OTP.");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Something went wrong!";
      toast.error(msg);
    }
  };

  return (
    <>
      <div className="login-fullscreen-container">
        <div className="login-left-section">
          <div className="auth-card">
            <h2>Verify OTP</h2>
            <p className="text-center">An OTP has been sent to:</p>
            <div className="email-display">
              <h6>{email || "No email found"}</h6>
              <Link to="/forget-password" className="change-link">
                Change
              </Link>
            </div>
            {notice ? (
              <p className="text-center" style={{ color: "#22c55e" }}>
                {notice}
              </p>
            ) : null}

            <form onSubmit={handleVerify}>
              <div className="verify-otp-input-field">
                <VerificationInput
                  placeholder="_"
                  onChange={setOtp}
                  validChars="0-9"
                  inputProps={{ inputMode: "numeric" }}
                  classNames={{ characterSelected: "vi__character--selected" }}
                  length={6}
                />
              </div>
              <button type="submit" className="btn-signup">
                Verify
              </button>
            </form>

            <p className="login-link">Resend OTP</p>
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

export default VerifyOtp;
