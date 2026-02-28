import React, { useState } from "react";
import ProfileView from "../../components/userDashboard/userAccount/ProfileView";
import EditProfile from "../../components/userDashboard/userAccount/EditProfile";
import ChangePassword from "../../components/userDashboard/userAccount/ChangePassword";
import TwoFactorAuth from "../../components/userDashboard/userAccount/TwoFactorAuth";
import DeleteAccount from "../../components/userDashboard/userAccount/DeleteAccount";
import WooCommerceIntegration from "../../components/userDashboard/userAccount/WooCommerceIntegration";
import ApiKeyPanel from "../../components/userDashboard/dashboardMain/ApiKeyPanel";
import { useUserStore } from "../../zustand/userDetailsStore";
import { apiConfig } from "../../utils/apiConfig";

export type UserProfile = {
  fullName: string;
  jobRole: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  companyName: string;
  companyWebsite: string;
  addressLine: string;
  city: string;
  postalCode: string;
  country: string;
};

export type Stats = {
  wordsLeft: string;
  mediaCreditsLeft: number;
  charactersLeft: string;
  minutesLeft: number;
};

const ProfilePage: React.FC = () => {
  const userData = useUserStore((state) => state.userData);

  const [activeComponent, setActiveComponent] = useState<string>("profile");

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "editProfile":
        return <EditProfile />;

      case "changePassword":
        return <ChangePassword />;
      case "twoFactorAuth":
        return (
          <TwoFactorAuth
            onCancel={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        );
      case "apiKey":
        return <ApiKeyPanel />;
      case "deleteAccount":
        return (
          <DeleteAccount
            onCancel={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        );
      case "wooCommerce":
        return <WooCommerceIntegration />;
      default:
        return <ProfileView />;
    }
  };

  return (
    <div className="main-content-common">
      <div className="row">
        {/* Sidebar */}
        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4  ">
          <div className="user-profile-sidebar-content">
            <div className="profile-summary text-center">
              <div className="avatar-container">
                <img
                  src={`${apiConfig.imageUrl}/${userData?.image}`}
                  alt="User Icon"
                />
              </div>
              <h2 className="profile-name">{userData?.name}</h2>
              <p className="profile-role">{userData?.auth}</p>
            </div>

            <div className="profile-stat-item-section">
              <div className="row">
                <div className="col-6">
                  <div className="profile-stat-item">
                    <span className="stat-label">Package Derision</span>
                    <span className="stat-value">{userData?.packageTime}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="profile-stat-item">
                    <span className="stat-label">Package type</span>
                    <span className="stat-value">{userData?.plan}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-sidebar-menu gap-2 mt-3">
              <button
                className={`profile-menu-button ${
                  activeComponent === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveComponent("profile")}
              >
                <i className="icon view-profile me-2"></i> View Profile
              </button>
              <button
                className={`profile-menu-button ${
                  activeComponent === "editProfile" ? "active" : ""
                }`}
                onClick={() => setActiveComponent("editProfile")}
              >
                <i className="icon view-profile me-2"></i> Edit Profile
              </button>

              <button
                className={`profile-menu-button ${
                  activeComponent === "changePassword" ? "active" : ""
                }`}
                onClick={() => setActiveComponent("changePassword")}
              >
                <i className="icon change-password me-2"></i> Change Password
              </button>
              <button
                className={`profile-menu-button ${
                  activeComponent === "apiKey" ? "active" : ""
                }`}
                onClick={() => setActiveComponent("apiKey")}
              >
                <i className="icon view-profile me-2"></i> API Key
              </button>

              <button
                className={`profile-menu-button ${
                  activeComponent === "deleteAccount" ? "active" : ""
                }`}
                onClick={() => setActiveComponent("deleteAccount")}
              >
                <i className="icon delete-account me-2"></i> Delete Account
              </button>

              <button
                className={`profile-menu-button ${
                  activeComponent === "wooCommerce" ? "active" : ""
                }`}
                onClick={() => setActiveComponent("wooCommerce")}
              >
                <i className="icon view-profile me-2"></i> WooCommerce
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="col-12 col-sm-12 col-md-12 col-lg-8 col-xl-8">
          <div className="user-profile-content-area">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
