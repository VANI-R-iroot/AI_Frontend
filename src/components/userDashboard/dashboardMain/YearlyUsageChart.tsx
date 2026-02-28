import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const generateData = () => {
  const dates = [
    "Mar 30",
    "Mar 31",
    "Apr 01",
    "Apr 02",
    "Apr 03",
    "Apr 04",
    "Apr 05",
    "Apr 06",
    "Apr 07",
    "Apr 08",
    "Apr 09",
    "Apr 10",
    "Apr 11",
    "Apr 12",
    "Apr 13",
    "Apr 14",
    "Apr 15",
    "Apr 16",
    "Apr 17",
    "Apr 18",
    "Apr 19",
    "Apr 20",
    "Apr 21",
    "Apr 22",
    "Apr 23",
    "Apr 24",
    "Apr 25",
    "Apr 26",
    "Apr 27",
    "Apr 28",
    "Apr 29",
  ];

  const usersData = [
    130, 165, 170, 205, 200, 170, 160, 150, 170, 270, 180, 170, 180, 165, 135,
    170, 150, 140, 130, 105, 130, 135, 140, 130, 165, 140, 105, 160, 170, 25,
  ];

  const sessionsData = [
    95, 110, 115, 110, 135, 120, 115, 105, 170, 125, 125, 115, 100, 85, 100,
    110, 100, 95, 75, 75, 85, 95, 100, 100, 75, 75, 110, 75, 100, 150,
  ];

  const audioData = [
    130, 165, 140, 205, 200, 190, 160, 150, 170, 200, 180, 170, 300, 165, 135,
    190, 200, 140, 130, 105, 130, 135, 190, 130, 165, 140, 105, 150, 190, 205,
  ];

  return dates.map((date, index) => ({
    name: date,
    Users: usersData[index],
    Sessions: sessionsData[index],
    audioData: audioData[index],
  }));
};

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="user-dashboard-line-chart-tooltip-container">
        <div className="user-dashboard-line-chart-tooltip-label">{label}</div>
        {payload.map((entry, index) => (
          <div
            key={`tooltip-${index}`}
            className="user-dashboard-line-chart-tooltip-data"
          >
            <div
              className="user-dashboard-line-chart-tooltip-color"
              style={{ backgroundColor: entry.color }}
            />
            <span className="user-dashboard-line-chart-tooltip-text">
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Globe icon component
const GlobeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM14 8C14 8.67 13.9 9.31 13.72 9.92C13.59 9.7 13.44 9.39 13.34 9.13C13.21 8.79 13.24 8.45 13.24 8.12C13.24 7.77 13.35 7.44 13.37 7.09C13.39 6.74 13.2 6.42 13.19 6.07C13.17 5.67 13.13 5.23 12.91 4.89C12.67 4.53 12.22 4.41 11.81 4.31C11.37 4.2 10.86 4.25 10.44 4.11C10.04 3.97 9.67 3.7 9.22 3.75C8.89 3.78 8.59 3.97 8.26 4.03C7.93 4.09 7.57 4.01 7.27 4.15C6.97 4.28 6.81 4.59 6.77 4.91C6.74 5.23 6.76 5.56 6.63 5.86C6.46 6.23 6.04 6.39 5.69 6.59C5.31 6.81 5.06 7.15 4.81 7.5C4.6 7.79 4.38 8.09 4.33 8.45C4.27 8.87 4.44 9.29 4.5 9.71C4.57 10.16 4.43 10.62 4.44 11.08C4.44 11.31 4.5 11.55 4.66 11.72C4.97 12.05 5.55 12.06 5.89 12.36C6.25 12.67 6.29 13.22 6.66 13.5C7.01 13.77 7.55 13.64 7.95 13.83C8.26 13.97 8.49 14.27 8.82 14.38C9.18 14.5 9.56 14.38 9.92 14.26C10.31 14.13 10.72 14.01 11.13 13.94C11.5 13.87 11.87 13.86 12.23 13.75C12.56 13.65 12.86 13.47 13.19 13.31C12.26 14.96 10.28 16 8 16C4.69 16 2 13.31 2 10C2 6.78 4.51 4.14 7.67 4.01C7.5 4.36 7.5 4.77 7.6 5.14C7.73 5.63 8.06 6.07 8.5 6.29C8.82 6.45 9.21 6.51 9.54 6.36C9.86 6.22 10.07 5.9 10.39 5.74C10.71 5.58 11.14 5.65 11.36 5.94C11.59 6.24 11.56 6.65 11.7 7C11.85 7.35 12.19 7.64 12.56 7.59C12.74 7.57 12.91 7.47 13.05 7.36C13.26 7.19 13.44 6.97 13.68 6.87C13.86 8.18 13.71 9.09 14 8C14 8 14 8 14 8Z"
      fill="white"
    />
  </svg>
);

export default function UsersAndSessionsChart() {
  const data = generateData();

  return (
    <div className="user-dashboard-line-chart-container ">
      <div className="user-dashboard-line-chart-title">
        <span className="user-dashboard-line-chart-globe">
          <GlobeIcon />
        </span>
        Generate a month
      </div>
      <div className="user-dashboard-line-chart-content-legend">
        <div className="user-dashboard-line-chart-legend-item">
          <h6>Word: 500</h6>
          <div
            className="user-dashboard-line-chart-legend-dot"
            style={{ backgroundColor: "#3182ce" }}
          ></div>
        </div>
        <div className="user-dashboard-line-chart-legend-item">
          <h6>Image: 500</h6>
          <div
            className="user-dashboard-line-chart-legend-dot"
            style={{ backgroundColor: "#ed8936" }}
          ></div>
        </div>
        <div className="user-dashboard-line-chart-legend-item">
          <h6>Audio: 500</h6>
          <div
            className="user-dashboard-line-chart-legend-dot"
            style={{ backgroundColor: "#8252e9" }}
          ></div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 20, left: -30, bottom: 30 }}
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
            <linearGradient id="audioSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8252e9" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#8252e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "white", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "white", fontSize: 12 }}
            domain={[0, 300]}
            ticks={[0, 50, 100, 150, 200, 250, 300]}
          />
          <CartesianGrid
            vertical={false}
            horizontal={true}
            stroke="#444"
            strokeDasharray="3 3"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Users"
            stroke="#d4af37"
            strokeWidth={2}
            fill="url(#colorUsers)"
            activeDot={{ r: 6, fill: "#d4af37", stroke: "#d4af37" }}
            dot={{ r: 3, fill: "#d4af37", stroke: "#d4af37" }}
          />
          <Area
            type="monotone"
            dataKey="audioData"
            stroke="#8252e9"
            strokeWidth={2}
            fill="url(#audioSessions)"
            activeDot={{ r: 6, fill: "#8252e9", stroke: "#8252e9" }}
            dot={{ r: 3, fill: "#8252e9", stroke: "#8252e9" }}
          />
          <Area
            type="monotone"
            dataKey="Sessions"
            stroke="#2a9df4"
            strokeWidth={2}
            fill="url(#colorSessions)"
            activeDot={{ r: 6, fill: "#2a9df4", stroke: "#2a9df4" }}
            dot={{ r: 3, fill: "#2a9df4", stroke: "#2a9df4" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
