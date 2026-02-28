import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ShortLink from "../../common/ShortLinkDashboard";
import { AiFillDelete } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/baseUrl";
import { format } from "date-fns";
import { useUserStore } from "../../zustand/userDetailsStore";
import { MdHourglassEmpty, MdCheckCircle, MdCancel } from "react-icons/md";
import TableData from "../../assets/image/admin/icon/chat-icon/tableNotData.png";

type TokenData = {
  id: string;
  ticketID: string;
  from: string;
  title: string;
  description: string;
  issueType: string;
  userEmail: string;
  userName: string;
  prioryType: string;
  createDate: string | Date;
  createdAt: string | Date;
  status: string;
};

interface UserData {
  image: string;
  email: string;
  name: string;
  _id: string;
}

const TicketTokenPage = () => {
  const userData = useUserStore((state) => state.userData || {}) as UserData;
  const navigate = useNavigate();
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [tokenDataList, setTokenDataList] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("userSupportList");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setTokenDataList(parsed);
        }
      } catch (e) {
        console.error("Failed to parse session data", e);
      }
    }
  }, []);

  const fetchSupportIssueList = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(
        `/getusertokenlist/${userData.email}`
      );
      const data: TokenData[] = res?.data?.data || [];
      setTokenDataList(data);
      sessionStorage.setItem("userSupportList", JSON.stringify(data));
    } catch (e) {
      console.error("API fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportIssueList();
  }, []);

  const handleDeleteIssue = async (ticketID: string) => {
    if (!window.confirm("Are you sure to delete this issue?")) return;

    try {
      await axiosInstance.delete(`/deleteissue/${ticketID}`);
      setTokenDataList((prev) => {
        const filtered = prev.filter((item) => item.ticketID !== ticketID);
        sessionStorage.setItem("userSupportList", JSON.stringify(filtered));
        return filtered;
      });
    } catch (e) {
      console.error("Failed to delete issue", e);
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
    { field: "userEmail", headerName: "User Email", width: 180 },
    { field: "issueType", headerName: "Category", width: 130 },
    { field: "prioryType", headerName: "Priority", width: 150 },
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
        const status = params.row.status;

        let statusClass = "";
        let icon = null;
        let label = status;

        if (status === "Resolved") {
          statusClass = "status-badge resolved";
          icon = <MdCheckCircle size={16} />;
        } else if (status === "Closed") {
          statusClass = "status-badge closed";
          icon = <MdCancel size={16} />;
        } else {
          statusClass = "status-badge pending";
          icon = <MdHourglassEmpty size={16} />;
        }

        return (
          <span className={statusClass}>
            {icon}
            <span style={{ marginLeft: "6px" }}>{label}</span>
          </span>
        );
      },
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      renderCell: (params) => (
        <AiFillDelete
          size={20}
          color="red"
          title="Delete"
          onClick={() => handleDeleteIssue(params.row.ticketID)}
          style={{ cursor: "pointer" }}
        />
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
              placeholder="Search tickets..."
              value={searchKeyWord}
              onChange={(e) => setSearchKeyWord(e.target.value)}
            />
          </div>
          <button onClick={() => navigate("/open-ticket")}>
            Open a new Ticket
          </button>
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
              {searchKeyWord
                ? "No plugins found matching your search"
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
          <div>
            <DataGrid
              rows={filteredList}
              columns={columns}
              getRowId={(row) => row.ticketID}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
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
        )}
      </div>
    </div>
  );
};

export default TicketTokenPage;
