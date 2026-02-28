import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/baseUrl";
import { BsFillMegaphoneFill } from "react-icons/bs";

interface BannerAnnouncement {
  _id: string;
  AnnouncementTitle: string;
  AnnouncementType: string;
  createdAt: string;
  AnnouncementPriority?: string;
}

const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<BannerAnnouncement | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;
    const fetchBanner = async () => {
      try {
        const res = await axiosInstance.get("/active-announcement", {
          params: { location: "banner" },
        });
        if (!isMounted) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setAnnouncement(list[0] || null);
      } catch {
        if (!isMounted) return;
        setAnnouncement(null);
      }
    };

    fetchBanner();
    const intervalId = setInterval(fetchBanner, 10000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (!announcement) return null;

  const isHigh =
    announcement.AnnouncementPriority &&
    announcement.AnnouncementPriority.toLowerCase() === "high";

  return (
    <div className={`announcement-banner ${isHigh ? "high" : "normal"}`}>
      <div className="announcement-banner-icon">
        <BsFillMegaphoneFill size={18} />
      </div>
      <div className="announcement-banner-text">
        <span className="announcement-banner-type">
          {announcement.AnnouncementType}
        </span>
        <span className="announcement-banner-title">
          {announcement.AnnouncementTitle}
        </span>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
