import React, { useState, useEffect } from "react";
import { useUserStore } from "../../../zustand/userDetailsStore";
import { FaRegUser } from "react-icons/fa";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import TrainPlugin from "../../../components/userDashboard/widgetSetup/TrainPlugin";
import axiosInstance from "../../../utils/baseUrl";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { apiConfig } from "../../../utils/apiConfig";
import { usePluginStore } from "../../../zustand/pluginStore";
import { fetchPluginList } from "../../../utils/fetchPluginList";
import PageLoader from "./../../../common/loader";

interface CardData {
  _id: string;
  icon: React.ReactNode;
  targetPlatform: string;
  chatbotName: string;
  domainName: string;
  downloadPlugin: number;
  users: number;
  likePlugin: number;
  downloadLink: string;
  iconData: string;
  likedBy?: string[];
  imageUrl: string;
  shortTitle: string;
}

const DownloadWidget: React.FC = () => {
  const filteredList = usePluginStore((state) => state.filteredList);
  const [isLoading, setIsLoading] = useState(true);
  const [pluginList, setPluginList] = useState<CardData[]>([]);
  const userData = useUserStore((state) => state.userData);
  const [showTrainPlugin, setShowTrainPlugin] = useState(false);
  const [selectedPluginData, setSelectedPluginData] = useState<CardData | null>(
    null
  );
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);
  const [cardsLoaded, setCardsLoaded] = useState(false);

  useEffect(() => {
    if (pluginList.length > 0) {
      setCardsLoaded(true);
    }
  }, [pluginList]);

  const fetchAgentList = async () => {
    try {
      const res = await axiosInstance.get("/all-plugins-user");
      const plugins = res.data.data;
      sessionStorage.setItem("pluginListUser", JSON.stringify(plugins));
      setPluginList(plugins);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentList();
  }, []);

  const handleLike = async (pluginId: string) => {
    if (!userData?._id) {
      console.error("User not authenticated");
      return;
    }

    try {
      const res = await axiosInstance.put(`/plugin-like/${pluginId}`, {
        userId: userData._id,
      });

      const updatedLikes = res.data.likes;
      const likedByUser = res.data.likedByUser;

      setPluginList((prev) =>
        prev.map((plugin) =>
          plugin._id === pluginId
            ? {
                ...plugin,
                likePlugin: updatedLikes,
                likedBy: likedByUser
                  ? [...(plugin.likedBy || []), userData._id]
                  : (plugin.likedBy || []).filter((id) => id !== userData._id),
              }
            : plugin
        )
      );
    } catch (err) {
      console.error("Like/unlike failed", err);
    }
  };

  const isPluginLikedByUser = (plugin: CardData): boolean => {
    return userData?._id
      ? (plugin.likedBy || []).includes(userData._id)
      : false;
  };

  const handleDownload = async (pluginId: string) => {
    setDownloadingIds((prev) => [...prev, pluginId]);

    try {
      const plugin = pluginList.find((p) => p._id === pluginId);

      if (!plugin) {
        throw new Error("Plugin not found");
      }

      const res = await axiosInstance.post(
        "/plugin-download",
        {
          userId: userData._id,
          pluginId: pluginId,
          targetPlatform: plugin.targetPlatform,
        },
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `plugin-${pluginId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      fetchAgentList();
      toast.success("Plugin downloaded successfully!");

      setSelectedPluginData(plugin);
      setShowTrainPlugin(true);
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Failed to download the plugin.");
    } finally {
      setDownloadingIds((prev) => prev.filter((id) => id !== pluginId));
    }
  };

  useEffect(() => {
    if (userData?.email) {
      fetchPluginList(userData.email);
    }
  }, [userData?.email]);

  return (
    <div className="main-content-common">
      <div className="user-dashboard-section-0">
        {showTrainPlugin ? (
          <TrainPlugin
            onBack={() => setShowTrainPlugin(false)}
            pluginData={selectedPluginData}
          />
        ) : (
          <div className="row">
            <PageLoader isLoading={isLoading} />
            <div className="user-dashboard-common-sub-title">
              <h2>Real Time AI Business Widget</h2>
            </div>
            {pluginList.map((card) => {
              const isLiked = isPluginLikedByUser(card);

              return (
                <div
                  key={card._id}
                  className={`col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-4 pt-4 ${
                    cardsLoaded ? "card-show" : "card-hide"
                  }`}
                >
                  <div className="user-dashboard-chatbot-Integration-card">
                    <div className="plugin-card-active-badge">
                      {filteredList.some(
                        (item) => item.targetPlatform === card.targetPlatform
                      ) && (
                        <div className="plugin-card-active-badge">
                          <span>Active</span>
                        </div>
                      )}
                    </div>

                    <div className="chatbot-Integration-card-inner">
                      <div className="chatbot-Integration-card-logo">
                        <img
                          src={`${apiConfig.imageUrl}/${card.imageUrl}`}
                          alt="icon"
                          style={{
                            width: 62,
                            height: 62,
                            objectFit: "contain",
                          }}
                        />
                      </div>

                      <div className="chatbot-Integration-card-content">
                        <h2>{card.chatbotName}</h2>
                        <p className="description">{card.shortTitle}</p>

                        <div className="card-stats">
                          <div className="stats-item">
                            <HiOutlineArrowDownTray />
                            {card.downloadPlugin}
                          </div>
                          <div className="stats-item">
                            <FaRegUser />
                            {card.downloadPlugin}
                          </div>

                          <div
                            className="stats-item"
                            onClick={() => handleLike(card._id)}
                            style={{ cursor: "pointer" }}
                          >
                            {isLiked ? <FaHeart color="red" /> : <FaRegHeart />}
                            {card.likePlugin}
                          </div>
                        </div>
                        <div className="plugin-btn-group">
                          <button
                            type="button"
                            className="plugin-download-btn"
                            onClick={() => handleDownload(card._id)}
                            disabled={downloadingIds.includes(card._id)}
                          >
                            {downloadingIds.includes(card._id) ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                &nbsp;Loading...
                              </>
                            ) : (
                              "Download"
                            )}
                          </button>
                          <button
                            type="button"
                            className="plugin-download-btn"
                            onClick={() => {
                              setSelectedPluginData(card);
                              setShowTrainPlugin(true);
                            }}
                          >
                            Setting
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadWidget;
