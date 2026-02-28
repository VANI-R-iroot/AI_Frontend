import React, { ReactNode } from "react";
import { useAdminPermissions } from "../utils/useAdminPermissions";

interface PermissionGuardProps {
  children: ReactNode;
  permKey: string;
  fallback?: ReactNode;
  disabled?: boolean;
  showDisabled?: boolean;
}

/**
 * Component to conditionally render content based on admin permissions
 * 
 * Usage:
 * <PermissionGuard permKey="prompt.create" showDisabled={true}>
 *   <button>Create Prompt</button>
 * </PermissionGuard>
 * 
 * If showDisabled=true and user lacks permission, the content is shown but disabled
 * If showDisabled=false and user lacks permission, nothing is rendered
 * If disabled=true, the content is wrapped in a disabled state
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permKey,
  fallback = null,
  disabled = false,
  showDisabled = false,
}) => {
  const { hasPermission, loading } = useAdminPermissions();

  if (loading) {
    return <>{fallback}</>;
  }

  const hasAccess = hasPermission(permKey);
  const isDisabled = disabled || !hasAccess;

  if (!hasAccess && !showDisabled) {
    return <>{fallback}</>;
  }

  // If content should be shown but disabled
  if (isDisabled && showDisabled) {
    return (
      <div className="permission-guard-wrapper" data-permission={permKey}>
        {typeof children === "string" ? (
          <span title={`Permission required: ${permKey}`}>{children}</span>
        ) : React.isValidElement(children) ? (
          React.cloneElement(children as React.ReactElement<any>, {
            disabled: true,
            className: `${
              (children as React.ReactElement<any>).props.className || ""
            } permission-disabled`,
          })
        ) : (
          children
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
