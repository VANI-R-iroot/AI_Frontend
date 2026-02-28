import React, { useEffect, useRef, useState } from "react";
import adminImage from "../assets/image/admin/allImage";
import axiosInstance from "../utils/baseUrl";

interface AnnouncementItem {
  _id: string;
  AnnouncementTitle: string;
  AnnouncementType: string;
  createdAt: string;
}

const AnnouncementBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      try {
        const res = await axiosInstance.get("/active-announcement", {
          params: { location: "bell" },
        });
        if (!isMounted) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setAnnouncements(list.slice(0, 5));
      } catch {
        if (!isMounted) return;
        setAnnouncements([]);
      }
    };

    fetchAnnouncements();
    const intervalId = setInterval(fetchAnnouncements, 10000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 100);
  };

  if (announcements.length === 0) return null;

  return (
    <div className="admin-header-notification announcement-bell">
      <div
        className="notification-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div>
          <img
            src={adminImage.notificationIcon}
            alt="announcement"
            className="notification-icon"
          />
          <div className="notification-badge-top"></div>
        </div>

        {open && (
          <div
            className="notification-popup"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="notification-header">
              <h3>Announcements</h3>
              <span className="see-all">New</span>
            </div>
            <div className="notification-body">
              {announcements.map((item) => (
                <div className="notification-item" key={item._id}>
                  <div className="notification-icon-wrapper">
                    <div className="notification-bell-icon">
                      <img
                        src={adminImage.notificationIcon}
                        alt="announcement"
                      />
                    </div>
                  </div>
                  <div className="notification-content">
                    <div className="notification-content-title">
                      <h4>{item.AnnouncementType}</h4>
                      <h5>
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                        })}
                      </h5>
                    </div>
                    <p>{item.AnnouncementTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBell;
