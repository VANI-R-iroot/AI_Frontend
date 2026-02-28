import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaCaretDown } from "react-icons/fa";

interface ChartData {
  name: string;
  value: number;
}

const data: ChartData[] = [
  { name: "Jan", value: 5000 },
  { name: "Feb", value: 10000 },
  { name: "Mar", value: 8000 },
  { name: "Apr", value: 22000 },
  { name: "May", value: 12000 },
  { name: "Jun", value: 18000 },
  { name: "Jul", value: 25000 },
  { name: "Aug", value: 20000 },
  { name: "Sep", value: 15000 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">
          <span className="tooltip-dot">●</span>
          This Day: {(payload[0].value / 600).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

interface CustomizedDotProps {
  cx?: number;
  cy?: number;
  index?: number;
}

const CustomizedDot: React.FC<CustomizedDotProps> = ({ cx, cy, index }) => {
  if (index === undefined || cx === undefined || cy === undefined) return null;
  if (index === 5) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={8}
        stroke="#3b82f6"
        strokeWidth={2}
        fill="white"
      />
    );
  }
  return null;
};

export default function OrdersChart() {
  const [activeIndex] = useState<number>(5);

  return (
    <div className="orders-chart-container">
      <div className="orders-title">Recent Orders</div>
      <div className="orders-value">$27,200</div>
      <div className="orders-status">
        <span className="admin-dashboard-order-chart-status-badge">
          10% <FaCaretDown size={12} />
        </span>
        <span className="status-text">Increases</span>
      </div>
      <div className="order-page-divider"></div>

      <div className="admin-order-chart-container" style={{ height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid
              horizontal
              vertical={false}
              stroke="rgba(255, 255, 255, 0.1)"
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a0aec0", fontSize: 12 }}
              dy={10}
            />

            <YAxis hide />

            <Tooltip content={<CustomTooltip />} cursor={false} />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              activeDot={<CustomizedDot index={activeIndex} />}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
