import React, { JSX, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/baseUrl";
import Select from "react-select";
import { toast } from "react-toastify";

interface FormData {
  title: string;
  premiumAssistant: string[];
  vipAssistant: string[];
  packageType: string;
  packageDuration: string;
  packageCurrency: string;
  price: number;
  monthlyPrice: number;
  yearlyPrice: number;
  lifetimePrice: number;
  textToImageLimit: number;
  imageLimit: number;
  imageCaptionLimit: number;
  aiChatLimit: number;
  imageToAudioLimit: number;
  scratchToCodeLimit: number;
  grammarCheckingLimit: number;
  textToParaphraserLimit: number;
  aiChatAssistantLimit: number;
  aiTemplateLimit: number;
  ttsAudioLimit: number;
  videoToTextLimit: number;
  aiVisionLimit: number;
  webScriptingLimit: number;
  aiRewriterLimit: number;
  speechToTextLimit: number;
  aiVoiceoverLimit: number;
  aiCodeGenerateLimit: number;
  aiMcpSmartMailerLimit: number;
  personalDataAnalyzeLimit:number;
  teamMemberLimit: number;
}

interface AssistantOption {
  value: string;
  label: JSX.Element;
}

const initialFormState: FormData = {
  title: "",
  premiumAssistant: [],
  vipAssistant: [],
  packageType: "",
  packageDuration: "",
  packageCurrency: "",
  price: 0,
  monthlyPrice: 0,
  yearlyPrice: 0,
  lifetimePrice: 0,
  textToImageLimit: 0,
  imageLimit: 0,
  imageCaptionLimit: 0,
  aiChatLimit: 0,
  imageToAudioLimit: 0,
  scratchToCodeLimit: 0,
  grammarCheckingLimit: 0,
  textToParaphraserLimit: 0,
  aiChatAssistantLimit: 0,
  aiTemplateLimit: 0,
  ttsAudioLimit: 0,
  videoToTextLimit: 0,
  aiVisionLimit: 0,
  webScriptingLimit: 0,
  aiRewriterLimit: 0,
  speechToTextLimit: 0,
  aiVoiceoverLimit: 0,
  aiCodeGenerateLimit: 0,
  aiMcpSmartMailerLimit:0,
  personalDataAnalyzeLimit:0,
  teamMemberLimit: 0
};

const durationCombinationMap: Record<string, string[]> = {
  Monthly: ["Monthly"],
  Yearly: ["Yearly"],
  "Life-Time": ["Life-Time"],
  "Monthly+Yearly": ["Monthly", "Yearly"],
  "Monthly+Life-Time": ["Monthly", "Life-Time"],
  "Yearly+Life-Time": ["Yearly", "Life-Time"],
  All: ["Monthly", "Yearly", "Life-Time"],
};

const getDurationPriceField = (duration: string): keyof FormData => {
  if (duration === "Monthly") return "monthlyPrice";
  if (duration === "Yearly") return "yearlyPrice";
  return "lifetimePrice";
};

const SubscriptionForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;
  const packageId = location.state?.packageId || editData?._id;
  const [vipAssistantList, setVipAssistantList] = useState<any[]>([]);
  const [premiumAssistantList, setPremiumAssistantList] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(packageId);
  const isFreePackage = formData.packageType === "Free";
  const selectedCreateDurations = !isEditMode
    ? durationCombinationMap[formData.packageDuration] || []
    : [];
  const isMultiDurationCreate = !isEditMode && selectedCreateDurations.length > 1;

  const normalizeCurrencyCode = (currency: string) => {
    if (!currency) return "";
    const map: Record<string, string> = {
      $: "USD",
      "\u20AC": "EUR",
      "\u00A3": "GBP",
      "\u09F3": "BDT",
      USD: "USD",
      EUR: "EUR",
      GBP: "GBP",
      BDT: "BDT",
    };
    const trimmed = currency.trim();
    return map[trimmed] || trimmed.toUpperCase();
  };


const validateForm = (): boolean => {
  const isFreePackage = formData.packageType === "Free";
  const selectedDurations = !isEditMode
    ? durationCombinationMap[formData.packageDuration] || []
    : [];
  const isMultiDuration = !isEditMode && selectedDurations.length > 1;

  if (!formData.title.trim()) {
    toast.error("Plan Title is required");
    return false;
  }

  if (!formData.packageType) {
    toast.error("Package Type is required");
    return false;
  }

  if (!formData.packageDuration) {
    toast.error("Package Duration is required");
    return false;
  }

  if (!isFreePackage) {
    if (!formData.packageCurrency) {
      toast.error("Currency is required for paid packages");
      return false;
    }

    if (isMultiDuration) {
      const hasInvalidMultiPrice = selectedDurations.some((duration) => {
        const field = getDurationPriceField(duration);
        return Number(formData[field]) <= 0;
      });
      if (hasInvalidMultiPrice) {
        toast.error("Selected duration prices must be greater than 0");
        return false;
      }
    } else if (formData.price <= 0) {
      toast.error("Price must be greater than 0 for paid packages");
      return false;
    }
  }

  // Define only the numeric limit fields
  const limitFields: (keyof FormData)[] = [
    "textToImageLimit",
    "imageLimit",
    "imageCaptionLimit",
    "aiChatLimit",
    "imageToAudioLimit",
    "scratchToCodeLimit",
    "grammarCheckingLimit",
    "textToParaphraserLimit",
    "aiChatAssistantLimit",
    "aiTemplateLimit",
    "ttsAudioLimit",
    "videoToTextLimit",
    "aiVisionLimit",
    "webScriptingLimit",
    "aiRewriterLimit",
    "speechToTextLimit",
    "aiVoiceoverLimit",
    "aiCodeGenerateLimit",
    "aiMcpSmartMailerLimit",
    "personalDataAnalyzeLimit",
    "teamMemberLimit"
  ];

  for (const field of limitFields) {
    const value = formData[field] as number; 
    if (value < -1) {
      toast.error(
        `${field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())} must be -1 (Unlimited) or 0+`
      );
      return false;
    }
  }

  return true;
};

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;


    if (name === "packageType") {
      const updatedFormData = {
        ...formData,
        [name]: value,
      };

      if (value === "Free") {
        updatedFormData.price = 0;
        updatedFormData.monthlyPrice = 0;
        updatedFormData.yearlyPrice = 0;
        updatedFormData.lifetimePrice = 0;
        updatedFormData.packageCurrency = "";
      }

      setFormData(updatedFormData);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        typeof prev[name as keyof FormData] === "number"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        [name]: 0,
      }));
      return;
    }

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= -1) {
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
     
      const submissionData = { ...formData };
      const isFreePackage = formData.packageType === "Free";
      const selectedDurations = !isEditMode
        ? durationCombinationMap[formData.packageDuration] || []
        : [];
      const isMultiDuration = !isEditMode && selectedDurations.length > 1;
      if (isFreePackage) {
        submissionData.price = 0;
        submissionData.monthlyPrice = 0;
        submissionData.yearlyPrice = 0;
        submissionData.lifetimePrice = 0;
        submissionData.packageCurrency = "";
      } else {
        submissionData.packageCurrency = normalizeCurrencyCode(
          submissionData.packageCurrency
        );
      }

      // Convert camelCase to snake_case for backend
      const convertedData: any = {
        title: submissionData.title,
        package_type: submissionData.packageType,
        package_duration: submissionData.packageDuration,
        package_currency: submissionData.packageCurrency,
        price: submissionData.price,
        text_to_image_limit: submissionData.textToImageLimit,
        image_limit: submissionData.imageLimit,
        image_caption_limit: submissionData.imageCaptionLimit,
        ai_chat_limit: submissionData.aiChatLimit,
        image_to_audio_limit: submissionData.imageToAudioLimit,
        scratch_to_code_limit: submissionData.scratchToCodeLimit,
        grammar_checking_limit: submissionData.grammarCheckingLimit,
        text_to_paraphraser_limit: submissionData.textToParaphraserLimit,
        ai_chat_assistant_limit: submissionData.aiChatAssistantLimit,
        ai_template_limit: submissionData.aiTemplateLimit,
        tts_audio_limit: submissionData.ttsAudioLimit,
        video_to_text_limit: submissionData.videoToTextLimit,
        ai_vision_limit: submissionData.aiVisionLimit,
        web_scripting_limit: submissionData.webScriptingLimit,
        ai_rewriter_limit: submissionData.aiRewriterLimit,
        speech_to_text_limit: submissionData.speechToTextLimit,
        ai_voiceover_limit: submissionData.aiVoiceoverLimit,
        ai_code_generate_limit: submissionData.aiCodeGenerateLimit,
        ai_mcp_smart_mailer_limit: submissionData.aiMcpSmartMailerLimit,
        personal_data_analyze_limit: submissionData.personalDataAnalyzeLimit,
        team_member_limit: submissionData.teamMemberLimit,
        selected_vip: submissionData.vipAssistant,
        selected_premium: submissionData.premiumAssistant,
      };

      if (isMultiDuration) {
        const pricingMap: Record<string, number> = {};
        selectedDurations.forEach((duration) => {
          const field = getDurationPriceField(duration);
          pricingMap[duration] = Number(submissionData[field]) || 0;
        });
        convertedData.duration_pricing = pricingMap;
      }

      if (isEditMode) {
        await axiosInstance.put(
          `/package/${packageId}`,
          convertedData
        );
        toast.success("Package updated successfully!");
      } else {
        await axiosInstance.post("/package", convertedData);
        toast.success("Package created successfully!");
      }

      navigate("/admin-plans", { state: { refresh: true } });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        `Failed to ${isEditMode ? "update" : "create"} package`;
      toast.error(message);
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} package:`,
        err
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchVipAssistantList = async () => {
  try {
    const res = await axiosInstance.get(`/admin/assistants/vip`);
    
    // Check if response has data
    if (res.data && res.data.success) {
      setVipAssistantList(res.data.data || []);
    } else {
      console.error("Invalid response format for VIP assistants:", res.data);
      toast.error("Failed to fetch VIP assistants - invalid response");
      setVipAssistantList([]);
    }
  } catch (error: any) {
    console.error("Failed to fetch VIP assistants", error);
    
    // More detailed error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Network error";
    
    toast.error(`Failed to fetch VIP assistants: ${errorMessage}`);
    setVipAssistantList([]);
  }
};

const fetchPremiumAssistantList = async () => {
  try {
    const res = await axiosInstance.get(`/admin/assistants/premium`);
    
    // Check if response has data
    if (res.data && res.data.success) {
      setPremiumAssistantList(res.data.data || []);
    } else {
      console.error("Invalid response format for Premium assistants:", res.data);
      toast.error("Failed to fetch Premium assistants - invalid response");
      setPremiumAssistantList([]);
    }
  } catch (error: any) {
    console.error("Failed to fetch Premium assistants", error);
    
    // More detailed error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Network error";
    
    toast.error(`Failed to fetch Premium assistants: ${errorMessage}`);
    setPremiumAssistantList([]);
  }
};

  useEffect(() => {
    fetchVipAssistantList();
    fetchPremiumAssistantList();
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData({
        ...initialFormState,
        ...editData,
        premiumAssistant: editData.premiumAssistant || [],
        vipAssistant: editData.vipAssistant || [],
        packageCurrency: normalizeCurrencyCode(editData.packageCurrency || ""),
        teamMemberLimit: editData.teamMemberLimit ?? editData.team_member_limit ?? 0,
      });
    }
  }, [editData]);

  const formatAssistantOptions = (list: any[]): AssistantOption[] => {
    return list.map((assistant) => ({
      value: assistant._id,
      label: (
        <div>
          <span dangerouslySetInnerHTML={{ __html: assistant.assistantIcon }} />
          {assistant.assistantName}
        </div>
      ),
    }));
  };

  const vipOptions = formatAssistantOptions(vipAssistantList);
  const premiumOptions = formatAssistantOptions(premiumAssistantList);

  return (
    <div className="container mt-4">
      <div className="cancel-admin-dashboard-button-global">
        <button onClick={() => navigate("/admin-plans")} type="button">
          Cancel
        </button>
      </div>

      <div className="form-header mb-4">
        <h2>{isEditMode ? "Update Package" : "Create Package"}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-12">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="title" className="form-label">
                Plan Title <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-12 pt-3 pb-3">
            <label className="form-label">VIP Assistant</label>
            <Select
              classNamePrefix="rs"
              isMulti
              options={vipOptions}
              value={vipOptions.filter((option) =>
                formData.vipAssistant.includes(option.value)
              )}
              onChange={(selected) => {
                const values = (selected as AssistantOption[]).map(
                  (opt) => opt.value
                );
                setFormData((prev) => ({ ...prev, vipAssistant: values }));
              }}
              placeholder="Select VIP Assistants..."
              isSearchable
            />
          </div>

          <div className="col-12 pt-3 pb-3">
            <label className="form-label">Premium Assistant</label>
            <Select
              classNamePrefix="rs"
              isMulti
              options={premiumOptions}
              value={premiumOptions.filter((option) =>
                formData.premiumAssistant.includes(option.value)
              )}
              onChange={(selected) => {
                const values = (selected as AssistantOption[]).map(
                  (opt) => opt.value
                );
                setFormData((prev) => ({ ...prev, premiumAssistant: values }));
              }}
              placeholder="Select Premium Assistants..."
              isSearchable
            />
          </div>

          <div className="col-md-6">
            <label htmlFor="packageType" className="form-label">
              Package Type <span className="required">*</span>
            </label>
            <div className="input-filed-item-smart-ai">
              <select
                className="form-select"
                name="packageType"
                value={formData.packageType}
                onChange={handleChange}
                required
              >
                <option value="">Select Package Type</option>
                <option value="Free">Free</option>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>

          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="packageCurrency" className="form-label">
                Currency {!isFreePackage && <span className="required">*</span>}
              </label>
              <select
                className="form-select"
                id="packageCurrency"
                name="packageCurrency"
                value={formData.packageCurrency}
                onChange={handleChange}
                required={!isFreePackage}
                disabled={isFreePackage}
              >
                <option value="">Select Package Currency</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (Pound)</option>
                <option value="BDT">BDT (Taka)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="price" className="form-label">
                Package Price{" "}
                {!isFreePackage && <span className="required">*</span>}
              </label>
              <input
                type="number"
                className="form-control"
                id="price"
                name="price"
                value={isFreePackage ? 0 : formData.price || ""}
                onChange={handleNumberChange}
                min="0"
                step="any"
                placeholder={
                  isFreePackage
                    ? "Free Package (0)"
                    : "Enter price (e.g., 45647)"
                }
                required={!isFreePackage && (isEditMode || !isMultiDurationCreate)}
                disabled={isFreePackage || isMultiDurationCreate}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="packageDuration" className="form-label">
                Package Duration <span className="required">*</span>
              </label>
              <select
                className="form-select"
                id="packageDuration"
                name="packageDuration"
                value={formData.packageDuration}
                onChange={handleChange}
                required
              >
                <option value="">Select Package Duration</option>
                {!isEditMode && <option value="Monthly+Yearly">Monthly + Yearly</option>}
                {!isEditMode && <option value="Monthly+Life-Time">Monthly + Life-Time</option>}
                {!isEditMode && <option value="Yearly+Life-Time">Yearly + Life-Time</option>}
                {!isEditMode && <option value="All">Monthly + Yearly + Life-Time</option>}
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Life-Time">Life-Time</option>
              </select>
            </div>
          </div>
        </div>

        {!isEditMode && isMultiDurationCreate && !isFreePackage && (
          <div className="row mb-3">
            {selectedCreateDurations.map((duration) => {
              const fieldName = getDurationPriceField(duration);
              const colClass =
                selectedCreateDurations.length === 2 ? "col-md-6" : "col-md-4";
              return (
                <div className={colClass} key={duration}>
                  <div className="input-filed-item-smart-ai">
                    <label htmlFor={fieldName} className="form-label">
                      {duration} Price <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id={fieldName}
                      name={fieldName}
                      value={formData[fieldName] || ""}
                      onChange={handleNumberChange}
                      min="0"
                      step="any"
                      placeholder={`${duration} price`}
                      required
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="imageLimit" className="form-label">
                Imagination of Image Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="imageLimit"
                name="imageLimit"
                value={formData.imageLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit (e.g., 567)"
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="imageCaptionLimit" className="form-label">
                Image Caption Generate Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="imageCaptionLimit"
                name="imageCaptionLimit"
                value={formData.imageCaptionLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="imageToAudioLimit" className="form-label">
                Image to Audio Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="imageToAudioLimit"
                name="imageToAudioLimit"
                value={formData.imageToAudioLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="scratchToCodeLimit" className="form-label">
                Scratch To Code Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="scratchToCodeLimit"
                name="scratchToCodeLimit"
                value={formData.scratchToCodeLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="grammarCheckingLimit" className="form-label">
                Grammar Checking Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="grammarCheckingLimit"
                name="grammarCheckingLimit"
                value={formData.grammarCheckingLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="textToParaphraserLimit" className="form-label">
                Text To Paraphraser Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="textToParaphraserLimit"
                name="textToParaphraserLimit"
                value={formData.textToParaphraserLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="aiChatAssistantLimit" className="form-label">
                AI Chat Assistant Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="aiChatAssistantLimit"
                name="aiChatAssistantLimit"
                value={formData.aiChatAssistantLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="aiTemplateLimit" className="form-label">
                AI Template Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="aiTemplateLimit"
                name="aiTemplateLimit"
                value={formData.aiTemplateLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="ttsAudioLimit" className="form-label">
                TTS Audio Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="ttsAudioLimit"
                name="ttsAudioLimit"
                value={formData.ttsAudioLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="videoToTextLimit" className="form-label">
                Video To Text Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="videoToTextLimit"
                name="videoToTextLimit"
                value={formData.videoToTextLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="aiVisionLimit" className="form-label">
                AI Vision Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="aiVisionLimit"
                name="aiVisionLimit"
                value={formData.aiVisionLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="webScriptingLimit" className="form-label">
                Web Scripting Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="webScriptingLimit"
                name="webScriptingLimit"
                value={formData.webScriptingLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="aiRewriterLimit" className="form-label">
                AI Rewriter Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="aiRewriterLimit"
                name="aiRewriterLimit"
                value={formData.aiRewriterLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="aiChatLimit" className="form-label">
                AI Chat Image Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="aiChatLimit"
                name="aiChatLimit"
                value={formData.aiChatLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="speechToTextLimit" className="form-label">
                Speech To Text Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="speechToTextLimit"
                name="speechToTextLimit"
                value={formData.speechToTextLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="aiVoiceoverLimit" className="form-label">
                AI Voiceover Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="aiVoiceoverLimit"
                name="aiVoiceoverLimit"
                value={formData.aiVoiceoverLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="aiCodeGenerateLimit" className="form-label">
                AI Code Generate Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="aiCodeGenerateLimit"
                name="aiCodeGenerateLimit"
                value={formData.aiCodeGenerateLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="textToImageLimit" className="form-label">
                Text To Image Generate Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="textToImageLimit"
                name="textToImageLimit"
                value={formData.textToImageLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="personalDataAnalyzeLimit" className="form-label">
                AI personal DataAnalyze Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="personalDataAnalyzeLimit"
                name="personalDataAnalyzeLimit"
                value={formData.personalDataAnalyzeLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="aiMcpSmartMailerLimit" className="form-label">
               MCP Smart Mailer Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="aiMcpSmartMailerLimit"
                name="aiMcpSmartMailerLimit"
                value={formData.aiMcpSmartMailerLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-filed-item-smart-ai">
              <label htmlFor="teamMemberLimit" className="form-label">
                Team Member Limit <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="teamMemberLimit"
                name="teamMemberLimit"
                value={formData.teamMemberLimit || ""}
                onChange={handleNumberChange}
                min="-1"
                placeholder="Enter limit"
                required
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12 mb-4 pt-4">
            <button
              type="submit"
              className="generate-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Package"
                : "Create Package"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SubscriptionForm;

