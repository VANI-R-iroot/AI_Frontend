import React, { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import adminImage from "../../../assets/image/admin/allImage";
import axiosInstance from "../../../utils/baseUrl";

type CategoryData = {
  name: string;
  value: number;
  percentage: number;
  color: string;
  limit: number | null;
  icon: React.ReactNode;
};

const toNumber = (value: any) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sumLimits = (limits: any[]): number | null => {
  if (limits.some((limit) => Number(limit) === -1)) {
    return null;
  }
  return limits.reduce((sum, limit) => sum + Math.max(0, toNumber(limit)), 0);
};

const formatCount = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
};

const formatLimit = (value: number | null) =>
  value === null ? "Unlimited" : formatCount(value);

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload as CategoryData;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">
        <div className="device-icon">{data.icon}</div>
        <span>
          {data.name}: {formatCount(data.value)} / {formatLimit(data.limit)}
        </span>
      </div>
    </div>
  );
};

export default function VisitorsDonutChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [usageData, setUsageData] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardUsage = async () => {
      try {
        const [usageRes, subscriptionRes] = await Promise.all([
          axiosInstance.get("/api-access/usage"),
          axiosInstance.get("/subscription/current"),
        ]);
        setUsageData(usageRes?.data?.data || null);
        setSubscriptionData(subscriptionRes?.data?.data || null);
      } catch (error) {
        console.error("Failed to load usage chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardUsage();
  }, []);

  const data = useMemo(() => {
    const features = usageData?.apiFeatureUsage || {};

    const textUsed =
      toNumber(features.aiChatAssistant) +
      toNumber(features.aiRewriter) +
      toNumber(features.webScripting) +
      toNumber(features.aiCodeGenerate);

    const audioUsed =
      toNumber(features.speechToText) +
      toNumber(features.aiVoiceover) +
      toNumber(features.editAudio) +
      toNumber(features.videoToText);

    const imageUsed =
      toNumber(features.textToImage) +
      toNumber(features.imageCaption) +
      toNumber(features.aiVision);

    const textLimit = sumLimits([
      subscriptionData?.ai_chat_limit,
      subscriptionData?.grammar_checking_limit,
      subscriptionData?.text_to_paraphraser_limit,
      subscriptionData?.ai_template_limit,
      subscriptionData?.ai_chat_assistant_limit,
      subscriptionData?.ai_rewriter_limit,
      subscriptionData?.web_scripting_limit,
      subscriptionData?.ai_code_generate_limit,
    ]);

    const audioLimit = sumLimits([
      subscriptionData?.speech_to_text_limit,
      subscriptionData?.ai_voiceover_limit,
      subscriptionData?.edit_audio_limit,
      subscriptionData?.tts_audio_limit,
      subscriptionData?.video_to_text_limit,
      subscriptionData?.image_to_audio_limit,
    ]);

    const imageLimit = sumLimits([
      subscriptionData?.text_to_image_limit,
      subscriptionData?.image_caption_limit,
      subscriptionData?.ai_vision_limit,
      subscriptionData?.image_limit,
      subscriptionData?.chat_image_limit,
    ]);

    const totalUsed = textUsed + audioUsed + imageUsed;

    const categories: CategoryData[] = [
      {
        name: "Text Workflows",
        value: textUsed,
        percentage: totalUsed > 0 ? Math.round((textUsed / totalUsed) * 100) : 0,
        color: "#3CD4A0",
        limit: textLimit,
        icon: <img src={adminImage.textPre} alt="text" width={28} height={28} />,
      },
      {
        name: "Audio Workflows",
        value: audioUsed,
        percentage: totalUsed > 0 ? Math.round((audioUsed / totalUsed) * 100) : 0,
        color: "#5E5CF8",
        limit: audioLimit,
        icon: <img src={adminImage.audioIcon} alt="audio" width={28} height={28} />,
      },
      {
        name: "Image Workflows",
        value: imageUsed,
        percentage: totalUsed > 0 ? Math.round((imageUsed / totalUsed) * 100) : 0,
        color: "#FF8F40",
        limit: imageLimit,
        icon: <img src={adminImage.imageIcon} alt="image" width={28} height={28} />,
      },
    ];

    return categories;
  }, [usageData, subscriptionData]);

  const totalUsed = data.reduce((sum, item) => sum + item.value, 0);
  const totalLimit = sumLimits(data.map((item) => item.limit));

  return (
    <div className="user-visitors-chart-container">
      <div className="user-visitors-chart-wrapper">
        <h6>Usage Snapshot</h6>
        {loading ? (
          <div className="dashboard-loading-inline">Loading usage...</div>
        ) : (
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
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="chart-center">
          <div className="visitors-count">{formatCount(totalUsed)}</div>
          <div className="visitors-label">
            {totalLimit === null
              ? "Used / Unlimited Plan"
              : `Used of ${formatCount(totalLimit)}`}
          </div>
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
              {formatCount(entry.value)} <span className="percentage">{entry.percentage}%</span>
            </div>
            <div className="legend-subvalue">Limit: {formatLimit(entry.limit)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
