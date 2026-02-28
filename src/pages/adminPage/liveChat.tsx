import React, { useState, useRef, useEffect } from "react";
import {
  IoSendSharp,
  IoMicOutline,
  IoAddOutline,
  IoEllipsisVertical,
} from "react-icons/io5";
import { BiLike, BiDislike, BiShare, BiCopy } from "react-icons/bi";
import { BsFillPinAngleFill, BsTrash } from "react-icons/bs";
import { LuAperture } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { FiFileText, FiChevronRight } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { io, Socket } from "socket.io-client";
import adminImage from "../../assets/image/admin/allImage";
import axiosInstance from "../../utils/baseUrl";
import { apiConfig } from "../../utils/apiConfig";
import { toast } from "react-toastify";
import { useUserStore } from "../../zustand/userDetailsStore";
import PageLoader from "../../common/loader";

const socket: Socket = io(apiConfig.webSocketUrl);

interface Message {
  id: string;
  sender: "user" | "bot";
  content: string;
  name: string;
  avatar: string;
  title?: string;
  isBot?: boolean;
}

interface TooltipProps {
  show: boolean;
  text: string;
  position: "top" | "right";
}

interface Template {
  _id: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  senderName: string;
  image: string;
  email: string;
  userID: string;
}

interface Message {
  sender: "user" | "bot";
  text: string;
  senderName?: string;
  userEmail?: string;
  timestamp?: string;
}

