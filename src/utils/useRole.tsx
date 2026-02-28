// hooks/useRole.ts
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { RxDashboard } from "react-icons/rx";
import { SiLivechat } from "react-icons/si";
import { RiSecurePaymentLine } from "react-icons/ri";
import { TbCurrencyDollar } from "react-icons/tb";
import { PiPlugsConnectedFill } from "react-icons/pi";
import adminImage from "../assets/image/admin/allImage";
import { ReactElement } from "react";

// Menu item type

export interface MenuItem {
  title: string;
  icon: ReactElement;
  path: string;
  permission?: string[];
}

// Role permissions type
export interface RoleConfig {
  name: string;
  displayName: string;
  permissions: string[];
  menu: MenuItem[];
  showProgress?: boolean;
  showUpgrade?: boolean;
}

// Complete role configuration
const roleConfigurations: Record<string, RoleConfig> = {
  user: {
    name: "user",
    displayName: "User",
    permissions: ["view_widgets", "view_support", "view_live_chat"],
    showProgress: true,
    showUpgrade: true,
    menu: [
      { 
        title: "Widget Setting", 
        icon: <PiPlugsConnectedFill />, 
        path: "/plugin-list",
        permission: ["view_widgets"]
      },
      { 
        title: "Support", 
        icon: <img src={adminImage.FaqIcon} alt="Support" />, 
        path: "/support",
        permission: ["view_support"]
      },
      { 
        title: "Live Chat", 
        icon: <SiLivechat />, 
        path: "/live-chat",
        permission: ["view_live_chat"]
      },
    ],
  },
  admin: {
    name: "admin",
    displayName: "Administrator",
    permissions: [
      "view_dashboard", 
      "view_widgets", 
      "manage_support", 
      "view_payments", 
      "manage_live_chat", 
      "view_affiliate"
    ],
    showProgress: false,
    showUpgrade: false,
    menu: [
      { 
        title: "Admin Dashboard", 
        icon: <RxDashboard />, 
        path: "/admin",
        permission: ["view_dashboard"]
      },
      { 
        title: "Widget Setting", 
        icon: <PiPlugsConnectedFill />, 
        path: "/plugin-list",
        permission: ["view_widgets"]
      },
      { 
        title: "Support", 
        icon: <img src={adminImage.FaqIcon} alt="Support" />, 
        path: "/admin-ticket-token",
        permission: ["manage_support"]
      },
      { 
        title: "Payment", 
        icon: <RiSecurePaymentLine />, 
        path: "/admin-orders",
        permission: ["view_payments"]
      },
      { 
        title: "Live Chat", 
        icon: <SiLivechat />, 
        path: "/admin-live-chat",
        permission: ["manage_live_chat"]
      },
      { 
        title: "Affiliate", 
        icon: <TbCurrencyDollar />, 
        path: "/affiliate",
        permission: ["view_affiliate"]
      },
    ],
  },
  superAdmin: {
    name: "superAdmin",
    displayName: "Super Administrator",
    permissions: [
      "full_access", 
      "manage_users", 
      "view_reports", 
      "manage_affiliate", 
      "system_settings"
    ],
    showProgress: false,
    showUpgrade: false,
    menu: [
      { 
        title: "Super Admin Dashboard", 
        icon: <RxDashboard />, 
        path: "/super-admin",
        permission: ["full_access"]
      },
      { 
        title: "Manage Users", 
        icon: <PiPlugsConnectedFill />, 
        path: "/manage-users",
        permission: ["manage_users"]
      },
      { 
        title: "Reports", 
        icon: <RiSecurePaymentLine />, 
        path: "/reports",
        permission: ["view_reports"]
      },
      { 
        title: "Affiliate", 
        icon: <TbCurrencyDollar />, 
        path: "/affiliate",
        permission: ["manage_affiliate"]
      },
    ],
  },
};

export const useRole = () => {
  const { userRole, isAuthenticated, loading } = useAuth();

  // Get current role configuration
  const currentRoleConfig = useMemo(() => {
    return roleConfigurations[userRole] || roleConfigurations.user;
  }, [userRole]);

  // Get menu items for current role
  const getMenuItems = useMemo(() => {
    return currentRoleConfig.menu;
  }, [currentRoleConfig]);

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || loading) return false;
    
    const config = roleConfigurations[userRole];
    if (!config) return false;
    
    // Super admin has all permissions
    if (config.permissions.includes("full_access")) return true;
    
    return config.permissions.includes(permission);
  };

  // Check if user can access a specific path
  const canAccessPath = (path: string): boolean => {
    if (!isAuthenticated || loading) return false;
    
    const menuItem = currentRoleConfig.menu.find(item => item.path === path);
    if (!menuItem || !menuItem.permission) return false;
    
    return menuItem.permission.some(permission => hasPermission(permission));
  };

  // Check if user is specific role
  const isRole = (role: string): boolean => {
    return userRole === role && isAuthenticated;
  };

  // Check multiple roles
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.includes(userRole) && isAuthenticated;
  };

  // Get filtered menu items based on permissions
  const getAccessibleMenuItems = useMemo(() => {
    return currentRoleConfig.menu.filter(item => {
      if (!item.permission) return true;
      return item.permission.some(permission => hasPermission(permission));
    });
  }, [currentRoleConfig, userRole, isAuthenticated]);

  // Role-based UI configurations
  const uiConfig = useMemo(() => ({
    showProgress: currentRoleConfig.showProgress || false,
    showUpgrade: currentRoleConfig.showUpgrade || false,
    displayName: currentRoleConfig.displayName,
    permissions: currentRoleConfig.permissions,
  }), [currentRoleConfig]);

  return {
    // Basic role info
    userRole,
    isAuthenticated,
    loading,
    
    // Role configuration
    roleConfig: currentRoleConfig,
    
    // Menu items
    menuItems: getMenuItems,
    accessibleMenuItems: getAccessibleMenuItems,
    
    // Permission checks
    hasPermission,
    canAccessPath,
    isRole,
    hasAnyRole,
    
    // UI configuration
    uiConfig,
    
    // Utility functions
    isUser: () => isRole("user"),
    isAdmin: () => isRole("admin"),
    isSuperAdmin: () => isRole("superAdmin"),
    isAdminOrAbove: () => hasAnyRole(["admin", "superAdmin"]),
    
    // Permission shortcuts
    canViewDashboard: () => hasPermission("view_dashboard") || hasPermission("full_access"),
    canManageUsers: () => hasPermission("manage_users") || hasPermission("full_access"),
    canViewReports: () => hasPermission("view_reports") || hasPermission("full_access"),
    canManageSupport: () => hasPermission("manage_support") || hasPermission("full_access"),
  };
};