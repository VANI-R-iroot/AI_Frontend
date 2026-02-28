import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs: React.FC = () => {
  const { pathname } = useLocation();
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((_, index, array) => {
    const segmentPath = "/" + array.slice(0, index + 1).join("/");

    const label = array[index]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return { path: segmentPath, label };
  });

  return (
    <nav className="public-global-short-link-smart-ai" aria-label="breadcrumb">
      <Link to="/">Home</Link>
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.path}>
          {" > "}
          {index === breadcrumbs.length - 1 ? (
            <span>{crumb.label}</span>
          ) : (
            <Link to={crumb.path}>{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
