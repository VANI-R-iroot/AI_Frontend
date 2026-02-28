import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { FaPlus, FaMinus } from "react-icons/fa";
import MapComponent from "../../components/adminDashboard/map";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import useTrackingStore from "../../zustand/useTrackingStore";
import { useState } from "react";

const contentData = [
  { month: "Jan", word: 20000, image: 15000 },
  { month: "Feb", word: 15000, image: 18000 },
  { month: "Mar", word: 18000, image: 19000 },
  { month: "Apr", word: 22000, image: 20000 },
  { month: "May", word: 43000, image: 30000 },
  { month: "Jun", word: 17000, image: 19000 },
  { month: "Jul", word: 20000, image: 18000 },
  { month: "Aug", word: 12000, image: 10000 },
  { month: "Sep", word: 22000, image: 15000 },
  { month: "Oct", word: 26000, image: 17000 },
  { month: "Nov", word: 15000, image: 13000 },
  { month: "Dec", word: 22000, image: 16000 },
];

const CustomContentTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType> & {
  payload?: Array<{ name?: string; value?: number }>;
  label?: string | number;
  active?: boolean;
}) => {
  if (active && payload && payload.length) {
    const entries = payload as Array<{ name?: string; value?: number }>;
    const word = entries.find((p) => p.name === "word")?.value ?? 0;
    const image = entries.find((p) => p.name === "image")?.value ?? 0;
    const total = Number(word) + Number(image);

    return (
      <div className="content-tooltip">
        <p className="month-label">{label}</p>
        <div className="tooltip-revenue">
          <span className="tooltip-dot">●</span>
          Total: {total.toLocaleString()}
        </div>
      </div>
    );
  }
  return null;
};

export default function CountryContentDashboard() {
  const trackingData = useTrackingStore((state) => state.trackingData);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("all time");
  const isDateInPeriod = (dateStr: string, period: string): boolean => {
    if (period === "all time") return true;

    const date = new Date(dateStr);
    const now = new Date();

    switch (period) {
      case "Today":
        return date.toDateString() === now.toDateString();

      case "This Week":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
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

  const getFilteredTrackingData = () => {
    if (selectedTimeFilter === "all time") {
      return trackingData;
    }
    return trackingData.filter((item) =>
      isDateInPeriod(item.timestamp || item.createdAt, selectedTimeFilter)
    );
  };

  const getCountriesData = () => {
    if (!trackingData || !Array.isArray(trackingData)) return [];

    const filteredData = getFilteredTrackingData();

    const countryCount: Record<string, number> = {};
    filteredData.forEach((item) => {
      const country = item.country || "Unknown";
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    const totalFilteredVisitors = filteredData.length;

    const countryPercentage: Record<string, string> = {};
    Object.entries(countryCount).forEach(([country, count]) => {
      const percentage =
        totalFilteredVisitors > 0 ? (count / totalFilteredVisitors) * 100 : 0;
      countryPercentage[country] = percentage.toFixed(2);
    });

    const countriesArray = Object.entries(countryPercentage).map(
      ([country, percent]) => {
        const item = filteredData.find((data) => data.country === country);
        return {
          name: country,
          countryCode: item?.countryCode || "XX",
          users: countryCount[country] || 0,
          percentage: parseFloat(percent),
          color: "#3182ce",
        };
      }
    );

    const colors = [
      "#ff6347",
      "#ffa500",
      "#4CAF50",
      "#2196F3",
      "#3f51b5",
      "#9c27b0",
      "#e91e63",
      "#ff5722",
    ];

    return countriesArray
      .sort((a, b) => b.users - a.users)
      .slice(0, 8)
      .map((country, index) => ({
        ...country,
        users: `${country.users.toLocaleString()} Users`,
        color: colors[index % colors.length],
      }));
  };

  const countriesData = getCountriesData();

  const handleTimeFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedTimeFilter(event.target.value);
  };

  return (
    <div className="row">
      <div className="sm-12 col-md-12 col-lg-12 col-xl-6 col-xxl-6">
        <div className="dashboard-country-section">
          <div className="visitor-section-header ">
            <div className="section-title">Top Countries</div>
            <select
              className="dropdown-select"
              value={selectedTimeFilter}
              onChange={handleTimeFilterChange}
            >
              <option value="all time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          <div className="row">
            <div className="col-md-12 col-lg-6">
              <div className="map-section">
                <div className="map-container">
                  <div className="map-controls">
                    <button className="map-control-btn">
                      <FaPlus size={12} />
                    </button>
                    <button className="map-control-btn">
                      <FaMinus size={12} />
                    </button>
                  </div>
                  <MapComponent />
                </div>
              </div>
            </div>

            <div className="col-md-12 col-lg-6">
              <div
                className="country-list"
                style={{
                  maxHeight: "340px",
                  overflowY: "auto",
                  paddingRight: "15px",
                  cursor: "pointer",
                }}
              >
                {countriesData.length > 0 ? (
                  countriesData.map((country, index) => (
                    <div className="country-item" key={index}>
                      <div className="country-flag">
                        <img
                          src={`https://flagcdn.com/w20/${country.countryCode.toLowerCase()}.png`}
                          alt={`${country.name} flag`}
                          style={{ width: "20px", height: "15px" }}
                        />
                      </div>
                      <div className="country-info">
                        <div className="country-name">{country.name}</div>
                        <div className="country-users">{country.users}</div>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${country.percentage}%`,
                            backgroundColor: country.color,
                          }}
                        ></div>
                      </div>
                      <div className="country-percentage">
                        {country.percentage}%
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-data-message">
                    No data available for {selectedTimeFilter}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="sm-12 col-md-12 col-lg-12 col-xl-6 col-xxl-6">
        <div className="content-section">
          <div className="visitor-section-header ">
            <div className="section-title">Generated Content</div>
            <select className="dropdown-select">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="content-legend">
            <div className="admin-legend-item">
              <h6>Word: 500</h6>
              <div
                className="legend-dot"
                style={{ backgroundColor: "#3182ce" }}
              ></div>
            </div>
            <div className="admin-legend-item">
              <h6>Image: 500</h6>
              <div
                className="legend-dot"
                style={{ backgroundColor: "#ed8936" }}
              ></div>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={308}>
              <BarChart
                data={contentData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  horizontal
                  vertical={false}
                  stroke="rgba(255,255,255,0.1)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#a0aec0", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "#a0aec0", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  content={<CustomContentTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar
                  dataKey="word"
                  fill="#3182ce"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                  name="word"
                />
                <Bar
                  dataKey="image"
                  fill="#ed8936"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                  name="image"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
