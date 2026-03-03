import React, { useEffect, useRef, useState } from "react";
import ProfileView from "../../components/userDashboard/userAccount/ProfileView";
import EditProfile from "../../components/userDashboard/userAccount/EditProfile";
import ChangePassword from "../../components/userDashboard/userAccount/ChangePassword";
import TwoFactorAuth from "../../components/userDashboard/userAccount/TwoFactorAuth";
import DeleteAccount from "../../components/userDashboard/userAccount/DeleteAccount";
import ApiKeyPanel from "../../components/userDashboard/dashboardMain/ApiKeyPanel";
import { useUserStore } from "../../zustand/userDetailsStore";
import { apiConfig } from "../../utils/apiConfig";
import axiosInstance from "../../utils/baseUrl";
import { toast } from "react-toastify";

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
  const setUserData = useUserStore((state) => state.setUserData);

  const [activeComponent, setActiveComponent] = useState<string>("profile");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadLatestProfile = async () => {
      try {
        const userRes = await axiosInstance.get("/getUserDetails");
        const latestUser = userRes?.data?.data || {};

        let latestCompany: any = null;
        try {
          const companyRes = await axiosInstance.get("/company/my");
          const companies = Array.isArray(companyRes?.data?.data)
            ? companyRes.data.data
            : [];
          latestCompany = companies[0] || null;
        } catch (error) {
          latestCompany = null;
        }

        const mergedProfile = latestCompany
          ? {
              ...latestUser,
              company_name: latestCompany.name ?? latestUser.company_name,
              companyName: latestCompany.name ?? latestUser.companyName,
              company_website:
                latestCompany.website ?? latestUser.company_website,
              companyWebsite:
                latestCompany.website ?? latestUser.companyWebsite,
              city: latestCompany.city ?? latestUser.city,
              country: latestCompany.country ?? latestUser.country,
              state: latestCompany.state ?? latestUser.state,
              phone_number:
                latestCompany.contact_number ?? latestUser.phone_number,
              phoneNumber:
                latestCompany.contact_number ?? latestUser.phoneNumber,
              job_role: latestCompany.role ?? latestUser.job_role,
              jobRole: latestCompany.role ?? latestUser.jobRole,
              team_size: latestCompany.team_size ?? latestUser.team_size,
              platform_name:
                latestCompany.platform_name ?? latestUser.platform_name,
              industry_name:
                latestCompany.industry_name ?? latestUser.industry_name,
            }
          : latestUser;

        if (mounted) {
          setUserData(mergedProfile);
        }
      } catch (error) {
        // Keep current state if refresh fails.
      }
    };

    loadLatestProfile();

    return () => {
      mounted = false;
    };
  }, [setUserData]);

  const handleAvatarClick = () => {
    if (uploadingAvatar) return;
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const data = new FormData();
      data.append("avatar", file);

      const res = await axiosInstance.put("/user-profile-update", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.status === "success") {
        setUserData(res.data.data || {});
        toast.success("Profile image updated successfully");
      } else {
        toast.error("Failed to update profile image");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update profile image"
      );
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

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
              <div
                className="avatar-container"
                onClick={handleAvatarClick}
                style={{ cursor: uploadingAvatar ? "not-allowed" : "pointer" }}
                title="Click to update profile image"
              >
                <img
                  src={`${apiConfig.imageUrl}/${userData?.image}`}
                  alt="User Icon"
                />
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
              <h2 className="profile-name">{userData?.name}</h2>
              <p className="profile-role">{userData?.auth}</p>
              {uploadingAvatar ? (
                <p style={{ fontSize: "12px", opacity: 0.8, marginTop: "8px" }}>
                  Uploading image...
                </p>
              ) : null}
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

