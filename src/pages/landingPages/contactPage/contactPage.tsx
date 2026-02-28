import { SetStateAction, useState } from "react";
import "../../../assets/css/contactPage.css";
import Footer from "../../../common/homeFooter.tsx";
import HomeNavbar from "../../../common/HomeNavbar.tsx";
import { MdLocationPin } from "react-icons/md";
import { FaHeadphones } from "react-icons/fa6";
import { LuMail } from "react-icons/lu";
import ShortLink from "../../../common/ShortLinkPublic.tsx";
const AIServiceForm = () => {
  const [activeTab, setActiveTab] = useState("image");
  const [formData, setFormData] = useState({
    firstName: "Smith",
    lastName: "Jonson",
    userName: "Jonson Milner",
    phoneNumber: "+1-202-555-0174",
    bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
  });

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTabClick = (tab: SetStateAction<string>) => {
    setActiveTab(tab);
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <>
      <HomeNavbar></HomeNavbar>
      <div className="contact-page-number-01">
        <div className="container">
          <ShortLink />
          <div className="ai-form-container">
            <div className="home01-form-section">
              <h1 className="form-title">
                Get Started with a free
                <br /> quotation
              </h1>

              <div className="tab-grid">
                {["Plugin", "photo", "trained Bot", "code"].map((tab) => (
                  <button
                    key={tab}
                    className={`home01-contact-tab-button ${
                      activeTab === tab ? "active" : ""
                    }`}
                    onClick={() => handleTabClick(tab)}
                  >
                    <div className="tab-content">
                      <span className="tab-line-1">
                        AI {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </span>
                      <span className="tab-line-2">Generator</span>
                    </div>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="home01-contact-form-row">
                  <div className="home01-contact-form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="home01-contact-form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="home01-contact-form-row">
                  <div className="home01-contact-form-group">
                    <label>User Name</label>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="home01-contact-form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="home01-contact-form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={6}
                  />
                </div>

                <button type="submit" className="home01-contact-submit-button">
                  Update Info
                </button>
              </form>
            </div>

            <div className="home01-contact-section">
              <div className="home01-contact-box">
                <div className="icon-title-wrap">
                  <div className="home01-contact-icon">
                    <MdLocationPin />
                  </div>
                  <div>
                    <h2>Location</h2>
                    <p>100 avenue of the moon, 12 New York, NY 10018 US.</p>
                  </div>
                </div>
              </div>

              <div className="home01-contact-box">
                <div className="icon-title-wrap">
                  <div className="home01-contact-icon">
                    <FaHeadphones />
                  </div>
                  <div className="home01-contact-right-text-title">
                    <h2>Contact Number</h2>
                    <p>+1202 555 0174</p>
                    <p>+333 555 01741 </p>
                  </div>
                </div>
              </div>
              <div className="home01-contact-box">
                <div className="icon-title-wrap">
                  <div className="home01-contact-icon">
                    <LuMail />
                  </div>
                  <div className="home01-contact-right-text-title">
                    <h2>Our Email Address</h2>
                    <p>admin@gmail.com</p>
                    <p>demo@gmail.com</p>
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

export default AIServiceForm;
