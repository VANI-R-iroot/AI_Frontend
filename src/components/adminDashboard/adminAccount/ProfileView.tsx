import React from "react";
import { useUserStore } from "../../../zustand/userDetailsStore";

const ProfileView: React.FC = () => {
  const userData = useUserStore((state) => state.userData);

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
            <label>Job Role</label>
            <p>{userData?.jobRole}</p>
          </div>
        </div>

        <div className="detail-group">
          <div className="detail-item">
            <label>Email Address</label>
            <p>{userData?.email}</p>
          </div>
          <div className="detail-item">
            <label>Phone Number</label>
            <p>{userData?.phoneNumber}</p>
          </div>
        </div>

        <div className="detail-group">
          <div className="detail-item">
            <label>Company Name</label>
            <p>{userData?.companyName}</p>
          </div>
          <div className="detail-item">
            <label>Company Website</label>
            <p>{userData?.companyWebsite || "Not provided"}</p>
          </div>
        </div>

        <div className="detail-group">
          <div className="detail-item">
            <label>Address</label>
            <p>{userData?.addressLine || "Not provided"}</p>
          </div>
        </div>

        <div className="detail-group">
          <div className="detail-item">
            <label>City</label>
            <p>{userData?.city || "Not provided"}</p>
          </div>
          <div className="detail-item">
            <label>Postal Code</label>
            <p>{userData?.postalCode || "Not provided"}</p>
          </div>
          <div className="detail-item">
            <label>Country</label>
            <p>{userData?.country}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
