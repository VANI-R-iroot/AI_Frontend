import React, { useState, useEffect, JSX } from "react";
import adminImage from "../../assets/image/admin/allImage";
import { Programming_language } from "../../DataList/dropdownlist";
import ShortLink from "../../common/ShortLinkDashboard";
import CommonTrailBar from "../../common/CommonTrailBar";
import PayChatData from "../../components/userDashboard/dashboardMain/payData";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/baseUrl";
import { limitStore } from "../../zustand/limitStore";
import { packageStore } from "../../zustand/packageStore";
import { useUserStore } from "../../zustand/userDetailsStore";
import "../../assets/css/codeGenerate.css";
import { FaSearch } from "react-icons/fa";

interface Message {
  sender: "user" | "bot";
  message: string;
  timestamp: number;
  language?: string;
}

interface HistoryItem {
  _id: string;
  messages: Message[];
}

interface Stats {
  totalLimit: number;
  availableLimit: number;
}

interface PaginatedResult {
  items: HistoryItem[];
  totalItems: number;
  totalPages: number;
}

interface LimitData {
  apiUseAiCodeGenerateLimit?: number;
}

interface PackageLimitData {
  aiCodeGenerateLimit?: number;
}

interface UserData {
  apiUseAiCodeGenerateLimit?: number;
}

interface LanguageOption {
  label: string;
  value?: string;
}

