import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  name: string;
  Users: number;
  Sessions: number;
};

type YearlyUsageChartProps = {
  series?: ChartData[];
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="plugin-tooltip-container">
        <div className="plugin-tooltip-label">{label}</div>
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="plugin-tooltip-data">
            <div
              className="plugin-tooltip-color"
              style={{ backgroundColor: entry.color || "#fff" }}
            />
            <span className="plugin-tooltip-text">
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const GlobeIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="white"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5S4.41 1.5 8 1.5s6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5z"
      fill="currentColor"
    />
    <path
      d="M8 2c-1.21 0-2.34.36-3.29.98.34.45.71.87 1.1 1.25C6.47 3.78 7.22 3.5 8 3.5c.78 0 1.53.28 2.19.73.39-.38.76-.8 1.1-1.25C10.34 2.36 9.21 2 8 2zm0 12c1.21 0 2.34-.36 3.29-.98-.34-.45-.71-.87-1.1-1.25-.66.45-1.41.73-2.19.73-.78 0-1.53-.28-2.19-.73-.39.38-.76.8-1.1 1.25C5.66 13.64 6.79 14 8 14z"
      fill="currentColor"
    />
  </svg>
);

const UsersAndSessionsChart: React.FC<YearlyUsageChartProps> = ({ series = [] }) => {
  return (
    <div className="plugin-download-chart-container">
      <div className="plugin-download-chart-title">
        <span className="plugin-download-chart-globe">
          <GlobeIcon />
        </span>
        Plugins download
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={series}
          margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4af37" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2a9df4" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#2a9df4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a0aec0", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a0aec0", fontSize: 12 }}
          />
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Users"
            stroke="#d4af37"
            fillOpacity={1}
            fill="url(#colorUsers)"
          />
          <Area
            type="monotone"
            dataKey="Sessions"
            stroke="#2a9df4"
            fillOpacity={1}
            fill="url(#colorSessions)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsersAndSessionsChart;
