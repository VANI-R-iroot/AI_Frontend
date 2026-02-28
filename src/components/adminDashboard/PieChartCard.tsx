import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FaDesktop, FaMobile, FaTablet } from "react-icons/fa";
import useTrackingStore from "../../zustand/useTrackingStore";

type DeviceData = {
  name: string;
  value: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <div className="tooltip-label">
          <div className="device-icon">{data.icon}</div>
          <span>
            {data.name}: {data.value}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function VisitorsDonutChart() {
  const trackingData = useTrackingStore((state) => state.trackingData);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const getCountryData = () => {
    if (!trackingData || !Array.isArray(trackingData)) return [];

    return trackingData.map((item) => ({
      country: item.country || item.countryName || "Unknown",
      countryCode: item.countryCode || item.country_code || "XX",
      visitors: item.visitors || item.count || 1,
      device: item.device || item.deviceType || "Desktop",
    }));
  };

  const calculateDeviceData = (): DeviceData[] => {
    const countryData = getCountryData();
    const deviceStats = countryData.reduce((acc, item) => {
      if (!acc[item.device]) {
        acc[item.device] = 0;
      }
      acc[item.device] += item.visitors;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(deviceStats).reduce(
      (sum, value) => sum + value,
      0
    );

    return [
      {
        name: "Desktop",
        value: deviceStats.Desktop || 0,
        percentage:
          total > 0
            ? Math.round(((deviceStats.Desktop || 0) / total) * 100)
            : 0,
        color: "#3CD4A0",
        icon: <FaDesktop />,
      },
      {
        name: "Mobile",
        value: deviceStats.Mobile || 0,
        percentage:
          total > 0 ? Math.round(((deviceStats.Mobile || 0) / total) * 100) : 0,
        color: "#5E5CF8",
        icon: <FaMobile />,
      },
      {
        name: "Tablet",
        value: deviceStats.Tablet || deviceStats.Tablets || 0,
        percentage:
          total > 0
            ? Math.round(
                ((deviceStats.Tablet || deviceStats.Tablets || 0) / total) * 100
              )
            : 0,
        color: "#FF8F40",
        icon: <FaTablet />,
      },
    ];
  };

  const data = calculateDeviceData();
  const totalVisitors = data.reduce((sum, item) => sum + item.value, 0);
  const onMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="admin-dashboard-visitors-chart-container">
      <div className="admin-dashboard-chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={90}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={
                    activeIndex === null || activeIndex === index ? 1 : 0.6
                  }
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="chart-center">
          <div className="visitors-count">{totalVisitors}</div>
          <div className="visitors-label">Total visitors</div>
        </div>
      </div>

      <div className="chart-legend">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="legend-item">
            <div className="legend-color" style={{ color: entry.color }}>
              {entry.icon}
            </div>
            <div className="legend-name">{entry.name}</div>
            <div className="legend-value">
              {entry.value}{" "}
              <span className="percentage">{entry.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
