import { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ShortLink from "../../common/ShortLinkDashboard";
import { useNavigate, useLocation } from "react-router-dom";
import { TbEdit } from "react-icons/tb";
import { AiFillDelete, AiFillStar, AiOutlineStar } from "react-icons/ai";
import { useAdminPermissions } from "../../utils/useAdminPermissions";
import ModuleAccessDenied from "../../components/common/ModuleAccessDenied";
import { FaSearch, FaClock } from "react-icons/fa";
import axiosInstance from "../../utils/baseUrl";
import { format } from "date-fns";
import DeleteConfirmModel from "../../common/DeleteConfirmModal";
import { toast } from "react-toastify";
import CustomPlanRequestModal from "../../components/adminDashboard/CustomPlanRequestModal";

const PlanPages = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [planList, setPlanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Custom Plan Requests State
  const [showCustomRequests, setShowCustomRequests] = useState(false);
  const [customRequests, setCustomRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(false);

  // Get admin permissions
  const { hasPermission } = useAdminPermissions();

  const fetchAndStorePlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/package");
      
      if (res.data.success && res.data.data) {
        const formattedPlans = res.data.data.map((plan: any) => ({
          _id: plan.id?.toString() || plan._id?.toString() || Math.random().toString(),
          id: plan.id,
          title: plan.name || plan.title || "",
          packageType: plan.package_type || plan.packageType || "",
          packageDuration: plan.package_duration || plan.packageDuration || "",
          price: plan.price || 0,
          packageCurrency: plan.package_currency || plan.packageCurrency || "",
          active: plan.is_active || plan.active || false,
          is_custom: plan.is_custom || false,
          is_public: plan.is_public !== undefined ? plan.is_public : true,
          is_template: plan.is_template || false,
          assigned_to_user_id: plan.assigned_to_user_id,
          createDate: plan.created_at || plan.createDate || new Date(),
          text_to_image_limit: plan.text_to_image_limit || 0,
          image_limit: plan.image_limit || 0,
          image_caption_limit: plan.image_caption_limit || 0,
          ai_chat_limit: plan.ai_chat_limit || 0,
          image_to_audio_limit: plan.image_to_audio_limit || 0,
          scratch_to_code_limit: plan.scratch_to_code_limit || 0,
          grammar_checking_limit: plan.grammar_checking_limit || 0,
          text_to_paraphraser_limit: plan.text_to_paraphraser_limit || 0,
          ai_chat_assistant_limit: plan.ai_chat_assistant_limit || 0,
          ai_template_limit: plan.ai_template_limit || 0,
          edit_audio_limit: plan.edit_audio_limit || 0,
          tts_audio_limit: plan.tts_audio_limit || 0,
          video_to_text_limit: plan.video_to_text_limit || 0,
          ai_vision_limit: plan.ai_vision_limit || 0,
          web_scripting_limit: plan.web_scripting_limit || 0,
          ai_rewriter_limit: plan.ai_rewriter_limit || 0,
          speech_to_text_limit: plan.speech_to_text_limit || 0,
          ai_voiceover_limit: plan.ai_voiceover_limit || 0,
          ai_code_generate_limit: plan.ai_code_generate_limit || 0,
          ai_mcp_smart_mailer_limit: plan.ai_mcp_smart_mailer_limit || 0,
          personal_data_analyze_limit: plan.personal_data_analyze_limit || 0,
          team_member_limit: plan.team_member_limit || 0,
        }));
        
        setPlanList(formattedPlans);
        sessionStorage.setItem("planList", JSON.stringify(formattedPlans));
      } else {
        await fetchOldEndpoint();
      }
    } catch (error) {
      console.error("New API failed, trying old endpoint:", error);
      await fetchOldEndpoint();
    } finally {
      setLoading(false);
    }
  };

  const fetchOldEndpoint = async () => {
    try {
      const res = await axiosInstance.get("/readPackageListAdmin");

      if (res.data.data) {
        const { monthlyData = [], yearlyData = [], lifeTimeData = [] } = res.data.data;

        const combinedPlans = [
          ...monthlyData.map((plan: any) => ({
            ...plan,
            packageDuration: "Monthly",
            is_custom: plan.is_custom || false,
            is_public: plan.is_public !== undefined ? plan.is_public : true,
            is_template: plan.is_template || false,
          })),
          ...yearlyData.map((plan: any) => ({
            ...plan,
            packageDuration: "Yearly",
            is_custom: plan.is_custom || false,
            is_public: plan.is_public !== undefined ? plan.is_public : true,
            is_template: plan.is_template || false,
          })),
          ...lifeTimeData.map((plan: any) => ({
            ...plan,
            packageDuration: "Lifetime",
            is_custom: plan.is_custom || false,
            is_public: plan.is_public !== undefined ? plan.is_public : true,
            is_template: plan.is_template || false,
          })),
        ];

        setPlanList(combinedPlans);
        sessionStorage.setItem("planList", JSON.stringify(combinedPlans));
      }
    } catch (oldError) {
      console.error("Old endpoint also failed:", oldError);
      setError("Failed to load plans. Please try again later.");
    }
  };

  // Fetch Custom Plan Requests
  const fetchCustomRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await axiosInstance.get("/admin/custom-plans/requests");
      if (res.data.success) {
        setCustomRequests(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching custom requests:", error);
      toast.error("Failed to load custom plan requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (location.state?.refresh) {
      fetchAndStorePlans();
    } else {
      const cached = sessionStorage.getItem("planList");
      if (cached) {
        setPlanList(JSON.parse(cached));
        setLoading(false);
      } else {
        fetchAndStorePlans();
      }
    }
    
    // Fetch custom requests on mount
    fetchCustomRequests();
  }, [location.state]);

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      await axiosInstance.patch(`/package/${id}/status`, {
        is_active: newStatus,
      });
      
      setPlanList(prev => prev.map(plan => 
        plan._id === id ? { ...plan, active: newStatus } : plan
      ));
      
      const updatedList = planList.map(plan => 
        plan._id === id ? { ...plan, active: newStatus } : plan
      );
      sessionStorage.setItem("planList", JSON.stringify(updatedList));
      
    } catch (error) {
      console.error("Visibility toggle failed:", error);
      try {
        await axiosInstance.post("/showHidePackage", {
          id,
          active: newStatus,
        });
        fetchAndStorePlans();
      } catch (oldError) {
        console.error("Old endpoint also failed:", oldError);
      }
    }
  };

  const toggleTemplateStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      await axiosInstance.patch(`/package/${id}`, {
        is_template: newStatus ? 1 : 0,
      });
      
      setPlanList(prev => prev.map(plan => 
        plan._id === id ? { ...plan, is_template: newStatus } : plan
      ));
      
      const updatedList = planList.map(plan => 
        plan._id === id ? { ...plan, is_template: newStatus } : plan
      );
      sessionStorage.setItem("planList", JSON.stringify(updatedList));
      
      toast.success(`Plan ${newStatus ? 'marked as requestable' : 'removed from requestable'} successfully`);
    } catch (error) {
      console.error("Failed to toggle template status:", error);
      toast.error("Failed to update template status");
    }
  };

  const togglePublicStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      await axiosInstance.patch(`/package/${id}`, {
        is_public: newStatus ? 1 : 0,
      });
      
      setPlanList(prev => prev.map(plan => 
        plan._id === id ? { ...plan, is_public: newStatus } : plan
      ));
      
      const updatedList = planList.map(plan => 
        plan._id === id ? { ...plan, is_public: newStatus } : plan
      );
      sessionStorage.setItem("planList", JSON.stringify(updatedList));
      
      toast.success(`Plan ${newStatus ? 'now public' : 'now private'} successfully`);
    } catch (error) {
      console.error("Failed to toggle public status:", error);
      toast.error("Failed to update public status");
    }
  };

  const handleDeletePlan = (id: string) => {
    setSelectedAnnouncementId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedAnnouncementId) return;

    try {
      const res = await axiosInstance.delete(`/package/${selectedAnnouncementId}`);
      
      if (res.status === 200 || res.data.success) {
        const updatedList = planList.filter(
          (plan) => plan._id !== selectedAnnouncementId
        );
        setPlanList(updatedList);
        sessionStorage.setItem("planList", JSON.stringify(updatedList));
        toast.success("Plan deleted successfully");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      try {
        const res = await axiosInstance.delete(
          `/packageDelete/${selectedAnnouncementId}`
        );
        if (res.status === 200) {
          const updatedList = planList.filter(
            (plan) => plan._id !== selectedAnnouncementId
          );
          setPlanList(updatedList);
          sessionStorage.setItem("planList", JSON.stringify(updatedList));
          toast.success("Plan deleted successfully");
        }
      } catch (oldError) {
        console.error("Old endpoint also failed:", oldError);
        toast.error("Failed to delete plan");
      }
    } finally {
      setShowDeleteModal(false);
      setSelectedAnnouncementId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedAnnouncementId(null);
  };

  // Handle Approve Request
  const handleApproveRequest = async (request: any, planData?: any) => {
    try {
      setProcessingRequest(true);
      
      const payload: any = {
        adminNotes: request.admin_notes || "Approved by admin"
      };

      if (request.request_type === 'custom' && planData) {
        payload.planData = planData;
      }

      const res = await axiosInstance.post(
        `/admin/custom-plans/requests/${request.id}/approve`,
        payload
      );

      if (res.data.success) {
        toast.success("Custom plan request approved successfully");
        setShowRequestModal(false);
        setSelectedRequest(null);
        fetchCustomRequests(); // Refresh list
      }
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setProcessingRequest(false);
    }
  };

  // Handle Reject Request
  const handleRejectRequest = async (request: any, adminNotes: string) => {
    try {
      setProcessingRequest(true);
      
      const res = await axiosInstance.post(
        `/admin/custom-plans/requests/${request.id}/reject`,
        { adminNotes }
      );

      if (res.data.success) {
        toast.success("Custom plan request rejected");
        setShowRequestModal(false);
        setSelectedRequest(null);
        fetchCustomRequests(); // Refresh list
      }
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setProcessingRequest(false);
    }
  };

  const columns: GridColDef[] = [
    { 
      field: "title", 
      headerName: "Plan Name", 
      width: 200,
      renderCell: ({ row }) => (
        <div>
          {row.title}
          {row.is_custom && (
            <span style={{
              marginLeft: '8px',
              background: '#ff9800',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              CUSTOM
            </span>
          )}
        </div>
      )
    },
    { field: "packageType", headerName: "Plan Type", width: 150 },
    { field: "packageDuration", headerName: "Duration", width: 120 },
    {
      field: "priceAndCurrency",
      headerName: "Price",
      width: 150,
      renderCell: ({ row }) => (
        <div>
          {row.price && row.packageCurrency
            ? `${row.packageCurrency} ${row.price}`
            : "-"}
        </div>
      ),
    },
    {
      field: "planFlags",
      headerName: "Flags",
      width: 200,
      renderCell: ({ row }) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {row.is_custom ? (
            <span style={{
              background: '#ff9800',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              Custom
            </span>
          ) : (
            <>
              <span style={{
                background: row.is_public ? '#28a745' : '#6c757d',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                {row.is_public ? 'Public' : 'Private'}
              </span>
              <span style={{
                background: row.is_template ? '#007bff' : '#6c757d',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                {row.is_template ? 'Requestable' : 'Not Requestable'}
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      field: "createDate",
      headerName: "Create Date",
      width: 150,
      renderCell: (params) => {
        if (!params.value) return "-";
        try {
          return <span>{format(new Date(params.value), "MM/dd/yy")}</span>;
        } catch {
          return "-";
        }
      },
    },
    {
      field: "active",
      headerName: "Status",
      width: 120,
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
      renderCell: (params) => (
        <div
          className={`toggle-switch ${
            params.row.active ? "active" : "inactive"
          }`}
          onClick={() => toggleVisibility(params.row._id, params.row.active)}
          style={{ cursor: "pointer" }}
        >
          <div className="toggle-knob"></div>
        </div>
      ),
    },
    {
      field: "requestable",
      headerName: "Requestable",
      width: 120,
      renderCell: (params) => (
        !params.row.is_custom && (
          <div
            style={{ 
              cursor: hasPermission("package.edit") ? "pointer" : "not-allowed",
              opacity: hasPermission("package.edit") ? 1 : 0.5
            }}
            onClick={() => hasPermission("package.edit") && toggleTemplateStatus(params.row._id, params.row.is_template || false)}
            title={params.row.is_template ? "Users can request this plan" : "Users cannot request this plan"}
          >
            {params.row.is_template ? (
              <AiFillStar size={24} color="#ffc107" />
            ) : (
              <AiOutlineStar size={24} color="#6c757d" />
            )}
          </div>
        )
      ),
    },
    {
      field: "public",
      headerName: "Public",
      width: 100,
      renderCell: (params) => (
        !params.row.is_custom && (
          <div
            style={{ 
              cursor: hasPermission("package.edit") ? "pointer" : "not-allowed",
              opacity: hasPermission("package.edit") ? 1 : 0.5
            }}
            onClick={() => hasPermission("package.edit") && togglePublicStatus(params.row._id, params.row.is_public || false)}
            title={params.row.is_public ? "Visible in pricing table" : "Hidden from pricing table"}
          >
            <div className={`toggle-switch ${params.row.is_public ? "active" : "inactive"}`} style={{ transform: 'scale(0.8)' }}>
              <div className="toggle-knob"></div>
            </div>
          </div>
        )
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div
          className="table-acton-button"
          style={{ display: "flex", gap: "10px", paddingTop: "10px" }}
        >
          <TbEdit
            size={20}
            style={{
              cursor: hasPermission("package.edit") ? "pointer" : "not-allowed",
              opacity: hasPermission("package.edit") ? 1 : 0.5,
            }}
            title={hasPermission("package.edit") ? "Edit" : "You don't have permission to edit plans"}
            onClick={() =>
              hasPermission("package.edit") && navigate("/admin-create-plan", {
                state: {
                  editData: params.row,
                },
              })
            }
          />
          <AiFillDelete
            size={20}
            color="red"
            title={hasPermission("package.delete") ? "Delete" : "You don't have permission to delete plans"}
            style={{
              cursor: hasPermission("package.delete") ? "pointer" : "not-allowed",
              opacity: hasPermission("package.delete") ? 1 : 0.5,
            }}
            onClick={() => hasPermission("package.delete") && handleDeletePlan(params.row._id)}
          />
        </div>
      ),
    },
  ];

  // Filter plans based on search
  const filteredPlans = planList.filter(plan =>
    plan.title?.toLowerCase().includes(searchKeyWord.toLowerCase()) ||
    plan.packageType?.toLowerCase().includes(searchKeyWord.toLowerCase()) ||
    plan.packageDuration?.toLowerCase().includes(searchKeyWord.toLowerCase())
  );

  if (loading) {
    return (
      <div className="main-content-common">
        <div className="global-link-limit-section">
          <ShortLink />
        </div>
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content-common">
        <div className="global-link-limit-section">
          <ShortLink />
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchAndStorePlans} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check module-level access
  if (!hasPermission("package.view")) {
    return (
      <ModuleAccessDenied
        moduleName="Plans/Packages"
        description="You need at least view permission to access this module."
      />
    );
  }

  return (
    <div className="main-content-common">
      <div className="global-link-limit-section">
        <div className="short-link-text">
          <ShortLink />
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="admin-dashboard-search-field-smart-ai">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search plan..."
                value={searchKeyWord}
                onChange={(e) => setSearchKeyWord(e.target.value)}
              />
            </div>
          </div>
          
          {/* Custom Requests Button */}
          {hasPermission("custom_plans.view") && (
            <button
              onClick={() => setShowCustomRequests(!showCustomRequests)}
              className="btn btn-info"
              style={{
                background: showCustomRequests ? '#28a745' : '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <FaClock />
              {showCustomRequests ? 'Hide Requests' : 'Custom Plan Requests'} 
              {customRequests.length > 0 && !showCustomRequests && (
                <span style={{
                  background: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '12px',
                  marginLeft: '5px'
                }}>
                  {customRequests.length}
                </span>
              )}
            </button>
          )}
          
          <button
            onClick={() => navigate("/admin-create-plan")}
            disabled={!hasPermission("package.create")}
            title={hasPermission("package.create") ? "" : "You don't have permission to create plans"}
            style={{
              opacity: hasPermission("package.create") ? 1 : 0.5,
              cursor: hasPermission("package.create") ? "pointer" : "not-allowed",
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px'
            }}
          >
            Create New Plan
          </button>
        </div>
      </div>

      {/* Custom Plan Requests Section */}
      {showCustomRequests && (
        <div style={{ marginBottom: '30px', padding: '20px', background: '#1e1e1e', borderRadius: '10px' }}>
          <h3 style={{ color: 'white', marginBottom: '20px' }}>Custom Plan Requests</h3>
          {loadingRequests ? (
            <div className="loading-spinner-container">
              <div className="spinner"></div>
              <p>Loading requests...</p>
            </div>
          ) : customRequests.length === 0 ? (
            <p style={{ color: '#ccc', textAlign: 'center' }}>No custom plan requests found</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#2a2a2a', color: '#fff' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Request Date</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customRequests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid #444' }}>
                      <td style={{ padding: '12px', color: '#e0e0e0' }}>
                        <div>{req.user_name}</div>
                        <small style={{ color: '#aaa' }}>{req.user_email}</small>
                      </td>
                      <td style={{ padding: '12px', color: '#e0e0e0' }}>
                        {req.request_type === 'existing_plan' ? 'Existing Plan' : 'Custom Plan'}
                        {req.existing_package_title && (
                          <div><small>Plan: {req.existing_package_title}</small></div>
                        )}
                      </td>
                      <td style={{ padding: '12px', color: '#e0e0e0' }}>
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: req.status === 'pending' ? '#ffc107' :
                                     req.status === 'approved' ? '#28a745' :
                                     req.status === 'rejected' ? '#dc3545' : '#6c757d',
                          color: 'white'
                        }}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {req.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setShowRequestModal(true);
                              }}
                              style={{
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              View & Process
                            </button>
                          </div>
                        )}
                        {req.status !== 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setShowRequestModal(true);
                            }}
                            style={{
                              background: '#6c757d',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {filteredPlans.length === 0 && !loading ? (
        <div className="no-data-message">
          <p>No plans found. {searchKeyWord && "Try a different search term."}</p>
          <button
            onClick={() => navigate("/admin-create-plan")}
            disabled={!hasPermission("package.create")}
            title={hasPermission("package.create") ? "" : "You don't have permission to create plans"}
            style={{
              opacity: hasPermission("package.create") ? 1 : 0.5,
              cursor: hasPermission("package.create") ? "pointer" : "not-allowed",
            }}
          >
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="admin-table-section-smart-ai">
          <DataGrid
            rows={filteredPlans}
            columns={columns}
            getRowId={(row) => row._id}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
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
              "& .MuiDataGrid-cell": {
                color: "#E2E8F0",
                borderColor: "rgba(71, 85, 105, 0.33)",
              },
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
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

      {/* Custom Plan Request Modal */}
      {showRequestModal && selectedRequest && (
        <CustomPlanRequestModal
          request={selectedRequest}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedRequest(null);
          }}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          processing={processingRequest}
        />
      )}
      
      <DeleteConfirmModel
        isOpen={showDeleteModal}
        title="Delete Plan?"
        message="Are you sure you want to remove this plan permanently? This action cannot be undone."
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default PlanPages;
