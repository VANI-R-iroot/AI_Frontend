import { useState, useEffect } from "react";
import axiosInstance from "./baseUrl";

interface Permission {
  id: number;
  perm_key: string;
  label: string;
  description?: string;
}

interface UseAdminPermissionsReturn {
  permissions: Permission[];
  permissionKeys: Set<string>;
  loading: boolean;
  error: string | null;
  hasPermission: (permKey: string) => boolean;
  hasAnyPermission: (permKeys: string[]) => boolean;
  hasAllPermissions: (permKeys: string[]) => boolean;
  hasModuleAccess: (moduleName: string) => boolean;
}

/**
 * Hook to fetch and manage admin permissions for the current user
 * Permissions are fetched from /admin/access/me/permissions
 */
export const useAdminPermissions = (): UseAdminPermissionsReturn => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionKeys, setPermissionKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get("/admin/access/me/permissions");
        
        if (response.data?.status === "success") {
          const perms = response.data.data || [];
          setPermissions(perms);
          
          // Create a Set of permission keys for O(1) lookup
          const keys = new Set<string>(perms.map((p: Permission) => p.perm_key));
          setPermissionKeys(keys);
        } else {
          setPermissions([]);
          setPermissionKeys(new Set());
        }
      } catch (err: any) {
        console.error("Failed to fetch admin permissions:", err);
        setError(
          err?.response?.data?.message ||
          "Failed to fetch permissions"
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
   * Check if user has access to a module (has at least one permission for it)
   * Module names: "announcement", "faq", "package", "prompt", "blog", etc.
   * Checks if user has any permission starting with "moduleName."
   */
  const hasModuleAccess = (moduleName: string): boolean => {
    const prefix = `${moduleName}.`;
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
