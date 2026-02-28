import { FaPlus, FaMinus } from "react-icons/fa";
import { useState } from "react";
import MapComponent from "../../../components/adminDashboard/map";
import { hasFlag } from "country-flag-icons";
import * as CountryFlags from "country-flag-icons/react/3x2";
import VisitorMonitoringOnly from "./VisitorMonitoringOnly";

interface VisitorTrackingChartProps {
  trackingStatus: {
    totalVisitors: number;
    visitsByDate: Record<string, number>;
    countryPercentage: Record<string, string>;
  };
  trackingData: Array<{
    _id: string;
    city: string;
    country: string;
    countryCode: string;
    language: string;
    currentUrl: string;
    createdAt: string;
  }>;
  searchKeyWord: string;
}

const VisitorTrackingChart: React.FC<VisitorTrackingChartProps> = ({
  trackingStatus,
  trackingData,
  searchKeyWord,
}) => {
  const [countryTimeFilter, setCountryTimeFilter] = useState("All");

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
    if (countryTimeFilter === "All") {
      return trackingData;
    }
    return trackingData.filter((item) =>
      isDateInPeriod(item.createdAt, countryTimeFilter)
    );
  };

  const getCountryCodeFromData = (countryName: string): string => {
    const filteredData = getFilteredTrackingData();
    const countryData = filteredData.find(
      (data) => data.country === countryName
    );
    return countryData?.countryCode || "un";
  };

  const renderFlagIcon = (countryCode: string) => {
    const code = countryCode.toUpperCase();

    if (hasFlag(code)) {
      const FlagComponent = CountryFlags[code as keyof typeof CountryFlags];
      if (FlagComponent) {
        return (
          <FlagComponent
            style={{
              width: "24px",
              height: "18px",
              borderRadius: "2px",
              objectFit: "cover",
            }}
          />
        );
      }
    }

    return (
      <span
        className={`fi fi-${countryCode.toLowerCase()}`}
        style={{ fontSize: "1.5rem" }}
      ></span>
    );
  };

  const getCountryStatistics = () => {
    const filteredData = getFilteredTrackingData();

    const countryCount: Record<string, number> = {};
    filteredData.forEach((item) => {
      countryCount[item.country] = (countryCount[item.country] || 0) + 1;
    });

    const totalFilteredVisitors = filteredData.length;

    const countryPercentage: Record<string, string> = {};
    Object.entries(countryCount).forEach(([country, count]) => {
      const percentage =
        totalFilteredVisitors > 0 ? (count / totalFilteredVisitors) * 100 : 0;
      countryPercentage[country] = percentage.toFixed(2);
    });

    return {
      countryPercentage,
      totalFilteredVisitors,
      countryCount,
    };
  };

  // Filter countries based on search and time filter - FIXED VERSION
  const getFilteredCountries = () => {
    const { countryPercentage, countryCount } = getCountryStatistics();

    const allCountries = Object.entries(countryPercentage).map(
      ([country, percent]) => ({
        name: country,
        percentage: parseFloat(percent),
        countryCode: getCountryCodeFromData(country),
        users: `${Intl.NumberFormat().format(
          countryCount[country] || 0
        )} Users`,
        color: "#3182ce",
      })
    );

    if (!searchKeyWord.trim()) {
      return allCountries;
    }

    return allCountries.filter((country) =>
      country.name.toLowerCase().includes(searchKeyWord.toLowerCase())
    );
  };

  const countryList = getFilteredCountries();

  return (
    <div className="row">
      <div className="sm-12 col-md-12 col-lg-12 col-xl-6 col-xxl-6">
        <div className="dashboard-country-section">
          <div className="section-header">
            <div className="section-title">Top Countries Visitor</div>
            <select
              className="dropdown-select"
              value={countryTimeFilter}
              onChange={(e) => setCountryTimeFilter(e.target.value)}
            >
              <option value="All">All Time</option>
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
                  <div className="map-plugin-analyzing-chart-controls">
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
                {countryList.map((country, index) => (
                  <div className="country-item" key={index}>
                    <div className="country-flag">
                      {renderFlagIcon(country.countryCode)}
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Monitoring Section */}
      <div className="sm-12 col-md-12 col-lg-12 col-xl-6 col-xxl-6">
        <VisitorMonitoringOnly trackingStatus={trackingStatus} />
      </div>
    </div>
  );
};

export default VisitorTrackingChart;
