import { useState, useEffect } from "react";
import adminImage from "../../assets/image/admin/allImage";
import ShortLink from "../../common/ShortLinkDashboard";
import axiosInstance from "../../utils/baseUrl";
import PageLoader from "../../common/loader";

const AffiliatePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [affiliateData, setAffiliateData] = useState({
    Withdrawal: 0,
    Percentage: 0,
    AffiliateLink: "",
  });

  useEffect(() => {
    const fetchAffiliateData = async () => {
      try {
        const res = await axiosInstance.get("/getAffiliateData");
        const data = res.data.data;
        if (data) {
          setAffiliateData(data);
        }
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliateData();
  }, []);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setAffiliateData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const res = await axiosInstance.post("/saveAffiliateData", affiliateData);
      if (res.data.status === "success") {
        alert("Affiliate data saved successfully!");
      }
    } catch (error) {
      console.error("Save failed", error);
      alert("Something went wrong while saving.");
    }
  };

  return (
    <div className="main-content-common">
      <div className="global-link-limit-section">
        <div className="short-link-text">
          <ShortLink />
        </div>
      </div>

      <div className="admin-affiliate-page-section">
        <PageLoader isLoading={isLoading} />
        <div className="row">
          <div className="col-sm-12 col-md-12 col-lg-12 col-xl-6 col-xxl-6">
            <div className="content-wrapper-affiliate">
              <h2>Invite More, Earn More</h2>
              <p>
                Lorem Ipsum is dummy text of the printing and typesetting
                industry.
              </p>

              <div className="text-to-image-item">
                <label>Minimum Withdraw Limit</label>
                <div className="input-filed-item-smart-ai">
                  <input
                    type="number"
                    name="Withdrawal"
                    value={affiliateData.Withdrawal}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="text-to-image-item">
                <label>Affiliate Commission Rate (%)</label>
                <div className="input-filed-item-smart-ai">
                  <input
                    type="number"
                    name="Percentage"
                    value={affiliateData.Percentage}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="text-to-image-item">
                <label>Affiliate URL</label>
                <div className="input-filed-item-smart-ai">
                  <input
                    type="text"
                    name="AffiliateLink"
                    value={affiliateData.AffiliateLink}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-container mt-4">
                <button className="generate-btn btn-image" onClick={handleSave}>
                  <span className="btn-icon">✨</span>
                  Save Change
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-affiliate-imgs col-sm-12 col-md-12 col-lg-12 col-xl-6 col-xxl-6">
            <img src={adminImage.AffiliateImge} alt="Affiliate" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliatePage;
