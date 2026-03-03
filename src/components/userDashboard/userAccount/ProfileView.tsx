import React from "react";
import { useUserStore } from "../../../zustand/userDetailsStore";

const ProfileView: React.FC = () => {
  const userData = useUserStore((state) => state.userData);
  const jobRole = userData?.job_role || userData?.jobRole;
  const phoneNumber = userData?.phone_number || userData?.phoneNumber;
  const companyName = userData?.company_name || userData?.companyName;
  const companyWebsite = userData?.company_website || userData?.companyWebsite;
  const addressLine = userData?.address_line || userData?.addressLine;
  const postalCode = userData?.postal_code || userData?.postalCode;
  const userName = userData?.user_name || userData?.userName;
  const state = userData?.state || "";

  return (
    <div className="profile-view">
      <div className="header">
        <h4>Profile Information</h4>
      </div>

      <div className="profile-details">
        <div className="detail-group">
          <div className="detail-item">
            <label>Full Name</label>
            <p>{userData?.name}</p>
          </div>
          <div className="detail-item">
            <label>Username</label>
            <p>{userName || "Not provided"}</p>
          </div>
          <div className="detail-item">
            <label>Job Role</label>
            <p>{jobRole || "Not provided"}</p>
          </div>
        </div>

        <div className="detail-group">
          <div className="detail-item">
            <label>Email Address</label>
            <p>{userData?.email}</p>
          </div>
          <div className="detail-item">
            <label>Phone Number</label>
            <p>{phoneNumber || "Not provided"}</p>
          </div>
        </div>

        <div className="detail-group">
          <div className="detail-item">
            <label>Company Name</label>
            <p>{companyName || "Not provided"}</p>
          </div>
          <div className="detail-item">
            <label>Company Website</label>
            <p>{companyWebsite || "Not provided"}</p>
          </div>
        </div>

        <div className="detail-group">
          <div className="detail-item">
            <label>Address</label>
            <p>{addressLine || "Not provided"}</p>
          </div>
        </div>

        <div className="detail-group">
          <div className="detail-item">
            <label>City</label>
            <p>{userData?.city || "Not provided"}</p>
          </div>
          <div className="detail-item">
            <label>State</label>
            <p>{state || "Not provided"}</p>
          </div>
          <div className="detail-item">
            <label>Postal Code</label>
            <p>{postalCode || "Not provided"}</p>
          </div>
          <div className="detail-item">
            <label>Country</label>
            <p>{userData?.country || "Not provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;

