import React, { useState } from "react";
import { IoEllipsisVertical } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";
import { Highlight, PrismTheme, themes } from "prism-react-renderer";
import ReactMarkdown from "react-markdown";
import { BiLike, BiDislike, BiShare } from "react-icons/bi";
import { useUserStore } from "../../../zustand/userDetailsStore";
import { apiConfig } from "../../../utils/apiConfig";

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

const breakLongLines = (code: string, maxLength = 80) => {
  return code
    .split("\n")
    .map((line) => {
      if (line.length <= maxLength) {
        return line;
      }

      const leadingSpaces = line.match(/^\s*/)?.[0] || "";
      const trimmedLine = line.trim();

      if (trimmedLine.length <= maxLength - leadingSpaces.length) {
        return line;
      }

      const words = trimmedLine.split(" ");
      const lines = [];
      let currentLine = leadingSpaces;

      for (const word of words) {
        if (
          (currentLine + word).length > maxLength &&
          currentLine.trim().length > 0
        ) {
          lines.push(currentLine.trimEnd());
          currentLine = leadingSpaces + "  " + word + " ";
        } else {
          currentLine += word + " ";
        }
      }

      if (currentLine.trim().length > 0) {
        lines.push(currentLine.trimEnd());
      }

      return lines.join("\n");
    })
    .join("\n");
};

const codeMessage = (message: string) => {
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: { type: "code" | "text"; content: string; lang?: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(message)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: message.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: "code",
      content: breakLongLines(match[2]),
      lang: match[1] || "javascript",
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < message.length) {
    parts.push({ type: "text", content: message.slice(lastIndex) });
  }

  return parts;
};

const myCustomTheme: PrismTheme = {
  ...themes.vsDark,
  plain: {
    ...themes.vsDark.plain,
    color: "#e6db74",
    backgroundColor: "#000",
  },
  styles: themes.vsDark.styles.map((style) => {
    if (style.types.includes("keyword")) {
      return {
        ...style,
        style: {
          ...style.style,
          color: "#f92672",
          fontWeight: "700",
        },
      };
    }
    return style;
  }),
};

const CodeBlockWithCopy: React.FC<{ code: string; language: string }> = ({
  code,
  language,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          backgroundColor: copied ? "#4caf50" : "#333",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "4px 8px",
          cursor: "pointer",
          fontSize: "12px",
          zIndex: 10,
        }}
        aria-label="Copy code"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <Highlight code={code.trim()} language={language} theme={myCustomTheme}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={className}
            style={{
              ...style,
              padding: "16px",
              borderRadius: "8px",
              overflowX: "auto",
              marginTop: "8px",
              fontSize: "14px",
              position: "relative",
              wordWrap: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

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

              {codeMessage(message.message).map((part, idx) =>
                part.type === "code" ? (
                  <CodeBlockWithCopy
                    key={idx}
                    code={part.content}
                    language={part.lang || "javascript"}
                  />
                ) : (
                  <div className="markdown-text" key={idx}>
                    <ReactMarkdown>{part.content}</ReactMarkdown>
                  </div>
                )
              )}

              {message.sender === "user" && message.originalImage && (
                <div className="user-ui-ux-original-image-upload">
                  <img
                    src={`${apiConfig.imageUrl}/${message.originalImage}`}
                    alt="Uploaded"
                    className="original-image"
                  />
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
