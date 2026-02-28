import React, { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaStore } from "react-icons/fa";
import { SiMagento, SiShopify, SiWoo } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/baseUrl";
import { toast, ToastContainer } from "react-toastify";
import "../../assets/css/userDashboard/platformConnect.css";

interface Platform {
  id: number;
  name: string;
  can_connect?: boolean;
  current_connections?: number;
  max_connections?: number;
}

interface UserPlatform {
  platform_type?: string;
  platform_name?: string;
  connection_status?: string;
}

interface WooConfigResponse {
  connected: boolean;
  config: {
    storeUrl: string;
    consumerKeyMasked: string;
    hasConsumerSecret: boolean;
    lastTestedAt: string | null;
    lastSyncAt: string | null;
    updatedAt: string | null;
  } | null;
}

interface WooProduct {
  id: number;
  name: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  stock_status?: string;
  permalink?: string;
  image?: {
    src?: string;
  };
  images?: Array<{
    src?: string;
  }>;
}

interface PromptOption {
  id: number | string;
  title?: string;
  prompt_text?: string;
}

interface PlatformSetupField {
  label: string;
  placeholder: string;
  type?: "text" | "url" | "password";
}

const normalizePlatformName = (value?: string) =>
  String(value || "").trim().toLowerCase();

const PLATFORM_CONNECT_TOAST_ID = "platform-connect-toast";
const WOO_PLATFORM_KEY = "woocommerce";

