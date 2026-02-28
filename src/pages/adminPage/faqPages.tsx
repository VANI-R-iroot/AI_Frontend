import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ShortLink from "../../common/ShortLinkDashboard";
import { useNavigate, useLocation } from "react-router-dom";
import { TbEdit } from "react-icons/tb";
import { AiFillDelete } from "react-icons/ai";
import { useAdminPermissions } from "../../utils/useAdminPermissions";
import ModuleAccessDenied from "../../components/common/ModuleAccessDenied";
import axiosInstance from "../../utils/baseUrl";
import { FaSearch } from "react-icons/fa";
import DeleteConfirmModel from "../../common/DeleteConfirmModal";
import PageLoader from "../../common/loader";

type Faq = {
  id: number;  // ✅ Changed from _id to id
  faqQuestion?: string;
  faqAnswer?: string;
  active: string;
};

const FaqPages = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    string | null
  >(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [faqList, setFaqList] = useState<Faq[]>([]);

  // Get admin permissions
  const { hasPermission } = useAdminPermissions();
  
  useEffect(() => {
    const fetchFaqList = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get("/getFaqDataAdmin");
        // ✅ Map _id to id for DataGrid
        const faqs = res.data.data.map((faq: any) => ({
          id: faq.id,  // Use the id from database
          faqQuestion: faq.faqQuestion || faq.faq_question || "",
          faqAnswer: faq.faqAnswer || faq.faq_answer || "",
          active: faq.active || "false",
        }));
        sessionStorage.setItem("faqListAdmin", JSON.stringify(faqs));
        setFaqList(faqs);
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    const storedData = sessionStorage.getItem("faqListAdmin");

    if (location.state?.refresh) {
      fetchFaqList();
      window.history.replaceState({}, document.title);
    } else if (storedData) {
      setFaqList(JSON.parse(storedData));
      setIsLoading(false);
    } else {
      fetchFaqList();
    }
  }, [location.state]);

  const toggleVisibility = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "true" ? "false" : "true";
    try {
      await axiosInstance.post("/showHideFaq", { 
        id, 
        bullionData: newStatus 
      });
      // Refresh the list
      const res = await axiosInstance.get("/getFaqDataAdmin");
      const updatedFaqs = res.data.data.map((faq: any) => ({
        id: faq.id,
        faqQuestion: faq.faqQuestion || faq.faq_question || "",
        faqAnswer: faq.faqAnswer || faq.faq_answer || "",
        active: faq.active || "false",
      }));
      sessionStorage.setItem("faqListAdmin", JSON.stringify(updatedFaqs));
      setFaqList(updatedFaqs);
    } catch (error) {
      console.error("Toggle visibility failed", error);
    }
  };

  const handleDeleteFaq = (id: number) => {
    setSelectedAnnouncementId(id.toString());
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedAnnouncementId) return;

    try {
      const res = await axiosInstance.delete(
        `/deleteFaqData/${selectedAnnouncementId}`
      );
      if (res.status === 200) {
        const updatedList = faqList.filter(
          (faq) => faq.id !== parseInt(selectedAnnouncementId)
        );
        setFaqList(updatedList);
        sessionStorage.setItem("faqListAdmin", JSON.stringify(updatedList));
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
    { field: "faqQuestion", headerName: "Question", width: 400 },
    { field: "faqAnswer", headerName: "Answer", width: 700 },
    {
      field: "active",
      headerName: "Status",
      width: 150,
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
      renderCell: (params) => (
        <div
          className={`toggle-switch ${
            params.row.active === "true" ? "active" : "inactive"
          }`}
          onClick={() => toggleVisibility(params.row.id, params.row.active)}
          style={{ cursor: "pointer" }}
        >
          <div className="toggle-knob" />
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
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
            style={{
              cursor: hasPermission("faq.edit") ? "pointer" : "not-allowed",
              opacity: hasPermission("faq.edit") ? 1 : 0.5,
            }}
            title={hasPermission("faq.edit") ? "Edit" : "You don't have permission to edit FAQs"}
            onClick={() =>
              hasPermission("faq.edit") && navigate("/admin-create-faq", {
                state: {
                  id: params.row.id,
                  faqQuestion: params.row.faqQuestion,
                  faqAnswer: params.row.faqAnswer,
                },
              })
            }
          />
          <AiFillDelete
            size={20}
            color="red"
            title={hasPermission("faq.delete") ? "Delete" : "You don't have permission to delete FAQs"}
            style={{
              cursor: hasPermission("faq.delete") ? "pointer" : "not-allowed",
              opacity: hasPermission("faq.delete") ? 1 : 0.5,
            }}
            onClick={() => hasPermission("faq.delete") && handleDeleteFaq(params.row.id)}
          />
        </div>
      ),
    },
  ];

  const filteredFaqs = faqList.filter((faq) =>
    (faq.faqQuestion || "").toLowerCase().includes(searchKeyWord.toLowerCase())
  );

  // Check module-level access
  if (!hasPermission("faq.view")) {
    return (
      <ModuleAccessDenied
        moduleName="FAQ"
        description="You need at least view permission to access this module."
      />
    );
  }

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
                placeholder="Search faq..."
                value={searchKeyWord}
                onChange={(e) => setSearchKeyWord(e.target.value)}
              />
            </div>
            <button
              onClick={() => navigate("/admin-create-faq")}
              disabled={!hasPermission("faq.create")}
              title={hasPermission("faq.create") ? "" : "You don't have permission to create FAQs"}
              style={{
                opacity: hasPermission("faq.create") ? 1 : 0.5,
                cursor: hasPermission("faq.create") ? "pointer" : "not-allowed",
              }}
            >
              Create New
            </button>
          </div>
        </div>
        <div className="admin-table-section-smart-ai">
          <PageLoader isLoading={isLoading} />
          <div className=" ">
            <DataGrid
              rows={filteredFaqs}
              columns={columns}
              getRowId={(row) => row.id}  // ✅ FIXED: Now using 'id' not '_id'
              pageSizeOptions={[10]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
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
                "& .MuiDataGrid-row.Mui-selected": {
                  backgroundColor: "rgba(52, 62, 87, 0.5) !important",
                  "&:hover": {
                    backgroundColor: "rgba(52, 62, 87, 0.7) !important",
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

export default FaqPages;