import { useId, useMemo } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="market-chart-tooltip">
      <span>{formatTime(label)}</span>
      <strong>{money(payload[0].value)} coins</strong>
    </div>
  );
}

export default function MarketChart({
  data = [],
  height = 225,
}) {
  const gradientId = useId().replace(/:/g, "");

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => {
        const rawValue =
          item.price ??
          item.value ??
          item.current_price;

        const rawTime =
          item.created_at ??
          item.timestamp ??
          item.time ??
          item.date;

        const value = Number(rawValue);

        if (
          !Number.isFinite(value) ||
          !rawTime
        ) {
          return null;
        }

        return {
          time: rawTime,
          value,
          sortTime: new Date(rawTime).getTime(),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.sortTime - b.sortTime);
  }, [data]);

  if (!chartData.length) {
    return (
      <div className="chart-empty">
        <span>📊</span>
        <p>No price history recorded yet.</p>
      </div>
    );
  }

  const values = chartData.map((item) => item.value);

  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  const padding = Math.max(
    (maximum - minimum) * 0.15,
    maximum * 0.005,
    1
  );

  return (
    <div
      className="chart-wrap market-chart-modern"
      style={{ height }}
      role="img"
      aria-label="Asset price history chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 12,
            right: 10,
            left: 4,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient
              id={`market-gradient-${gradientId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#a78bfa"
                stopOpacity={0.35}
              />

              <stop
                offset="95%"
                stopColor="#a78bfa"
                stopOpacity={0.015}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#ffffff12"
            vertical={false}
            strokeDasharray="4 5"
          />

          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            axisLine={false}
            tickLine={false}
            minTickGap={35}
            tick={{
              fill: "#85879d",
              fontSize: 10,
            }}
          />

          <YAxis
            domain={[
              Math.max(0, minimum - padding),
              maximum + padding,
            ]}
            axisLine={false}
            tickLine={false}
            width={58}
            tick={{
              fill: "#85879d",
              fontSize: 10,
            }}
            tickFormatter={(value) =>
              Number(value).toLocaleString("en-IN", {
                notation: "compact",
                maximumFractionDigits: 1,
              })
            }
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: "#a78bfa",
              strokeDasharray: "4 4",
            }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke="#a78bfa"
            strokeWidth={2.5}
            fill={`url(#market-gradient-${gradientId})`}
            activeDot={{
              r: 5,
              fill: "#c4b5fd",
              stroke: "#171324",
              strokeWidth: 2,
            }}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
