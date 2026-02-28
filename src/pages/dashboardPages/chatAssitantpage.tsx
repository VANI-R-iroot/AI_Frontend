import React, { useEffect, useState, useRef } from "react";
import {
  isToday,
  isYesterday,
  isWithinInterval,
  subDays,
  parseISO,
  isBefore,
} from "date-fns";
import DOMPurify from "dompurify";
import {
  IoMicOffSharp,
  IoSendSharp,
  IoMicOutline,
  IoAddOutline,
  IoEllipsisVertical,
} from "react-icons/io5";
import {
  BiLike,
  BiDislike,
  BiShare,
  BiCopy,
  BiChevronDown,
} from "react-icons/bi";
import { IoMdRefresh } from "react-icons/io";
import { BsFillPinAngleFill, BsTrash } from "react-icons/bs";
import { FiFileText, FiChevronRight } from "react-icons/fi";
import { LuAperture } from "react-icons/lu";
import axiosInstance from "../../utils/baseUrl";
import ReactMarkdown from "react-markdown";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface ChatMessage {
  id: string;
  sender: "user" | "chatGpt";
  name: string;
  content: string;
  avatar?: string;
  title?: string;
  isBot?: boolean;
  message: string;
  assistantName: string;
  sendTime: string;
}

interface Assistant {
  _id: string;
  id?: string | number;
  assistantName: string;
  assistantIcon: string;
  brandIcon: string;
  title: string;
  promptDescription: string;
  last_chat: ChatMessage[];
}

interface TooltipProps {
  show: boolean;
  text: string;
  position: "top" | "right";
}

interface ContextMenuPosition {
  x: number;
  y: number;
}

interface FileCategories {
  Today: ChatMessage[];
  Yesterday: ChatMessage[];
  "Previous 7 days": ChatMessage[];
  Older: ChatMessage[];
}

interface AssistantResponse {
  data: Assistant[];
}

const ChatAssistantPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("Templates");
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(
    null
  );
  const [assistantData, setAssistantData] = useState<Assistant[]>([]);
  const [showFileTooltip, setShowFileTooltip] = useState<boolean>(false);
  const [showVoiceTooltip, setShowVoiceTooltip] = useState<boolean>(false);
  const [showSendTooltip, setShowSendTooltip] = useState<boolean>(false);
  const [showContextMenu, setShowContextMenu] = useState<boolean>(false);
  const [contextMenuPosition, setContextMenuPosition] =
    useState<ContextMenuPosition>({ x: 0, y: 0 });

  // Speech Recognition State
  const [listening, setListening] = useState<boolean>(false);
  const [isRecognitionSupported, setIsRecognitionSupported] =
    useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>("");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  // Constants
  const colors = ["#1a9db1", "#e74c3c", "#2ecc71", "#f1c40f", "#9b59b6"];
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsRecognitionSupported(true);

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInputMessage((prev) => prev + finalTranscript);
          setInterimTranscript("");
        } else {
          setInterimTranscript(interimTranscript);
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setListening(false);
        setInterimTranscript("");

        if (recognitionRef.current && recognitionRef.current.shouldRestart) {
          try {
            recognition.start();
          } catch (error) {
            console.error("Error restarting recognition:", error);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setListening(false);
        setInterimTranscript("");

        if (event.error === "not-allowed") {
          alert(
            "Microphone access denied. Please allow microphone access and try again."
          );
        } else if (event.error === "no-speech") {
          console.log("No speech detected, continuing...");
          if (recognitionRef.current && recognitionRef.current.shouldRestart) {
            setTimeout(() => {
              try {
                recognition.start();
              } catch (error) {
                console.error("Error restarting after no-speech:", error);
              }
            }, 100);
          }
        } else {
          alert(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current = recognition;
      recognitionRef.current.shouldRestart = false;
    } else {
      setIsRecognitionSupported(false);
      console.log("Speech recognition not supported");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.shouldRestart = false;
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error("Error stopping recognition in cleanup:", error);
        }
      }
    };
  }, []);

  // Fetch Assistant Data
  useEffect(() => {
    const fetchAssistantData = async () => {
      const cachedData = sessionStorage.getItem("assistantData");
      if (cachedData) {
        setAssistantData(JSON.parse(cachedData));
      } else {
        try {
          const res = await axiosInstance.get<AssistantResponse>(
            "/getAllAssistantUser"
          );
          const data = res.data.data || [];
          setAssistantData(data);
          sessionStorage.setItem("assistantData", JSON.stringify(data));
        } catch (error) {
          console.error("Failed to fetch assistant data:", error);
        }
      }
    };
    fetchAssistantData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenuRef]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleFileSelect = (fileId: number) => {
    setSelectedFile(fileId);
  };

  const handleContextMenu = (e: React.MouseEvent, _id?: string) => {
    e.preventDefault();
    setShowContextMenu(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const assistantId = activeAssistant?._id || activeAssistant?.id;
    if (!assistantId) return;

    const payload = {
      id: assistantId,
      chatData: inputMessage,
    };

    try {
      const res = await axiosInstance.post("chat-openai-assistant-bot", payload);

      const newUserMessage: ChatMessage = {
        id: String(messages.length + 1),
        sender: "user",
        name: "Adam Milner",
        content: inputMessage,
        message: inputMessage,
        assistantName: activeAssistant?.assistantName || "",
        sendTime: new Date().toISOString(),
      };

      const botReply = res.data?.data || "";
      const newBotMessage: ChatMessage = {
        id: String(messages.length + 2),
        sender: "chatGpt",
        name: activeAssistant?.assistantName || "Assistant",
        content: botReply,
        message: botReply,
        assistantName: activeAssistant?.assistantName || "",
        sendTime: new Date().toISOString(),
      };

      setMessages([...messages, newUserMessage, newBotMessage]);
      setInputMessage("");
      setInterimTranscript("");
      setShowSendTooltip(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    if (!isRecognitionSupported) {
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    if (!recognitionRef.current) {
      alert("Speech recognition not initialized");
      return;
    }

    if (listening) {
      recognitionRef.current.shouldRestart = false;
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
      setListening(false);
      setInterimTranscript("");
    } else {
      recognitionRef.current.shouldRestart = true;
      try {
        recognitionRef.current.start();
      } catch (error) {
        if (error === "InvalidStateError") {
          recognitionRef.current.stop();
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (retryError) {
              console.error("Error restarting recognition:", retryError);
              alert("Could not start speech recognition. Please try again.");
            }
          }, 100);
        } else {
          alert(
            "Could not start speech recognition. Please check your microphone permissions."
          );
        }
      }
    }
  };

  // Context Menu Handlers
  const handleCopy = () => {
    setShowContextMenu(false);
  };

  const handlePinChat = () => {
    setShowContextMenu(false);
  };

  const handleRename = () => {
    setShowContextMenu(false);
  };

  const handleDeleteChat = () => {
    setShowContextMenu(false);
  };

  // Components
  const Tooltip: React.FC<TooltipProps> = ({ show, text }) => {
    if (!show) return null;
    return (
      <div className={`userCodegeneratechat-tooltip ${show ? "show" : ""}`}>
        {text}
      </div>
    );
  };

  const MessageComponent: React.FC<{ message: ChatMessage }> = ({
    message,
  }) => (
    <div
      key={message.id}
      className={`message-container ${message.sender}`}
      onContextMenu={(e) => handleContextMenu(e, message.id)}
    >
      <div className="avatar">
        {message.sender === "chatGpt" ? (
          <div className="bot-avata">
            <div
              className="chat-assistant-sidebar-icon"
              dangerouslySetInnerHTML={{
                __html: activeAssistant?.assistantIcon || "",
              }}
            />
          </div>
        ) : (
          <img src={message.avatar} alt={`${message.name} avatar`} />
        )}
      </div>

      <div className="message-content">
        {message.title && message.sender === "chatGpt" && (
          <div className="message-title">
            {" "}
            <ReactMarkdown>{message.message}</ReactMarkdown>
          </div>
        )}

        <div
          className="message-text"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(message.message),
          }}
        />
        <p className="card-text">{message.title}</p>

        {message.sender === "chatGpt" && (
          <div className="message-actions">
            <button className="action-button">
              <BiLike />
            </button>
            <button className="action-button">
              <BiDislike />
            </button>
            <button className="action-button">
              <BiShare />
            </button>
            <button
              className="action-button"
              onClick={(e) => handleContextMenu(e, message.id)}
            >
              <IoEllipsisVertical />
            </button>
            <button className="regenerate-button">
              <IoMdRefresh /> Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const AssistantTab: React.FC = () => (
    <div className="templates-list">
      {assistantData.map((agent: Assistant, index: number) => (
        <div
          className="col-sm-12 col-md-12"
          key={agent._id || index.toString()}
          onClick={() => setActiveAssistant(agent)}
        >
          <div className="dashboard-quick-access-card">
            <div
              className="chat-assistant-sidebar-icon"
              style={{ color: colors[index % 5] }}
              dangerouslySetInnerHTML={{ __html: agent.assistantIcon }}
            />
            <div className="card-body">
              <h5 className="card-title">{agent.assistantName}</h5>
              <p className="card-text">{agent.title}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const HistoryTab: React.FC = () => {
    const [fileCategories, setFileCategories] = useState<FileCategories>({
      Today: [],
      Yesterday: [],
      "Previous 7 days": [],
      Older: [],
    });
    const [showMore, setShowMore] = useState(false);

    const toggleShowMore = () => {
      setShowMore((prev) => !prev);
    };

    useEffect(() => {
      const allChats: ChatMessage[] =
        assistantData?.flatMap((assistant) => assistant.last_chat || []) || [];
      if (allChats.length) {
        const grouped = groupMessagesByDate(allChats);
        setFileCategories(grouped);
      }
    }, [assistantData]);

    const groupMessagesByDate = (messages: ChatMessage[]): FileCategories => {
      const today: ChatMessage[] = [];
      const yesterday: ChatMessage[] = [];
      const previous7Days: ChatMessage[] = [];
      const older: ChatMessage[] = [];

      messages.forEach((message) => {
        const sendDate = parseISO(message.sendTime);

        if (isToday(sendDate)) {
          today.push(message);
        } else if (isYesterday(sendDate)) {
          yesterday.push(message);
        } else if (
          isWithinInterval(sendDate, {
            start: subDays(new Date(), 7),
            end: subDays(new Date(), 2),
          })
        ) {
          previous7Days.push(message);
        } else if (isBefore(sendDate, subDays(new Date(), 7))) {
          older.push(message);
        }
      });

      return {
        Today: today,
        Yesterday: yesterday,
        "Previous 7 days": previous7Days,
        Older: older,
      };
    };

    return (
      <div className="files-section">
        {["Today", "Yesterday"].map(
          (section) =>
            fileCategories[section as keyof FileCategories]?.length > 0 && (
              <div key={section} className="assistant-category-section">
                <h2 className="category-title">{section}</h2>
                <div className="files-list">
                  {fileCategories[section as keyof FileCategories].map(
                    (file) => (
                      <div
                        key={file.id}
                        className={`file-item ${
                          selectedFile === parseInt(file.id) ? "selected" : ""
                        }`}
                        onClick={() => handleFileSelect(parseInt(file.id))}
                      >
                        <span className="assistant-chat-file-title">
                          {file.message?.substring(0, 50) ||
                            file.title ||
                            "Untitled"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )
        )}

        {(fileCategories["Previous 7 days"]?.length > 0 ||
          fileCategories["Older"]?.length > 0) && (
          <div className="show-more" onClick={toggleShowMore}>
            <span>{showMore ? "Show Less" : "Show More"}</span>
            <BiChevronDown
              className={`chevron-icon ${showMore ? "rotated" : ""}`}
            />
          </div>
        )}

        {showMore && (
          <>
            {fileCategories["Previous 7 days"]?.length > 0 && (
              <div className="assistant-category-section">
                <h2 className="category-title">Previous 7 days</h2>
                <div className="files-list">
                  {fileCategories["Previous 7 days"].map((file) => (
                    <div
                      key={file.id}
                      className={`file-item ${
                        selectedFile === parseInt(file.id) ? "selected" : ""
                      }`}
                      onClick={() => handleFileSelect(parseInt(file.id))}
                    >
                      <span className="assistant-chat-file-title">
                        {file.message?.substring(0, 50) ||
                          file.title ||
                          "Untitled"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fileCategories["Older"]?.length > 0 && (
              <div className="assistant-category-section">
                <h2 className="category-title">Older</h2>
                <div className="files-list">
                  {fileCategories["Older"].map((file) => (
                    <div
                      key={file.id}
                      className={`file-item ${
                        selectedFile === parseInt(file.id) ? "selected" : ""
                      }`}
                      onClick={() => handleFileSelect(parseInt(file.id))}
                    >
                      <span className="assistant-chat-file-title">
                        {file.message?.substring(0, 50)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="main-content-commo">
      <div className="container chat-code-generate-wrapper-page">
        <div className="chat-code-generate-wrapper">
          <div className="chat-code-generate-container">
            {/* Header */}
            <div className="chat-code-generate-header">
              <div className="chat-code-generate-header-left">
                <div
                  className="chat-assistant-sidebar-icon"
                  dangerouslySetInnerHTML={{
                    __html: activeAssistant?.assistantIcon || "",
                  }}
                />
                <span className="chat-code-generate-header-title">
                  {activeAssistant?.assistantName || "Select an Assistant"}
                </span>
              </div>
              <div>
                <IoEllipsisVertical className="chat-code-generate-header-menu-icon" />
              </div>
            </div>

            {/* Messages */}
            <div className="chat-code-generate-messages">
              {activeAssistant?.last_chat?.map((message) => (
                <MessageComponent key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Context Menu */}
            {showContextMenu && (
              <div
                className="context-menu"
                style={{
                  top: contextMenuPosition.y,
                  left: contextMenuPosition.x,
                }}
                ref={contextMenuRef}
              >
                <div className="menu-item" onClick={handleCopy}>
                  <BiCopy /> Copy
                </div>
                <div className="menu-item" onClick={handlePinChat}>
                  <BsFillPinAngleFill /> Pin Chat
                </div>
                <div className="menu-item" onClick={handleRename}>
                  <FiFileText /> Rename
                </div>
                <div className="menu-item delete" onClick={handleDeleteChat}>
                  <BsTrash /> Delete Chat
                </div>
              </div>
            )}

            {/* Input Footer */}
            <div className="chat-code-generate-input-footer">
              <div className="input-wrapper">
                <LuAperture className="left-input-icon-chat-code-chatbot" />

                <textarea
                  className="chat-code-generate-input-footer-insert-text"
                  placeholder={
                    listening ? "Listening... Speak now" : "Send a message..."
                  }
                  value={inputMessage + interimTranscript}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={1}
                />

                {listening && (
                  <div
                    className="listening-indicator"
                    style={{
                      position: "absolute",
                      right: "100px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#ff4444",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    🔴 Recording...
                  </div>
                )}

                <div className="input-button-group">
                  <div className="input-button-wrapper">
                    <button className="input-icon-button">
                      <IoAddOutline
                        className="input-icon"
                        onMouseEnter={() => setShowFileTooltip(true)}
                        onMouseLeave={() => setShowFileTooltip(false)}
                      />
                    </button>
                    <Tooltip
                      show={showFileTooltip}
                      text="Choose File"
                      position="top"
                    />
                  </div>

                  <div className="input-button-wrapper">
                    <button
                      className={`input-icon-button ${
                        listening ? "bg-red-100" : ""
                      }`}
                      onClick={toggleListening}
                      onMouseEnter={() => setShowVoiceTooltip(true)}
                      onMouseLeave={() => setShowVoiceTooltip(false)}
                      disabled={!isRecognitionSupported}
                      style={{
                        backgroundColor: listening ? "#fee2e2" : "transparent",
                        color: listening ? "#dc2626" : "inherit",
                      }}
                    >
                      {listening ? (
                        <IoMicOffSharp className="input-icon" />
                      ) : (
                        <IoMicOutline className="input-icon" />
                      )}
                    </button>
                    <Tooltip
                      show={showVoiceTooltip}
                      text={
                        !isRecognitionSupported
                          ? "Speech recognition not supported"
                          : listening
                          ? "Stop Listening"
                          : "Start Voice Input"
                      }
                      position="top"
                    />
                  </div>

                  <div className="input-button-wrapper">
                    <button
                      className="send-button"
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      onMouseEnter={() => setShowSendTooltip(true)}
                      onMouseLeave={() => setShowSendTooltip(false)}
                    >
                      <IoSendSharp />
                    </button>
                    <Tooltip
                      show={showSendTooltip}
                      text="Send message"
                      position="top"
                    />
                  </div>
                </div>
              </div>
              <div className="disclaimer">
                AiWave can make mistakes. Consider checking important
                information.
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Sidebar */}
        <div className={`collapsible-sidebar ${!isOpen ? "closed" : ""}`}>
          <div className="right-chat-assistant-section">
            <div className="tabs">
              <div
                className={`tab-chatbot ${
                  activeTab === "Templates" ? "active" : ""
                }`}
                onClick={() => setActiveTab("Templates")}
              >
                Assistant
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

            {activeTab === "Templates" ? <AssistantTab /> : <HistoryTab />}
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        className="sidebar-toggle-button"
        onClick={toggleSidebar}
        style={{ right: isOpen ? "320px" : "0px" }}
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
};

export default ChatAssistantPage;
