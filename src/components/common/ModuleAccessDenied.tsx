import React from "react";
import { FaLock } from "react-icons/fa";
import ShortLink from "../../common/ShortLinkDashboard";

interface ModuleAccessDeniedProps {
  moduleName: string;
  description?: string;
}

/**
 * Component shown when user doesn't have any permissions for a module
 */
const ModuleAccessDenied: React.FC<ModuleAccessDeniedProps> = ({
  moduleName,
  description,
}) => {
  return (
    <div className="main-content-common">
      <div className="global-link-limit-section">
        <ShortLink />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: "20px",
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <FaLock
          size={60}
          style={{
            color: "#ff6b6b",
            opacity: 0.8,
          }}
        />
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "600",
              margin: "0 0 10px 0",
              color: "#333",
            }}
          >
            Access Denied
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#666",
              margin: "0 0 5px 0",
              maxWidth: "400px",
            }}
          >
            You don't have permission to access the{" "}
            <strong>{moduleName}</strong> module.
          </p>
          {description && (
            <p
              style={{
                fontSize: "14px",
                color: "#999",
                margin: "5px 0 0 0",
              }}
            >
              {description}
            </p>
          )}
          <p
            style={{
              fontSize: "14px",
              color: "#999",
              marginTop: "15px",
            }}
          >
            Please contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModuleAccessDenied;
