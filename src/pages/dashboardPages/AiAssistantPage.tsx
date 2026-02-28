import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CommonTrailBar from "../../common/CommonTrailBar";
import ShortLink from "../../common/ShortLinkDashboard";
import { FaSearch } from "react-icons/fa";
import axiosInstance from "../../utils/baseUrl";
import { FaRegHeart } from "react-icons/fa6";
import PageLoader from "../../common/loader";

interface AssistantData {
  _id?: string;
  assistantName: string;
  title: string;
  category: string;
  assistantIcon: string;
  brandIcon: string;
  packageType: string;
}

const AiAssistantPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("All");
  const [assistantData, setAssistantData] = useState<AssistantData[]>([]);
 
  const openCity = (tab: string) => {
    setActiveTab(tab);
  };
  const colors = ["#1a9db1", "#e74c3c", "#2ecc71", "#f1c40f", "#9b59b6"];

  useEffect(() => {
    const fetchAssistantData = async () => {
      const cachedData = sessionStorage.getItem("assistantData");
      if (cachedData) {
        setAssistantData(JSON.parse(cachedData));
      } else {
        try {
          const res = await axiosInstance.get("/getAllAssistantUser");
          const data: AssistantData[] = res.data.data || [];
          setAssistantData(data);
          sessionStorage.setItem("assistantData", JSON.stringify(data));
        } catch (error) {
          console.error("Failed to fetch assistant data:", error);
        }
      }
    };
    fetchAssistantData();
    setIsLoading(false);
  }, []);

  const filteredData =
    activeTab === "All"
      ? assistantData
      : assistantData.filter((item) => item.category === activeTab);

  const tabList = [
    "All",
    "Instructor",
    "Specialist",
    "Education",
    "Business",
    "Health",
    "Other",
  ];

  return (
    <>
      <div className="main-content-common">
        <CommonTrailBar />

        <div className="global-link-limit-section">
          <div className="short-link-text">
            <ShortLink />
          </div>
          <div>
            <div className="admin-dashboard-search-field-smart-ai">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Search by email or name" />
              </div>
            </div>
          </div>
        </div>

        <div className="tab-ai-agent">
          <PageLoader isLoading={isLoading} />
          <div className="row tab-container">
            {tabList.map((tab, index) => (
              <div
                key={index}
                className="col-xxl-1 col-xl-1 col-lg-2 col-md-2 col-sm-4"
              >
                <button
                  className={`tablinks ${activeTab === tab ? "active" : ""}`}
                  onClick={() => openCity(tab)}
                >
                  {tab}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div id={activeTab} className={`tabcontent show`}>
          <div className="row">
            {filteredData.map((agent, index) => (
              <div
                className="col-sm-12 col-md-6 col-lg-6 col-xl-4 col-xxl-3"
                key={agent._id || index}
              >
                <div
                  className="dashboard-ai-agent-card"
                  onClick={() => navigate("/chatassistant")}
                >
                  <div className="dashboard-ai-agent-card-package-title">
                    <span>{agent.packageType}</span>
                  </div>

                  <div
                    className="dashboard-ai-agent-card-icon"
                    style={{ color: colors[index % 5] }}
                    dangerouslySetInnerHTML={{ __html: agent.assistantIcon }}
                  />
                  <div className="dashboard-ai-agent-card-body">
                    <h5 className="dashboard-ai-agent-title">
                      {agent.assistantName}
                    </h5>
                    <p className="dashboard-ai-agent-text">{agent.title}</p>

                    <div className="dashboard-ai-agent-information">
                      <FaRegHeart />
                      <p>2344</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AiAssistantPage;
