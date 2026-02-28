import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ShortLink from "../../common/ShortLinkDashboard";
import useTrackingStore from "../../zustand/useTrackingStore";
import * as CountryFlags from "country-flag-icons/react/3x2";
import { hasFlag } from "country-flag-icons";
import { AiFillDelete } from "react-icons/ai";
import axiosInstance from "../../utils/baseUrl";
import DeleteConfirmModel from "../../common/DeleteConfirmModal";
import { fetchTrackingData } from "../../utils/fetchTrackingData";
import { toast } from "react-toastify";

const FreeUserPages = () => {
  const trackingData = useTrackingStore((state) => state.trackingData);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleDeleteOrder = (id: string) => {
    setSelectedOrderId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedOrderId) return;

    try {
      const res = await axiosInstance.delete(
        `/delete-main-side-visitor-record/${selectedOrderId}`
      );
      if (res.status === 200) {
        toast.success("Successfully delete record");
        fetchTrackingData();
      }
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Felid to delete record");
    } finally {
      setShowDeleteModal(false);
      setSelectedOrderId(null);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "country",
      headerName: "Country",
      width: 160,
      renderCell: (params) => {
        const code = params.row.countryCode?.toUpperCase();

        if (code && hasFlag(code)) {
          const Flag = CountryFlags[code as keyof typeof CountryFlags];
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Flag style={{ width: "24px", height: "16px" }} />
              <span>{params.row.country}</span>
            </div>
          );
        }

        return <span>{params.row.country}</span>;
      },
    },
    { field: "city", headerName: "City", width: 150 },
    { field: "region", headerName: "Region", width: 150 },
    { field: "timezone", headerName: "Time Zone", width: 150 },
    { field: "deviceType", headerName: "Device", width: 120 },
    { field: "browser", headerName: "Browser", width: 120 },
    { field: "os", headerName: "OS", width: 130 },
    { field: "userId", headerName: "User ID", width: 200 },
    { field: "visitCount", headerName: "Visit Count", width: 100 },
    {
      field: "date",
      headerName: "Date",
      width: 120,
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
            title="Delete Order"
            style={{ cursor: "pointer" }}
            onClick={() => handleDeleteOrder(params.row._id)}
          />
        </div>
      ),
    },
  ];

  const rows = trackingData
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ) // Sort by timestamp descending (newest first)
    .map((item) => ({
      id: item._id, // 👈 Required for DataGrid
      _id: item._id, // 👈 Needed for delete
      userId: item.userId,
      deviceType: item.deviceType,
      browser: item.browserName,
      os: item.operatingSystem,
      visitCount: item.visitCount,
      country: item.country,
      countryCode: item.countryCode,
      city: item.city,
      region: item.region,
      timezone: item.timezone,
      date: new Date(item.timestamp).toLocaleDateString(),
      timestamp: item.timestamp, // Keep original timestamp for reference
    }));

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedOrderId(null);
  };

  useEffect(() => {
    fetchTrackingData();
  }, []);

  return (
    <div className="main-content-common">
      <div className="container-flute">
        <div className="global-link-limit-section">
          <div className="short-link-text">
            <ShortLink />
          </div>
        </div>

        <div className="admin-table-section-smart-ai">
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 12 },
              },
            }}
            pageSizeOptions={[12, 50, 100, 150]}
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

      <DeleteConfirmModel
        isOpen={showDeleteModal}
        title="Delete Order?"
        message="Are you sure you want to remove this order permanently? This action cannot be undone."
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default FreeUserPages;
