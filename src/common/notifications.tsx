import React, { useState, useEffect, useRef } from "react";
import adminImage from "../assets/image/admin/allImage";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { apiConfig } from "../utils/apiConfig.tsx";
const socket = io(apiConfig.webSocketUrl, {
  transports: ["websocket"],
  withCredentials: true,
});

interface NotificationItem {
  id: number;
  userID: string;
  name: string;
  email: string;
  messageCount: number;
  lastMessage: string;
  time: string;
}

interface AppHeaderProps {
  toggleSidebar: () => void;
  isVisible: boolean;
}

const Notifications: React.FC<AppHeaderProps> = () => {
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationList, setNotificationList] = useState<NotificationItem[]>(
    []
  );

  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    socket.emit("join-live-chat", "admin-room");
    socket.on("receive-chat-message", (data: any) => {
      console.log(data);
      setNotificationList((prevList) => {
        const existing = prevList.find((item) => item.userID === data.userID);
        if (existing) {
          return prevList.map((item) =>
            item.userID === data.userID
              ? {
                  ...item,
                  messageCount: item.messageCount + 1,
                  lastMessage: data.text,
                  time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }),
                }
              : item
          );
        } else {
          const newNotification: NotificationItem = {
            id: Date.now(),
            userID: data.userID,
            name: data.senderName || "Unknown",
            email: data.email || "No email",
            messageCount: 1,
            lastMessage: data.text,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          };
          return [newNotification, ...prevList];
        }
      });
    });

    return () => {
      socket.off("receive-chat-message");
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setNotificationOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setNotificationOpen(false);
    }, 100);
  };

  const handleNotificationClick = () => {
    navigate("/admin-live-chat");
  };

  return (
    <>
      <div className="admin-header-notification">
        <div
          className="notification-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div>
            <img
              src={adminImage.notificationIcon}
              alt="notification"
              className="notification-icon"
            />

            {notificationList.reduce(
              (acc, curr) => acc + curr.messageCount,
              0
            ) > 0 && <div className="notification-badge-top"></div>}
          </div>

          {notificationOpen && (
            <div
              className="notification-popup"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="notification-header">
                <h3>Notifications</h3>
                <a href="#" className="see-all">
                  See all
                </a>
              </div>
              <div className="notification-body">
                {notificationList.map((notification) => (
                  <div className="notification-item" key={notification.id}>
                    <div className="notification-icon-wrapper">
                      <div className="notification-bell-icon">
                        <img
                          src={adminImage.notificationIcon}
                          alt="notification"
                        />
                        <div className="notification-badge">
                          {notificationList.reduce(
                            (acc, curr) => acc + curr.messageCount,
                            0
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className="notification-content"
                      onClick={handleNotificationClick}
                    >
                      <div className="notification-content-title">
                        <h4>{notification.name}</h4>
                        <h5>{notification.time}</h5>
                      </div>
                      <p>{notification.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;
