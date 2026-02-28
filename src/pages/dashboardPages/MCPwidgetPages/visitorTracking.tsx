import { useState, useEffect } from "react";
import ShortLink from "../../../common/ShortLinkDashboard";
import axiosInstance from "../../../utils/baseUrl";
import { FaSearch } from "react-icons/fa";
import VisitorTrackingChard from "../../../components/userDashboard/visitorTracking/visitorTrackingChard";
import VisitorMostAsked from "../../../components/userDashboard/visitorTracking/visitorMostQuestionAsked";
import { usePluginStore } from "../../../zustand/pluginStore";
import { useUserStore } from "../../../zustand/userDetailsStore";
import { fetchPluginList } from "../../../utils/fetchPluginList";

type Blog = {
  _id: string;
  city: string;
  country: string;
  countryCode: string;
  language: string;
  currentUrl: string;
  createdAt: string;
  domain?: string;
  region?: string;
  timezone?: string;
  referrer?: string;
  visitorIP?: string;
  platform?: string;
};

interface UserData {
  email: string;
  name: string;
  _id: string;
}

const visitorTracking = () => {
  const domainNames = usePluginStore((state) => state.domainNames);
  const userData = useUserStore((state) => state.userData || {}) as UserData;
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [trackingData, setTrackingData] = useState<Blog[]>([]);
  const [trackingStatus, setTrackingStatus] = useState<{
    totalVisitors: number;
    visitsByDate: Record<string, number>;
    countryPercentage: Record<string, string>;
  } | null>(null);

  const fetchTrackingData = async () => {
    const email = userData?.email;
    if (!email) {
      return;
    }
    try {
      const res = await axiosInstance.get("/get-tracking-data", {
        params: { email },
      });
      const trackingStatus = res.data.data.stats;
      const tracking = res.data.data.users;
      setTrackingData(tracking);
      setTrackingStatus(trackingStatus);
      sessionStorage.setItem("UserTrackingData", JSON.stringify(tracking));
    } catch (error) {
      console.error("Fetch failed", error);
    }
  };

  useEffect(() => {
    if (domainNames && domainNames.length > 0) {
      fetchTrackingData();
    }
  }, [domainNames]);

  useEffect(() => {
    if (userData?.email) {
      fetchPluginList(userData.email);
    }
  }, [userData?.email]);

  useEffect(() => {
    const savedData = sessionStorage.getItem("UserTrackingData");
    if (savedData) {
      setTrackingData(JSON.parse(savedData));
    }
  }, []);

  return (
    <div className="main-content-common">
      <div className="container-flute">
        <div className="global-link-limit-section">
          <div className="short-link-text">
            <ShortLink />
          </div>
          <div className="admin-dashboard-search-field-smart-ai">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search country..."
                value={searchKeyWord}
                onChange={(e) => setSearchKeyWord(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="mb-5">
          {trackingStatus && (
            <VisitorTrackingChard
              trackingStatus={trackingStatus}
              trackingData={trackingData}
              searchKeyWord={searchKeyWord}
            />
          )}
        </div>
        <div className="pb-4">
          <VisitorMostAsked />
        </div>
      </div>
    </div>
  );
};

export default visitorTracking;
