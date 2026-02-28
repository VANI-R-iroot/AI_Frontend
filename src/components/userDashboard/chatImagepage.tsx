import React from "react";
import { IoEllipsisVertical } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";
import { BiLike, BiDislike, BiShare } from "react-icons/bi";
import { useUserStore } from "../../zustand/userDetailsStore";
import { apiConfig } from "../../utils/apiConfig";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  message: string;
  timestamp: string;
  _id?: string;
  avatar?: string;
  originalImage?: string;
}

interface MessageComponentProps {
  messages: ChatMessage[];
  onContextMenu: (e: React.MouseEvent, id?: string) => void;
  contextMenuOpenId: string | null;
}

const MessageComponent: React.FC<MessageComponentProps> = ({
  messages,
  onContextMenu,
}) => {
  const userData = useUserStore((state) => state.userData);

  return (
    <>
      {messages.map((message, index) => (
        <div
          key={message._id || index}
          className={`message-container ${message.sender}`}
          onContextMenu={(e) => onContextMenu(e, message._id)}
        >
          <div className="avatar">
            {message.sender === "bot" ? (
              <div className="bot-avatar">
                <div className="chat-assistant-sidebar-icon" />
              </div>
            ) : (
              <div>
                <img
                  src={`${apiConfig.imageUrl}${userData?.image}`}
                  alt="User Icon"
                />
              </div>
            )}
          </div>

          <div className="message-content">
            <div className="message-text">
              <p className="image-caption">
                {message.sender === "user" ? "You" : "AI"}
              </p>
              {message.sender === "bot" && (
                <div className="user-ui-ux-original-image-upload">
                  <div className="markdown-text">
                    <img src={`${apiConfig.imageUrl}/${message.message}`}></img>
                  </div>
                </div>
              )}

              {message.sender === "user" && message.message && (
                <div className="user-ui-ux-original-image-upload">
                  <p>{message.message}</p>
                </div>
              )}
            </div>

            {message.sender === "bot" && (
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
                  onClick={(e) => onContextMenu(e, message._id)}
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
      ))}
    </>
  );
};

export default MessageComponent;
