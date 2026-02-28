import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ShortLink from "../../../common/ShortLinkDashboard.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import { TbEdit } from "react-icons/tb";
import { AiFillDelete } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import axiosInstance from "../../../utils/baseUrl.ts";
import { format } from "date-fns";
import DeleteConfirmModel from "../../../common/DeleteConfirmModal";
import { apiConfig } from "../../../utils/apiConfig.tsx";

type ChatAssistant = {
  _id: string;
  assistantIcon: string;
  assistantName: string;
  category: string;
  packageType: string;
  promptDescription: string;
  active: string;
  createDate: Date;
};

const ChatAssistantPages = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    string | null
  >(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [chatAssistantList, setChatAssistantList] = useState<ChatAssistant[]>(
    []
  );
  const [filteredList, setFilteredList] = useState<ChatAssistant[]>([]);

  useEffect(() => {
    const fetchChatAssistantList = async () => {
      try {
        const res = await axiosInstance.get("/assistantListAdmin");
        const chatAssistants = res.data.data.chatAssistant;
        
        sessionStorage.setItem(
          "chatAssistantList",
          JSON.stringify(chatAssistants)
        );

        setChatAssistantList(chatAssistants);
        setFilteredList(chatAssistants);
      } catch (error) {
        console.error("Fetch failed", error);
      }
    };

    const storedData = sessionStorage.getItem("chatAssistantList");

    if (location.state?.refresh) {
      fetchChatAssistantList();
      window.history.replaceState({}, document.title);
    } else if (storedData) {
      const parsedData = JSON.parse(storedData);
      setChatAssistantList(parsedData);
      setFilteredList(parsedData);
    } else {
      fetchChatAssistantList();
    }
  }, [location.state]);

  useEffect(() => {
    if (searchKeyword.trim() === "") {
      setFilteredList(chatAssistantList);
      return;
    }

    const lowercasedSearch = searchKeyword.toLowerCase();
    const filtered = chatAssistantList.filter(
      (assistant) =>
        assistant.assistantName?.toLowerCase().includes(lowercasedSearch) ||
        assistant.category?.toLowerCase().includes(lowercasedSearch) ||
        assistant.promptDescription?.toLowerCase().includes(lowercasedSearch) ||
        assistant.packageType?.toLowerCase().includes(lowercasedSearch)
    );

    setFilteredList(filtered);
  }, [searchKeyword, chatAssistantList]);

  const toggleVisibility = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "true" ? "false" : "true";

    try {
      await axiosInstance.post("/showHideAssistant", {
        id,
        bullionData: newStatus,
      });

      const res = await axiosInstance.get("/assistantListAdmin");
      const updatedAssistants = res.data.data.chatAssistant;
      sessionStorage.setItem(
        "chatAssistantList",
        JSON.stringify(updatedAssistants)
      );
      setChatAssistantList(updatedAssistants);
      setFilteredList(
        searchKeyword.trim() === ""
          ? updatedAssistants
          : updatedAssistants.filter(
              (assistant: {
                assistantName: string;
                category: string;
                promptDescription: string;
                packageType: string;
              }) =>
                assistant.assistantName
                  ?.toLowerCase()
                  .includes(searchKeyword.toLowerCase()) ||
                assistant.category
                  ?.toLowerCase()
                  .includes(searchKeyword.toLowerCase()) ||
                assistant.promptDescription
                  ?.toLowerCase()
                  .includes(searchKeyword.toLowerCase()) ||
                assistant.packageType
                  ?.toLowerCase()
                  .includes(searchKeyword.toLowerCase())
            )
      );
    } catch (error) {
      console.error("Visibility toggle failed", error);
    }
  };
  const handleDeleteAssistant = (id: string) => {
    setSelectedAnnouncementId(id);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!selectedAnnouncementId) return;

    try {
      const res = await axiosInstance.delete(
        `/deleteAssistant/${selectedAnnouncementId}`
      );
      if (res.status === 200) {
        const updatedList = chatAssistantList.filter(
          (assistant) => assistant._id !== selectedAnnouncementId
        );
        setChatAssistantList(updatedList);
        sessionStorage.setItem(
          "chatAssistantList",
          JSON.stringify(updatedList)
        );

        setFilteredList(
          searchKeyword.trim() === ""
            ? updatedList
            : updatedList.filter(
                (assistant) =>
                  assistant.assistantName
                    ?.toLowerCase()
                    .includes(searchKeyword.toLowerCase()) ||
                  assistant.category
                    ?.toLowerCase()
                    .includes(searchKeyword.toLowerCase()) ||
                  assistant.promptDescription
                    ?.toLowerCase()
                    .includes(searchKeyword.toLowerCase()) ||
                  assistant.packageType
                    ?.toLowerCase()
                    .includes(searchKeyword.toLowerCase())
              )
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
      field: "image",
      headerName: "Icon",
      width: 150,
      renderCell: (params) => (
        <img
          src={`${apiConfig.imageUrl}/${params.row.assistantIcon}`}
          alt="Assistant Icon"
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
      ),
    },

    { field: "assistantName", headerName: "Assistant Name", width: 200 },
    { field: "category", headerName: "Category", width: 120 },
    { field: "packageType", headerName: "Package Type", width: 120 },
    {
      field: "promptDescription",
      headerName: "Description",
      width: 450,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {params.value && params.value.length > 120
            ? `${params.value.slice(0, 120)}...`
            : params.value}
        </div>
      ),
    },
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
            params.row.active === "true" ? "active" : "disabled"
          }`}
        >
          {params.row.active === "true" ? "Active" : "Inactive"}
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
              navigate("/create-ai-chatbot", {
                state: params.row,
              })
            }
          />
          <AiFillDelete
            size={20}
            color="red"
            title="Delete"
            style={{ cursor: "pointer" }}
            onClick={() => handleDeleteAssistant(params.row._id)}
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
                placeholder="Search chat assistants..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <button onClick={() => navigate("/create-ai-chatbot")}>
              Create New Chat bot
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
                    pageSize: 11,
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
        </div>
      </div>
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

export default ChatAssistantPages;
