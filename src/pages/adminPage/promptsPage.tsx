import { useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TbEdit } from "react-icons/tb";
import { AiFillDelete } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import ShortLink from "../../common/ShortLinkDashboard";
import DeleteConfirmModel from "../../common/DeleteConfirmModal";
import PageLoader from "../../common/loader";
import axiosInstance from "../../utils/baseUrl";
import { useAdminPermissions } from "../../utils/useAdminPermissions";
import "../../assets/css/adminDashboard/promptsPage.css";

type PromptType = "full_analysis";

type PromptRow = {
  id: number;
  admin_id?: string | null;
  package_id?: number | null;
  title?: string | null;
  prompt_text: string;
  prompt_type: PromptType;
  status: "active" | "inactive";
  version: number;
  created_at?: string;
  updated_at?: string;
};

type PackageRow = {
  id: number;
  title: string;
};

type PromptFormState = {
  id?: number;
  title: string;
  prompt_text: string;
  prompt_type: PromptType;
  package_id: string; // "global" | package id string
  status: "active" | "inactive";
  version: number;
};

const PromptsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [prompts, setPrompts] = useState<PromptRow[]>([]);
  const [packages, setPackages] = useState<PackageRow[]>([]);

  const [searchText, setSearchText] = useState("");
  const [filterPackage, setFilterPackage] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<PromptFormState | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);

  // Get admin permissions
  const { hasPermission } = useAdminPermissions();

  const packageLabelById = useMemo(() => {
    const map = new Map<number, string>();
    packages.forEach((pkg) => map.set(pkg.id, pkg.title));
    return map;
  }, [packages]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axiosInstance.get("/package");
        const rows = res.data?.data || [];
        setPackages(
          rows
            .map((item: any) => ({
              id: Number(item.id),
              title: String(item.title || "Untitled"),
            }))
            .filter((item: PackageRow) => Number.isFinite(item.id))
        );
      } catch (error) {
        console.error("Failed to load packages", error);
      }
    };

    const fetchPrompts = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get("/admin/prompts");
        setPrompts(res.data?.data || []);
      } catch (error) {
        console.error("Failed to load prompts", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
    fetchPrompts();
  }, []);

  const refreshPrompts = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/admin/prompts");
      setPrompts(res.data?.data || []);
    } catch (error) {
      console.error("Failed to load prompts", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormError("");
    setFormSuccess("");
    setFormState({
      title: "",
      prompt_text: "",
      prompt_type: "full_analysis",
      package_id: "global",
      status: "active",
      version: 0.1,
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (row: PromptRow) => {
    setFormError("");
    setFormSuccess("");
    setFormState({
      id: row.id,
      title: row.title || "",
      prompt_text: row.prompt_text,
      prompt_type: "full_analysis",
      package_id: row.package_id ? String(row.package_id) : "global",
      status: row.status,
      version: row.version ?? 0.1,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedPromptId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPromptId) return;
    try {
      await axiosInstance.delete(`/admin/prompts/${selectedPromptId}`);
      setPrompts((prev) => prev.filter((p) => p.id !== selectedPromptId));
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedPromptId(null);
    }
  };

  const handleFormSubmit = async () => {
    if (!formState) return;
    if (!formState.prompt_text.trim()) {
      setFormError("Prompt text is required.");
      return;
    }

    const payload = {
      title: formState.title || null,
      prompt_text: formState.prompt_text,
      prompt_type: "full_analysis",
      package_id: formState.package_id === "global" ? null : formState.package_id,
      status: formState.status,
      version: formState.version,
    };

    try {
      setIsSaving(true);
      setFormError("");
      setFormSuccess("");
      if (formState.id) {
        await axiosInstance.put(`/admin/prompts/${formState.id}`, payload);
        setFormSuccess("Prompt updated successfully.");
      } else {
        await axiosInstance.post("/admin/prompts", payload);
        setFormSuccess("Prompt created successfully.");
      }
      await refreshPrompts();
      setTimeout(() => {
        setIsModalOpen(false);
        setFormState(null);
        setFormSuccess("");
      }, 800);
    } catch (error: any) {
      console.error("Save failed", error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save prompt.";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPrompts = prompts.filter((row) => {
    const matchesSearch =
      row.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.prompt_text.toLowerCase().includes(searchText.toLowerCase());

    const matchesPackage =
      filterPackage === "all" ||
      (filterPackage === "global" && !row.package_id) ||
      (filterPackage !== "global" &&
        filterPackage !== "all" &&
        String(row.package_id) === filterPackage);

    const matchesStatus =
      filterStatus === "all" || row.status === filterStatus;

    const matchesType =
      filterType === "all" || row.prompt_type === filterType;

    return matchesSearch && matchesPackage && matchesStatus && matchesType;
  });

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },
    {
      field: "title",
      headerName: "Title",
      width: 220,
      renderCell: (params) => (
        <span className="prompts-title-cell">{params.value || "(untitled)"}</span>
      ),
    },
    {
      field: "package_id",
      headerName: "Package",
      width: 180,
      renderCell: (params) => {
        if (!params.value) return <span className="prompts-pill">Global</span>;
        const label = packageLabelById.get(params.value) || `#${params.value}`;
        return <span className="prompts-pill alt">{label}</span>;
      },
    },
    {
      field: "prompt_type",
      headerName: "Type",
      width: 150,
      renderCell: () => (
        <span className="prompts-type-chip">full_analysis</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <span
          className={`table-active-status-badge ${
            params.value === "active" ? "active" : "disabled"
          }`}
        >
          {params.value === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "visibility",
      headerName: "Toggle",
      width: 120,
      renderCell: (params) => (
        <div
          className={`toggle-switch ${
            params.row.status === "active" ? "active" : "inactive"
          }`}
          onClick={async () => {
            const nextStatus =
              params.row.status === "active" ? "inactive" : "active";
            try {
              await axiosInstance.put(`/admin/prompts/${params.row.id}`, {
                status: nextStatus,
              });
              setPrompts((prev) =>
                prev.map((item) =>
                  item.id === params.row.id
                    ? { ...item, status: nextStatus }
                    : item
                )
              );
            } catch (error) {
              console.error("Status update failed", error);
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="toggle-knob" />
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => {
        const canEdit = hasPermission("prompt.edit");
        const canDelete = hasPermission("prompt.delete");
        
        return (
          <div className="table-acton-button" style={{ display: "flex", gap: "10px", justifyContent: "center", width: "100%", paddingTop: "10px" }}>
            <TbEdit
              size={20}
              style={{
                cursor: canEdit ? "pointer" : "not-allowed",
                opacity: canEdit ? 1 : 0.5,
              }}
              title={canEdit ? "Edit" : "No permission to edit prompts"}
              onClick={() => canEdit && handleEditClick(params.row as PromptRow)}
            />
            <AiFillDelete
              size={20}
              color={canDelete ? "red" : "gray"}
              title={canDelete ? "Delete" : "No permission to delete prompts"}
              style={{
                cursor: canDelete ? "pointer" : "not-allowed",
                opacity: canDelete ? 1 : 0.5,
              }}
              onClick={() => canDelete && handleDeleteClick((params.row as PromptRow).id)}
            />
          </div>
        );
      },
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
                placeholder="Search prompts..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <button
              onClick={handleCreateClick}
              disabled={!hasPermission("prompt.create")}
              title={!hasPermission("prompt.create") ? "You don't have permission to create prompts" : "Create new prompt"}
              style={{
                opacity: hasPermission("prompt.create") ? 1 : 0.6,
                cursor: hasPermission("prompt.create") ? "pointer" : "not-allowed",
              }}
            >
              Create Prompt
            </button>
          </div>
        </div>

        <div className="prompts-filter-bar">
          <div className="prompts-filter-group">
            <label>Package</label>
            <select
              value={filterPackage}
              onChange={(e) => setFilterPackage(e.target.value)}
            >
              <option value="all">All</option>
              <option value="global">Global</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={String(pkg.id)}>
                  {pkg.title}
                </option>
              ))}
            </select>
          </div>
          <div className="prompts-filter-group">
            <label>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="prompts-filter-group">
            <label>Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="full_analysis">full_analysis</option>
            </select>
          </div>
          <div className="prompts-filter-actions">
            <button
              className="prompts-filter-reset"
              onClick={() => {
                setFilterPackage("all");
                setFilterStatus("all");
                setFilterType("all");
              }}
            >
              Reset filters
            </button>
          </div>
        </div>

        <div className="admin-table-section-smart-ai">
          <PageLoader isLoading={isLoading} />
          <div>
            <DataGrid
              rows={filteredPrompts}
              columns={columns}
              getRowId={(row) => row.id}
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

      {isModalOpen && formState && (
        <div className="prompts-modal-overlay">
          <div className="prompts-modal">
            <div className="prompts-modal-header">
              <h3>{formState.id ? "Edit Prompt" : "Create Prompt"}</h3>
              <button
                className="prompts-close"
                onClick={() => setIsModalOpen(false)}
              >
                X
              </button>
            </div>

            <div className="prompts-modal-body">
              <div className="prompts-form-row">
                <div className="prompts-form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formState.title}
                    onChange={(e) =>
                      setFormState({ ...formState, title: e.target.value })
                    }
                    placeholder="Optional title"
                  />
                </div>
                <div className="prompts-form-group">
                  <label>Prompt Type</label>
                  <input type="text" value="full_analysis" disabled />
                </div>
              </div>

              <div className="prompts-form-row">
                <div className="prompts-form-group">
                  <label>Package</label>
                  <select
                    value={formState.package_id}
                    onChange={(e) =>
                      setFormState({ ...formState, package_id: e.target.value })
                    }
                  >
                    <option value="global">Global (all packages)</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={String(pkg.id)}>
                        {pkg.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="prompts-form-group">
                  <label>Status</label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        status: e.target.value as "active" | "inactive",
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="prompts-form-group">
                  <label>Version</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formState.version}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        version: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="prompts-form-group full">
                <label>Prompt Text</label>
                <textarea
                  value={formState.prompt_text}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      prompt_text: e.target.value,
                    })
                  }
                  placeholder="Write the prompt..."
                />
                {formSuccess && (
                  <div className="prompts-success">{formSuccess}</div>
                )}
                {formError && <div className="prompts-error">{formError}</div>}
              </div>
            </div>

            <div className="prompts-modal-actions">
              <button className="prompts-save" onClick={handleFormSubmit}>
                {isSaving ? "Saving..." : formState.id ? "Update" : "Create"}
              </button>
              <button
                className="prompts-cancel"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModel
        isOpen={showDeleteModal}
        title="Delete Prompt?"
        message="Are you sure you want to delete this prompt? It will be set to inactive."
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default PromptsPage;