const getWooMainImageUrl = (product: WooProduct) => {
  const images = Array.isArray(product.images) ? product.images : [];
  const primary = images.find((img) => img?.src) || images[0];
  if (primary?.src) return String(primary.src).trim();
  if (product.image?.src) return String(product.image.src).trim();
  return "";
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || fallback;

const getPlatformSetupFields = (platformName?: string): PlatformSetupField[] => {
  const normalized = normalizePlatformName(platformName);
  if (normalized === "shopify") {
    return [
      {
        label: "Store URL",
        placeholder: "https://your-store.myshopify.com",
        type: "url",
      },
      {
        label: "Admin API Access Token",
        placeholder: "shpat_...",
        type: "password",
      },
      {
        label: "API Version",
        placeholder: "2025-01",
        type: "text",
      },
    ];
  }

  if (normalized === "magento") {
    return [
      {
        label: "Store URL",
        placeholder: "https://your-store.com",
        type: "url",
      },
      {
        label: "Access Token",
        placeholder: "Magento integration access token",
        type: "password",
      },
      {
        label: "Consumer Key",
        placeholder: "Optional for extended APIs",
        type: "text",
      },
    ];
  }

  return [
    {
      label: "Store URL",
      placeholder: "https://your-store.com",
      type: "url",
    },
    {
      label: "Access Token / API Key",
      placeholder: "Paste platform credential",
      type: "password",
    },
  ];
};

const PlatformConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [importingToVision, setImportingToVision] = useState(false);

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [userPlatforms, setUserPlatforms] = useState<UserPlatform[]>([]);
  const [prompts, setPrompts] = useState<PromptOption[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<WooConfigResponse["config"]>(null);
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [form, setForm] = useState({
    storeUrl: "",
    consumerKey: "",
    consumerSecret: "",
  });

  const toastOptions = { containerId: PLATFORM_CONNECT_TOAST_ID };

  const notifySuccess = (message: string) => toast.success(message, toastOptions);
  const notifyError = (message: string) => toast.error(message, toastOptions);
  const notifyWarning = (message: string) => toast.warning(message, toastOptions);
  const notifyInfo = (message: string) => toast.info(message, toastOptions);

  const showPopup = (message: string) => {
    if (typeof window !== "undefined") {
      window.alert(message);
    }
  };

  const getPlatformIcon = (platformName?: string) => {
    const normalized = normalizePlatformName(platformName);
    if (normalized === WOO_PLATFORM_KEY) return <SiWoo size={28} />;
    if (normalized === "shopify") return <SiShopify size={28} />;
    if (normalized === "magento") return <SiMagento size={28} />;
    return <FaStore size={24} />;
  };

  const isPlatformConnectedByName = (platformName?: string) => {
    const normalizedPlatformName = normalizePlatformName(platformName);
    if (!normalizedPlatformName) return false;
    return userPlatforms.some((platform) => {
      const connectedType = normalizePlatformName(
        platform.platform_type || platform.platform_name
      );
      return (
        connectedType === normalizedPlatformName &&
        normalizePlatformName(platform.connection_status) === "connected"
      );
    });
  };

  const wooPlatform = useMemo(
    () =>
      platforms.find(
        (platform) => normalizePlatformName(platform.name) === WOO_PLATFORM_KEY
      ),
    [platforms]
  );

  const selectedPlatformData = useMemo(
    () =>
      platforms.find(
        (platform) =>
          normalizePlatformName(platform.name) ===
          normalizePlatformName(selectedPlatform)
      ),
    [platforms, selectedPlatform]
  );

  const selectedPlatformFields = useMemo(
    () => getPlatformSetupFields(selectedPlatformData?.name),
    [selectedPlatformData]
  );

  const isWooSelected =
    normalizePlatformName(selectedPlatform) === WOO_PLATFORM_KEY;

  const isPlatformConnected = isPlatformConnectedByName(WOO_PLATFORM_KEY);

  const canConnect =
    isPlatformConnected || Boolean(wooPlatform?.can_connect ?? true);

  const loadPlatformData = async () => {
    const [platformRes, userPlatformRes] = await Promise.all([
      axiosInstance.get("/platforms"),
      axiosInstance.get("/platforms/user"),
    ]);
    setPlatforms(platformRes.data?.data || []);
    setUserPlatforms(userPlatformRes.data?.data || []);
  };

  const loadWooConfig = async () => {
    const res = await axiosInstance.get("/integrations/woocommerce");
    const data = (res.data?.data || {}) as WooConfigResponse;

    setConnected(Boolean(data.connected));
    setConfig(data.config || null);
    if (data.config?.storeUrl) {
      setForm((prev) => ({ ...prev, storeUrl: data.config?.storeUrl || "" }));
    }
  };

  const loadPrompts = async () => {
    const res = await axiosInstance.get("/prompts/list");
    const promptList = (res.data?.data || []) as PromptOption[];
    setPrompts(promptList);
    if (promptList.length > 0) {
      setSelectedPrompt((prev) => prev || String(promptList[0].id));
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadPlatformData(), loadWooConfig(), loadPrompts()]);
    } catch (error: any) {
      notifyError(getErrorMessage(error, "Failed to load platform data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConnect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canConnect) {
      notifyWarning(
        `You've reached your platform connection limit (${wooPlatform?.max_connections || 0})`
      );
      return;
    }

    setSaving(true);
    try {
      await axiosInstance.post("/integrations/woocommerce", {
        storeUrl: form.storeUrl,
        consumerKey: form.consumerKey,
        consumerSecret: form.consumerSecret,
      });

      await axiosInstance.post("/platforms/connect/woocommerce", {
        store_url: form.storeUrl,
        consumer_key: form.consumerKey,
        consumer_secret: form.consumerSecret,
      });

      const connectedMessage =
        "WooCommerce connected and platform linked successfully";
      notifySuccess(connectedMessage);
      showPopup(connectedMessage);
      setForm((prev) => ({ ...prev, consumerKey: "", consumerSecret: "" }));
      await loadData();
    } catch (error: any) {
      notifyError(
        getErrorMessage(error, "Failed to connect WooCommerce integration")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await axiosInstance.post("/integrations/woocommerce/test");
      notifySuccess(res.data?.message || "Connection test successful");
      await loadWooConfig();
    } catch (error: any) {
      notifyError(getErrorMessage(error, "Connection test failed"));
    } finally {
      setTesting(false);
    }
  };

  const handleFetchProducts = async () => {
    setFetchingProducts(true);
    try {
      const res = await axiosInstance.get("/integrations/woocommerce/products", {
        params: { page: 1, perPage: 20 },
      });
      const fetchedProducts = res.data?.data?.products || [];
      setProducts(fetchedProducts);
      setSelectedProductIds([]);
      notifySuccess(`Fetched ${fetchedProducts.length} products`);
      await loadWooConfig();
    } catch (error: any) {
      notifyError(getErrorMessage(error, "Failed to fetch products"));
    } finally {
      setFetchingProducts(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await axiosInstance.delete("/integrations/woocommerce");
      await axiosInstance.post("/platforms/woocommerce/disconnect");
      notifySuccess("WooCommerce disconnected");
      setProducts([]);
      setConnected(false);
      setConfig(null);
      setForm((prev) => ({ ...prev, consumerKey: "", consumerSecret: "" }));
      await loadPlatformData();
    } catch (error: any) {
      notifyError(getErrorMessage(error, "Failed to disconnect WooCommerce"));
    } finally {
      setDisconnecting(false);
    }
  };

  const handleAnalyzeInAiVision = async () => {
    if (!selectedPrompt) {
      notifyWarning("Please select a prompt first");
      return;
    }
    if (selectedProductIds.length === 0) {
      notifyWarning("Select at least one product to analyze");
      return;
    }

    setImportingToVision(true);
    try {
      const res = await axiosInstance.post(
        "/integrations/woocommerce/products/import-to-vision",
        {
          prompt_id: selectedPrompt,
          selectedProductIds,
          page: 1,
          perPage: 20,
          autoAnalyze: true,
          language: "English",
        }
      );

      const queued = Number(res.data?.data?.queued || 0);
      const bulkSessionId = String(res.data?.data?.bulkSessionId || "");
      const promptId = String(res.data?.data?.prompt_id || "");
      if (queued > 0) {
        notifySuccess(
          `Queued ${queued} product image${queued > 1 ? "s" : ""} for AI Vision`
        );
        const query = new URLSearchParams({
          source: "woo",
          bulkSessionId,
          prompt_id: promptId,
        });
        navigate(`/aivision?${query.toString()}`);
      } else {
        notifyInfo(res.data?.message || "No products with valid images to queue");
        navigate("/aivision");
      }
    } catch (error: any) {
      const errorCode = String(error?.response?.data?.code || "")
        .trim()
        .toUpperCase();
      const serverMessage = String(error?.response?.data?.message || "");
      const isOnboardingRequired =
        errorCode === "ONBOARDING_REQUIRED" ||
        /onboarding|required.*company|register company/i.test(serverMessage);

      if (error?.response?.status === 403 && isOnboardingRequired) {
        const onboardingMessage =
          "Please complete company onboarding (register company) before analyzing in AI Vision.";
        notifyError(onboardingMessage);
        showPopup(onboardingMessage);
        return;
      }
      notifyError(getErrorMessage(error, "Failed to send products to AI Vision"));
    } finally {
      setImportingToVision(false);
    }
  };

  const toggleSelectAllProducts = () => {
    if (products.length === 0) return;
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
      return;
    }
    setSelectedProductIds(
      products.map((product) => Number(product.id)).filter((id) => !Number.isNaN(id))
    );
  };

  const toggleSelectProduct = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleOpenPlatform = (platformName?: string) => {
    const normalized = normalizePlatformName(platformName);
    if (!normalized) return;
    setSelectedPlatform(normalized);
  };

  const handleBackToPlatforms = () => {
    setSelectedPlatform("");
  };

  return (
    <div className="main-content-common platform-connect-page">
      <ToastContainer
        containerId={PLATFORM_CONNECT_TOAST_ID}
        position="top-right"
        autoClose={3500}
        newestOnTop
        theme="dark"
        style={{ zIndex: 2147483647 }}
      />

      {loading ? (
        <div className="platform-connect-panel">
          <p className="platform-connect-loading">Loading platform data...</p>
        </div>
      ) : !selectedPlatform ? (
        <div className="platform-connect-panel">
          <div className="platform-connect-header">
            <div className="platform-connect-icon">{getPlatformIcon()}</div>
            <div>
              <h2>Platform Connect</h2>
              <p className="platform-connect-subtitle">
                Choose a platform card to open integration setup.
              </p>
            </div>
          </div>

          {platforms.length > 0 ? (
            <div className="pc-platform-grid">
              {platforms.map((platform) => {
                const platformConnected = isPlatformConnectedByName(platform.name);
                return (
                  <button
                    key={`${platform.id}-${normalizePlatformName(platform.name)}`}
                    type="button"
                    className="pc-platform-card"
                    onClick={() => handleOpenPlatform(platform.name)}
                  >
                    <div className="pc-platform-card-top">
                      <div className="pc-platform-logo">
                        {getPlatformIcon(platform.name)}
                      </div>
                      <span
                        className={`pc-platform-badge ${
                          platformConnected
                            ? "pc-platform-badge-connected"
                            : "pc-platform-badge-available"
                        }`}
                      >
                        {platformConnected ? "Connected" : "Available"}
                      </span>
                    </div>
                    <h4>{platform.name}</h4>
                    <p>Open {platform.name} integration panel</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="platform-connect-loading">No platforms available right now.</p>
          )}
        </div>
      ) : isWooSelected ? (
        <div className="platform-connect-panel">
          <div className="platform-connect-header">
            <button type="button" className="pc-back-btn" onClick={handleBackToPlatforms}>
              <FaArrowLeft size={12} />
              <span>Back</span>
            </button>
            <div className="platform-connect-icon">
              <SiWoo size={28} />
            </div>
            <div>
              <h2>WooCommerce Integration</h2>
              <p className="platform-connect-subtitle">
                Connected: {wooPlatform?.current_connections || 0} / {wooPlatform?.max_connections || 0} platforms
              </p>
            </div>
          </div>

          <form className="platform-connect-form" onSubmit={handleConnect}>
            <div className="pc-field">
              <label htmlFor="storeUrl">Store URL</label>
              <input
                id="storeUrl"
                type="url"
                value={form.storeUrl}
                placeholder="https://your-store.com"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, storeUrl: e.target.value }))
                }
                required
              />
            </div>

            <div className="pc-field">
              <label htmlFor="consumerKey">Consumer Key</label>
              <input
                id="consumerKey"
                type="text"
                value={form.consumerKey}
                placeholder="ck_..."
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, consumerKey: e.target.value }))
                }
                required={!connected}
              />
            </div>

            <div className="pc-field">
              <label htmlFor="consumerSecret">Consumer Secret</label>
              <input
                id="consumerSecret"
                type="password"
                value={form.consumerSecret}
                placeholder="cs_..."
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    consumerSecret: e.target.value,
                  }))
                }
                required={!connected}
              />
            </div>

            {connected && config ? (
              <p className="pc-status pc-status-connected">
                Connected. Saved key: {config.consumerKeyMasked}. Last tested: {config.lastTestedAt || "-"}.
              </p>
            ) : (
              <p className="pc-status pc-status-disconnected">
                Not connected. Create WooCommerce REST API keys with Read permission in WooCommerce and paste them here.
              </p>
            )}

            <div className="pc-field">
              <label htmlFor="visionPrompt">AI Vision Prompt</label>
              <select
                id="visionPrompt"
                value={selectedPrompt}
                onChange={(e) => setSelectedPrompt(e.target.value)}
              >
                <option value="">Select prompt</option>
                {prompts.map((prompt) => (
                  <option key={String(prompt.id)} value={String(prompt.id)}>
                    {prompt.title || `Prompt ${prompt.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="pc-actions">
              <button
                type="submit"
                className="pc-btn pc-btn-primary"
                disabled={saving || !canConnect}
              >
                {saving ? "Connecting..." : "Connect WooCommerce"}
              </button>

              <button
                type="button"
                className="pc-btn"
                disabled={!connected || testing}
                onClick={handleTestConnection}
              >
                {testing ? "Testing..." : "Test Connection"}
              </button>

              <button
                type="button"
                className="pc-btn"
                disabled={!connected || fetchingProducts}
                onClick={handleFetchProducts}
              >
                {fetchingProducts ? "Fetching..." : "Fetch Products"}
              </button>

              <button
                type="button"
                className="pc-btn"
                disabled={
                  !connected ||
                  importingToVision ||
                  products.length === 0 ||
                  !selectedPrompt ||
                  selectedProductIds.length === 0
                }
                onClick={handleAnalyzeInAiVision}
              >
                {importingToVision ? "Queuing..." : "Analyze Selected in AI Vision"}
              </button>

              <button
                type="button"
                className="pc-btn pc-btn-danger"
                disabled={!connected || disconnecting}
                onClick={handleDisconnect}
              >
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          </form>

          {products.length > 0 && (
            <div className="pc-products">
              <h4>
                Products ({products.length}) - Selected ({selectedProductIds.length})
              </h4>
              <div className="pc-products-table-wrap">
                <table className="pc-products-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={
                            products.length > 0 &&
                            selectedProductIds.length === products.length
                          }
                          onChange={toggleSelectAllProducts}
                        />
                      </th>
                      <th>ID</th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Main Image URL</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const mainImageUrl = getWooMainImageUrl(product);
                      const productId = Number(product.id);
                      return (
                        <tr key={product.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedProductIds.includes(productId)}
                              onChange={() => toggleSelectProduct(productId)}
                            />
                          </td>
                          <td>{product.id}</td>
                          <td>
                            {mainImageUrl ? (
                              <img
                                src={mainImageUrl}
                                alt={product.name}
                                style={{
                                  width: "42px",
                                  height: "42px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(148, 163, 184, 0.35)",
                                }}
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>{product.name}</td>
                          <td>
                            {mainImageUrl ? (
                              <a
                                href={mainImageUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#93c5fd" }}
                              >
                                {mainImageUrl.length > 64
                                  ? `${mainImageUrl.slice(0, 64)}...`
                                  : mainImageUrl}
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>{product.sku || "-"}</td>
                          <td>{product.price || product.regular_price || "-"}</td>
                          <td>{product.stock_status || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="platform-connect-panel">
          <div className="platform-connect-header">
            <button type="button" className="pc-back-btn" onClick={handleBackToPlatforms}>
              <FaArrowLeft size={12} />
              <span>Back</span>
            </button>
            <div className="platform-connect-icon">{getPlatformIcon(selectedPlatformData?.name)}</div>
            <div>
              <h2>{selectedPlatformData?.name || "Platform"} Integration</h2>
              <p className="platform-connect-subtitle">
                Dark-mode panel is ready. Integration actions will be enabled soon.
              </p>
            </div>
          </div>

          <div className="pc-platform-pending">
            <div className="platform-connect-form">
              {selectedPlatformFields.map((field, index) => (
                <div className="pc-field" key={`${field.label}-${index}`}>
                  <label htmlFor={`platformField_${index}`}>{field.label}</label>
                  <input
                    id={`platformField_${index}`}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    disabled
                  />
                </div>
              ))}
            </div>
            <p>
              {selectedPlatformData?.name || "This platform"} setup is not active yet. WooCommerce setup is already enabled.
            </p>
            <div className="pc-actions">
              <button type="button" className="pc-btn pc-btn-primary" disabled>
                Connect {selectedPlatformData?.name || "Platform"}
              </button>
              <button type="button" className="pc-btn" disabled>
                Test Connection
              </button>
              <button type="button" className="pc-btn" disabled>
                Fetch Products
              </button>
              <button type="button" className="pc-btn" disabled>
                Analyze Selected in AI Vision
              </button>
              <button type="button" className="pc-btn pc-btn-danger" disabled>
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformConnectPage;
