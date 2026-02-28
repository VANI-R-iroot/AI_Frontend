import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

const BlogDemoPreviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { coverImage, title, category, tag, description, editorValue } =
    location.state || {};

  if (!editorValue) {
    return (
      <div className="text-center py-5">
        <h2>No preview data found</h2>
        <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back to Editor
      </button>

      {coverImage && (
        <img
          src={coverImage}
          alt="Cover"
          className="img-fluid rounded mb-4"
          style={{ maxHeight: "700px", objectFit: "cover", width: "800px" }}
        />
      )}

      <h1 className="mb-3">{title}</h1>
      <p className="text-muted">
        Category: <strong>{category}</strong> | Tags: <strong>{tag}</strong>
      </p>
      <p className="lead">{description}</p>

      <div
        className="mt-4"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editorValue) }}
      />
    </div>
  );
};

export default BlogDemoPreviewPage;
