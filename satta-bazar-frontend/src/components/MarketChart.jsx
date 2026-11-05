
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const formatPrice = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="market-chart-tooltip">
      <span>{label}</span>
      <strong>
        {formatPrice(payload[0].value)} coins
      </strong>
    </div>
  );
}

export default function MarketChart({ data = [] }) {
  const chartData = Array.isArray(data)
    ? data
        .filter(
          (item) =>
            item &&
            Number.isFinite(Number(item.value))
        )
        .map((item) => ({
          time: String(item.time ?? ""),
          value: Number(item.value),
        }))
    : [];

  if (chartData.length === 0) {
    return (
      <div className="chart-empty">
        <span>📊</span>
        <p>Market history is not available yet.</p>
      </div>
    );
  }

  const values = chartData.map((item) => item.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const padding = Math.max((maximum - minimum) * 0.15, 1);

  return (
    <div
      className="chart-wrap market-chart-modern"
      role="img"
      aria-label="Virtual market price history chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 12,
            right: 8,
            left: 4,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient
              id="marketChartGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#a78bfa"
                stopOpacity={0.32}
              />

              <stop
                offset="95%"
                stopColor="#a78bfa"
                stopOpacity={0.015}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#ffffff0b"
            vertical={false}
            strokeDasharray="4 5"
          />

          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#85879d",
              fontSize: 10,
            }}
            minTickGap={25}
          />

          <YAxis
            domain={[
              Math.max(0, minimum - padding),
              maximum + padding,
            ]}
            axisLine={false}
            tickLine={false}
            width={55}
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
            fill="url(#marketChartGradient)"
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
