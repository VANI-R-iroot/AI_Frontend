
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import adminImage from "../assets/image/admin/allImage";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/baseUrl";
import { useAuth } from "../context/AuthContext";


const CommonTrailBar: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [showTrialBanner, setShowTrialBanner] = useState(false);
    const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
    const navigate = useNavigate()
    const location = useLocation();
    const { userRole } = useAuth();

    useEffect(() => {
        if (userRole !== "user") {
            setShowTrialBanner(false);
            return;
        }
        const loadSubscription = async () => {
            try {
                const res = await axiosInstance.get("/subscription/current");
                if (res.data?.success && res.data.data) {
                    const sub = res.data.data;
                    const status = (sub.subscription_status || sub.stripe_status || "").toLowerCase();
                    const packageType = (sub.package_type || sub.title || "").toLowerCase();
                    const now = Date.now();
                    const endsAt = sub.ends_at ? new Date(sub.ends_at).getTime() : null;
                    const hasExplicitIsActive = sub.is_active !== undefined || sub.isActive !== undefined;
                    const activeStatus = status === "active" || status === "trialing";
                    const notExpiredByDate = !endsAt || endsAt > now;
                    const isActive = hasExplicitIsActive
                        ? (
                            sub.is_active === true ||
                            sub.is_active === 1 ||
                            sub.is_active === "1" ||
                            sub.isActive === true ||
                            sub.isActive === 1 ||
                            sub.isActive === "1" ||
                            (activeStatus && notExpiredByDate)
                          )
                        : (activeStatus && notExpiredByDate);
                    const isTrial = (status === "trialing" || packageType.includes("trial")) && isActive;

                    if (isTrial) {
                        if (endsAt) {
                            const diffDays = Math.max(0, Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24)));
                            setTrialDaysLeft(diffDays);
                        }
                        setShowTrialBanner(true);
                        return;
                    }
                }
                setShowTrialBanner(false);
            } catch {
                setShowTrialBanner(false);
            }
        };

        loadSubscription();
        const handleSubscriptionUpdated = () => {
            loadSubscription();
        };
        const handleWindowFocus = () => {
            loadSubscription();
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                loadSubscription();
            }
        };

        window.addEventListener("subscription-updated", handleSubscriptionUpdated);
        window.addEventListener("focus", handleWindowFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            window.removeEventListener("subscription-updated", handleSubscriptionUpdated);
            window.removeEventListener("focus", handleWindowFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [userRole, location.pathname]);

    const handleClose = () => {
        setIsVisible(false);
    };

    if (userRole !== "user" || !isVisible || !showTrialBanner) return null;

    return (
        <div className="offer-card-section">
            <div className="row">
                <div className="col-10 col-sm-10 col-md-10 col-lg-10 col-xl-10 col-xxl-11">
                    <div className="plan-offer-trial-content">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-8 col-xl-8 ">
                                <h3>Your trial expires in <strong>{trialDaysLeft ?? 10} Days</strong>. To maintain access Upgrade to Pro</h3>
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-4 col-xl-4">
                                <div className="upgrade-btn" onClick={() => navigate("/pricingplan")}>
                                    <img src={adminImage.offerButtonIcon} alt="smart ai" />
                                    <button>
                                        Upgrade Plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-1 col-xxl-1 plan-trill-close-icon" onClick={handleClose} style={{ cursor: "pointer" }}>
                    <IoClose />
                </div>
            </div>
        </div>
    );
};

export default CommonTrailBar;


