
import React, { useEffect, useState, useRef } from "react";
import { BsFillMegaphoneFill } from "react-icons/bs";
import { FaWrench, FaRocket, FaInfoCircle } from "react-icons/fa";
import axiosInstance from "../../../utils/baseUrl";


interface Announcement {
  _id: string;
  AnnouncementTitle: string;
  AnnouncementType: string;
  createdAt: string;
  AnnouncementStatus: string;
}

const AnnouncementsPanel: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      try {
        const res = await axiosInstance.get("/active-announcement", {
          params: { location: "dashboard" },
        });
        if (!isMounted) return;
        const plugins = res.data;
        setAnnouncements(plugins);
      } catch (error) {
        if (!isMounted) return;
        console.error("Fetch failed", error);
      }
    };

    fetchAnnouncements();

    const intervalId = setInterval(() => {
      fetchAnnouncements();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Calculate and update vertical line height dynamically
  useEffect(() => {
    if (listRef.current && announcements?.length > 0) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        const items = listRef.current?.querySelectorAll('.user-dashboard-announcement-item');
        
        if (items && items.length > 0) {
          const firstItem = items[0] as HTMLElement;
          const lastItem = items[items.length - 1] as HTMLElement;
          
          const firstItemTop = firstItem.offsetTop;
          const lastItemBottom = lastItem.offsetTop + lastItem.offsetHeight;
          
          const lineHeight = lastItemBottom - firstItemTop;
          
          // Set CSS custom property for line height
          listRef.current?.style.setProperty('--line-height', `${lineHeight}px`);
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [announcements]);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "maintenance":
        return <FaWrench size={20} />;
      case "update":
        return <BsFillMegaphoneFill size={20} />;
      case "info":
        return <FaInfoCircle size={20} />;
      case "new":
        return <FaRocket size={20} />;
      default:
        return <BsFillMegaphoneFill size={20} />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <div className="user-dashboard-announcements-container">
      <h2 className="user-dashboard-announcements-title">Announcements</h2>
      <div 
        ref={listRef}
        className="user-dashboard-announcements-list"
        style={{ '--line-height': '0px' } as React.CSSProperties}
      >
        {announcements &&
          announcements.length > 0 &&
          announcements.map((item) => (
            <div key={item._id} className="user-dashboard-announcement-item">
              <div
                className={`user-dashboard-icon-container ${
                  item.AnnouncementType.toLowerCase() === "update"
                    ? "user-dashboard-feature-icon"
                    : item.AnnouncementType.toLowerCase() === "maintenance"
                    ? "user-dashboard-maintenance-icon"
                    : item.AnnouncementType.toLowerCase() === "info"
                    ? "user-dashboard-info-icon"
                    : item.AnnouncementType.toLowerCase() === "new"
                    ? "user-dashboard-new-icon"
                    : "user-dashboard-feature-icon"
                }`}
              >
                {getIcon(item.AnnouncementType)}
              </div>

              <div className="user-dashboard-announcement-content">
                <p className="user-dashboard-announcement-text">
                  {item.AnnouncementTitle}
                </p>
              </div>

              <div className="announcement-meta">
                <span className="user-dashboard-tag new-tag">
                  {item.AnnouncementType}
                </span>
                <span className="user-dashboard-announcement-date">
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AnnouncementsPanel;




// import React, { useEffect, useState } from "react";
// import { BsFillMegaphoneFill } from "react-icons/bs";
// import { FaWrench, FaRocket, FaInfoCircle } from "react-icons/fa";
// import axiosInstance from "../../../utils/baseUrl";

// interface Announcement {
//   _id: string;
//   AnnouncementTitle: string;
//   AnnouncementType: string;
//   createdAt: string;
//   AnnouncementStatus: string;
// }

// const AnnouncementsPanel: React.FC = () => {
//   const [announcements, setAnnouncements] = useState<Announcement[]>([]);

//   useEffect(() => {
//     const fetchAnnouncements = async () => {
//       try {
//         const res = await axiosInstance.get("/active-announcement");
//         const plugins = res.data;
//         setAnnouncements(plugins);
//       } catch (error) {
//         console.error("Fetch failed", error);
//       }
//     };

//     fetchAnnouncements();
//   }, []);

//   const getIcon = (type: string) => {
//     switch (type.toLowerCase()) {
//       case "maintenance":
//         return <FaWrench size={20} />;
//       case "Update":
//         return <BsFillMegaphoneFill size={20} />;
//       case "info":
//         return <FaInfoCircle size={20} />;
//       case "new":
//         return <FaRocket size={20} />;
//       default:
//         return <BsFillMegaphoneFill size={20} />;
//     }
//   };

//   const formatDate = (dateStr: string) => {
//     const date = new Date(dateStr);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "2-digit",
//     });
//   };

//   return (
//     <div className="user-dashboard-announcements-container">
//       <h2 className="user-dashboard-announcements-title">Announcements</h2>
//       <div className="user-dashboard-announcements-list">
//         {announcements &&
//           announcements.length > 0 &&
//           announcements.map((item) => (
//             <div key={item._id} className="user-dashboard-announcement-item">
//               <div
//                 className={`user-dashboard-icon-container ${
//                   item.AnnouncementType.toLowerCase() === "update"
//                     ? "user-dashboard-feature-icon"
//                     : item.AnnouncementType.toLowerCase() === "maintenance"
//                     ? "user-dashboard-maintenance-icon"
//                     : item.AnnouncementType.toLowerCase() === "info"
//                     ? "user-dashboard-info-icon"
//                     : item.AnnouncementType.toLowerCase() === "new"
//                     ? "user-dashboard-new-icon"
//                     : "user-dashboard-feature-icon"
//                 }`}
//               >
//                 {getIcon(item.AnnouncementType)}
//               </div>

//               <div className="user-dashboard-announcement-content">
//                 <p className="user-dashboard-announcement-text">
//                   {item.AnnouncementTitle}
//                 </p>
//               </div>

//               <div className="announcement-meta">
//                 <span className="user-dashboard-tag new-tag">
//                   {item.AnnouncementType}
//                 </span>
//                 <span className="user-dashboard-announcement-date">
//                   {formatDate(item.createdAt)}
//                 </span>
//               </div>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// };

// export default AnnouncementsPanel;
