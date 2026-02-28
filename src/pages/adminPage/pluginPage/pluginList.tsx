import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ShortLink from "../../../common/ShortLinkDashboard";
import { useNavigate, useLocation } from "react-router-dom";
import { TbEdit } from "react-icons/tb";
import { AiFillDelete } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import axiosInstance from "../../../utils/baseUrl";
import { format } from "date-fns";
import DeleteConfirmModel from "../../../common/DeleteConfirmModal";
import { apiConfig } from "../../../utils/apiConfig";
import { GoDownload } from "react-icons/go";
import { IoIosHeart } from "react-icons/io";

type PluginType = {
  _id: string;
  chatbotName: string;
  domainName: string;
  targetPlatform: string;
  promptDescription: string;
  active: boolean;
  createDate: Date;
};

const PluginList = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    string | null
  >(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [pluginList, setPluginList] = useState<PluginType[]>([]);
  const [filteredList, setFilteredList] = useState<PluginType[]>([]);

  const fetchPluginList = async () => {
    try {
      const res = await axiosInstance.get("/pluginsList");
      const plugins = res.data.data;
      sessionStorage.setItem("pluginList", JSON.stringify(plugins));
      setPluginList(plugins);
      setFilteredList(plugins);
    } catch (error) {
      console.error("Fetch failed", error);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const storedData = sessionStorage.getItem("pluginList");

      try {
        if (location.state?.refresh) {
          await fetchPluginList();
          window.history.replaceState({}, document.title);
        } else if (storedData) {
          const parsedData = JSON.parse(storedData);
          setPluginList(parsedData);
          setFilteredList(parsedData);
        } else {
          await fetchPluginList();
        }
      } catch (error) {
        console.error("Error fetching plugin list:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchKeyword.trim() === "") {
      setFilteredList(pluginList);
      return;
    }

    const lowercasedSearch = searchKeyword.toLowerCase();
    const filtered = pluginList.filter(
      (plugin) =>
        plugin.chatbotName?.toLowerCase().includes(lowercasedSearch) ||
        plugin.domainName?.toLowerCase().includes(lowercasedSearch) ||
        plugin.targetPlatform?.toLowerCase().includes(lowercasedSearch) ||
        plugin.promptDescription?.toLowerCase().includes(lowercasedSearch)
    );

    setFilteredList(filtered);
  }, [searchKeyword, pluginList]);

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    try {
      await axiosInstance.patch(`/active-plugin/${id}/toggle`, {
        active: newStatus,
      });

      const res = await axiosInstance.get("/pluginsList");
      const updatedPlugins = res.data.data;
      sessionStorage.setItem("pluginList", JSON.stringify(updatedPlugins));
      setPluginList(updatedPlugins);
      setFilteredList(
        searchKeyword.trim() === ""
          ? updatedPlugins
          : updatedPlugins.filter(
              (plugin: {
                chatbotName: string;
                domainName: string;
                targetPlatform: string;
                promptDescription: string;
              }) =>
                plugin.chatbotName
                  ?.toLowerCase()
                  .includes(searchKeyword.toLowerCase()) ||
                plugin.domainName
                  ?.toLowerCase()
                  .includes(searchKeyword.toLowerCase()) ||
                plugin.targetPlatform
                  ?.toLowerCase()
                  .includes(searchKeyword.toLowerCase()) ||
                plugin.promptDescription
                  ?.toLowerCase()
                  .includes(searchKeyword.toLowerCase())
            )
      );
    } catch (error) {
      console.error("Status toggle failed", error);
    }
  };
  const handleDeletePlugin = (id: string) => {
    setSelectedAnnouncementId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedAnnouncementId) return;

    try {
      const res = await axiosInstance.delete(
        `/delete-plugins/${selectedAnnouncementId}`
      );
      if (res.status === 200) {
        await fetchPluginList();
      }
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedAnnouncementId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedAnnouncementId(null);
  };
  const columns: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "Icon",
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <img
            src={`${apiConfig.imageUrl}/${params.value}`}
            alt="icon"
            style={{ width: 32, height: 32, objectFit: "contain" }}
          />
        ) : (
          <span>-</span>
        ),
    },
    { field: "chatbotName", headerName: "Chatbot Name", width: 200 },
    { field: "shortTitle", headerName: "Title", width: 200 },
    { field: "frontedUrl", headerName: "Domain Name", width: 150 },
    { field: "targetPlatform", headerName: "Target Platform", width: 150 },
    {
      field: "downloadPlugin",
      headerName: "Downloads",
      width: 120,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <GoDownload size={18} style={{ color: "#0ffa71" }} />
          <span style={{ color: "#ffffff" }}>{params.value || 0}</span>
        </div>
      ),
    },
    {
      field: "likePlugin",
      headerName: "Likes",
      width: 120,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IoIosHeart size={18} style={{ color: "#fa0f13" }} />
          <span style={{ color: "#ffffff" }}>{params.value || 0}</span>
        </div>
      ),
    },

    {
      field: "createdAt",
      headerName: "Create Date",
      width: 100,
      renderCell: (params) => {
        if (!params.value) return <span>-</span>;
        const formattedDate = format(new Date(params.value), "MM/dd/yy");
        return <span>{formattedDate}</span>;
      },
    },
    {
      field: "active",
      headerName: "Status",
      width: 100,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <span
          className={`table-active-status-badge ${
            params.row.active ? "active" : "disabled"
          }`}
        >
          {params.row.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "visibility",
      headerName: "Visibility",
      width: 100,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div
          className={`toggle-switch ${
            params.row.active ? "active" : "inactive"
          }`}
          onClick={() => toggleActiveStatus(params.row._id, params.row.active)}
          style={{ cursor: "pointer" }}
        >
          <div className="toggle-knob"></div>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
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
          <TbEdit
            size={20}
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate("/plugin-setting", {
                state: params.row,
              })
            }
          />
          <AiFillDelete
            size={20}
            color="red"
            title="Delete"
            style={{ cursor: "pointer" }}
            onClick={() => handleDeletePlugin(params.row._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="main-content-common">
      <div className="global-link-limit-section">
        <div className="short-link-text">
          <ShortLink />
        </div>
        <div className="admin-dashboard-search-field-smart-ai">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search plugins..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <button onClick={() => navigate("/plugin-setting")}>
            Setup a New Agent
          </button>
        </div>
      </div>
      <div className="admin-table-section-smart-ai">
        <div className=" ">
          <DataGrid
            rows={filteredList}
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
        <DeleteConfirmModel
          isOpen={showDeleteModal}
          title="Delete Plugin?"
          message="Are you sure you want to remove this plugin permanently? This action cannot be undone."
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          confirmText="Yes, Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
};

export default PluginList;
