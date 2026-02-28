import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import adminImage from "../../../assets/image/admin/allImage";

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const data: DeviceData[] = [
    {
      name: "Text Generate",
      value: 9483,
      percentage: 45,
      color: "#3CD4A0",
      icon: (
        <img src={adminImage.imageIcon} alt="image" width={34} height={34} />
      ),
    },
    {
      name: "Audio generate",
      value: 13870,
      percentage: 30,
      color: "#5E5CF8",
      icon: (
        <img src={adminImage.audioIcon} alt="image" width={34} height={34} />
      ),
    },
    {
      name: "Image Generate",
      value: 15420,
      percentage: 25,
      color: "#FF8F40",
      icon: (
        <img
          src={adminImage.AiAssistantImage}
          alt="image"
          width={34}
          height={34}
        />
      ),
    },
  ];
  const totalVisitors = data.reduce((sum, item) => sum + item.value, 0);
  const onMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="user-visitors-chart-container">
      <div className="user-visitors-chart-wrapper">
        <h6>Limit Uses</h6>
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
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
          <div className="visitors-label">Total Limit</div>
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
