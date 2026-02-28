// src/pages/SettingsPage.tsx
import React from "react";
import PricingTable from "../../../common/priceingPlan";
import ShortLink from '../../../common/ShortLinkDashboard';
const SettingsPage: React.FC = () => {
  return (
    <div className="main-content-common">
       <div className="short-link-text">
            <ShortLink />
          </div>
      <PricingTable></PricingTable>
    </div>
  );
};

export default SettingsPage;