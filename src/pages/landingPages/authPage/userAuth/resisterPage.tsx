import React, { useState } from "react";
import images from "../../../../assets/image/Home-02/AllIamge";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import imgeRight from "../../../../assets/image/Home-02/authPages/Thumbnail.png";
import axiosInstance from "../../../../utils/baseUrl";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../../../context/AuthContext";
import { useUserStore } from "../../../../zustand/userDetailsStore";
import { updateSessionUser } from "../../../../utils/userSession";
import {
  getPasswordPolicyError,
  PASSWORD_POLICY_MESSAGE,
} from "../../../../utils/passwordPolicy";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const setUserData = useUserStore((state) => state.setUserData);
  const isGoogleAuthConfigured =
    !!import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== "your google client id";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const auth = "user";

  const showLoginErrorToast = (
    message: string,
    statusCode?: number,
    errorCode?: string
  ) => {
    const msg = String(message || "");
    const showBlockedPopup = () => {
      toast.error("Your account is blocked. Please contact support.");
      window.alert("Your account is blocked. Please contact support.");
    };
    if (errorCode === "ACCOUNT_SUSPENDED") {
      showBlockedPopup();
      return;
    }
    if (
      msg.toLowerCase().includes("suspended") ||
      msg.toLowerCase().includes("blocked") ||
      statusCode === 403
    ) {
      showBlockedPopup();
      return;
    }
    toast.error(msg || "Request failed. Please try again.");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) return toast.error("Full name is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!password.trim()) return toast.error("Password is required");
    if (!confirmPassword.trim())
      return toast.error("Confirm password is required");
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return toast.error("Passwords do not match");
    }
    setConfirmPasswordError("");
    const passwordPolicyError = getPasswordPolicyError(password);
    if (passwordPolicyError) {
      setPasswordError(passwordPolicyError);
      return toast.error(passwordPolicyError);
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedName = fullName.trim();
      const response = await axiosInstance.post("/send-otp", {
        email: normalizedEmail,
        purpose: "signup",
      });

      if (response.status === 200 && response.data?.status === "success") {
        const notice = response.data?.message || "OTP sent successfully";
        sessionStorage.setItem(
          "signup_pending_payload",
          JSON.stringify({
            name: normalizedName,
            email: normalizedEmail,
            password,
            auth,
          })
        );
        localStorage.setItem("otp_email", normalizedEmail);

        toast.success(notice);
        setTimeout(() => {
          navigate(`/verify-Otp?email=${encodeURIComponent(normalizedEmail)}&flow=signup`, {
            replace: true,
            state: { notice, flow: "signup" },
          });
        }, 500);
      } else {
        toast.error(response.data?.message || "Failed to send OTP.");
      }
    } catch (error: any) {
      console.error("Registration Error:", error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        const token = codeResponse.access_token;

        const response = await axiosInstance.post(
          "/login-with-google-account",
          {
            token: token,
          }
        );
        if (
          response.data?.code === "ACCOUNT_SUSPENDED" ||
          String(response.data?.message || "").toLowerCase().includes("suspend") ||
          String(response.data?.message || "").toLowerCase().includes("blocked")
        ) {
          showLoginErrorToast(
            response.data?.message || "Your account is blocked. Please contact support.",
            403,
            response.data?.code
          );
          return;
        }

        if (response.status === 200) {
          toast.success("Login successful!");

          const { data: userData, role, needsOnboarding } = response.data;
          setUserData(userData);
          updateSessionUser(userData);
          login(role || userData?.auth || "user");

          navigate(needsOnboarding ? "/company-onboarding" : "/dashboard", {
            replace: true,
          });
        } else {
          toast.error("Failed to Login. Please try again.");
        }
      } catch (error: any) {
        console.error("Error processing Google login:", error);
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Request failed. Please try again.";
        showLoginErrorToast(
          msg,
          error?.response?.status,
          error?.response?.data?.code
        );
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      toast.error("Google login failed. Please try again.");
    },
  });

  return (
    <>
      <div className="login-fullscreen-container">
        <div className="login-left-section">
          <div className="auth-card">
            <h2>Welcome to AiProd</h2>
            <p className="text-center mb-4">Create your Account</p>

            <div className="social-login">
              <button
                className="btn-social google-icon-login"
                onClick={() => {
                  if (!isGoogleAuthConfigured) {
                    toast.error("Google login is not configured. Set VITE_GOOGLE_CLIENT_ID.");
                    return;
                  }
                  googleLogin();
                }}
                type="button"
              >
                <img
                  src={images.AuthIconGoogle}
                  alt="Google"
                  className="social-icon-top-section"
                />
                Log in with Google
              </button>
              <button
                className="btn-social facebook-icon-login"
                type="button"
                onClick={() => toast.info("Facebook login will be available soon.")}
              >
                <img
                  src={images.AuthIconFacebook}
                  alt="Facebook"
                  className="social-icon-top-section"
                />
                Log in with Facebook
              </button>
            </div>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="fullName"
                    placeholder="Type your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <div className="input-icon">
                    <img
                      src={images.emailIcon}
                      alt="email-Icon"
                      className="social-icon"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <input
                    type="email"
                    id="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="input-icon">
                    <img
                      src={images.emailIcon}
                      alt="email-Icon"
                      className="social-icon"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      const next = e.target.value;
                      setPassword(next);
                      const nextError = next
                        ? getPasswordPolicyError(next) || ""
                        : "";
                      setPasswordError(nextError);
                      if (confirmPassword) {
                        setConfirmPasswordError(
                          next === confirmPassword ? "" : "Passwords do not match"
                        );
                      }
                    }}
                  />
                  <div
                    className="input-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <img
                      src={images.lockIcon}
                      alt="lock-Icon"
                      className="social-icon"
                    />
                  </div>
                </div>
                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#6b7280",
                    fontSize: "12px",
                    lineHeight: 1.4,
                  }}
                >
                  {PASSWORD_POLICY_MESSAGE}
                </small>
                {passwordError ? (
                  <small
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: "#ef4444",
                      fontSize: "12px",
                      lineHeight: 1.4,
                    }}
                  >
                    {passwordError}
                  </small>
                ) : null}
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="input-with-icon">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => {
                      const next = e.target.value;
                      setConfirmPassword(next);
                      setConfirmPasswordError(
                        next && password !== next ? "Passwords do not match" : ""
                      );
                    }}
                  />
                  <div
                    className="input-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <img
                      src={images.lockIcon}
                      alt="lock-Icon"
                      className="social-icon"
                    />
                  </div>
                </div>
                {confirmPasswordError ? (
                  <small
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: "#ef4444",
                      fontSize: "12px",
                      lineHeight: 1.4,
                    }}
                  >
                    {confirmPasswordError}
                  </small>
                ) : null}
              </div>

              <button type="submit" className="btn-signup">
                Signup
              </button>
            </form>

            <p className="login-link">
              Already have an account? <Link to="/login">Login</Link>
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
    </>
  );
};

export default RegisterPage;
