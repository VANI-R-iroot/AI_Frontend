import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useUserStore } from "../../../zustand/userDetailsStore";
import ShortLink from "../../../common/ShortLinkDashboard";
import { AiFillDelete, AiFillEye } from "react-icons/ai";
import { MdError, MdCheckCircle } from "react-icons/md";
import axiosInstance from "../../../utils/baseUrl";
import { format } from "date-fns";
import { FaSearch } from "react-icons/fa";
import { usePluginStore } from "../../../zustand/pluginStore";
import { fetchPluginList } from "../../../utils/fetchPluginList";
import DeleteConfirmModel from "../../../common/DeleteConfirmModal";

type EmailResult = {
  success: boolean;
  email: string;
  name: string;
  error?: string;
  messageId?: string;
  rowNumber: number;
  _id: string;
};

type EmailHistoryData = {
  _id: string;
  userId: string;
  emailTopic: string;
  selectedRange: string;
  totalEmails: number;
  successfulEmails: number;
  failedEmails: number;
  emailResults: EmailResult[];
  sentAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

interface UserData {
  email: string;
  name: string;
  _id: string;
}

const HistoryMailer = () => {
  const domainNames = usePluginStore((state) => state.domainNames);
  const userData = useUserStore((state) => state.userData || {}) as UserData;
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [emailHistory, setEmailHistory] = useState<EmailHistoryData[]>([]);
  const [filteredData, setFilteredData] = useState<EmailHistoryData[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmailDetails, setSelectedEmailDetails] =
    useState<EmailHistoryData | null>(null);

  const getStatusIcon = (successfulEmails: number, totalEmails: number) => {
    if (successfulEmails === totalEmails) {
      return (
        <MdCheckCircle
          size={20}
          color="#28a745"
          title="All emails sent successfully"
        />
      );
    } else if (successfulEmails === 0) {
      return <MdError size={20} color="#dc3545" title="All emails failed" />;
    } else {
      return <MdError size={20} color="#ffc107" title="Some emails failed" />;
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const extractSubject = (emailTopic: string) => {
    const lines = emailTopic.split("\n");
    const subjectLine = lines.find((line) => line.startsWith("Subject:"));
    if (subjectLine) {
      return subjectLine.replace("Subject:", "").trim();
    }
    return truncateText(emailTopic, 30);
  };

  const performSearch = (
    data: EmailHistoryData[],
    keyword: string
  ): EmailHistoryData[] => {
    if (!keyword.trim()) return data;

    const lowerCaseKeyword = keyword.toLowerCase().trim();

    return data.filter((item) => {
      // Search in email topic/subject
      const topicMatch = item.emailTopic
        .toLowerCase()
        .includes(lowerCaseKeyword);

      // Search in email results (recipient emails and names)
      const emailResultsMatch = item.emailResults.some(
        (result) =>
          result.email.toLowerCase().includes(lowerCaseKeyword) ||
          result.name.toLowerCase().includes(lowerCaseKeyword) ||
          (result.error &&
            result.error.toLowerCase().includes(lowerCaseKeyword))
      );

      // Search in date fields
      let dateMatch = false;
      try {
        const sentDate = format(new Date(item.sentAt), "MM/dd/yy");
        const fullSentDate = format(new Date(item.sentAt), "PPpp");
        const createdDate = format(new Date(item.createdAt), "MM/dd/yy");

        dateMatch =
          sentDate.toLowerCase().includes(lowerCaseKeyword) ||
          fullSentDate.toLowerCase().includes(lowerCaseKeyword) ||
          createdDate.toLowerCase().includes(lowerCaseKeyword);
      } catch (error) {}

      // Search in numeric fields
      const numericMatch =
        item.totalEmails.toString().includes(lowerCaseKeyword) ||
        item.successfulEmails.toString().includes(lowerCaseKeyword) ||
        item.failedEmails.toString().includes(lowerCaseKeyword) ||
        item.selectedRange.toLowerCase().includes(lowerCaseKeyword);

      return topicMatch || emailResultsMatch || dateMatch || numericMatch;
    });
  };

  const fetchEmailHistory = async () => {
    const id = userData?._id;
    if (!id) {
      return;
    }
    try {
      const res = await axiosInstance.get(`/get-smart-mailer-history/${id}`);
      const history = res.data.data || res.data || [];

      // Sort by latest data first (newest to oldest)
      const sortedHistory: EmailHistoryData[] = (
        history as EmailHistoryData[]
      ).sort((a: EmailHistoryData, b: EmailHistoryData) => {
        // Sort by sentAt date in descending order (latest first)
        return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
      });

      setEmailHistory(sortedHistory);
      setFilteredData(sortedHistory);
      sessionStorage.setItem("mcpHistoryMailer", JSON.stringify(sortedHistory));
    } catch (error) {
      console.error("Fetch failed", error);
    }
  };

  useEffect(() => {
    if (domainNames?.length) {
      fetchEmailHistory();
    }
  }, [domainNames]);

  useEffect(() => {
    if (userData?.email) {
      fetchPluginList(userData.email);
    }
  }, [userData?.email]);

  // SessionStorage থেকে data load করার useEffect এও sort করুন
  useEffect(() => {
    const savedData = sessionStorage.getItem("mcpHistoryMailer");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Sort the saved data as well
      const sortedParsed: EmailHistoryData[] = (
        parsed as EmailHistoryData[]
      ).sort((a: EmailHistoryData, b: EmailHistoryData) => {
        return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
      });
      setEmailHistory(sortedParsed);
      setFilteredData(sortedParsed);
    }
  }, []);

  useEffect(() => {
    const filtered = performSearch(emailHistory, searchKeyWord);
    setFilteredData(filtered);
  }, [searchKeyWord, emailHistory]);

  const handleDeleteEmail = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/delete-email-history/${id}`);
      if (res.status === 200) {
        const updatedList = emailHistory.filter((email) => email._id !== id);
        // Sort the updated list to maintain latest first order
        const sortedUpdatedList = updatedList.sort((a, b) => {
          return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
        });

        setEmailHistory(sortedUpdatedList);
        const filteredUpdatedList = performSearch(
          sortedUpdatedList,
          searchKeyWord
        );
        setFilteredData(filteredUpdatedList);
        sessionStorage.setItem(
          "mcpHistoryMailer",
          JSON.stringify(sortedUpdatedList)
        );
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const confirmDelete = async () => {
    if (!selectedEmailId) return;
    try {
      await handleDeleteEmail(selectedEmailId);
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedEmailId(null);
    }
  };

  const handleViewDetails = (emailData: EmailHistoryData) => {
    setSelectedEmailDetails(emailData);
    setShowDetailsModal(true);
  };

  // Clear search function
  const clearSearch = () => {
    setSearchKeyWord("");
  };

  const columns: GridColDef[] = [
    {
      field: "status",
      headerName: "Status",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        return getStatusIcon(
          params.row.successfulEmails,
          params.row.totalEmails
        );
      },
    },
    {
      field: "emailTopic",
      headerName: "Subject",
      width: 550,
      renderCell: (params) => {
        const subject = extractSubject(params.value);
        return <span title={params.value}>{truncateText(subject, 40)}</span>;
      },
    },
    {
      field: "totalEmails",
      headerName: "Total",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <span style={{ fontWeight: "bold" }}>{params.value}</span>
      ),
    },
    {
      field: "successfulEmails",
      headerName: "Success",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <span style={{ color: "#28a745", fontWeight: "bold" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "failedEmails",
      headerName: "Failed",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <span style={{ color: "#dc3545", fontWeight: "bold" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "selectedRange",
      headerName: "Range",
      width: 100,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "sentAt",
      headerName: "Sent Date",
      align: "center",
      headerAlign: "center",
      width: 130,
      renderCell: (params) => {
        try {
          const formattedDate = format(new Date(params.value), "MM/dd/yy");
          const formattedTime = format(new Date(params.value), "HH:mm");
          return (
            <div title={format(new Date(params.value), "PPpp")}>
              <div>{formattedDate}</div>
              <div style={{ fontSize: "0.8em", color: "#999" }}>
                {formattedTime}
              </div>
            </div>
          );
        } catch (error) {
          return <span>—</span>;
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div
          className="table-action-button"
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            width: "100%",
            paddingTop: "10px",
          }}
        >
          <AiFillEye
            size={18}
            color="#17a2b8"
            title="View Details"
            style={{ cursor: "pointer" }}
            onClick={() => handleViewDetails(params.row)}
          />
          <AiFillDelete
            size={18}
            color="#dc3545"
            title="Delete Record"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setSelectedEmailId(params.row._id);
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
                placeholder="Search by subject, recipients, date, status, etc..."
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
                {filteredData.length !== emailHistory.length &&
                  ` out of ${emailHistory.length} total records`}
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
            pageSizeOptions={[10, 25, 50]}
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

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModel
          isOpen={showDeleteModal}
          title="Delete Email History?"
          message="Are you sure you want to remove this email history record permanently? This action cannot be undone."
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedEmailId(null);
          }}
          onConfirm={confirmDelete}
          confirmText="Yes, Delete"
          cancelText="Cancel"
        />

        {/* Email Details Modal */}
        {showDetailsModal && selectedEmailDetails && (
          <div
            className="email-history-modal"
            onClick={() => setShowDetailsModal(false)}
          >
            <div
              className="email-history-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="email-history-modal-header">
                <h3 className="email-history-modal-title">
                  Email Campaign Details
                </h3>
                <button
                  className="email-history-modal-close"
                  onClick={() => setShowDetailsModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="email-campaign-summary">
                <h4 className="email-campaign-summary-title">
                  Campaign Summary
                </h4>
                <div className="email-campaign-grid">
                  <div className="email-campaign-stat">
                    <strong>Total Emails:</strong>{" "}
                    {selectedEmailDetails.totalEmails}
                  </div>
                  <div className="email-campaign-stat success">
                    <strong>Successful:</strong>{" "}
                    {selectedEmailDetails.successfulEmails}
                  </div>
                  <div className="email-campaign-stat failed">
                    <strong>Failed:</strong> {selectedEmailDetails.failedEmails}
                  </div>
                  <div className="email-campaign-stat">
                    <strong>Range:</strong> {selectedEmailDetails.selectedRange}
                  </div>
                </div>
                <div className="email-campaign-date">
                  <strong>Sent At:</strong>{" "}
                  {format(new Date(selectedEmailDetails.sentAt), "PPpp")}
                </div>
              </div>

              <div className="email-content-section">
                <h4 className="email-content-title">Email Content</h4>
                <div className="email-content-body">
                  {selectedEmailDetails.emailTopic}
                </div>
              </div>

              <div className="email-results-section">
                <h4 className="email-results-title">
                  Email Results ({selectedEmailDetails.emailResults.length})
                </h4>
                <div className="email-results-container">
                  {selectedEmailDetails.emailResults.map((result) => (
                    <div
                      key={result._id}
                      className={`email-result-item ${
                        result.success ? "success" : "failed"
                      }`}
                    >
                      <div className="email-result-icon">
                        {result.success ? (
                          <MdCheckCircle size={20} color="#28a745" />
                        ) : (
                          <MdError size={20} color="#dc3545" />
                        )}
                      </div>
                      <div className="email-result-content">
                        <div className="email-result-recipient">
                          {result.name} ({result.email})
                        </div>
                        <div className="email-result-row">
                          Row #{result.rowNumber}
                        </div>
                        {result.error && (
                          <div className="email-result-error">
                            Error: {result.error}
                          </div>
                        )}
                        {result.messageId && (
                          <div className="email-result-message-id">
                            Message ID: {result.messageId}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryMailer;
