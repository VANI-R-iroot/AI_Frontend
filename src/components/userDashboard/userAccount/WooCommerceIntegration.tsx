import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/baseUrl";
import { toast } from "react-toastify";

type WooConfigResponse = {
  connected: boolean;
  config: {
    storeUrl: string;
    consumerKeyMasked: string;
    hasConsumerSecret: boolean;
    lastTestedAt: string | null;
    lastSyncAt: string | null;
    updatedAt: string | null;
  } | null;
};

type WooProduct = {
  id: number;
  name: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_status?: string;
  permalink?: string;
};

const WooCommerceIntegration: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<WooConfigResponse["config"]>(null);
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [form, setForm] = useState({
    storeUrl: "",
    consumerKey: "",
    consumerSecret: "",
  });

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/integrations/woocommerce");
      const data = (res.data?.data || {}) as WooConfigResponse;
      setConnected(Boolean(data.connected));
      setConfig(data.config || null);
      if (data.config?.storeUrl) {
        setForm((prev) => ({ ...prev, storeUrl: data.config?.storeUrl || "" }));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load WooCommerce config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.post("/integrations/woocommerce", {
        storeUrl: form.storeUrl,
        consumerKey: form.consumerKey,
        consumerSecret: form.consumerSecret,
      });
      toast.success("WooCommerce connected successfully");
      setForm((prev) => ({ ...prev, consumerKey: "", consumerSecret: "" }));
      await loadConfig();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to connect WooCommerce");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await axiosInstance.post("/integrations/woocommerce/test");
      toast.success(res.data?.message || "WooCommerce connection is valid");
      await loadConfig();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "WooCommerce test failed");
    } finally {
      setTesting(false);
    }
  };

  const handleFetchProducts = async () => {
    setSyncing(true);
    try {
      const res = await axiosInstance.get("/integrations/woocommerce/products", {
        params: { page: 1, perPage: 20 },
      });
      setProducts(res.data?.data?.products || []);
      toast.success("Products fetched successfully");
      await loadConfig();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch products");
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await axiosInstance.delete("/integrations/woocommerce");
      toast.success("WooCommerce disconnected");
      setConnected(false);
      setConfig(null);
      setProducts([]);
      setForm((prev) => ({ ...prev, consumerKey: "", consumerSecret: "" }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to disconnect WooCommerce");
    }
  };

  return (
    <div className="edit-profile">
      <div className="header">
        <h4>WooCommerce Integration</h4>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <form onSubmit={handleSave}>
            <div className="row mb-3">
              <div className="col-12 input-filed-item-smart-ai">
                <label className="form-label">Store URL</label>
                <input
                  type="text"
                  value={form.storeUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, storeUrl: e.target.value }))}
                  placeholder="https://your-store.com"
                  required
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 input-filed-item-smart-ai">
                <label className="form-label">Consumer Key</label>
                <input
                  type="password"
                  value={form.consumerKey}
                  onChange={(e) => setForm((prev) => ({ ...prev, consumerKey: e.target.value }))}
                  placeholder="ck_..."
                  required={!connected}
                />
              </div>
              <div className="col-md-6 input-filed-item-smart-ai">
                <label className="form-label">Consumer Secret</label>
                <input
                  type="password"
                  value={form.consumerSecret}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, consumerSecret: e.target.value }))
                  }
                  placeholder="cs_..."
                  required={!connected}
                />
              </div>
            </div>

            {connected && config ? (
              <div className="mb-3">
                <p style={{ marginBottom: 6 }}>
                  <strong>Status:</strong> Connected
                </p>
                <p style={{ marginBottom: 6 }}>
                  <strong>Saved key:</strong> {config.consumerKeyMasked}
                </p>
                <p style={{ marginBottom: 6 }}>
                  <strong>Last tested:</strong> {config.lastTestedAt || "-"}
                </p>
                <p style={{ marginBottom: 6 }}>
                  <strong>Last sync:</strong> {config.lastSyncAt || "-"}
                </p>
              </div>
            ) : (
              <p style={{ marginBottom: 12 }}>
                Not connected. Create WooCommerce REST API keys with <strong>Read</strong>{" "}
                permission in WooCommerce and paste them here.
              </p>
            )}

            <div className="profile-setting-update-button pt-3" style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="generate-btn btn-image" disabled={saving}>
                {saving ? "Saving..." : connected ? "Update Connection" : "Connect WooCommerce"}
              </button>
              <button
                type="button"
                className="generate-btn btn-image"
                onClick={handleTestConnection}
                disabled={!connected || testing}
              >
                {testing ? "Testing..." : "Test Connection"}
              </button>
              <button
                type="button"
                className="generate-btn btn-image"
                onClick={handleFetchProducts}
                disabled={!connected || syncing}
              >
                {syncing ? "Fetching..." : "Fetch Products"}
              </button>
              <button
                type="button"
                className="generate-btn btn-image"
                onClick={handleDisconnect}
                disabled={!connected}
              >
                Disconnect
              </button>
            </div>
          </form>

          {products.length > 0 ? (
            <div style={{ marginTop: 24 }}>
              <h5>Latest Products ({products.length})</h5>
              <div style={{ overflowX: "auto" }}>
                <table className="table table-dark table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td>{product.sku || "-"}</td>
                        <td>{product.price || product.regular_price || "-"}</td>
                        <td>{product.stock_status || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default WooCommerceIntegration;

