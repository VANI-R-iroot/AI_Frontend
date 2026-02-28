import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ChatBotProvider } from "./context/ChatBotContext";
import AppRouter from "./routes/AppRouter";
import { ToastContainer } from "react-toastify";


import { GoogleOAuthProvider } from "@react-oauth/google";

const App = () => {
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "your google client id";
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <ChatBotProvider>
          <AuthProvider>
            <AppRouter />
            <ToastContainer position="top-right" autoClose={3000} />
          </AuthProvider>
        </ChatBotProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
