import React, { useState, useEffect } from "react";
import TrainingDataForm from "../../components/adminDashboard/TrainingData/TrainingDataForm";
import axiosInstance from "../../utils/baseUrl";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TbEdit } from "react-icons/tb";
import { AiFillDelete } from "react-icons/ai";
import { format } from "date-fns";
import { FaSearch } from "react-icons/fa";
import { HiPlusSm } from "react-icons/hi";
import DeleteConfirmModel from "../../common/DeleteConfirmModal";
import { LuFolderOpen } from "react-icons/lu";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShortLink from "../../common/ShortLinkDashboard";

interface TrainingData {
  _id: string;
  TrainingDataTitle: string;
  TrainingDataStatus: boolean;
  createdAt: string;
  updatedAt: string;
  fileMetadata?: {
    originalName: string;
    mimeType: string;
    size: number;
  };
}

const DataTrainingPage: React.FC = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTrainingDataId, setSelectedTrainingDataId] = useState<
    string | null
  >(null);
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [trainingDataList, setTrainingDataList] = useState<TrainingData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTrainingData, setEditingTrainingData] =
    useState<TrainingData | null>(null);

  // Fetch all training data
  const fetchTrainingData = async () => {
    try {
      const response = await axiosInstance.get("/getVectorData");
      const transformedData: TrainingData[] = response.data.data.map(
        (item: any) => ({
          _id: item._id,
          TrainingDataTitle: item.TrainingDataTitle,
          TrainingDataStatus: item.TrainingDataStatus,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          fileMetadata: item.fileMetadata,
        })
      );
      setTrainingDataList(transformedData);
    } catch (err: any) {
      console.error("Fetch failed", err);
      toast.error("Failed to fetch training data");
    }
  };

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      await axiosInstance.patch(`/toggle-status-position/${id}`, {
        TrainingDataStatus: newStatus,
      });

      setTrainingDataList((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, TrainingDataStatus: newStatus } : item
        )
      );
      toast.success(
        `Training data ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Visibility toggle failed", error);
    }
  };

  const handleDeleteClick = (id: string) => {
  

    setSelectedTrainingDataId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedTrainingDataId) return;

    try {
      const res = await axiosInstance.delete(
        `/delete-vector-data/${selectedTrainingDataId}`
      );
      if (res.status === 200) {
        setTrainingDataList((prev) =>
          prev.filter((item) => item._id !== selectedTrainingDataId)
        );
        toast.success("Training data deleted successfully!");
      } else {
        toast.error("Failed to delete training data");
      }
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete training data");
    } finally {
      setShowDeleteModal(false);
      setSelectedTrainingDataId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedTrainingDataId(null);
  };

  // Edit training data
  const handleEditClick = (trainingData: TrainingData) => {
    setEditingTrainingData(trainingData);
    setShowForm(true);
  };

  const filteredList = trainingDataList.filter((item) =>
    item.TrainingDataTitle.toLowerCase().includes(searchKeyWord.toLowerCase())
  );

  const columns: GridColDef[] = [
    {
      field: "TrainingDataTitle",
      headerName: "Training Data Title",
      width: 500,
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
      field: "TrainingDataStatus",
      headerName: "Status",
      width: 220,

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
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div>
          <div
            className={`toggle-switch ${
              params.row.TrainingDataStatus ? "active" : "inactive"
            }`}
            onClick={() =>
              toggleVisibility(params.row._id, params.row.TrainingDataStatus)
            }
            style={{ cursor: "pointer" }}
          >
            <div className="toggle-knob"></div>
          </div>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div className="table-action-button">
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
            onClick={() => handleDeleteClick(params.row._id)}
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
              placeholder="Search announcement..."
              value={searchKeyWord}
              onChange={(e) => setSearchKeyWord(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="add-announcement-button-admin"
          >
            <HiPlusSm />
            Upload Training Data
          </button>
        </div>
      </div>

      {/* Training Data DataGrid */}
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
            <LuFolderOpen
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
                ? "No matching training data found"
                : "No training data available"}
            </p>
            {searchKeyWord && (
              <p
                style={{ color: "#94A3B8", fontSize: "14px", marginTop: "8px" }}
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

      {/* Form Modal */}
      {showForm && (
        <TrainingDataForm
          onClose={() => {
            setShowForm(false);
            setEditingTrainingData(null);
          }}
          editingTrainingData={editingTrainingData}
          fetchTrainingData={fetchTrainingData}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModel
        isOpen={showDeleteModal}
        title="Delete Training Data?"
        message="Are you sure you want to remove this training data permanently? This action cannot be undone."
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default DataTrainingPage;
