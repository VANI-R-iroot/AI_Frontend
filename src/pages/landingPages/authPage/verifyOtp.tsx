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
  const [flow, setFlow] = useState<"reset" | "signup">("reset");

  useEffect(() => {
    const state = (location.state as { notice?: string; flow?: "reset" | "signup" } | null) || null;
    const noticeFromState = state?.notice;
    if (noticeFromState) {
      setNotice(noticeFromState);
      toast.success(noticeFromState);
      setTimeout(() => {
        navigate(location.pathname + location.search, { replace: true, state: null });
      }, 0);
    }

    const params = new URLSearchParams(location.search);
    const queryFlow = params.get("flow");
    const resolvedFlow = state?.flow === "signup" || queryFlow === "signup" ? "signup" : "reset";
    setFlow(resolvedFlow);

    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem("otp_email", emailParam);
      return;
    }

    const storedEmail = localStorage.getItem("otp_email");
    if (!storedEmail) {
      toast.error("Email missing. Redirecting to reset page...");
      navigate(resolvedFlow === "signup" ? "/register" : "/forget-password");
    } else {
      setEmail(storedEmail);
    }
  }, [location.pathname, location.search, location.state, navigate]);

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email missing. Please go back and try again.");
      return;
    }
    try {
      const response = await axiosInstance.post("/send-otp", {
        email,
        purpose: flow === "signup" ? "signup" : "password_reset",
      });
      const msg = response.data?.message || "OTP sent successfully";
      toast.success(msg);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to resend OTP";
      toast.error(msg);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!OTP.trim()) return toast.error("OTP is required");
    if (!email) return toast.error("Email missing. Go back and try again.");

    try {
      const response = await axiosInstance.post("/otp-verify", {
        email,
        OTP,
        purpose: flow === "signup" ? "signup" : "password_reset",
      });
      const { status, message } = response.data;

      if (status === "success") {
        const notice = message || "OTP verified!";
        toast.success(notice);

        if (flow === "signup") {
          const pendingRaw = sessionStorage.getItem("signup_pending_payload");
          if (!pendingRaw) {
            toast.error("Signup details missing. Please register again.");
            navigate("/register", { replace: true });
            return;
          }

          let pendingPayload: {
            name: string;
            email: string;
            password: string;
            auth: string;
          } | null = null;
          try {
            pendingPayload = JSON.parse(pendingRaw);
          } catch {
            pendingPayload = null;
          }

          if (!pendingPayload?.name || !pendingPayload?.email || !pendingPayload?.password) {
            toast.error("Signup details are invalid. Please register again.");
            sessionStorage.removeItem("signup_pending_payload");
            navigate("/register", { replace: true });
            return;
          }

          const registerResponse = await axiosInstance.post("/authRegistration", {
            ...pendingPayload,
            OTP,
          });

          if (registerResponse.status === 201) {
            const successMessage =
              registerResponse.data?.message || "Registration successful!";
            sessionStorage.removeItem("signup_pending_payload");
            localStorage.removeItem("otp_email");
            toast.success(successMessage);
            navigate("/login", {
              replace: true,
              state: { registered: true, message: successMessage },
            });
            return;
          }
        } else {
          localStorage.removeItem("otp_email");
          navigate("/set-password", {
            state: { email, OTP, notice },
            replace: true,
          });
          return;
        }
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
            <h2>{flow === "signup" ? "Verify Signup OTP" : "Verify OTP"}</h2>
            <p className="text-center">An OTP has been sent to:</p>
            <div className="email-display">
              <h6>{email || "No email found"}</h6>
              <Link to={flow === "signup" ? "/register" : "/forget-password"} className="change-link">
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

            <p className="login-link" style={{ cursor: "pointer" }} onClick={handleResendOtp}>
              Resend OTP
            </p>
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
