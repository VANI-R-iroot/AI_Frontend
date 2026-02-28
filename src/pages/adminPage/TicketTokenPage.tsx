import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ShortLink from "../../common/ShortLinkDashboard.tsx";
import { AiFillDelete } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import DeleteConfirmModel from "../../common/DeleteConfirmModal";
import {
  MdOutlinePendingActions,
  MdOutlineCheckCircleOutline,
  MdCancel,
} from "react-icons/md";
import axiosInstance from "../../utils/baseUrl.ts";
import { format } from "date-fns";
import { io } from "socket.io-client";
import { TbBrandWechat } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import PageLoader from "./../../common/loader";
import { apiConfig } from "../../utils/apiConfig.tsx";
const socket = io(apiConfig.webSocketUrl, {
  transports: ["websocket"],
  withCredentials: true,
});

type TokenData = {
  ticketID: string;
  userEmail: string;
  issueType: string;
  prioryType: string;
  title: string;
  description: string;
  createdAt: string | Date;
  status?: "Pending" | "Resolved" | "Closed";
};

const statusOptions = ["Pending", "Resolved", "Closed"];

const TicketTokenPage: React.FC = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    string | null
  >(null);
  const navigate = useNavigate();
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [tokenDataList, setTokenDataList] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("tokenDataList");
    if (stored) {
      try {
        const parsed: TokenData[] = JSON.parse(stored);
        setTokenDataList(parsed);
      } catch {
        console.error("Failed to parse session data");
      }
    }
  }, []);

  const fetchSupportIssueList = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/getallsupportissues");
      const data: TokenData[] = res.data.data || [];
      setTokenDataList(data);
      sessionStorage.setItem("tokenDataList", JSON.stringify(data));
    } catch (e) {
      console.error("API fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportIssueList();
    socket.emit("join-admin-issue-room", "admin-support-room");

    const handleNewIssue = (newIssue: TokenData) => {
      setTokenDataList((prev) => {
        const updated = [newIssue, ...prev];
        sessionStorage.setItem("tokenDataList", JSON.stringify(updated));
        return updated;
      });
    };

    socket.on("new-issue-generate", handleNewIssue);
    return () => {
      socket.off("new-issue-generate", handleNewIssue);
    };
  }, []);

  const handleChatWithUser = async (email: string) => {
    try {
      const res = await axiosInstance.post("/admin-open-chat-agent", { email });
      if (res.status === 200 || res.status === 201) {
        navigate("/admin-live-chat");
      }
    } catch (e) {
      console.error("Failed to open chat", e);
    }
  };
  const handleDeleteIssue = (id: string) => {
    setSelectedAnnouncementId(id);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!selectedAnnouncementId) return;

    try {
      const res = await axiosInstance.delete(
        `/deleteissue/${selectedAnnouncementId}`
      );
      if (res.status === 200) {
        setTokenDataList((prev) => {
          const filtered = prev.filter(
            (item) => item.ticketID !== selectedAnnouncementId
          );
          sessionStorage.setItem("tokenDataList", JSON.stringify(filtered));
          return filtered;
        });
      }
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedAnnouncementId(null);
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedAnnouncementId(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <MdOutlinePendingActions size={20} color="#facc15" />;
      case "Resolved":
        return <MdOutlineCheckCircleOutline size={20} color="#22c55e" />;
      case "Closed":
        return <MdCancel size={20} color="#ef4444" />;
      default:
        return null;
    }
  };

  const handleChangeStatus = async (id: string, newStatus: string) => {
    try {
      const res = await axiosInstance.put("/update-token-status", {
        id,
        status: newStatus,
      });
      if (res.status === 200) {
        fetchSupportIssueList();
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const filteredList = tokenDataList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchKeyWord.toLowerCase()) ||
      item.userEmail.toLowerCase().includes(searchKeyWord.toLowerCase()) ||
      item.ticketID.toLowerCase().includes(searchKeyWord.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: "ticketID", headerName: "Ticket ID", width: 150 },
    { field: "userEmail", headerName: "User Email", width: 150 },
    { field: "issueType", headerName: "Category", width: 100 },
    { field: "prioryType", headerName: "Priority", width: 120 },
    { field: "title", headerName: "Title", width: 180 },
    {
      field: "description",
      headerName: "Description",
      width: 250,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {params.value ? `${params.value.slice(0, 150)}...` : "N/A"}
        </div>
      ),
    },
    {
      field: "createdAt",
      headerName: "Issue Date",
      width: 120,
      renderCell: (params) => (
        <span>
          {params.value ? format(new Date(params.value), "MM/dd/yy") : "N/A"}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 180,
      renderCell: (params) => {
        const status = params.row.status || "Pending";
        let color = "#facc15";
        if (status === "Resolved") color = "#22c55e";
        else if (status === "Closed") color = "#ef4444";

        return (
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {getStatusIcon(status)}
            <select
              value={status}
              onChange={(e) =>
                handleChangeStatus(params.row._id, e.target.value)
              }
              style={{
                background: "#1e293b",
                color,
                borderRadius: "6px",
                padding: "2px 6px",
                border: "1px solid #334155",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {statusOptions.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </div>
        );
      },
    },
    {
      field: "chat",
      headerName: "Chat",
      width: 90,
      renderCell: (params) => (
        <TbBrandWechat
          size={30}
          color="#008cf7"
          title="Chat With User"
          onClick={() => handleChatWithUser(params.row.userEmail)}
          style={{ cursor: "pointer" }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      renderCell: (params) => (
        <div className="table-acton-button">
          <AiFillDelete
            size={20}
            color="red"
            title="Delete"
            onClick={() => handleDeleteIssue(params.row.ticketID)}
            style={{ cursor: "pointer" }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="main-content-common">
      <PageLoader isLoading={isLoading} />
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
                placeholder="Search tickets..."
                value={searchKeyWord}
                onChange={(e) => setSearchKeyWord(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="admin-table-section-smart-ai">
          <div className="">
            <DataGrid
              rows={filteredList}
              columns={columns}
              getRowId={(row) => row.ticketID}
              initialState={{
                pagination: { paginationModel: { pageSize: 12 } },
              }}
              pageSizeOptions={[10, 25, 50]}
              checkboxSelection
              disableRowSelectionOnClick
              loading={isLoading}
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
      </div>
      <DeleteConfirmModel
        isOpen={showDeleteModal}
        title="Delete Ticket ?"
        message="Are you sure you want to remove this Ticket permanently? This action cannot be undone."
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default TicketTokenPage;
