import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/baseUrl";
import "../../assets/css/adminDashboard/accessControl.css";

type AdminMember = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

type AdminPermission = {
  id: number;
  label: string;
  perm_key: string;
};

type AdminRole = {
  id: number;
  name: string;
  description: string;
  is_system: number;
  permissions?: AdminPermission[];
};

const AccessControlPage: React.FC = () => {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissionIds: [] as number[],
  });
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [memberEdits, setMemberEdits] = useState<
    Record<number, { role: string; status: string }>
  >({});

  const loadAccess = async () => {
    const results = await Promise.allSettled([
      axiosInstance.get("/admin/access/members"),
      axiosInstance.get("/admin/access/roles"),
      axiosInstance.get("/admin/access/permissions"),
    ]);

    const [membersRes, rolesRes, permsRes] = results;

    if (membersRes.status === "fulfilled") {
      setMembers(membersRes.value.data?.data || []);
    } else {
      setMembers([]);
    }

    if (rolesRes.status === "fulfilled") {
      setRoles(rolesRes.value.data?.data || []);
    } else {
      setRoles([]);
    }

    if (permsRes.status === "fulfilled") {
      setPermissions(permsRes.value.data?.data || []);
    } else {
      setPermissions([]);
    }

    const firstError = results.find((r) => r.status === "rejected");
    if (firstError && firstError.status === "rejected") {
      const status = firstError.reason?.response?.status;
      if (status === 403) {
        setError("You do not have permission to manage admins.");
      } else {
        setError(
          firstError.reason?.response?.data?.message ||
            "Failed to load access control data."
        );
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);
        await loadAccess();
      } catch (err: any) {
        setMembers([]);
        setRoles([]);
        setPermissions([]);
        const status = err?.response?.status;
        if (status === 403) {
          setError("You do not have permission to manage admins.");
        } else {
          setError(
            err?.response?.data?.message ||
              "Failed to load access control data."
          );
        }
      }
    };
    init();
  }, []);

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
    if (!roleForm.name.trim()) return;
    try {
      setError(null);
      if (editingRoleId) {
        await axiosInstance.put(`/admin/access/roles/${editingRoleId}`, {
          name: roleForm.name,
          description: roleForm.description,
          permission_ids: roleForm.permissionIds,
        });
        toast.success("Role updated successfully.");
      } else {
        await axiosInstance.post("/admin/access/roles", {
          name: roleForm.name,
          description: roleForm.description,
          permission_ids: roleForm.permissionIds,
        });
        toast.success("Role created successfully.");
      }
      setRoleForm({ name: "", description: "", permissionIds: [] });
      setEditingRoleId(null);
      await loadAccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save role.");
    }
  };

  const handleEditRole = (role: AdminRole) => {
    setEditingRoleId(role.id);
    setRoleForm({
      name: role.name || "",
      description: role.description || "",
      permissionIds: (role.permissions || []).map((p) => p.id),
    });
  };

  const handleDeleteRole = async (roleId: number) => {
    try {
      setError(null);
      await axiosInstance.delete(`/admin/access/roles/${roleId}`);
      toast.success("Role deleted successfully.");
      await loadAccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete role.");
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !memberForm.name ||
      !memberForm.email ||
      !memberForm.password ||
      !memberForm.role
    )
      return;
    try {
      await axiosInstance.post("/admin/access/members", memberForm);
      setMemberForm({ name: "", email: "", password: "", role: "" });
      await loadAccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create admin member.");
    }
  };

  const handleSaveMember = async (memberId: number) => {
    const edit = memberEdits[memberId];
    if (!edit) return;
    try {
      await axiosInstance.patch(`/admin/access/members/${memberId}`, {
        role: edit.role,
        status: edit.status,
      });
      await loadAccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update admin member.");
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    try {
      await axiosInstance.delete(`/admin/access/members/${memberId}`);
      await loadAccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete admin member.");
    }
  };

  return (
    <div className="main-content-common access-control-page">
      <div className="row">
        <div className="col-12">
          <div className="card p-4 mb-4">
            <h3 className="mb-2">Access Control</h3>
            <p className="text-muted mb-0">
              Manage admin members, roles, and permissions.
            </p>
            {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card p-4 mb-4">
            <h5 className="mb-3">Admin Team Members</h5>
            <form className="mb-3" onSubmit={handleCreateMember}>
              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <input
                    className="form-control"
                    placeholder="Name"
                    value={memberForm.name}
                    onChange={(e) =>
                      setMemberForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <input
                    className="form-control"
                    type="email"
                    placeholder="Email"
                    value={memberForm.email}
                    onChange={(e) =>
                      setMemberForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Password"
                    value={memberForm.password}
                    onChange={(e) =>
                      setMemberForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="col-12 col-md-4">
                  <select
                    className="form-select"
                    value={memberForm.role}
                    onChange={(e) =>
                      setMemberForm((prev) => ({ ...prev, role: e.target.value }))
                    }
                    required
                  >
                    <option value="">Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-2 d-grid">
                  <button className="btn btn-primary" type="submit">
                    Add
                  </button>
                </div>
              </div>
            </form>
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
                  {members.map((member) => {
                    const edit = memberEdits[member.id] || {
                      role: member.role,
                      status: member.status,
                    };
                    return (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>{member.email}</td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={edit.role}
                            onChange={(e) =>
                              setMemberEdits((prev) => ({
                                ...prev,
                                [member.id]: {
                                  ...edit,
                                  role: e.target.value,
                                },
                              }))
                            }
                          >
                            {roles.map((role) => (
                              <option key={role.id} value={role.name}>
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
                        <td className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleSaveMember(member.id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!members.length && (
                    <tr>
                      <td colSpan={5}>No admin members found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-4">
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
                  {permissions.map((perm) => (
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
              {roles.map((role) => (
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
              {!roles.length && <li>No roles configured.</li>}
            </ul>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card p-4 mb-4">
            <h5 className="mb-3">Permissions Control</h5>
            <ul className="mb-0">
              {permissions.map((perm) => (
                <li key={perm.id}>{perm.label}</li>
              ))}
              {!permissions.length && <li>No permissions configured.</li>}
            </ul>
          </div>

          <div className="card p-4">
            <h5 className="mb-3">Notes</h5>
            <p className="text-muted mb-0">
              Use system roles for quick setup or create custom roles for
              granular access control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessControlPage;
