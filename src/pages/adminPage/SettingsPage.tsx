// ProfilePage.tsx
import React, { useState } from "react";
import ProfileView from "../../components/adminDashboard/adminAccount/ProfileView";
import EditProfile from "../../components/adminDashboard/adminAccount/EditProfile";
import ChangePassword from "../../components/adminDashboard/adminAccount/ChangePassword";
import TwoFactorAuth from "../../components/adminDashboard/adminAccount/TwoFactorAuth";
import DeleteAccount from "../../components/adminDashboard/adminAccount/DeleteAccount";
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
      case "deleteAccount":
        return (
          <DeleteAccount
            onCancel={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        );
      default:
        return <ProfileView />;
    }
  };

  return (
    <div className="main-content-common">
      <div className="row">
        <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-4  ">
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
                  activeComponent === "deleteAccount" ? "active" : ""
                }`}
                onClick={() => setActiveComponent("deleteAccount")}
              >
                <i className="icon delete-account me-2"></i> Delete Account
              </button>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-12 col-lg-6 col-xl-8">
          <div className="user-profile-content-area">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
