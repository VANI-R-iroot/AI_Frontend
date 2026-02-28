import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../../utils/baseUrl";
import { useUserStore } from "../../../zustand/userDetailsStore";

interface Message {
  id: string;
  content: string;
  type: "user" | "ai";
  timestamp: Date;
}

interface UserData {
  _id: string;
}

const AiProdChatInterface: React.FC = () => {
  const userData = useUserStore((state) => state.userData || {}) as UserData;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm AiProd, your intelligent assistant. How can I help you today?",
      type: "ai",
      timestamp: new Date(),
    },
  ]);
  const userId = userData._id;

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const hasProcessedInitialMessage = useRef(false);

  const location = useLocation();
  const { message: initialMessage } = location.state || {};

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      const panel = document.querySelector(".toolkit-right-panel");
      if (panel) {
        panel.scrollTop = panel.scrollHeight;
      }
    }, 100);
  }, []);

  const autoResize = useCallback(() => {
    if (chatInputRef.current) {
      chatInputRef.current.style.height = "auto";
      const newHeight = chatInputRef.current.scrollHeight;

      if (newHeight > 200) {
        chatInputRef.current.style.height = "200px";
        chatInputRef.current.classList.add("scrollable");
      } else {
        chatInputRef.current.style.height = newHeight + "px";
        chatInputRef.current.classList.remove("scrollable");
      }
    }
  }, []);

  const addMessage = useCallback(
    (content: string, type: "user" | "ai") => {
      const newMessage: Message = {
        id: Date.now().toString(),
        content,
        type,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    },
    [scrollToBottom]
  );

  const callAIAPI = useCallback(
    async (userMessage: string) => {
      setIsTyping(true);

      try {
        const response = await axiosInstance.post("/chatWithTools", {
          userId: userId,
          messages: [
            {
              role: "user",
              content: userMessage,
            },
          ],
        });

        setIsTyping(false);

        if (response.data.success) {
          // Backend থেকে response.data.data.message আসছে
          const aiResponse =
            response.data.data?.message ||
            response.data.data ||
            "Response received";
          addMessage(aiResponse, "ai");
        } else {
          addMessage("Sorry, I couldn't process your request.", "ai");
        }
      } catch (error) {
        console.error("API Error:", error);
        setIsTyping(false);
        addMessage(
          "Sorry, API limit Expire or there was an error processing your request. Please try again.  ",
          "ai"
        );
      }
    },
    [userId, addMessage]
  );

  // Handle initial message from navigation - শুধু একবার execute হবে
  useEffect(() => {
    if (initialMessage && !hasProcessedInitialMessage.current) {
      hasProcessedInitialMessage.current = true;
      addMessage(initialMessage, "user");
      callAIAPI(initialMessage);
    }
  }, []);

  const sendMessage = useCallback(async () => {
    const message = inputValue.trim();
    if (!message) return;

    addMessage(message, "user");
    setInputValue("");

    if (chatInputRef.current) {
      chatInputRef.current.style.height = "24px";
    }

    await callAIAPI(message);
  }, [inputValue, addMessage, callAIAPI]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    autoResize();
  }, [inputValue, autoResize]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <div className="user-toolkit-chat">
        <div className="toolkit-chat-header">
          <div className="toolkit-header-left">
            <button className="back-btn" onClick={goBack}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="header-title">AiProd</div>
          </div>
          <button className="menu-btn" onClick={toggleSidebar}>
            <i className="fas fa-ellipsis-v"></i>
          </button>
        </div>

        {/* History Sidebar */}
        <div className={`history-sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <div className="sidebar-title">Chat History</div>
            <button className="close-btn" onClick={toggleSidebar}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="sidebar-content">
            <div className="history-item">
              <div className="history-item-title">Previous conversation 1</div>
              <div className="history-item-time">2 hours ago</div>
            </div>
            <div className="history-item">
              <div className="history-item-title">Previous conversation 2</div>
              <div className="history-item-time">Yesterday</div>
            </div>
            <div className="history-item">
              <div className="history-item-title">Previous conversation 3</div>
              <div className="history-item-time">2 days ago</div>
            </div>
          </div>
        </div>

        <div className="toolkit-right-panel">
          <div className="toolkit-chat-messages" ref={chatMessagesRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`toolkit-message ${message.type}`}
              >
                <div className="toolkit-message-avatar">
                  <i
                    className={
                      message.type === "user" ? "fas fa-user" : "fas fa-robot"
                    }
                  ></i>
                </div>
                <div className="toolkit-message-content">
                  <div>{message.content}</div>
                  <div className="toolkit-message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="typing-indicator">
                <div className="toolkit-message-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
          </div>

          <div className="toolkit-chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                ref={chatInputRef}
                className="user-toolkit-chat-input"
                placeholder="Type your message here..."
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="user-toolkit-send-button"
                onClick={sendMessage}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiProdChatInterface;
