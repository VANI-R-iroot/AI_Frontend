import React, { useState, useEffect } from "react";
import { apiConfig } from "../../../utils/apiConfig.tsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/baseUrl.ts";
import images from "../../../assets/image/Home-02/AllIamge.tsx";

type BlogItem = {
  _id: string;
  title: string;
  thumbnail: string;
  coverImage: string;
  category: string;
  description: string;
  tag: string;
  postCreate: string;
  active: boolean;
  createDate: string;
};

const BlogSection: React.FC = () => {
  const [blogData, setBlogData] = useState<BlogItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogList = async () => {
      try {
        const res = await axiosInstance.get("/read-blog");
        const blogData = res.data.data;
        sessionStorage.setItem("BlogList", JSON.stringify(blogData));

        setBlogData(blogData);
      } catch (error) {
        console.error("Fetch failed", error);
      }
    };

    const storedData = sessionStorage.getItem("BlogList");
    if (storedData) {
      setBlogData(JSON.parse(storedData));
    }

    fetchBlogList();
  }, []);

  function stripHtmlAndTruncate(html: string, wordLimit: number): string {
    if (!html) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    const words = plainText.trim().split(/\s+/);

    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : plainText;
  }

  return (
    <section className="blog-section-smart-ai-home">
      <div className="container-fluid">
        <div className=" banner-service-section-button">
          <button>Blogs</button>
        </div>
        <div className="common-title-section-smart-ai">
          <div>
            <h3>Useful Resources & Articles</h3>
          </div>

          <div className="banner-text-section">
            <p className="service-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore
            </p>
          </div>
        </div>
      </div>

      <div className="blog-cards-container">
        <div className="container">
          <div className="row">
            {blogData.slice(0, 3).map((post) => (
              <div
                key={post._id}
                className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4 col-xxl-4 pt-4"
              >
                <div
                  className="blog-card"
                  onClick={() =>
                    navigate("/blog-details", {
                      state: { id: post._id },
                    })
                  }
                >
                  <div className="blog-card-image">
                    <img
                      src={`${apiConfig.imageUrl}/${post.thumbnail}`}
                      alt={post.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="blog-card-content">
                    <div className="category-badge">
                      <h2>{post.category}</h2>
                    </div>

                    <h2 className="blog-title">
                      {post.title.split(" ").length > 10
                        ? post.title.split(" ").slice(0, 10).join(" ") + "..."
                        : post.title}
                    </h2>
                    <p className="blog-description">
                      {stripHtmlAndTruncate(post.description, 9)}
                    </p>
                    <div className="blog-author">
                      <img
                        src={images.voiceChatbotLogo}
                        alt={post._id}
                        className="author-image"
                        loading="lazy"
                      />
                      <div className="author-info">
                        <h4 className="author-name">{post.postCreate}</h4>
                        <p className="publish-info">
                          {new Date(post.createDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
export default BlogSection;
