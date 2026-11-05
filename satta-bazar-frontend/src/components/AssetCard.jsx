import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

export default function AssetCard({ asset, onTrade }) {
  const isUp = Number(asset.change) >= 0;

  return (
    <article
      className={`asset-card chaos-asset ${
        isUp ? "asset-up" : "asset-down"
      }`}
    >
      <div className="asset-top">
        <div className="asset-identity">
          <div
            className="asset-emoji"
            style={{
              "--asset-color": asset.color || "#a78bfa",
            }}
          >
            {asset.emoji || "🪙"}
          </div>

          <div>
            <h3>{asset.name}</h3>
            <span>{asset.symbol}</span>
          </div>
        </div>

        <span className={`asset-change ${isUp ? "up" : "down"}`}>
          {isUp ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {Math.abs(Number(asset.change || 0)).toFixed(2)}%
        </span>
      </div>

      <div className="asset-price">
        {money(asset.price)}
        <small> BB</small>
      </div>

      <div className="asset-mini-chart">
        <TrendingUp size={15} />
        <span>
          {isUp ? "BULLISH MOMENTUM" : "BEARISH MOMENTUM"}
        </span>
        <span className="asset-live-dot" />
      </div>

      <p className="asset-joke">
        {asset.joke || asset.description || "Market is cooking..."}
      </p>

      <div className="asset-actions">
        <button
          type="button"
          className="asset-buy"
          disabled={!onTrade}
          onClick={() => onTrade(asset, "buy")}
        >
          BUY <span>↗</span>
        </button>

        <button
          type="button"
          className="asset-sell"
          disabled={!onTrade}
          onClick={() => onTrade(asset, "sell")}
        >
          SELL <span>↘</span>
        </button>
      </div>

      <div className="asset-card-glow" />
    </article>
  );
}
