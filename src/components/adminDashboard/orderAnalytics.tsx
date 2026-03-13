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

type OrderTrendData = {
  totalRevenue?: number;
  changePercent?: number;
  series?: ChartData[];
};

type OrdersChartProps = {
  orderTrend?: OrderTrendData;
};

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
          <span className="tooltip-dot">•</span>
          Revenue: ${Number(payload[0].value || 0).toLocaleString("en-US")}
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
};

export default function OrdersChart({ orderTrend }: OrdersChartProps) {
  const data = orderTrend?.series || [];
  const totalRevenue = Number(orderTrend?.totalRevenue || 0);
  const changePercent = Number(orderTrend?.changePercent || 0);
  const activeIndex = data.length > 0 ? data.length - 1 : 0;
  const isPositive = changePercent >= 0;

  return (
    <div className="orders-chart-container">
      <div className="orders-title">Recent Orders</div>
      <div className="orders-value">${totalRevenue.toLocaleString("en-US")}</div>
      <div className="orders-status">
        <span className="admin-dashboard-order-chart-status-badge">
          {Math.abs(changePercent).toFixed(1)}%
          <FaCaretDown
            size={12}
            style={{
              marginLeft: "4px",
              transform: isPositive ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </span>
        <span className="status-text">{isPositive ? "Increase" : "Decrease"}</span>
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
