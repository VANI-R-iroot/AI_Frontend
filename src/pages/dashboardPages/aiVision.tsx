import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import adminImage from "../../assets/image/admin/allImage";
import ShortLink from "../../common/ShortLinkDashboard";
import CommonTrailBar from "../../common/CommonTrailBar";
import PayChatData from "../../components/userDashboard/dashboardMain/payData";
import { limitStore } from "../../zustand/limitStore";
import { packageStore } from "../../zustand/packageStore";
import { useUserStore } from "../../zustand/userDetailsStore";
import axiosInstance from "../../utils/baseUrl";
import { toast } from "react-toastify";
import { Post_language } from "../../DataList/dropdownlist";
import ReactMarkdown from "react-markdown";
import { FiArrowLeft, FiEdit } from "react-icons/fi";

interface FileRow {
  id?: string | number;
  _id: string;
  text: string;
  timestamp: string;
  score?: number | null;
  status?: string;
  platform_type?: string;
  vision_image_url?: string | null;
  image_path?: string;
}
type AttributePublishMode = "all" | "none" | "custom";

const isOnboardingDone = (value: any) =>
  value === 1 || value === true || value === "1";

const AiVisionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useUserStore((state) => state.userData);
  const setUserData = useUserStore((state) => state.setUserData);
  const { packageLimitData } = packageStore();
  const { limitData } = limitStore();
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(
    isOnboardingDone(userData?.onboarding_completed ?? userData?.onboardingCompleted)
  );
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<"Results" | "Files">("Results");
  const [prompts, setPrompts] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [language, setLanguage] = useState("english");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resultText, setResultText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [resultStatus, setResultStatus] = useState<string | null>(null);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [imgToTextData, setImgToTextData] = useState<FileRow[]>([]);
  const [showExport, setShowExport] = useState(false);
  const [exportResultId, setExportResultId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportFilter, setExportFilter] = useState("recent");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showHistoryExport, setShowHistoryExport] = useState(false);
  const [showHistoryPublish, setShowHistoryPublish] = useState(false);
  const [isPublishingSelected, setIsPublishingSelected] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [isProcessingSingle, setIsProcessingSingle] = useState(false);
  const [aiVisionTotalLimit, setAiVisionTotalLimit] = useState<number | null>(null);
  const [singleImagePreview, setSingleImagePreview] = useState<string | null>(null);
  const [showInlineCrop, setShowInlineCrop] = useState(false);
  const [isCroppingImage, setIsCroppingImage] = useState(false);
  const [cropRect, setCropRect] = useState({ x: 20, y: 20, size: 120 });
  const [cropDragMode, setCropDragMode] = useState<null | "move" | "resize">(null);
  const [showBulkRegenerateMenu, setShowBulkRegenerateMenu] = useState(false);
  const [historyEditMode, setHistoryEditMode] = useState(false);
  const [editingText, setEditingText] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const cropDragStartRef = useRef({
    x: 0,
    y: 0,
    rect: { x: 20, y: 20, size: 120 },
  });

  const [customDateRange, setCustomDateRange] = useState({
    from: "",
    to: "",
  });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [publishFieldOptions, setPublishFieldOptions] = useState({
    title: true,
    short_description: true,
    long_description: true,
    keywords: true,
    attributes: true,
  });
  const [hiddenResultAttributeKeysByResultId, setHiddenResultAttributeKeysByResultId] =
    useState<Record<string, string[]>>({});
  const [hiddenBulkAttributeKeysByResultId, setHiddenBulkAttributeKeysByResultId] =
    useState<Record<string, string[]>>({});
  const [selectedAttributeKeys, setSelectedAttributeKeys] = useState<string[]>([]);
  const [attributePublishByHistoryId, setAttributePublishByHistoryId] = useState<
    Record<string, { mode: AttributePublishMode; keys: string[] }>
  >({});

  // Add ESC key support for modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [selectedImage]);

  useEffect(() => {
    if (!imageFile) {
      setSingleImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setSingleImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  useEffect(() => {
    const localStatus = isOnboardingDone(
      userData?.onboarding_completed ?? userData?.onboardingCompleted
    );
    setIsOnboardingCompleted(localStatus);

    const checkOnboardingStatus = async () => {
      try {
        const response = await axiosInstance.get("/getUserDetails");
        const latestUserData = response?.data?.data || {};
        setUserData(latestUserData);
        setIsOnboardingCompleted(
          isOnboardingDone(
            latestUserData.onboarding_completed ?? latestUserData.onboardingCompleted
          )
        );
      } catch (error) {
        console.error("Failed to verify onboarding status:", error);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [setUserData, userData?.onboarding_completed, userData?.onboardingCompleted]);

  const refreshUserUsage = async () => {
    try {
      const response = await axiosInstance.get("/getUserDetails");
      const latestUserData = response?.data?.data || {};
      setUserData(latestUserData);
    } catch (error) {
      console.error("Failed to refresh user usage:", error);
    }
  };

  useEffect(() => {
    const loadAiVisionLimit = async () => {
      try {
        const res = await axiosInstance.get("/subscription/current");
        const limitValue = res?.data?.data?.ai_vision_limit;
        if (limitValue !== undefined && limitValue !== null) {
          const numeric = Number(limitValue);
          if (!Number.isNaN(numeric)) {
            setAiVisionTotalLimit(numeric);
          }
        }
      } catch (error) {
        console.error("Failed to load AI Vision limit:", error);
      }
    };
    loadAiVisionLimit();
  }, []);

  const showOnboardingRequired = () => {
    toast.error("Please complete company onboarding before uploading files.");
  };

  const getImagePreview = (imageUrl: string) => {
    if (!imageUrl) return '';
    
    console.log('getImagePreview called with:', imageUrl);
    
    if (imageUrl.startsWith('blob:') || 
        imageUrl.startsWith('http:') || 
        imageUrl.startsWith('https:') ||
        imageUrl.startsWith('data:image')) {
      return imageUrl;
    }
    
    if (imageUrl.includes('/') || imageUrl.includes('\\') || imageUrl.includes('.')) {
      if (!imageUrl.startsWith('http')) {
        const baseUrl = axiosInstance.defaults.baseURL || window.location.origin;
        return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
    }
    
    return imageUrl;
  };

  const handleCropEditorImageLoad = () => {
    const img = cropImageRef.current;
    if (!img) return;
    const width = img.clientWidth || 0;
    const height = img.clientHeight || 0;
    if (!width || !height) return;

    const size = Math.max(80, Math.floor(Math.min(width, height) * 0.55));
    setCropRect({
      x: Math.max(0, Math.floor((width - size) / 2)),
      y: Math.max(0, Math.floor((height - size) / 2)),
      size,
    });
  };

  const beginCropDrag = (
    mode: "move" | "resize",
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    cropDragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rect: { ...cropRect },
    };
    setCropDragMode(mode);
  };

  useEffect(() => {
    if (!cropDragMode) return;

    const onMove = (event: MouseEvent) => {
      const img = cropImageRef.current;
      if (!img) return;
      const width = img.clientWidth || 0;
      const height = img.clientHeight || 0;
      if (!width || !height) return;

      const minSize = 60;
      const dx = event.clientX - cropDragStartRef.current.x;
      const dy = event.clientY - cropDragStartRef.current.y;
      const start = cropDragStartRef.current.rect;

      if (cropDragMode === "move") {
        const nextX = Math.max(0, Math.min(start.x + dx, width - start.size));
        const nextY = Math.max(0, Math.min(start.y + dy, height - start.size));
        setCropRect({ x: nextX, y: nextY, size: start.size });
        return;
      }

      const maxSize = Math.max(
        minSize,
        Math.min(width - start.x, height - start.y)
      );
      const nextSize = Math.max(
        minSize,
        Math.min(start.size + Math.max(dx, dy), maxSize)
      );
      setCropRect({ x: start.x, y: start.y, size: nextSize });
    };

    const onUp = () => setCropDragMode(null);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [cropDragMode]);

  const handleApplyInlineCrop = async () => {
    if (!imageFile || !singleImagePreview || !cropImageRef.current) return;

    try {
      setIsCroppingImage(true);

      const sourceImg = cropImageRef.current;
      const displayW = sourceImg.clientWidth || 0;
      const displayH = sourceImg.clientHeight || 0;
      const naturalW = sourceImg.naturalWidth || 0;
      const naturalH = sourceImg.naturalHeight || 0;

      if (!displayW || !displayH || !naturalW || !naturalH) {
        throw new Error("Unable to load image for cropping");
      }

      const scaleX = naturalW / displayW;
      const scaleY = naturalH / displayH;
      const srcX = Math.max(0, Math.floor(cropRect.x * scaleX));
      const srcY = Math.max(0, Math.floor(cropRect.y * scaleY));
      const srcW = Math.max(1, Math.floor(cropRect.size * scaleX));
      const srcH = Math.max(1, Math.floor(cropRect.size * scaleY));

      const outputSize = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Unable to initialize crop canvas");
      }

      ctx.drawImage(sourceImg, srcX, srcY, srcW, srcH, 0, 0, outputSize, outputSize);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );

      if (!blob) {
        throw new Error("Failed to crop image");
      }

      const baseName = imageFile.name.replace(/\.[^/.]+$/, "");
      const croppedFile = new File([blob], `${baseName}-cropped.jpg`, {
        type: "image/jpeg",
      });

      setImageFile(croppedFile);
      setShowInlineCrop(false);
      toast.success("Image cropped successfully");
    } catch (error) {
      console.error("Inline crop error:", error);
      toast.error("Failed to crop image");
    } finally {
      setIsCroppingImage(false);
    }
  };

  // Fetch saved analyses
  const fetchImgToTextData = async (filterParam?: string, statusParam?: string) => {
    try {
      const currentFilter = filterParam || exportFilter;
      const currentStatus = statusParam || statusFilter;
      let queryUrl = `/vision/list?filter=${currentFilter}&status=${currentStatus}`;
      
      if (currentFilter === "custom" && customDateRange.from && customDateRange.to) {
        queryUrl += `&from=${customDateRange.from}&to=${customDateRange.to}`;
      }
      
      console.log("Fetching with URL:", queryUrl);
      const res = await axiosInstance.get(queryUrl);
      const data = res.data?.data || [];
      setImgToTextData(data);
    } catch (error) {
      console.error("Fetching assistant data failed:", error);
      toast.error("Failed to load files.");
    }
  };

  // Fetch prompts - FIXED: Using correct user endpoint
  const fetchPrompts = async () => {
    try {
      console.log("Fetching prompts for user...");
      const res = await axiosInstance.get("/prompts/list");
      console.log("Prompts response:", res.data);
      setPrompts(res.data?.data || []);
      
      // Auto-select first prompt if available
      if (res.data?.data?.length > 0) {
        setSelectedPrompt((prev) => prev || String(res.data.data[0].id));
      }
    } catch (error) {
      console.error("Failed to load prompts:", error);
      toast.error("Failed to load prompts");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const source = params.get("source");
    const sessionFromQuery = params.get("bulkSessionId");
    const promptFromQuery = params.get("prompt_id");

    if (source === "woo" && sessionFromQuery) {
      setIsBulkMode(true);
      setCurrentSessionId(sessionFromQuery);
      setActiveTab("Results");
      if (promptFromQuery) {
        setSelectedPrompt(String(promptFromQuery));
      }
      toast.info("Showing WooCommerce analysis results");
    }
  }, [location.search]);

  useEffect(() => {
    fetchImgToTextData();
    fetchPrompts();
  }, []);

  // Poll for Excel bulk results
  useEffect(() => {
    console.log(" Polling useEffect triggered:", {
      isBulkMode,
      selectedPrompt,
      currentSessionId,
      isProcessingBulk
    });

    if (!isBulkMode || !selectedPrompt) {
      console.log(" Polling not started - missing isBulkMode or selectedPrompt");
      return;
    }

    console.log(" Starting polling interval...");
    setIsProcessingBulk(true);

    const interval = setInterval(async () => {
      try {
        console.log(" Polling for bulk results...");
        
        const params: any = {
          prompt_id: selectedPrompt
        };
        
        if (currentSessionId) {
          params.bulkSessionId = currentSessionId;
          console.log(" Using session ID:", currentSessionId);
        }

        console.log(" Request params:", params);

        const res = await axiosInstance.get("/vision/bulk/results", { params });
        
        console.log(" Polling response received");
        console.log("Response data:", res.data);

        if (res.data?.success !== false) {
          const results = res.data?.data || [];
          console.log(` Got ${results.length} results from backend`);
          console.log("Sample result:", results[0]);
          
          if (results.length > 0) {
            // Format results to include all analysis text variations
            const formattedResults = results.map((item: any) => {
              let analysisText = item.text || 
                                item.long_description || 
                                item.analysis || 
                                item.short_description ||
                                "";
              
              // If analysis is in formatted sections, try to extract
              if (!analysisText && item.data) {
                analysisText = item.data.long_description || item.data.analysis || "";
              }
              
              const formattedItem = {
                ...item,
                _id: item.id || item._id,
                id: item.id || item._id,
                image_path: item.image_path,
                text: analysisText,
                long_description: analysisText,
                analysis: analysisText
              };
              console.log("Formatted item with image:", formattedItem.image_path);
              return formattedItem;
            });
            console.log("Formatted result:", formattedResults[0]);
            setBulkResults(formattedResults);
          }

          const pendingCount = results.filter((item: any) => 
            item.analysis_status === "pending"
          ).length;
          
          console.log(` ${pendingCount} images still pending`);

          if (pendingCount === 0 && results.length > 0) {
            console.log(" All processing complete!");
            setIsProcessingBulk(false);
            clearInterval(interval);
            refreshUserUsage();
            toast.success(` Processed ${results.length} images!`);
          } else if (results.length === 0) {
            console.log(" No results yet, continue polling...");
          }
        } else {
          console.error(" Backend returned error:", res.data);
        }
      } catch (err: any) {
        console.error(" Bulk polling error:", err);
        console.error("Error status:", err?.response?.status);
        console.error("Error data:", err?.response?.data);
        
        if (err?.response?.status === 404) {
          console.error(" Endpoint /vision/bulk/results not found!");
          setIsProcessingBulk(false);
          clearInterval(interval);
          toast.error("Backend endpoint not found. Check server logs.");
        }
      }
    }, 4000);

    const timeout = setTimeout(() => {
      console.log(" Polling timeout after 10 minutes");
      clearInterval(interval);
      setIsProcessingBulk(false);
      toast.warning(" Processing timeout - please check your network connection");
    }, 10 * 60 * 1000);

    return () => {
      console.log(" Cleaning up polling interval");
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isBulkMode, selectedPrompt, currentSessionId]);

  // Update the handleSubmit function for bulk processing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(" Submit clicked:", {
      excelFile: excelFile?.name,
      imageFile: imageFile?.name,
      selectedPrompt,
      isProcessingBulk
    });

    //  PREVENT MULTIPLE SUBMISSIONS
    if (isCheckingOnboarding) {
      toast.info("Checking company onboarding status...");
      return;
    }

    if (!isOnboardingCompleted) {
      showOnboardingRequired();
      return;
    }

    if (isProcessingBulk || isProcessingSingle) {
      toast.info("Please wait for current processing to complete");
      return;
    }

    if (!imageFile && !excelFile) {
      toast.error("Please upload an image or Excel file!");
      return;
    }

    if (!selectedPrompt) {
      toast.error("Please select a prompt!");
      return;
    }

    // ========== SINGLE IMAGE PROCESSING ==========
    if (imageFile) {
      console.log(" Preparing single image upload...");
      
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("prompt_id", selectedPrompt);
      formData.append("language", language);

      // Log FormData contents
      console.log(" FormData entries:");
      for (let pair of (formData as any).entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }

      setIsBulkMode(false);
      setIsProcessingBulk(false);
      setBulkResults([]);
      setIsProcessingSingle(true);
      setResultText("");
      setScore(null);
      setExportResultId(null);
      setSelectedResultId(null);
      setResultStatus(null);

      try {
        console.log(" Sending request to /vision/analyze");
        const res = await axiosInstance.post("/vision/analyze", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        console.log(" Backend response:", res.data);

        if (res.data?.data) {
          const generatedId = res.data.data.id?.toString();
          setResultText(res.data.data.analysis || "");
          setScore(res.data.data.score ?? null);
          setExportResultId(generatedId);
          setSelectedResultId(generatedId);
          setResultStatus(res.data.data.analysis_status || null);
          toast.success("Generated Successfully!");
          fetchImgToTextData();
          refreshUserUsage();
          setActiveTab("Results");
          setEditMode(false);
        } else {
          toast.error("No result found.");
        }
      } catch (error: any) {
        console.error(" Single image error:", error);
        console.error("Error response:", error?.response?.data);
        toast.error(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to submit image"
        );
      } finally {
        setIsProcessingSingle(false);
      }
      return;
    }

    // ========== BULK EXCEL PROCESSING ==========
    if (excelFile) {
      console.log(" Starting bulk Excel processing...");
      
      const formData = new FormData();
      formData.append("excel", excelFile);
      formData.append("prompt_id", selectedPrompt);
      formData.append("language", language);

      // Reset states
      setResultText("");
      setScore(null);
      setSelectedResultId(null);
      setResultStatus(null);
      setBulkResults([]);
      setCurrentSessionId(null);
      setIsBulkMode(true);
      setIsProcessingBulk(true);
      setIsProcessingSingle(false);

      console.log(" Sending request to /vision/bulk/analyze");

      try {
        const res = await axiosInstance.post("/vision/bulk/analyze", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        
        console.log(" Backend response:", res.data);

        if (res.data?.bulkSessionId) {
          console.log(" Got session ID:", res.data.bulkSessionId);
          setCurrentSessionId(res.data.bulkSessionId);
        } else {
          console.warn(" No session ID in response");
        }

        if (res.data?.bulkResults || res.data?.data) {
          const bulkWithIds = (res.data.bulkResults || res.data.data || []).map((item: any) => ({
            ...item,
            id: item.id || item._id || item.image_path,
          }));

          console.log(` Setting ${bulkWithIds.length} initial results`);
          setBulkResults(bulkWithIds);
          
          toast.success(`Bulk analysis queued! ${res.data.totalQueued || bulkWithIds.length} images are being processed.`);
          setActiveTab("Results");
          
          console.log(" Bulk processing started successfully");
          return;
        } else {
          console.error(" No bulkResults or data in response");
          toast.error("Failed to start bulk analysis");
          setIsProcessingBulk(false);
          setIsBulkMode(false);
        }
      } catch (error: any) {
        console.error(" Bulk submission error:", error);
        console.error("Error details:", error?.response?.data);
        toast.error(
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to submit bulk analysis"
        );
        setIsProcessingBulk(false);
        setIsBulkMode(false);
      }
      return;
    }
  };

  // Select file from history
  const handleFileSelect = (fileId: string) => {
    setExportResultId(fileId);
    setSelectedResultId(fileId);
    const selected = imgToTextData.find((f) => f._id === fileId);
    if (selected) {
      setResultText(selected.text);
      setScore((selected as any).score ?? null);
      setResultStatus((selected as any).status ?? null);
      setEditMode(false);
      setActiveTab("Results");
    }
  };

  // Export single
  const handleExport = async (format: string) => {
    if (!exportResultId) {
      toast.error("No result available to export");
      return;
    }

    try {
      const res = await axiosInstance.get(
        `/vision/export/${exportResultId}?format=${format}`,
        { responseType: "blob" }
      );
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "excel" ? "vision.xlsx" : `vision.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      setShowExport(false);
    } catch (error: any) {
      console.error("Export error:", error);
      console.error("Error response:", error?.response?.data);
      toast.error(error?.response?.data?.message || error?.response?.data?.error || "Export failed. Check console for details.");
    }
  };

  // Copy result text
  const handleCopyText = () => {
    const displayText = getDisplayedSingleResultText();
    if (!displayText) return;
    navigator.clipboard.writeText(displayText);
    toast.success("Text copied to clipboard!");
  };

  const getConfidenceLabel = (score: number | null) => {
    if (score === null) return null;
    if (score >= 80) return { label: "High Confidence", color: "#22c55e" };
    if (score >= 50) return { label: "Medium Confidence", color: "#f59e0b" };
    return { label: "Low Confidence", color: "#ef4444" };
  };

  const handleSelectAll = () => {
    if (selectedIds.length === imgToTextData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(imgToTextData.map((file) => file._id));
    }
  };

  const handleSelectCheckbox = (fileId: string) => {
    setSelectedIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const extractAttributeKeyFromLine = (line: string): string => {
    const cleaned = line.replace(/^\s*[-*]\s*/, "").trim();

    const markdownKey = cleaned.match(/^\*{1,2}\s*([^*:\n]+?)\s*\*{1,2}\s*:/);
    if (markdownKey?.[1]) return markdownKey[1].trim();

    const plainKey = cleaned.match(/^([^:\n]+?)\s*:/);
    if (plainKey?.[1]) return plainKey[1].replace(/\*/g, "").trim();

    return "";
  };

  const formatAttributeLabel = (key: string): string => {
    const cleaned = String(key || "")
      .trim()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");
    if (!cleaned) return "";
    return cleaned
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const extractAttributeKeysFromText = (text: string): string[] => {
    if (!text) return [];
    const sectionMatch = text.match(
      /(?:^|\n)#{2,3}\s*Attributes\s*\n([\s\S]*?)(?=\n#{2,3}\s|\Z)/i
    );
    const sectionText = sectionMatch?.[1] || text;

    const keys = sectionText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => extractAttributeKeyFromLine(line))
      .filter(Boolean);

    return Array.from(new Set(keys));
  };

  const extractAttributeEntriesFromText = (
    text: string
  ): Array<{ key: string; line: string }> => {
    if (!text) return [];
    const sectionMatch = text.match(
      /(?:^|\n)#{2,3}\s*Attributes\s*\n([\s\S]*?)(?=\n#{2,3}\s|\Z)/i
    );
    const sectionText = sectionMatch?.[1] || "";
    if (!sectionText) return [];

    const entries = sectionText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const cleanedLine = line.replace(/^\s*[-*]\s*/, "").trim();
        const key = extractAttributeKeyFromLine(line);
        const valuePart = cleanedLine.includes(":")
          ? cleanedLine.slice(cleanedLine.indexOf(":") + 1).trim()
          : "";
        const prettyKey = formatAttributeLabel(key);
        const prettyLine = valuePart ? `${prettyKey}: ${valuePart}` : prettyKey;
        return { key, line: prettyLine || cleanedLine };
      })
      .filter((entry) => Boolean(entry.key));

    const seen = new Set<string>();
    return entries.filter((entry) => {
      if (seen.has(entry.key)) return false;
      seen.add(entry.key);
      return true;
    });
  };

  const filterAttributesInText = (text: string, allowedKeys: string[]) => {
    if (!text) return text;
    const allowedSet = new Set(allowedKeys);

    return text.replace(
      /(^|\n)(#{2,3}\s*Attributes\s*\n)([\s\S]*?)(?=\n#{2,3}\s|\Z)/i,
      (_, prefix: string, heading: string, body: string) => {
        const filtered = body
          .split("\n")
          .filter((line: string) => {
            const trimmed = line.trim();
            if (!trimmed) return false;
            const key = extractAttributeKeyFromLine(trimmed);
            if (!key) return true;
            return allowedSet.has(key);
          })
          .join("\n")
          .trim();

        return `${prefix}${heading}${filtered ? `${filtered}\n` : ""}`;
      }
    );
  };

  const prettifyAttributeSectionText = (text: string) => {
    if (!text) return text;
    return text.replace(
      /(^|\n)(#{2,3}\s*Attributes\s*\n)([\s\S]*?)(?=\n#{2,3}\s|\Z)/i,
      (_, prefix: string, heading: string, body: string) => {
        const formatted = body
          .split("\n")
          .map((line: string) => {
            const trimmed = line.trim();
            if (!trimmed) return "";
            const key = extractAttributeKeyFromLine(trimmed);
            if (!key) return line;
            const valuePart = trimmed.includes(":")
              ? trimmed.slice(trimmed.indexOf(":") + 1).trim()
              : "";
            const prettyKey = formatAttributeLabel(key);
            const bulletPrefix = line.match(/^\s*[-*]\s*/)?.[0] || "";
            return `${bulletPrefix}${prettyKey}${valuePart ? `: ${valuePart}` : ""}`;
          })
          .filter(Boolean)
          .join("\n");
        return `${prefix}${heading}${formatted ? `${formatted}\n` : ""}`;
      }
    );
  };

  const selectedHistoryRows = imgToTextData.filter((row) =>
    selectedIds.includes(row._id)
  );

  const selectedWooHistoryRows = selectedHistoryRows.filter(
    (row) => String(row.platform_type || "").toLowerCase() === "woocommerce"
  );
  const selectedNonWooHistoryRows = selectedHistoryRows.filter(
    (row) => String(row.platform_type || "").toLowerCase() !== "woocommerce"
  );

  const getHistoryRowAttributeKeys = (row: FileRow) =>
    extractAttributeKeysFromText(row.text || "");
  const selectedHistoryAttributeKeys = Array.from(
    new Set(selectedWooHistoryRows.flatMap((row) => getHistoryRowAttributeKeys(row)))
  );

  const toggleAttributeKey = (key: string) => {
    setSelectedAttributeKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const initializeHistoryAttributeConfig = () => {
    setAttributePublishByHistoryId((prev) => {
      const next = { ...prev };
      selectedWooHistoryRows.forEach((row) => {
        const rowId = String(row._id);
        const rowKeys = getHistoryRowAttributeKeys(row);
        const existing = next[rowId];
        if (!existing) {
          next[rowId] = {
            mode: rowKeys.length > 0 ? "all" : "none",
            keys: rowKeys,
          };
          return;
        }
        next[rowId] = {
          mode: existing.mode,
          keys: existing.keys.filter((key) => rowKeys.includes(key)),
        };
      });
      return next;
    });
  };

  const setHistoryAttributeMode = (
    rowId: string,
    mode: AttributePublishMode,
    rowKeys: string[]
  ) => {
    setAttributePublishByHistoryId((prev) => {
      const current = prev[rowId] || {
        mode: "all" as AttributePublishMode,
        keys: rowKeys,
      };
      let nextKeys = current.keys.filter((key) => rowKeys.includes(key));
      if (mode === "all") nextKeys = rowKeys;
      if (mode === "none") nextKeys = [];
      if (mode === "custom" && nextKeys.length === 0 && rowKeys.length > 0) {
        nextKeys = rowKeys;
      }
      return {
        ...prev,
        [rowId]: { mode, keys: nextKeys },
      };
    });
  };

  const toggleHistoryAttributeKey = (
    rowId: string,
    key: string,
    rowKeys: string[]
  ) => {
    setAttributePublishByHistoryId((prev) => {
      const current = prev[rowId] || {
        mode: "custom" as AttributePublishMode,
        keys: rowKeys,
      };
      const hasKey = current.keys.includes(key);
      const nextKeys = hasKey
        ? current.keys.filter((item) => item !== key)
        : [...current.keys, key].filter((item) => rowKeys.includes(item));
      return {
        ...prev,
        [rowId]: {
          mode: "custom",
          keys: nextKeys,
        },
      };
    });
  };

  const handleTogglePublishOption = (
    key: "title" | "short_description" | "long_description" | "keywords" | "attributes"
  ) => {
    setPublishFieldOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePublishSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select records to publish");
      return;
    }

    if (selectedWooHistoryRows.length === 0) {
      toast.error("No WooCommerce-linked records selected for publish");
      return;
    }

    if (selectedWooHistoryRows.length > 0 && selectedNonWooHistoryRows.length > 0) {
      toast.error("Please select only WooCommerce-linked records to publish");
      return;
    }

    const hasAtLeastOneField = Object.values(publishFieldOptions).some(Boolean);
    if (!hasAtLeastOneField) {
      toast.error("Select at least one generated field to publish");
      return;
    }

    initializeHistoryAttributeConfig();

    if (publishFieldOptions.attributes) {
      const invalidCustomSelection = selectedWooHistoryRows.some((row) => {
        const rowId = String(row._id);
        const rowKeys = getHistoryRowAttributeKeys(row);
        const config = attributePublishByHistoryId[rowId] || {
          mode: rowKeys.length > 0 ? ("all" as AttributePublishMode) : ("none" as AttributePublishMode),
          keys: rowKeys,
        };
        return config.mode === "custom" && rowKeys.length > 0 && config.keys.length === 0;
      });
      if (invalidCustomSelection) {
        toast.error("For custom mode, select at least one attribute key.");
        return;
      }
    }

    setIsPublishingSelected(true);

    let successCount = 0;
    let failedCount = 0;

    try {
      for (const row of selectedWooHistoryRows) {
        try {
          const rowId = String(row._id);
          const rowKeys = getHistoryRowAttributeKeys(row);
          const config = attributePublishByHistoryId[rowId] || {
            mode: rowKeys.length > 0 ? ("all" as AttributePublishMode) : ("none" as AttributePublishMode),
            keys: rowKeys,
          };
          const fields = { ...publishFieldOptions };
          let attributeKeys: string[] = [];

          if (fields.attributes) {
            if (config.mode === "none") {
              fields.attributes = false;
            } else if (config.mode === "custom") {
              attributeKeys = config.keys.filter((key) => rowKeys.includes(key));
            }
          }

          await axiosInstance.post(
            `/integrations/woocommerce/vision/publish/${row._id}`,
            {
            fields,
            attribute_mode: config.mode,
            attribute_keys: fields.attributes ? attributeKeys : [],
            }
          );
          successCount += 1;
        } catch {
          failedCount += 1;
        }
      }

      if (successCount > 0) {
        toast.success(`Published ${successCount} record(s) successfully`);
      }
      if (failedCount > 0) {
        toast.warning(`${failedCount} record(s) failed to publish`);
      }

      setAttributePublishByHistoryId((prev) => {
        const next = { ...prev };
        selectedWooHistoryRows.forEach((row) => {
          delete next[String(row._id)];
        });
        return next;
      });
      setShowHistoryPublish(false);
    } finally {
      setIsPublishingSelected(false);
    }
  };

  const handleExportSelected = async (format: string) => {
    if (selectedIds.length === 0) {
      toast.error("Please select files to export");
      return;
    }

    try {
      console.log("Exporting selected files:", selectedIds, "Format:", format);
      const res = await axiosInstance.post(
        `/vision/export-selected?format=${format}`,
        { ids: selectedIds },
        { responseType: "blob" }
      );

      console.log("Export response:", res);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob); // FIXED: Use createObjectURL instead of revokeObjectURL
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "excel" ? "visions_selected.xlsx" : `visions_selected.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      setShowHistoryExport(false);
      toast.success(`${format.toUpperCase()} exported successfully!`);
    } catch (error: any) {
      console.error("Export error:", error);
      console.error("Error response:", error?.response?.data);
      toast.error(error?.response?.data?.message || error?.response?.data?.error || "Export failed. Check console for details.");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select files to delete");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected record(s)? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/vision/delete-selected`,
        { ids: selectedIds }
      );

      toast.success(res.data.message || "Records deleted successfully!");
      setSelectedIds([]);
      fetchImgToTextData();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.response?.data?.message || error?.response?.data?.error || "Failed to delete records. Check console for details.");
    }
  };

  const handleUpdateStatus = async (resultId: string, newStatus: "approved" | "rejected") => {
    try {
      const res = await axiosInstance.post(
        `/vision/status/${resultId}`,
        { analysis_status: newStatus }
      );

      toast.success(res.data.message || `Record ${newStatus} successfully!`);
      
      if (resultId === selectedResultId) {
        setResultStatus(newStatus);
      }
      
      fetchImgToTextData();
    } catch (error: any) {
      console.error("Status update error:", error);
      toast.error(error?.response?.data?.message || error?.response?.data?.error || "Failed to update status. Check console for details.");
    }
  };

  // Helper to extract only Long Description content from full text
  const extractLongDescription = (text: string): string => {
    if (!text) return "";

    console.log(" Extracting Long Description from text length:", text.length);
    
    // CRITICAL: Try to extract the pure description content, not the entire formatted response
    
    // Strategy 1: Find content between "## Long Description" and "## Keywords"
    if (text.includes("## Long Description") && text.includes("## Keywords")) {
      const start = text.indexOf("## Long Description") + "## Long Description".length;
      const end = text.indexOf("## Keywords");
      const extracted = text.substring(start, end).trim();
      console.log(" Extracted between headers, length:", extracted.length);
      
      // Remove leading markdown and clean up
      return extracted.replace(/^#+\s+/gm, '').trim();
    }

    // Strategy 2: If only "## Long Description" exists, extract from there to end
    if (text.includes("## Long Description")) {
      const start = text.indexOf("## Long Description") + "## Long Description".length;
      let extracted = text.substring(start).trim();
      
      // Remove everything after "Keywords" or "Attributes"
      if (extracted.includes("Keywords")) {
        extracted = extracted.substring(0, extracted.indexOf("Keywords"));
      }
      if (extracted.includes("Attributes")) {
        extracted = extracted.substring(0, extracted.indexOf("Attributes"));
      }
      
      console.log(" Extracted from Long Description header, length:", extracted.length);
      return extracted.replace(/^#+\s+/gm, '').trim();
    }

    // Strategy 3: Look for "Long Description" (without markdown)
    if (text.toLowerCase().includes("long description")) {
      const idx = text.toLowerCase().indexOf("long description");
      let extracted = text.substring(idx + "long description".length).trim();
      
      // Remove everything after common section markers
      const markers = ["Keywords", "Attributes", "Short Description", "color:", "type:"];
      let minIdx = extracted.length;
      for (const marker of markers) {
        const markerIdx = extracted.indexOf(marker);
        if (markerIdx !== -1 && markerIdx < minIdx) {
          minIdx = markerIdx;
        }
      }
      if (minIdx < extracted.length) {
        extracted = extracted.substring(0, minIdx);
      }
      
      console.log(" Extracted from Long Description label, length:", extracted.length);
      return extracted.trim();
    }

    // Fallback: Return the text as-is, but cleaned
    console.log(" No Long Description marker found, returning cleaned text");
    return text.replace(/^#+\s+/gm, '').trim();
  };

  const handleSaveHistoryEdit = async () => {
    if (!selectedResultId) return;
    
    try {
      let descriptionOnly = editingText;
      
      // Extract from ## Long Description header
      const longDescMatch = editingText.match(/##\s+Long Description\s*\n([\s\S]*?)(?=##\s|\Z)/i);
      if (longDescMatch && longDescMatch[1]) {
        descriptionOnly = longDescMatch[1].trim();
      }
      
      console.log("Saving:", { id: selectedResultId, length: descriptionOnly.length });
      
      const res = await axiosInstance.post(
        `/vision/update/${selectedResultId}`,
        { longDescription: descriptionOnly }
      );

      console.log("Save response:", res.data);
      toast.success("Saved!");
      setHistoryEditMode(false);
      fetchImgToTextData();

      
      // Also update the result text if this is the currently selected result
      if (selectedResultId === exportResultId) {
        const updatedData = await axiosInstance.get(`/vision/list`);
        const refreshedItems = updatedData.data?.data || [];
        const updatedItem = refreshedItems.find((item: any) => item._id === selectedResultId);
        if (updatedItem) {
          setResultText(updatedItem.text);
        }
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Failed to save changes");
    }
  };

  const handleSaveSingleResult = async () => {
    if (!exportResultId) {
      toast.error("No result to save");
      return;
    }

    try {
      let descriptionOnly = resultText;
      
      // Extract from ## Long Description header
      const longDescMatch = resultText.match(/##\s+Long Description\s*\n([\s\S]*?)(?=##\s|\Z)/i);
      if (longDescMatch && longDescMatch[1]) {
        descriptionOnly = longDescMatch[1].trim();
      }
      
      console.log("Saving:", { id: exportResultId, length: descriptionOnly.length });
      
      const res = await axiosInstance.post(
        `/vision/update/${exportResultId}`,
        { longDescription: descriptionOnly }
      );

      console.log("Save response:", res.data);
      toast.success("Saved!");
      setEditMode(false);
      fetchImgToTextData();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Failed to save");
    }
  };

  const handleBulkRegenerateRejected = async () => {
    // Filter selected items to only rejected ones
    const rejectedItems = selectedIds
      .map(id => imgToTextData.find(f => f._id === id))
      .filter((item): item is FileRow => item !== undefined && item.status === 'rejected');

    if (rejectedItems.length === 0) {
      toast.error("No rejected items selected to regenerate");
      return;
    }

    const confirmed = window.confirm(
      `Regenerate ${rejectedItems.length} rejected record(s)? This will re-analyze the images.`
    );

    if (!confirmed) return;

    try {
      setIsProcessingBulk(true);
      setIsBulkMode(true);
      setCurrentSessionId(null);
      
      // Show items in Results panel as processing
      const processingItems = rejectedItems.map(item => ({
        ...item,
        analysis_status: 'pending',
        id: item._id
      }));
      setBulkResults(processingItems);
      
      const res = await axiosInstance.post(
        `/vision/bulk-regenerate`,
        {
          ids: rejectedItems.map(i => i._id),
          language,
        }
      );

      console.log("Regenerate response:", res.data);
      toast.success("Regenerating...");
      setSelectedIds([]);
      setShowBulkRegenerateMenu(false);
      
      // Switch to Results tab to see regenerating items
      setActiveTab("Results");
      
      // Start polling to update results
      if (res.data?.bulkSessionId) {
        setCurrentSessionId(res.data.bulkSessionId);
      } else {
        toast.error("Unable to start regenerate session. Please try again.");
        setIsProcessingBulk(false);
      }
      
    } catch (error: any) {
      console.error("Regenerate error:", error);
      toast.error(error?.response?.data?.message || "Failed to regenerate");
      setBulkResults([]);
      setIsProcessingBulk(false);
      setIsBulkMode(false);
    }
  };

  const stats = {
    totalLimit:
      aiVisionTotalLimit ??
      packageLimitData?.aiVisionLimit ??
      packageLimitData?.ai_vision_limit ??
      0,
    availableLimit: (() => {
      const userUsage =
        userData?.apiUseAiVisionLimit ?? userData?.api_use_ai_vision_limit;
      if (userUsage !== undefined && userUsage !== null) return userUsage;
      const storeUsage =
        limitData?.apiUseAiVisionLimit ?? limitData?.api_use_ai_vision_limit;
      if (storeUsage !== undefined && storeUsage !== null) return storeUsage;
      return 0;
    })(),
  };

  const singleResultAttributeStateKey = selectedResultId || "__single_result__";
  const availableSingleResultAttributeKeys = extractAttributeKeysFromText(resultText || "");
  const singleResultAttributeEntries = extractAttributeEntriesFromText(resultText || "");
  const hiddenSingleResultAttributeKeys =
    hiddenResultAttributeKeysByResultId[singleResultAttributeStateKey] || [];
  const selectedSingleResultAttributeKeys = availableSingleResultAttributeKeys.filter(
    (key) => !hiddenSingleResultAttributeKeys.includes(key)
  );

  const getDisplayedSingleResultText = () => {
    if (!resultText) return "";
    if (editMode) return resultText;
    const filtered =
      availableSingleResultAttributeKeys.length > 0
        ? filterAttributesInText(resultText, selectedSingleResultAttributeKeys)
        : resultText;
    return prettifyAttributeSectionText(filtered);
  };

  const displayedSingleResultText = getDisplayedSingleResultText();

  const toggleSingleResultAttributeKey = (key: string) => {
    setHiddenResultAttributeKeysByResultId((prev) => {
      const current = prev[singleResultAttributeStateKey] || [];
      const next = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];
      return {
        ...prev,
        [singleResultAttributeStateKey]: next,
      };
    });
  };

  const getBulkResultAttributeConfig = (item: any, index: number) => {
    const rowId = String(item?._id ?? item?.id ?? `bulk_${index}`);
    const rawText = item?.text || item?.long_description || "";
    const availableKeys = extractAttributeKeysFromText(rawText);
    const hiddenKeys = hiddenBulkAttributeKeysByResultId[rowId] || [];
    const selectedKeys = availableKeys.filter((key) => !hiddenKeys.includes(key));
    const displayText =
      availableKeys.length > 0
        ? prettifyAttributeSectionText(filterAttributesInText(rawText, selectedKeys))
        : prettifyAttributeSectionText(rawText);

    return {
      rowId,
      rawText,
      availableKeys,
      selectedKeys,
      displayText,
    };
  };

  const toggleBulkResultAttributeKey = (rowId: string, key: string) => {
    setHiddenBulkAttributeKeysByResultId((prev) => {
      const current = prev[rowId] || [];
      const next = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];

      return {
        ...prev,
        [rowId]: next,
      };
    });
  };

  return (
    <>
      <div className="main-content-common">
        <CommonTrailBar />
        <div className="global-link-limit-section">
          <div className="short-link-text">
            <ShortLink />
          </div>
          <div>
            <PayChatData stats={stats} />
          </div>
        </div>

        {!isCheckingOnboarding && !isOnboardingCompleted && (
          <div className="alert alert-warning d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mt-3">
            <span>
              Company onboarding is mandatory for Product Analyser uploads.
              Please complete company onboarding first.
            </span>
            <button
              type="button"
              className="btn btn-dark btn-sm"
              onClick={() => navigate("/company-onboarding")}
            >
              Complete Onboarding
            </button>
          </div>
        )}

        <div className="row">
          {activeTab === "Results" ? (
            <>
              {/* Left Panel */}
              <div className="col-md-4">
                <div className="left-panel-image card-ui">
                  <div className="content-wrapper-image-generate">
                    {/* Wrap everything in a form */}
                    <form onSubmit={handleSubmit}>
                      {/* Image Upload */}
                      <div className="smart-ai-prompt-are">
                        <label>Image Upload</label>
                        <div className="upload-area">
                          <input
                            type="file"
                            accept="image/*"
                            className="file-input"
                            id="image-upload"
                            ref={imageInputRef}
                            name="image" // IMPORTANT: Add name attribute
                            disabled={!!excelFile || isProcessingBulk || isProcessingSingle}
                            onClick={(e) => {
                              if (isCheckingOnboarding || !isOnboardingCompleted) {
                                e.preventDefault();
                                showOnboardingRequired();
                              }
                            }}
                            onChange={(e) => {
                              if (!isOnboardingCompleted) {
                                e.target.value = "";
                                showOnboardingRequired();
                                return;
                              }
                              const file = e.target.files?.[0];
                              if (file && file.size <= 100 * 1024 * 1024) {
                                setImageFile(file);
                                setExcelFile(null);
                                setIsBulkMode(false);
                                setBulkResults([]);
                                setCurrentSessionId(null);
                                setShowInlineCrop(false);
                                setCropRect({ x: 20, y: 20, size: 120 });
                              } else {
                                alert("File size exceeds the maximum limit of 100MB");
                              }
                            }}
                          />
                          {!imageFile ? (
                            <>
                              <button className="upload-btn" type="button">
                                <img src={adminImage.UploadIcon} alt="upload" />
                              </button>
                              <p className="upload-title">Only Upload Image file here</p>
                              <p className="upload-subtitle">Max Size 100MB</p>
                              <label
                                htmlFor="image-upload"
                                className="file-label"
                                onClick={(e) => {
                                  if (isCheckingOnboarding || !isOnboardingCompleted) {
                                    e.preventDefault();
                                    showOnboardingRequired();
                                  }
                                }}
                                style={excelFile ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
                              >
                                Upload Image
                              </label>
                            </>
                          ) : (
                            <div style={{ width: "100%" }}>
                              {singleImagePreview && (
                                <div
                                  style={{
                                    width: "100%",
                                    border: "1px solid #334155",
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                    background: "#0f172a",
                                  }}
                                >
                                  <img
                                    src={singleImagePreview}
                                    alt="Selected preview"
                                    style={{
                                      width: "100%",
                                      maxHeight: "220px",
                                      objectFit: "cover",
                                      cursor: "crosshair",
                                    }}
                                    onClick={() => setShowInlineCrop((prev) => !prev)}
                                  />
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#cbd5e1",
                                      padding: "8px 10px",
                                      borderTop: "1px solid #1e293b",
                                    }}
                                  >
                                    Click image to open crop options
                                  </div>
                                </div>
                              )}

                              {showInlineCrop && (
                                <div
                                  className="mt-2 p-2 rounded"
                                  style={{
                                    border: "1px solid #334155",
                                    background: "#111827",
                                    color: "#e2e8f0",
                                  }}
                                >
                                  <div className="mb-2" style={{ fontSize: "12px", color: "#94a3b8" }}>
                                    Drag the square to move. Drag corner to resize.
                                  </div>

                                  <div
                                    style={{
                                      position: "relative",
                                      width: "100%",
                                      borderRadius: "8px",
                                      overflow: "hidden",
                                      border: "1px solid #334155",
                                      background: "#0b1220",
                                    }}
                                  >
                                    <img
                                      ref={cropImageRef}
                                      src={singleImagePreview || ""}
                                      alt="Crop editor"
                                      onLoad={handleCropEditorImageLoad}
                                      style={{
                                        width: "100%",
                                        height: "auto",
                                        display: "block",
                                        userSelect: "none",
                                        pointerEvents: "none",
                                      }}
                                    />
                                    <div
                                      onMouseDown={(e) => beginCropDrag("move", e)}
                                      style={{
                                        position: "absolute",
                                        left: `${cropRect.x}px`,
                                        top: `${cropRect.y}px`,
                                        width: `${cropRect.size}px`,
                                        height: `${cropRect.size}px`,
                                        border: "2px solid #38bdf8",
                                        background: "rgba(56, 189, 248, 0.16)",
                                        boxShadow: "0 0 0 9999px rgba(2, 6, 23, 0.45)",
                                        cursor: cropDragMode === "move" ? "grabbing" : "move",
                                      }}
                                    >
                                      <div
                                        onMouseDown={(e) => beginCropDrag("resize", e)}
                                        style={{
                                          position: "absolute",
                                          right: "-6px",
                                          bottom: "-6px",
                                          width: "12px",
                                          height: "12px",
                                          borderRadius: "2px",
                                          background: "#38bdf8",
                                          border: "1px solid #fff",
                                          cursor: "nwse-resize",
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div className="d-flex gap-2 mt-2">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-light"
                                      onClick={handleApplyInlineCrop}
                                      disabled={isCroppingImage}
                                    >
                                      {isCroppingImage ? "Cropping..." : "Apply Crop"}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => setShowInlineCrop(false)}
                                      disabled={isCroppingImage}
                                    >
                                      Close
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="d-flex gap-2 mt-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-light"
                                  onClick={() => imageInputRef.current?.click()}
                                  disabled={isProcessingSingle}
                                >
                                  Change
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => {
                                    setImageFile(null);
                                    setShowInlineCrop(false);
                                  }}
                                  disabled={isProcessingSingle}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Excel Upload */}
                      <div className="smart-ai-prompt-are mt-4">
                        <label>Excel Upload</label>
                        <div className="upload-area">
                          <button className="upload-btn" type="button">
                            <img src={adminImage.UploadIcon} alt="upload" />
                          </button>
                          <p className="upload-title">Upload Excel file here</p>
                          <p className="upload-subtitle">Max Size 10MB</p>
                          <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            className="file-input"
                            id="excel-upload"
                            name="excel" // IMPORTANT: Add name attribute
                            disabled={!!imageFile || isProcessingBulk || isProcessingSingle}
                            onClick={(e) => {
                              if (isCheckingOnboarding || !isOnboardingCompleted) {
                                e.preventDefault();
                                showOnboardingRequired();
                              }
                            }}
                            onChange={(e) => {
                              if (!isOnboardingCompleted) {
                                e.target.value = "";
                                showOnboardingRequired();
                                return;
                              }
                              const file = e.target.files?.[0];
                              if (file && file.size <= 10 * 1024 * 1024) {
                                setExcelFile(file);
                                setImageFile(null);
                                setSingleImagePreview(null);
                                setShowInlineCrop(false);
                              } else {
                                alert("File size exceeds 10MB");
                              }
                            }}
                          />
                          <label
                            htmlFor="excel-upload"
                            className="file-label"
                            onClick={(e) => {
                              if (isCheckingOnboarding || !isOnboardingCompleted) {
                                e.preventDefault();
                                showOnboardingRequired();
                              }
                            }}
                            style={imageFile ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
                          >
                            Upload Excel
                          </label>
                        </div>
                      </div>
                      {excelFile && (
                        <div className="mt-2">
                          <div className="alert alert-info p-2 d-flex justify-content-between align-items-center">
                            <span>
                              Excel file selected: <strong>{excelFile.name}</strong>
                              <br />
                              <small>
                                {currentSessionId ? (
                                  <>
                                    Session: <code>{currentSessionId.substring(0, 10)}...</code>  
                                    Click "Generate" to start
                                  </>
                                ) : (
                                  "Click 'Generate' to start processing"
                                )}
                              </small>
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                setExcelFile(null);
                                setIsBulkMode(false);
                                setBulkResults([]);
                                setCurrentSessionId(null);
                                setIsProcessingBulk(false);
                              }}
                              disabled={isProcessingBulk}
                            >
                              {isProcessingBulk ? "Processing..." : "Remove"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Prompt Selector */}
                      <div className="text-to-image-item">
                        <label>Select Prompt</label>
                        <div className="select-item-data">
                          <select
                            className="form-select"
                            value={selectedPrompt}
                            onChange={(e) => setSelectedPrompt(e.target.value)}
                          >
                            <option value="">Select Product Type</option>
                            {prompts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title || `Prompt ${p.id}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Language Selector */}
                      <div className="text-to-image-item">
                        <label>Select Language</label>
                        <div className="select-item-data">
                          <div>
                            <img src={adminImage.LanguageIcon} alt="language" />
                          </div>
                          <select
                            className="form-select"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                          >
                            <option value="">Select</option>
                            {Post_language.map((lang, i) => (
                              <option key={i} value={lang.value}>
                                {lang.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="input-container mt-4">
                        <button 
                          type="submit" // Change to type="submit"
                          className="generate-btn btn-image"
                          disabled={
                            !isOnboardingCompleted ||
                            isCheckingOnboarding ||
                            isProcessingBulk ||
                            isProcessingSingle
                          }
                        >
                          <span className="btn-icon">*</span>
                            {isCheckingOnboarding
                              ? "Checking..."
                              : isProcessingSingle || isProcessingBulk
                              ? "Processing... Please wait"
                              : isOnboardingCompleted
                              ? "Generate"
                              : "Complete Onboarding Required"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div className="col-sm-12 col-md-8 col-lg-8 col-xl-8">
                <div className="right-panel card-ui">
                  {/* Tabs Header */}
                  <div className="tabs-global generate-file-header">
                    <div className="tabs-button-section">
                      {activeTab !== "Results" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-light me-2"
                          onClick={() => setActiveTab("Results")}
                          title="Back to Results"
                          aria-label="Back to Results"
                        >
                          <FiArrowLeft />
                        </button>
                      )}
                      <div
                        className={`tab-chatbot ${activeTab === "Results" ? "active" : ""}`}
                        onClick={() => setActiveTab("Results")}
                      >
                        Results
                      </div>
                      <div
                        className={`tab-chatbot ${activeTab !== "Results" ? "active" : ""}`}
                        onClick={() => setActiveTab("Files")}
                      >
                        History
                      </div>
                    </div>

                    {/* Export & Copy Buttons */}
                    <div className="button-group-download">
                      <div style={{ position: "relative" }}>
                        <button
                          className="btn btn-light"
                          type="button"
                          disabled={!resultText}
                          onClick={() => setShowExport((prev) => !prev)}
                        >
                          Export
                        </button>

                        {showExport && (
                          <ul
                            className="dropdown-menu show"
                            style={{
                              position: "absolute",
                              top: "100%",
                              right: 0,
                              display: "block",
                              zIndex: 1000,
                            }}
                          >
                            <li>
                              <button className="dropdown-item" onClick={() => handleExport("pdf")}>
                                PDF
                              </button>
                            </li>
                            <li>
                              <button className="dropdown-item" onClick={() => handleExport("json")}>
                                JSON
                              </button>
                            </li>
                            <li>
                              <button className="dropdown-item" onClick={() => handleExport("csv")}>
                                CSV
                              </button>
                            </li>
                            <li>
                              <button className="dropdown-item" onClick={() => handleExport("excel")}>
                                Excel
                              </button>
                            </li>
                          </ul>
                        )}
                      </div>

                      <button className="btn copy" onClick={handleCopyText} title="Copy Text">
                        <img src={adminImage.CopyIcon} alt="copy" />
                      </button>
                    </div>
                  </div>

                  {/* Results or History */}
                  {activeTab === "Results" ? (
                    <div className="Results-list">
                      {/* Edit Button */}
                      <div className="d-flex justify-content-end mb-2">
                        {resultText && (
                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => setEditMode(!editMode)}
                            title={editMode ? "View Mode" : "Edit Text"}
                          >
                            {editMode ? "View" : <FiEdit />}
                          </button>
                        )}
                      </div>

                      {!isBulkMode && isProcessingSingle && (
                        <div
                          className="alert mb-3"
                          style={{
                            background: "#1e293b",
                            color: "#e2e8f0",
                            border: "1px solid #334155",
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <div className="spinner-border spinner-border-sm me-2" role="status" />
                            <div>
                              Processing image analysis...
                              <small className="d-block" style={{ color: "#94a3b8" }}>
                                Please wait while AI generates the result
                              </small>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ================= BULK IMAGE RESULTS (EXCEL ONLY) ================= */}
                      {isBulkMode && (
                        <>
                          {isProcessingBulk && bulkResults.some((item: any) => !item.text && !item.long_description) && (
                            <div className="alert alert-info">
                              <div className="d-flex align-items-center">
                                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                <div>
                                  Processing {bulkResults.filter((item: any) => !item.text && !item.long_description).length} images...
                                  <small className="d-block text-muted">Results will update automatically</small>
                                </div>
                              </div>
                            </div>
                          )}

                          {bulkResults.length > 0 && (
                            <div
                              className="bulk-results-container"
                              style={{ 
                                maxHeight: "650px", 
                                overflowY: "auto",
                                background: "#0f172a",
                                padding: "8px",
                                borderRadius: "12px"
                              }}
                            >
                              {bulkResults.map((item, index) => {
                                let cardBgColor = "#ffffff";
                                let cardBorderColor = "#e5e7eb";
                                let cardTextColor = "#000000";
                                
                                if (item.analysis_status === "pending") {
                                  cardBgColor = "#1f2937";
                                  cardBorderColor = "#f59e0b";
                                  cardTextColor = "#fef3c7";
                                } else if (item.analysis_status === "rejected") {
                                  cardBgColor = "#450a0a";
                                  cardBorderColor = "#ef4444";
                                  cardTextColor = "#fee2e2";
                                } else if (item.analysis_status === "approved") {
                                  cardBgColor = "#064e3b";
                                  cardBorderColor = "#10b981";
                                  cardTextColor = "#d1fae5";
                                } else {
                                  cardBgColor = "#1e293b";
                                  cardBorderColor = "#64748b";
                                  cardTextColor = "#e2e8f0";
                                }
                                const bulkAttr = getBulkResultAttributeConfig(item, index);
                                const bulkAttributeEntries = extractAttributeEntriesFromText(
                                  bulkAttr.rawText
                                );
                                
                                return (
                                  <div
                                    key={item.id || item._id || index}
                                    className="card mb-3"
                                    style={{
                                      border: `2px solid ${cardBorderColor}`,
                                      borderRadius: "10px",
                                      padding: "14px",
                                      backgroundColor: cardBgColor,
                                      color: cardTextColor,
                                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)"
                                    }}
                                  >
                                    {/* HEADER with status badge */}
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <div>
                                        <strong className="me-2" style={{ color: "#f8fafc" }}>Image {index + 1}</strong>
                                        <span className={`badge ${
                                          item.analysis_status === 'approved' ? 'bg-success' :
                                          item.analysis_status === 'rejected' ? 'bg-danger' :
                                          item.analysis_status === 'pending' ? 'bg-warning' :
                                          'bg-secondary'
                                        }`}>
                                          {item.analysis_status}
                                        </span>
                                      </div>

                                      {(item.analysis_status === "completed" || (item.text || item.long_description)) && item.analysis_status !== "approved" && item.analysis_status !== "rejected" && (
                                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                          <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleUpdateStatus(item.id, "approved")}
                                            disabled={item.analysis_status === "approved"}
                                            title="Approve this result"
                                            style={{ 
                                              background: "rgba(16, 185, 129, 0.2)",
                                              color: "#10b981",
                                              border: "1px solid #10b981"
                                            }}
                                          >
                                            Approve
                                          </button>
                                          <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleUpdateStatus(item.id, "rejected")}
                                            disabled={item.analysis_status === "rejected"}
                                            title="Reject this result"
                                            style={{ 
                                              background: "rgba(239, 68, 68, 0.2)",
                                              color: "#ef4444",
                                              border: "1px solid #ef4444"
                                            }}
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* IMAGE PREVIEW - Thumbnail only, no URL */}
                                    <div className="mb-3">
                                      <div className="d-flex align-items-start gap-3">
                                        {/* Image Thumbnail */}
                                        <div className="flex-shrink-0">
                                          <div 
                                            className="position-relative rounded overflow-hidden"
                                            style={{
                                              width: "100px",
                                              height: "100px",
                                              border: "2px solid #4b5563",
                                              backgroundColor: "#1f2937",
                                              cursor: "pointer"
                                            }}
                                            onClick={() => {
                                              console.log('Image item:', item);
                                              console.log(' image_path:', item.image_path);
                                              if (item.image_path) {
                                                setSelectedImage(item.image_path);
                                              } else {
                                                console.log(' image_path is missing, trying to fetch latest data');
                                                toast.warning("Image path not available");
                                              }
                                            }}
                                          >
                                            {item.vision_image_url || item.image_path ? (
                                              <img
                                                src={getImagePreview(item.vision_image_url || item.image_path || '')}
                                                alt={`Image ${index + 1}`}
                                                className="w-100 h-100 object-fit-cover"
                                                style={{ 
                                                  transition: "transform 0.2s",
                                                  objectFit: "cover"
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                                onError={(e) => {
                                                  e.currentTarget.style.display = 'none';
                                                  const parent = e.currentTarget.parentElement;
                                                  if (parent) {
                                                    const fallback = document.createElement('div');
                                                    fallback.className = 'w-100 h-100 d-flex align-items-center justify-content-center';
                                                    fallback.style.background = "#374151";
                                                    fallback.innerHTML = `
                                                      <div class="text-center">
                                                        <div style="color: #9ca3af; font-size: 24px;">Image</div>
                                                        <small class="text-muted d-block mt-1">Preview</small>
                                                      </div>
                                                    `;
                                                    parent.appendChild(fallback);
                                                  }
                                                }}
                                              />
                                            ) : (
                                              <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "#374151" }}>
                                                <div className="text-center">
                                                  <div style={{ color: "#9ca3af", fontSize: "24px" }}>Image</div>
                                                  <small className="text-muted d-block mt-1">No Image</small>
                                                </div>
                                              </div>
                                            )}
                                            {/* Loading overlay for pending images */}
                                            {item.analysis_status === "pending" && !item.text && !item.long_description && (
                                              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                                style={{ background: "rgba(0, 0, 0, 0.7)" }}>
                                                <div className="spinner-border spinner-border-sm text-warning"></div>
                                              </div>
                                            )}
                                            {/* Click to enlarge hint */}
                                            <div className="position-absolute bottom-0 start-0 w-100 text-center py-1"
                                              style={{ 
                                                background: "rgba(0, 0, 0, 0.6)", 
                                                color: "#fff",
                                                fontSize: "10px",
                                                opacity: "0.8"
                                              }}>
                                              Click to enlarge
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Image info without URL */}
                                        <div className="flex-grow-1">
                                          <div className="mb-1">
                                            <strong style={{ color: "#f8fafc" }}>Image {index + 1}</strong>
                                            <small className="d-block text-muted mt-1">
                                              {item.analysis_status === 'pending' ? 'Processing...' : 
                                               item.analysis_status === 'completed' ? 'Analysis complete' : 
                                               item.analysis_status === 'approved' ? 'Approved' : 
                                               item.analysis_status === 'rejected' ? 'Rejected' : 'Ready'}
                                            </small>
                                          </div>
                                          
                                          {/* Quick status info */}
                                          <div className="d-flex align-items-center gap-2 mt-2">
                                            <span className={`badge ${
                                              item.analysis_status === 'approved' ? 'bg-success' :
                                              item.analysis_status === 'rejected' ? 'bg-danger' :
                                              item.analysis_status === 'pending' ? 'bg-warning' :
                                              'bg-secondary'
                                            }`}>
                                              {item.analysis_status}
                                            </span>
                                            {item.score !== null && item.score !== undefined && (
                                              <small style={{ 
                                                color: item.score >= 80 ? "#10b981" : 
                                                       item.score >= 50 ? "#f59e0b" : "#ef4444",
                                                fontWeight: "bold"
                                              }}>
                                                {item.score}%
                                              </small>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* GENERATED RESULT */}
                                    <div className="mt-3">
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                        <small style={{ color: "#94a3b8" }}>Analysis Result:</small>
                                        {!(historyEditMode && selectedResultId === item._id) && (
                                          <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => {
                                              setSelectedResultId(item._id);
                                              setHistoryEditMode(true);
                                              setEditingText(extractLongDescription(item.text || item.long_description || ""));
                                            }}
                                            title="Edit this result"
                                          >
                                            Edit
                                          </button>
                                        )}
                                      </div>
                                      <div
                                        className="p-3 rounded"
                                        style={{
                                          background: "rgba(0, 0, 0, 0.3)",
                                          fontSize: "14px",
                                          minHeight: "200px",
                                          border: "1px solid rgba(255, 255, 255, 0.1)",
                                          color: "#e2e8f0",
                                          lineHeight: "1.6"
                                        }}
                                      >
                                        {historyEditMode && selectedResultId === item._id ? (
                                          <div>
                                            <textarea
                                              value={editingText}
                                              onChange={(e) => setEditingText(e.target.value)}
                                              style={{
                                                width: "100%",
                                                height: "300px",
                                                background: "#1f2937",
                                                color: "#e2e8f0",
                                                border: "1px solid #4b5563",
                                                borderRadius: "4px",
                                                padding: "12px",
                                                fontFamily: "inherit",
                                                fontSize: "14px",
                                                lineHeight: "1.6"
                                              }}
                                            />
                                            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                                              <button
                                                className="btn btn-sm btn-success"
                                                onClick={handleSaveHistoryEdit}
                                              >
                                                Save Changes
                                              </button>
                                              <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => {
                                                  setHistoryEditMode(false);
                                                  setSelectedResultId(null);
                                                }}
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ) : !item.text && !item.long_description && item.analysis_status === 'pending' ? (
                                          <div className="text-center py-4" style={{ color: "#fbbf24" }}>
                                            <div className="spinner-border spinner-border-sm me-2" style={{ color: "#fbbf24" }}></div>
                                            Processing image analysis...
                                          </div>
                                        ) : item.analysis_status === 'rejected' && !item.text && !item.long_description ? (
                                          <div className="text-center py-4" style={{ color: "#f87171" }}>
                                             Processing failed. Re-generate or try again.
                                          </div>
                                        ) : (
                                          <div style={{ color: "#e2e8f0", whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                                            <ReactMarkdown>{bulkAttr.displayText || "No analysis available"}</ReactMarkdown>
                                          </div>
                                        )}
                                      </div>
                                      {!(
                                        historyEditMode && selectedResultId === item._id
                                      ) &&
                                        bulkAttributeEntries.length > 0 && (
                                          <div
                                            style={{
                                              marginTop: "10px",
                                              border: "1px solid rgba(148, 163, 184, 0.28)",
                                              borderRadius: "8px",
                                              padding: "10px",
                                              background: "rgba(15, 23, 42, 0.45)",
                                            }}
                                          >
                                            <div
                                              style={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                marginBottom: "8px",
                                                color: "#cbd5e1",
                                              }}
                                            >
                                              Inline attributes toggle (compare)
                                            </div>
                                            <div style={{ display: "grid", gap: "6px" }}>
                                              {bulkAttributeEntries.map((entry) => (
                                                <label
                                                  key={`${bulkAttr.rowId}-inline-${entry.key}`}
                                                  style={{ fontSize: "12px", color: "#e2e8f0" }}
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={bulkAttr.selectedKeys.includes(entry.key)}
                                                    onChange={() =>
                                                      toggleBulkResultAttributeKey(
                                                        bulkAttr.rowId,
                                                        entry.key
                                                      )
                                                    }
                                                  />{" "}
                                                  {entry.line}
                                                </label>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                    </div>

                                    {/* CONFIDENCE SCORE */}
                                    {(item.score !== null && item.score !== undefined) && (
                                      <div className="mt-3">
                                        <div className="d-flex align-items-center">
                                          <div
                                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                              width: "40px",
                                              height: "40px",
                                              background: item.score >= 80 ? "#10b981" : 
                                                         item.score >= 50 ? "#f59e0b" : "#ef4444",
                                              color: "#ffffff",
                                              fontWeight: "bold",
                                              fontSize: "14px",
                                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)"
                                            }}
                                          >
                                            {item.score}%
                                          </div>
                                          <div>
                                            <div style={{ 
                                              fontWeight: "bold",
                                              color: item.score >= 80 ? "#34d399" : 
                                                     item.score >= 50 ? "#fbbf24" : "#f87171"
                                            }}>
                                              {item.score >= 80 ? "High Confidence" : 
                                               item.score >= 50 ? "Medium Confidence" : "Low Confidence"}
                                            </div>
                                            <div style={{ 
                                              fontSize: "12px", 
                                              color: "#94a3b8" 
                                            }}>
                                              Confidence Score
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {bulkResults.length === 0 && !isProcessingBulk && (
                            <div className="alert alert-warning" style={{ 
                              background: "#1e293b",
                              color: "#e2e8f0",
                              border: "1px solid #475569"
                            }}>
                              No bulk results found. Please upload an Excel file and start processing.
                            </div>
                          )}
                        </>
                      )}

                      {/* ================= SINGLE IMAGE ================= */}
                      {!excelFile && (
                        resultText ? (
                          <>
                            {editMode && (
                              <div style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={handleSaveSingleResult}
                                >
                                  Save Changes
                                </button>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => setEditMode(false)}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                            {editMode ? (
                              <textarea
                                value={resultText}
                                onChange={(e) => setResultText(e.target.value)}
                                style={{
                                  width: "100%",
                                  minHeight: "300px",
                                  padding: "12px",
                                  background: "#1f2937",
                                  color: "#e2e8f0",
                                  border: "1px solid #4b5563",
                                  borderRadius: "4px",
                                  fontFamily: "inherit",
                                  fontSize: "14px",
                                  lineHeight: "1.6",
                                  resize: "vertical"
                                }}
                              />
                            ) : (
                              <>
                                <div className="chat-style-result-box markdown-output">
                                  <ReactMarkdown>{displayedSingleResultText}</ReactMarkdown>
                                </div>
                                {singleResultAttributeEntries.length > 0 && (
                                  <div
                                    style={{
                                      marginTop: "10px",
                                      border: "1px solid rgba(148, 163, 184, 0.28)",
                                      borderRadius: "8px",
                                      padding: "10px",
                                      background: "rgba(15, 23, 42, 0.65)",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        marginBottom: "8px",
                                        color: "#cbd5e1",
                                      }}
                                    >
                                      Inline attributes toggle (compare)
                                    </div>
                                    <div style={{ display: "grid", gap: "6px" }}>
                                      {singleResultAttributeEntries.map((entry) => (
                                        <label key={`single-inline-${entry.key}`} style={{ fontSize: "12px", color: "#e2e8f0" }}>
                                          <input
                                            type="checkbox"
                                            checked={selectedSingleResultAttributeKeys.includes(entry.key)}
                                            onChange={() => toggleSingleResultAttributeKey(entry.key)}
                                          />{" "}
                                          {entry.line}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        ): null
                      )}

                      {/* Confidence Score */}
                      {score !== null && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            marginTop: "14px",
                          }}
                        >
                          <div
                            style={{
                              width: "56px",
                              height: "56px",
                              borderRadius: "50%",
                              background: getConfidenceLabel(score)?.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "16px",
                              color: "#fff",
                            }}
                          >
                            {score}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: "15px",
                                color: getConfidenceLabel(score)?.color,
                              }}
                            >
                              {getConfidenceLabel(score)?.label}
                            </div>
                            <div style={{ fontSize: "12px", color: "#9ca3af" }}>Confidence Score</div>
                          </div>
                        </div>
                      )}

                      {/* Approve/Reject Buttons */}
                      {selectedResultId && (
                        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                          <button
                            className="btn btn-success btn-sm flex-grow-1"
                            onClick={() => handleUpdateStatus(selectedResultId, "approved")}
                            disabled={resultStatus === "approved"}
                            title={resultStatus === "approved" ? "Already approved" : "Approve this result"}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm flex-grow-1"
                            onClick={() => handleUpdateStatus(selectedResultId, "rejected")}
                            disabled={resultStatus === "rejected"}
                            title={resultStatus === "rejected" ? "Already rejected" : "Reject this result"}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* HISTORY TABLE UI */}
              <div className="history-table-wrapper">
                {/* TOP CONTROLS */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    marginBottom: "12px",
                    gap: "12px",
                  }}
                  >
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm"
                      onClick={() => setActiveTab("Results")}
                      title="Back to Results"
                      aria-label="Back to Results"
                    >
                      <FiArrowLeft />
                    </button>
                    <button 
                      className="btn btn-light btn-sm"
                      onClick={handleSelectAll}
                    >
                      {selectedIds.length === imgToTextData.length && imgToTextData.length > 0
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    
                    {/* EXPORT SELECTED DROPDOWN */}
                    <div style={{ position: "relative" }}>
                      <button 
                        className="btn btn-light btn-sm"
                        disabled={selectedIds.length === 0}
                        onClick={() => setShowHistoryExport(!showHistoryExport)}
                      >
                        Export Selected ({selectedIds.length})
                      </button>

                      {showHistoryExport && (
                        <ul
                          className="dropdown-menu show"
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            display: "block",
                            zIndex: 1000,
                          }}
                        >
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleExportSelected("pdf")}
                            >
                              PDF
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleExportSelected("json")}
                            >
                              JSON
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleExportSelected("csv")}
                            >
                              CSV
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleExportSelected("excel")}
                            >
                              Excel
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>

                    <div style={{ position: "relative" }}>
                      <button
                        className="btn btn-light btn-sm"
                        disabled={selectedIds.length === 0}
                        onClick={() => {
                          setShowHistoryPublish((prev) => {
                            const next = !prev;
                            if (next) {
                              setSelectedAttributeKeys(selectedHistoryAttributeKeys);
                            }
                            return next;
                          });
                        }}
                      >
                        Publish Selected ({selectedIds.length})
                        </button>

                      {showHistoryPublish && (
                        <div
                          className="dropdown-menu show"
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            display: "block",
                            zIndex: 1000,
                            minWidth: "320px",
                            padding: "10px",
                          }}
                        >
                          <div style={{ fontSize: "12px", marginBottom: "8px", opacity: 0.8 }}>
                            WooCommerce selected: {selectedWooHistoryRows.length} of {selectedIds.length}
                          </div>
                          <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>
                            Select generated fields to publish
                          </div>

                          <label className="dropdown-item" style={{ cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={publishFieldOptions.title}
                              onChange={() => handleTogglePublishOption("title")}
                            />{" "}
                            Title
                          </label>
                          <label className="dropdown-item" style={{ cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={publishFieldOptions.short_description}
                              onChange={() => handleTogglePublishOption("short_description")}
                            />{" "}
                            Short Description
                          </label>
                          <label className="dropdown-item" style={{ cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={publishFieldOptions.long_description}
                              onChange={() => handleTogglePublishOption("long_description")}
                            />{" "}
                            Long Description
                          </label>
                          <label className="dropdown-item" style={{ cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={publishFieldOptions.keywords}
                              onChange={() => handleTogglePublishOption("keywords")}
                            />{" "}
                            Keywords
                          </label>
                          <label className="dropdown-item" style={{ cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={publishFieldOptions.attributes}
                              onChange={() => handleTogglePublishOption("attributes")}
                            />{" "}
                            Attributes
                          </label>

                          {publishFieldOptions.attributes && selectedHistoryAttributeKeys.length > 0 && (
                            <div
                              style={{
                                marginTop: "8px",
                                borderTop: "1px solid rgba(255,255,255,0.08)",
                                paddingTop: "8px",
                                maxHeight: "160px",
                                overflowY: "auto",
                              }}
                            >
                              <div style={{ fontSize: "12px", marginBottom: "6px" }}>
                                Select attribute keys
                              </div>
                              <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-light"
                                  onClick={() => setSelectedAttributeKeys(selectedHistoryAttributeKeys)}
                                >
                                  All
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-light"
                                  onClick={() => setSelectedAttributeKeys([])}
                                >
                                  Clear
                                </button>
                              </div>
                              {selectedHistoryAttributeKeys.map((key) => (
                                <label
                                  key={key}
                                  className="dropdown-item"
                                  style={{ cursor: "pointer" }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedAttributeKeys.includes(key)}
                                    onChange={() => toggleAttributeKey(key)}
                                  />{" "}
                                  {key}
                                </label>
                              ))}
                            </div>
                          )}

                          <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={handlePublishSelected}
                              disabled={isPublishingSelected}
                            >
                              {isPublishingSelected ? "Publishing..." : "Publish"}
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => setShowHistoryPublish(false)}
                              disabled={isPublishingSelected}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="btn btn-light btn-sm" 
                      disabled={selectedIds.length === 0 || isProcessingBulk}
                      onClick={handleDeleteSelected}
                    >
                      Delete Selected
                    </button>

                    <div style={{ position: "relative" }}>
                      <button 
                        className="btn btn-warning btn-sm" 
                        disabled={selectedIds.length === 0 || isProcessingBulk}
                        onClick={() => setShowBulkRegenerateMenu(!showBulkRegenerateMenu)}
                        title="Regenerate rejected items"
                      >
                        {isProcessingBulk ? "Processing..." : "Bulk Actions"}
                      </button>

                      {showBulkRegenerateMenu && (
                        <ul
                          className="dropdown-menu show"
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            display: "block",
                            zIndex: 1000,
                          }}
                        >
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={handleBulkRegenerateRejected}
                            >
                              Regenerate Rejected Items
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search"
                      style={{ width: "160px" }}
                    />

                    <div style={{ position: "relative" }}>
                      <select
                        className="form-select form-select-sm"
                        value={exportFilter}
                        onChange={(e) => {
                          if (e.target.value === "custom") {
                            setShowDatePicker(true);
                          } else {
                            setExportFilter(e.target.value);
                            setShowDatePicker(false);
                            fetchImgToTextData(e.target.value, statusFilter);
                          }
                        }}
                      >
                        <option value="recent">Recent (7 days)</option>
                        <option value="today">Today</option>
                        <option value="month">Last Month</option>
                        <option value="year">Last Year</option>
                        <option value="thisyear">This Year</option>
                        <option value="custom">Custom Date Range</option>
                      </select>

                      {showDatePicker && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            background: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            padding: "10px",
                            zIndex: 1000,
                            marginTop: "4px",
                            minWidth: "250px",
                          }}
                        >
                          <label style={{ display: "block", marginBottom: "8px", fontSize: "12px" }}>
                            From:
                            <input
                              type="date"
                              value={customDateRange.from}
                              onChange={(e) =>
                                setCustomDateRange((prev) => ({ ...prev, from: e.target.value }))
                              }
                              style={{
                                display: "block",
                                width: "100%",
                                padding: "4px",
                                marginTop: "4px",
                              }}
                            />
                          </label>
                          <label style={{ display: "block", marginBottom: "8px", fontSize: "12px" }}>
                            To:
                            <input
                              type="date"
                              value={customDateRange.to}
                              onChange={(e) =>
                                setCustomDateRange((prev) => ({ ...prev, to: e.target.value }))
                              }
                              style={{
                                display: "block",
                                width: "100%",
                                padding: "4px",
                                marginTop: "4px",
                              }}
                            />
                          </label>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ width: "100%" }}
                            onClick={() => {
                              if (!customDateRange.from || !customDateRange.to) {
                                toast.error("Please select both from and to dates");
                                return;
                              }
                              setExportFilter("custom");
                              setShowDatePicker(false);
                              setTimeout(() => fetchImgToTextData("custom", statusFilter), 0);
                            }}
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>

                    <select 
                      className="form-select form-select-sm"
                      value={statusFilter}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setStatusFilter(newStatus);
                        setTimeout(() => fetchImgToTextData(undefined, newStatus), 0);
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* TABLE */}
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle">
                    <thead>
                      <tr>
                        <th><input type="checkbox" /></th>
                        <th>Analysis Name</th>
                        <th>Score</th>
                        <th>Generated On</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {imgToTextData.map((file) => {
                        const confidence = getConfidenceLabel(
                          (file as any).score ?? null
                        );

                        return (
                          <tr key={file._id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(file._id)}
                                onChange={() => handleSelectCheckbox(file._id)}
                              />
                            </td>

                            <td
                              style={{ cursor: "pointer" }}
                              onClick={() => handleFileSelect(file._id)}
                            >
                              {file.text.length > 50
                                ? file.text.substring(0, 50) + "..."
                                : file.text}
                            </td>

                            <td>
                              {file.score !== null && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    color: confidence?.color,
                                    fontWeight: 700,
                                  }}
                                >
                                  {file.score}%
                                </span>
                              )}
                            </td>

                            <td>
                              {new Date(file.timestamp).toLocaleString("en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>

                            <td>
                              {(() => {
                                const status = (file as any).status || "pending";
                                let bgColor = "#6c757d";
                                let label = "Pending";
                                
                                if (status === "approved") {
                                  bgColor = "#16a34a";
                                  label = "Approved";
                                } else if (status === "rejected") {
                                  bgColor = "#dc2626";
                                  label = "Rejected";
                                }
                                
                                return (
                                  <span
                                    style={{
                                      background: bgColor,
                                      color: "#fff",
                                      padding: "4px 10px",
                                      borderRadius: "12px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    {label}
                                  </span>
                                );
                              })()}
                            </td>

                            <td>
                              <div style={{ position: "relative" }}>
                                <button
                                  className="btn btn-link btn-sm"
                                  onClick={() => setOpenMenuId(openMenuId === file._id ? null : file._id)}
                                  style={{ fontSize: "18px", color: "#999", padding: "0", border: "none", cursor: "pointer" }}
                                  title="Actions"
                                >
                                  ...
                                </button>
                                {openMenuId === file._id && (
                                  <ul className="dropdown-menu show" style={{
                                    position: "absolute",
                                    top: "100%",
                                    right: 0,
                                    display: "block",
                                    zIndex: 1000,
                                    minWidth: "150px"
                                  }}>
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => {
                                          handleFileSelect(file._id);
                                          setOpenMenuId(null);
                                        }}
                                      >
                                        View
                                      </button>
                                    </li>
                                    <li>
                                      <button 
                                        className="dropdown-item"
                                        onClick={() => {
                                          handleFileSelect(file._id);
                                          setEditMode(true);
                                          setOpenMenuId(null);
                                        }}
                                      >
                                        Edit
                                      </button>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                      <button
                                        className="dropdown-item text-success"
                                        onClick={() => {
                                          handleUpdateStatus(file._id, "approved");
                                          setOpenMenuId(null);
                                        }}
                                      >
                                        Approve
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className="dropdown-item text-danger"
                                        onClick={() => {
                                          handleUpdateStatus(file._id, "rejected");
                                          setOpenMenuId(null);
                                        }}
                                      >
                                        Reject
                                      </button>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                      <button 
                                        className="dropdown-item"
                                        onClick={() => {
                                          handleExport("pdf");
                                          setOpenMenuId(null);
                                        }}
                                      >
                                        PDF
                                      </button>
                                    </li>
                                    <li>
                                      <button 
                                        className="dropdown-item"
                                        onClick={() => {
                                          handleExport("excel");
                                          setOpenMenuId(null);
                                        }}
                                      >
                                        Excel
                                      </button>
                                    </li>
                                    <li>
                                      <button 
                                        className="dropdown-item"
                                        onClick={() => {
                                          handleExport("json");
                                          setOpenMenuId(null);
                                        }}
                                      >
                                        {} JSON
                                      </button>
                                    </li>
                                    <li>
                                      <button 
                                        className="dropdown-item"
                                        onClick={() => {
                                          handleExport("csv");
                                          setOpenMenuId(null);
                                        }}
                                      >
                                        CSV
                                      </button>
                                    </li>
                                  </ul>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= IMAGE ENLARGEMENT MODAL ================= */}
      {/* This is placed OUTSIDE the main content wrapper */}
      {selectedImage && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="position-relative bg-dark rounded p-3 shadow-5xl"
            style={{ 
              maxWidth: "95vw", 
              maxHeight: "95vh",
              width: "auto",
              height: "auto",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-danger position-absolute"
              style={{
                top: "-15px",
                right: "-15px",
                zIndex: 1000000,
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold",
                boxShadow: "0 0 10px rgba(0,0,0,0.5)"
              }}
              onClick={() => setSelectedImage(null)}
            >
              X
            </button>
            
            <div className="text-center" style={{ maxWidth: "100%", maxHeight: "100%" }}>
              <img
                src={getImagePreview(selectedImage)}
                alt="Enlarged preview"
                style={{
                  maxWidth: "90vw",
                  maxHeight: "80vh",
                  objectFit: "contain",
                  backgroundColor: "#1a1a1a",
                  padding: "10px",
                  borderRadius: "5px",
                  boxShadow: "0 5px 30px rgba(0,0,0,0.5)"
                }}
                onLoad={() => console.log(' Enlarged image loaded successfully')}
                onError={(e) => {
                  console.error(' Failed to load enlarged image:', selectedImage);
                  console.error('Processed URL:', getImagePreview(selectedImage));
                  
                  e.currentTarget.style.display = 'none';
                  
                  const container = e.currentTarget.parentElement;
                  if (container) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-center p-5';
                    errorDiv.innerHTML = `
                      <div style="font-size: 48px; color: #ff6b6b;"></div>
                      <h5 class="mt-3 text-white">Failed to load image</h5>
                      <div class="text-muted mt-2">
                        <small>Original URL: ${selectedImage}</small><br/>
                        <small>Processed: ${getImagePreview(selectedImage)}</small>
                      </div>
                      <button class="btn btn-sm btn-outline-light mt-3" onclick="window.open('${selectedImage}', '_blank')">
                        Try opening in new tab
                      </button>
                    `;
                    container.appendChild(errorDiv);
                  }
                }}
              />
            </div>
            
            <div className="text-center mt-3">
              <button
                className="btn btn-sm btn-outline-light me-2"
                onClick={() => window.open(getImagePreview(selectedImage), '_blank')}
              >
                Open in New Tab
              </button>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = getImagePreview(selectedImage);
                  link.download = 'image.jpg';
                  link.click();
                }}
              >
                Download
              </button>
            </div>
            
            <div className="text-center mt-2">
              <small className="text-white bg-dark p-2 rounded">
                Click outside or press ESC to close
              </small>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiVisionPage;



