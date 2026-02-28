import React, { JSX, useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { format } from "date-fns";
import { AiFillDelete, AiOutlineEye, AiOutlineDownload } from "react-icons/ai";
import CommonTrailBar from "../../common/CommonTrailBar";
import axiosInstance from "../../utils/baseUrl";
import { FaFolderOpen } from "react-icons/fa6";
import { LuFileText } from "react-icons/lu";
import { LuImage } from "react-icons/lu";


interface Message {
  sender: string;
  message: string;
  timestamp: string;
  _id: string;
  originalImage?: string;
}

interface UnifiedDataItem {
  id: string;
  type: string;
  email: string;
  timestamp: string;
  content: string;
  imageStyle?: string;
  imageSize?: string;
  imageMode?: string;
  url?: string;
  model?: string;
  voice?: string;
  audio?: string;
  language?: string;
  originalImage?: string;
  generatedImg?: string;
  sender?: string;
  numberOfImages?: number;
  messagesCount?: number;
}

type DataType =
  | "articles"
  | "vision"
  | "textToImage"
  | "textToAudio"
  | "code"
  | "captionImage"
  | "imagination";

const MyFilePage: React.FC = () => {
  const [allData, setAllData] = useState<UnifiedDataItem[]>([]);
  const [filteredData, setFilteredData] = useState<UnifiedDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const getTypeIcon = (type: DataType): JSX.Element => {
    const icons: Record<DataType, JSX.Element> = {
      articles: <LuFileText />,
      vision: <span>👁️</span>,
      textToImage: <LuImage />,
      textToAudio: <span>🎵</span>,
      code: <span>💻</span>,
      captionImage: <span>📸</span>,
      imagination: <span>💭</span>,
    };
    return icons[type] || <FaFolderOpen />;
  };

  // Function to get color based on data type
  const getTypeColor = (type: DataType): string => {
    const colors: Record<DataType, string> = {
      articles: "#3B82F6",
      vision: "#10B981",
      textToImage: "#F59E0B",
      textToAudio: "#EF4444",
      code: "#8B5CF6",
      captionImage: "#06B6D4",
      imagination: "#F97316",
    };
    return colors[type] || "#6B7280";
  };

  // Function to get tag name based on data type
  const getTagName = (type: DataType): string => {
    const tagNames: Record<DataType, string> = {
      articles: "Article",
      vision: "Vision AI",
      textToImage: "Image Gen",
      textToAudio: "Audio Gen",
      code: "Code AI",
      captionImage: "Caption AI",
      imagination: "Imagination",
    };
    return tagNames[type] || "Unknown";
  };

  const flattenData = (apiData: any): UnifiedDataItem[] => {
    const flattenedData: UnifiedDataItem[] = [];

    const dataTypes: DataType[] = [
      "articles",
      "vision",
      "textToImage",
      "textToAudio",
      "code",
      "captionImage",
      "imagination",
    ];

    dataTypes.forEach((dataType) => {
      if (apiData[dataType] && Array.isArray(apiData[dataType])) {
        const items = apiData[dataType];

        items.forEach((item: any) => {
          const unifiedItem: UnifiedDataItem = {
            id: item._id,
            type: dataType,
            email: item.email || "N/A",
            timestamp: item.timestamp || item.createDate || "",

            content: getContentByType(item, dataType),

            ...getAdditionalFields(item, dataType),
          };

          flattenedData.push(unifiedItem);
        });
      }
    });

    return flattenedData;
  };

  const getContentByType = (item: any, dataType: DataType): string => {
    switch (dataType) {
      case "articles":
        return item.text?.substring(0, 100) + "..." || "No content";
      case "vision":
        return item.text?.substring(0, 100) + "..." || "No content";
      case "textToImage":
        return item.imagePrompt?.substring(0, 100) + "..." || "No prompt";
      case "textToAudio":
        return item.text?.substring(0, 100) + "..." || "No text";
      case "code":
        const botMessages =
          item.messages?.filter((msg: Message) => msg.sender === "bot") || [];
        if (botMessages.length > 0) {
          const latestBotMessage = botMessages[botMessages.length - 1];
          return (
            latestBotMessage.message?.substring(0, 100) + "..." ||
            "No bot message"
          );
        }
        return "No bot messages";
      case "captionImage":
        const botCaptionMessages =
          item.messages?.filter((msg: Message) => msg.sender === "bot") || [];
        if (botCaptionMessages.length > 0) {
          const latestBotCaptionMessage =
            botCaptionMessages[botCaptionMessages.length - 1];
          return (
            latestBotCaptionMessage.message?.substring(0, 100) + "..." ||
            "No bot message"
          );
        }
        return "No bot messages";
      case "imagination":
        return (
          item.instructionText?.substring(0, 100) + "..." || "No instruction"
        );
      default:
        return "N/A";
    }
  };


  const getAdditionalFields = (
    item: any,
    dataType: DataType
  ): Partial<UnifiedDataItem> => {
    switch (dataType) {
      case "textToImage":
        return {
          imageStyle: item.imageStyle,
          imageSize: item.imageSize,
          imageMode: item.imageMode,
          url: item.url,
          numberOfImages: item.numberOfImages,
        };
      case "textToAudio":
        return {
          model: item.model,
          voice: item.voice,
          audio: item.audio,
          language: item.language,
        };
      case "imagination":
        return {
          originalImage: item.originalImage,
          generatedImg: item.generatedImg,
          sender: item.sender,
        };
      case "code":
        const botMessages =
          item.messages?.filter((msg: Message) => msg.sender === "bot") || [];
        return {
          messagesCount: botMessages.length,
        };
      case "captionImage":
        const botCaptionMessages =
          item.messages?.filter((msg: Message) => msg.sender === "bot") || [];
        return {
          messagesCount: botCaptionMessages.length,
        };
      default:
        return {};
    }
  };

  // Function to fetch data from API
  const fetchCodeGeneratedData = async (): Promise<void> => {
    try {
      const res = await axiosInstance.get<{ data: any }>(
        "/get-all-user-generated-data",
      );

      const apiData = res.data.data || res.data;

      // Flatten the data
      const flattenedData = flattenData(apiData);

      setAllData(flattenedData);
      setFilteredData(flattenedData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch assistant data:", error);
      setLoading(false);
    }
  };

  // Function to handle filter changes
  const handleFilterChange = (filterType: string): void => {
    setActiveFilter(filterType);

    if (filterType === "all") {
      setFilteredData(allData);
    } else {
      const filtered = allData.filter((item) => item.type === filterType);
      setFilteredData(filtered);
    }
  };

  const handleViewItem = (row: UnifiedDataItem): void => {
    if (row.type === "code" || row.type === "captionImage") {
      allData.find((item) => item.id === row.id);

      alert(`Bot Messages for ${row.type}:\n\n${row.content}`);
    }
  };

  const handleDeleteItem = async (id: any): Promise<void> => {
    try {
      // Call API to delete the item by id
      await axiosInstance.delete(`/delete-user-generated-data/${id}`);
    
      await fetchCodeGeneratedData();
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleDownload = (row: UnifiedDataItem): void => {
    console.log("Downloading item:", row);

    if (row.type === "textToAudio" && row.audio) {
      const link = document.createElement("a");
      link.href = row.audio;
      link.download = `audio_${row.id}.mp3`;
      link.click();
    } else if (row.type === "textToImage" && row.url) {
      const link = document.createElement("a");
      link.href = row.url;
      link.download = `image_${row.id}.jpg`;
      link.click();
    }
  };

  const getSummaryStats = (): Record<string, number> => {
    return allData.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  useEffect(() => {
    fetchCodeGeneratedData();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "type",
      headerName: "Name",
      width: 60,
      renderCell: (params) => {
        const type = params.value as DataType;
        const color = getTypeColor(type);

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              marginTop: "5px",
              backgroundColor: `${color}20`,
              borderRadius: "50%",
              border: `2px solid ${color}40`,
            }}
          >
            <span style={{ fontSize: "18px" }}>{getTypeIcon(type)}</span>
          </div>
        );
      },
    },
    {
      field: "content",
      headerName: "Content",
      width: 750,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Category",
      width: 150,
      renderCell: (params) => {
        const type = params.row.type as DataType;
        const color = getTypeColor(type);
        const tagName = getTagName(type);

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${color}20`,
              borderRadius: "12px",
              height: "30px",
              marginTop: "8px",
              border: `1px solid ${color}40`,
            }}
          >
            <span
              style={{
                color: color,
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              {tagName}
            </span>
          </div>
        );
      },
    },
    {
      field: "timestamp",
      headerName: "Created Date",
      width: 150,
      renderCell: (params) => {
        if (!params.value) return <span>N/A</span>;
        try {
          const formattedDate = format(
            new Date(params.value),
            "MM/dd/yy HH:mm"
          );
          return <span>{formattedDate}</span>;
        } catch (error) {
          return <span>Invalid Date</span>;
        }
      },
    },

    {
      field: "model",
      headerName: "Model",
      width: 120,
      renderCell: (params) => <span>{params.value || "N/A"}</span>,
    },
    {
      field: "voice",
      headerName: "Voice",
      width: 100,
      renderCell: (params) => <span>{params.value || "N/A"}</span>,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <div
          className="table-action-button"
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            width: "100%",
            paddingTop: "10px",
          }}
        >
          <AiOutlineEye
            size={18}
            color="#4CAF50"
            title="View"
            style={{ cursor: "pointer" }}
            onClick={() => handleViewItem(params.row as UnifiedDataItem)}
          />
          <AiOutlineDownload
            size={18}
            color="#2196F3"
            title="Download"
            style={{ cursor: "pointer" }}
            onClick={() => handleDownload(params.row as UnifiedDataItem)}
          />
          <AiFillDelete
            size={18}
            color="red"
            title="Delete"
            style={{ cursor: "pointer" }}
            onClick={() => handleDeleteItem(params.row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="main-content-common">
      <div>
        <CommonTrailBar />
      </div>
      <h2>My Document</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
          marginTop: "20px",
        }}
      >
        <div
          onClick={() => handleFilterChange("all")}
          style={{
            padding: "16px",
            backgroundColor:
              activeFilter === "all"
                ? "rgba(59, 130, 246, 0.2)"
                : "rgba(52, 62, 87, 0.1)",
            borderRadius: "8px",
            textAlign: "center",
            border:
              activeFilter === "all"
                ? "2px solid #3B82F6"
                : "1px solid rgba(71, 85, 105, 0.33)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>📁</div>
          <div
            style={{ fontSize: "20px", fontWeight: "bold", color: "#E2E8F0" }}
          >
            {allData.length}
          </div>
          <div style={{ fontSize: "14px", color: "#94A3B8" }}>All Files</div>
        </div>

        {allData.length > 0 && (
          <>
            {Object.entries(getSummaryStats()).map(([type, count]) => (
              <div
                key={type}
                onClick={() => handleFilterChange(type)}
                style={{
                  padding: "16px",
                  backgroundColor:
                    activeFilter === type
                      ? `${getTypeColor(type as DataType)}20`
                      : "rgba(52, 62, 87, 0.1)",
                  borderRadius: "8px",
                  textAlign: "center",
                  border:
                    activeFilter === type
                      ? `2px solid ${getTypeColor(type as DataType)}`
                      : "1px solid rgba(71, 85, 105, 0.33)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                  {getTypeIcon(type as DataType)}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#E2E8F0",
                  }}
                >
                  {count}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color:
                      activeFilter === type
                        ? getTypeColor(type as DataType)
                        : "#94A3B8",
                    fontWeight: activeFilter === type ? "bold" : "normal",
                  }}
                >
                  {getTagName(type as DataType)}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {activeFilter !== "all" && (
        <div
          style={{
            marginBottom: "16px",
            padding: "8px 16px",
            backgroundColor: `${getTypeColor(activeFilter as DataType)}20`,
            borderRadius: "8px",
            border: `1px solid ${getTypeColor(activeFilter as DataType)}40`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>{getTypeIcon(activeFilter as DataType)}</span>
          <span
            style={{
              color: getTypeColor(activeFilter as DataType),
              fontWeight: "bold",
            }}
          >
            Showing {getTagName(activeFilter as DataType)} (
            {filteredData.length} items)
          </span>
          <button
            onClick={() => handleFilterChange("all")}
            style={{
              marginLeft: "auto",
              padding: "4px 8px",
              backgroundColor: "transparent",
              border: `1px solid ${getTypeColor(activeFilter as DataType)}`,
              borderRadius: "4px",
              color: getTypeColor(activeFilter as DataType),
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Show All
          </button>
        </div>
      )}

      <div className="">
        <DataGrid
          rows={filteredData}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
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
                backgroundColor: "rgba(52, 62, 87, 0.5) !important",
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
                backgroundColor: "rgba(52, 62, 87, 0.7) !important", // Selected + hover
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
            "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
              backgroundColor: "#343E5733",
              borderRadius: "4px",
            },
          }}
        />
      </div>
    </div>
  );
};

export default MyFilePage;
