import React, { useState } from "react";
import images from "../../../../assets/image/Home-02/AllIamge";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../../../utils/baseUrl";
import { useAuth } from "../../../../context/AuthContext";
import { useUserStore } from "../../../../zustand/userDetailsStore";
import { updateSessionUser } from "../../../../utils/userSession";
import imgeRight from "../../../../assets/image/Home-02/authPages/Thumbnail.png";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const setUserData = useUserStore((state) => state.setUserData);

  const fetchAdminData = async () => {
    const response = await axiosInstance.get("/get-admin-details");
    const adminData = response.data.data;
    setUserData(adminData);
    updateSessionUser(adminData);
    return adminData;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Email is required");
    if (!password.trim()) return toast.error("Password is required");

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/admin-authLogin", {
        email,
        password,
      });
      const { message, role } = response.data;

      if (response.status === 200) {
        toast.success(message || "Login successful!");
        login(role);
        await fetchAdminData();
        setEmail("");
        setPassword("");
        navigate("/admin", { replace: true });
      } else {
        toast.error(message || "Login failed.");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Something went wrong!";
      toast.error(msg);
      console.error("Login Error:", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="login-fullscreen-container">
        <div className="login-left-section">
          <div className="auth-card">
            <h2>Welcome to Super Admin</h2>
            <p className="text-center mb-4">Login to your account</p>
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
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete="off"
                    disabled={isLoading}
                  />
                  <div className="input-icon">
                    <img
                      src={images.lockIcon}
                      alt="email-Icon"
                      className="social-icon"
                    />
                  </div>
                </div>
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

export default LoginPage;
