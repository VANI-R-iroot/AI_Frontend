import React, { useState, useEffect } from "react";
import adminImage from "../../assets/image/admin/allImage";
import CustomTextEditor from "../../components/userTextEditor/textEditor";
import CommonTrailBar from "../../common/CommonTrailBar";
import PayChatData from "../../components/userDashboard/dashboardMain/payData";
import { Writing_style, Post_language } from "../../DataList/dropdownlist";
import ShortLink from "../../common/ShortLinkDashboard";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/baseUrl";
import { packageStore } from "../../zustand/packageStore";
import { limitStore } from "../../zustand/limitStore";
import { useUserStore } from "../../zustand/userDetailsStore";
import jsPDF from "jspdf";

interface AiRewriterItem {
  id: string | number;
  text: string;
  timestamp: string;
}

const CreateImagePage = () => {
  const { packageLimitData } = packageStore();
  const { limitData } = limitStore();
  const userData = useUserStore((state) => state.userData);
  const [description, setDescription] = useState("");
  const [writingStyle, setWritingStyle] = useState("");
  const [language, setLanguage] = useState("");
  const [activeTab, setActiveTab] = useState("Results");
  const [selectedFile, setSelectedFile] = useState<string | number | null>(
    null
  );
  const [editorContent, setEditorContent] = useState("");

  const [aiRewriterData, setAiRewriterData] = useState<AiRewriterItem[]>([]);

  const isEmpty = (value: any) => {
    return (
      value === null ||
      value === undefined ||
      (typeof value === "object" && Object.keys(value).length === 0)
    );
  };

  const stats = {
    totalLimit: packageLimitData?.aiRewriterLimit || 0,
    availableLimit: isEmpty(limitData?.apiUseAiRewriterLimit)
      ? userData?.apiUseAiRewriterLimit || 0
      : limitData?.apiUseAiRewriterLimit || 0,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !writingStyle || !language) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const payload = {
        description,
        writingStyle,
        language,
      };

      const res = await axiosInstance.post("/rewrite", payload, {
        // headers: { ...token.headers },
      });

      if (res.status === 200) {
        toast.success("Article generated successfully!");

        const generatedText = res.data?.data || "";
        setEditorContent(generatedText);
        fetchAiRewriterData();
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error?.response?.data?.error || "Generation failed.");
    }
  };

  const fetchAiRewriterData = async () => {
    try {
      const res = await axiosInstance.get("/get-ai-rewrite-data", {
        // headers: { ...token.headers },
      });

      const data: AiRewriterItem[] = res.data?.data?.data || [];
  
      setAiRewriterData(data);
    } catch (error) {
      console.error("Fetching assistant data failed:", error);
    }
  };

  useEffect(() => {
    fetchAiRewriterData();
  }, []);

  const handleFileSelect = (fileId: string | number) => {
    setSelectedFile(fileId);
    const fileData = aiRewriterData.find((item) => item.id === fileId);
    if (fileData) {
      setEditorContent(fileData.text || "");
    }
  };

  const handleCopy = async () => {
    try {
      const textToCopy =
        activeTab === "Results"
          ? editorContent
          : aiRewriterData.find((file) => file.id === selectedFile)?.text || "";

      if (!textToCopy) {
        toast.warn("Nothing to copy.");
        return;
      }

      await navigator.clipboard.writeText(textToCopy);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy!");
    }
  };

  const handleDownloadPDF = () => {
    const fileData = aiRewriterData.find((file) => file.id === selectedFile);
    if (!fileData) {
      toast.warn("No file selected to download.");
      return;
    }

    const doc = new jsPDF();
    const lines = doc.splitTextToSize(fileData.text, 180);
    doc.text(lines, 10, 10);
    doc.save(`document_${selectedFile}.pdf`);
  };

  return (
    <div className="main-content-common">
      <CommonTrailBar />

      <div className="container-flute">
        <div className="global-link-limit-section">
          <div className="short-link-text">
            <ShortLink />
          </div>
          <div>
            <PayChatData stats={stats} />
          </div>
        </div>

        <div className="row">
          {/* LEFT PANEL */}
          <div className="col-sm-12 col-md-4 col-lg-4 col-xl-4">
            <div className="left-panel-image">
              <div className="content-wrapper-image-generate">
                <div className="smart-ai-prompt-are">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="text-to-image-item">
                  <label>Writing Style</label>
                  <div className="select-item-data">
                    <div>
                      <img src={adminImage.TextImageIcon03} alt="smart ai" />
                    </div>
                    <select
                      className="form-select"
                      value={writingStyle}
                      onChange={(e) => setWritingStyle(e.target.value)}
                    >
                      {Writing_style.map((style, i) => (
                        <option key={i} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-to-image-item">
                  <label>Language</label>
                  <div className="select-item-data">
                    <div>
                      <img src={adminImage.LanguageIcon} alt="smart ai" />
                    </div>
                    <select
                      className="form-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
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
                  >
                    <span className="btn-icon">✨</span> Generate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
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
                    Files
                  </div>
                </div>
                <div className="button-group-download">
                  <button className="btn download" onClick={handleDownloadPDF}>
                    <img src={adminImage.PdfLogo} alt="Download PDF" />
                  </button>
                  <button className="btn copy" onClick={handleCopy}>
                    <img src={adminImage.CopyIcon} alt="Copy Text" />
                  </button>
                </div>
              </div>

              {activeTab === "Results" ? (
                <div className="templates-list">
                  <CustomTextEditor
                    value={editorContent}
                    onChange={(html: string) => setEditorContent(html)}
                  />
                </div>
              ) : (
                <div className="files-list">
                  {aiRewriterData.map((file) => (
                    <div
                      key={file.id}
                      className={`file-item ${
                        selectedFile === file.id ? "selected" : ""
                      }`}
                      onClick={() => handleFileSelect(file.id)}
                    >
                      <div className="file-icon">
                        <span>📄</span>
                      </div>
                      <div className="file-content">
                        {file.text?.slice(0, 80)}...
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
                      {selectedFile === file.id && (
                        <div className="file-check-mark">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateImagePage;
