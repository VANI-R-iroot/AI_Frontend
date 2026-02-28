import React, { useState, useRef, ChangeEvent } from "react";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  label?: string;
  required?: boolean;
  minWidth?: number;
  minHeight?: number;
}

const PngImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  label = "Select Chat Assistant Avatar",
  required = false,
  minWidth = 60,
  minHeight = 60,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check file type
      if (!file.type.includes("png")) {
        setError("Only PNG files are allowed");
        resolve(false);
        return;
      }

      // Check dimensions
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const { width, height } = img;
        URL.revokeObjectURL(img.src);

        if (width < minWidth || height < minHeight) {
          setError(`Image must be at least ${minWidth}px by ${minHeight}px`);
          resolve(false);
        } else {
          setError(null);
          resolve(true);
        }
      };

      img.onerror = () => {
        setError("Failed to load image");
        resolve(false);
      };
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const isValid = await validateImage(file);

      if (isValid) {
        setSelectedImage(URL.createObjectURL(file));
        onImageSelect(file);
      } else {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setSelectedImage(null);
      }
    }
  };

  return (
    <div className="image-uploader-container">
      <div className="image-uploader-header">
        <label className="image-uploader-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      </div>

      <div className="image-uploader-content">
        <div className="image-uploader-preview-area">
          {selectedImage ? (
            <div className="image-preview">
              <img
                src={selectedImage}
                alt="Selected preview"
                className="preview-image"
              />
            </div>
          ) : (
            <div className="no-image-placeholder">
              <span>
                Minimum {minWidth}px by {minHeight}px image
              </span>
            </div>
          )}
        </div>

        <input
          type="file"
          accept=".png"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          className="file-input"
        />

        <button
          type="button"
          onClick={handleBrowseClick}
          className="browse-button"
        >
          BROWSE
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default PngImageUploader;
