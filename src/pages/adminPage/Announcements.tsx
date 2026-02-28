import React, { useState, useEffect } from "react";
import AnnouncementForm from "../../components/adminDashboard/announcements/AnnouncementForm";
import "../../assets/css/announcement.css";
import axiosInstance from "../../utils/baseUrl";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TbEdit } from "react-icons/tb";
import { AiFillDelete } from "react-icons/ai";
import { useAdminPermissions } from "../../utils/useAdminPermissions";
import ModuleAccessDenied from "../../components/common/ModuleAccessDenied";
import { format } from "date-fns";
import { FaSearch } from "react-icons/fa";
import ShortLink from "../../common/ShortLinkDashboard";
import { HiPlusSm } from "react-icons/hi";
import TableData from "../../assets/image/admin/icon/chat-icon/tableNotData.png";
import DeleteConfirmModel from "../../common/DeleteConfirmModal";
import PageLoader from "../../common/loader";

type AnnouncementType = "New" | "Update" | "Maintenance" | "Info";

interface Announcement {
  _id: string;
  AnnouncementTitle: string;
  AnnouncementType: AnnouncementType;
  AnnouncementStatus: boolean;
  AnnouncementDisplayLocations?: string;
  AnnouncementPriority?: "normal" | "high";
  createdAt: string;
  updatedAt: string;
}

const AnnouncementList: React.FC = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    string | null
  >(null);

  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  // Get admin permissions
  const { hasPermission } = useAdminPermissions();

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/announcements");
      const transformedData: Announcement[] = response.data.map(
        (item: any) => ({
          _id: item._id,
          AnnouncementTitle: item.AnnouncementTitle,
          AnnouncementType: item.AnnouncementType as AnnouncementType,
          AnnouncementStatus:
            item.AnnouncementStatus === true ||
            item.AnnouncementStatus === "true",
          AnnouncementDisplayLocations:
            item.AnnouncementDisplayLocations || "dashboard",
          AnnouncementPriority: item.AnnouncementPriority || "normal",
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })
      );
      setAnnouncements(transformedData);
    } catch (err: any) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      await axiosInstance.post("/update-status", {
        id,
        bullionData: newStatus.toString(),
      });

      setAnnouncements((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, AnnouncementStatus: newStatus } : item
        )
      );
    } catch (error) {
      console.error("Visibility toggle failed", error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedAnnouncementId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedAnnouncementId) return;

    try {
      const res = await axiosInstance.delete(
        `/delete-announcement/${selectedAnnouncementId}`
      );
      if (res.status === 200) {
        setAnnouncements((prev) =>
          prev.filter((item) => item._id !== selectedAnnouncementId)
        );
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

  const handleEditClick = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const filteredList = announcements.filter((item) =>
    item.AnnouncementTitle.toLowerCase().includes(searchKeyWord.toLowerCase())
  );

  const columns: GridColDef[] = [
    {
      field: "AnnouncementTitle",
      headerName: "Topic Title",
      width: 450,
    },
    { field: "AnnouncementType", headerName: "Annou Type", width: 250 },
    {
      field: "AnnouncementDisplayLocations",
      headerName: "Display",
      width: 220,
      renderCell: (params) => (
        <span style={{ textTransform: "capitalize" }}>
          {params.value || "dashboard"}
        </span>
      ),
    },
    {
      field: "AnnouncementPriority",
      headerName: "Priority",
      width: 150,
      renderCell: (params) => (
        <span
          className={`table-active-status-badge ${
            params.value === "high" ? "active" : "disabled"
          }`}
        >
          {params.value || "normal"}
        </span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 250,
      renderCell: (params) => (
        <span>{format(new Date(params.value), "MM/dd/yy")}</span>
      ),
    },
    {
      field: "AnnouncementStatus",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <span
          className={`table-active-status-badge ${
            params.value ? "active" : "disabled"
          }`}
        >
          {params.value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "visibility",
      headerName: "Toggle",
      width: 150,
      renderCell: (params) => (
        <div
          className={`toggle-switch ${
            params.row.AnnouncementStatus ? "active" : "inactive"
          }`}
          onClick={() =>
            toggleVisibility(params.row._id, params.row.AnnouncementStatus)
          }
          style={{ cursor: "pointer" }}
        >
          <div className="toggle-knob"></div>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <div
          className="table-acton-button"
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            width: "100%",
            paddingTop: "7px",
          }}
        >
          <TbEdit
            size={20}
            style={{
              cursor: hasPermission("announcement.edit") ? "pointer" : "not-allowed",
              opacity: hasPermission("announcement.edit") ? 1 : 0.5,
            }}
            title={hasPermission("announcement.edit") ? "Edit" : "You don't have permission to edit announcements"}
            onClick={() => hasPermission("announcement.edit") && handleEditClick(params.row)}
          />
          <AiFillDelete
            size={20}
            color="red"
            title={hasPermission("announcement.delete") ? "Delete" : "You don't have permission to delete announcements"}
            style={{
              cursor: hasPermission("announcement.delete") ? "pointer" : "not-allowed",
              opacity: hasPermission("announcement.delete") ? 1 : 0.5,
            }}
            onClick={() => hasPermission("announcement.delete") && handleDeleteClick(params.row._id)}
          />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className=" main-content-common">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  // Check module-level access
  if (!hasPermission("announcement.view")) {
    return (
      <ModuleAccessDenied
        moduleName="Announcements"
        description="You need at least view permission to access this module."
      />
    );
  }

  return (
    <div className=" main-content-common">
      <PageLoader isLoading={isLoading} />
      <div className="global-link-limit-section">
        <div className="short-link-text">
          <ShortLink />
        </div>
        <div className="admin-dashboard-search-field-smart-ai">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search announcement..."
              value={searchKeyWord}
              onChange={(e) => setSearchKeyWord(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={!hasPermission("announcement.create")}
            className="add-announcement-button-admin"
            title={hasPermission("announcement.create") ? "" : "You don't have permission to create announcements"}
            style={{
              opacity: hasPermission("announcement.create") ? 1 : 0.5,
              cursor: hasPermission("announcement.create") ? "pointer" : "not-allowed",
            }}
          >
            <HiPlusSm />
            Add Announcement
          </button>
        </div>
      </div>

      <div className="announcement-grid">
        {filteredList.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "200px",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <img
              src={TableData}
              alt="No data available"
              style={{
                maxWidth: "80px",
                width: "100%",
                height: "auto",
                marginBottom: "20px",
                opacity: 0.7,
              }}
            />
            <p
              style={{
                color: "#E2E8F0",
                fontSize: "18px",
                fontWeight: "500",
                margin: "0",
              }}
            >
              {searchKeyWord
                ? "No matching your search Announcement data "
                : "No data available"}
            </p>
            {searchKeyWord && (
              <p
                style={{
                  color: "#94A3B8",
                  fontSize: "14px",
                  marginTop: "8px",
                }}
              >
                Try adjusting your search criteria
              </p>
            )}
          </div>
        ) : (
          <DataGrid
            rows={filteredList}
            columns={columns}
            getRowId={(row) => row._id}
            paginationModel={{ pageSize: 10, page: 0 }}
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
        )}
      </div>

      {showForm && (
        <AnnouncementForm
          onClose={() => {
            setShowForm(false);
            setEditingAnnouncement(null);
          }}
          editingAnnouncement={editingAnnouncement}
          fetchAnnouncements={fetchAnnouncements}
        />
      )}

      <DeleteConfirmModel
        isOpen={showDeleteModal}
        title="Delete Announcement?"
        message="Are you sure you want to remove this announcement permanently? This action cannot be undone."
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AnnouncementList;
