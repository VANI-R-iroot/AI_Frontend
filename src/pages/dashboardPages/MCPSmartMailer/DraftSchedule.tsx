import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useUserStore } from "../../../zustand/userDetailsStore";
import ShortLink from "../../../common/ShortLinkDashboard";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import axiosInstance from "../../../utils/baseUrl";
import { format } from "date-fns";
import { FaSearch } from "react-icons/fa";
import { usePluginStore } from "../../../zustand/pluginStore";
import { fetchPluginList } from "../../../utils/fetchPluginList";
import DeleteConfirmModel from "../../../common/DeleteConfirmModal";

type VisitorData = {
  _id: string;
  city: string;
  country: string;
  countryCode?: string;
  domain?: string;
  language: string;
  region?: string;
  timezone?: string;
  referrer?: string;
  visitorIP?: string;
  platform?: string;
  timeSpent?: number;
  createdAt: string;
  status?: string;
  content?: string;
  range?: string;
  sendType?: string;
  scheduleDate?: string;
  scheduleTime?: string;
};

interface UserData {
  email: string;
  name: string;
  _id: string;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, scheduleDate: string, scheduleTime: string) => void;
  initialData: {
    id: string;
    scheduleDate: string;
    scheduleTime: string;
  } | null;
}

const EditDateTimeModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("AM");

  useEffect(() => {
    if (initialData) {
      setScheduleDate(initialData.scheduleDate || "");

      // Parse existing time if it exists
      if (initialData.scheduleTime) {
        const timeStr = initialData.scheduleTime;
        if (timeStr.includes("AM") || timeStr.includes("PM")) {
          setScheduleTime(timeStr);
          // Parse the time string
          const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
          if (match) {
            setHour(match[1].padStart(2, "0"));
            setMinute(match[2]);
            setAmpm(match[3].toUpperCase());
          }
        } else {
          setScheduleTime(timeStr);
        }
      } else {
        setScheduleTime("");
      }
    }
  }, [initialData]);

  // Update scheduleTime when hour, minute, or ampm changes
  useEffect(() => {
    const formattedTime = `${hour}:${minute} ${ampm}`;
    setScheduleTime(formattedTime);
  }, [hour, minute, ampm]);

  const handleSave = () => {
    if (initialData) {
      onSave(initialData.id, scheduleDate, scheduleTime);
    }
  };

  if (!isOpen) return null;

  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    return h.toString().padStart(2, "0");
  });

  const minutes = Array.from({ length: 60 }, (_, i) => {
    return i.toString().padStart(2, "0");
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#2a3441",
          padding: "24px",
          borderRadius: "8px",
          minWidth: "450px",
          color: "#E2E8F0",
        }}
      >
        <h3 style={{ marginBottom: "20px", color: "#E2E8F0" }}>
          Edit Schedule Date & Time
        </h3>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#E2E8F0",
              fontWeight: "500",
            }}
          >
            Schedule Date:
          </label>
          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #475569",
              backgroundColor: "#1e293b",
              color: "#E2E8F0",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#E2E8F0",
              fontWeight: "500",
            }}
          >
            Schedule Time:
          </label>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #475569",
                backgroundColor: "#1e293b",
                color: "#E2E8F0",
                fontSize: "14px",
                minWidth: "60px",
              }}
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            <span style={{ color: "#E2E8F0", fontSize: "16px" }}>:</span>

            <select
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #475569",
                backgroundColor: "#1e293b",
                color: "#E2E8F0",
                fontSize: "14px",
                minWidth: "60px",
              }}
            >
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={ampm}
              onChange={(e) => setAmpm(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #475569",
                backgroundColor: "#1e293b",
                color: "#E2E8F0",
                fontSize: "14px",
                minWidth: "60px",
              }}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <div
            style={{
              marginTop: "8px",
              padding: "8px 12px",
              backgroundColor: "#1e293b",
              borderRadius: "4px",
              border: "1px solid #475569",
              fontSize: "14px",
              color: "#94a3b8",
            }}
          >
            Preview: {scheduleTime}
          </div>
        </div>

        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #475569",
              backgroundColor: "transparent",
              color: "#E2E8F0",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#3b82f6",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const DraftSchedule = () => {
  const domainNames = usePluginStore((state) => state.domainNames);
  const userData = useUserStore((state) => state.userData || {}) as UserData;
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [trackingData, setTrackingData] = useState<VisitorData[]>([]);
  const [filteredData, setFilteredData] = useState<VisitorData[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    string | null
  >(null);
  const [editData, setEditData] = useState<{
    id: string;
    scheduleDate: string;
    scheduleTime: string;
  } | null>(null);

  const formatTimeForSearch = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return "";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let display = "";
    if (hours > 0) display += `${hours}h `;
    if (minutes > 0 || hours > 0) display += `${minutes}m `;
    display += `${secs}s`;

    return display.trim();
  };

  const performSearch = (
    data: VisitorData[],
    keyword: string
  ): VisitorData[] => {
    if (!keyword.trim()) return data;

    const lowerCaseKeyword = keyword.toLowerCase().trim();

    return data.filter((item) => {
      const basicFields = [
        item.city,
        item.country,
        item.domain,
        item.language,
        item.region,
        item.timezone,
        item.referrer,
        item.visitorIP,
        item.platform,
        item.status,
        item.content,
        item.range,
        item.sendType,
        item.scheduleDate,
        item.scheduleTime,
      ];

      const basicMatch = basicFields.some((field) =>
        field?.toLowerCase().includes(lowerCaseKeyword)
      );

      let dateMatch = false;
      try {
        const formattedDate = format(new Date(item.createdAt), "MM/dd/yy");
        const fullDate = format(new Date(item.createdAt), "PPpp");
        dateMatch =
          formattedDate.toLowerCase().includes(lowerCaseKeyword) ||
          fullDate.toLowerCase().includes(lowerCaseKeyword);
      } catch (error) {}

      let timeMatch = false;
      if (item.timeSpent !== undefined) {
        const formattedTime = formatTimeForSearch(item.timeSpent);
        const timeInSeconds = item.timeSpent.toString();
        timeMatch =
          formattedTime.toLowerCase().includes(lowerCaseKeyword) ||
          timeInSeconds.includes(lowerCaseKeyword);
      }

      return basicMatch || dateMatch || timeMatch;
    });
  };

  const fetchTrackingData = async () => {
    const id = userData?._id;

    try {
      const res = await axiosInstance.get(`/get-smart-mailer-schedule/${id}`);
      console.log(res);
      const tracking = res.data;

      setTrackingData(tracking);
      setFilteredData(tracking);
    } catch (error) {
      console.error("Fetch failed", error);
    }
  };

  const updateScheduleDateTime = async (
    id: string,
    scheduleDate: string,
    scheduleTime: string
  ) => {
    try {
      const res = await axiosInstance.put(
        `/mailer-update-schedule-datetime/${id}`,
        {
          scheduleDate,
          scheduleTime,
        }
      );

      if (res.data.status === "success" || res.status === 200) {
        // Update local state
        const updatedData = trackingData.map((item) =>
          item._id === id ? { ...item, scheduleDate, scheduleTime } : item
        );
        setTrackingData(updatedData);

        // Update filtered data
        const filteredUpdatedList = performSearch(updatedData, searchKeyWord);
        setFilteredData(filteredUpdatedList);

        console.log("Schedule updated successfully");
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const handleEditClick = (row: VisitorData) => {
    setEditData({
      id: row._id,
      scheduleDate: row.scheduleDate || "",
      scheduleTime: row.scheduleTime || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (
    id: string,
    scheduleDate: string,
    scheduleTime: string
  ) => {
    await updateScheduleDateTime(id, scheduleDate, scheduleTime);
    setShowEditModal(false);
    setEditData(null);
  };

  useEffect(() => {
    fetchTrackingData();
  }, []);

  useEffect(() => {
    if (domainNames?.length) {
      fetchTrackingData();
    }
  }, [domainNames]);

  useEffect(() => {
    if (userData?.email) {
      fetchPluginList(userData.email);
    }
  }, [userData?.email]);

  useEffect(() => {
    const filtered = performSearch(trackingData, searchKeyWord);
    setFilteredData(filtered);
  }, [searchKeyWord, trackingData]);

  const handleDeleteBlog = async (id: string) => {
    try {
      const res = await axiosInstance.post(`/deleteBlog/${id}`);
      if (res.data.status === "success") {
        const updatedList = trackingData.filter((blog) => blog._id !== id);
        setTrackingData(updatedList);
        const filteredUpdatedList = performSearch(updatedList, searchKeyWord);
        setFilteredData(filteredUpdatedList);

        sessionStorage.setItem("UserTrackingData", JSON.stringify(updatedList));
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const confirmDelete = async () => {
    if (!selectedAnnouncementId) return;
    try {
      const res = await axiosInstance.delete(
        `/delete-visitor-record/${selectedAnnouncementId}`
      );
      if (res.status === 200) {
        await handleDeleteBlog(selectedAnnouncementId);
      }
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      fetchTrackingData();
      setShowDeleteModal(false);
      setSelectedAnnouncementId(null);
    }
  };

  // Clear search function
  const clearSearch = () => {
    setSearchKeyWord("");
  };

  const columns: GridColDef[] = [
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => {
        if (params.value === false) {
          return (
            <span style={{ color: "#f59e0b", fontWeight: 500 }}>
              Waiting for delivery
            </span>
          );
        }
        return params.value || "—";
      },
    },

    { field: "content", headerName: "Content", width: 500 },
    { field: "range", headerName: "Range", width: 100 },
    { field: "sendType", headerName: "Send Type", width: 130 },
    { field: "scheduleDate", headerName: "Schedule Date", width: 130 },
    { field: "scheduleTime", headerName: "Schedule Time", width: 130 },
    {
      field: "createdAt",
      headerName: "Created",
      width: 130,
      renderCell: (params) => {
        try {
          const formattedDate = format(new Date(params.value), "MM/dd/yy");
          return (
            <span title={format(new Date(params.value), "PPpp")}>
              {formattedDate}
            </span>
          );
        } catch (error) {
          return <span>—</span>;
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
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
          <AiFillEdit
            size={20}
            color="#28a745"
            title="Edit Schedule"
            style={{
              cursor: "pointer",
            }}
            onClick={() => handleEditClick(params.row)}
          />
          <AiFillDelete
            size={20}
            color="#dc3545"
            title="Delete Record"
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedAnnouncementId(params.row._id);
              setShowDeleteModal(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="main-content-common">
      <div className="container-flute">
        <div className="global-link-limit-section">
          <div className="short-link-text">
            <ShortLink />
          </div>
          <div className="admin-dashboard-search-field-smart-ai">
            <div
              className="search-input-container"
              style={{ position: "relative" }}
            >
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search across all columns (city, country, IP, date, time, etc.)..."
                value={searchKeyWord}
                onChange={(e) => setSearchKeyWord(e.target.value)}
                style={{ paddingRight: searchKeyWord ? "35px" : "15px" }}
              />
              {searchKeyWord && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#999",
                    cursor: "pointer",
                    fontSize: "16px",
                    padding: "0",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            {searchKeyWord && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                Found {filteredData.length} result
                {filteredData.length !== 1 ? "s" : ""}
                {filteredData.length !== trackingData.length &&
                  ` out of ${trackingData.length} total records`}
              </div>
            )}
          </div>
        </div>

        <div className="admin-table-section-smart-ai">
          <DataGrid
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row._id}
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

        <EditDateTimeModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditData(null);
          }}
          onSave={handleSaveEdit}
          initialData={editData}
        />

        <DeleteConfirmModel
          isOpen={showDeleteModal}
          title="Delete Visitor Record?"
          message="Are you sure you want to remove this visitor record permanently? This action cannot be undone."
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedAnnouncementId(null);
          }}
          onConfirm={confirmDelete}
          confirmText="Yes, Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
};

export default DraftSchedule;
