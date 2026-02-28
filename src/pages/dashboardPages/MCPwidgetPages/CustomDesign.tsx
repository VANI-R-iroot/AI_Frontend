import React, { useEffect, useState } from "react";
import ChatBotWidget from "../../../pages/chatbot/ChatBotWidget";
import { useUserStore } from "../../../zustand/userDetailsStore";
import { usePluginStore } from "../../../zustand/pluginStore";
import axiosInstance from "../../../utils/baseUrl";

interface CustomizationData {
  headerColor: string;
  headerText: string;
  footerColor: string;
  footerTextColor: string;
  bodyColor: string;
  logo: File | null;
  logoUrl: string;
  launcherIcon: File | null;
  chatLauncherIcon: string;
  chatLauncherIconBg: string;
  poweredByText: string;
  userMessageBg: string;
  botMessageBg: string;
  userMessageText: string;
  botMessageText: string;
  inputBgColor: string;
  domainOption: string;
}

interface UserData {
  email: string;
  name: string;
  _id: string;
}

const WidgetsCustomPage: React.FC = () => {
  const userData = useUserStore((state) => state.userData || {}) as UserData;
  const domainNames = usePluginStore((state) => state.domainNames);
  const [userState, setUserState] = useState<CustomizationData>({
    headerColor: "#007bff",
    headerText: "Smart Widget",
    footerColor: "#f8f9fa",
    footerTextColor: "#001eff",
    bodyColor: "#ffffff",
    logo: null,
    logoUrl: "",
    launcherIcon: null,
    chatLauncherIcon: "",
    chatLauncherIconBg: "#9b82de",
    poweredByText: "Powered by AiProd",
    userMessageBg: "#9b82de",
    botMessageBg: "#3c71dd",
    userMessageText: "#FFFFFF",
    botMessageText: "#00000",
    inputBgColor: "#ffffff",
    domainOption: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, files } = e.target as any;

    if ((name === "logo" || name === "launcherIcon") && files && files[0]) {
      const file = files[0];
      const fileUrl = URL.createObjectURL(file);

      setUserState((prev) => ({
        ...prev,
        [name]: file,
        [name === "logo" ? "logoUrl" : "chatLauncherIcon"]: fileUrl,
      }));
    } else {
      setUserState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getWidgetUserThemData = async () => {
    try {
      const res = await axiosInstance.get(
        `/get-widget-user-theme/${userData._id}`
      );

      if (res.status === 200 && res.data) {
        const data = res.data;

        setUserState((prev) => ({
          ...prev,
          headerColor: data.headerColor || prev.headerColor,
          headerText: data.headerText || prev.headerText,
          footerColor: data.footerColor || prev.footerColor,
          footerTextColor: data.footerTextColor || prev.footerTextColor,
          bodyColor: data.bodyColor || prev.bodyColor,
          logoUrl: data.logoUrl || "",
          chatLauncherIcon: data.chatLauncherIcon || "",
          chatLauncherIconBg:
            data.chatLauncherIconBg || prev.chatLauncherIconBg,
          poweredByText: data.poweredByText || prev.poweredByText,
          userMessageBg: data.userMessageBg || prev.userMessageBg,
          botMessageBg: data.botMessageBg || prev.botMessageBg,
          userMessageText: data.userMessageText || prev.userMessageText,
          botMessageText: data.botMessageText || prev.botMessageText,
          inputBgColor: data.inputBgColor || prev.inputBgColor,
          domainOption: data.domainOption || prev.domainOption,
          logo: null,
          launcherIcon: null,
        }));
      } else {
        console.warn("⚠️ Unexpected response status:", res.status);
      }
    } catch (error: any) {
      if (error.response) {
        console.error("❌ Server error:", error.response.data);
      } else if (error.request) {
        console.error("❌ No response from server:", error.request);
      } else {
        console.error("❌ Request setup error:", error.message);
      }
    }
  };

  useEffect(() => {
    getWidgetUserThemData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("userId", userData._id);
    formData.append("domainOption", userState.domainOption);
    formData.append("headerColor", userState.headerColor);
    formData.append("headerText", userState.headerText);
    formData.append("footerColor", userState.footerColor);
    formData.append("footerTextColor", userState.footerTextColor);
    formData.append("bodyColor", userState.bodyColor);
    formData.append("poweredByText", userState.poweredByText);
    formData.append("userMessageBg", userState.userMessageBg);
    formData.append("botMessageBg", userState.botMessageBg);
    formData.append("userMessageText", userState.userMessageText);
    formData.append("botMessageText", userState.botMessageText);
    formData.append("inputBgColor", userState.inputBgColor);
    formData.append("chatLauncherIconBg", userState.chatLauncherIconBg);

    if (userState.logo) {
      formData.append("logo", userState.logo);
    }
    if (userState.launcherIcon) {
      formData.append("chatLauncherIcon", userState.launcherIcon);
    }
    try {
      const res = await axiosInstance.post(
        "/customize-chatbot-theme",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.status === 200) {
        getWidgetUserThemData();
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetLogo = () => {
    setUserState((prev) => ({
      ...prev,
      logo: null,
      logoUrl: "",
    }));
  };

  return (
    <div className="main-content-common widget-customize-full-section">
      <div className="row">
        <div className="col-sm-12 col-md-12 col-lg-7 col-xl-7">
          <div className="delete-account-form">
            <div className="header">
              <h4>Customize AI Bot Template</h4>
            </div>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="row">
                <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-4">
                  <div className="input-filed-item-smart-ai">
                    <label className="form-label">Header Color</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        name="headerColor"
                        value={userState.headerColor}
                        onChange={handleChange}
                        className="form-control form-control-color"
                      />
                      <input
                        type="text"
                        name="headerColor"
                        value={userState.headerColor}
                        onChange={handleChange}
                        className="form-control"
                        style={{ width: "100px" }}
                        placeholder="#123abc"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-6 col-lg-6 col-xl-4">
                  {" "}
                  <div className="input-filed-item-smart-ai mb-3">
                    <label className="form-label">Body Color</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        name="bodyColor"
                        value={userState.bodyColor}
                        onChange={handleChange}
                        className="form-control form-control-color"
                      />
                      <input
                        type="text"
                        name="bodyColor"
                        value={userState.bodyColor}
                        onChange={handleChange}
                        className="form-control"
                        style={{ width: "100px" }}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-6 col-xl-4">
                  <div className="input-filed-item-smart-ai mb-3">
                    <label className="form-label">User msg bg Color</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        name="userMessageBg"
                        value={userState.userMessageBg}
                        onChange={handleChange}
                        className="form-control form-control-color"
                      />
                      <input
                        type="text"
                        name="userMessageBg"
                        value={userState.userMessageBg}
                        onChange={handleChange}
                        className="form-control"
                        style={{ width: "100px" }}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-6 col-xl-4">
                  {" "}
                  <div className="input-filed-item-smart-ai mb-3">
                    <label className="form-label">Bot msg bg Color</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        name="botMessageBg"
                        value={userState.botMessageBg}
                        onChange={handleChange}
                        className="form-control form-control-color"
                      />
                      <input
                        type="text"
                        name="botMessageBg"
                        value={userState.botMessageBg}
                        onChange={handleChange}
                        className="form-control"
                        style={{ width: "100px" }}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-6 col-xl-4">
                  <div className="input-filed-item-smart-ai mb-3">
                    <label className="form-label">User sms Color</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        name="userMessageText"
                        value={userState.userMessageText}
                        onChange={handleChange}
                        className="form-control form-control-color"
                      />
                      <input
                        type="text"
                        name="userMessageText"
                        value={userState.userMessageText}
                        onChange={handleChange}
                        className="form-control"
                        style={{ width: "100px" }}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-6 col-xl-4">
                  {" "}
                  <div className="input-filed-item-smart-ai mb-3">
                    <label className="form-label">Bot sms Color</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        name="botMessageText"
                        value={userState.botMessageText}
                        onChange={handleChange}
                        className="form-control form-control-color"
                      />
                      <input
                        type="text"
                        name="botMessageText"
                        value={userState.botMessageText}
                        onChange={handleChange}
                        className="form-control"
                        style={{ width: "100px" }}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-6 col-xl-4">
                  {" "}
                  <div className="input-filed-item-smart-ai mb-3">
                    <label className="form-label">Typing Area</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        name="inputBgColor"
                        value={userState.inputBgColor}
                        onChange={handleChange}
                        className="form-control form-control-color"
                      />
                      <input
                        type="text"
                        name="inputBgColor"
                        value={userState.inputBgColor}
                        onChange={handleChange}
                        className="form-control"
                        style={{ width: "100px" }}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-6 col-xl-4">
                  {" "}
                  <div className="input-filed-item-smart-ai mb-3">
                    <label className="form-label">Footer bg Color</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        name="footerColor"
                        value={userState.footerColor}
                        onChange={handleChange}
                        className="form-control form-control-color"
                      />
                      <input
                        type="text"
                        name="footerColor"
                        value={userState.footerColor}
                        onChange={handleChange}
                        className="form-control"
                        style={{ width: "100px" }}
                        placeholder="#fafafa"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-6 col-xl-4">
                  {" "}
                  <div className="input-filed-item-smart-ai mb-3">
                    <label className="form-label">Footer Text Color</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        name="footerTextColor"
                        value={userState.footerTextColor}
                        onChange={handleChange}
                        className="form-control form-control-color"
                      />
                      <input
                        type="text"
                        name="footerTextColor"
                        value={userState.footerTextColor}
                        onChange={handleChange}
                        className="form-control"
                        style={{ width: "100px" }}
                        placeholder="#fafafa"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-md-4 col-lg-6 col-xl-4">
                  <div className="input-filed-item-smart-ai mb-3">
                    <label className="form-label">Upload Logo</label>
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      onChange={handleChange}
                      className="form-control"
                    />
                    {userState.logoUrl && (
                      <div className="mt-2">
                        <img
                          src={userState.logoUrl}
                          alt="Logo preview"
                          style={{
                            maxWidth: "100px",
                            maxHeight: "50px",
                            objectFit: "contain",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            padding: "4px",
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleResetLogo}
                          className="btn btn-sm btn-outline-danger ms-2"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-6 col-xl-4">
                  <div className="input-filed-item-smart-ai mb-3">
                    <label className="form-label">Upload Launcher Icon</label>
                    <input
                      type="file"
                      name="launcherIcon"
                      accept="image/*"
                      onChange={handleChange}
                      className="form-control"
                    />
                    {userState.chatLauncherIcon && (
                      <div className="mt-2">
                        <img
                          src={userState.chatLauncherIcon}
                          alt="Launcher Icon Preview"
                          style={{
                            maxWidth: "100px",
                            maxHeight: "50px",
                            objectFit: "contain",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            padding: "4px",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setUserState((prev) => ({
                              ...prev,
                              launcherIcon: null,
                              chatLauncherIcon: "",
                            }))
                          }
                          className="btn btn-sm btn-outline-danger ms-2"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-md-4 col-lg-6 col-xl-4">
                  {" "}
                  <div className="input-filed-item-smart-ai mb-3">
                    <label className="form-label">
                      {" "}
                      Launcher Icon bg color
                    </label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        name="chatLauncherIconBg"
                        value={userState.chatLauncherIconBg}
                        onChange={handleChange}
                        className="form-control form-control-color"
                      />
                      <input
                        type="text"
                        name="chatLauncherIconBg"
                        value={userState.chatLauncherIconBg}
                        onChange={handleChange}
                        className="form-control"
                        style={{ width: "100px" }}
                        placeholder="#fafafa"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-4">
                  <div className="text-to-image-item">
                    <label>Select Domain</label>
                    <div className="select-item-data">
                      <select
                        className="form-select"
                        name="domainOption"
                        value={userState.domainOption}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Domain</option>
                        {domainNames.map((item, index) => (
                          <option key={index} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="input-filed-item-smart-ai mb-3">
                <label className="form-label">Header Title</label>
                <input
                  type="text"
                  name="headerText"
                  value={userState.headerText}
                  onChange={handleChange}
                  placeholder="Enter text like 'Powered by AiProd'"
                  className="form-control"
                />
              </div>
              <div className="input-filed-item-smart-ai mb-3">
                <label className="form-label">Powered by Title</label>
                <input
                  type="text"
                  name="poweredByText"
                  value={userState.poweredByText}
                  onChange={handleChange}
                  placeholder="Enter text like 'Powered by AiProd'"
                  className="form-control"
                />
              </div>

              <div className="submit-button-widget-custom-color">
                <button type="submit" className="" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Update custom colors"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-sm-12 col-md-12 col-lg-5 col-xl-5">
          <div className="ai-bot-widget-preview-section">
            <h5 className="mb-3">Live Preview</h5>
            <ChatBotWidget
              previewMode={true}
              customTheme={{
                headerBgColor: userState.headerColor,
                headerText: userState.headerText,
                headerTextColor: "#FFFFFF",
                bodyBgColor: userState.bodyColor,
                footerBgColor: userState.footerColor,
                footerTextColor: userState.footerTextColor,
                userMessageBg: userState.userMessageBg,
                botMessageBg: userState.botMessageBg,

                userMessageText: userState.userMessageText,
                botMessageText: userState.botMessageText,
                inputBgColor: userState.inputBgColor,
                buttonBgColor: "#10B981",
                buttonTextColor: "#FFFFFF",
                customLogo: userState.logoUrl,
                chatLauncherIcon: userState.chatLauncherIcon,
                chatLauncherIconBg: userState.chatLauncherIconBg,
                poweredByText: userState.poweredByText,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetsCustomPage;
