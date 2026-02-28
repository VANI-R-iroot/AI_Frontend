import React, { useState } from "react";
import images from "../../../../assets/image/Home-02/AllIamge";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../../../utils/baseUrl";
import { useAuth } from "../../../../context/AuthContext";
import { useUserStore } from "../../../../zustand/userDetailsStore";
import imgeRight from "../../../../assets/image/Home-02/authPages/Thumbnail.png";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { updateSessionUser } from "../../../../utils/userSession";

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const setUserData = useUserStore((state) => state.setUserData);

  const getAdminData = async () => {
    try {
      const response = await axiosInstance.get("/get-admin-details");
      const userData = response.data.data;

      if (response.status === 200) {
        setUserData(userData);
        updateSessionUser(userData);
      } else {
        toast.error(response.data.message || "Login failed.");
      }
    } catch (error: any) {
      error.response?.data?.message || "Something went wrong!";
    }
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
        navigate("/admin", { replace: true });
        window.location.href = "/admin";
        await getAdminData();
        setEmail("");
        setPassword("");
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


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="login-fullscreen-container">
        <div className="login-left-section">
          <div className="auth-card">
            <h2>Welcome to Admin</h2>
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
                    onClick={togglePasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible size={20} color="#666" />
                    ) : (
                      <AiOutlineEye size={20} color="#5956ffff" />
                    )}
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

export default AdminLoginPage;
