import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TbEdit } from "react-icons/tb";
import { AiFillDelete } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import axiosInstance from "../../../utils/baseUrl";
import { format } from "date-fns";
import { useUserStore } from "../../../zustand/userDetailsStore";
import TrainPlugin from "../../../components/userDashboard/widgetSetup/TrainPlugin";
import TableData from "../../../assets/image/admin/icon/chat-icon/tableNotData.png";
import { usePluginStore } from "../../../zustand/pluginStore";
import { fetchPluginList } from "../../../utils/fetchPluginList";

type PluginType = {
  _id: string;
  chatbotName: string;
  domainName: string;
  targetPlatform: string;
  promptDescription: string;
  active: boolean;
  createDate: Date;
  offerText?: string;
  enableOffer?: boolean;
  enableDiscount?: boolean;
  createdAt?: string;
  discountText?: string;
};

interface CardData {
  _id: string;
  targetPlatform: string;
  chatbotName?: string;
  domainName?: string;
  promptDescription?: string;
  active?: boolean;
  offerText?: string;
  enableOffer?: boolean;
  enableDiscount?: boolean;
  createdAt?: string;
  discountText?: string;
}

const DownloadWidget = () => {
  const filteredList = usePluginStore((state) => state.filteredList);
  const userData = useUserStore((state) => state.userData);

  const [searchKeyword, setSearchKeyword] = useState("");

  const [showTrainPlugin, setShowTrainPlugin] = useState(false);
  const [selectedPluginData, setSelectedPluginData] = useState<CardData | null>(
    null
  );

  const handleEditPlugin = (rowData: PluginType) => {
    const pluginDataForEdit: CardData = {
      _id: rowData._id,
      targetPlatform: rowData.targetPlatform,
      chatbotName: rowData.chatbotName,
      domainName: rowData.domainName,
      promptDescription: rowData.promptDescription,
      active: rowData.active,
      offerText: rowData.offerText || "",
      discountText: rowData.discountText || "",
      enableOffer: rowData.enableOffer || false,
      enableDiscount: rowData.enableDiscount || false,
      createdAt: rowData.createdAt,
    };

    setSelectedPluginData(pluginDataForEdit);
    setShowTrainPlugin(true);
  };

  const handleBackFromTrainPlugin = () => {
    setShowTrainPlugin(false);
    setSelectedPluginData(null);
    fetchPluginList(userData.email);
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    try {
      await axiosInstance.patch(`/status-download-plugin/${id}/toggle`, {
        active: newStatus,
      });
      await fetchPluginList(userData.email);
    } catch (error) {
      console.error("Status toggle failed", error);
    }
  };

  const handleDeletePlugin = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this plugin?")) return;

    try {
      const res = await axiosInstance.delete(`/delete-download-plugins/${id}`);
      if (res.status === 200) {
        await fetchPluginList(userData.email);
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  useEffect(() => {
    if (userData?.email) {
      fetchPluginList(userData.email);
    }
  }, [userData?.email]);

  const columns: GridColDef[] = [
    { field: "chatbotName", headerName: "Chatbot Name", width: 200 },
    { field: "domainName", headerName: "Domain Name", width: 250 },
    { field: "targetPlatform", headerName: "Target Platform", width: 180 },
    {
      field: "googleDocIds",
      headerName: "Google Doc ID",
      width: 250,
    },
    {
      field: "createDate",
      headerName: "Create Date",
      width: 180,
      renderCell: (params) => {
        if (!params.value) return <span>-</span>;
        const formattedDate = format(new Date(params.value), "MM/dd/yy");
        return <span>{formattedDate}</span>;
      },
    },
    {
      field: "active",
      headerName: "Status",
      width: 150,
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
      width: 180,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            width: "100%",
            paddingTop: "12px",
          }}
        >
          <TbEdit
            size={20}
            style={{ cursor: "pointer" }}
            onClick={() => handleEditPlugin(params.row)}
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

  if (showTrainPlugin) {
    return (
      <TrainPlugin
        onBack={handleBackFromTrainPlugin}
        editData={selectedPluginData}
        pluginData={null}
      />
    );
  }

  return (
    <div className="main-content-common">
      <div className="global-link-limit-section">
        <div className="short-link-text"></div>
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
        </div>
      </div>
      <div className="admin-table-section-smart-ai">
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
              {searchKeyword
                ? "No plugins found matching your search"
                : "No data available"}
            </p>
            {searchKeyword && (
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
          <div>
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
        )}
      </div>
    </div>
  );
};

export default DownloadWidget;
