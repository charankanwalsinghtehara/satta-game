import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

export default function PortfolioPnl({ positions = [] }) {
  const totalUnrealized = positions.reduce(
    (sum, item) => sum + Number(item.unrealized_pnl || 0),
    0,
  );

  const totalRealized = positions.reduce(
    (sum, item) => sum + Number(item.realized_pnl || 0),
    0,
  );

  const totalCost = positions.reduce(
    (sum, item) =>
      sum +
      Number(item.average_entry_price || 0) *
        Number(item.quantity || 0),
    0,
  );

  const pnlPercent = totalCost
    ? (totalUnrealized / totalCost) * 100
    : 0;

  const positive = totalUnrealized >= 0;

  return (
    <section className="panel portfolio-pnl">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">YOUR TRADING SCORE</p>
          <h2>Profit &amp; Loss</h2>
        </div>

        <span className={`change-chip ${positive ? "up" : "down"}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {pnlPercent.toFixed(2)}%
        </span>
      </div>

      <div className={`pnl-total ${positive ? "pnl-positive" : "pnl-negative"}`}>
        {positive ? "+" : ""}
        {money(totalUnrealized)}
      </div>
      <p className="muted small">Unrealized P&amp;L · Open positions</p>

      <div className="pnl-breakdown">
        <div>
          <span>Realized P&amp;L</span>
          <strong>{money(totalRealized)}</strong>
        </div>
        <div>
          <span>Open positions</span>
          <strong>{positions.length}</strong>
        </div>
      </div>

      {positions.length > 0 ? (
        <div className="pnl-positions">
          {positions.map((item) => {
            const pnl = Number(item.unrealized_pnl || 0);
            const isProfit = pnl >= 0;

            return (
              <div className="pnl-position" key={item.symbol}>
                <div>
                  <strong>{item.symbol}</strong>
                  <p className="muted small">
                    {item.quantity} shares · Avg. {money(item.average_entry_price)}
                  </p>
                </div>
                <div className={isProfit ? "pnl-positive" : "pnl-negative"}>
                  <strong>{isProfit ? "+" : ""}{money(pnl)}</strong>
                  <p className="muted small">
                    Current: {money(item.current_price)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="muted small">
          No open positions yet. Buy a stock to start tracking P&amp;L.
        </p>
      )}
    </section>
  );
}
