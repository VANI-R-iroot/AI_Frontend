import { useState, useEffect } from "react";
import axiosInstance from "../../../utils/baseUrl.ts";
import { apiConfig } from "../../../utils/apiConfig.tsx";
import HomeNavbar from "../../../common/HomeNavbar";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import images from "../../../assets/image/Home-02/AllIamge";
import Footer from "../../../common/homeFooter";
import ShortLink from "../../../common/ShortLinkPublic.tsx";

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

interface Category {
  name: string;
  count: number;
}

const BlogPages = () => {
  const navigate = useNavigate();
  const [blogData, setBlogData] = useState<BlogItem[]>([]);
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const [categories] = useState<Category[]>([
    { name: "Development", count: 3 },
    { name: "Company", count: 3 },
    { name: "Marketing", count: 2 },
    { name: "UX Design", count: 5 },
    { name: "Business", count: 2 },
    { name: "App Development", count: 3 },
    { name: "Application", count: 2 },
    { name: "Art", count: 2 },
  ]);

  useEffect(() => {
    const fetchBlogList = async () => {
      try {
        const res = await axiosInstance.get("/read-blog");
        const faq = res.data.data;
        sessionStorage.setItem("BlogList", JSON.stringify(faq));
        setBlogData(faq);
      } catch (error) {
        console.error("Fetch failed", error);
      }
    };

    const cached = sessionStorage.getItem("BlogList");
    if (cached) {
      setBlogData(JSON.parse(cached));
    }

    fetchBlogList();
  }, []);

  const filteredBlogs = blogData.filter(
    (post) =>
      post.title.toLowerCase().includes(searchKeyWord.toLowerCase()) ||
      post.category.toLowerCase().includes(searchKeyWord.toLowerCase()) ||
      post.tag.toLowerCase().includes(searchKeyWord.toLowerCase())
  );

  const allTags = Array.from(
    new Set(
      blogData
        .flatMap((blog) => blog.tag.split(","))
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );

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
    <>
      <HomeNavbar />

      <div className="blog-details-main-section">
        <div className="container">
          <ShortLink />
          <div className="row">
            <div className="col-md-8 col-lg-9 col-xl-9 col-xxl-9">
              <div className="">
                <div className="row">
                  {(searchKeyWord ? filteredBlogs : blogData).map((post) => (
                    <div
                      key={post._id}
                      className="col-md-6 pt-4"
                      onClick={() =>
                        navigate("/blog-details", {
                          state: { id: post._id },
                        })
                      }
                    >
                      <div className="blog-card">
                        <div className="blog-card-image">
                          <img
                            src={`${apiConfig.imageUrl}/${post.thumbnail}`}
                            alt={post.title}
                          />
                        </div>
                        <div className="blog-card-content">
                          <div className="category-badge">
                            <h2>{post.category}</h2>
                          </div>
                          <h2 className="blog-title">
                            {post.title.split(" ").length > 10
                              ? post.title.split(" ").slice(0, 10).join(" ") +
                                "..."
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
                  {searchKeyWord && filteredBlogs.length === 0 && (
                    <p className="text-muted text-center mt-4">
                      No matching blog found.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-4 col-lg-3 col-xl-3 col-xxl-3">
              <div className="categories-sidebar">
                <div className="admin-dashboard-search-field-smart-ai">
                  <div className="search-input-container">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search blog..."
                      value={searchKeyWord}
                      onChange={(e) => setSearchKeyWord(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="categories-sidebar">
                <div className="categories-container">
                  <h2 className="categories-title">Categories</h2>
                  <div className="categories-list">
                    {categories.map((category, index) => (
                      <div key={index} className="category-item">
                        <span className="category-name">{category.name}</span>
                        <span className="category-count">{category.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="categories-sidebar">
                <div className="categories-container">
                  <h2 className="categories-title">Recent Posts</h2>
                  <div className="row">
                    {(searchKeyWord ? filteredBlogs : blogData.slice(0, 3)).map(
                      (post) => (
                        <div
                          key={post._id}
                          className="col-md-12 mb-3"
                          onClick={() =>
                            navigate("/blog-details", {
                              state: { id: post._id },
                            })
                          }
                        >
                          <div className="recent-side-bar-blog-card d-flex align-items-start">
                            <div className="recent-side-bar-blog-card-image me-3">
                              <img
                                src={`${apiConfig.imageUrl}/${post.thumbnail}`}
                                alt={post.title}
                                className="img-fluid"
                              />
                            </div>
                            <div className="recent-side-bar-blog-card-content">
                              <h4 className="recent-side-bar-blog-title">
                                {post.title.length > 40
                                  ? post.title.slice(0, 40) + "..."
                                  : post.title}
                              </h4>
                              <p className="recent-side-bar-blog-description">
                                {post.description.slice(0, 60)}...
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="categories-sidebar">
                <div className="categories-container">
                  <h2 className="categories-title">Tags</h2>
                  <div className="categories-list">
                    <div className="category-item">
                      <div className="blog-section-tag-container">
                        {allTags.map((tag, index) => (
                          <span key={index} className="blog-section-tag-item">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <section className="home02-footer">
          <div className="container footer-area-home-page">
            <Footer />
          </div>
        </section>
      </div>
    </>
  );
};

export default BlogPages;
