import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useState } from "react";

interface VisitorMonitoringOnlyProps {
  trackingStatus: {
    visitsByDate: Record<string, number>;
  };
}

// ✅ Custom Tooltip Props interface
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    dataKey?: string;
    color?: string;
  }>;
  label?: string;
}

// ✅ Custom Tooltip with proper typing
const CustomContentTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const wordValue = payload.find((p) => p.name === "word")?.value ?? 0;

    return (
      <div className="content-tooltip">
        <p className="month-label">{label}</p>
        <div className="tooltip-revenue">
          <span className="tooltip-dot">●</span>
          Visitor: {Number(wordValue).toLocaleString()}
        </div>
      </div>
    );
  }
  return null;
};

const VisitorMonitoringOnly: React.FC<VisitorMonitoringOnlyProps> = ({
  trackingStatus,
}) => {
  const [visitorTimeFilter, setVisitorTimeFilter] = useState("All");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isDateInPeriod = (dateStr: string, period: string): boolean => {
    if (period === "All") return true;
    const date = new Date(dateStr);
    const now = new Date();
    switch (period) {
      case "Today":
        return date.toDateString() === now.toDateString();
      case "This Week":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return date >= startOfWeek && date <= now;
      case "This Month":
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      case "This Year":
        return date.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  const getMonthlyData = () => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyVisitors: Record<string, number> = {};
    monthNames.forEach((month) => {
      monthlyVisitors[month] = 0;
    });

    Object.entries(trackingStatus.visitsByDate).forEach(
      ([dateStr, visitors]) => {
        if (
          visitorTimeFilter === "All" ||
          isDateInPeriod(dateStr, visitorTimeFilter)
        ) {
          const date = new Date(dateStr);
          const month = monthNames[date.getMonth()];
          monthlyVisitors[month] += visitors;
        }
      }
    );

    return monthNames.map((month) => ({
      month,
      word: monthlyVisitors[month],
    }));
  };

  const contentData = getMonthlyData();

  return (
    <div className="content-section">
      <div className="visitor-section-header">
        <div className="section-title">Real Time widget Monitoring</div>
        <select
          className="dropdown-select"
          value={visitorTimeFilter}
          onChange={(e) => setVisitorTimeFilter(e.target.value)}
        >
          <option value="All">All Time</option>
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
          <option value="This Year">This Year</option>
        </select>
      </div>

      <div className="content-legend">
        <div className="admin-legend-item">
          <h6>
            Total Visitors: {contentData.reduce((sum, d) => sum + d.word, 0)}
          </h6>
          <div
            className="legend-dot"
            style={{ backgroundColor: "#3182ceff" }}
          ></div>
        </div>
      </div>

      <div className="plguin-analyzing-chart-container">
        <ResponsiveContainer width="100%" height={308}>
          <BarChart
            data={contentData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            onMouseMove={(state) => {
              // ✅ Type-safe activeTooltipIndex handling
              if (state && state.activeTooltipIndex !== undefined) {
                const index = state.activeTooltipIndex;
                // Only set if it's a number
                if (typeof index === 'number') {
                  setHoveredIndex(index);
                }
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CartesianGrid
              horizontal
              vertical={false}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "#cbced4ff", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fill: "#a0aec0", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomContentTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar dataKey="word" radius={[4, 4, 0, 0]} barSize={14} name="word">
              {contentData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    hoveredIndex === index
                      ? "rgba(8, 135, 255, 1)"
                      : "#3182ceff"
                  }
                  stroke={hoveredIndex === index ? "#3182ceff" : "transparent"}
                  strokeWidth={hoveredIndex === index ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VisitorMonitoringOnly;