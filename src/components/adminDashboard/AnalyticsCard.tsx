import React, { useState } from "react";
import { FaUsers, FaUserAlt, FaWallet, FaReceipt } from "react-icons/fa";
import { RiVipCrownFill } from "react-icons/ri";

interface CardData {
  title: string;
  value: string;
  icon: React.ReactElement;
  iconBgColor: string;
  trend: {
    value: string;
    isPositive: boolean;
    text: string;
  };
}

export default function Dashboard() {
  const [cardData] = useState<CardData[]>([
    {
      title: "Total Users",
      value: "20,000",
      icon: <FaUsers size={20} />,
      iconBgColor: "#0bc5ea",
      trend: {
        value: "+5000",
        isPositive: true,
        text: "Last 30 days users",
      },
    },
    {
      title: "Total Subscription",
      value: "15,000",
      icon: <RiVipCrownFill size={20} />,
      iconBgColor: "#805ad5",
      trend: {
        value: "-800",
        isPositive: false,
        text: "Last 30 days subscription",
      },
    },
    {
      title: "Total Free Users",
      value: "5,000",
      icon: <FaUserAlt size={20} />,
      iconBgColor: "#0bc5ea",
      trend: {
        value: "+200",
        isPositive: true,
        text: "Last 30 days users",
      },
    },
    {
      title: "Total Income",
      value: "$42,000",
      icon: <FaWallet size={20} />,
      iconBgColor: "#48bb78",
      trend: {
        value: "+$20,000",
        isPositive: true,
        text: "Last 30 days income",
      },
    },
    {
      title: "Total Expense",
      value: "$30,000",
      icon: <FaReceipt size={20} />,
      iconBgColor: "#f56565",
      trend: {
        value: "+$5,000",
        isPositive: true,
        text: "Last 30 days expense",
      },
    },
  ]);

  return (
    <>
      <div className="admin-dashboard-card-container">
        {cardData.map((card, index) => (
          <div className="admin-dashboard-card-item " key={index}>
            <div className="admin-item-card-title">{card.title}</div>
            <div className="admin-item-card-value">{card.value}</div>
            <div className="admin-item-card-footer">
              <span
                className={`trend ${
                  card.trend.isPositive ? "trend-up" : "trend-down"
                }`}
              >
                {card.trend.value}
              </span>
              <span className="trend-text">{card.trend.text}</span>
            </div>
            <div
              className="admin-card-item-icon"
              style={{ backgroundColor: card.iconBgColor }}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
