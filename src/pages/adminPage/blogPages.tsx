import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ShortLink from "../../common/ShortLinkDashboard";
import { useNavigate } from "react-router-dom";
import { TbEdit } from "react-icons/tb";
import { AiFillDelete } from "react-icons/ai";
import axiosInstance from "../../utils/baseUrl";
import { format } from "date-fns";
import { FaSearch } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import DeleteConfirmModel from "../../common/DeleteConfirmModal";
import PageLoader from "../../common/loader";
import { useAdminPermissions } from "../../utils/useAdminPermissions";

type Blog = {
  _id: string;
  title: string;
  tag?: string;
  category: string;
  description: string;
  active: string;
  createDate: Date;
  coverImage: string;
};

const BlogPages = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    string | null
  >(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [blogList, setBlogList] = useState<Blog[]>([]);
  
  // Get admin permissions
  const { hasPermission } = useAdminPermissions();

  const mapBlogRow = (blog: any): Blog => ({
    _id: String(blog.id ?? blog._id ?? ""),
    title: blog.title || "",
    tag: blog.tag || "",
    category: blog.category || "",
    description: blog.description || "",
    active: String(Boolean(blog.is_published ?? blog.active ?? false)),
    createDate: (blog.created_at || blog.create_date || blog.createDate || new Date().toISOString()) as Date,
    coverImage: blog.cover_image || blog.coverImage || "",
  });

  useEffect(() => {
    const fetchBlogList = async () => {
      setIsLoading(true);
      try {
        const keyword = searchKeyWord?.trim();
        const endpoint = keyword
          ? `/blog/search/query?keyword=${encodeURIComponent(keyword)}&page=1&limit=200`
          : `/blog?published_only=false&page=1&limit=200`;
        const res = await axiosInstance.get(endpoint);
        const rawBlogs = Array.isArray(res.data?.data) ? res.data.data : [];
        const blogs = rawBlogs.map(mapBlogRow);
        sessionStorage.setItem("blogList", JSON.stringify(blogs));
        setBlogList(blogs);
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    const storedData = sessionStorage.getItem("blogList");

    if (location.state?.refresh) {
      fetchBlogList();
      window.history.replaceState({}, document.title);
    } else if (storedData) {
      setBlogList(JSON.parse(storedData));
      setIsLoading(false);
    } else {
      fetchBlogList();
    }
  }, [searchKeyWord]);

  const toggleVisibility = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus !== "true";

    try {
      await axiosInstance.put(`/blog/${id}`, {
        is_published: newStatus,
      });

      const updatedBlogs = blogList.map((blog) =>
        blog._id === id ? { ...blog, active: String(newStatus) } : blog
      );
      sessionStorage.setItem("blogList", JSON.stringify(updatedBlogs));
      setBlogList(updatedBlogs);
    } catch (error) {
      console.error("Visibility toggle failed", error);
    }
  };
  const handleDeleteBlog = (id: string) => {
    setSelectedAnnouncementId(id);
    setShowDeleteModal(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!selectedAnnouncementId) return;

    try {
      const res = await axiosInstance.delete(`/blog/${selectedAnnouncementId}`);
      if (res.status === 200) {
        const updatedList = blogList.filter(
          (blog) => blog._id !== selectedAnnouncementId
        );
        setBlogList(updatedList);
        sessionStorage.setItem("blogList", JSON.stringify(updatedList));
      }
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedAnnouncementId(null);
    }
  };

  const columns: GridColDef[] = [
    { field: "title", headerName: "Blog Title", width: 400 },
    { field: "category", headerName: "Category", width: 150 },
    {
      field: "description",
      headerName: "Description",
      width: 450,
      renderCell: (params) => {
        const desc = params.value ?? "";
        const safeDesc = typeof desc === "string" ? desc : JSON.stringify(desc);
        return (
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {safeDesc.slice(0, 120)}...
          </div>
        );
      },
    },
    {
      field: "createDate",
      headerName: "Create Date",
      width: 130,
      renderCell: (params) => {
        const date = new Date(params.value);
        const formattedDate = Number.isNaN(date.getTime())
          ? "-"
          : format(date, "MM/dd/yy");
        return <span>{formattedDate}</span>;
      },
    },
    {
      field: "active",
      headerName: "Status",
      width: 110,
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
      width: 110,
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
      width: 110,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const canEdit = hasPermission("blog.edit");
        const canDelete = hasPermission("blog.delete");
        
        return (
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
                cursor: canEdit ? "pointer" : "not-allowed",
                opacity: canEdit ? 1 : 0.5,
              }}
              title={canEdit ? "Edit" : "No permission to edit blogs"}
              onClick={() =>
                canEdit &&
                navigate("/admin-create-blog", {
                  state: {
                    id: params.row._id,
                    title: params.row.title,
                    tag: params.row.tag,
                    category: params.row.category,
                    editorValue: params.row.description,
                    coverImage: params.row.coverImage,
                  },
                })
              }
            />

            <AiFillDelete
              size={20}
              color={canDelete ? "red" : "gray"}
              title={canDelete ? "Delete" : "No permission to delete blogs"}
              style={{
                cursor: canDelete ? "pointer" : "not-allowed",
                opacity: canDelete ? 1 : 0.5,
              }}
              onClick={() => canDelete && handleDeleteBlog(params.row._id)}
            />
          </div>
        );
      },
    },
  ];

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedAnnouncementId(null);
  };

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
                placeholder="Search blog..."
                value={searchKeyWord}
                onChange={(e) => setSearchKeyWord(e.target.value)}
              />
            </div>
            <button
              onClick={() => navigate("/admin-create-blog")}
              disabled={!hasPermission("blog.create")}
              title={!hasPermission("blog.create") ? "You don't have permission to create blogs" : "Create new blog"}
              style={{
                opacity: hasPermission("blog.create") ? 1 : 0.6,
                cursor: hasPermission("blog.create") ? "pointer" : "not-allowed",
              }}
            >
              Create New Blog
            </button>
          </div>
        </div>
        <div className="admin-table-section-smart-ai">
          <PageLoader isLoading={isLoading} />
          <div className="">
            <DataGrid
              rows={blogList}
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

export default BlogPages;
