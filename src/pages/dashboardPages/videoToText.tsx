import React, { useState, useEffect } from "react";
import adminImage from "../../assets/image/admin/allImage";
import CustomTextEditor from "../../components/userTextEditor/textEditor";
import ShortLink from "../../common/ShortLinkDashboard";
import CommonTrailBar from "../../common/CommonTrailBar";
import PayChatData from "../../components/userDashboard/dashboardMain/payData";
import { limitStore } from "../../zustand/limitStore";
import { packageStore } from "../../zustand/packageStore";
import { useUserStore } from "../../zustand/userDetailsStore";
import axiosInstance from "../../utils/baseUrl";
import { toast } from "react-toastify";
import { Post_language } from "../../DataList/dropdownlist";
import ReactMarkdown from "react-markdown";
import { FiEdit } from "react-icons/fi";

interface FileRow {
  _id: string;
  text: string;
  timestamp: string;
}

const VideoToText = () => {
  const userData = useUserStore((state) => state.userData);
  const { packageLimitData } = packageStore();
  const { limitData } = limitStore();
  const [activeTab, setActiveTab] = useState("Results");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [resultText, setResultText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [imgToTextData, setImgToTextData] = useState<FileRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 100 * 1024 * 1024) {
      setVideoFile(file);
    } else {
      alert("File size exceeds the maximum limit of 100MB");
    }
  };

  const fetchImgToTextData = async () => {
    try {
      const res = await axiosInstance.get("/get-video-to-text");

      const data = res.data?.data || [];
      console.log(data);
      setImgToTextData(data);
    } catch (error) {
      console.error("Fetching assistant data failed:", error);
      toast.error("Failed to load files.");
    }
  };

  useEffect(() => {
    fetchImgToTextData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedDescription = description.trim();
    const trimmedLanguage = language.trim();

    if (!trimmedDescription) {
      toast.error("Description is required!");
      return;
    }

    if (!trimmedLanguage) {
      toast.error("Please select a language!");
      return;
    }

    if (!videoFile) {
      toast.error("Video file is required!");
      return;
    }

    const formData = new FormData();
    formData.append("description", trimmedDescription);
    formData.append("language", trimmedLanguage);
    formData.append("video", videoFile);

    setIsLoading(true);

    try {
      const res = await axiosInstance.post("/video-to-text", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      if (res.data?.success) {
        setResultText(res.data.messages || "");
        toast.success("Generated Successfully!");
        fetchImgToTextData();
        setActiveTab("Results");
        setEditMode(false);
      } else {
        toast.error(res.data?.message || "No result found.");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Something went wrong during submission.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFile(fileId);
    const selected = imgToTextData.find((f) => f._id === fileId);
    setResultText(selected?.text || "");
    setEditMode(false);
    setActiveTab("Results");
  };

  const handleCopyText = () => {
    if (!resultText) {
      toast.error("No text to copy!");
      return;
    }
    navigator.clipboard.writeText(resultText);
    toast.success("Text copied to clipboard!");
  };

  const isEmpty = (value: any) =>
    value === null ||
    value === undefined ||
    (typeof value === "object" && Object.keys(value).length === 0);

  const stats = {
    totalLimit: packageLimitData?.youTubeAnalyserLimit || 0,
    availableLimit: isEmpty(limitData?.apiUseYouTubeAnalyserLimit)
      ? userData?.apiUseYouTubeAnalyserLimit || 0
      : limitData?.apiUseYouTubeAnalyserLimit || 0,
  };

  return (
    <>
      <div className="main-content-common">
        <CommonTrailBar />
        <div className="global-link-limit-section">
          <div className="short-link-text">
            <ShortLink />
          </div>
          <div>
            <PayChatData stats={stats} />
          </div>
        </div>

        <div className="row">
          {/* Left Panel */}
          <div className="col-md-4">
            <div className="left-panel-image">
              <div className="content-wrapper-image-generate">
                <form onSubmit={handleSubmit}>
                  <div className="smart-ai-prompt-are">
                    <label>Video Upload</label>
                    <div className="upload-area">
                      <button className="upload-btn" type="button">
                        <img src={adminImage.UploadIcon} alt="smart ai" />
                      </button>
                      <p className="upload-title">
                        Only Upload Video file here
                      </p>
                      <p className="upload-subtitle">Max Size 100MB</p>

                      <input
                        type="file"
                        accept="video/*"
                        className="file-input"
                        id="video-upload"
                        onChange={handleFileUpload}
                      />

                      <label htmlFor="video-upload" className="file-label">
                        Upload Video
                      </label>
                    </div>
                  </div>

                  <div className="text-to-image-item">
                    <div className="smart-ai-prompt-are">
                      <label>Description *</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description for video analysis..."
                        rows={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="text-to-image-item">
                    <label>Select Language *</label>
                    <div className="select-item-data">
                      <div>
                        <img src={adminImage.LanguageIcon} alt="language" />
                      </div>
                      <select
                        className="form-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        required
                      >
                        <option value="">Select Language</option>
                        {Post_language.map((lang, i) => (
                          <option key={i} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="input-container mt-4">
                    <button
                      type="submit"
                      className="generate-btn btn-image"
                      disabled={isLoading}
                    >
                      <span className="btn-icon">
                        {isLoading ? "⏳" : "✨"}
                      </span>
                      {isLoading ? "Generating..." : "Generate"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-sm-12 col-md-8 col-lg-8 col-xl-8">
            <div className="right-panel">
              <div className="tabs-global generate-file-header">
                <div className="tabs-button-section">
                  <div
                    className={`tab-chatbot ${
                      activeTab === "Results" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("Results")}
                  >
                    Results
                  </div>
                  <div
                    className={`tab-chatbot ${
                      activeTab === "Files" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("Files")}
                  >
                    History
                  </div>
                </div>

                <div className="button-group-download">
                  <button
                    className="btn download"
                    onClick={() =>
                      toast.info("Download feature not implemented yet.")
                    }
                    title="Download as PDF (Coming Soon)"
                  >
                    <img src={adminImage.PdfLogo} alt="pdf" />
                  </button>
                  <button
                    className="btn copy"
                    onClick={handleCopyText}
                    title="Copy Text"
                    disabled={!resultText}
                  >
                    <img src={adminImage.CopyIcon} alt="copy" />
                  </button>
                </div>
              </div>

              {/* Output Content */}
              {activeTab === "Results" ? (
                <div className="Results-list">
                  <div className="d-flex justify-content-end mb-2">
                    {resultText && (
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() => setEditMode(!editMode)}
                        title={editMode ? "View Mode" : "Edit Text"}
                      >
                        {editMode ? "👁️" : <FiEdit />}
                      </button>
                    )}
                  </div>
                  {resultText ? (
                    editMode ? (
                      <CustomTextEditor
                        value={resultText}
                        onChange={(value: string) => setResultText(value)}
                      />
                    ) : (
                      <div className="chat-style-result-box markdown-output">
                        <ReactMarkdown>{resultText}</ReactMarkdown>
                      </div>
                    )
                  ) : (
                    <div className="text-center text-muted">
                      <p>No data available.</p>
                      {isLoading && <p>Processing your request...</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="files-list">
                  {imgToTextData.length === 0 ? (
                    <p className="text-center text-muted">No files found.</p>
                  ) : (
                    imgToTextData.map((file) => (
                      <div
                        key={file._id}
                        className={`file-item ${
                          selectedFile === file._id ? "selected" : ""
                        }`}
                        onClick={() => handleFileSelect(file._id)}
                        title="Click to view/edit"
                      >
                        <div className="file-icon">
                          <span>📄</span>
                        </div>
                        <div className="file-content">
                          {file.text.length > 60
                            ? file.text.substring(0, 60) + "..."
                            : file.text}
                        </div>
                        <div className="file-conten">
                          <div style={{ fontSize: "12px", color: "#888" }}>
                            {new Date(file.timestamp)
                              .toLocaleString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                              .replace(",", "")
                              .replace(/:/, ".")}
                          </div>
                        </div>
                        {selectedFile === file._id && (
                          <div className="file-check-mark">✓</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoToText;
