import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/baseUrl";
import { useTeamPermissions } from "../../utils/useTeamPermissions";
import "../../assets/css/userDashboard/teamSettings.css";

type TeamOverview = {
  team: { id: number; name: string };
  members: {
    id: number;
    name: string;
    email: string;
    role_name: string;
    role_id: number;
    status: string;
  }[];
  roles: {
    id: number;
    name: string;
    description: string;
    is_system: number;
    permissions?: { id: number; label: string; perm_key: string }[];
  }[];
  permissions: { id: number; label: string; perm_key: string }[];
  seatLimit: number;
  activeCount: number;
};

const TeamSettings: React.FC = () => {
  const [overview, setOverview] = useState<TeamOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get team permissions for current user
  const { hasPermission } = useTeamPermissions();

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissionIds: [] as number[],
  });
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [memberEdits, setMemberEdits] = useState<
    Record<number, { role_id: number; status: string }>
  >({});

  const loadOverview = async () => {
    const res = await axiosInstance.get("/team/overview");
    setOverview(res.data?.data || null);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        await loadOverview();
      } catch (err: any) {
        setOverview(null);
        const status = err?.response?.status;
        if (status === 403) {
          setError("You do not have permission to manage this team.");
        } else {
          setError(err?.response?.data?.message || "Failed to load team settings.");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check permission to manage team
    if (!hasPermission("manage_team")) {
      setError("You don't have permission to invite team members.");
      return;
    }
    
    if (!inviteEmail || !inviteRole) return;
    try {
      const res = await axiosInstance.post("/team/invite", {
        email: inviteEmail,
        role_id: Number(inviteRole),
      });
      setInviteToken(res.data?.data?.token || null);
      setInviteEmail("");
    } catch (err: any) {
      setInviteToken(null);
      setError(err?.response?.data?.message || "Failed to send invite.");
    }
  };

  const togglePermission = (id: number) => {
    setRoleForm((prev) => {
      const exists = prev.permissionIds.includes(id);
      return {
        ...prev,
        permissionIds: exists
          ? prev.permissionIds.filter((pid) => pid !== id)
          : [...prev.permissionIds, id],
      };
    });
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check permission to manage roles
    if (!hasPermission("manage_roles")) {
      setError("You don't have permission to manage roles.");
      return;
    }
    
    if (!roleForm.name.trim()) return;
    try {
      if (editingRoleId) {
        await axiosInstance.put(`/team/roles/${editingRoleId}`, {
          name: roleForm.name,
          description: roleForm.description,
          permission_ids: roleForm.permissionIds,
        });
      } else {
        await axiosInstance.post("/team/roles", {
          name: roleForm.name,
          description: roleForm.description,
          permission_ids: roleForm.permissionIds,
        });
      }
      setRoleForm({ name: "", description: "", permissionIds: [] });
      setEditingRoleId(null);
      await loadOverview();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save role.");
    }
  };

  const handleEditRole = (role: TeamOverview["roles"][number]) => {
    setEditingRoleId(role.id);
    setRoleForm({
      name: role.name || "",
      description: role.description || "",
      permissionIds: (role.permissions || []).map((p) => p.id),
    });
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!hasPermission("manage_roles")) {
      setError("You don't have permission to manage roles.");
      return;
    }
    
    try {
      await axiosInstance.delete(`/team/roles/${roleId}`);
      await loadOverview();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete role.");
    }
  };

  const handleSaveMember = async (memberId: number) => {
    if (!hasPermission("manage_team")) {
      setError("You don't have permission to manage team members.");
      return;
    }
    
    const edit = memberEdits[memberId];
    if (!edit) return;
    try {
      await axiosInstance.patch(`/team/members/${memberId}`, edit);
      await loadOverview();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update team member.");
    }
  };

  if (loading) {
    return (
      <div className="main-content-common">
        <div className="row">
          <div className="col-12">
            <div className="card p-4">Loading team settings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content-common team-settings-page">
      <div className="row">
        <div className="col-12">
          <div className="card p-4 mb-4">
            <h3 className="mb-2">Team Settings</h3>
            <p className="text-muted mb-0">
              Manage team members, roles, and permissions for your workspace.
            </p>
            {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card p-4 mb-4">
            <h5 className="mb-3">Team Overview</h5>
            <div className="d-flex justify-content-between">
              <span>Team</span>
              <strong>{overview?.team?.name || "My Team"}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span>Seats</span>
              <strong>
                {overview?.activeCount || 0} / {overview?.seatLimit ?? 0}
              </strong>
            </div>
          </div>

          <div className="card p-4 mb-4">
            <h5 className="mb-3">Invite Member</h5>
            <form onSubmit={handleInvite}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@company.com"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  required
                >
                  <option value="">Select role</option>
                  {overview?.roles?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                Send Invite
              </button>
            </form>
            {inviteToken && (
              <div className="alert alert-info mt-3">
                Invite created. Token: <strong>{inviteToken}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card p-4 mb-4">
            <h5 className="mb-3">Team Members</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {overview?.members?.map((member) => {
                    const edit = memberEdits[member.id] || {
                      role_id: member.role_id,
                      status: member.status,
                    };
                    return (
                      <tr key={member.id}>
                        <td>{member.name || "-"}</td>
                        <td>{member.email}</td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={edit.role_id}
                            onChange={(e) =>
                              setMemberEdits((prev) => ({
                                ...prev,
                                [member.id]: {
                                  ...edit,
                                  role_id: Number(e.target.value),
                                },
                              }))
                            }
                          >
                            {overview?.roles?.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={edit.status}
                            onChange={(e) =>
                              setMemberEdits((prev) => ({
                                ...prev,
                                [member.id]: {
                                  ...edit,
                                  status: e.target.value,
                                },
                              }))
                            }
                          >
                            <option value="active">active</option>
                            <option value="inactive">inactive</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleSaveMember(member.id)}
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!overview?.members?.length && (
                    <tr>
                      <td colSpan={5}>No team members yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-4 mb-4">
            <h5 className="mb-3">Role Management</h5>
            <form className="mb-3" onSubmit={handleRoleSubmit}>
              <div className="mb-2">
                <input
                  className="form-control"
                  placeholder="Role name"
                  value={roleForm.name}
                  onChange={(e) =>
                    setRoleForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="mb-2">
                <input
                  className="form-control"
                  placeholder="Description"
                  value={roleForm.description}
                  onChange={(e) =>
                    setRoleForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="mb-2">
                <div className="small text-muted mb-1">Permissions</div>
                <div className="d-flex flex-wrap gap-2">
                  {overview?.permissions?.map((perm) => (
                    <label key={perm.id} className="form-check-label">
                      <input
                        className="form-check-input me-2"
                        type="checkbox"
                        checked={roleForm.permissionIds.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit">
                  {editingRoleId ? "Update Role" : "Create Role"}
                </button>
                {editingRoleId && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => {
                      setEditingRoleId(null);
                      setRoleForm({ name: "", description: "", permissionIds: [] });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            <ul className="mb-0">
              {overview?.roles?.map((role) => (
                <li key={role.id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      {role.name} {role.is_system ? "(System)" : ""}
                    </span>
                    {!role.is_system && (
                      <span className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditRole(role)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          Delete
                        </button>
                      </span>
                    )}
                  </div>
                  {role.permissions?.length ? (
                    <div className="small text-muted">
                      {role.permissions.map((p) => p.label).join(", ")}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4">
            <h5 className="mb-3">Permissions</h5>
            <ul className="mb-0">
              {overview?.permissions?.map((perm) => (
                <li key={perm.id}>{perm.label}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSettings;
