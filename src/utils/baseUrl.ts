import axios from "axios";

// Create axios instance with default config - KEEP YOUR EXISTING CONFIG
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/v3",
  withCredentials: true, 
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ ADD THIS: Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Try different storage locations for token
    const token = localStorage.getItem("token") || 
                  sessionStorage.getItem("token") ||
                  localStorage.getItem("authToken") ||
                  sessionStorage.getItem("authToken");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ ADD THIS: Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);
    
    // Handle unauthorized (401) - redirect to login
    if (error.response?.status === 401) {
      const hasAuthToken =
        !!localStorage.getItem("token") ||
        !!sessionStorage.getItem("token") ||
        !!localStorage.getItem("authToken") ||
        !!sessionStorage.getItem("authToken");

      // Only force redirect when an authenticated session/token exists.
      // Public/guest API calls returning 401 should not push user to /login.
      if (hasAuthToken) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        window.location.href = "/login";
      }
    }
    
    // Handle server errors (500)
    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
