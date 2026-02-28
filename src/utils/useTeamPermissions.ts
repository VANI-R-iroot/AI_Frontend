import { useState, useEffect } from "react";
import axiosInstance from "./baseUrl";
import { getSessionUser } from "./userSession";

interface TeamPermission {
  id: number;
  perm_key: string;
  label: string;
  description?: string;
}

interface UseTeamPermissionsReturn {
  permissions: TeamPermission[];
  permissionKeys: Set<string>;
  loading: boolean;
  error: string | null;
  hasPermission: (permKey: string) => boolean;
  hasAnyPermission: (permKeys: string[]) => boolean;
  hasAllPermissions: (permKeys: string[]) => boolean;
  hasModuleAccess: (moduleName: string) => boolean;
}

/**
 * Hook to fetch and manage team permissions for the current user
 * Team permissions are role-based within a specific team
 * Permissions are fetched from the team overview endpoint
 */
export const useTeamPermissions = (): UseTeamPermissionsReturn => {
  const [permissions, setPermissions] = useState<TeamPermission[]>([]);
  const [permissionKeys, setPermissionKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get team overview which includes user's role and permissions
        const response = await axiosInstance.get("/team/overview");
        
        if (response.data?.status === "success") {
          const members = response.data?.data?.members || [];
          const roles = response.data?.data?.roles || [];
          const sessionUser = getSessionUser() || {};
          const sessionUserId = String(sessionUser.id || "");
          const sessionUserEmail = String(sessionUser.email || "").toLowerCase();

          const currentUserMember = members.find((m: any) => {
            const memberUserId = String(m?.user_id || "");
            const memberEmail = String(m?.email || "").toLowerCase();
            return (
              (sessionUserId && memberUserId && memberUserId === sessionUserId) ||
              (sessionUserEmail && memberEmail && memberEmail === sessionUserEmail)
            );
          });

          if (currentUserMember?.role_id) {
            const role = roles.find((r: any) => Number(r.id) === Number(currentUserMember.role_id));
            const rolePerms = (role?.permissions || []) as TeamPermission[];
            setPermissions(rolePerms);
            setPermissionKeys(new Set(rolePerms.map((p: TeamPermission) => p.perm_key)));
          } else {
            setPermissions([]);
            setPermissionKeys(new Set());
          }
        } else {
          setPermissions([]);
          setPermissionKeys(new Set());
        }
      } catch (err: any) {
        console.error("Failed to fetch team permissions:", err);
        setError(
          err?.response?.data?.message ||
          "Failed to fetch team permissions"
        );
        setPermissions([]);
        setPermissionKeys(new Set());
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = (permKey: string): boolean => {
    return permissionKeys.has(permKey);
  };

  const hasAnyPermission = (permKeys: string[]): boolean => {
    return permKeys.some(key => permissionKeys.has(key));
  };

  const hasAllPermissions = (permKeys: string[]): boolean => {
    return permKeys.every(key => permissionKeys.has(key));
  };

  /**
   * Check if user has access to a team feature/module
   * Module names: "dashboard", "products", "billing", "team", "roles"
   * Checks if user has any permission starting with "moduleName_"
   */
  const hasModuleAccess = (moduleName: string): boolean => {
    const prefix = `${moduleName}_`;
    for (const key of permissionKeys) {
      if (key.startsWith(prefix)) {
        return true;
      }
    }
    return false;
  };

  return {
    permissions,
    permissionKeys,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
  };
};
