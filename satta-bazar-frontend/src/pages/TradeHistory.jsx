
import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  RefreshCw,
} from "lucide-react";
import { getTrades } from "../../services/api";

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

export default function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTrades = useCallback(async () => {
    try {
      setError("");
      const response = await getTrades();

      const records = Array.isArray(response)
        ? response
        : response?.results || response?.trades || [];

      setTrades(records);
    } catch (err) {
      setError(err?.message || "Unable to load trade history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTrades();

    const handleUpdate = () => void loadTrades();

    window.addEventListener("portfolio:refresh", handleUpdate);
    window.addEventListener("portfolio:updated", handleUpdate);

    return () => {
      window.removeEventListener("portfolio:refresh", handleUpdate);
      window.removeEventListener("portfolio:updated", handleUpdate);
    };
  }, [loadTrades]);

  return (
    <section className="panel trade-history">
      <div className="trade-history-header">
        <div>
          <p className="eyebrow">YOUR ACTIVITY</p>
          <h2><History size={19} /> Trade History</h2>
        </div>

        <button
          type="button"
          className="portfolio-refresh"
          onClick={() => void loadTrades()}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading ? (
        <p className="trade-history-message">Loading trades...</p>
      ) : error ? (
        <div className="trade-history-message trade-history-error">
          {error}
          <button type="button" onClick={() => void loadTrades()}>
            Retry
          </button>
        </div>
      ) : trades.length === 0 ? (
        <div className="trade-history-empty">
          <span>📭</span>
          <p>No trades yet. Your activity will appear here.</p>
        </div>
      ) : (
        <div className="trade-history-list">
          {trades.map((trade, index) => {
            const isBuy = String(trade.side || trade.type || "").toLowerCase() === "buy";
            const quantity = Number(trade.quantity || 0);
            const price = Number(
              trade.price ?? trade.execution_price ?? 0
            );

            return (
              <article
                className="trade-history-row"
                key={trade.id || `${trade.symbol}-${index}`}
              >
                <div className={`trade-history-icon ${isBuy ? "buy" : "sell"}`}>
                  {isBuy ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>

                <div className="trade-history-info">
                  <strong>{trade.name || trade.symbol || "Asset"}</strong>
                  <span>
                    {String(trade.side || trade.type || "trade").toUpperCase()}
                    {" · "}
                    {quantity} units
                  </span>
                </div>

                <div className="trade-history-value">
                  <strong>{formatNumber(quantity * price)} BB</strong>
                  <span>{formatNumber(price)} BB / unit</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
