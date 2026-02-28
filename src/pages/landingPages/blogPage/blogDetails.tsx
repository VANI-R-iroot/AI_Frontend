import { useEffect, useState, lazy } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../../utils/baseUrl.ts";
import { apiConfig } from "../../../utils/apiConfig.tsx";
import HomeNavbar from "../../../common/HomeNavbar.tsx";
import { FaRegCalendarAlt } from "react-icons/fa";
import { RiUser3Line } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";
import ShortLink from "../../../common/ShortLinkPublic.tsx";
const Footer = lazy(() => import("../../../common/homeFooter.tsx"));

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

const renderDescriptionWithImagePath = (html: string) => {
  if (!html) return "";

  let updatedHtml = html.replace(
    /<img\s+[^>]*src=["'](?!http)([^"']+)["']/g,
    `<img class="text-image-in-article" src="${apiConfig.imageUrl}$1"`
  );

  updatedHtml = updatedHtml.replace(/<a\s+/g, '<a class="blog-link" ');

  return updatedHtml;
};

const BlogDetails = () => {
  const [searchKeyWord, setSearchKeyWord] = useState("");
  const location = useLocation();
  const blogId = location.state?.id;
  const [blogData, setBlogData] = useState<BlogItem[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);
  const [sideId, setSideId] = useState("");
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
    const fetchBlogs = async () => {
      try {
        const res = await axiosInstance.get("/read-blog");
        const blogs = res.data.data;
        setBlogData(blogs);
        sessionStorage.setItem("BlogList", JSON.stringify(blogs));
      } catch (error) {
        console.error("Fetch failed", error);
      }
    };

    const cached = sessionStorage.getItem("BlogList");
    if (cached) {
      const blogs = JSON.parse(cached);
      setBlogData(blogs);
    } else {
      fetchBlogs();
    }
  }, []);

  useEffect(() => {
    if (!blogData.length) return;

    const targetId = sideId || blogId;
    if (targetId) {
      const found = blogData.find((item) => item._id === targetId);
      setSelectedBlog(found || null);
    }
  }, [blogId, sideId, blogData]);

  const filteredBlogs = blogData.filter(
    (post) =>
      post.title.toLowerCase().includes(searchKeyWord.toLowerCase()) ||
      post.category.toLowerCase().includes(searchKeyWord.toLowerCase())
  );

  return (
    <>
      <HomeNavbar />
      <div className="blog-details-main-section">
        <div className="container">
          <ShortLink />
          <div className="row">
            <div className="col-md-8 col-lg-9 col-xl-9 col-xxl-9 ">
              {selectedBlog ? (
                <div className="selected-blog-details">
                  <h1>{selectedBlog.title}</h1>
                  <p className="date-section-blog-details">
                    <RiUser3Line className="me-2" />
                    {selectedBlog.postCreate}
                    <FaRegCalendarAlt className="ms-3 me-2" />
                    {new Date(selectedBlog.createDate).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>

                  <img
                    src={`${apiConfig.imageUrl}/${selectedBlog.coverImage}`}
                    alt={selectedBlog.title}
                    className="blog-cover-image"
                  />

                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderDescriptionWithImagePath(
                        selectedBlog.description
                      ),
                    }}
                  ></div>

                  <p>
                    <strong>Tags:</strong>
                  </p>
                  <div className="blog-section-tag-container">
                    {selectedBlog?.tag?.split(",").map((tag, index) => (
                      <span key={index} className="blog-section-tag-item">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p>Loading blog...</p>
              )}
            </div>

            <div className="col-md-4 col-lg-3 col-xl-3 col-xxl-3 ">
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
                    {(searchKeyWord
                      ? filteredBlogs
                      : filteredBlogs.slice(0, 3)
                    ).map((post) => (
                      <div
                        key={post._id}
                        className="col-md-12 mb-3"
                        onClick={() => setSideId(post._id)}
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
                    ))}

                    {searchKeyWord && filteredBlogs.length === 0 && (
                      <p className="text-muted text-center mt-2">
                        No blogs found.
                      </p>
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
                        {selectedBlog?.tag?.split(",").map((tag, index) => (
                          <span key={index} className="blog-section-tag-item">
                            {tag.trim()}
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

export default BlogDetails;
