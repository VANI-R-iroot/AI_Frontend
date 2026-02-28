import React, { useEffect, useState } from "react";
import adminImage from "../../assets/image/admin/allImage";
import { io, Socket } from "socket.io-client";
import { useUserStore } from "../../zustand/userDetailsStore";
import axiosInstance from "../../utils/baseUrl";
import { apiConfig } from "../../utils/apiConfig";
import { IoSend } from "react-icons/io5";

const socket: Socket = io(apiConfig.webSocketUrl);

interface Message {
  sender: "user" | "bot" | "guest";
  text: string;
  senderName?: string;
  userEmail?: string;
}

interface ChatHistory {
  id: number;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface ChatMessagePayload {
  chatId?: number;
  text: string;
  sender: string;
  userID?: string;
  email?: string;
  senderName?: string;
}

interface UserData {
  email: string;
  name: string;
  _id: string;
}

// Interface for dynamic theme colors from database
interface ThemeColors {
  headerBgColor: string;
  headerText: string;
  headerTextColor: string;
  bodyBgColor: string;
  footerBgColor: string;
  footerTextColor: string;
  userMessageBg: string;
  botMessageBg: string;
  userMessageText: string;
  botMessageText: string;
  inputBgColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  customLogo?: string;
  chatLauncherIcon?: string;
  chatLauncherIconBg: string;
  poweredByText?: string;
}

interface ChatBotWidgetProps {
  previewMode?: boolean;
  customTheme?: ThemeColors;
}

const ChatBotWidget: React.FC<ChatBotWidgetProps> = ({
  previewMode = false,
  customTheme,
}) => {
  const userData = useUserStore((state) => state.userData || {}) as UserData;
  const [guestID, setGuestID] = useState<string | null>(null);

  // State for dynamic theme colors
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    headerBgColor: "#4F46E5",
    headerTextColor: "#FFFFFF",
    headerText: "AiProdbot",
    bodyBgColor: "#F9FAFB",
    footerBgColor: "#374151",
    footerTextColor: "#D1D5DB",
    userMessageBg: "#3B82F6",
    botMessageBg: "#E5E7EB",
    userMessageText: "#3B82F6",
    botMessageText: "#E5E7EB",
    inputBgColor: "#FFFFFF",
    buttonBgColor: "#10B981",
    buttonTextColor: "#FFFFFF",
    poweredByText: "Powered by AiProd",
    chatLauncherIconBg: "",
  });

  const [isThemeLoading, setIsThemeLoading] = useState(!previewMode);

  const userID = userData._id || guestID;
  const name = userData.name || "Guest User";
  const email = userData.email || `guest-${guestID}@AiProd.local`;

  const [open, setOpen] = useState(true);
  const [chatList, setChatList] = useState<ChatHistory[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatHistory | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [userStatus, setUserStatus] = useState<"online" | "offline">("offline");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (previewMode && customTheme) {
      setThemeColors(customTheme);
      setIsThemeLoading(false);
    }
  }, [previewMode, customTheme]);

  const fetchThemeColors = async () => {
    if (previewMode) return;

    try {
      setIsThemeLoading(true);
      const domain = window.location.hostname;

      const response = await axiosInstance.get("/chatbot-theme-colors", {
        params: {
          domain: domain,
          userID: userData._id,
        },
      });

      if (response.data.success && response.data.data) {
        const colors = response.data.data;
        setThemeColors({
          headerBgColor: colors.headerBgColor || "#4F46E5",
          headerTextColor: colors.headerTextColor || "#FFFFFF",
          headerText: colors.headerText || "AiProdbot",
          bodyBgColor: colors.bodyBgColor || "#F9FAFB",
          footerBgColor: colors.footerBgColor || "#374151",
          footerTextColor: colors.footerTextColor || "#D1D5DB",
          userMessageBg: colors.userMessageBg || "#3B82F6",
          botMessageBg: colors.botMessageBg || "#E5E7EB",

          userMessageText: colors.userMessageText || "#3B82F6",
          botMessageText: colors.botMessageText || "#E5E7EB",

          inputBgColor: colors.inputBgColor || "#FFFFFF",
          buttonBgColor: colors.buttonBgColor || "#10B981",
          buttonTextColor: colors.buttonTextColor || "#FFFFFF",
          customLogo: colors.customLogo || "",
          chatLauncherIcon: colors.chatLauncherIcon || "",
          chatLauncherIconBg: colors.chatLauncherIconBg || "#3B82F6",
          poweredByText: colors.poweredByText || "Powered by AiProd",
        });
      }
    } catch (error) {
      console.error("Failed to fetch theme colors:", error);
      // Keep default colors if API fails
    } finally {
      setIsThemeLoading(false);
    }
  };

  // Listen for theme updates
  useEffect(() => {
    if (!previewMode) {
      const handleThemeUpdate = () => {
        fetchThemeColors();
      };

      window.addEventListener("chatbot-theme-updated", handleThemeUpdate);

      return () => {
        window.removeEventListener("chatbot-theme-updated", handleThemeUpdate);
      };
    }
  }, [previewMode]);

  // Generate dynamic CSS styles
  const getDynamicStyles = (): React.CSSProperties =>
    ({
      "--header-bg-color": themeColors.headerBgColor,
      "--header-text-color": themeColors.headerTextColor,
      "--body-bg-color": themeColors.bodyBgColor,
      "--footer-bg-color": themeColors.footerBgColor,
      "--footer-text-color": themeColors.footerTextColor,
      "--user-message-bg": themeColors.userMessageBg,
      "--bot-message-bg": themeColors.botMessageBg,
      "--user-message-text": themeColors.userMessageText,
      "--bot-message-text": themeColors.botMessageText,
      "--input-bg-color": themeColors.inputBgColor,
      "--chat-launcher-icon": themeColors.chatLauncherIconBg,
      "--button-bg-color": themeColors.buttonBgColor,
      "--button-text-color": themeColors.buttonTextColor,
    } as React.CSSProperties);

  useEffect(() => {
    if (!previewMode) {
      fetchThemeColors();
    }
  }, [userData._id, previewMode]);

  useEffect(() => {
    if (!previewMode && !userData._id) {
      const savedGuestID = localStorage.getItem("guestID");
      if (savedGuestID) {
        setGuestID(savedGuestID);
      } else {
        const newID = `guest_${Date.now()}`;
        localStorage.setItem("guestID", newID);
        setGuestID(newID);
      }
    }
  }, [userData, previewMode]);

  useEffect(() => {
    if (!previewMode && userID) {
      socket.emit("join-live-chat", userID);
      setUserStatus("online");
    }
  }, [userID, previewMode]);

  // Create sample messages for preview
  const previewMessages: Message[] = [
    { sender: "bot", text: "Hello! How can I help you today?" },
    { sender: "user", text: "I need help with my account" },
    {
      sender: "bot",
      text: "I'd be happy to help you with your account. What specific issue are you experiencing?",
    },
  ];

  const previewChat: ChatHistory = {
    id: 1,
    title: "Preview Chat",
    messages: previewMessages,
    createdAt: new Date(),
  };

  useEffect(() => {
    if (previewMode) {
      setSelectedChat(previewChat);
      setUserStatus("online");
      return;
    }

    const fetchChatHistory = async () => {
      if (!userData._id) return;
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/singleLiveChatAgent", {
          params: { userID: userData._id },
        });

        if (response.data.success && response.data.data) {
          const chatData = response.data.data;
          const newChat: ChatHistory = {
            id: chatData._id || Date.now(),
            title: "Chat with AiProd",
            messages: chatData.messages.map((msg: any) => ({
              sender: msg.sender,
              text: msg.text,
              senderName: msg.senderName,
              userEmail: msg.userEmail,
            })),
            createdAt: new Date(chatData.createdAt || Date.now()),
          };

          setChatList([newChat]);
          setSelectedChat(newChat);
        }
      } catch (error) {
        console.error("Chat history load error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [userData._id, previewMode]);

  const handleSendMessage = (): void => {
    if (previewMode) {
      // In preview mode, just add the message locally
      if (!inputMessage.trim()) return;

      const newMessage: Message = {
        sender: "user",
        text: inputMessage,
      };

      setSelectedChat((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, newMessage],
            }
          : null
      );

      setInputMessage("");

      // Simulate bot response after 1 second
      setTimeout(() => {
        const botResponse: Message = {
          sender: "bot",
          text: "This is a preview response. Your customization looks great!",
        };

        setSelectedChat((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, botResponse],
              }
            : null
        );
      }, 1000);

      return;
    }

    if (!inputMessage.trim()) return;

    if (!selectedChat) {
      const newId: number = Date.now();
      const newChat: ChatHistory = {
        id: newId,
        title: `AiProd #${chatList.length + 1}`,
        messages: [],
        createdAt: new Date(),
      };

      setChatList([newChat, ...chatList]);
      setSelectedChat(newChat);

      setTimeout(() => {
        socket.emit("user-chat-message", {
          email,
          chatId: newId,
          text: inputMessage,
          senderName: name,
          userID,
          sender: "user",
        });
        setInputMessage("");
      }, 100);

      return;
    }

    socket.emit("user-chat-message", {
      email,
      chatId: selectedChat.id,
      text: inputMessage,
      senderName: name,
      userID,
      sender: "user",
    });

    setInputMessage("");
  };

  const toggleChat = () => {
    setOpen(!open);
  };

  const handleBack = () => {
    if (!previewMode) {
      setSelectedChat(null);
    }
  };

  const handleChatSelect = (chat: ChatHistory) => {
    if (!previewMode) {
      setSelectedChat(chat);
    }
  };

  const handleNewConversation = () => {
    if (previewMode) return;

    const newChat: ChatHistory = {
      id: Date.now(),
      title: `AiProd #${chatList.length + 1}`,
      messages: [],
      createdAt: new Date(),
    };
    setChatList([newChat, ...chatList]);
    setSelectedChat(newChat);
  };

  const timeAgo = (date: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  useEffect(() => {
    if (previewMode) return;

    const handleChatMessage = (payload: ChatMessagePayload): void => {
      const { chatId, text, sender, userID: msgUserID } = payload;
    
      if (msgUserID !== userID && msgUserID) return;

      if (chatId) {
        setChatList((prevChatList) => {
          const chatExists = prevChatList.some((chat) => chat.id === chatId);

          if (!chatExists) {
            const newChat: ChatHistory = {
              id: chatId,
              title: `AiProd #${prevChatList.length + 1}`,
              messages: [{ sender: sender === "bot" ? "bot" : "user", text }],
              createdAt: new Date(),
            };

            if (!selectedChat) {
              setSelectedChat(newChat);
            }

            return [newChat, ...prevChatList];
          }

          const updatedList = prevChatList.map((chat) => {
            if (chat.id === chatId) {
              const updatedMessages: Message[] = [
                ...chat.messages,
                { sender: sender === "bot" ? "bot" : "user", text },
              ];

              return {
                ...chat,
                messages: updatedMessages,
              };
            }
            return chat;
          });

          if (selectedChat?.id === chatId) {
            const updatedChat = updatedList.find((chat) => chat.id === chatId);
            if (updatedChat) {
              setSelectedChat(updatedChat);
            }
          }

          return updatedList;
        });
      } else if (selectedChat) {
        const updatedMessages: Message[] = [
          ...selectedChat.messages,
          { sender: sender === "bot" ? "bot" : "user", text },
        ];

        const updatedChat: ChatHistory = {
          ...selectedChat,
          messages: updatedMessages,
        };

        setChatList((prevList) => {
          const newList = prevList.map((chat) =>
            chat.id === selectedChat.id ? updatedChat : chat
          );
          return newList;
        });

        setSelectedChat(updatedChat);
      }
    };

    socket.on("receive-chat-message", handleChatMessage);

    return () => {
      socket.off("receive-chat-message", handleChatMessage);
    };
  }, [selectedChat, userID, previewMode]);

  if (isThemeLoading) {
    return (
      <div className="smart-ai-chat-bot-preview">
        <div className="chat-popup">
          <div className="loading-theme">Loading theme...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="full-chat-widget-are">
      <div
        className="chat-launcher-icon"
        style={{ backgroundColor: themeColors.chatLauncherIconBg }}
        onClick={toggleChat}
      >
        <img
          src={themeColors.chatLauncherIcon || adminImage.ChatAgentIcon}
          alt="Smart AI"
          style={{
            maxWidth: "32px",
            maxHeight: "32px",
            objectFit: "contain",
          }}
        />
      </div>
      {open && (
        <div className="smart-ai-chat-bot-preview" style={getDynamicStyles()}>
          <div className="chat-popup">
            <div
              className="chat-header"
              style={{
                backgroundColor: themeColors.headerBgColor,
                color: themeColors.headerTextColor,
              }}
            >
              <div className="widget-header-left">
                <img
                  src={themeColors.customLogo || adminImage.ChatAgentIcon}
                  alt="Smart AI"
                  style={{
                    maxWidth: "32px",
                    maxHeight: "32px",
                    objectFit: "contain",
                  }}
                />
                <span className="widget-chat-title">
                  {" "}
                  {themeColors.headerText}
                </span>
                <div className="widget-chatbot-user-status">
                  <span className="admin-cht-bot-status-tex">
                    {userStatus === "online" ? "Online" : "Offline"}
                  </span>
                  <span className={`status-dot ${userStatus}`}></span>
                </div>
              </div>

              {!previewMode && (
                <button
                  onClick={toggleChat}
                  style={{ color: themeColors.headerTextColor }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Body with dynamic background */}
            <div
              className="widget-chat-body"
              style={{ backgroundColor: themeColors.bodyBgColor }}
            >
              {isLoading && !previewMode ? (
                <div className="loading-indicator">Loading chat history...</div>
              ) : !selectedChat ? (
                <div className="chat-list-container">
                  {chatList.length === 0 ? (
                    <div className="no-chats">
                      <p>No conversations yet. Start a new one!</p>
                    </div>
                  ) : (
                    <ul>
                      {chatList.map((chat) => (
                        <li
                          key={chat.id}
                          onClick={() => handleChatSelect(chat)}
                          className="chat-list-item"
                        >
                          <div className="chat-list-left">
                            <img
                              src={
                                themeColors.customLogo ||
                                adminImage.ChatAgentIcon
                              }
                              alt="icon"
                              style={{
                                maxWidth: "24px",
                                maxHeight: "24px",
                                objectFit: "contain",
                              }}
                            />
                            <span>{chat.title}</span>
                          </div>
                          <span className="chat-time">
                            {timeAgo(chat.createdAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="chat-detail-container">
                  {!previewMode && (
                    <div className="chat-back">
                      <button onClick={handleBack}>🔙</button>
                      <strong>{selectedChat.title}</strong>
                    </div>
                  )}

                  <div className="widget-chat-messages">
                    {selectedChat.messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`chat-message-wrapper ${
                          msg.sender === "bot" ? "bot" : "user"
                        }`}
                      >
                        {msg.sender === "bot" && (
                          <div className="bot-logo">
                            <img
                              src={
                                themeColors.customLogo ||
                                adminImage.ChatAgentIcon
                              }
                              alt="Bot"
                              style={{
                                maxWidth: "34px",
                                maxHeight: "34px",
                                objectFit: "contain",
                                marginRight: "0px",
                              }}
                            />
                          </div>
                        )}

                        <div
                          className="chat-bubble"
                          style={{
                            backgroundColor:
                              msg.sender === "bot"
                                ? themeColors.botMessageBg
                                : themeColors.userMessageBg,
                            color:
                              msg.sender === "user"
                                ? themeColors.userMessageText
                                : themeColors.botMessageText,
                          }}
                        >
                          <span>{msg.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="live-chat-input-area "
                    style={{ backgroundColor: themeColors.inputBgColor }}
                  >
                    <textarea
                      placeholder="Type here and press enter"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(
                        e: React.KeyboardEvent<HTMLTextAreaElement>
                      ) => {
                        if (e.key === "Enter" && inputMessage.trim() !== "") {
                          handleSendMessage();
                        }
                      }}
                      rows={1} // Keeps the initial height small
                      className="live-chat-input-textarea"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className={inputMessage.trim() ? "active" : "inactive"}
                    >
                      <IoSend />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with dynamic colors */}
            <div
              className="chat-footer"
              style={{
                backgroundColor: themeColors.footerBgColor,
                color: themeColors.footerTextColor,
              }}
            >
              {!selectedChat && !previewMode && (
                <button
                  onClick={handleNewConversation}
                  style={{
                    backgroundColor: themeColors.buttonBgColor,
                    color: themeColors.buttonTextColor,
                  }}
                >
                  Start a New Conversation
                </button>
              )}
              <p style={{ color: themeColors.footerTextColor }}>
                {themeColors.poweredByText || "Powered by AiProd"}

                {!previewMode && <a href="#">{"AiProd"}</a>}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotWidget;