const LiveChat: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const userData = useUserStore((state) => state.userData);
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [userMessages, setUserMessages] = useState<Record<string, Message[]>>(
    {}
  );
  const [notificationMap, setNotificationMap] = useState<
    Record<string, number>
  >({});
  const [userList, setUserList] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [showSendTooltip, setShowSendTooltip] = useState<boolean>(false);
  const [showFileTooltip, setShowFileTooltip] = useState<boolean>(false);
  const [showVoiceTooltip, setShowVoiceTooltip] = useState<boolean>(false);
  const [showContextMenu, setShowContextMenu] = useState<boolean>(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [activePopupUserID, setActivePopupUserID] = useState(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const isMobileView = windowWidth <= 768;

      setIsMobile(isMobileView);

      if (isMobileView) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [userMessages, selectedTemplate]);

  const fetchUserDetails = async () => {
    try {
      const res = await axiosInstance.get("/liveChatAgentList");
      const chatAgents = res.data.data || [];

      const initialMsgs: Record<string, Message[]> = {};
      const list: any[] = [];

      chatAgents.forEach((agent: any) => {
        list.push(agent);

        const messages = Array.isArray(agent.messages) ? agent.messages : [];

        initialMsgs[agent.userID] = messages.map((msg: any) => ({
          id: msg._id,
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
          senderName: agent.senderName,
          userEmail: agent.email,
          image: agent.image,
        }));
      });

      setUserList(list);
      setUserMessages(initialMsgs);

      sessionStorage.setItem(
        "admin_user_messages",
        JSON.stringify(initialMsgs)
      );
      sessionStorage.setItem("admin_user_list", JSON.stringify(list));
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUsers = async (userId: string) => {
    try {
      if (
        !window.confirm(
          "Are you sure you want to delete this entire conversation?"
        )
      ) {
        return;
      }
      const res = await axiosInstance.delete(`/chat-agent/${userId}`);
      if (res.status === 200) {
        fetchUserDetails();
        toast.success("Delete data successfully");
      }
    } catch (error) {
      console.error("Failed to delete agent:", error);
      alert("Failed to delete chat. Please try again later.");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      if (!selectedTemplate || !messageId) return;
      if (!window.confirm("Are you sure you want to delete this message?")) {
        return;
      }
      const res = await axiosInstance.delete(
        `/chat-agent/message/${messageId}`
      );
      if (res.status === 200) {
        toast.success("Delete data successfully");
        setUserMessages((prev) => {
          const updated = { ...prev };
          if (selectedTemplate?.userID) {
            updated[selectedTemplate.userID] = updated[
              selectedTemplate.userID
            ].filter((msg) => msg.id !== messageId);
          }
          sessionStorage.setItem(
            "admin_user_messages",
            JSON.stringify(updated)
          );
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message. Please try again later.");
    }
  };

  const handleContextMenu = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    setShowContextMenu(true);
    setActiveMessageId(messageId);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleContextMenuTop = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowContextMenu(true);
    setActiveMessageId(null);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDeleteChat = () => {
    if (!selectedTemplate) {
      setShowContextMenu(false);
      return;
    }

    if (activeMessageId) {
      handleDeleteMessage(activeMessageId);
    } else {
    }
    setShowContextMenu(false);
  };

  useEffect(() => {
    fetchUserDetails();

    const cachedMessages = sessionStorage.getItem("admin_user_messages");
    const cachedUsers = sessionStorage.getItem("admin_user_list");

    if (cachedMessages && cachedUsers) {
      setUserMessages(JSON.parse(cachedMessages));
      setUserList(JSON.parse(cachedUsers));
    } else {
      fetchUserDetails();
    }
    fetchUserDetails();
  }, []);

  useEffect(() => {
    socket.emit("join-live-chat", "admin-room");
    socket.on("receive-chat-message", (data: any) => {
      setUserMessages((prev) => {
        const updated = {
          ...prev,
          [data.userID]: [
            ...(prev[data.userID] || []),
            {
              sender: data.sender,
              text: data.text,
              senderName: data.senderName,
              userEmail: data.email,
              timestamp: data.timestamp || new Date().toISOString(),
            },
          ],
        };
        fetchUserDetails();
        sessionStorage.setItem("admin_user_messages", JSON.stringify(updated));
        return updated;
      });

      if (selectedTemplate?.userID !== data.userID) {
        const updatedCount = (notificationMap[data.userID] || 0) + 1;

        setNotificationMap((prev) => ({
          ...prev,
          [data.userID]: updatedCount,
        }));

        localStorage.setItem(
          `chat_notify_${data.userID}`,
          String(updatedCount)
        );
      }

      setUserList((prev) => {
        const userExists = prev.find((u) => u.userID === data.userID);

        let updatedList;

        if (userExists) {
          updatedList = [
            { ...userExists },
            ...prev.filter((u) => u.userID !== data.userID),
          ];
        } else {
          updatedList = [
            {
              userID: data.userID,
              senderName: data.senderName,
              email: data.email,
            },
            ...prev,
          ];
        }

        sessionStorage.setItem("admin_user_list", JSON.stringify(updatedList));
        return updatedList;
      });
    });

    return () => {
      socket.off("receive-chat-message");
    };
  }, [selectedTemplate, userList, notificationMap]);

  useEffect(() => {
    const storedMessages = sessionStorage.getItem("admin_user_messages");
    if (storedMessages) {
      setUserMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    const storedNotifications: Record<string, number> = {};

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("chat_notify_")) {
        const userID = key.replace("chat_notify_", "");
        const count = parseInt(localStorage.getItem(key) || "0", 10);
        if (count > 0) {
          storedNotifications[userID] = count;
        }
      }
    });

    setNotificationMap(storedNotifications);
  }, []);

  const handleTemplateSelect = (userID: string) => {
    const user = userList.find((u) => u.userID === userID);
    if (!user) return;
    setSelectedTemplate({
      ...user,
    });

    localStorage.removeItem(`chat_notify_${userID}`);
    setNotificationMap((prev) => ({
      ...prev,
      [userID]: 0,
    }));

    if (isMobile) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [userMessages, selectedTemplate]);

  const handleSendMessage = () => {
    if (!selectedTemplate || !currentMessage.trim()) return;
    const currentTimestamp = new Date().toISOString();
    const message: Message = {
      sender: "bot",
      text: currentMessage,
      timestamp: currentTimestamp,
      senderName: "Admin",
      userEmail: "admin@example.com",
      id: "",
      content: "",
      name: "",
      avatar: "",
    };

    setUserMessages((prev) => {
      const updated = {
        ...prev,
        [selectedTemplate.userID]: [
          ...(prev[selectedTemplate.userID] || []),
          message,
        ],
      };
      sessionStorage.setItem("admin_user_messages", JSON.stringify(updated));
      return updated;
    });

    setShowSendTooltip(false);
    socket.emit("admin-reply", {
      text: currentMessage,
      userID: selectedTemplate.userID,
      timestamp: currentTimestamp,
      senderName: "Admin",
    });

    setCurrentMessage("");
  };

  const filteredUserList = userList.filter((user) => {
    const searchLower = searchKeyWord.toLowerCase();
    const nameMatch = user.senderName?.toLowerCase().includes(searchLower);
    const emailMatch = user.email?.toLowerCase().includes(searchLower);
    return nameMatch || emailMatch;
  });

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

  const handleCopy = () => {
    setShowContextMenu(false);
  };

  const handlePinChat = () => {
    setShowContextMenu(false);
  };

  const handleRename = () => {
    setShowContextMenu(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const Tooltip = ({ show, text }: TooltipProps) => {
    if (!show) return null;

    return (
      <div className={`userCodegeneratechat-tooltip ${show ? "show" : ""}`}>
        {text}
      </div>
    );
  };

  const handleDeleteUser = (id: any) => {
    handleDeleteUsers(id);
    setActivePopupUserID(null);
  };

  return (
    <div className="main-content-commo">
      <div className="container chat-code-generate-wrapper-page">
        <div className="chat-code-generate-wrapper">
          <PageLoader isLoading={isLoading} />
          <div className="chat-code-generate-container">
            <div className="chat-code-generate-header">
              <div className="chat-code-generate-header-left">
                <div className="admin-live-chat-page-header">
                  <div className="admin-dashboard-user-template-icon">
                    <span>
                      {selectedTemplate && (
                        <img
                          src={`${apiConfig.imageUrl}${selectedTemplate.image}`}
                          alt="User"
                        />
                      )}
                    </span>
                  </div>
                  <div>
                    <h4>{selectedTemplate?.senderName}</h4>
                    <h4>{selectedTemplate?.email}</h4>
                  </div>
                </div>
              </div>
              <div className="">
                <button
                  className="action-button"
                  onClick={(e) => handleContextMenuTop(e)}
                >
                  <IoEllipsisVertical />
                </button>
              </div>
            </div>

            <div className="admin-live-chat-page-body">
              {!selectedTemplate ? (
                <div className="live-chat-intro-section">
                  <img src={adminImage.logo} alt="Logo" />
                  <h1>Live Support</h1>
                  <h1>Chat With Users</h1>
                  <p>Duis aute irure dolor in reprehenderit in voluptate...</p>
                </div>
              ) : (
                <div className="template-info-box">
                  <div className="chat-code-generate-messages">
                    {userMessages[selectedTemplate.userID]?.map((message) => (
                      <div
                        key={message.id}
                        className={`message-container ${message.sender}`}
                        onContextMenu={(e) => handleContextMenu(e, message.id)}
                      >
                        <div className="avatar">
                          {message.sender === "bot" ? (
                            <div>
                              <img
                                src={`${apiConfig.imageUrl}${userData?.image}`}
                                alt="User Icon"
                              />
                            </div>
                          ) : (
                            <img
                              src={`${apiConfig.imageUrl}${selectedTemplate.image}`}
                              alt="User"
                            />
                          )}
                        </div>

                        <div className="message-content">
                          <div className="message-header">
                            <span className="sender-name">{message.name}</span>
                            {message.isBot && (
                              <span className="bot-badge">Bot</span>
                            )}
                          </div>

                          {message.title && message.sender === "bot" && (
                            <div className="message-title">{message.title}</div>
                          )}

                          <div className="message-text">{message.text}</div>
                          {message.timestamp && (
                            <div className="admin-chatbot-time">
                              {new Date(message.timestamp).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </div>
                          )}

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
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}
            </div>

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
                  <BsTrash />{" "}
                  {activeMessageId ? "Delete Message" : "Delete Conversation"}
                </div>
              </div>
            )}

            <div className="chat-code-generate-input-footer">
              <div className="input-wrapper">
                <LuAperture className="left-input-icon-chat-code-chatbot" />

                <textarea
                  className="chat-code-generate-input-footer-insert-text"
                  placeholder="Send a message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={1}
                />

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
                    <button className="input-icon-button">
                      <IoMicOutline
                        className="input-icon"
                        onMouseEnter={() => setShowVoiceTooltip(true)}
                        onMouseLeave={() => setShowVoiceTooltip(false)}
                      />
                    </button>
                    <Tooltip
                      show={showVoiceTooltip}
                      text="Voice Search"
                      position="top"
                    />
                  </div>

                  <div className="input-button-wrapper">
                    <button
                      className="send-button"
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim()}
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
            </div>
          </div>
        </div>

        <div className={`collapsible-sidebar ${!isOpen ? "closed" : ""}`}>
          <div className="right-chat-code-section">
            <div className="admin-live-chat-page-right-section">
              <div className="search-input-container-code-chatbot">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search here"
                  value={searchKeyWord}
                  onChange={(e) => setSearchKeyWord(e.target.value)}
                />
              </div>
              {filteredUserList.map((user, index) => (
                <div
                  key={index}
                  className={`admin-dashboard-agent-template-item ${
                    selectedTemplate?.userID === user.userID ? "active" : ""
                  }`}
                  onClick={() => handleTemplateSelect(user.userID)}
                  style={{ position: "relative" }}
                >
                  <div className="admin-dashboard-user-template-icon">
                    <img
                      src={`${apiConfig.imageUrl}${user.image}`}
                      alt="User"
                    />
                  </div>
                  <div className="template-info">
                    <div className="template-name">
                      {user.senderName || user.userID}
                    </div>
                    <div className="template-name">{user.id}</div>
                    <div className="template-role">{user.email || "User"}</div>
                  </div>
                  <div
                    className="live-chat-right-site-delete-popup"
                    style={{ position: "relative" }}
                  >
                    <button
                      className="action-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePopupUserID(
                          activePopupUserID === user.userID ? null : user.userID
                        );
                      }}
                    >
                      <IoEllipsisVertical size={20} />
                    </button>

                    {activePopupUserID === user.userID && (
                      <div className="delete-popup-card">
                        <div
                          className="popup-option"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <MdDelete
                            size={16}
                            color="red"
                            style={{ marginRight: "6px" }}
                          />
                          <span>Delete Agent</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {notificationMap[user.userID] > 0 &&
                    selectedTemplate?.userID !== user.userID && (
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: "red",
                          color: "white",
                          borderRadius: "50%",
                          width: "18px",
                          height: "18px",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {notificationMap[user.userID]}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        className="sidebar-toggle-button"
        onClick={toggleSidebar}
        style={{ right: isOpen ? "320px" : "0px" }}
      >
        <FiChevronRight
          size={18}
          style={{
            transform: isOpen ? "rotate(0deg)" : "rotate(180deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </button>
    </div>
  );
};

export default LiveChat;
