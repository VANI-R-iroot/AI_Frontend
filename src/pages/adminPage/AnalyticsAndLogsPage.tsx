import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../utils/baseUrl';
import { useLocation } from 'react-router-dom';

interface ApiLog {
  id: number;
  endpoint: string;
  http_method: string;
  status_code: number;
  duration_ms: number;
  user_id: number;
  created_at: string;
}

interface ErrorLog {
  id: number;
  error_type: string;
  error_severity: string;
  error_message: string;
  user_id: number;
  is_resolved: boolean;
  created_at: string;
}

interface AuditLog {
  id: number;
  actor_name: string;
  action_name: string;
  resource_type: string;
  action_status: string;
  created_at: string;
}

interface DashboardData {
  api_calls_24h: number;
  errors_24h: number;
  success_rate: number;
  avg_response_time_ms: number;
  active_users_30d: number;
}

interface ProcessedProductReportRow {
  date_bucket: string;
  user_id: string | number;
  user_name?: string;
  user_email?: string;
  plan_id?: number;
  plan_title?: string;
  feature_name?: string;
  images_generated?: number;
  audio_generated?: number;
  videos_processed?: number;
  files_uploaded?: number;
  total_processed?: number;
  tokens_used?: number;
  api_calls_count?: number;
}

interface TokenUsageDailyRow {
  date: string;
  total_tokens: number;
  requests_count: number;
  users_count: number;
  total_cost_usd: number;
}

interface TokenUsageMonthlyRow {
  month: string;
  total_tokens: number;
  requests_count: number;
  users_count: number;
  total_cost_usd: number;
}

interface TokenUsageByUserPlanRow {
  user_id: string | number;
  user_name?: string;
  user_email?: string;
  plan_id?: number;
  plan_title?: string;
  total_tokens: number;
  requests_count: number;
  total_cost_usd: number;
  last_used_at?: string;
}

const AnalyticsAndLogsPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'api-logs' | 'error-logs' | 'audit-logs' | 'reports'>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [processedProducts, setProcessedProducts] = useState<ProcessedProductReportRow[]>([]);
  const [tokenUsageDaily, setTokenUsageDaily] = useState<TokenUsageDailyRow[]>([]);
  const [tokenUsageMonthly, setTokenUsageMonthly] = useState<TokenUsageMonthlyRow[]>([]);
  const [tokenUsageByUserPlan, setTokenUsageByUserPlan] = useState<TokenUsageByUserPlanRow[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    endpoint: ''
  });
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'reports') {
      setActiveTab('reports');
      return;
    }
    if (tab === 'api-logs' || tab === 'error-logs' || tab === 'audit-logs' || tab === 'dashboard') {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    const now = new Date();
    const prior = new Date();
    prior.setDate(now.getDate() - 30);
    const toYMD = (d: Date) => d.toISOString().split('T')[0];
    setReportFilters({
      startDate: toYMD(prior),
      endDate: toYMD(now),
    });
  }, []);

  // Fetch Dashboard Summary
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/analytics/dashboard/summary');
        if (response.data) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'dashboard') {
      fetchDashboard();
    }
  }, [activeTab]);

  // Fetch Daily Stats Chart
  useEffect(() => {
    const fetchDailyStats = async () => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const response = await axiosInstance.get('/analytics/daily-api-calls', {
          params: { startDate: startDate.toISOString().split('T')[0] }
        });
        if (response.data) {
          setDailyStats(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch daily stats:', error);
      }
    };

    if (activeTab === 'dashboard') {
      fetchDailyStats();
    }
  }, [activeTab]);

  // Fetch API Logs
  useEffect(() => {
    const fetchApiLogs = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          limit: 50,
        };
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params[key] = value;
        });

        const response = await axiosInstance.get('/logs/api', { params });
        if (response.data) {
          setApiLogs(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch API logs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'api-logs') {
      fetchApiLogs();
    }
  }, [activeTab, page, filters]);

  // Fetch Error Logs
  useEffect(() => {
    const fetchErrorLogs = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          limit: 50,
        };
        if (filters.status) params.severity = filters.status;

        const response = await axiosInstance.get('/logs/errors', { params });
        if (response.data) {
          setErrorLogs(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch error logs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'error-logs') {
      fetchErrorLogs();
    }
  }, [activeTab, page, filters]);

  // Fetch Audit Logs
  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 50,
        };

        const response = await axiosInstance.get('/logs/audit', { params });
        if (response.data) {
          setAuditLogs(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'audit-logs') {
      fetchAuditLogs();
    }
  }, [activeTab, page]);

  // Fetch Reports
  useEffect(() => {
    const fetchReports = async () => {
      if (activeTab !== 'reports') return;
      setReportLoading(true);
      try {
        const params = {
          startDate: reportFilters.startDate || undefined,
          endDate: reportFilters.endDate || undefined,
        };

        const [processedRes, dailyMonthlyRes, byUserPlanRes] = await Promise.all([
          axiosInstance.get('/analytics/reports/processed-products', { params }),
          axiosInstance.get('/analytics/reports/token-usage/daily-monthly', { params }),
          axiosInstance.get('/analytics/reports/token-usage/by-user-plan', { params }),
        ]);

        setProcessedProducts(processedRes.data?.data || []);
        setTokenUsageDaily(dailyMonthlyRes.data?.data?.daily || []);
        setTokenUsageMonthly(dailyMonthlyRes.data?.data?.monthly || []);
        setTokenUsageByUserPlan(byUserPlanRes.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setReportLoading(false);
      }
    };

    fetchReports();
  }, [activeTab, reportFilters.startDate, reportFilters.endDate]);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const logType = activeTab.split('-')[0];
      const url = axiosInstance.defaults.baseURL + `/logs/${logType}?format=${format}`;
      window.location.href = url;
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleProcessedProductsExport = async (format: 'csv' | 'xlsx') => {
    try {
      const params = new URLSearchParams();
      if (reportFilters.startDate) params.append('startDate', reportFilters.startDate);
      if (reportFilters.endDate) params.append('endDate', reportFilters.endDate);
      params.append('format', format);

      const url = axiosInstance.defaults.baseURL + `/analytics/reports/processed-products/export?${params.toString()}`;
      window.location.href = url;
    } catch (error) {
      console.error('Processed products export failed:', error);
    }
  };

  return (
    <div className="analytics-logs-container">
      <div className="main-content-common pt-3">
        <h2 className="user-dashboard-common-title">Analytics & Logs</h2>

        {/* Tab Navigation */}
        <div className="analytics-tabs">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setPage(1); }}
          >
            Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === 'api-logs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('api-logs'); setPage(1); }}
          >
            API Logs
          </button>
          <button
            className={`tab-btn ${activeTab === 'error-logs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('error-logs'); setPage(1); }}
          >
            Error Logs
          </button>
          <button
            className={`tab-btn ${activeTab === 'audit-logs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('audit-logs'); setPage(1); }}
          >
            Audit Logs
          </button>
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => { setActiveTab('reports'); setPage(1); }}
          >
            Reports
          </button>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            {/* Key Metrics Cards */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">API Calls (24h)</div>
                <div className="metric-value">{dashboardData?.api_calls_24h || 0}</div>
                <div className="metric-trend">↑ 12%</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Errors (24h)</div>
                <div className="metric-value">{dashboardData?.errors_24h || 0}</div>
                <div className="metric-trend">↓ 5%</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Success Rate</div>
                <div className="metric-value">{dashboardData?.success_rate || 0}%</div>
                <div className="metric-trend">→ 99.8%</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Avg Response Time</div>
                <div className="metric-value">{dashboardData?.avg_response_time_ms || 0}ms</div>
                <div className="metric-trend">↓ 45ms</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Active Users (30d)</div>
                <div className="metric-value">{dashboardData?.active_users_30d || 0}</div>
                <div className="metric-trend">↑ 234</div>
              </div>
            </div>

            {/* Charts */}
            <div className="charts-row">
              <div className="chart-container">
                <h3>API Calls Trend (30 Days)</h3>
                {dailyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total_calls" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="successful_calls" stroke="#10b981" />
                      <Line type="monotone" dataKey="failed_calls" stroke="#ef4444" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div>No data available</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* API LOGS TAB */}
        {activeTab === 'api-logs' && (
          <div className="logs-section">
            {/* Filters */}
            <div className="filters-container">
              <input
                type="text"
                placeholder="Endpoint (e.g., /api/users)"
                value={filters.endpoint}
                onChange={(e) => setFilters({ ...filters, endpoint: e.target.value })}
              />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
              <input
                type="text"
                placeholder="Status Code"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              />
              <button onClick={() => handleExport('csv')} className="export-btn">📥 CSV</button>
              <button onClick={() => handleExport('json')} className="export-btn">📥 JSON</button>
            </div>

            {/* Logs Table */}
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Timestamp</th>
                    <th>Endpoint</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Duration (ms)</th>
                    <th>User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {apiLogs.map((log) => (
                    <tr key={log.id} className={`status-${Math.floor(log.status_code / 100)}xx`}>
                      <td>{log.id}</td>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td className="endpoint-cell">{log.endpoint}</td>
                      <td><span className="method-badge">{log.http_method}</span></td>
                      <td>
                        <span className={`status-badge status-${log.status_code}`}>
                          {log.status_code}
                        </span>
                      </td>
                      <td>{log.duration_ms}</td>
                      <td>{log.user_id || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {apiLogs.length === 0 && <p className="no-data">No API logs found</p>}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                ← Previous
              </button>
              <span>Page {page}</span>
              <button onClick={() => setPage(page + 1)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ERROR LOGS TAB */}
        {activeTab === 'error-logs' && (
          <div className="logs-section">
            {/* Filters */}
            <div className="filters-container">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">🔴 Critical</option>
                <option value="ERROR">❌ Error</option>
                <option value="WARNING">⚠️ Warning</option>
                <option value="INFO">ℹ️ Info</option>
              </select>
              <button onClick={() => handleExport('csv')} className="export-btn">📥 CSV</button>
              <button onClick={() => handleExport('json')} className="export-btn">📥 JSON</button>
            </div>

            {/* Error Logs Table */}
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Message</th>
                    <th>User ID</th>
                    <th>Resolved</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {errorLogs.map((log) => (
                    <tr key={log.id} className={`severity-${log.error_severity.toLowerCase()}`}>
                      <td>{log.id}</td>
                      <td>{log.error_type}</td>
                      <td>
                        <span className={`severity-badge ${log.error_severity.toLowerCase()}`}>
                          {log.error_severity}
                        </span>
                      </td>
                      <td className="message-cell">{log.error_message}</td>
                      <td>{log.user_id || '-'}</td>
                      <td>
                        <span className={log.is_resolved ? 'resolved' : 'unresolved'}>
                          {log.is_resolved ? '✅ Yes' : '❌ No'}
                        </span>
                      </td>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {errorLogs.length === 0 && <p className="no-data">No error logs found</p>}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                ← Previous
              </button>
              <span>Page {page}</span>
              <button onClick={() => setPage(page + 1)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'audit-logs' && (
          <div className="logs-section">
            {/* Filters */}
            <div className="filters-container">
              <button onClick={() => handleExport('csv')} className="export-btn">📥 CSV</button>
              <button onClick={() => handleExport('json')} className="export-btn">📥 JSON</button>
            </div>

            {/* Audit Logs Table */}
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className={`action-${log.action_status.toLowerCase()}`}>
                      <td>{log.id}</td>
                      <td>{log.actor_name}</td>
                      <td className="action-cell">{log.action_name}</td>
                      <td>{log.resource_type}</td>
                      <td>
                        <span className={`status-badge ${log.action_status.toLowerCase()}`}>
                          {log.action_status}
                        </span>
                      </td>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {auditLogs.length === 0 && <p className="no-data">No audit logs found</p>}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                ← Previous
              </button>
              <span>Page {page}</span>
              <button onClick={() => setPage(page + 1)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="logs-section">
            <div className="filters-container">
              <input
                type="date"
                value={reportFilters.startDate}
                onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
              />
              <input
                type="date"
                value={reportFilters.endDate}
                onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
              />
              <button onClick={() => handleProcessedProductsExport('csv')} className="export-btn">Download CSV</button>
              <button onClick={() => handleProcessedProductsExport('xlsx')} className="export-btn">Download Excel</button>
            </div>

            {reportLoading ? (
              <div className="loading">Loading reports...</div>
            ) : (
              <>
                <div className="chart-container">
                  <h3>List of All Processed Products</h3>
                  <div className="logs-table-container">
                    <table className="logs-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>User</th>
                          <th>Plan</th>
                          <th>Feature</th>
                          <th>Total Processed</th>
                          <th>Tokens Used</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedProducts.slice(0, 100).map((row, idx) => (
                          <tr key={`${row.user_id}-${row.date_bucket}-${idx}`}>
                            <td>{row.date_bucket}</td>
                            <td>{row.user_name || row.user_id}</td>
                            <td>{row.plan_title || row.plan_id || '-'}</td>
                            <td>{row.feature_name || '-'}</td>
                            <td>{row.total_processed || 0}</td>
                            <td>{row.tokens_used || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {processedProducts.length === 0 && <p className="no-data">No processed products found</p>}
                  </div>
                </div>

                <div className="reports-grid">
                  <div className="chart-container">
                    <h3>Tokens Used per Day</h3>
                    <div className="logs-table-container">
                      <table className="logs-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Tokens</th>
                            <th>Requests</th>
                            <th>Users</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tokenUsageDaily.slice(0, 60).map((row, idx) => (
                            <tr key={`${row.date}-${idx}`}>
                              <td>{row.date}</td>
                              <td>{Number(row.total_tokens || 0).toLocaleString()}</td>
                              <td>{row.requests_count || 0}</td>
                              <td>{row.users_count || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {tokenUsageDaily.length === 0 && <p className="no-data">No daily token usage found</p>}
                    </div>
                  </div>

                  <div className="chart-container">
                    <h3>Tokens Used per Month</h3>
                    <div className="logs-table-container">
                      <table className="logs-table">
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Tokens</th>
                            <th>Requests</th>
                            <th>Users</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tokenUsageMonthly.slice(0, 24).map((row, idx) => (
                            <tr key={`${row.month}-${idx}`}>
                              <td>{row.month}</td>
                              <td>{Number(row.total_tokens || 0).toLocaleString()}</td>
                              <td>{row.requests_count || 0}</td>
                              <td>{row.users_count || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {tokenUsageMonthly.length === 0 && <p className="no-data">No monthly token usage found</p>}
                    </div>
                  </div>
                </div>

                <div className="chart-container">
                  <h3>Tokens per User / Plan</h3>
                  <div className="logs-table-container">
                    <table className="logs-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Plan</th>
                          <th>Total Tokens</th>
                          <th>Requests</th>
                          <th>Cost (USD)</th>
                          <th>Last Used</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tokenUsageByUserPlan.slice(0, 200).map((row, idx) => (
                          <tr key={`${row.user_id}-${row.plan_id}-${idx}`}>
                            <td>{row.user_name || row.user_id}</td>
                            <td>{row.plan_title || row.plan_id || '-'}</td>
                            <td>{Number(row.total_tokens || 0).toLocaleString()}</td>
                            <td>{row.requests_count || 0}</td>
                            <td>{Number(row.total_cost_usd || 0).toFixed(4)}</td>
                            <td>{row.last_used_at ? new Date(row.last_used_at).toLocaleString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {tokenUsageByUserPlan.length === 0 && <p className="no-data">No user/plan usage found</p>}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && <div className="loading">Loading...</div>}
      </div>

      <style>{`
        .analytics-logs-container {
          padding: 20px;
        }

        .analytics-tabs {
          display: flex;
          gap: 10px;
          margin: 20px 0;
          border-bottom: var(--border-color);
        }

        .tab-btn {
          padding: 10px 20px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
        }

        .tab-btn.active {
          color: #20c1c8;
          border-bottom-color: #20c1c8;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }

        .metric-card {
          background: var(--bg-02);
          border: var(--border-color);
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        .metric-label {
          color: #a0aec0;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 32px;
          font-weight: bold;
          color: #ffffff;
          margin: 10px 0;
        }

        .metric-trend {
          color: #22c55e;
          font-size: 12px;
        }

        .charts-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }

        .chart-container {
          background: var(--bg-02);
          border: var(--border-color);
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        .chart-container h3 {
          color: #ffffff;
          margin-top: 0;
        }

        .filters-container {
          display: flex;
          gap: 10px;
          margin: 20px 0;
          flex-wrap: wrap;
        }

        .filters-container input,
        .filters-container select {
          padding: 8px 12px;
          border: var(--border-color);
          background: var(--bg-02);
          color: #ffffff;
          border-radius: 6px;
          font-size: 14px;
        }

        .filters-container input::placeholder {
          color: #94a3b8;
        }

        .export-btn {
          padding: 8px 16px;
          background: linear-gradient(94.75deg, #20c1c8 4.66%, #5d3bf5 93.44%);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: filter 0.3s;
        }

        .export-btn:hover {
          filter: brightness(1.1);
        }

        .logs-table-container {
          background: var(--bg-02);
          border: var(--border-color);
          border-radius: 8px;
          overflow: auto;
          margin: 20px 0;
        }

        .logs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .logs-table thead {
          background: rgba(0, 0, 0, 0.3);
        }

        .logs-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #a0aec0;
          font-size: 12px;
          text-transform: uppercase;
          border-bottom: var(--border-color);
        }

        .logs-table td {
          padding: 12px;
          border-bottom: var(--border-color);
          font-size: 13px;
          color: #e2e8f0;
        }

        .logs-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .method-badge {
          display: inline-block;
          padding: 4px 8px;
          background: rgba(32, 193, 200, 0.2);
          color: #20c1c8;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.status-200,
        .status-badge.status-201 {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .status-badge.status-400,
        .status-badge.status-401,
        .status-badge.status-403 {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .status-badge.status-500 {
          background: rgba(220, 38, 38, 0.15);
          color: #dc2626;
        }

        .severity-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .severity-badge.critical {
          background: rgba(220, 38, 38, 0.15);
          color: #dc2626;
        }

        .severity-badge.error {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .severity-badge.warning {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .severity-badge.info {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .resolved {
          color: #22c55e;
          font-weight: 600;
        }

        .unresolved {
          color: #ef4444;
          font-weight: 600;
        }

        .pagination {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 20px 0;
          padding: 20px;
        }

        .pagination button {
          padding: 8px 16px;
          border: var(--border-color);
          background: var(--bg-02);
          color: #ffffff;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        }

        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
          border-color: #20c1c8;
        }

        .no-data {
          text-align: center;
          color: #94a3b8;
          padding: 40px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #a0aec0;
          font-size: 14px;
        }

        .endpoint-cell,
        .message-cell,
        .action-cell {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default AnalyticsAndLogsPage;