const CodeGenerate: React.FC = () => {
  const packageLimitData = packageStore(
    (state) => state.packageLimitData
  ) as PackageLimitData;
  const limitData = limitStore((state) => state.limitData) as LimitData;
  const userData = useUserStore((state) => state.userData) as UserData;
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"Results" | "History">("Results");
  const [llamLanguage, setLlamLanguage] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterLanguage, setFilterLanguage] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<HistoryItem | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);

  const isEmpty = (value: any): boolean => {
    return (
      value === null ||
      value === undefined ||
      (typeof value === "object" && Object.keys(value).length === 0)
    );
  };

  const stats: Stats = {
    totalLimit: packageLimitData?.aiCodeGenerateLimit || 0,
    availableLimit: isEmpty(limitData?.apiUseAiCodeGenerateLimit)
      ? userData?.apiUseAiCodeGenerateLimit || 0
      : limitData?.apiUseAiCodeGenerateLimit || 0,
  };



  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async (): Promise<void> => {
    setLoadingHistory(true);
    try {
      const res = await axiosInstance.get("/code-list"
      );

      if (res.status === 200) {
        setHistory(res.data.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!description || !llamLanguage || !selectedLanguage) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const payload = {
        inputMessage: description,
        llamLanguage,
        selectedLanguage,
      };

      const res = await axiosInstance.post("/ai-code-generate", payload);

      if (res.status === 200) {
        setResult(res.data.result);
        toast.success("Code generated successfully!");

        // Clear form and refresh history
        setDescription("");
        setSelectedLanguage("");
        setLlamLanguage("");
        fetchHistory();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error?.response?.data?.error || "Failed to generate code");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await axiosInstance.delete(`/code-delete/${id}`);

      if (res.status === 200) {
        toast.success("Deleted successfully!");
        fetchHistory();
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleCopy = (text: string): void => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = (
    content: string,
    filename: string = "code.txt"
  ): void => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Downloaded successfully!");
  };

  const formatCode = (code: string): string => {
    return code.replace(/```[\s\S]*?\n/g, "").replace(/```/g, "");
  };

  const renderCodeLines = (code: string): JSX.Element[] => {
    const lines = formatCode(code).split("\n");
    return lines.map((line, index) => (
      <div key={index} className="code-line">
        <span className="line-number">{index + 1}</span>
        <span className="line-content">{line}</span>
      </div>
    ));
  };

  const extractLanguageFromMessages = (messages: Message[]): string => {
    const userMessage = messages?.find((msg) => msg.sender === "user");
    if (userMessage && (userMessage as any).language) {
      return (userMessage as any).language;
    }
    return "Unknown";
  };

  const getFilteredAndSortedHistory = (): HistoryItem[] => {
    let filtered = history.filter((item) => {
      const userMessage =
        item.messages?.find((msg) => msg.sender === "user")?.message || "";
      const botMessage =
        item.messages?.find((msg) => msg.sender === "bot")?.message || "";
      const language = extractLanguageFromMessages(item.messages);

      const matchesSearch =
        searchTerm === "" ||
        userMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        botMessage.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLanguage =
        filterLanguage === "" ||
        language === filterLanguage ||
        language.toLowerCase() === filterLanguage.toLowerCase();

      return matchesSearch && matchesLanguage;
    });

    // Sort
    filtered.sort((a, b) => {
      const aDate = new Date(a.messages?.[0]?.timestamp || 0);
      const bDate = new Date(b.messages?.[0]?.timestamp || 0);

      if (sortBy === "newest") {
        return bDate.getTime() - aDate.getTime();
      } else {
        return aDate.getTime() - bDate.getTime();
      }
    });

    return filtered;
  };

  const getPaginatedHistory = (): PaginatedResult => {
    const filtered = getFilteredAndSortedHistory();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  };

  const handleViewDetails = (item: HistoryItem): void => {
    setSelectedHistoryItem(item);
    setShowModal(true);
  };

  const getCodePreview = (code: string, maxLines: number = 3): string => {
    const lines = formatCode(code).split("\n");
    const preview = lines.slice(0, maxLines).join("\n");
    return preview + (lines.length > maxLines ? "\n..." : "");
  };

  const {
    items: paginatedItems,
    totalItems,
    totalPages,
  } = getPaginatedHistory();

  return (
    <>
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
            <div className="col-sm-12 col-md-4 col-lg-4 col-xl-4">
              <div className="left-panel-image">
                <div className="content-wrapper-image-generate">
                  <form onSubmit={handleSubmit}>
                    <div className="smart-ai-prompt-are">
                      <label>Prompt</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the code you want to generate..."
                        rows={4}
                      />
                    </div>
                    <div className="text-to-image-item">
                      <label>Language</label>
                      <div className="select-item-data">
                        <div>
                          <img
                            src={adminImage.TextImageIcon03}
                            alt="smart ai"
                          />
                        </div>
                        <select
                          className="form-select"
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                          <option value="">Select Language</option>
                          {Programming_language.map(
                            (lang: LanguageOption, i: number) => (
                              <option key={i} value={lang.value || ""}>
                                {lang.label}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="text-to-image-item">
                      <label>LLM Provider</label>
                      <div className="select-item-data">
                        <div>
                          <img
                            src={adminImage.TextImageIcon03}
                            alt="smart ai"
                          />
                        </div>
                        <select
                          className="form-select"
                          value={llamLanguage}
                          onChange={(e) => setLlamLanguage(e.target.value)}
                        >
                          <option value="">Select platform</option>
                          <option value="openai">Open AI</option>
                          <option value="deepseek">DeepSeek</option>
                          <option value="gemini">Gemini</option>
                          <option value="ollama">Ollama</option>
                        </select>
                      </div>
                    </div>
                    <div className="input-container mt-4">
                      <button
                        type="submit"
                        className="generate-btn btn-image"
                        disabled={loading}
                      >
                        <span className="btn-icon">✨</span>
                        {loading ? "Generating..." : "Generate"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
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
                        activeTab === "History" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("History")}
                    >
                      History ({totalItems})
                    </div>
                  </div>

                  {activeTab === "Results" && result && (
                    <div className="button-group-download">
                      <button
                        className="btn download"
                        onClick={() =>
                          handleDownload(result, "generated-code.txt")
                        }
                      >
                        <img src={adminImage.PdfLogo} alt="Download" />
                      </button>
                      <button
                        className="btn copy"
                        onClick={() => handleCopy(result)}
                      >
                        <img src={adminImage.CopyIcon} alt="Copy" />
                      </button>
                    </div>
                  )}
                </div>

                {activeTab === "Results" ? (
                  <div className="code-result-container">
                    {loading ? (
                      <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Generating code...</p>
                      </div>
                    ) : result ? (
                      <div className="code-display">
                        <div className="code-header">
                          <span>Generated Code</span>
                        </div>
                        <div className="code-content">
                          {renderCodeLines(result)}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>
                          No code generated yet. Fill out the form and click
                          Generate.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="history-container">
                    {/* History Controls */}
                    <div className="history-controls">
                      <div className="search-section">
                       
                        <div className="search-input-container">
                          <FaSearch className="search-icon" />
                          <input
                            type="text"
                            placeholder="Search announcement..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <select
                          className="filter-select"
                          value={filterLanguage}
                          onChange={(e) => setFilterLanguage(e.target.value)}
                        >
                          <option value="">All Languages</option>
                          {Programming_language.map(
                            (lang: LanguageOption, i: number) => (
                              <option key={i} value={lang.label}>
                                {lang.label}
                              </option>
                            )
                          )}
                        </select>
                        <select
                          className="sort-select"
                          value={sortBy}
                          onChange={(e) =>
                            setSortBy(e.target.value as "newest" | "oldest")
                          }
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                        </select>
                      </div>
                    </div>

                    {loadingHistory ? (
                      <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading history...</p>
                      </div>
                    ) : paginatedItems.length > 0 ? (
                      <>
                        <div className="history-list">
                          {paginatedItems.map((item, index) => {
                            const botMessages =
                              item.messages?.filter(
                                (msg) => msg.sender === "bot"
                              ) || [];

                            const language = extractLanguageFromMessages(
                              item.messages
                            );
                            const timestamp =
                              item.messages?.[0]?.timestamp || Date.now();

                            return (
                              <div
                                key={item._id || index}
                                className="history-item-card"
                              >
                                <div className="history-card-header">
                                  <div className="history-meta">
                                    <span className="history-date">
                                      {new Date(timestamp).toLocaleDateString(
                                        "en-US",
                                        {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )}
                                    </span>
                                    <span className="history-language">
                                      {language}
                                    </span>
                                    <span className="conversation-count">
                                      {Math.floor(item.messages?.length / 2) ||
                                        0}{" "}
                                      exchanges
                                    </span>
                                  </div>
                                  <div className="history-actions">
                                    <button
                                      className="btn-action view"
                                      onClick={() => handleViewDetails(item)}
                                      title="View Details"
                                    >
                                      👁️
                                    </button>
                                    <button
                                      className="btn-action copy"
                                      onClick={() =>
                                        handleCopy(
                                          botMessages
                                            .map((msg) => msg.message)
                                            .join(
                                              "\n\n--- Next Response ---\n\n"
                                            )
                                        )
                                      }
                                      title="Copy All Code"
                                    >
                                      <img
                                        src={adminImage.CopyIcon}
                                        alt="Copy"
                                      />
                                    </button>
                                    <button
                                      className="btn-action download"
                                      onClick={() =>
                                        handleDownload(
                                          botMessages
                                            .map((msg) => msg.message)
                                            .join(
                                              "\n\n--- Next Response ---\n\n"
                                            ),
                                          `code-${index + 1}.txt`
                                        )
                                      }
                                      title="Download"
                                    >
                                      <img
                                        src={adminImage.PdfLogo}
                                        alt="Download"
                                      />
                                    </button>
                                    <button
                                      className="btn-action delete"
                                      onClick={() => handleDelete(item._id)}
                                      title="Delete"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>

                                {/* Show all conversation exchanges */}
                                <div className="conversation-thread">
                                  {item.messages?.map((message, msgIndex) => {
                                    if (message.sender === "user") {
                                      return (
                                        <div
                                          key={msgIndex}
                                          className="history-message-block"
                                        >
                                          <div className="message-header">
                                            <span className="message-sender">
                                              You:
                                            </span>
                                            <span className="message-time">
                                              {new Date(
                                                message.timestamp
                                              ).toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                            </span>
                                          </div>
                                          <div className="code-generator-message-content">
                                            {message.message.length > 150
                                              ? message.message.substring(
                                                  0,
                                                  150
                                                ) + "..."
                                              : message.message}
                                          </div>
                                        </div>
                                      );
                                    } else if (message.sender === "bot") {
                                      return (
                                        <div
                                          key={msgIndex}
                                          className="message-block bot-message"
                                        >
                                          <div className="code-generator-message-content">
                                            <div className="code-preview-container">
                                              <pre className="code-preview-text">
                                                {getCodePreview(
                                                  message.message,
                                                  1
                                                )}
                                              </pre>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="pagination">
                            <button
                              className="pagination-btn"
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                            >
                              ← Previous
                            </button>
                            <span className="pagination-info">
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              className="pagination-btn"
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages)
                                )
                              }
                              disabled={currentPage === totalPages}
                            >
                              Next →
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="empty-state">
                        <p>
                          No history found.{" "}
                          {searchTerm && "Try different search terms or "}{" "}
                          Generate some code to see it here.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for detailed view */}
      {showModal && selectedHistoryItem && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Code Generation History</h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {/* Show all messages in the conversation */}
              {selectedHistoryItem.messages?.map((message, index) => (
                <div key={index} className="modal-section">
                  {message.sender === "user" ? (
                    <>
                      <h4>Your Prompt:</h4>
                      <p className="modal-prompt">{message.message}</p>
                    </>
                  ) : (
                    <>
                      <div className="section-header">
                        <h4>Generated Code:</h4>
                      </div>
                      <div className="modal-code-display">
                        <div className="code-header-with-copy">
                          <span>Generated Code</span>
                          <button
                            className="copy-btn-code"
                            onClick={() => handleCopy(message.message)}
                            title="Copy This Code"
                          >
                            <img src={adminImage.CopyIcon} alt="Copy" />
                          </button>
                        </div>
                        <div className="code-content">
                          {renderCodeLines(message.message)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn copy"
                onClick={() =>
                  handleCopy(
                    selectedHistoryItem.messages
                      ?.filter((msg) => msg.sender === "bot")
                      .map((msg) => msg.message)
                      .join("\n\n--- Next Code ---\n\n") || ""
                  )
                }
              >
                Copy All Code
              </button>
              <button
                className="modal-btn download"
                onClick={() =>
                  handleDownload(
                    selectedHistoryItem.messages
                      ?.filter((msg) => msg.sender === "bot")
                      .map((msg) => msg.message)
                      .join("\n\n--- Next Code ---\n\n") || "",
                    "history-code.txt"
                  )
                }
              >
                Download All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CodeGenerate;
