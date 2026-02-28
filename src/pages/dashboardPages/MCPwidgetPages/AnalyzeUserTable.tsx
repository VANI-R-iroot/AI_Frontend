import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useUserStore } from "../../../zustand/userDetailsStore";
import ShortLink from "../../../common/ShortLinkDashboard";
import { AiFillDelete } from "react-icons/ai";
import axiosInstance from "../../../utils/baseUrl";
import { format } from "date-fns";
import { FaSearch } from "react-icons/fa";
import { usePluginStore } from "../../../zustand/pluginStore";
import { fetchPluginList } from "../../../utils/fetchPluginList";
import DeleteConfirmModel from "../../../common/DeleteConfirmModal";

type VisitorData = {
  _id: string;
  city: string;
  country: string;
  countryCode?: string;
  domain?: string;
  language: string;
  region?: string;
  timezone?: string;
  referrer?: string;
  visitorIP?: string;
  platform?: string;
  timeSpent?: number;
  createdAt: string;
};

interface UserData {
  email: string;
  name: string;
  _id: string;
}

const VisitorTracking = () => {
  const domainNames = usePluginStore((state) => state.domainNames);
  const userData = useUserStore((state) => state.userData || {}) as UserData;

  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [trackingData, setTrackingData] = useState<VisitorData[]>([]);
  const [filteredData, setFilteredData] = useState<VisitorData[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    string | null
  >(null);

  const getCountryFlag = (countryCode: string) => {
    if (!countryCode) {
      return (
        <div
          style={{
            width: "24px",
            height: "18px",
            backgroundColor: "#4a5568",
            borderRadius: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            color: "#E2E8F0",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          ?
        </div>
      );
    }

    const code = countryCode.toLowerCase();

    return (
      <img
        src={`https://flagcdn.com/24x18/${code}.png`}
        srcSet={`https://flagcdn.com/48x36/${code}.png 2x, https://flagcdn.com/72x54/${code}.png 3x`}
        width="24"
        height="18"
        alt={`${countryCode} flag`}
        style={{
          borderRadius: "2px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          e.currentTarget.nextElementSibling?.setAttribute(
            "style",
            "display: flex"
          );
        }}
      />
    );
  };

  const formatTimeForSearch = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return "";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let display = "";
    if (hours > 0) display += `${hours}h `;
    if (minutes > 0 || hours > 0) display += `${minutes}m `;
    display += `${secs}s`;

    return display.trim();
  };

  const performSearch = (
    data: VisitorData[],
    keyword: string
  ): VisitorData[] => {
    if (!keyword.trim()) return data;

    const lowerCaseKeyword = keyword.toLowerCase().trim();

    return data.filter((item) => {
      const basicFields = [
        item.city,
        item.country,
        item.domain,
        item.language,
        item.region,
        item.timezone,
        item.referrer,
        item.visitorIP,
        item.platform,
      ];

      const basicMatch = basicFields.some((field) =>
        field?.toLowerCase().includes(lowerCaseKeyword)
      );

      let dateMatch = false;
      try {
        const formattedDate = format(new Date(item.createdAt), "MM/dd/yy");
        const fullDate = format(new Date(item.createdAt), "PPpp");
        dateMatch =
          formattedDate.toLowerCase().includes(lowerCaseKeyword) ||
          fullDate.toLowerCase().includes(lowerCaseKeyword);
      } catch (error) {}

      let timeMatch = false;
      if (item.timeSpent !== undefined) {
        const formattedTime = formatTimeForSearch(item.timeSpent);
        const timeInSeconds = item.timeSpent.toString();
        timeMatch =
          formattedTime.toLowerCase().includes(lowerCaseKeyword) ||
          timeInSeconds.includes(lowerCaseKeyword);
      }

      return basicMatch || dateMatch || timeMatch;
    });
  };

  const fetchTrackingData = async () => {
    const email = userData?.email;
    if (!email) {
      return;
    }
    try {
      const res = await axiosInstance.get("/get-tracking-data", {
        params: { email },
      });
      const tracking = res.data.data.users;
      setTrackingData(tracking);
      setFilteredData(tracking);
      sessionStorage.setItem("UserTrackingData", JSON.stringify(tracking));
    } catch (error) {
      console.error("Fetch failed", error);
    }
  };

  useEffect(() => {
    if (domainNames?.length) {
      fetchTrackingData();
    }
  }, [domainNames]);

  useEffect(() => {
    if (userData?.email) {
      fetchPluginList(userData.email);
    }
  }, [userData?.email]);

  useEffect(() => {
    const savedData = sessionStorage.getItem("UserTrackingData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setTrackingData(parsed);
      setFilteredData(parsed);
    }
  }, []);

  useEffect(() => {
    const filtered = performSearch(trackingData, searchKeyWord);
    setFilteredData(filtered);
  }, [searchKeyWord, trackingData]);

  const handleDeleteBlog = async (id: string) => {
    try {
      const res = await axiosInstance.post(`/deleteBlog/${id}`);
      if (res.data.status === "success") {
        const updatedList = trackingData.filter((blog) => blog._id !== id);
        setTrackingData(updatedList);
        const filteredUpdatedList = performSearch(updatedList, searchKeyWord);
        setFilteredData(filteredUpdatedList);

        sessionStorage.setItem("UserTrackingData", JSON.stringify(updatedList));
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const confirmDelete = async () => {
    if (!selectedAnnouncementId) return;
    try {
      const res = await axiosInstance.delete(
        `/delete-visitor-record/${selectedAnnouncementId}`
      );
      if (res.status === 200) {
        await handleDeleteBlog(selectedAnnouncementId);
      }
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      fetchTrackingData();
      setShowDeleteModal(false);
      setSelectedAnnouncementId(null);
    }
  };

  // Clear search function
  const clearSearch = () => {
    setSearchKeyWord("");
  };

  const columns: GridColDef[] = [
    {
      field: "country",
      headerName: "Country",
      width: 160,
      renderCell: (params) => {
        const countryCode = params.row.countryCode;
        const countryName = params.value;

        return (
          <div
            className="table-country-flag"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div style={{ position: "relative" }}>
              {getCountryFlag(countryCode)}

              <div
                style={{
                  display: "none",
                  width: "24px",
                  height: "18px",
                  backgroundColor: "#4a5568",
                  borderRadius: "2px",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  color: "#E2E8F0",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  position: "absolute",
                  top: "0",
                  left: "0",
                }}
              >
                {countryCode?.toUpperCase() || "?"}
              </div>
            </div>
            <span>{countryName}</span>
          </div>
        );
      },
    },
    { field: "city", headerName: "City", width: 120 },
    { field: "domain", headerName: "Domain", width: 100 },
    { field: "language", headerName: "Language", width: 100 },
    { field: "region", headerName: "Region", width: 130 },
    { field: "timezone", headerName: "Time Zone", width: 100 },
    { field: "referrer", headerName: "Referrer", width: 130 },
    { field: "visitorIP", headerName: "Visitor IP", width: 130 },
    { field: "platform", headerName: "Device", width: 120 },
    {
      field: "timeSpent",
      headerName: "Time Spent",
      width: 130,
      renderCell: (params) => {
        const seconds = Number(params.value);
        if (isNaN(seconds) || seconds < 0) return <span>—</span>;

        const formattedTime = formatTimeForSearch(seconds);
        return (
          <span
            title={`${params.value} seconds`}
            style={{
              fontFamily: "monospace",
              fontSize: "0.9em",
            }}
          >
            {formattedTime}
          </span>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 130,
      renderCell: (params) => {
        try {
          const formattedDate = format(new Date(params.value), "MM/dd/yy");
          return (
            <span title={format(new Date(params.value), "PPpp")}>
              {formattedDate}
            </span>
          );
        } catch (error) {
          return <span>—</span>;
        }
      },
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
          <AiFillDelete
            size={20}
            color="#dc3545"
            title="Delete Record"
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedAnnouncementId(params.row._id);
              setShowDeleteModal(true);
            }}
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
            <div
              className="search-input-container"
              style={{ position: "relative" }}
            >
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search across all columns (city, country, IP, date, time, etc.)..."
                value={searchKeyWord}
                onChange={(e) => setSearchKeyWord(e.target.value)}
                style={{ paddingRight: searchKeyWord ? "35px" : "15px" }}
              />
              {searchKeyWord && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#999",
                    cursor: "pointer",
                    fontSize: "16px",
                    padding: "0",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            {searchKeyWord && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                Found {filteredData.length} result
                {filteredData.length !== 1 ? "s" : ""}
                {filteredData.length !== trackingData.length &&
                  ` out of ${trackingData.length} total records`}
              </div>
            )}
          </div>
        </div>

        <div className="admin-table-section-smart-ai">
          <DataGrid
            rows={filteredData}
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
          title="Delete Visitor Record?"
          message="Are you sure you want to remove this visitor record permanently? This action cannot be undone."
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedAnnouncementId(null);
          }}
          onConfirm={confirmDelete}
          confirmText="Yes, Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
};

export default VisitorTracking;
