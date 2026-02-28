import React, { useEffect, useState, useRef } from "react";
import {
  IoMicOffSharp,
  IoSendSharp,
  IoMicOutline,
  IoAddOutline,
  IoEllipsisVertical,
} from "react-icons/io5";
import { BiCopy } from "react-icons/bi";
import { BsFillPinAngleFill, BsTrash } from "react-icons/bs";
import { FiFileText, FiChevronRight } from "react-icons/fi";
import { LuAperture } from "react-icons/lu";
import axiosInstance from "../../utils/baseUrl";
import MessageComponent from "../../components/userDashboard/codeStyle/codeFormate";

// Type Definitions
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  message: string;
  timestamp: string;
  _id?: string;
  avatar?: string;
}

interface Assistant {
  _id: string;
  email: string;
  messages: ChatMessage[];
  code: string;
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


const ChatAssistantPage: React.FC = () => {

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("Templates");
  const [contextMenuOpenId, setContextMenuOpenId] = useState<string | null>(
    null
  );
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

  const [listening, setListening] = useState<boolean>(false);
  const [isRecognitionSupported, setIsRecognitionSupported] =
    useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getLatestAssistant = (data: Assistant[]): Assistant | null => {
    if (!data || data.length === 0) return null;

    const assistantsWithMessages = data.filter(
      (assistant) => assistant.messages && assistant.messages.length > 0
    );

    if (assistantsWithMessages.length === 0) return null;

    return assistantsWithMessages.sort((a, b) => {
      const aLatestTime = Math.max(
        ...a.messages.map((m) => new Date(m.timestamp).getTime())
      );
      const bLatestTime = Math.max(
        ...b.messages.map((m) => new Date(m.timestamp).getTime())
      );
      return bLatestTime - aLatestTime;
    })[0];
  };

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

  const fetchCodeGeneratedData = async () => {
    try {
      const res = await axiosInstance.get("/AiCodeList", {
        // headers: { ...token.headers },
      });
      const data = res.data.data.data;
      setAssistantData(data);

      const latestAssistant = getLatestAssistant(data);
      if (latestAssistant && !activeAssistant) {
        setActiveAssistant(latestAssistant);
      }
    } catch (error) {
      console.error("Failed to fetch assistant data:", error);
    }
  };

  useEffect(() => {
    fetchCodeGeneratedData();
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
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const payload = { inputMessage };

    try {
      const codeGenerate = await axiosInstance.post(
        "ai-code-generate",
        payload,
        // {
        //   headers: { ...token.headers },
        // }
      );
      if (codeGenerate.status === 200) {
        const data = codeGenerate.data.data.data;
        setMessages([...messages, data]);
        fetchCodeGeneratedData();
        setInputMessage("");
        setInterimTranscript("");
        setShowSendTooltip(false);
      }
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

  const Tooltip: React.FC<TooltipProps> = ({ show, text }) => {
    if (!show) return null;
    return (
      <div className={`userCodegeneratechat-tooltip ${show ? "show" : ""}`}>
        {text}
      </div>
    );
  };

  const handleContextMenu = (e: React.MouseEvent, id?: string) => {
    e.preventDefault();
    setContextMenuOpenId(id || null);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };
  const AssistantTab: React.FC = () => (
    <div className="templates-list">
      {assistantData.map((agent: Assistant, index: number) => {
        const userMessage =
          agent.messages.find((m) => m.sender === "user")?.message || "";
        const previewText =
          userMessage.split(" ").slice(0, 5).join(" ") + "...";

        return (
          <div
            className="col-sm-12 col-md-12"
            key={agent._id || index.toString()}
            onClick={() => setActiveAssistant(agent)}
          >
            <div className="dashboard-quick-access-card">
              <div className="card-body">
                <p className="card-text">{previewText}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderMessages = () => {
    if (activeAssistant?.messages && activeAssistant.messages.length > 0) {
      return (
        <MessageComponent
          messages={activeAssistant.messages}
          onContextMenu={handleContextMenu}
          contextMenuOpenId={contextMenuOpenId}
        />
      );
    } else {
      return (
        <div
          className="default-message-container"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "#666",
            fontSize: "18px",
            fontWeight: "500",
          }}
        >
     AiProd
        </div>
      );
    }
  };

  return (
    <div className="main-content-commo">
      <div className="container chat-code-generate-wrapper-page">
        <div className="chat-code-generate-wrapper">
          <div className="chat-code-generate-container">
            {/* Header */}
            <div className="chat-code-generate-header">
              <div className="chat-code-generate-header-left">
                <span className="chat-code-generate-header-title">
                  {"Select an Assistant"}
                </span>
              </div>
              <div>
                <IoEllipsisVertical className="chat-code-generate-header-menu-icon" />
              </div>
            </div>

            {/* Messages */}
            <div className="chat-code-generate-messages">
              {renderMessages()}
              <div ref={messagesEndRef} />
            </div>

            {showContextMenu && (
              <div
                className="context-menu"
                style={{
                  top: contextMenuPosition.y,
                  left: contextMenuPosition.x,
                }}
                ref={contextMenuRef}
                role="menu"
                tabIndex={-1}
              >
                <ul className="context-menu-list">
                  <li
                    className="menu-item"
                    role="menuitem"
                    tabIndex={0}
                    onClick={handleCopy}
                  >
                    <BiCopy /> <span>Copy</span>
                  </li>
                  <li
                    className="menu-item"
                    role="menuitem"
                    tabIndex={0}
                    onClick={handlePinChat}
                  >
                    <BsFillPinAngleFill /> <span>Pin Chat</span>
                  </li>
                  <li
                    className="menu-item"
                    role="menuitem"
                    tabIndex={0}
                    onClick={handleRename}
                  >
                    <FiFileText /> <span>Rename</span>
                  </li>
                  <li
                    className="menu-item delete"
                    role="menuitem"
                    tabIndex={0}
                    onClick={handleDeleteChat}
                  >
                    <BsTrash /> <span>Delete Chat</span>
                  </li>
                </ul>
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
        AiProd    can make mistakes. Check important info.
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Sidebar */}
        <div className={`collapsible-sidebar ${!isOpen ? "closed" : ""}`}>
          <div className="right-chat-assistant-section">
            <div className="tabs">
              <div
                className={`tab-chatbot ${activeTab === "Templates"}`}
                onClick={() => setActiveTab("Templates")}
              >
                History
              </div>
            </div>

            {<AssistantTab />}
          </div>
        </div>
      </div>

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
