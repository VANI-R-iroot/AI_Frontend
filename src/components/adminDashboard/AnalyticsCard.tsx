import React from "react";
import { FaUsers, FaUserAlt, FaWallet, FaReceipt } from "react-icons/fa";
import { RiVipCrownFill } from "react-icons/ri";

type DashboardCards = {
  totalUsers?: number;
  users30d?: number;
  totalSubscriptions?: number;
  subscriptions30d?: number;
  totalFreeUsers?: number;
  freeUsers30d?: number;
  totalIncome?: number;
  income30d?: number;
  totalExpense?: number;
  expense30d?: number;
};

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

type DashboardProps = {
  cards?: DashboardCards;
};

const formatNumber = (value: number) => value.toLocaleString("en-US");
const formatMoney = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const buildTrend = (amount: number, suffix: string) => {
  const isPositive = amount >= 0;
  const absValue = Math.abs(amount);
  return {
    value: `${isPositive ? "+" : "-"}${suffix === "money" ? formatMoney(absValue) : formatNumber(absValue)}`,
    isPositive,
  };
};

export default function Dashboard({ cards }: DashboardProps) {
  const totalUsers = Number(cards?.totalUsers || 0);
  const users30d = Number(cards?.users30d || 0);
  const totalSubscriptions = Number(cards?.totalSubscriptions || 0);
  const subscriptions30d = Number(cards?.subscriptions30d || 0);
  const totalFreeUsers = Number(cards?.totalFreeUsers || 0);
  const freeUsers30d = Number(cards?.freeUsers30d || 0);
  const totalIncome = Number(cards?.totalIncome || 0);
  const income30d = Number(cards?.income30d || 0);
  const totalExpense = Number(cards?.totalExpense || 0);
  const expense30d = Number(cards?.expense30d || 0);

  const usersTrend = buildTrend(users30d, "count");
  const subsTrend = buildTrend(subscriptions30d, "count");
  const freeTrend = buildTrend(freeUsers30d, "count");
  const incomeTrend = buildTrend(income30d, "money");
  const expenseTrend = buildTrend(expense30d, "money");

  const cardData: CardData[] = [
    {
      title: "Total Users",
      value: formatNumber(totalUsers),
      icon: <FaUsers size={20} />,
      iconBgColor: "#0bc5ea",
      trend: {
        value: usersTrend.value,
        isPositive: usersTrend.isPositive,
        text: "Last 30 days users",
      },
    },
    {
      title: "Total Subscription",
      value: formatNumber(totalSubscriptions),
      icon: <RiVipCrownFill size={20} />,
      iconBgColor: "#805ad5",
      trend: {
        value: subsTrend.value,
        isPositive: subsTrend.isPositive,
        text: "Last 30 days subscription",
      },
    },
    {
      title: "Total Free Users",
      value: formatNumber(totalFreeUsers),
      icon: <FaUserAlt size={20} />,
      iconBgColor: "#0bc5ea",
      trend: {
        value: freeTrend.value,
        isPositive: freeTrend.isPositive,
        text: "Last 30 days users",
      },
    },
    {
      title: "Total Income",
      value: formatMoney(totalIncome),
      icon: <FaWallet size={20} />,
      iconBgColor: "#48bb78",
      trend: {
        value: incomeTrend.value,
        isPositive: incomeTrend.isPositive,
        text: "Last 30 days income",
      },
    },
    {
      title: "Total Expense",
      value: formatMoney(totalExpense),
      icon: <FaReceipt size={20} />,
      iconBgColor: "#f56565",
      trend: {
        value: expenseTrend.value,
        isPositive: expenseTrend.isPositive,
        text: "Last 30 days expense",
      },
    },
  ];

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
