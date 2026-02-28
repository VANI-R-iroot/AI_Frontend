import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ShortLink from "../../common/ShortLinkDashboard";
import { useLocation } from "react-router-dom";
import { TbEdit } from "react-icons/tb";
import { AiFillDelete } from "react-icons/ai";
import axiosInstance from "../../utils/baseUrl";
import { format } from "date-fns";
import { FaSearch } from "react-icons/fa";
import DeleteConfirmModel from "../../common/DeleteConfirmModal";
import PageLoader from "../../common/loader";

type SocialMedia = {
  _id?: string;
  mediaLink: string;
  mediaIcon: string;
  active: string;
  createDate?: Date;
};

const MediaPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    string | null
  >(null);
  const location = useLocation();

  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [socialMediaList, setSocialMediaList] = useState<SocialMedia[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<SocialMedia | null>(null);

  useEffect(() => {
    const fetchSocialMediaList = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get("/readSocialMediaAdmin");
        const socialMediaAdmins = res.data.data.SocialMediaList;
        sessionStorage.setItem(
          "socialMediaAdminList",
          JSON.stringify(socialMediaAdmins)
        );
        setSocialMediaList(socialMediaAdmins);
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    const storedData = sessionStorage.getItem("socialMediaAdminList");

    if (location.state?.refresh) {
      fetchSocialMediaList();
      window.history.replaceState({}, document.title);
    } else if (storedData) {
      setSocialMediaList(JSON.parse(storedData));
      setIsLoading(false);
    } else {
      fetchSocialMediaList();
    }
  }, [location.state]);

  const toggleVisibility = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "true" ? "false" : "true";

    try {
      await axiosInstance.post("/showHideSocialMedia", {
        id,
        bullionData: newStatus,
      });

      const res = await axiosInstance.get("/readSocialMediaAdmin");
      const updatedList = res.data.data.SocialMediaList;
      sessionStorage.setItem(
        "socialMediaAdminList",
        JSON.stringify(updatedList)
      );
      setSocialMediaList(updatedList);
    } catch (error) {
      console.error("Visibility toggle failed", error);
    }
  };

  const handleEditClick = (data: SocialMedia) => {
    setEditData({
      _id: data._id,
      mediaLink: data.mediaLink,
      mediaIcon: data.mediaIcon,
      active: data.active,
      createDate: data.createDate,
    });
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setEditData({
      mediaLink: "",
      mediaIcon: "",
      active: "false",
      createDate: new Date(),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!editData) return;

      if (editData._id) {
        // Update existing
        await axiosInstance.post("/updateSocialMediaAdmin", {
          id: editData._id,
          mediaLink: editData.mediaLink,
          mediaIcon: editData.mediaIcon,
        });
        setModalOpen(false);
      } else {
        // Create new
        await axiosInstance.post("/socialMediaCreate", {
          mediaLink: editData.mediaLink,
          mediaIcon: editData.mediaIcon,
        });
        setModalOpen(false);
      }

      const res = await axiosInstance.get("/readSocialMediaAdmin");
      const updatedList = res.data.data.SocialMediaList;
      setSocialMediaList(updatedList);
      sessionStorage.setItem(
        "socialMediaAdminList",
        JSON.stringify(updatedList)
      );
      setModalOpen(false);
    } catch (err) {
      console.error("Submit failed", err);
    }
  };

  const filteredList = socialMediaList.filter((item) =>
    item.mediaLink.toLowerCase().includes(searchKeyWord.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setSelectedAnnouncementId(id);
    setShowDeleteModal(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!selectedAnnouncementId) return;

    try {
      const res = await axiosInstance.delete(
        `/deleteSocialMedia/${selectedAnnouncementId}`
      );
      if (res.status === 200) {
        const updatedList = socialMediaList.filter(
          (item) => item._id !== selectedAnnouncementId
        );
        setSocialMediaList(updatedList);
        sessionStorage.setItem(
          "socialMediaAdminList",
          JSON.stringify(updatedList)
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

  const columns: GridColDef[] = [
    {
      field: "mediaIcon",
      headerName: "Media Icon",
      width: 150,
      renderCell: (params) => (
        <div className="admin-dashboard-media-icon-area">
          <span
            className="admin-dashboard-media-icon-cell"
            dangerouslySetInnerHTML={{ __html: params.value }}
          />
        </div>
      ),
    },
    { field: "mediaLink", headerName: "Media Link", width: 700 },
    {
      field: "createDate",
      headerName: "Created At",
      width: 150,
      renderCell: (params) => (
        <span>{format(new Date(params.value), "MM/dd/yy")}</span>
      ),
    },
    {
      field: "active",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <span
          className={`table-active-status-badge ${
            params.value === "true" ? "active" : "disabled"
          }`}
        >
          {params.value === "true" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "visibility",
      headerName: "Toggle",
      width: 120,
      renderCell: (params) => (
        <div
          className={`toggle-switch ${
            params.row.active === "true" ? "active" : "inactive"
          }`}
          onClick={() => toggleVisibility(params.row._id, params.row.active)}
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
            paddingTop: "10px",
          }}
        >
          <TbEdit
            size={20}
            style={{ cursor: "pointer" }}
            onClick={() => handleEditClick(params.row)}
          />
          <AiFillDelete
            size={20}
            color="red"
            title="Delete"
            style={{ cursor: "pointer" }}
            onClick={() => handleDelete(params.row._id)}
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
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search media link..."
                value={searchKeyWord}
                onChange={(e) => setSearchKeyWord(e.target.value)}
              />
            </div>
            <button onClick={handleAddClick}>Add Social Media</button>
          </div>
        </div>

        <div className="admin-table-section-smart-ai">
          <PageLoader isLoading={isLoading} />
          <div className="">
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
          </div>
        </div>
      </div>
      {modalOpen && (
        <div className="admin-media-page-modal-overlay">
          <div className="admin-media-page-modal-content">
            <h3>{editData?._id ? "Edit Social Media" : "Add Social Media"}</h3>
            <label>Media Icon [Only Font Awesome]</label>
            <input
              type="text"
              value={editData?.mediaIcon || ""}
              onChange={(e) => {
                if (editData) {
                  setEditData({
                    ...editData,
                    mediaIcon: e.target.value,
                  });
                }
              }}
            />
            <label>Media Link:</label>
            <input
              type="text"
              value={editData?.mediaLink || ""}
              onChange={(e) => {
                if (editData) {
                  setEditData({
                    ...editData,
                    mediaLink: e.target.value,
                  });
                }
              }}
            />
            <div className="admin-media-page-modal-buttons">
              <button
                className={
                  editData?._id
                    ? "admin-media-page-btn-update"
                    : "admin-media-page-btn-create"
                }
                onClick={handleSubmit}
              >
                {editData?._id ? "Update" : "Create"}
              </button>

              <button
                className="admin-media-cancel-button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModel
        isOpen={showDeleteModal}
        title="Delete Blog?"
        message="Are you sure you want to remove this Blog permanently? This action cannot be undone."
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default MediaPage;
