import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

function PriceTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const asset = payload[0].payload;

  return (
    <div className="market-chart-tooltip">
      <span>{asset.name} ({asset.symbol})</span>
      <strong>{money(asset.price)} coins</strong>
      <span>
        {Number(asset.change || 0) >= 0 ? "+" : ""}
        {Number(asset.change || 0).toFixed(2)}%
      </span>
    </div>
  );
}

export default function MarketComparisonChart({
  assets = [],
}) {
  const chartData = [...assets]
    .filter((asset) =>
      Number.isFinite(Number(asset.price))
    )
    .sort(
      (a, b) => Number(b.price) - Number(a.price)
    )
    .slice(0, 12)
    .map((asset) => ({
      name: asset.name,
      symbol: asset.symbol,
      price: Number(asset.price),
      change: Number(asset.change || 0),
    }));

  if (!chartData.length) {
    return (
      <div className="chart-empty">
        <span>📊</span>
        <p>No market prices available.</p>
      </div>
    );
  }

  return (
    <div className="chart-wrap market-chart-modern">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 4,
            bottom: 35,
          }}
        >
          <CartesianGrid
            stroke="#ffffff12"
            vertical={false}
            strokeDasharray="4 5"
          />

          <XAxis
            dataKey="symbol"
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={55}
            tick={{
              fill: "#a1a1aa",
              fontSize: 10,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#85879d",
              fontSize: 10,
            }}
            tickFormatter={(value) =>
              Number(value).toLocaleString("en-IN", {
                notation: "compact",
              })
            }
          />

          <Tooltip content={<PriceTooltip />} />

          <Bar
            dataKey="price"
            fill="#a78bfa"
            radius={[5, 5, 0, 0]}
            maxBarSize={42}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
