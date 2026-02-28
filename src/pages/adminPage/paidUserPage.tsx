import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ShortLink from "../../common/ShortLinkDashboard";
import DeleteConfirmModel from "../../common/DeleteConfirmModal";
import { AiFillDelete } from "react-icons/ai";
import axiosInstance from "../../utils/baseUrl";
import { format } from "date-fns";
import { FaSearch } from "react-icons/fa";
import PageLoader from "../../common/loader";


type PaidUser = {
  _id: string;
  userName: string;
  email: string;
  packageName: string;
  paymentMethod: string;
  paymentPrice: string;
  paymentProcess: string;
  stipeIcon: string;
  active: string;
  createDate: Date;
};

const PaidUserPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    string | null
  >(null);
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [userList, setUserList] = useState<PaidUser[]>([]);

  const fetchPaidUserList = async (keyword: string = "0") => {
    try {
      const res = await axiosInstance.get(`/totalPaidUserList/${keyword}`);
      const data = res.data.data.receiveUserList;
      console.log(data);
      setUserList(data);
      sessionStorage.setItem("paidUserList", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to fetch user list", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedData = sessionStorage.getItem("paidUserList");
    if (savedData) {
      setUserList(JSON.parse(savedData));
    } else {
      fetchPaidUserList();
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchKeyWord.length > 0) {
        fetchPaidUserList(searchKeyWord);
      } else {
        fetchPaidUserList("0");
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [searchKeyWord]);

  const handleDeleteUser = (id: string) => {
    setSelectedAnnouncementId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedAnnouncementId) return;

    try {
      const res = await axiosInstance.delete(
        `/deleteOrder/${selectedAnnouncementId}`
      );
      if (res.status === 200) {
        const updatedList = userList.filter(
          (item) => item._id !== selectedAnnouncementId
        );
        setUserList(updatedList);
        sessionStorage.setItem("paidUserList", JSON.stringify(updatedList));
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
      field: "image",
      headerName: "Picture",
      width: 150,
      renderCell: (params) => (
        <img
          src={params.value}
          alt="User"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ),
    },
    { field: "name", headerName: "Name", width: 200 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "packageTime", headerName: "Package Duration", width: 150 },
    { field: "auth", headerName: "Role", width: 200 },
    { field: "plan", headerName: "Select Plan", width: 200 },
    {
      field: "Date",
      headerName: "Created",
      width: 120,
      renderCell: (params) => (
        <span>{format(new Date(params.value), "MM/dd/yyyy")}</span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <div className="table-acton-button">
          <AiFillDelete
            size={20}
            color="red"
            title="Delete"
            style={{ cursor: "pointer" }}
            onClick={() => handleDeleteUser(params.row._id)}
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
                placeholder="Search user..."
                value={searchKeyWord}
                onChange={(e) => setSearchKeyWord(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="admin-table-section-smart-ai">
          <PageLoader isLoading={isLoading} />
          <div className="">
            <DataGrid
              rows={userList}
              columns={columns}
              getRowId={(row) => row._id}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
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

export default PaidUserPage;
