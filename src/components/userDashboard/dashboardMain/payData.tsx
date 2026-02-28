import React from "react";

interface Stats {
  availableLimit: number;
  totalLimit: number;
}

const UsageStatsCard: React.FC<{ stats: Stats }> = ({ stats }) => {
  const isUnlimited =
    Number(stats.totalLimit) === -1 || Number(stats.availableLimit) === -1;

  const usagePercentage = isUnlimited
    ? 100
    : stats.totalLimit > 0
    ? Math.min((stats.availableLimit / stats.totalLimit) * 100, 100)
    : 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(0)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toString();
  };

  const containerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "384px",
    margin: "0 auto",
  };

  const textStyle: React.CSSProperties = {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: "8px",
  };

  const progressBarContainerStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#374151",
    borderRadius: "9999px",
    height: "8px",
    overflow: "hidden",
  };

  const progressBarFillStyle: React.CSSProperties = {
    height: "100%",
    borderRadius: "9999px",
    transition: "all 0.5s ease-out",
    width: `${usagePercentage}%`,
    background: "linear-gradient(90deg, #3B82F6 0%, #06B6D4 100%)",
  };

  return (
    <div style={containerStyle}>
      <div style={textStyle}>
        {isUnlimited
          ? "Unlimited"
          : `Used ${formatNumber(stats.availableLimit)}/ ${formatNumber(
              stats.totalLimit
            )} Limit`}
      </div>

      <div style={progressBarContainerStyle}>
        <div style={progressBarFillStyle} />
      </div>
    </div>
  );
};
export default UsageStatsCard;
