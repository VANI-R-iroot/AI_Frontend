import { useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { FaSearch, FaUserShield, FaUserSlash, FaEdit, FaClock } from "react-icons/fa";
import { HiOutlineDocumentArrowDown } from "react-icons/hi2";
import { RiLockPasswordLine } from "react-icons/ri";
import { MdOutlineSwitchAccount, MdOutlineWorkspacePremium } from "react-icons/md";
import { GrPlan } from "react-icons/gr";
import ShortLink from "../../common/ShortLinkDashboard";
import axiosInstance from "../../utils/baseUrl";
import PageLoader from "../../common/loader";
import { toast } from "react-toastify";
import { useAdminPermissions } from "../../utils/useAdminPermissions";
import "../../assets/css/adminDashboard/adminUsers.css";

type AdminUser = {
  id: string;
  name: string;
  user_name?: string;
  email: string;
  image?: string;
  auth?: string;
  plan?: string;
  status?: string;
  onboarding_completed?: number | boolean;
  job_role?: string;
  phone_number?: string;
  company_name?: string;
  company_website?: string;
  city?: string;
  country?: string;
  onboarding_company_name?: string;
  onboarding_company_website?: string;
  onboarding_state?: string;
  onboarding_city?: string;
  onboarding_country?: string;
  onboarding_contact_number?: string;
  onboarding_platform_type_id?: number | null;
  onboarding_platform_name?: string;
  onboarding_industry_type_id?: number | null;
  onboarding_industry_name?: string;
  registration_date?: string;
  last_login?: string;
  token_used_total?: number;
  token_used_month?: number;
  products_generated_total?: number;
  products_generated_month?: number;
  credits_total?: number;
  creditsByFeature?: Record<string, number>;
  creditsLimitByFeature?: Record<string, number | null>;
  creditsRemainingByFeature?: Record<string, number | null>;
  package_title?: string;
  package_type?: string;
  package_duration?: string;
  price?: number;
  package_currency?: string;
  is_custom?: number;
  package_id?: number | string;
};

type CustomPlanFormData = {
  title: string;
  package_type: string;
  package_duration: string;
  package_currency: string;
  price: number;
  text_to_image_limit: number;
  image_limit: number;
  image_caption_limit: number;
  ai_chat_limit: number;
  image_to_audio_limit: number;
  scratch_to_code_limit: number;
  grammar_checking_limit: number;
  text_to_paraphraser_limit: number;
  ai_chat_assistant_limit: number;
  ai_template_limit: number;
  tts_audio_limit: number;
  video_to_text_limit: number;
  ai_vision_limit: number;
  web_scripting_limit: number;
  ai_rewriter_limit: number;
  speech_to_text_limit: number;
  ai_voiceover_limit: number;
  ai_code_generate_limit: number;
  ai_mcp_smart_mailer_limit: number;
  personal_data_analyze_limit: number;
  team_member_limit: number;
  notes: string;
  expires_at: string;
};

type PublicPlan = {
  id: number;
  title: string;
  package_type: string;
  package_duration: string;
  package_currency: string;
  price: number;
  is_custom?: number;
};

type CustomPlanRequestItem = {
  id: number;
  user_id: string;
  user_name?: string;
  user_email?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  user_notes?: string;
  admin_notes?: string;
  created_at?: string;
  reviewed_at?: string;
  approved_package_id?: number | null;
  payment_done?: number;
  payment_done_at?: string;
  payment_gateway?: string;
};

type UserPromptFormData = {
  title: string;
  package_id: string;
  prompt_text: string;
  prompt_type: "full_analysis";
  status: "active";
};

type UserProfileEditFormData = {
  name: string;
  user_name: string;
  email: string;
  job_role: string;
  phone_number: string;
  company_name: string;
  company_website: string;
  city: string;
  country: string;
};

const AdminUsersPage = () => {
  const formatDate = (value?: string | Date | null) => {
    if (!value) return "-";
    const normalized =
      typeof value === "string" ? value.replace(" ", "T") : value;
    const date = normalized instanceof Date ? normalized : new Date(normalized);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
  };

  const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "-";
    const normalized =
      typeof value === "string" ? value.replace(" ", "T") : value;
    const date = normalized instanceof Date ? normalized : new Date(normalized);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
  };

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [signupDate, setSignupDate] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionMenuUserId, setActionMenuUserId] = useState<string | null>(null);
  
  // Edit User Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [allPublicPlans, setAllPublicPlans] = useState<PublicPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [updatingUserPlan, setUpdatingUserPlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | number>("");
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [profilePlanId, setProfilePlanId] = useState<string | number>("");
  const [profileForm, setProfileForm] = useState<UserProfileEditFormData>({
    name: "",
    user_name: "",
    email: "",
    job_role: "",
    phone_number: "",
    company_name: "",
    company_website: "",
    city: "",
    country: "",
  });
  
  // Custom Plan State
  const [showCustomPlanModal, setShowCustomPlanModal] = useState(false);
  const [selectedUserForPlan, setSelectedUserForPlan] = useState<AdminUser | null>(null);
  const [customPlanForm, setCustomPlanForm] = useState<CustomPlanFormData>({
    title: "",
    package_type: "Custom",
    package_duration: "Monthly",
    package_currency: "USD",
    price: 0,
    text_to_image_limit: 0,
    image_limit: 0,
    image_caption_limit: 0,
    ai_chat_limit: 0,
    image_to_audio_limit: 0,
    scratch_to_code_limit: 0,
    grammar_checking_limit: 0,
    text_to_paraphraser_limit: 0,
    ai_chat_assistant_limit: 0,
    ai_template_limit: 0,
    tts_audio_limit: 0,
    video_to_text_limit: 0,
    ai_vision_limit: 0,
    web_scripting_limit: 0,
    ai_rewriter_limit: 0,
    speech_to_text_limit: 0,
    ai_voiceover_limit: 0,
    ai_code_generate_limit: 0,
    ai_mcp_smart_mailer_limit: 0,
    personal_data_analyze_limit: 0,
    team_member_limit: 0,
    notes: "",
    expires_at: "",
  });
  const [submittingPlan, setSubmittingPlan] = useState(false);
  const [publicPlans, setPublicPlans] = useState<any[]>([]);
  const [userCustomPlans, setUserCustomPlans] = useState<any[]>([]);
  const [showUserCustomPlans, setShowUserCustomPlans] = useState(false);
  const [loadingUserCustomPlans, setLoadingUserCustomPlans] = useState(false);
  const [cancellingCustomPlanId, setCancellingCustomPlanId] = useState<number | null>(null);
  const [reassigningCustomPlanId, setReassigningCustomPlanId] = useState<number | null>(null);
  const [editingCustomPlanId, setEditingCustomPlanId] = useState<number | null>(null);
  const [customPlanRequests, setCustomPlanRequests] = useState<CustomPlanRequestItem[]>([]);
  const [loadingCustomPlanRequests, setLoadingCustomPlanRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
  const [selectedApprovedRequest, setSelectedApprovedRequest] = useState<CustomPlanRequestItem | null>(null);
  const [showAdminCustomRequests, setShowAdminCustomRequests] = useState(false);
  const [selectedAdminRequest, setSelectedAdminRequest] = useState<CustomPlanRequestItem | null>(null);
  const [showAdminRequestDetailsModal, setShowAdminRequestDetailsModal] = useState(false);
  const [showCustomPromptModal, setShowCustomPromptModal] = useState(false);
  const [selectedUserForPrompt, setSelectedUserForPrompt] = useState<AdminUser | null>(null);
  const [creatingUserPrompt, setCreatingUserPrompt] = useState(false);
  const [selectedContextKey, setSelectedContextKey] = useState<string>("");
  const [userPromptForm, setUserPromptForm] = useState<UserPromptFormData>({
    title: "",
    package_id: "",
    prompt_text: "",
    prompt_type: "full_analysis",
    status: "active",
  });

  // Get admin permissions
  const { hasPermission } = useAdminPermissions();
  const canCancelCustomPlans =
    hasPermission("custom_plans.approve") || hasPermission("custom_plans.create");
  const canEditCustomPlans =
    hasPermission("custom_plans.approve") || hasPermission("custom_plans.create");
  const canReassignCustomPlans = hasPermission("custom_plans.approve");
  const profileInputStyle = {
    width: "100%",
    padding: "8px 10px",
    marginTop: "6px",
    background: "#111827",
    color: "#f8fafc",
    border: "1px solid #334155",
    borderRadius: "8px",
    fontSize: "13px",
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      console.log("[AdminUsers] Fetching users...", {
        page,
        pageSize,
        search,
        planFilter,
        statusFilter,
        signupDate,
      });
      const res = await axiosInstance.get("/admin/users", {
        params: {
          page,
          limit: pageSize,
          search: search || undefined,
          plan: planFilter || undefined,
          status: statusFilter || undefined,
          signupDate: signupDate || undefined,
          sortBy: "signupDate",
          order: "DESC",
        },
      });
      console.log("[AdminUsers] Users response", res.status, res.data);
      setUsers(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      console.error("[AdminUsers] Error details:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPublicPlans = async () => {
    try {
      setLoadingPlans(true);
      const res = await axiosInstance.get("/user/packages");
      if (res.data?.status === true || res.data?.success === true) {
        setPublicPlans(res.data.data || []);
        setAllPublicPlans(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch public plans:", error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchUserCustomPlans = async (userId: string) => {
    try {
      setLoadingUserCustomPlans(true);
      const res = await axiosInstance.get(`/admin/custom-plans/user/${userId}`);
      if (res.data.success) {
        const plans = res.data.data || [];
        setUserCustomPlans(plans);
        return plans;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch user custom plans:", error);
      toast.error("Failed to load user's custom plans");
      return [];
    } finally {
      setLoadingUserCustomPlans(false);
    }
  };

  const fetchCustomPlanRequests = async () => {
    if (!hasPermission("custom_plans.view")) {
      setCustomPlanRequests([]);
      return;
    }
    try {
      setLoadingCustomPlanRequests(true);
      const res = await axiosInstance.get("/admin/custom-plans/requests");
      if (res.data?.success) {
        setCustomPlanRequests(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch custom plan requests:", error);
      toast.error("Failed to load custom plan requests");
    } finally {
      setLoadingCustomPlanRequests(false);
    }
  };

  const handleAcceptRequest = async (request: CustomPlanRequestItem) => {
    try {
      setProcessingRequestId(request.id);
      const res = await axiosInstance.post(`/admin/custom-plans/requests/${request.id}/approve`, {
        adminNotes: "Accepted by admin",
      });

      if (res.data?.success) {
        toast.success("Request accepted. You can now assign a custom plan.");
        await fetchCustomPlanRequests();
      }
    } catch (error: any) {
      console.error("Failed to accept request:", error);
      toast.error(error.response?.data?.message || "Failed to accept request");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (request: CustomPlanRequestItem) => {
    try {
      setProcessingRequestId(request.id);
      const res = await axiosInstance.post(`/admin/custom-plans/requests/${request.id}/reject`, {
        adminNotes: "Rejected by admin",
      });

      if (res.data?.success) {
        toast.success("Request rejected");
        await fetchCustomPlanRequests();
      }
    } catch (error: any) {
      console.error("Failed to reject request:", error);
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setProcessingRequestId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPublicPlans();
    fetchCustomPlanRequests();
  }, [page, pageSize]);

  useEffect(() => {
    if (!selectedAdminRequest) return;
    const latest = customPlanRequests.find((req) => req.id === selectedAdminRequest.id);
    if (latest) {
      setSelectedAdminRequest(latest);
    }
  }, [customPlanRequests, selectedAdminRequest]);

  useEffect(() => {
    if (!actionMenuUserId) return;
    const closeMenu = () => setActionMenuUserId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [actionMenuUserId]);

  useEffect(() => {
    if (!selectedUser) {
      setIsProfileEditMode(false);
      setProfilePlanId("");
      setProfileForm({
        name: "",
        user_name: "",
        email: "",
        job_role: "",
        phone_number: "",
        company_name: "",
        company_website: "",
        city: "",
        country: "",
      });
      return;
    }
    setIsProfileEditMode(false);
    setProfilePlanId(selectedUser.package_id || "");
    setProfileForm({
      name: selectedUser.name || "",
      user_name: selectedUser.user_name || "",
      email: selectedUser.email || "",
      job_role: selectedUser.job_role || "",
      phone_number: selectedUser.phone_number || "",
      company_name: selectedUser.company_name || "",
      company_website: selectedUser.company_website || "",
      city: selectedUser.city || "",
      country: selectedUser.country || "",
    });
  }, [selectedUser]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleResetFilters = () => {
    setSearch("");
    setPlanFilter("");
    setStatusFilter("");
    setSignupDate("");
    setPage(1);
    fetchUsers();
  };

  const handleStatusToggle = async (user: AdminUser) => {
    const nextStatus = user.status === "suspended" ? "active" : "suspended";
    try {
      await axiosInstance.patch(`/admin/users/${user.id}/status`, {
        status: nextStatus,
      });
      toast.success(`User ${nextStatus}`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleResetPassword = async (user: AdminUser) => {
    const confirm = window.confirm(
      `Reset password for ${user.email}? A temporary password will be generated.`
    );
    if (!confirm) return;
    try {
      const res = await axiosInstance.post(`/admin/users/${user.id}/reset-password`);
      const tempPassword = res.data?.tempPassword;
      if (tempPassword) {
        window.alert(`Temporary password for ${user.email}: ${tempPassword}`);
        toast.success("Temporary password generated");
      } else {
        toast.info("Password reset successfully");
      }
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast.error("Failed to reset password");
    }
  };

  const handleImpersonate = async (user: AdminUser) => {
    const confirm = window.confirm(
      `Impersonate ${user.email}? This will open user session in this browser.`
    );
    if (!confirm) return;
    try {
      await axiosInstance.post(`/admin/users/${user.id}/impersonate`);
      toast.success("Impersonation session started");
      window.open("/dashboard?impersonate=1", "_blank");
    } catch (error) {
      console.error("Failed to impersonate:", error);
      toast.error("Failed to impersonate");
    }
  };

  const handleExport = async () => {
    try {
      const res = await axiosInstance.get("/admin/users/export", {
        params: {
          search: search || undefined,
          plan: planFilter || undefined,
          status: statusFilter || undefined,
          signupDate: signupDate || undefined,
        },
      });

      const rows = res.data?.data || [];
      const headers = [
        "Name",
        "Email",
        "Plan",
        "Status",
        "Signup Date",
        "Last Login",
        "Plan Type",
      ];
      const csvRows = [
        headers.join(","),
        ...rows.map((row: AdminUser) =>
          [
            row.name || "",
            row.email || "",
            row.package_title || row.plan || "",
            row.status || "",
            row.registration_date || "",
            row.last_login || "",
            row.is_custom ? "Custom Plan" : "Public Plan",
          ]
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        ),
      ];

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users-export.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export users:", error);
      toast.error("Export failed");
    }
  };

  const fetchFreshUser = async (userId: string) => {
    const res = await axiosInstance.get(`/admin/users/${userId}`);
    return (res.data?.data || null) as AdminUser | null;
  };

  const handleViewUser = async (user: AdminUser) => {
    try {
      const fresh = await fetchFreshUser(user.id);
      setSelectedUser(fresh || user);
      setActionMenuUserId(null);
    } catch (error) {
      console.error("Failed to load user details:", error);
      toast.error("Failed to load user details");
    }
  };

  const handleOpenCustomPromptModal = async (user: AdminUser) => {
    try {
      await fetchPublicPlans();
      const fresh = await fetchFreshUser(user.id);
      const userData = fresh || user;
      setSelectedUserForPrompt(userData);
      setUserPromptForm({
        title: `Custom Prompt - ${userData.name || userData.email}`,
        package_id: userData.package_id ? String(userData.package_id) : "",
        prompt_text: "",
        prompt_type: "full_analysis",
        status: "active",
      });
      setSelectedContextKey("");
      setShowCustomPromptModal(true);
      setActionMenuUserId(null);
    } catch (error) {
      console.error("Failed to prepare custom prompt:", error);
      toast.error("Failed to open custom prompt");
    }
  };

  const appendUserContextToPrompt = (label: string, value: string | number | boolean | null | undefined) => {
    const safeValue =
      value === null || value === undefined || value === ""
        ? "N/A"
        : typeof value === "boolean"
        ? value
          ? "Yes"
          : "No"
        : String(value);

    setUserPromptForm((prev) => {
      const line = `${label}: ${safeValue}`;
      const nextText = prev.prompt_text?.trim() ? `${prev.prompt_text}\n${line}` : line;
      return { ...prev, prompt_text: nextText };
    });
  };

  const handleCreateUserPrompt = async () => {
    if (!selectedUserForPrompt) return;
    if (!userPromptForm.prompt_text.trim()) {
      toast.error("Prompt text is required");
      return;
    }

    try {
      setCreatingUserPrompt(true);
      const directUserTitle =
        userPromptForm.title?.trim() || `Custom Prompt - ${selectedUserForPrompt.email}`;
      const userTag = `[[USER_ID:${selectedUserForPrompt.id}]]`;
      const taggedPromptText = `${userPromptForm.prompt_text.trim()}\n${userTag}`;
      const payload = {
        title: directUserTitle,
        package_id: selectedUserForPrompt.package_id
          ? Number(selectedUserForPrompt.package_id)
          : userPromptForm.package_id
          ? Number(userPromptForm.package_id)
          : null,
        prompt_text: taggedPromptText,
        prompt_type: "full_analysis",
        status: "active",
      };

      const res = await axiosInstance.post("/admin/prompts", payload);
      if (res.data?.status === "success") {
        toast.success("Custom prompt created successfully");
        setShowCustomPromptModal(false);
      } else {
        toast.error(res.data?.message || "Failed to create custom prompt");
      }
    } catch (error: any) {
      console.error("Failed to create custom prompt:", error);
      toast.error(error?.response?.data?.message || "Failed to create custom prompt");
    } finally {
      setCreatingUserPrompt(false);
    }
  };

  // ============= EDIT USER FUNCTIONS =============
  const handleEditUser = async (user: AdminUser) => {
    try {
      // Fetch fresh user data
      const res = await axiosInstance.get(`/admin/users/${user.id}`);
      const userData = res.data?.data || user;
      setEditingUser(userData);
      setSelectedPlanId(userData.package_id || "");
      setShowEditModal(true);
      setActionMenuUserId(null);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to load user details");
    }
  };

  const handleEditFromProfile = async () => {
    if (!selectedUser) return;
    setIsProfileEditMode(true);
    setProfilePlanId(selectedUser.package_id || "");
    if (!allPublicPlans.length) {
      fetchPublicPlans();
    }
  };

  const handleProfileFieldChange = (
    field: keyof UserProfileEditFormData,
    value: string
  ) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfileEdit = async () => {
    if (!selectedUser) return;

    try {
      setUpdatingUserPlan(true);
      await axiosInstance.patch(`/admin/users/${selectedUser.id}`, {
        name: profileForm.name.trim(),
        user_name: profileForm.user_name.trim(),
        email: profileForm.email.trim(),
        job_role: profileForm.job_role.trim(),
        phone_number: profileForm.phone_number.trim(),
        company_name: profileForm.company_name.trim(),
        company_website: profileForm.company_website.trim(),
        city: profileForm.city.trim(),
        country: profileForm.country.trim(),
      });

      const currentPlanId = selectedUser.package_id ? String(selectedUser.package_id) : "";
      const nextPlanId = profilePlanId ? String(profilePlanId) : "";
      const shouldUpdatePlan = !!nextPlanId && nextPlanId !== currentPlanId;

      if (shouldUpdatePlan) {
        let planSource = allPublicPlans;
        if (!planSource.length) {
          const planRes = await axiosInstance.get("/user/packages");
          const fetchedPlans =
            planRes.data?.data && (planRes.data?.status === true || planRes.data?.success === true)
              ? planRes.data.data
              : [];
          setPublicPlans(fetchedPlans);
          setAllPublicPlans(fetchedPlans);
          planSource = fetchedPlans;
        }

        const selectedPlan = planSource.find(
          (p: PublicPlan) => p.id.toString() === nextPlanId
        );

        if (!selectedPlan) {
          toast.error("Selected plan not found");
          return;
        }

        await axiosInstance.patch(`/admin/users/${selectedUser.id}/plan`, {
          package_id: nextPlanId,
          plan_title: selectedPlan.title,
          plan_type: selectedPlan.package_type,
          plan_duration: selectedPlan.package_duration,
        });
      }

      const fresh = await fetchFreshUser(selectedUser.id);
      setSelectedUser(fresh || selectedUser);
      setIsProfileEditMode(false);
      toast.success("User updated successfully");
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to update user from profile:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setUpdatingUserPlan(false);
    }
  };

  const handleUpdateUserPlan = async () => {
    if (!editingUser) return;
    if (!selectedPlanId) {
      toast.error("Please select a plan");
      return;
    }

    try {
      setUpdatingUserPlan(true);
      
      // Find the selected plan details
      const selectedPlan = allPublicPlans.find(p => p.id.toString() === selectedPlanId.toString());
      
      if (!selectedPlan) {
        toast.error("Selected plan not found");
        return;
      }

      // Directly update user's package_id
      await axiosInstance.patch(`/admin/users/${editingUser.id}/plan`, {
        package_id: selectedPlanId,
        plan_title: selectedPlan.title,
        plan_type: selectedPlan.package_type,
        plan_duration: selectedPlan.package_duration
      });

      toast.success(`User plan updated to ${selectedPlan.title} successfully`);
      setShowEditModal(false);
      fetchUsers(); // Refresh the users list
      
    } catch (error: any) {
      console.error("Failed to update user plan:", error);
      toast.error(error.response?.data?.message || "Failed to update user plan");
    } finally {
      setUpdatingUserPlan(false);
    }
  };

  const handleOpenCustomPlanModal = (user: AdminUser, request?: CustomPlanRequestItem | null) => {
    setEditingCustomPlanId(null);
    setSelectedUserForPlan(user);
    setSelectedApprovedRequest(request || approvedUnassignedRequestByUserId.get(user.id) || null);
    setCustomPlanForm({
      title: `Custom Plan - ${user.name || user.email}`,
      package_type: "Custom",
      package_duration: "Monthly",
      package_currency: "USD",
      price: 0,
      text_to_image_limit: 0,
      image_limit: 0,
      image_caption_limit: 0,
      ai_chat_limit: 0,
      image_to_audio_limit: 0,
      scratch_to_code_limit: 0,
      grammar_checking_limit: 0,
      text_to_paraphraser_limit: 0,
      ai_chat_assistant_limit: 0,
      ai_template_limit: 0,
      tts_audio_limit: 0,
      video_to_text_limit: 0,
      ai_vision_limit: 0,
      web_scripting_limit: 0,
      ai_rewriter_limit: 0,
      speech_to_text_limit: 0,
      ai_voiceover_limit: 0,
      ai_code_generate_limit: 0,
      ai_mcp_smart_mailer_limit: 0,
      personal_data_analyze_limit: 0,
      team_member_limit: 0,
      notes: "",
      expires_at: "",
    });
    fetchPublicPlans();
    setShowCustomPlanModal(true);
  };

  const toDateTimeLocalValue = (value?: string | null) => {
    if (!value) return "";
    const normalized = typeof value === "string" ? value.replace(" ", "T") : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  };

  const handleCustomPlanFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomPlanForm((prev) => ({
      ...prev,
      [name]:
        name.includes("limit") || name === "price"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    }));
  };

  const copyPaymentLinkToClipboard = async (
    packageId: number | string,
    successMessage = "Payment link copied"
  ) => {
    const link = `${window.location.origin}/pricingplan?payCustomPlan=${packageId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success(successMessage);
    } catch {
      toast.error("Unable to copy payment link");
    }
    return link;
  };

  const handleAssignPublicPlanAsCustom = async (packageId: number | string) => {
    if (!selectedUserForPlan) return;
    if (!selectedApprovedRequest) {
      toast.error("Accept a custom plan request first.");
      return;
    }
    
    try {
      setSubmittingPlan(true);
      const res = await axiosInstance.post(`/admin/users/${selectedUserForPlan.id}/assign-custom-plan`, {
        use_existing_package: true,
        existing_package_id: packageId,
        notes: customPlanForm.notes || "Assigned from public plan",
        expires_at: customPlanForm.expires_at || null,
        requestId: selectedApprovedRequest.id,
      });

      if (res.data.success) {
        const paymentLink = res.data?.data?.paymentLink;
        if (paymentLink) {
          try {
            await navigator.clipboard.writeText(paymentLink);
            toast.success("Custom plan assigned. Payment link copied to clipboard.");
          } catch {
            toast.success("Custom plan assigned. Share the payment link from the request details.");
          }
        } else {
          toast.success(`Public plan assigned as custom plan to ${selectedUserForPlan.email}`);
        }
        setShowCustomPlanModal(false);
        setSelectedApprovedRequest(null);
        fetchUsers();
        fetchCustomPlanRequests();
      }
    } catch (error: any) {
      console.error("Failed to assign public plan as custom:", error);
      toast.error(error.response?.data?.message || "Failed to assign plan");
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleCreateCustomPlan = async () => {
    if (!selectedUserForPlan) return;
    if (!selectedApprovedRequest) {
      toast.error("Accept a custom plan request first.");
      return;
    }
    
    try {
      setSubmittingPlan(true);
      const res = await axiosInstance.post(`/admin/users/${selectedUserForPlan.id}/assign-custom-plan`, {
        planData: customPlanForm,
        notes: customPlanForm.notes,
        expires_at: customPlanForm.expires_at || null,
        requestId: selectedApprovedRequest.id,
      });

      if (res.data.success) {
        const paymentLink = res.data?.data?.paymentLink;
        if (paymentLink) {
          try {
            await navigator.clipboard.writeText(paymentLink);
            toast.success("Custom plan assigned. Payment link copied to clipboard.");
          } catch {
            toast.success("Custom plan assigned. Share the payment link from the request details.");
          }
        } else {
          toast.success(`Custom plan created and assigned to ${selectedUserForPlan.email}`);
        }
        setShowCustomPlanModal(false);
        setSelectedApprovedRequest(null);
        fetchUsers();
        fetchCustomPlanRequests();
      }
    } catch (error: any) {
      console.error("Failed to create custom plan:", error);
      toast.error(error.response?.data?.message || "Failed to create custom plan");
    } finally {
      setSubmittingPlan(false);
    }
  };

  const openCustomPlanEditor = (plan: any, user: AdminUser) => {
    setSelectedUserForPlan(user);
    setEditingCustomPlanId(Number(plan.id));
    setSelectedApprovedRequest(null);
    setCustomPlanForm({
      title: plan.title || `Custom Plan - ${user.name || user.email}`,
      package_type: plan.package_type || "Custom",
      package_duration: plan.package_duration || "Monthly",
      package_currency: plan.package_currency || "USD",
      price: Number(plan.price || 0),
      text_to_image_limit: Number(plan.text_to_image_limit || 0),
      image_limit: Number(plan.image_limit || 0),
      image_caption_limit: Number(plan.image_caption_limit || 0),
      ai_chat_limit: Number(plan.ai_chat_limit || 0),
      image_to_audio_limit: Number(plan.image_to_audio_limit || 0),
      scratch_to_code_limit: Number(plan.scratch_to_code_limit || 0),
      grammar_checking_limit: Number(plan.grammar_checking_limit || 0),
      text_to_paraphraser_limit: Number(plan.text_to_paraphraser_limit || 0),
      ai_chat_assistant_limit: Number(plan.ai_chat_assistant_limit || 0),
      ai_template_limit: Number(plan.ai_template_limit || 0),
      tts_audio_limit: Number(plan.tts_audio_limit || 0),
      video_to_text_limit: Number(plan.video_to_text_limit || 0),
      ai_vision_limit: Number(plan.ai_vision_limit || 0),
      web_scripting_limit: Number(plan.web_scripting_limit || 0),
      ai_rewriter_limit: Number(plan.ai_rewriter_limit || 0),
      speech_to_text_limit: Number(plan.speech_to_text_limit || 0),
      ai_voiceover_limit: Number(plan.ai_voiceover_limit || 0),
      ai_code_generate_limit: Number(plan.ai_code_generate_limit || 0),
      ai_mcp_smart_mailer_limit: Number(plan.ai_mcp_smart_mailer_limit || 0),
      personal_data_analyze_limit: Number(plan.personal_data_analyze_limit || 0),
      team_member_limit: Number(plan.team_member_limit || 0),
      notes: plan.notes || "",
      expires_at: toDateTimeLocalValue(plan.expires_at),
    });

    setShowUserCustomPlans(false);
    setShowCustomPlanModal(true);
  };

  const handleEditCustomPlan = (plan: any) => {
    if (!selectedUserForPlan) return;
    openCustomPlanEditor(plan, selectedUserForPlan);
  };

  const handleEditCustomPlanFromRequest = async (
    req: CustomPlanRequestItem,
    user: AdminUser
  ) => {
    if (!req.approved_package_id) return;
    const plans = await fetchUserCustomPlans(user.id);
    const plan = (plans || []).find((p: any) => Number(p.id) === Number(req.approved_package_id));

    if (!plan) {
      toast.error("Assigned custom plan not found for this user.");
      return;
    }

    openCustomPlanEditor(plan, user);
  };

  const handleUpdateCustomPlan = async (reassignAfterUpdate = false) => {
    if (!selectedUserForPlan || !editingCustomPlanId) return;
    try {
      setSubmittingPlan(true);
      const packageId = editingCustomPlanId;
      const res = await axiosInstance.patch(`/admin/custom-plans/${packageId}`, {
        userId: selectedUserForPlan.id,
        planData: customPlanForm,
      });

      if (res.data?.success) {
        if (reassignAfterUpdate) {
          try {
            setReassigningCustomPlanId(Number(packageId));
            const reassignRes = await axiosInstance.post(`/admin/custom-plans/${packageId}/reassign`, {
              userId: selectedUserForPlan.id,
              reason: "Reassigned by admin after plan update",
            });

            if (reassignRes.data?.success) {
              const paymentLink = reassignRes.data?.data?.paymentLink;
              if (paymentLink) {
                try {
                  await navigator.clipboard.writeText(paymentLink);
                  toast.success("Custom plan updated. New payment link copied.");
                } catch {
                  toast.success("Custom plan updated. New payment link generated.");
                }
              } else {
                await copyPaymentLinkToClipboard(packageId, "Custom plan updated. New payment link copied.");
              }
            } else {
              toast.error(reassignRes.data?.message || "Plan updated, but reassignment failed");
            }
          } catch (reassignError: any) {
            console.error("Failed to reassign custom plan after update:", reassignError);
            toast.error(
              reassignError.response?.data?.message ||
                "Plan updated, but failed to generate new payment link"
            );
          } finally {
            setReassigningCustomPlanId(null);
          }
        } else {
          toast.success("Custom plan updated successfully");
        }

        setShowCustomPlanModal(false);
        setEditingCustomPlanId(null);
        await fetchUserCustomPlans(selectedUserForPlan.id);
        setShowUserCustomPlans(true);
        fetchUsers();
        fetchCustomPlanRequests();
      } else {
        toast.error(res.data?.message || "Failed to update custom plan");
      }
    } catch (error: any) {
      console.error("Failed to update custom plan:", error);
      toast.error(error.response?.data?.message || "Failed to update custom plan");
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleViewCustomPlans = async (user: AdminUser) => {
    setSelectedUserForPlan(user);
    await fetchUserCustomPlans(user.id);
    setShowUserCustomPlans(true);
  };

  const cancelCustomPlanByAdmin = async ({
    packageId,
    userId,
    title,
    userEmail,
  }: {
    packageId: number | string;
    userId: string;
    title?: string;
    userEmail?: string;
  }) => {
    const confirmCancel = window.confirm(
      `Cancel custom plan "${title || packageId}" for ${userEmail || userId}?`
    );
    if (!confirmCancel) return;

    try {
      setCancellingCustomPlanId(Number(packageId));
      const res = await axiosInstance.post(`/admin/custom-plans/${packageId}/cancel`, {
        userId,
        reason: "Cancelled by admin from user management",
      });

      if (res.data?.success) {
        toast.success("Custom plan cancelled successfully");
        if (selectedUserForPlan && selectedUserForPlan.id.toString() === userId.toString()) {
          await fetchUserCustomPlans(selectedUserForPlan.id);
        }
        fetchCustomPlanRequests();
        fetchUsers();
      } else {
        toast.error(res.data?.message || "Failed to cancel custom plan");
      }
    } catch (error: any) {
      console.error("Failed to cancel custom plan:", error);
      toast.error(error.response?.data?.message || "Failed to cancel custom plan");
    } finally {
      setCancellingCustomPlanId(null);
    }
  };

  const handleCancelCustomPlan = async (plan: any) => {
    if (!selectedUserForPlan) return;
    await cancelCustomPlanByAdmin({
      packageId: plan.id,
      userId: selectedUserForPlan.id,
      title: plan.title,
      userEmail: selectedUserForPlan.email,
    });
  };

  const reassignCustomPlanByAdmin = async ({
    packageId,
    userId,
    title,
    userEmail,
  }: {
    packageId: number | string;
    userId: string;
    title?: string;
    userEmail?: string;
  }) => {
    const confirmReassign = window.confirm(
      `Reassign custom plan "${title || packageId}" for ${userEmail || userId} and generate a new payment link?`
    );
    if (!confirmReassign) return;

    try {
      setReassigningCustomPlanId(Number(packageId));
      const res = await axiosInstance.post(`/admin/custom-plans/${packageId}/reassign`, {
        userId,
        reason: "Reassigned by admin from user management",
      });

      if (res.data?.success) {
        const paymentLink = res.data?.data?.paymentLink;
        if (paymentLink) {
          try {
            await navigator.clipboard.writeText(paymentLink);
            toast.success("Reassigned. New payment link copied.");
          } catch {
            toast.success("Reassigned. Share the new payment link from request details.");
          }
        } else {
          await copyPaymentLinkToClipboard(packageId, "Reassigned. New payment link copied.");
        }
        if (selectedUserForPlan && selectedUserForPlan.id.toString() === userId.toString()) {
          await fetchUserCustomPlans(selectedUserForPlan.id);
        }
        fetchCustomPlanRequests();
        fetchUsers();
      } else {
        toast.error(res.data?.message || "Failed to reassign custom plan");
      }
    } catch (error: any) {
      console.error("Failed to reassign custom plan:", error);
      toast.error(error.response?.data?.message || "Failed to reassign custom plan");
    } finally {
      setReassigningCustomPlanId(null);
    }
  };

  const handleReassignCustomPlan = async (plan: any) => {
    if (!selectedUserForPlan) return;
    await reassignCustomPlanByAdmin({
      packageId: plan.id,
      userId: selectedUserForPlan.id,
      title: plan.title,
      userEmail: selectedUserForPlan.email,
    });
  };

  const approvedUnassignedRequestByUserId = useMemo(() => {
    const map = new Map<string, CustomPlanRequestItem>();
    customPlanRequests
      .filter((req) => req.status === "approved" && !req.approved_package_id)
      .forEach((req) => {
        if (!map.has(req.user_id)) {
          map.set(req.user_id, req);
        }
      });
    return map;
  }, [customPlanRequests]);

  const toggleAdminCustomRequests = async () => {
    const next = !showAdminCustomRequests;
    setShowAdminCustomRequests(next);
    if (next) {
      await fetchCustomPlanRequests();
    } else {
      setShowAdminRequestDetailsModal(false);
      setSelectedAdminRequest(null);
    }
  };

  const openAdminRequestDetails = (request: CustomPlanRequestItem) => {
    setSelectedAdminRequest(request);
    setShowAdminRequestDetailsModal(true);
  };

  const closeAdminRequestDetails = () => {
    setShowAdminRequestDetailsModal(false);
    setSelectedAdminRequest(null);
  };

  const darkActionButton = (
    tone: "neutral" | "primary" | "success" | "danger" | "warning",
    disabled = false
  ) => {
    const tones: Record<string, { background: string; border: string }> = {
      neutral: { background: "#1f2937", border: "#374151" },
      primary: { background: "#1e3a8a", border: "#2563eb" },
      success: { background: "#14532d", border: "#16a34a" },
      danger: { background: "#7f1d1d", border: "#dc2626" },
      warning: { background: "#7c2d12", border: "#ea580c" },
    };

    return {
      background: tones[tone].background,
      color: "#e5e7eb",
      border: `1px solid ${tones[tone].border}`,
      borderRadius: "6px",
      padding: "4px 8px",
      fontSize: "11px",
      fontWeight: 600,
      lineHeight: 1.2,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.65 : 1,
      transition: "all 0.15s ease",
      whiteSpace: "nowrap" as const,
    };
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "name", headerName: "Name", width: 180 },
      { field: "email", headerName: "Email", width: 240 },
      {
        field: "plan",
        headerName: "Plan",
        width: 200,
        renderCell: (params) => {
          const isCustom = params.row.is_custom === 1;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span>{params?.row?.package_title || params?.row?.plan || "Free"}</span>
              {isCustom && (
                <span style={{
                  background: "#ff9800",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "bold"
                }}>
                  CUSTOM
                </span>
              )}
            </div>
          );
        },
      },
      { field: "status", headerName: "Status", width: 120 },
      {
        field: "registration_date",
        headerName: "Signup Date",
        width: 140,
        valueFormatter: (value) => formatDate(value as string | Date | null),
      },
      {
        field: "last_login",
        headerName: "Last Login",
        width: 140,
        valueFormatter: (value) => formatDate(value as string | Date | null),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 350,
        sortable: false,
        cellClassName: "admin-users-actions-cell",
        renderCell: (params) => {
          const canView = hasPermission("admin_users.view");
          const canEditStatus = hasPermission("admin_users.edit_status");
          const canResetPassword = hasPermission("admin_users.reset_password");
          const canImpersonate = hasPermission("admin_users.impersonate");
          const canCreateCustomPlan = hasPermission("custom_plans.create");
          const canCreatePrompt = hasPermission("prompt.create");
          const approvedRequest = approvedUnassignedRequestByUserId.get(params.row.id);
          const canAssignCustomPlan = canCreateCustomPlan && !!approvedRequest;
          
          return (
            <div className="admin-users-actions">
              <div
                style={{ position: "relative" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="admin-users-action-btn"
                  disabled={!canView}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!canView) return;
                    setActionMenuUserId((prev) =>
                      prev === params.row.id ? null : params.row.id
                    );
                  }}
                  title={canView ? "User actions" : "No permission to view users"}
                  style={{
                    opacity: canView ? 1 : 0.5,
                    cursor: canView ? "pointer" : "not-allowed",
                    background: "#2196f3",
                    color: "white",
                  }}
                >
                  <FaEdit />
                </button>

                {actionMenuUserId === params.row.id && (
                  <div
                    className="admin-users-action-menu"
                    style={{
                      position: "absolute",
                      top: "110%",
                      left: 0,
                      minWidth: "126px",
                      padding: "2px",
                      zIndex: 2000,
                      boxShadow: "0 6px 14px rgba(0,0,0,0.35)"
                    }}
                  >
                    <button
                      className="admin-users-action-menu-item"
                      onClick={() => handleViewUser(params.row)}
                      disabled={!canView}
                      title={canView ? "View full user details" : "No permission to view users"}
                    >
                      View
                    </button>
                    <button
                      className="admin-users-action-menu-item"
                      onClick={() => handleEditUser(params.row)}
                      disabled={!canView}
                      title={canView ? "Edit user details and assign plan" : "No permission to edit users"}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-users-action-menu-item"
                      onClick={() =>
                        canAssignCustomPlan &&
                        handleOpenCustomPlanModal(params.row, approvedRequest)
                      }
                      disabled={!canAssignCustomPlan}
                      title={
                        !canCreateCustomPlan
                          ? "No permission to create custom plans"
                          : approvedRequest
                          ? "Assign custom plan"
                          : "No accepted request pending for this user"
                      }
                    >
                      Custom Plan
                    </button>
                    <button
                      className="admin-users-action-menu-item"
                      onClick={() => canCreatePrompt && handleOpenCustomPromptModal(params.row)}
                      disabled={!canCreatePrompt}
                      title={canCreatePrompt ? "Create custom prompt for this user" : "No permission to create prompts"}
                    >
                      Custom Prompt
                    </button>
                  </div>
                )}
              </div>
              <button
                className="admin-users-action-btn"
                disabled={!canEditStatus}
                onClick={() => canEditStatus && handleStatusToggle(params.row)}
                title={
                  !canEditStatus
                    ? "No permission to edit user status"
                    : params.row.status === "suspended"
                    ? "Reactivate user"
                    : "Suspend user"
                }
                style={{
                  opacity: canEditStatus ? 1 : 0.5,
                  cursor: canEditStatus ? "pointer" : "not-allowed",
                }}
              >
                {params.row.status === "suspended" ? (
                  <FaUserShield />
                ) : (
                  <FaUserSlash />
                )}
              </button>
              <button
                className="admin-users-action-btn"
                disabled={!canResetPassword}
                onClick={() => canResetPassword && handleResetPassword(params.row)}
                title={canResetPassword ? "Reset password" : "No permission to reset password"}
                style={{
                  opacity: canResetPassword ? 1 : 0.5,
                  cursor: canResetPassword ? "pointer" : "not-allowed",
                }}
              >
                <RiLockPasswordLine />
              </button>
              <button
                className="admin-users-action-btn"
                disabled={!canImpersonate}
                onClick={() => canImpersonate && handleImpersonate(params.row)}
                title={canImpersonate ? "Impersonate user" : "No permission to impersonate users"}
                style={{
                  opacity: canImpersonate ? 1 : 0.5,
                  cursor: canImpersonate ? "pointer" : "not-allowed",
                }}
              >
                <MdOutlineSwitchAccount />
              </button>
              <button
                className="admin-users-action-btn"
                disabled={!canAssignCustomPlan}
                onClick={() => canAssignCustomPlan && handleOpenCustomPlanModal(params.row, approvedRequest)}
                title={
                  !canCreateCustomPlan
                    ? "No permission to create custom plans"
                    : approvedRequest
                    ? "Assign custom plan for accepted request"
                    : "No accepted request pending for this user"
                }
                style={{
                  opacity: canAssignCustomPlan ? 1 : 0.5,
                  cursor: canAssignCustomPlan ? "pointer" : "not-allowed",
                  background: "#ff9800",
                  color: "white"
                }}
              >
                <GrPlan />
              </button>
              <button
                className="admin-users-action-btn"
                onClick={() => handleViewCustomPlans(params.row)}
                title="View custom plans"
                style={{
                  background: "#9c27b0",
                  color: "white"
                }}
              >
                <MdOutlineWorkspacePremium />
              </button>
            </div>
          );
        },
      },
    ],
    [hasPermission, approvedUnassignedRequestByUserId, actionMenuUserId]
  );

  const rows = users.map((user) => ({ ...user, id: user.id }));

  const featureLabels: Record<string, string> = {
    textToImage: "Text to Image",
    imagination: "Imagination",
    imageCaption: "Image Caption",
    chatImage: "Chat Image",
    scratchToCode: "Scratch to Code",
    grammarChecking: "Grammar Checking",
    textToParaphraser: "Text Paraphraser",
    chatAssistant: "Chat Assistant",
    aiTemplate: "AI Template",
    editAudio: "Edit Audio",
    videoToText: "Video to Text",
    aiVision: "AI Vision",
    webScripting: "Web Scripting",
    youtubeAnalyser: "YouTube Analyser",
    aiRewriter: "AI Rewriter",
    speechToText: "Speech to Text",
    aiVoiceover: "AI Voiceover",
    aiCodeGenerate: "AI Code Generate",
    aiMcpSmartMailer: "MCP Smart Mailer",
    personalDataAnalyze: "Personal Data Analyze",
  };

  const renderCreditsTable = (user: AdminUser) => {
    const used = user.creditsByFeature || {};
    const limits = user.creditsLimitByFeature || {};
    const remaining = user.creditsRemainingByFeature || {};

    const rows = Object.keys(featureLabels).map((key) => ({
      key,
      label: featureLabels[key],
      used: used[key] ?? 0,
      limit: limits[key],
      remaining: remaining[key],
    }));

    return (
      <div className="admin-users-credits-grid">
        {rows.map((row) => (
          <div key={row.key} className="admin-users-credits-row">
            <div className="admin-users-credits-feature">{row.label}</div>
            <div className="admin-users-credits-used">{(row.used ?? 0).toLocaleString()}</div>
            <div className="admin-users-credits-limit">
              {row.limit ? row.limit.toLocaleString() : "Unlimited"}
            </div>
            <div className="admin-users-credits-remaining">
              {row.remaining === null ? "-" : row.remaining?.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="main-content-common">
      <div className="container-flute">
        <div className="global-link-limit-section">
          <div className="short-link-text">
            <ShortLink />
          </div>
        </div>

        <div className="admin-users-toolbar">
          <div className="admin-users-search">
            <FaSearch />
            <input
              type="text"
              placeholder="Search name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          <div className="admin-users-filters">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="">All Plans</option>
              <option value="Free">Free</option>
              <option value="Trial">Trial</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Custom">Custom Plans</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <input
              type="date"
              value={signupDate}
              onChange={(e) => setSignupDate(e.target.value)}
            />
            <button onClick={handleSearch}>Apply</button>
            <button className="reset" onClick={handleResetFilters}>
              Reset
            </button>
          </div>

          <div className="admin-users-export">
            {hasPermission("custom_plans.view") && (
              <button
                onClick={toggleAdminCustomRequests}
                style={{
                  background: showAdminCustomRequests ? "#14532d" : "#164e63",
                  color: "#f8fafc",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FaClock />
                {showAdminCustomRequests ? "Hide Requests" : "Custom Plan Requests"}
                {customPlanRequests.length > 0 && !showAdminCustomRequests && (
                  <span
                    style={{
                      background: "#b91c1c",
                      color: "#fff",
                      borderRadius: "999px",
                      padding: "1px 6px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {customPlanRequests.length}
                  </span>
                )}
              </button>
            )}
            <button onClick={handleExport}>
              <HiOutlineDocumentArrowDown />
              Export CSV
            </button>
          </div>
        </div>

        {hasPermission("custom_plans.view") && showAdminCustomRequests && (
          <div style={{ marginBottom: "18px", background: "#111827", borderRadius: "10px", padding: "14px", border: "1px solid #374151" }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#f8fafc", fontSize: "16px" }}>Custom Plan Requests</h3>

            {loadingCustomPlanRequests ? (
              <div style={{ color: "#cbd5e1" }}>Loading requests...</div>
            ) : customPlanRequests.length === 0 ? (
              <div style={{ color: "#94a3b8" }}>No custom plan requests found.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#0f172a", color: "#e2e8f0", borderBottom: "1px solid #334155" }}>
                      <th style={{ textAlign: "left", padding: "10px", fontSize: "12px" }}>User</th>
                      <th style={{ textAlign: "left", padding: "10px", fontSize: "12px" }}>Timeline</th>
                      <th style={{ textAlign: "left", padding: "10px", fontSize: "12px" }}>Status</th>
                      <th style={{ textAlign: "left", padding: "10px", fontSize: "12px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customPlanRequests.map((req) => {
                      const isPaymentDone =
                        req.status === "approved" && Number(req.payment_done || 0) === 1;
                      const statusText = isPaymentDone ? "payment done" : req.status;
                      const statusColor = isPaymentDone
                        ? "#0284c7"
                        : req.status === "pending"
                        ? "#d97706"
                        : req.status === "approved"
                        ? "#15803d"
                        : req.status === "rejected"
                        ? "#b91c1c"
                        : "#475569";
                      return (
                        <tr key={req.id} style={{ borderBottom: "1px solid #1f2937" }}>
                          <td style={{ padding: "10px", color: "#e5e7eb", fontSize: "13px" }}>
                            <div style={{ fontWeight: 600 }}>{req.user_name || "User"}</div>
                            <div style={{ color: "#94a3b8", fontSize: "12px" }}>{req.user_email || req.user_id}</div>
                          </td>
                          <td style={{ padding: "10px", color: "#cbd5e1", fontSize: "12px" }}>
                            <div>Requested: {formatDateTime(req.created_at)}</div>
                            <div>{req.reviewed_at ? `Reviewed: ${formatDateTime(req.reviewed_at)}` : "Reviewed: -"}</div>
                          </td>
                          <td style={{ padding: "10px" }}>
                            <span
                              style={{
                                background: statusColor,
                                color: "#fff",
                                padding: "2px 8px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                              }}
                            >
                              {statusText}
                            </span>
                          </td>
                          <td style={{ padding: "10px" }}>
                            <button
                              onClick={() => openAdminRequestDetails(req)}
                              style={darkActionButton(req.status === "pending" ? "primary" : "neutral")}
                            >
                              {req.status === "pending" ? "View & Process" : "View Details"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <PageLoader isLoading={true} />
        ) : (
          <div className="admin-table-section-smart-ai">
            <DataGrid
              rows={rows}
              columns={columns}
              rowCount={total}
              paginationMode="server"
              paginationModel={{ page: page - 1, pageSize }}
              onPaginationModelChange={(model) => {
                setPage(model.page + 1);
                setPageSize(model.pageSize);
              }}
              pageSizeOptions={[12, 25, 50, 100]}
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
              }}
            />
          </div>
        )}
      </div>

      {showAdminRequestDetailsModal && selectedAdminRequest && (() => {
        const req = selectedAdminRequest;
        const matchedUser = users.find((u) => u.id.toString() === req.user_id?.toString());
        const targetUser: AdminUser = matchedUser || {
          id: req.user_id,
          name: req.user_name || "User",
          email: req.user_email || req.user_id,
        };
        const canApproveRequests = hasPermission("custom_plans.approve");
        const isPaymentDone = req.status === "approved" && Number(req.payment_done || 0) === 1;
        const hasAssignedRequestPlan = !!req.approved_package_id;
        const canAssign =
          hasPermission("custom_plans.create") &&
          req.status === "approved" &&
          !req.approved_package_id;
        const statusText = isPaymentDone ? "payment done" : req.status;
        const statusTone = isPaymentDone
          ? "#0284c7"
          : req.status === "pending"
          ? "#d97706"
          : req.status === "approved"
          ? "#15803d"
          : req.status === "rejected"
          ? "#b91c1c"
          : "#475569";

        return (
          <div className="admin-users-modal" style={{ zIndex: 1005 }}>
            <div className="admin-users-modal-content" style={{ maxWidth: "760px" }}>
              <div className="admin-users-modal-header">
                <h3>Custom Plan Request Details</h3>
                <button onClick={closeAdminRequestDetails}>&times;</button>
              </div>
              <div className="admin-users-modal-body" style={{ display: "grid", gap: "12px" }}>
                <div style={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px", padding: "12px", color: "#e5e7eb" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div><strong>User:</strong> {targetUser.name || "User"} ({targetUser.email})</div>
                    <div>
                      <strong>Status:</strong>{" "}
                      <span style={{ background: statusTone, color: "#fff", borderRadius: "999px", padding: "2px 8px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                        {statusText}
                      </span>
                    </div>
                    <div><strong>Requested:</strong> {formatDateTime(req.created_at)}</div>
                    <div><strong>Reviewed:</strong> {formatDateTime(req.reviewed_at)}</div>
                    {isPaymentDone && req.payment_done_at ? (
                      <div><strong>Paid:</strong> {formatDateTime(req.payment_done_at)}</div>
                    ) : null}
                    {isPaymentDone && req.payment_gateway ? (
                      <div><strong>Gateway:</strong> {String(req.payment_gateway).toUpperCase()}</div>
                    ) : null}
                  </div>
                  {req.user_notes ? (
                    <div style={{ marginTop: "10px", fontSize: "13px", color: "#cbd5e1" }}>
                      <strong>Notes:</strong> {req.user_notes}
                    </div>
                  ) : null}
                  {req.admin_notes ? (
                    <div style={{ marginTop: "8px", fontSize: "13px", color: "#9ca3af" }}>
                      <strong>Admin:</strong> {req.admin_notes}
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {req.status === "pending" && canApproveRequests && (
                    <>
                      <button
                        onClick={async () => {
                          await handleAcceptRequest(req);
                          closeAdminRequestDetails();
                        }}
                        disabled={processingRequestId === req.id}
                        style={darkActionButton("success", processingRequestId === req.id)}
                      >
                        {processingRequestId === req.id ? "Processing..." : "Accept"}
                      </button>
                      <button
                        onClick={async () => {
                          await handleRejectRequest(req);
                          closeAdminRequestDetails();
                        }}
                        disabled={processingRequestId === req.id}
                        style={darkActionButton("danger", processingRequestId === req.id)}
                      >
                        {processingRequestId === req.id ? "Processing..." : "Reject"}
                      </button>
                    </>
                  )}

                  {canAssign && (
                    <button
                      onClick={() => {
                        handleOpenCustomPlanModal(targetUser, req);
                        closeAdminRequestDetails();
                      }}
                      style={darkActionButton("warning")}
                    >
                      Create & Assign Plan
                    </button>
                  )}

                  {hasAssignedRequestPlan && (
                    <button
                      onClick={async () => {
                        if (!canEditCustomPlans) return;
                        await handleEditCustomPlanFromRequest(req, targetUser);
                        closeAdminRequestDetails();
                      }}
                      disabled={!canEditCustomPlans}
                      style={darkActionButton("primary", !canEditCustomPlans)}
                    >
                      Edit Plan
                    </button>
                  )}

                  {hasAssignedRequestPlan && !isPaymentDone && (
                    <button
                      onClick={() =>
                        canReassignCustomPlans &&
                        reassignCustomPlanByAdmin({
                          packageId: req.approved_package_id as number,
                          userId: req.user_id,
                          title: `Custom Plan - ${req.user_name || req.user_email || req.user_id}`,
                          userEmail: req.user_email || req.user_id,
                        })
                      }
                      disabled={
                        !canReassignCustomPlans ||
                        reassigningCustomPlanId === Number(req.approved_package_id)
                      }
                      style={darkActionButton(
                        "success",
                        !canReassignCustomPlans ||
                          reassigningCustomPlanId === Number(req.approved_package_id)
                      )}
                    >
                      {reassigningCustomPlanId === Number(req.approved_package_id)
                        ? "Reassigning..."
                        : "Reassign Plan"}
                    </button>
                  )}

                  {hasAssignedRequestPlan && !isPaymentDone && (
                    <button
                      onClick={() =>
                        copyPaymentLinkToClipboard(
                          req.approved_package_id as number,
                          "Payment link copied"
                        )
                      }
                      style={darkActionButton("neutral")}
                    >
                      Copy Payment Link
                    </button>
                  )}

                  {hasAssignedRequestPlan && isPaymentDone && canCancelCustomPlans && (
                    <button
                      onClick={() =>
                        cancelCustomPlanByAdmin({
                          packageId: req.approved_package_id as number,
                          userId: req.user_id,
                          title: `Custom Plan - ${req.user_name || req.user_email || req.user_id}`,
                          userEmail: req.user_email || req.user_id,
                        })
                      }
                      disabled={cancellingCustomPlanId === Number(req.approved_package_id)}
                      style={darkActionButton(
                        "danger",
                        cancellingCustomPlanId === Number(req.approved_package_id)
                      )}
                    >
                      {cancellingCustomPlanId === Number(req.approved_package_id)
                        ? "Cancelling..."
                        : "Cancel Plan"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* EDIT USER MODAL - Plan Assignment */}
      {showEditModal && editingUser && (
        <div className="admin-users-modal" style={{ zIndex: 1000 }}>
          <div className="admin-users-modal-content" style={{ maxWidth: "500px" }}>
            <div className="admin-users-modal-header">
              <h3>Edit User & Assign Plan</h3>
              <button onClick={() => setShowEditModal(false)} disabled={updatingUserPlan}>
                &times;
              </button>
            </div>
            <div className="admin-users-modal-body">
              <div style={{ marginBottom: "20px" }}>
                <div style={{ background: "#2a2a2a", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
                  <p><strong>Name:</strong> {editingUser.name || "-"}</p>
                  <p><strong>Email:</strong> {editingUser.email}</p>
                  <p><strong>Current Plan:</strong> {editingUser.package_title || editingUser.plan || "Free"}</p>
                  {editingUser.is_custom === 1 && (
                    <span style={{
                      background: "#ff9800",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      marginLeft: "5px"
                    }}>
                      CUSTOM
                    </span>
                  )}
                </div>

                <label style={{ color: "#fff", display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                  Select New Plan
                </label>
                
                {loadingPlans ? (
                  <div>Loading plans...</div>
                ) : (
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#1e1e1e",
                      color: "#fff",
                      border: "1px solid #444",
                      borderRadius: "5px",
                      marginBottom: "20px",
                      fontSize: "14px"
                    }}
                  >
                    <option value="">-- Select a plan --</option>
                    {allPublicPlans
                      .filter(plan => plan.is_custom !== 1)
                      .map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.title} - {plan.package_currency} {plan.price} / {plan.package_duration}
                        </option>
                      ))
                    }
                  </select>
                )}

                <div style={{ 
                  background: "#1e3a5f", 
                  padding: "15px", 
                  borderRadius: "8px",
                  border: "1px solid #2196f3",
                  marginTop: "10px"
                }}>
                  <p style={{ color: "#90caf9", margin: "0 0 10px 0", fontWeight: "bold" }}>
                    ⚠️ Important Notes:
                  </p>
                  <ul style={{ color: "#e0e0e0", margin: "0", paddingLeft: "20px", fontSize: "13px" }}>
                    <li>Assigning a new plan will immediately update the user's access</li>
                    <li>The user will need to refresh their page or login again</li>
                    <li>Previous subscription will be replaced with the new plan</li>
                    <li>For custom plans, use the "Assign Custom Plan" button instead</li>
                  </ul>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: "10px 20px",
                    background: "#444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                  disabled={updatingUserPlan}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUserPlan}
                  style={{
                    padding: "10px 20px",
                    background: "#2196f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    opacity: !selectedPlanId ? 0.6 : 1
                  }}
                  disabled={updatingUserPlan || !selectedPlanId}
                >
                  {updatingUserPlan ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="admin-users-modal">
          <div className="admin-users-modal-content">
            <div className="admin-users-modal-header">
              <h3>User Profile</h3>
              <button onClick={() => setSelectedUser(null)}>Close</button>
            </div>
            <div className="admin-users-modal-body">
              <div>
                <strong>User ID:</strong> {selectedUser.id}
              </div>
              <div>
                <strong>Name:</strong>{" "}
                {isProfileEditMode ? (
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => handleProfileFieldChange("name", e.target.value)}
                    style={profileInputStyle}
                  />
                ) : (
                  selectedUser.name || "-"
                )}
              </div>
              <div>
                <strong>Username:</strong>{" "}
                {isProfileEditMode ? (
                  <input
                    type="text"
                    value={profileForm.user_name}
                    onChange={(e) => handleProfileFieldChange("user_name", e.target.value)}
                    style={profileInputStyle}
                  />
                ) : (
                  selectedUser.user_name || "-"
                )}
              </div>
              <div>
                <strong>Email:</strong>{" "}
                {isProfileEditMode ? (
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => handleProfileFieldChange("email", e.target.value)}
                    style={profileInputStyle}
                  />
                ) : (
                  selectedUser.email
                )}
              </div>
              <div>
                <strong>Role:</strong> {selectedUser.auth || "-"}
              </div>
              <div>
                <strong>Onboarding Completed:</strong>{" "}
                {selectedUser.onboarding_completed === 1 || selectedUser.onboarding_completed === true ? "Yes" : "No"}
              </div>
              <div>
                <strong>Job Role:</strong>{" "}
                {isProfileEditMode ? (
                  <input
                    type="text"
                    value={profileForm.job_role}
                    onChange={(e) => handleProfileFieldChange("job_role", e.target.value)}
                    style={profileInputStyle}
                  />
                ) : (
                  selectedUser.job_role || "-"
                )}
              </div>
              <div>
                <strong>Phone Number:</strong>{" "}
                {isProfileEditMode ? (
                  <input
                    type="text"
                    value={profileForm.phone_number}
                    onChange={(e) => handleProfileFieldChange("phone_number", e.target.value)}
                    style={profileInputStyle}
                  />
                ) : (
                  selectedUser.phone_number || "-"
                )}
              </div>
              <div>
                <strong>Company Name:</strong>{" "}
                {isProfileEditMode ? (
                  <input
                    type="text"
                    value={profileForm.company_name}
                    onChange={(e) => handleProfileFieldChange("company_name", e.target.value)}
                    style={profileInputStyle}
                  />
                ) : (
                  selectedUser.company_name || "-"
                )}
              </div>
              <div>
                <strong>Company Website:</strong>{" "}
                {isProfileEditMode ? (
                  <input
                    type="text"
                    value={profileForm.company_website}
                    onChange={(e) => handleProfileFieldChange("company_website", e.target.value)}
                    style={profileInputStyle}
                  />
                ) : (
                  selectedUser.company_website || "-"
                )}
              </div>
              <div>
                <strong>Onboarding Company Name:</strong> {selectedUser.onboarding_company_name || "-"}
              </div>
              <div>
                <strong>Onboarding Company Website:</strong> {selectedUser.onboarding_company_website || "-"}
              </div>
              <div>
                <strong>Onboarding Platform:</strong> {selectedUser.onboarding_platform_name || "-"}
              </div>
              <div>
                <strong>Onboarding Industry:</strong> {selectedUser.onboarding_industry_name || "-"}
              </div>
              <div>
                <strong>City:</strong>{" "}
                {isProfileEditMode ? (
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => handleProfileFieldChange("city", e.target.value)}
                    style={profileInputStyle}
                  />
                ) : (
                  selectedUser.city || "-"
                )}
              </div>
              <div>
                <strong>Country:</strong>{" "}
                {isProfileEditMode ? (
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) => handleProfileFieldChange("country", e.target.value)}
                    style={profileInputStyle}
                  />
                ) : (
                  selectedUser.country || "-"
                )}
              </div>
              <div>
                <strong>Plan:</strong>{" "}
                {selectedUser.package_title || selectedUser.plan || "Free"}
                {selectedUser.is_custom === 1 && (
                  <span style={{
                    background: "#ff9800",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginLeft: "10px"
                  }}>
                    CUSTOM
                  </span>
                )}
              </div>
              {isProfileEditMode && (
                <div style={{ marginTop: "6px" }}>
                  <label
                    style={{
                      color: "#cbd5e1",
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    Select Plan
                  </label>
                  {loadingPlans ? (
                    <div style={{ color: "#94a3b8", fontSize: "13px" }}>Loading plans...</div>
                  ) : (
                    <select
                      value={profilePlanId}
                      onChange={(e) => setProfilePlanId(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#111827",
                        color: "#f8fafc",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <option value="">-- Select a plan --</option>
                      {allPublicPlans
                        .filter((plan) => plan.is_custom !== 1)
                        .map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.title} - {plan.package_currency} {plan.price} / {plan.package_duration}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              )}
              <div>
                <strong>Status:</strong> {selectedUser.status || "-"}
              </div>
              <div>
                <strong>Package ID:</strong> {selectedUser.package_id || "-"}
              </div>
              <div>
                <strong>Package Type:</strong> {selectedUser.package_type || "-"}
              </div>
              <div>
                <strong>Package Duration:</strong> {selectedUser.package_duration || "-"}
              </div>
              <div>
                <strong>Total Tokens Used:</strong> {selectedUser.token_used_total?.toLocaleString() || 0}
              </div>
              <div>
                <strong>This Month Tokens:</strong> {selectedUser.token_used_month?.toLocaleString() || 0}
              </div>
              <div>
                <strong>Total Products Generated:</strong> {selectedUser.products_generated_total?.toLocaleString() || 0}
              </div>
              <div>
                <strong>This Month Products:</strong> {selectedUser.products_generated_month?.toLocaleString() || 0}
              </div>
              <div>
                <strong>Signup Date:</strong>{" "}
                {formatDateTime(selectedUser.registration_date)}
              </div>
              <div>
                <strong>Last Login:</strong>{" "}
                {formatDateTime(selectedUser.last_login)}
              </div>
              <div>
                <strong>Credits By Feature:</strong>
                <div className="admin-users-credits-header">
                  <div>Feature</div>
                  <div>Used</div>
                  <div>Limit</div>
                  <div>Remaining</div>
                </div>
                {renderCreditsTable(selectedUser)}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  onClick={() => setSelectedUser(null)}
                  style={{
                    padding: "10px 20px",
                    background: "#444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
                {isProfileEditMode ? (
                  <>
                    <button
                      onClick={() => {
                        setIsProfileEditMode(false);
                        setProfilePlanId(selectedUser.package_id || "");
                        setProfileForm({
                          name: selectedUser.name || "",
                          user_name: selectedUser.user_name || "",
                          email: selectedUser.email || "",
                          job_role: selectedUser.job_role || "",
                          phone_number: selectedUser.phone_number || "",
                          company_name: selectedUser.company_name || "",
                          company_website: selectedUser.company_website || "",
                          city: selectedUser.city || "",
                          country: selectedUser.country || "",
                        });
                      }}
                      disabled={updatingUserPlan}
                      style={{
                        padding: "10px 20px",
                        background: "#475569",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: updatingUserPlan ? "not-allowed" : "pointer",
                        opacity: updatingUserPlan ? 0.7 : 1,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfileEdit}
                      disabled={updatingUserPlan}
                      title="Save changes"
                      style={{
                        padding: "10px 20px",
                        background: "#2196f3",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor:
                          !updatingUserPlan
                            ? "pointer"
                            : "not-allowed",
                        fontWeight: "bold",
                        opacity:
                          !updatingUserPlan ? 1 : 0.6,
                      }}
                    >
                      {updatingUserPlan ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditFromProfile}
                    title="Edit user details"
                    style={{
                      padding: "10px 20px",
                      background: "#2196f3",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      opacity: 1
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Custom Prompt Modal */}
      {showCustomPromptModal && selectedUserForPrompt && (
        <div className="admin-users-modal" style={{ zIndex: 1002 }}>
          <div className="admin-users-modal-content" style={{ maxWidth: "760px" }}>
            <div className="admin-users-modal-header">
              <h3>Custom Prompt - {selectedUserForPrompt.email}</h3>
              <button
                onClick={() => setShowCustomPromptModal(false)}
                disabled={creatingUserPrompt}
              >
                &times;
              </button>
            </div>
            <div className="admin-users-modal-body">
              <div>
                <label style={{ display: "block", marginBottom: "6px", color: "#cbd5e1" }}>Title</label>
                <input
                  type="text"
                  value={userPromptForm.title}
                  onChange={(e) =>
                    setUserPromptForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#111827",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", color: "#cbd5e1" }}>Assigned To</label>
                <div
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#111827",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                  }}
                >
                  {selectedUserForPrompt.email}{" "}
                  {selectedUserForPrompt.package_id
                    ? `(Package ID: ${selectedUserForPrompt.package_id})`
                    : "(No package found)"}
                </div>
                <small style={{ color: "#94a3b8" }}>
                  This prompt is directly assigned to this user.
                </small>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#cbd5e1" }}>
                   Context
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <select
                    value={selectedContextKey}
                    onChange={(e) => setSelectedContextKey(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "#111827",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#f8fafc",
                    }}
                  >
                    <option value="">Select context field</option>
                    <option value="user_name">User Name</option>
                    <option value="user_email">User Email</option>
                    <option value="company_name">Company Name</option>
                    <option value="company_website">Company Website</option>
                    <option value="job_role">Job Role</option>
                    <option value="phone_number">Contact Number</option>
                    <option value="city">City</option>
                    <option value="country">Country</option>
                    <option value="onboarding_completed">Onboarding Completed</option>
                    <option value="products_generated_total">Products Generated</option>
                    <option value="current_package">Current Plan</option>
                    <option value="onboarding_company_name">Onboarding Company Name</option>
                    <option value="onboarding_company_website">Onboarding Company Website</option>
                    <option value="onboarding_state">Onboarding State</option>
                    <option value="onboarding_city">Onboarding City</option>
                    <option value="onboarding_country">Onboarding Country</option>
                    <option value="onboarding_contact_number">Onboarding Contact Number</option>
                    <option value="onboarding_platform_name">Onboarding Platform</option>
                    <option value="onboarding_industry_name">Onboarding Industry</option>
                  </select>
                  <button
                    type="button"
                    className="admin-users-action-btn"
                    onClick={() => {
                      if (!selectedContextKey) return;
                      const mapping: Record<string, { label: string; value: any }> = {
                        user_name: { label: "User Name", value: selectedUserForPrompt.name },
                        user_email: { label: "User Email", value: selectedUserForPrompt.email },
                        company_name: { label: "Company Name", value: selectedUserForPrompt.company_name },
                        company_website: { label: "Company Website", value: selectedUserForPrompt.company_website },
                        job_role: { label: "Job Role", value: selectedUserForPrompt.job_role },
                        phone_number: { label: "Contact Number", value: selectedUserForPrompt.phone_number },
                        city: { label: "City", value: selectedUserForPrompt.city },
                        country: { label: "Country", value: selectedUserForPrompt.country },
                        onboarding_completed: {
                          label: "Onboarding Completed",
                          value:
                            selectedUserForPrompt.onboarding_completed === 1 ||
                            selectedUserForPrompt.onboarding_completed === true,
                        },
                        products_generated_total: {
                          label: "Products Generated Total",
                          value: selectedUserForPrompt.products_generated_total,
                        },
                        current_package: {
                          label: "Current Package",
                          value: selectedUserForPrompt.package_title || selectedUserForPrompt.plan,
                        },
                        onboarding_company_name: {
                          label: "Onboarding Company Name",
                          value: selectedUserForPrompt.onboarding_company_name,
                        },
                        onboarding_company_website: {
                          label: "Onboarding Company Website",
                          value: selectedUserForPrompt.onboarding_company_website,
                        },
                        onboarding_state: {
                          label: "Onboarding State",
                          value: selectedUserForPrompt.onboarding_state,
                        },
                        onboarding_city: {
                          label: "Onboarding City",
                          value: selectedUserForPrompt.onboarding_city,
                        },
                        onboarding_country: {
                          label: "Onboarding Country",
                          value: selectedUserForPrompt.onboarding_country,
                        },
                        onboarding_contact_number: {
                          label: "Onboarding Contact Number",
                          value: selectedUserForPrompt.onboarding_contact_number,
                        },
                        onboarding_platform_name: {
                          label: "Onboarding Platform",
                          value: selectedUserForPrompt.onboarding_platform_name,
                        },
                        onboarding_industry_name: {
                          label: "Onboarding Industry",
                          value: selectedUserForPrompt.onboarding_industry_name,
                        },
                      };
                      const selected = mapping[selectedContextKey];
                      if (selected) {
                        appendUserContextToPrompt(selected.label, selected.value);
                      }
                    }}
                  >
                    Insert
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", color: "#cbd5e1" }}>Prompt Text</label>
                <textarea
                  value={userPromptForm.prompt_text}
                  onChange={(e) =>
                    setUserPromptForm((prev) => ({ ...prev, prompt_text: e.target.value }))
                  }
                  placeholder="Write prompt for this user context..."
                  style={{
                    width: "100%",
                    minHeight: "220px",
                    padding: "12px",
                    background: "#111827",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  onClick={() => setShowCustomPromptModal(false)}
                  disabled={creatingUserPrompt}
                  style={{
                    padding: "10px 16px",
                    background: "#374151",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUserPrompt}
                  disabled={creatingUserPrompt}
                  style={{
                    padding: "10px 16px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                  }}
                >
                  {creatingUserPrompt ? "Saving..." : "Create Prompt"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Plan Assignment Modal */}
      {showCustomPlanModal && selectedUserForPlan && (
        <div className="admin-users-modal" style={{ zIndex: 1001 }}>
          <div className="admin-users-modal-content" style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="admin-users-modal-header">
              <h3>{editingCustomPlanId ? "Edit Custom Plan" : "Assign Custom Plan"} - {selectedUserForPlan.email}</h3>
              <button
                onClick={() => {
                  setShowCustomPlanModal(false);
                  setSelectedApprovedRequest(null);
                  setEditingCustomPlanId(null);
                }}
                disabled={submittingPlan}
              >
                &times;
              </button>
            </div>
            <div className="admin-users-modal-body">
              {!editingCustomPlanId && (
                <div style={{ marginBottom: "16px", padding: "10px", borderRadius: "8px", background: "#0f172a", border: "1px solid #334155", color: "#cbd5e1" }}>
                  {selectedApprovedRequest ? (
                    <>
                      <strong>Accepted Request ID:</strong> #{selectedApprovedRequest.id}
                      {selectedApprovedRequest.user_notes ? (
                        <div style={{ marginTop: "6px" }}>
                          <strong>User notes:</strong> {selectedApprovedRequest.user_notes}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <span>No accepted request linked. Accept a request first from the request list.</span>
                  )}
                </div>
              )}
               
              {/* Quick Assign from Public Plans */}
              {!editingCustomPlanId && (
                <div style={{ marginBottom: "30px", padding: "20px", background: "#2a2a2a", borderRadius: "8px" }}>
                  <h4 style={{ color: "#fff", marginBottom: "15px" }}>Quick Assign from Public Plans</h4>
                  {loadingPlans ? (
                    <div>Loading plans...</div>
                  ) : (
                    <select
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px",
                        marginBottom: "10px"
                      }}
                      onChange={(e) => e.target.value && handleAssignPublicPlanAsCustom(e.target.value)}
                      disabled={submittingPlan || !selectedApprovedRequest}
                    >
                      <option value="">Select a public plan to assign as custom</option>
                      {publicPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.title} - {plan.package_currency} {plan.price} / {plan.package_duration}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <h4 style={{ color: "#fff", marginBottom: "15px" }}>
                {editingCustomPlanId ? "Edit Custom Plan" : "Or Create New Custom Plan"}
              </h4>
              
              {/* Plan Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Plan Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={customPlanForm.title}
                    onChange={handleCustomPlanFormChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: "#1e1e1e",
                      color: "#fff",
                      border: "1px solid #444",
                      borderRadius: "5px"
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Package Type</label>
                  <select
                    name="package_type"
                    value={customPlanForm.package_type}
                    onChange={handleCustomPlanFormChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: "#1e1e1e",
                      color: "#fff",
                      border: "1px solid #444",
                      borderRadius: "5px"
                    }}
                  >
                    <option value="Custom">Custom</option>
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Duration</label>
                  <select
                    name="package_duration"
                    value={customPlanForm.package_duration}
                    onChange={handleCustomPlanFormChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: "#1e1e1e",
                      color: "#fff",
                      border: "1px solid #444",
                      borderRadius: "5px"
                    }}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Life-Time">Life-Time</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Currency</label>
                  <select
                    name="package_currency"
                    value={customPlanForm.package_currency}
                    onChange={handleCustomPlanFormChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: "#1e1e1e",
                      color: "#fff",
                      border: "1px solid #444",
                      borderRadius: "5px"
                    }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="BDT">BDT (৳)</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Price</label>
                  <input
                    type="number"
                    name="price"
                    value={customPlanForm.price}
                    onChange={handleCustomPlanFormChange}
                    min="0"
                    step="0.01"
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: "#1e1e1e",
                      color: "#fff",
                      border: "1px solid #444",
                      borderRadius: "5px"
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Expires At (Optional)</label>
                  <input
                    type="datetime-local"
                    name="expires_at"
                    value={customPlanForm.expires_at}
                    onChange={handleCustomPlanFormChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: "#1e1e1e",
                      color: "#fff",
                      border: "1px solid #444",
                      borderRadius: "5px"
                    }}
                  />
                </div>
              </div>

              {/* Feature Limits */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ color: "#fff", marginBottom: "15px" }}>Feature Limits</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Text to Image</label>
                    <input
                      type="number"
                      name="text_to_image_limit"
                      value={customPlanForm.text_to_image_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Image Limit</label>
                    <input
                      type="number"
                      name="image_limit"
                      value={customPlanForm.image_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Image Caption</label>
                    <input
                      type="number"
                      name="image_caption_limit"
                      value={customPlanForm.image_caption_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>AI Chat</label>
                    <input
                      type="number"
                      name="ai_chat_limit"
                      value={customPlanForm.ai_chat_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Image to Audio</label>
                    <input
                      type="number"
                      name="image_to_audio_limit"
                      value={customPlanForm.image_to_audio_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Scratch to Code</label>
                    <input
                      type="number"
                      name="scratch_to_code_limit"
                      value={customPlanForm.scratch_to_code_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Grammar Checking</label>
                    <input
                      type="number"
                      name="grammar_checking_limit"
                      value={customPlanForm.grammar_checking_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Text Paraphraser</label>
                    <input
                      type="number"
                      name="text_to_paraphraser_limit"
                      value={customPlanForm.text_to_paraphraser_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Chat Assistant</label>
                    <input
                      type="number"
                      name="ai_chat_assistant_limit"
                      value={customPlanForm.ai_chat_assistant_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>AI Template</label>
                    <input
                      type="number"
                      name="ai_template_limit"
                      value={customPlanForm.ai_template_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>TTS Audio</label>
                    <input
                      type="number"
                      name="tts_audio_limit"
                      value={customPlanForm.tts_audio_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Video to Text</label>
                    <input
                      type="number"
                      name="video_to_text_limit"
                      value={customPlanForm.video_to_text_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>AI Vision</label>
                    <input
                      type="number"
                      name="ai_vision_limit"
                      value={customPlanForm.ai_vision_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Web Scripting</label>
                    <input
                      type="number"
                      name="web_scripting_limit"
                      value={customPlanForm.web_scripting_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>AI Rewriter</label>
                    <input
                      type="number"
                      name="ai_rewriter_limit"
                      value={customPlanForm.ai_rewriter_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Speech to Text</label>
                    <input
                      type="number"
                      name="speech_to_text_limit"
                      value={customPlanForm.speech_to_text_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>AI Voiceover</label>
                    <input
                      type="number"
                      name="ai_voiceover_limit"
                      value={customPlanForm.ai_voiceover_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>AI Code Generate</label>
                    <input
                      type="number"
                      name="ai_code_generate_limit"
                      value={customPlanForm.ai_code_generate_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>MCP Smart Mailer</label>
                    <input
                      type="number"
                      name="ai_mcp_smart_mailer_limit"
                      value={customPlanForm.ai_mcp_smart_mailer_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Personal Data Analyze</label>
                    <input
                      type="number"
                      name="personal_data_analyze_limit"
                      value={customPlanForm.personal_data_analyze_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Team Member Limit</label>
                    <input
                      type="number"
                      name="team_member_limit"
                      value={customPlanForm.team_member_limit}
                      onChange={handleCustomPlanFormChange}
                      min="-1"
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e1e1e",
                        color: "#fff",
                        border: "1px solid #444",
                        borderRadius: "5px"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ color: "#ccc", display: "block", marginBottom: "5px" }}>Admin Notes</label>
                <textarea
                  name="notes"
                  value={customPlanForm.notes}
                  onChange={handleCustomPlanFormChange}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "#1e1e1e",
                    color: "#fff",
                    border: "1px solid #444",
                    borderRadius: "5px"
                  }}
                  placeholder="Optional notes about this custom plan..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  onClick={() => {
                    setShowCustomPlanModal(false);
                    setSelectedApprovedRequest(null);
                    setEditingCustomPlanId(null);
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                  disabled={submittingPlan}
                >
                  Cancel
                </button>
                {editingCustomPlanId && (
                  <button
                    onClick={() => canReassignCustomPlans && handleUpdateCustomPlan(true)}
                    style={{
                      padding: "10px 20px",
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor:
                        submittingPlan || !canReassignCustomPlans ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      opacity: submittingPlan || !canReassignCustomPlans ? 0.7 : 1,
                    }}
                    title={
                      canReassignCustomPlans
                        ? "Update plan and generate a new payment link"
                        : "No permission to reassign custom plans"
                    }
                    disabled={submittingPlan || !canReassignCustomPlans}
                  >
                    {submittingPlan && reassigningCustomPlanId === Number(editingCustomPlanId)
                      ? "Updating & Reassigning..."
                      : "Update + Reassign Link"}
                  </button>
                )}
                <button
                  onClick={() =>
                    editingCustomPlanId ? handleUpdateCustomPlan(false) : handleCreateCustomPlan()
                  }
                  style={{
                    padding: "10px 20px",
                    background: "#ff9800",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                  disabled={submittingPlan || (!editingCustomPlanId && !selectedApprovedRequest)}
                >
                  {submittingPlan
                    ? editingCustomPlanId
                      ? "Updating..."
                      : "Creating..."
                    : editingCustomPlanId
                    ? "Update Custom Plan"
                    : "Create & Assign Custom Plan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Custom Plans Modal */}
      {showUserCustomPlans && selectedUserForPlan && (
        <div className="admin-users-modal" style={{ zIndex: 1002 }}>
          <div className="admin-users-modal-content" style={{ maxWidth: "700px", maxHeight: "80vh", overflowY: "auto" }}>
            <div className="admin-users-modal-header">
              <h3>Custom Plans for {selectedUserForPlan.email}</h3>
              <button onClick={() => setShowUserCustomPlans(false)}>
                &times;
              </button>
            </div>
            <div className="admin-users-modal-body">
              {loadingUserCustomPlans ? (
                <div>Loading custom plans...</div>
              ) : userCustomPlans.length > 0 ? (
                userCustomPlans.map((plan, index) => (
                  <div key={index} style={{
                    padding: "15px",
                    marginBottom: "15px",
                    background: plan.is_currently_active ? "#1e3a5f" : "#2a2a2a",
                    border: plan.is_currently_active ? "2px solid #28a745" : "1px solid #444",
                    borderRadius: "8px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <h4 style={{ margin: 0, color: "#fff" }}>{plan.title}</h4>
                      {plan.is_currently_active && (
                        <span style={{
                          background: "#28a745",
                          color: "white",
                          padding: "3px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}>
                          ACTIVE NOW
                        </span>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", color: "#ccc" }}>
                      <div><strong>Price:</strong> {plan.package_currency} {plan.price}</div>
                      <div><strong>Duration:</strong> {plan.package_duration}</div>
                      <div><strong>Assigned By:</strong> {plan.assigned_by_name || "Admin"}</div>
                      <div><strong>Assigned:</strong> {formatDate(plan.assigned_at)}</div>
                      {plan.expires_at && (
                        <div><strong>Expires:</strong> {formatDate(plan.expires_at)}</div>
                      )}
                    </div>
                    {plan.notes && (
                      <div style={{ marginTop: "10px", padding: "10px", background: "#1e1e1e", borderRadius: "5px", color: "#ccc" }}>
                        <strong>Notes:</strong> {plan.notes}
                      </div>
                    )}
                    <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <button
                        onClick={() => canEditCustomPlans && handleEditCustomPlan(plan)}
                        disabled={!canEditCustomPlans}
                        title={
                          canEditCustomPlans
                            ? "Edit custom plan"
                            : "No permission to edit custom plans"
                        }
                        style={darkActionButton("primary", !canEditCustomPlans)}
                      >
                        Edit Plan
                      </button>
                      {!plan.is_currently_active && (
                        <button
                          onClick={() => canReassignCustomPlans && handleReassignCustomPlan(plan)}
                          disabled={
                            !canReassignCustomPlans ||
                            reassigningCustomPlanId === Number(plan.id)
                          }
                          title={
                            canReassignCustomPlans
                              ? "Reassign plan and copy new payment link"
                              : "No permission to reassign custom plans"
                          }
                          style={darkActionButton(
                            "success",
                            !canReassignCustomPlans ||
                              reassigningCustomPlanId === Number(plan.id)
                          )}
                        >
                          {reassigningCustomPlanId === Number(plan.id)
                            ? "Reassigning..."
                            : "Reassign & Copy Link"}
                        </button>
                      )}
                      {plan.is_currently_active && (
                        <button
                          onClick={() => canCancelCustomPlans && handleCancelCustomPlan(plan)}
                          disabled={
                            !canCancelCustomPlans ||
                            cancellingCustomPlanId === Number(plan.id)
                          }
                          title={
                            canCancelCustomPlans
                              ? "Cancel custom plan"
                              : "No permission to cancel custom plans"
                          }
                          style={darkActionButton(
                            "danger",
                            !canCancelCustomPlans ||
                              cancellingCustomPlanId === Number(plan.id)
                          )}
                        >
                          {cancellingCustomPlanId === Number(plan.id)
                            ? "Cancelling..."
                            : "Cancel Custom Plan"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "30px", color: "#ccc" }}>
                  <p>No custom plans assigned to this user.</p>
                  {!approvedUnassignedRequestByUserId.get(selectedUserForPlan.id) && (
                    <p style={{ color: "#fbbf24", fontSize: "13px" }}>
                      Accept a pending custom plan request first.
                    </p>
                  )}
                  <button
                    onClick={() => {
                      setShowUserCustomPlans(false);
                      handleOpenCustomPlanModal(
                        selectedUserForPlan,
                        approvedUnassignedRequestByUserId.get(selectedUserForPlan.id) || null
                      );
                    }}
                    disabled={!approvedUnassignedRequestByUserId.get(selectedUserForPlan.id)}
                    style={{
                      marginTop: "15px",
                      padding: "10px 20px",
                      background: "#ff9800",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: approvedUnassignedRequestByUserId.get(selectedUserForPlan.id) ? "pointer" : "not-allowed",
                      opacity: approvedUnassignedRequestByUserId.get(selectedUserForPlan.id) ? 1 : 0.6
                    }}
                  >
                    Assign Custom Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

