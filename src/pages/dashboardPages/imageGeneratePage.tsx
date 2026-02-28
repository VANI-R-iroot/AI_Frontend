import { useState, useEffect } from "react";
import adminImage from "../../assets/image/admin/allImage";
import ShortLink from "../../common/ShortLinkDashboard";
import CommonTrailBar from "../../common/CommonTrailBar";
import PayChatData from "../../components/userDashboard/dashboardMain/payData";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/baseUrl";
import { useUserStore } from "../../zustand/userDetailsStore";
import { limitStore } from "../../zustand/limitStore";
import { packageStore } from "../../zustand/packageStore";

import {
  Image_quality,
  Image_mood_style,
  Image_size_Options,
  Image_lighting_style,
  Image_art_style,
} from "../../DataList/dropdownlist";
import { apiConfig } from "../../utils/apiConfig";
import "../../assets/css/textToImage.css";

type ImageItem = {
  id: string;
  email: string;
  imagePrompt: string;
  imageSize: string;
  timestamp: string;
  url: string;
  imageStyle?: string;
  imageMode?: string;
  lightningStyle?: string;
  imgsQuality?: string;
  numberOfImages?: number;
};

const LOCALSTORAGE_KEY = "text_to_image_list";

const CreateImagePage = () => {
  const userData = useUserStore((state) => state.userData);
  const { packageLimitData } = packageStore();
  const { limitData } = limitStore(); // Remove updateLimit from here
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [imagePrompt, setImagePrompt] = useState("");
  const [lightningStyle, setLightningStyle] = useState("");
  const [imgsQuality, setImageQuality] = useState("");
  const [imageSize, setImageSize] = useState("");
  const [imageStyle, setImageStyle] = useState("");
  const [imageMode, setImageMode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageList, setImageList] = useState<ImageItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [currentUsage, setCurrentUsage] = useState<number>(0); // Local state for usage

  // Use apiConfig.imageUrl for image paths
  const imageBaseUrl = apiConfig.imageUrl;

  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const savedData = localStorage.getItem(LOCALSTORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setImageList(parsedData);
        }
      } catch (error) {
        console.error("❌ Error loading from LocalStorage:", error);
      }
    };

    loadFromLocalStorage();
  }, []);

  useEffect(() => {
    fetchImageList();
    // Set initial usage from user data
    if (userData?.api_use_text_to_image) {
      setCurrentUsage(userData.api_use_text_to_image);
    }
  }, [userData]);

  const fetchImageList = async () => {
    try {
      const res = await axiosInstance.get("/get-text-to-img-list");
      if (res.data.status === "success" || res.data.success === true) {
        const imgsList = Array.isArray(res.data.data) ? res.data.data : [];
        
        // Ensure we have the correct field names
        const formattedList = imgsList.map((item: any) => ({
          id: item.id?.toString() || item._id?.toString() || "",
          email: item.email || "",
          imagePrompt: item.imagePrompt || item.imageprompt || "",
          imageSize: item.imageSize || item.imagesize || "",
          timestamp: item.timestamp || item.createDate || "",
          url: item.url || "",
          imageStyle: item.imageStyle || item.imagestyle || "",
          imageMode: item.imageMode || item.imagemode || "",
          lightningStyle: item.lightningStyle || item.lightningstyle || "",
          imgsQuality: item.imgsQuality || item.imgsquality || "",
          numberOfImages: item.numberOfImages || item.numberofimages || 1,
        }));
        
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(formattedList));
        setImageList(formattedList);
      }
    } catch (error) {
      console.error("❌ Fetch failed", error);
      toast.error("Failed to load images");
    }
  };

  // ✅ Helper: Save to LocalStorage
  const saveToLocalStorage = (data: ImageItem[]) => {
    try {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("❌ Error saving to LocalStorage:", error);
    }
  };

  // Calculate stats
  const getStats = () => {
    const totalLimit = packageLimitData?.text_to_image_limit || 
                      packageLimitData?.text_to_image || 
                      3000; // Default limit
    
    const availableLimit = limitData?.apiUseTextToImage || 
                          currentUsage || 
                          userData?.api_use_text_to_image || 
                          0;
    
    return { totalLimit, availableLimit };
  };

  const stats = getStats();

  const decreaseImageCount = () => {
    if (numberOfImages > 1) {
      setNumberOfImages(numberOfImages - 1);
    }
  };

  const increaseImageCount = () => {
    if (numberOfImages < 4) {
      setNumberOfImages(numberOfImages + 1);
    }
  };

  const handleSubmit = async () => {
    if (!imagePrompt) {
      toast.warning("Please enter an image prompt.");
      return;
    }

    // Check if user has enough credits
    if (stats.availableLimit >= stats.totalLimit) {
      toast.error("Text-to-image generation limit exceeded. Please upgrade your plan.");
      return;
    }

    if (stats.availableLimit + numberOfImages > stats.totalLimit) {
      toast.error(`You can only generate ${stats.totalLimit - stats.availableLimit} more image(s).`);
      return;
    }

    const payload = {
      imagePrompt,
      imageSize: imageSize || "1024x1024",
      imageStyle: imageStyle || "realistic",
      imageMode: imageMode || "neutral",
      numberOfImages: numberOfImages || 1,
      lightningStyle: lightningStyle || "natural",
    };

    console.log("Sending payload:", payload);

    setIsLoading(true);
    
    try {
      const res = await axiosInstance.post("/text-to-image", payload);

      console.log("Response:", res.data);

      if (res.data.success === true) {
        toast.success(res.data.message || "Images generated successfully!");
        
        // Update local usage state
        if (res.data.currentUsage) {
          setCurrentUsage(res.data.currentUsage);
        } else {
          // Increment locally if backend doesn't return currentUsage
          setCurrentUsage(prev => prev + numberOfImages);
        }
        
        // Refresh the image list
        await fetchImageList();
      } else {
        toast.error(res.data.error || "Failed to generate images");
      }
    } catch (err: any) {
      console.error("Error:", err);
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
        
        // Handle specific error cases
        if (err.response.data.error.includes("limit exceeded")) {
          // Update to show limit reached
          if (err.response.data.currentUsage) {
            setCurrentUsage(err.response.data.currentUsage);
          } else {
            setCurrentUsage(stats.totalLimit);
          }
        }
      } else {
        toast.error("Failed to generate image. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewImage = (index: number) => {
    setSelectedImageIndex(index);
    setShowModal(true);
  };

  const handleDownloadImage = async (imageUrl: string, fileName: string) => {
    try {
      // Remove any leading slash if present
      const cleanUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
      const fullUrl = `${imageBaseUrl}/${cleanUrl}`;
      
      console.log("Downloading from:", fullUrl);
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "generated-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image. The file might not exist.");
    }
  };

  // ✅ Delete image handler
  const handleDeleteImage = async (imageId: string) => {
    if (!imageId) {
      toast.error("Invalid image ID");
      return;
    }

    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        // Remove from local state and storage
        const updatedList = imageList.filter((img) => img.id !== imageId);
        setImageList(updatedList);
        saveToLocalStorage(updatedList);
        
        toast.success("Image removed from list!");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete image.");
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev > 0 ? prev - 1 : imageList.length - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev < imageList.length - 1 ? prev + 1 : 0
    );
  };

  const selectedImage = imageList[selectedImageIndex];

  return (
    <>
      <div className="main-content-common">
        <CommonTrailBar />

        <div className="global-link-limit-section">
          <div className="short-link-text">
            <ShortLink />
          </div>
          <div>
            <PayChatData stats={stats} />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <div className="left-panel-image">
              <div className="content-wrapper-image-generate">
                <div className="smart-ai-prompt-are">
                  <label>Prompt *</label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    rows={4}
                  />
                </div>
                
                <div className="text-to-image-item">
                  <label>Image Quality</label>
                  <div className="select-item-data">
                    <div>
                      <img src={adminImage.TextImageIcon01} alt="quality" />
                    </div>
                    <select
                      value={imgsQuality}
                      onChange={(e) => setImageQuality(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select quality</option>
                      {Image_quality.map((voice, i) => (
                        <option key={i} value={voice.value}>
                          {voice.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="text-to-image-item">
                  <label>Image Size</label>
                  <div className="select-item-data">
                    <div>
                      <img src={adminImage.TextImageIcon04} alt="size" />
                    </div>
                    <select
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select size</option>
                      {Image_size_Options.map((voice, i) => (
                        <option key={i} value={voice.value}>
                          {voice.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-to-image-item">
                  <label>Art Style</label>
                  <div className="select-item-data">
                    <div>
                      <img src={adminImage.TextImageIcon03} alt="art style" />
                    </div>
                    <select
                      value={imageStyle}
                      onChange={(e) => setImageStyle(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select art style</option>
                      {Image_art_style.map((voice, i) => (
                        <option key={i} value={voice.value}>
                          {voice.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-to-image-item">
                  <label>Mood</label>
                  <div className="select-item-data">
                    <div>
                      <img src={adminImage.TextImageIcon02} alt="mood" />
                    </div>
                    <select
                      value={imageMode}
                      onChange={(e) => setImageMode(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select mood</option>
                      {Image_mood_style.map((voice, i) => (
                        <option key={i} value={voice.value}>
                          {voice.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="aspect-ratio-selector">
                  <div className="section-left">
                    <label>Image Count</label>
                    <div className="image-count-selector">
                      <div>
                        <img src={adminImage.TextImageIcon05} alt="count" />
                      </div>
                      <button
                        className="count-btn decrease"
                        onClick={decreaseImageCount}
                        disabled={numberOfImages <= 1 || isLoading}
                      >
                        <span>−</span>
                      </button>
                      <span className="count-value">{numberOfImages}</span>
                      <button
                        className="count-btn increase"
                        onClick={increaseImageCount}
                        disabled={numberOfImages >= 4 || isLoading}
                      >
                        <span>+</span>
                      </button>
                    </div>
                  </div>

                  <div className="section-right">
                    <label>Lightning Style</label>
                    <div className="select-item-data">
                      <div>
                        <img src={adminImage.TextImageIcon05} alt="lightning" />
                      </div>
                      <select
                        value={lightningStyle}
                        onChange={(e) => setLightningStyle(e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select lighting</option>
                        {Image_lighting_style.map((voice, i) => (
                          <option key={i} value={voice.value}>
                            {voice.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="input-container mt-4">
                  <button
                    className="generate-btn btn-image"
                    onClick={handleSubmit}
                    disabled={isLoading || !imagePrompt || stats.availableLimit >= stats.totalLimit}
                  >
                    {isLoading ? (
                      <>
                        <span className="btn-icon">⏳</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">✨</span>
                        Generate {numberOfImages} Image{numberOfImages > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                  
                  <div className="limit-info mt-2">
                    <small>
                      Available: {stats.totalLimit - stats.availableLimit} / {stats.totalLimit} credits
                      {stats.availableLimit >= stats.totalLimit && (
                        <span className="text-danger ms-2">(Limit reached)</span>
                      )}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="text-to-image-result-section">
              <div className="results-header">
                <h3>Generated Images ({imageList.length})</h3>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={fetchImageList}
                  disabled={isLoading}
                >
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
              </div>

              <div className="image-results-section">
                {imageList.length === 0 ? (
                  <div className="no-images-message">
                    <div className="empty-state">
                      <i className="fas fa-image fa-3x mb-3 text-muted"></i>
                      <p>No images generated yet. Create your first image!</p>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    {imageList.map((item, index) => (
                      <div key={item.id || index} className="col-md-6 col-lg-4 mb-4">
                        <div className="text-to-image-card">
                          <div className="image-container">
                            <img
                              src={`${imageBaseUrl}/AllFile/Upload-image/${item.url}`}
                              className="card-image"
                              alt="Generated Image"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/fallback-image.png';
                                (e.target as HTMLImageElement).alt = 'Image not found';
                              }}
                            />
                            <div className="image-overlay">
                              <div className="action-buttons">
                                <button
                                  className="text-to-img-view-btn view-btn"
                                  onClick={() => handleViewImage(index)}
                                  title="View Image"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="text-to-img-view-btn download-btn"
                                  onClick={() =>
                                    handleDownloadImage(
                                      `AllFile/Upload-image/${item.url}`,
                                      `image-${item.id || Date.now()}.png`
                                    )
                                  }
                                  title="Download Image"
                                >
                                  <i className="fas fa-download"></i>
                                </button>
                                <button
                                  className="text-to-img-view-btn delete-btn"
                                  onClick={() => handleDeleteImage(item.id)}
                                  title="Delete Image"
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="card-footer">
                            <small className="text-truncate d-block" title={item.imagePrompt}>
                              {item.imagePrompt.substring(0, 50)}{item.imagePrompt.length > 50 ? '...' : ''}
                            </small>
                            <small className="text-muted">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedImage && (
          <div className="image-modal-overlay" onClick={handleModalClose}>
            <div
              className="image-modal-text-image"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Image Details</h3>
                <div className="modal-header-actions">
                  <span className="image-counter">
                    {selectedImageIndex + 1} / {imageList.length}
                  </span>
                  <button className="modal-close-btn" onClick={handleModalClose}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div className="modal-content-text-to-img">
                <div className="modal-image-section">
                  <div className="modal-image-container">
                    <button
                      className="nav-btn nav-btn-left"
                      onClick={handlePrevImage}
                      disabled={imageList.length <= 1}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>

                    <img
                      src={`${imageBaseUrl}/AllFile/Upload-image/${selectedImage.url}`}
                      className="modal-image"
                      alt="Selected Image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/fallback-image.png';
                        (e.target as HTMLImageElement).alt = 'Image not found';
                      }}
                    />

                    <button
                      className="nav-btn nav-btn-right"
                      onClick={handleNextImage}
                      disabled={imageList.length <= 1}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>

                    <button
                      className="modal-download-btn"
                      onClick={() =>
                        handleDownloadImage(
                          `AllFile/Upload-image/${selectedImage.url}`,
                          `image-${selectedImage.id || Date.now()}.png`
                        )
                      }
                      title="Download Image"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                  </div>
                </div>

                <div className="modal-details-section">
                  <div className="prompt-section">
                    <div className="prompt-label">
                      <i className="fas fa-comment-alt"></i>
                      Prompt
                    </div>
                    <div className="prompt-text">
                      {selectedImage.imagePrompt}
                    </div>
                  </div>
                  <div className="detail-grid-text-to-img">
                    <div className="detail-item">
                      <span className="detail-label">Date</span>
                      <span className="detail-value date">
                        {new Date(selectedImage.timestamp).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          }
                        )}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Resolution</span>
                      <span className="detail-value">
                        {selectedImage.imageSize || "1024x1024"}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Credit</span>
                      <span className="detail-value credit">1</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">AI Model</span>
                      <span className="detail-value model">DALL-E 3</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Art Style</span>
                      <span className="detail-value">
                        {selectedImage.imageStyle || "Not specified"}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Mood</span>
                      <span className="detail-value">
                        {selectedImage.imageMode || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateImagePage;