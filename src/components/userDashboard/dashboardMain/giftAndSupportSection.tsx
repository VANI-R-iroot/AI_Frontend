import { FaGift } from "react-icons/fa6";
import { FaCopy } from "react-icons/fa6";
import adminImage from "../../../assets/image/admin/allImage";
import { useNavigate } from "react-router-dom";
import { apiConfig } from "../../../utils/apiConfig.tsx";

const GiftAndSupport = () => {
  const referralLink = `${apiConfig.imageUrl}/register?aff=P60NPOHAAFGD`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied to clipboard!");
  };

  const navigate = useNavigate();

  return (
    <>
      <div className="row">
        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-6 col-xxl-6">
          <div className="user-dashboard-referral-card">
            <div className="gift-icon">
              <FaGift />
            </div>

            <h2>
              Invite your friends and earn lifelong recurring commissions. 💸
            </h2>

            <p className="description">
              Simply share your referral link and have your friends sign up
              through it.
            </p>

            <div className="commission-info">
              <div className="info-item">
                <span className="label">Commission Rate:</span>
                <span className="value">10%</span>
              </div>
              <div className="info-item">
                <span className="label">Referral Program:</span>
                <span className="value">All Purchases</span>
              </div>
            </div>

            <div className="earnings-section">
              <div className="earnings-label">Earnings</div>
              <div className="earnings-amount">$0</div>
            </div>

            <div className="referral-link">
              <input
                type="text"
                value={referralLink} 
                readOnly
              />
              <button
                onClick={handleCopyLink}
                className="dashboard-copy-save-icon"
              >
                <FaCopy />
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-6 col-xxl-6">
          <div className="user-dashboard-support-card">
            <img 
              src={adminImage.aiAssistant} 
              alt="AI Assistant" 
            />
            <div className="user-dashboard-support-card-content">
              <h3>Have a question?</h3>
              <h3>We're here to help you.</h3>
              <button onClick={() => navigate("/open-ticket")}>
                Submit a ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GiftAndSupport;

