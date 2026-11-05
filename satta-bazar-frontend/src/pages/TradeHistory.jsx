
import { useCallback, useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, History } from "lucide-react";
import { getTrades } from "../../services/api";

export default function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await getTrades();
      setTrades(
        Array.isArray(response)
          ? response
          : response.results || response.trades || []
      );
      setError("");
    } catch (err) {
      setError(err.message || "Could not load trades.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(load, 15000);
    window.addEventListener("portfolio:refresh", load);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("portfolio:refresh", load);
    };
  }, [load]);

  return (
    <section className="panel trade-history">
      <div className="trade-history-header">
        <div>
          <p className="eyebrow">YOUR ACTIVITY</p>
          <h2><History size={19} /> Trade History</h2>
        </div>
        <button className="portfolio-refresh" onClick={load}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading trades...</p>
      ) : error ? (
        <p className="trade-history-error">{error}</p>
      ) : trades.length === 0 ? (
        <p className="trade-history-empty">No trades yet.</p>
      ) : (
        <div className="trade-history-list">
          {trades.map((trade, index) => {
            const side = String(
              trade.side || trade.type || ""
            ).toLowerCase();
            const isBuy = side === "buy";
            const quantity = Number(trade.quantity || 0);
            const price = Number(trade.price || trade.execution_price || 0);

            return (
              <article
                className="trade-history-row"
                key={trade.id || `${trade.symbol}-${index}`}
              >
                <div className={`trade-history-icon ${isBuy ? "buy" : "sell"}`}>
                  {isBuy ? <ArrowDownLeft /> : <ArrowUpRight />}
                </div>
                <div className="trade-history-info">
                  <strong>{trade.name || trade.symbol}</strong>
                  <span>{side.toUpperCase()} · {quantity} units</span>
                </div>
                <div className="trade-history-value">
                  <strong>
                    {(quantity * price).toLocaleString("en-IN")} BB
                  </strong>
                  <span>{price.toLocaleString("en-IN")} per unit</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
