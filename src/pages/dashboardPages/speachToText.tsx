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
  transcript: string;
  language: string;
  createdAt: string;
}


const AiSpeechToTextPage = () => {
  const userData = useUserStore((state) => state.userData);
  const { packageLimitData } = packageStore();
  const { limitData } = limitStore();
  const [activeTab, setActiveTab] = useState("Results");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [resultText, setResultText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [imgToTextData, setImgToTextData] = useState<FileRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  


 const fetchImgToTextData = async () => {
  try {
    const res = await axiosInstance.get("/speech-to-text/history");
    setImgToTextData(res.data?.data || []);
  } catch (error) {
    toast.error("Failed to load history");
  }
};

useEffect(() => {
  fetchImgToTextData();
}, []);


  const validateAudioFile = (file: File): boolean => {
    const allowedTypes = [
      "audio/mp3",
      "audio/mpeg",
      "audio/wav",
      "audio/wave",
      "audio/x-wav",
      "audio/ogg",
      "audio/webm",
      "audio/mp4",
      "audio/m4a",
      "audio/aac",
      "audio/flac",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid audio file (MP3, WAV, OGG, etc.)");
      return false;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size must be less than 100MB");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced validation
    // if (!description.trim()) {
    //   toast.error("Description is required!");
    //   return;
    // }

    // if (!language) {
    //   toast.error("Please select a language!");
    //   return;
    // }

    if (!audioFile) {
      toast.error("Please upload an audio file!");
      return;
    }

    // Validate audio file
    if (!validateAudioFile(audioFile)) {
      return;
    }
    if (!(audioFile instanceof File)) {
      toast.error("Invalid audio file. Please upload again.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("description", description.trim());
    formData.append("language", language);
    formData.append("audio", audioFile);
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const res = await axiosInstance.post("/speech-to-text", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
     if (res.data?.success) {
        setResultText(res.data.data?.transcript || "");
        toast.success("Generated Successfully!");
        // fetchImgToTextData();
        setActiveTab("Results");
        setEditMode(false);
        setDescription("");
        setLanguage("");
        setAudioFile(null);
        const fileInput = document.getElementById(
          "audio-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast.error(res.data?.message || "No result found.");
      }
    } catch (error: any) {
      console.error("API Error:", error);
      if (error?.response?.status === 400) {
        toast.error(error?.response?.data?.message || "Invalid request data");
      } else if (error?.response?.status === 413) {
        toast.error("File is too large. Please upload a smaller file.");
      } else if (error?.response?.status === 422) {
        toast.error("Validation error. Please check your input data.");
      } else {
        toast.error(
          error?.response?.data?.error ||
            error?.response?.data?.message ||
            "Failed to process audio"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    toast.success("Text copied to clipboard!");
  };

  const isEmpty = (value: any) =>
    value === null ||
    value === undefined ||
    (typeof value === "object" && Object.keys(value).length === 0);

  const stats = {
    totalLimit: packageLimitData?.speechToTextLimit || 0,
    availableLimit: isEmpty(limitData?.apiUseSpeechToTextLimit)
      ? userData?.apiUseSpeechToTextLimit || 0
      : limitData?.apiUseSpeechToTextLimit || 0,
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAudioFile(null);
      return;
    }

    // Debug: Log file details
    console.log("Selected file:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    });

    if (validateAudioFile(file)) {
      setAudioFile(file);
      toast.success(`File "${file.name}" uploaded successfully`);
    } else {
      setAudioFile(null);
      const input = event.target;
      input.value = "";
    }
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
                <div className="smart-ai-prompt-are">
                  <label>Audio Upload</label>
                  <div className="upload-area">
                    <button className="upload-btn" type="button">
                      <img src={adminImage.UploadIcon} alt="smart ai" />
                    </button>
                    <p className="upload-title">
                      {audioFile
                        ? `Selected: ${audioFile.name}`
                        : "Only Upload Audio file here"}
                    </p>
                    <p className="upload-subtitle">Max Size 100MB</p>
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
                      className="file-input"
                      id="audio-upload"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="audio-upload" className="file-label">
                      {audioFile ? "Change Audio" : "Upload Audio"}
                    </label>
                  </div>
                </div>

                <div className="text-to-image-item">
                  <div className="smart-ai-prompt-are">
                    <label>Description *</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what you want to extract from the audio..."
                      maxLength={500}
                      required
                    />
                    <small className="text-muted">
                      {description.length}/500 characters
                    </small>
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
                    className="generate-btn btn-image"
                    onClick={handleSubmit}
                    disabled={
                      isLoading ||
                      // !description.trim() ||
                      // !language ||
                      !audioFile
                    }
                  >
                    <span className="btn-icon">{isLoading ? "⏳" : "✨"}</span>
                    {isLoading ? "Processing..." : "Generate"}
                  </button>
                </div>
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
                    title="Download as PDF (Coming Soon)"
                    onClick={() =>
                      toast.info("Download feature not implemented yet.")
                    }
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
      <p className="text-center text-muted">No data available.</p>
    )}
  </div>
) : (
  <div className="history-table-wrapper">
    <div className="d-flex justify-content-between mb-3">
      <button
        className="btn btn-light btn-sm"
        onClick={() =>
          setSelectedIds(
            selectedIds.length === imgToTextData.length
              ? []
              : imgToTextData.map((f) => f._id)
          )
        }
      >
        {selectedIds.length === imgToTextData.length
          ? "Deselect All"
          : "Select All"}
      </button>
    </div>

    <div className="table-responsive">
      <table className="table table-dark table-hover align-middle">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  selectedIds.length === imgToTextData.length &&
                  imgToTextData.length > 0
                }
                onChange={() =>
                  setSelectedIds(
                    selectedIds.length === imgToTextData.length
                      ? []
                      : imgToTextData.map((f) => f._id)
                  )
                }
              />
            </th>
            <th>Transcript</th>
            <th>Language</th>
            <th>Generated On</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {imgToTextData.map((item) => (
            <tr key={item._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item._id)}
                  onChange={() =>
                    setSelectedIds((prev) =>
                      prev.includes(item._id)
                        ? prev.filter((id) => id !== item._id)
                        : [...prev, item._id]
                    )
                  }
                />
              </td>
              <td
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setResultText(item.transcript);
                  setActiveTab("Results");
                }}
              >
                📄{" "}
                {item.transcript.length > 50
                  ? item.transcript.substring(0, 50) + "..."
                  : item.transcript}
              </td>
              <td>{item.language?.toUpperCase()}</td>
              <td>
                {new Date(item.createdAt).toLocaleString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td>
                <button
                  className="btn btn-link btn-sm"
                  onClick={() => {
                    setResultText(item.transcript);
                    setActiveTab("Results");
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}


            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiSpeechToTextPage;
