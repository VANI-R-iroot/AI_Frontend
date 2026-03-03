import React, { useEffect, useState } from "react";
import images from "../../../../assets/image/Home-02/AllIamge";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axiosInstance from "../../../../utils/baseUrl";
import { useAuth } from "../../../../context/AuthContext";
import { useUserStore } from "../../../../zustand/userDetailsStore";
import { updateSessionUser } from "../../../../utils/userSession";
import imgeRight from "../../../../assets/image/Home-02/authPages/Thumbnail.png";
import { useGoogleLogin } from "@react-oauth/google";

const isOnboardingDone = (value: any) =>
  value === 1 || value === true || value === "1";

const shouldRedirectToOnboarding = (needsOnboarding: any, userData: any) => {
  const onboardingCompleted = isOnboardingDone(
    userData?.onboarding_completed ?? userData?.onboardingCompleted
  );
  return Boolean(needsOnboarding) || !onboardingCompleted;
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const setUserData = useUserStore((state) => state.setUserData);
  const isGoogleAuthConfigured =
    !!import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== "your google client id";

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
    if (msg.toLowerCase().includes("admin accounts must use the admin login")) {
      toast.error(msg);
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
    toast.error(msg || "Something went wrong!");
  };

  useEffect(() => {
    const state = location.state as { registered?: boolean; message?: string; notice?: string } | null;
    if (state?.registered) {
      toast.success(state.message || "Registration successful!");
      navigate(location.pathname, { replace: true, state: null });
      return;
    }
    if (state?.notice) {
      setNotice(state.notice);
      toast.success(state.notice);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get("/getUserDetails");
      const userData = response.data.data;
  
      setUserData(userData);
      updateSessionUser(userData);
      return userData;
    } catch (error) {
      console.error("❌ Failed to fetch user data:", error);
      throw error;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Email is required");
    if (!password.trim()) return toast.error("Password is required");

    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await axiosInstance.post("/authLogin", {
        email: normalizedEmail,
        password,
        rememberMe,
      });
      const { status, message, role, needsOnboarding, isAdmin } = response.data;
      if (
        response.data?.code === "ACCOUNT_SUSPENDED" ||
        String(message || "").toLowerCase().includes("suspend") ||
        String(message || "").toLowerCase().includes("blocked")
      ) {
        showLoginErrorToast(
          message || "Your account is blocked. Please contact support.",
          403,
          response.data?.code
        );
        return;
      }

      if (response.status === 200) {
        login(role);
        if (isAdmin) {
          toast.success(message || "Login successful!");
          navigate("/admin", { replace: true });
          window.location.href = "/admin";
          setEmail("");
          setPassword("");
          return;
        }
        const userData = await fetchUserData();
        const loginUserData = response.data?.data || {};
        const isFirstLogin = !loginUserData?.last_login;
        const welcomeMsg = `${isFirstLogin ? "Welcome" : "Welcome back"}, ${userData?.name || "User"}!`;
        localStorage.setItem("login_welcome_notice", welcomeMsg);
        setEmail("");
        setPassword("");

        if (shouldRedirectToOnboarding(needsOnboarding, loginUserData)) {
          navigate("/company-onboarding", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else if (status === 403) {
        navigate("/", { replace: true });
        toast.success(message || "Login successful!");
      } else {
        toast.error(message || "Login failed.");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Something went wrong!";
      showLoginErrorToast(
        msg,
        error?.response?.status,
        error?.response?.data?.code
      );
      console.error("Login Error:", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      try {
        const token = codeResponse.access_token;
        const response = await axiosInstance.post("/login-with-google-account", {
          token,
        });
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
          const { data: userData, role, needsOnboarding } = response.data;

          setUserData(userData);
          updateSessionUser(userData);
          login(role || userData?.auth || "user");
          const isFirstLogin = !userData?.last_login;
          const welcomeMsg = `${isFirstLogin ? "Welcome" : "Welcome back"}, ${userData?.name || "User"}!`;
          localStorage.setItem("login_welcome_notice", welcomeMsg);
          navigate(
            shouldRedirectToOnboarding(needsOnboarding, userData)
              ? "/company-onboarding"
              : "/dashboard",
            {
            replace: true,
            }
          );
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
      } finally {
        setIsLoading(false);
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
          {/* <HomeNavbar /> */}
          <div className="auth-card">
            <h2>Welcome to AiProd</h2>
            {notice ? (
              <p className="text-center" style={{ color: "#22c55e" }}>
                {notice}
              </p>
            ) : null}
            <p className="text-center mb-4">Login to your account</p>

            {/* Auto-Login Button */}


            <div className="social-login">
              <button
                className="btn-social google-icon-login"
                type="button"
                onClick={() => {
                  if (!isGoogleAuthConfigured) {
                    toast.error("Google login is not configured. Set VITE_GOOGLE_CLIENT_ID.");
                    return;
                  }
                  googleLogin();
                }}
                disabled={isLoading}
              >
                <img src={images.AuthIconGoogle} alt="Google" />
                Log in with Google
              </button>
              <button
                className="btn-social facebook-icon-login"
                type="button"
                onClick={() => toast.info("Facebook login will be available soon.")}
                disabled={isLoading}
              >
                <img src={images.AuthIconFacebook} alt="Facebook" />
                Log in with Facebook
              </button>
            </div>
            <div className="auth-divider">
              <span>OR</span>
            </div>
            <form>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aiprod@gmail.com"
                    autoComplete="off"
                    disabled={isLoading}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete="off"
                    disabled={isLoading}
                  />
                  <div
                    className="input-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <img
                      src={images.lockIcon}
                      alt="email-Icon"
                      className="social-icon"
                    />
                  </div>
                </div>
              </div>
              <div className="form-group-checkbox">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <h5 className="forget-password-title">
                <Link to="/forgat-password">Forget Password</Link>
              </h5>
              <button
                className="btn-signup"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log-in"}
              </button>
            </form>
            <p className="login-link">
              Don't have an account? <Link to="/register">Signup</Link>
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

export default LoginPage;
