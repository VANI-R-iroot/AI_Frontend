import React, { useEffect, useState } from "react";
import adminImage from "../assets/image/admin/allImage";
import { io, Socket } from "socket.io-client";
import { IoSend } from "react-icons/io5";
import { SiChatbot } from "react-icons/si";
import { toast } from "react-toastify";
import { apiConfig } from "../utils/apiConfig";

const socket: Socket = io(apiConfig.webSocketUrl);

interface Message {
  sender: "user" | "bot" | "guest";
  text: string;
  senderName?: string;
  userEmail?: string;
  timestamp?: string;
}

interface ChatHistory {
  id: number;
  title: string;
  messages: Message[];
  createdAt: Date;
  sessionId: string;
}

const ChatBotWidget: React.FC = () => {
  const [guestID, setGuestID] = useState<string | null>(null);
  const userID = guestID;

  const [open, setOpen] = useState(false);
  const [chatList, setChatList] = useState<ChatHistory[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatHistory | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [userStatus, setUserStatus] = useState<"online" | "offline">("offline");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Error handler function
  const handleError = (error: any, context: string = "") => {
    const errorMessage = error?.message || error?.error || "An error occurred";
    const statusCode = error?.statusCode || error?.status;

    console.error(`Error in ${context}:`, error);

    switch (statusCode) {
      case 401:
        toast.error("Unauthorized! Please check your credentials.", {
          position: "top-right",
          autoClose: 3000,
        });
        break;
      case 404:
        toast.error("Resource not found!", {
          position: "top-right",
          autoClose: 3000,
        });
        break;
      case 500:
        toast.error("Server error! Please try again later.", {
          position: "top-right",
          autoClose: 3000,
        });
        break;
      default:
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
    }
  };

  // Generate Guest ID
  useEffect(() => {
    const storedID = localStorage.getItem("guestID");
    if (storedID) {
      setGuestID(storedID);
    } else {
      const randomFourDigit = Math.floor(1000 + Math.random() * 9000);
      const newID = `guest_${randomFourDigit}`;
      localStorage.setItem("guestID", newID);
      setGuestID(newID);
    }
  }, []);

  useEffect(() => {
    if (userID) {
      socket.emit("ai-agent-message", userID);
      setUserStatus("online");
    }
  }, [userID]);

  useEffect(() => {
    if (!userID) return;

    const fetchChatHistory = () => {
      setIsLoading(true);
      socket.emit("chat:sessions", { userId: userID });
    };

    fetchChatHistory();
  }, [userID]);

  useEffect(() => {
    if (!userID) return;
    socket.on("chat:sessions:response", (data: any) => {
      setIsLoading(false);

      if (data.error) {
        handleError(data, "Fetching chat sessions");
        return;
      }

      if (data.sessions && data.sessions.length > 0) {
        const formattedChats: ChatHistory[] = data.sessions.map(
          (session: any) => ({
            id: session.sessionId,
            title: session.title || `AiProd Assistant`,
            sessionId: session.sessionId,
            messages: [],
            createdAt: new Date(session.createdAt),
          })
        );

        setChatList(formattedChats);
        if (formattedChats.length > 0 && !selectedChat) {
          loadChatMessages(formattedChats[0].sessionId);
        }
      } else {
        setChatList([]);
      }
    });

    // Handle specific chat history response
    socket.on("chat:history:response", (data: any) => {
      if (data.error) {
        handleError(data, "Fetching chat history");
        return;
      }

      if (data.messages && data.messages.length > 0) {
        const formattedMessages: Message[] = data.messages.map((msg: any) => ({
          sender: msg.role === "assistant" ? "bot" : "user",
          text: msg.content,
          timestamp: msg.timestamp,
        }));

        setChatList((prevList) =>
          prevList.map((chat) => {
            if (chat.sessionId === data.sessionId) {
              const updatedChat = {
                ...chat,
                messages: formattedMessages,
              };
              setSelectedChat(updatedChat);
              return updatedChat;
            }
            return chat;
          })
        );
      }
    });

    socket.on(
      "assistant:typing",
      (data: { isTyping: boolean; sessionId: string }) => {
        if (selectedChat?.sessionId === data.sessionId) {
          setIsTyping(data.isTyping);
        }
      }
    );

    // Handle message received confirmation
    socket.on("chat:message:received", (data: any) => {
      if (data.error) {
        handleError(data, "Sending message");
      }
    });

    socket.on(
      "chat:stream:start",
      (data: { messageId: string; sessionId: string }) => {
        console.log("🔄 Stream started:", data);
        setIsTyping(true);
      }
    );

    socket.on(
      "chat:stream:chunk",
      (data: { chunk: string; sessionId: string }) => {
        if (!selectedChat || selectedChat.sessionId !== data.sessionId) return;

        setChatList((prevList) =>
          prevList.map((chat) => {
            if (chat.sessionId === data.sessionId) {
              const messages = [...chat.messages];
              const lastMsg = messages[messages.length - 1];

              if (lastMsg && lastMsg.sender === "bot" && !lastMsg.timestamp) {
                lastMsg.text += data.chunk;
              } else {
                messages.push({
                  sender: "bot",
                  text: data.chunk,
                });
              }

              const updatedChat = { ...chat, messages };
              setSelectedChat(updatedChat);
              return updatedChat;
            }
            return chat;
          })
        );
      }
    );

    // Handle stream end
    socket.on(
      "chat:stream:end",
      (data: {
        sessionId: string;
        fullResponse: string;
        sources?: any[];
        message: { role: string; content: string; timestamp: Date };
        error?: any;
      }) => {
        setIsTyping(false);

        if (data.error) {
          handleError(data.error, "Stream end");
          return;
        }

        setChatList((prevList) =>
          prevList.map((chat) => {
            if (chat.sessionId === data.sessionId) {
              const messages = [...chat.messages];
              const lastMsg = messages[messages.length - 1];

              if (lastMsg && lastMsg.sender === "bot") {
                lastMsg.text = data.fullResponse;
                lastMsg.timestamp = new Date(
                  data.message.timestamp
                ).toISOString();
              }

              const updatedChat = { ...chat, messages };
              setSelectedChat(updatedChat);
              return updatedChat;
            }
            return chat;
          })
        );
      }
    );

    // Handle stream errors
    socket.on(
      "chat:stream:error",
      (data: { error: string; sessionId: string; statusCode?: number }) => {
        setIsTyping(false);
        handleError(data, "Streaming");
      }
    );

    // Handle general errors
    socket.on("error", (data: { message: string; statusCode?: number }) => {
      setIsLoading(false);
      handleError(data, "Socket connection");
    });

    socket.on("connect_error", () => {
      setUserStatus("offline");
    });

    // Handle reconnection
    socket.on("reconnect", () => {
      setUserStatus("online");
      toast.success("Reconnected successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
    });

    return () => {
      socket.off("chat:sessions:response");
      socket.off("chat:history:response");
      socket.off("assistant:typing");
      socket.off("chat:message:received");
      socket.off("chat:stream:start");
      socket.off("chat:stream:chunk");
      socket.off("chat:stream:end");
      socket.off("chat:stream:error");
      socket.off("error");
      socket.off("connect_error");
      socket.off("reconnect");
    };
  }, [selectedChat, userID]);

  // Load messages for a specific chat
  const loadChatMessages = (sessionId: string) => {
    socket.emit("chat:history", {
      userId: userID,
      sessionId: sessionId,
    });

    // Set selected chat immediately
    const chat = chatList.find((c) => c.sessionId === sessionId);
    if (chat) {
      setSelectedChat(chat);
    }
  };

  const handleSendMessage = (): void => {
    if (!inputMessage.trim() || !userID) return;

    if (!selectedChat) {
      const sessionId = `conv_${Date.now()}`;
      const newChat: ChatHistory = {
        id: Date.now(),
        title: `AiProd #${chatList.length + 1}`,
        sessionId,
        messages: [],
        createdAt: new Date(),
      };

      setChatList([newChat, ...chatList]);
      setSelectedChat(newChat);

      setTimeout(() => {
        sendAIMessage(newChat.sessionId, inputMessage);
      }, 100);
    } else {
      sendAIMessage(selectedChat.sessionId, inputMessage);
    }

    const userMessage: Message = {
      sender: "user",
      text: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setChatList((prevList) =>
      prevList.map((chat) => {
        if (chat.id === selectedChat?.id) {
          const updatedChat = {
            ...chat,
            messages: [...chat.messages, userMessage],
          };
          setSelectedChat(updatedChat);
          return updatedChat;
        }
        return chat;
      })
    );

    setInputMessage("");
  };

  const sendAIMessage = (sessionId: string, message: string) => {
    try {
      socket.emit("chat:message", {
        userId: userID,
        sessionId,
        message,
      });
    } catch (error) {
      handleError(error, "Sending message");
    }
  };

  const toggleChat = () => {
    setOpen(!open);
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  const handleChatSelect = (chat: ChatHistory) => {
    loadChatMessages(chat.sessionId);
  };

  const handleNewConversation = () => {
    const sessionId = `conv_${Date.now()}`;
    const newChat: ChatHistory = {
      id: Date.now(),
      title: `AiProd #${chatList.length + 1}`,
      sessionId,
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

  return (
    <div className="smart-ai-chat-bot-global">
      <div className="chat-icon" onClick={toggleChat}>
        <SiChatbot />
      </div>

      {open && (
        <div className="chat-popup">
          <div className="chat-header">
            <div className="chat-header-left">
              <img src={adminImage.ChatAgentIcon} alt="Smart AI" />
              <span>AiProd Representative</span>
              <div className="admin-chatbot-user-status">
                <span className="admin-cht-bot-status-text">
                  {userStatus === "online" ? "Online" : "Offline"}
                </span>
                <span className={`status-dot ${userStatus}`}></span>
              </div>
            </div>
            <button onClick={toggleChat}>✕</button>
          </div>

          <div className="chat-body">
            {isLoading ? (
              <div className="loading-indicator">Loading chat history...</div>
            ) : !selectedChat ? (
              <div className="chat-list-container">
                {chatList.length === 0 ? (
                  <div className="widget-no-chats">
                    <h2>Hi there 👋🏼</h2>
                    <h2>How can we help you?</h2>
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
                          <img src={adminImage.ChatAgentIcon} alt="icon" />
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
                <div className="chat-back">
                  <button onClick={handleBack}>🔙</button>
                  <strong>{selectedChat.title}</strong>
                </div>

                <div className="chatbot-chat-messages">
                  {selectedChat.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`chat-message ${
                        msg.sender === "bot" ? "bot" : "user"
                      }`}
                    >
                      {msg.sender === "bot" && (
                        <img src={adminImage.ChatAgentIcon} alt="Bot" />
                      )}
                      <span>
                        {msg.text}
                        {msg.timestamp && (
                          <div className="chat-bot-message-time">
                            {new Date(msg.timestamp)
                              .toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                              .toLowerCase()}
                          </div>
                        )}
                      </span>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="chat-message bot">
                      <img src={adminImage.ChatAgentIcon} alt="Bot" />
                      <span className="typing-indicator">Typing...</span>
                    </div>
                  )}
                </div>
                <div className="live-chat-input-area">
                  <textarea
                    placeholder="Type here and press enter"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(
                      e: React.KeyboardEvent<HTMLTextAreaElement>
                    ) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        inputMessage.trim() !== ""
                      ) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={1}
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

          <div className="chat-footer">
            {!selectedChat && (
              <button onClick={handleNewConversation}>
                Start a New Conversation
              </button>
            )}
            <p>
              Powered By <a href="#">AiProd</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotWidget;
