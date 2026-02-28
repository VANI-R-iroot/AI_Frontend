import React, { useState, useEffect } from "react";
import adminImage from "../../assets/image/admin/allImage";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { IoArrowDownSharp } from "react-icons/io5";
import {
  text_audio_voice,
  voicesModel,
  Post_language,
} from "../../DataList/dropdownlist";
import DeleteConfirmModel from "../../common/DeleteConfirmModal";
import PayChatData from "../../components/userDashboard/dashboardMain/payData";
import ShortLink from "../../common/ShortLinkDashboard";
import CommonTrailBar from "../../common/CommonTrailBar";
import { useUserStore } from "../../zustand/userDetailsStore";
import { limitStore } from "../../zustand/limitStore";
import { packageStore } from "../../zustand/packageStore";
import axiosInstance from "../../utils/baseUrl";
import { toast } from "react-toastify";
import { apiConfig } from "../../utils/apiConfig";
import { AiFillDelete } from "react-icons/ai";
import { format } from "date-fns";
interface AudioData {
  _id: string;
  text: string;
  audio: string;
  email: string;
  model: string;
  voice: string;
  language: string;
  createDate: string;
}

const CreateAudioPage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    string | null
  >(null);
  const userData = useUserStore((state) => state.userData);
  const { packageLimitData } = packageStore();
  const { limitData } = limitStore();
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [activeTab, setActiveTab] = useState("Files");
  const [isLoading, setIsLoading] = useState(false);

  const [textToAudioData, setTextToAudioData] = useState<AudioData[]>([]);

  const fetchAudioData = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get("/audio-table-data");
      const data = res.data.data.AudioData;

      setTextToAudioData(data);
    } catch (error) {
      console.error("Fetching audio data failed:", error);
      toast.error("Failed to load audio files.");
      setTextToAudioData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudioData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedModel || !selectedVoice || !selectedLanguage || !prompt) {
      toast.error("All fields are required!");
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        selectedModel,
        selectedVoice,
        selectedLanguage,
        prompt,
      };
      const res = await axiosInstance.post("/text-to-audio", payload);

      if (res.status === 200) {
        toast.success("Audio generated successfully!");

        await fetchAudioData();

        setPrompt("");
        setSelectedModel("");
        setSelectedVoice("");
        setSelectedLanguage("");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error?.response?.data?.message || "Failed to generate audio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAudio = (id: string) => {
    setSelectedAnnouncementId(id);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedAnnouncementId(null);
  };

  const confirmDelete = async () => {
    if (!selectedAnnouncementId) return;

    try {
      const res = await axiosInstance.delete(
        `/delete-audio/${selectedAnnouncementId}`
      );
      if (res.status === 200) {
        await fetchAudioData();
      }
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedAnnouncementId(null);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const columns: GridColDef[] = [
    { field: "text", headerName: "Text", width: 250 },
    { field: "model", headerName: "Model", width: 100 },
    { field: "voice", headerName: "Voice", width: 80 },
    { field: "language", headerName: "language", width: 80 },

    {
      field: "createDate",
      headerName: "Create Date",
      width: 100,
      renderCell: (params) => {
        if (!params.value) return <span>-</span>;
        const formattedDate = format(new Date(params.value), "MM/dd/yy");
        return <span>{formattedDate}</span>;
      },
    },

    {
      field: "audio",
      headerName: "Audio",
      width: 180,
      renderCell: (params) => (
        <audio
          controls
          src={`${apiConfig.imageUrl}/${params.value}`}
          style={{ width: "100%", height: "40px", paddingTop: "10px" }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const audioUrl = `${apiConfig.imageUrl}/${params.row.audio}`;
        const fileName = `audio-${params.row._id}.mp3`;

        return (
          <div
            className="table-acton-button"
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              width: "100%",
              paddingTop: "10px",
            }}
          >
            <IoArrowDownSharp
              size={20}
              style={{ cursor: "pointer" }}
              title="Download"
              onClick={() => handleDownload(audioUrl, fileName)}
            />

            <AiFillDelete
              size={20}
              color="red"
              title="Delete"
              style={{ cursor: "pointer" }}
              onClick={() => handleDeleteAudio(params.row._id)}
            />
          </div>
        );
      },
    },
  ];

  const isEmpty = (value: any) => {
    return (
      value === null ||
      value === undefined ||
      (typeof value === "object" && Object.keys(value).length === 0)
    );
  };

  const stats = {
    totalLimit: packageLimitData?.aiVoiceoverLimit || 0,
    availableLimit: isEmpty(limitData?.aiVoiceoverLimit)
      ? userData?.apiUseAiVoiceoverLimit || 0
      : limitData?.apiUseAiVoiceoverLimit || 0,
  };

  return (
    <>
      <div className="main-content-common">
        <CommonTrailBar />
        <div className="container-flute">
          <div className="global-link-limit-section">
            <div className="short-link-text">
              <ShortLink />
            </div>
            <div>
              <PayChatData stats={stats} />
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12 col-md-4 col-lg-4 col-xl-4">
              <div className="left-panel-image">
                <div className="content-wrapper-image-generate">
                  <div className="smart-ai-prompt-are">
                    <label>Prompt</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter your text to convert to audio..."
                      disabled={isLoading}
                    />
                  </div>
                  <div className="text-to-image-item">
                    <label>AI Model</label>
                    <div className="select-item-data">
                      <div>
                        <img src={adminImage.TextImageIcon02} alt="smart ai" />
                      </div>
                      <select
                        className="form-select"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="">Select Model</option>
                        {voicesModel.map((voice, i) => (
                          <option key={i} value={voice.value}>
                            {voice.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="text-to-image-item">
                    <label>AI Voice</label>
                    <div className="select-item-data">
                      <div>
                        <img src={adminImage.VoiceIcon} alt="smart ai" />
                      </div>
                      <select
                        className="form-select"
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="">Select Voice</option>
                        {text_audio_voice.map((voice, i) => (
                          <option key={i} value={voice.value}>
                            {voice.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="text-to-image-item">
                    <label>Language</label>
                    <div className="select-item-data">
                      <div>
                        <img src={adminImage.TextImageIcon03} alt="smart ai" />
                      </div>
                      <select
                        className="form-select"
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="">Select Language</option>
                        {Post_language.map((language, i) => (
                          <option key={i} value={language.value}>
                            {language.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="input-container mt-4">
                    <button
                      className="generate-btn btn-image"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      <span className="btn-icon">✨</span>
                      {isLoading ? "Generating..." : "Generate"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-12 col-md-8 col-lg-8 col-xl-8">
              <div className="right-panel">
                <div className="tabs-global generate-file-header">
                  <div className="tabs-button-section">
                    <div
                      className={`tab-chatbot ${
                        activeTab === "Files" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("Files")}
                    >
                      Generated Audio Files
                    </div>
                  </div>

                  <div className="button-group-download">
                    <button className="btn download">
                      <img src={adminImage.PdfLogo} alt="Download" />
                    </button>
                    <button className="btn copy">
                      <img src={adminImage.CopyIcon} alt="Copy" />
                    </button>
                  </div>
                </div>

                {activeTab === "Result" ? (
                  <div className="templates-list"></div>
                ) : (
                  <div className="files-list">
                    {isLoading ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "#E2E8F0",
                        }}
                      >
                        Loading audio files...
                      </div>
                    ) : (
                      <DataGrid
                        rows={textToAudioData}
                        columns={columns}
                        getRowId={(row) => row.id}

                        initialState={{
                          pagination: {
                            paginationModel: {
                              pageSize: 10,
                            },
                          },
                        }}
                        pageSizeOptions={[10]}
                        checkboxSelection
                        disableRowSelectionOnClick
                        sx={{
                          backgroundColor: "#343e5733",
                          color: "#E2E8F0",
                          border: "none",
                          "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: "#1e293b !important",
                            color: "#E2E8F0",
                            borderBottom: "1px solid rgba(8, 9, 10, 0.2)",
                          },
                          "& .MuiDataGrid-columnHeader": {
                            backgroundColor: "#1e293b !important",
                          },
                          "& .MuiDataGrid-filler": {
                            backgroundColor: "#1e293b !important",
                          },
                          "& .MuiDataGrid-scrollbar--horizontal": {
                            backgroundColor: "#1e293b !important",
                          },
                          "& .MuiDataGrid-columnHeadersInner": {
                            backgroundColor: "#1e293b !important",
                          },
                          "& .MuiDataGrid-columnHeaderTitle": {
                            fontWeight: "bold",
                            color: "#E2E8F0",
                          },
                          "& .MuiDataGrid-row": {
                            backgroundColor: "rgba(52, 62, 87, 0)",
                            "&:hover": {
                              backgroundColor:
                                "rgba(52, 62, 87, 0.5) !important",
                            },
                          },
                          "& .MuiDataGrid-row:hover": {
                            backgroundColor: "rgba(52, 62, 87, 0.5) !important",
                          },
                          "& .MuiDataGrid-row.Mui-hovered": {
                            backgroundColor: "rgba(52, 62, 87, 0.5) !important",
                          },

                          // ✅ Row select korle background color control করার জন্য এই lines add করুন
                          "& .MuiDataGrid-row.Mui-selected": {
                            backgroundColor: "rgba(52, 62, 87, 0.5) !important", // Selected row এর background
                            "&:hover": {
                              backgroundColor:
                                "rgba(52, 62, 87, 0.7) !important", // Selected + hover
                            },
                          },
                          "& .MuiDataGrid-row.Mui-selected.Mui-hovered": {
                            backgroundColor: "rgba(52, 62, 87, 0.7) !important",
                          },

                          "& .MuiDataGrid-cell": {
                            color: "#E2E8F0",
                            borderColor: "rgba(71, 85, 105, 0.33)",
                          },
                          "& .MuiDataGrid-cell:focus": {
                            outline: "none",
                          },

                          // ✅ Selected cell এর focus outline remove করার জন্য
                          "& .MuiDataGrid-cell.Mui-selected": {
                            backgroundColor: "transparent !important",
                          },
                          "& .MuiDataGrid-cell--withRenderer.Mui-selected": {
                            backgroundColor: "transparent !important",
                          },

                          "& .MuiDataGrid-footerContainer": {
                            backgroundColor: "rgba(52, 62, 87, 0)",
                            color: "#E2E8F0",
                            borderTop: "1px solid rgba(71, 85, 105, 0.33)",
                          },
                          "& .MuiTablePagination-root, & .MuiSelect-select, & .MuiTablePagination-actions button":
                            {
                              color: "#E2E8F0",
                            },
                          "& .MuiCheckbox-root svg": {
                            fill: "#E2E8F0",
                          },
                          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
                            width: "8px",
                          },
                          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb":
                            {
                              backgroundColor: "#343E5733",
                              borderRadius: "4px",
                            },
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <DeleteConfirmModel
          isOpen={showDeleteModal}
          title="Delete Audio file?"
          message="Are you sure you want to Delete this audio file permanently? This action cannot be undone."
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          confirmText="Yes, Delete"
          cancelText="Cancel"
        />
      </div>
    </>
  );
};

export default CreateAudioPage;
