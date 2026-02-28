import React, { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { FiUpload } from "react-icons/fi";
import CustomTextEditor from "../../components/textEditor/textEditor";
import axiosInstance from "../../utils/baseUrl";
import { TbCategoryPlus } from "react-icons/tb";

const LOCAL_STORAGE_KEY = "admin-blog-draft";

export interface CustomTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}
const CreateBlogPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [editorValue, setEditorValue] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isInitializedRef = useRef(false);
  const blogId = location.state?.id || "";

  useEffect(() => {
    if (isInitializedRef.current) return;

    const stateData = location.state || {};
    const blogId = stateData.id;

    if (blogId) {
      setTitle(stateData.title || "");
      setTag(stateData.tag || "");
      setCategory(stateData.category || "");
      setEditorValue(stateData.editorValue || "");
    } else {
      setTitle("");
      setTag("");
      setCategory("");
      setEditorValue("");
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    isInitializedRef.current = true;
  }, [location.state]);

  useEffect(() => {
    const saveDraft = () => {
      const data = { title, tag, category, editorValue };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    };

    saveDraft();
  }, [title, tag, category, editorValue]);

  const handleFileChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      setFile: React.Dispatch<React.SetStateAction<File | null>>
    ) => {
      const file = e.target.files?.[0];
      if (file && /\.(jpe?g|png)$/i.test(file.name)) {
        setFile(file);
      } else {
        toast.error("Only JPEG, JPG, PNG files are allowed.");
        e.target.value = "";
      }
    },
    []
  );

  const uploadEditorImages = async (htmlContent: string): Promise<string> => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = htmlContent;
    const images = tempElement.querySelectorAll("img");
    const uploadPromises = [];

    for (let i = 0; i < images.length; i++) {
      const imgElement = images[i];
      const imgSrc = imgElement.getAttribute("src");

      if (imgSrc && imgSrc.startsWith("data:image/")) {
        const uploadPromise = new Promise<void>(async (resolve) => {
          try {
            const response = await fetch(imgSrc);
            const blob = await response.blob();

            const fileName = `editor-image-${Date.now()}-${i}.${
              blob.type.split("/")[1]
            }`;
            const file = new File([blob], fileName, { type: blob.type });

            const formData = new FormData();
            formData.append("image", file);

            const uploadResponse = await axiosInstance.post(
              "/uploadEditorImage",
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );

            if (uploadResponse.data && uploadResponse.data.imageUrl) {
              imgElement.setAttribute("src", uploadResponse.data.imageUrl);
            }
          } catch (error) {
            console.error("Failed to upload editor image:", error);
          }
          resolve();
        });

        uploadPromises.push(uploadPromise);
      }
    }

    await Promise.all(uploadPromises);
    return tempElement.innerHTML;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!title || !tag || !category) {
      toast.error("Title, tag, and category are required");
      setIsSubmitting(false);
      return;
    }

    if (!thumbnail && !blogId) {
      toast.error("Please upload a thumbnail image");
      setIsSubmitting(false);
      return;
    }

    if (!coverImage && !blogId) {
      toast.error("Please upload a cover image");
      setIsSubmitting(false);
      return;
    }

    try {
      const processedContent = await uploadEditorImages(editorValue);

      const formData = new FormData();
      if (thumbnail) formData.append("thumbnail", thumbnail);
      if (coverImage) formData.append("coverImage", coverImage);
      formData.append("title", title);
      formData.append("description", processedContent);
      formData.append("tag", tag);
      formData.append("category", category);
      formData.append("postCreate", "Admin");

      if (blogId) {
        formData.append("id", blogId);
      }

      const response = await axiosInstance.post(
        blogId ? "/updateBlogData" : "/crateBlog",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data) {
        toast.success(
          blogId ? "Blog updated successfully" : "Blog created successfully"
        );

        if (!blogId) {
          setTitle("");
          setTag("");
          setCategory("");
          setEditorValue("");
          setThumbnail(null);
          setCoverImage(null);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }

        navigate("/admin-blogs", { state: { refresh: true } });
      } else {
        toast.error("Something went wrong");
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorImageUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axiosInstance.post(
        "/uploadEditorImage",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data && response.data.imageUrl) {
        return response.data.imageUrl;
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image. Please try again.");
      throw error;
    }
  };

  return (
    <div className="main-content-common">
      <form className="row" onSubmit={handleSubmit}>
        <div className="col-lg-10 col-xl-12 smart-ai-admin-blog-create-page-section">
          <div className="cancel-admin-dashboard-button-global">
            <button onClick={() => navigate("/admin-blogs")} type="button">
              Cancel
            </button>
          </div>
          <div className="row blog-image-upload">
            {[
              [
                "thumbnail",
                thumbnail,
                setThumbnail,
                "Thumbnail Image (required)",
              ],
              [
                "coverImage",
                coverImage,
                setCoverImage,
                "Cover Image (required)",
              ],
            ].map(([name, file, setter, label]) => (
              <div
                className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6"
                key={name as string}
              >
                <div className="blog-page-image">
                  <div className="image-preview-container">
                    {file ? (
                      <img
                        src={URL.createObjectURL(file as File)}
                        alt={name as string}
                        className="image-preview"
                      />
                    ) : (
                      <span className="no-image-text">No image selected</span>
                    )}
                  </div>
                  <div className="pt-4">
                    <label className="upload-label">
                      {typeof label === "string" ? label : "Choose file"}
                    </label>

                    <input
                      type="file"
                      id={`upload-${name}`}
                      onChange={(e) =>
                        handleFileChange(
                          e as React.ChangeEvent<HTMLInputElement>,
                          setter as any
                        )
                      }
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden-input"
                    />
                    <label htmlFor={`upload-${name}`} className="upload-button">
                      <FiUpload className="upload-icon" /> Upload
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-to-image-item">
            <label>Post Title (required)</label>
            <div className="input-filed-item-smart-ai">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              ></input>
            </div>
          </div>
          <div className="text-to-image-item pt-3">
            <label>Select Post Category (required)</label>
            <div className="select-item-data">
              <div>
                <TbCategoryPlus />
              </div>
              <select
                className="form-select"
                aria-label="Default select example"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                <option value="Technology">Technology</option>
                <option value="Sports">Sports</option>
                <option value="AI">AI</option>
              </select>
            </div>
          </div>
          <div className="text-to-image-item pt-3">
            <label>Post Tag (required)</label>
            <div className="input-filed-item-smart-ai">
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                required
              ></input>
            </div>
          </div>

          <div className="pt-4">
            <label>Post Content</label>
            <CustomTextEditor
              value={editorValue}
              onChange={setEditorValue}
              onImageUpload={handleEditorImageUpload}
            />
          </div>
          <Button
            type="submit"
            className="admin-blog-publish-button mt-5 pt-3 pb-3"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? blogId
                ? "Updating..."
                : "Publishing..."
              : blogId
              ? "Update Blog"
              : "Publish your Article"}
          </Button>
        </div>
      </form>

      <Button
        className="blog-content-preview"
        onClick={() =>
          navigate("/admin-blog-demo-preview", {
            state: {
              coverImage: coverImage ? URL.createObjectURL(coverImage) : null,
              title,
              category,
              tag,
              editorValue,
            },
          })
        }
      >
        View Live Demo
      </Button>
    </div>
  );
};

export default CreateBlogPage;
