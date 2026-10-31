
import { useCallback, useEffect, useState } from "react";
import { Activity, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { getPortfolio } from "../../services/api";
import "./PortfolioPnl.css";

const number = (value) => {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
};

const money = (value) =>
  number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Stat({ label, value, note, pnl = false }) {
  const amount = number(value);

  return (
    <article className="portfolio-pnl-stat">
      <span>{label}</span>
      <strong
        className={
          pnl ? (amount >= 0 ? "pnl-positive" : "pnl-negative") : ""
        }
      >
        {pnl && amount > 0 ? "+" : ""}
        {money(amount)} BB
      </strong>
      <small>{note}</small>
    </article>
  );
}

export default function PortfolioPnl() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);

    try {
      const data = await getPortfolio();

      if (!data || typeof data !== "object") {
        throw new Error("Portfolio API returned an invalid response.");
      }

      setPortfolio({
        cashBalance: number(data.cash_balance),
        marketValue: number(data.market_value),
        equity: number(data.equity),
        realized: number(data.realized_pnl),
        unrealized: number(data.unrealized_pnl),
        positions: Array.isArray(data.positions) ? data.positions : [],
      });

      setError("");
    } catch (err) {
      setError(
        err?.status === 401 || err?.status === 403
          ? "Please log in again to view your Profit & Loss."
          : err?.message || "Unable to load P&L. Check your backend/API connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const timer = window.setInterval(() => {
      void refresh();
    }, 5000);

    const refreshAfterTrade = () => {
      void refresh();
    };

    window.addEventListener("portfolio:refresh", refreshAfterTrade);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("portfolio:refresh", refreshAfterTrade);
    };
  }, [refresh]);

  return (
    <section className="portfolio-pnl panel">
      <div className="portfolio-pnl-heading">
        <div>
          <p className="eyebrow">YOUR VIRTUAL PORTFOLIO</p>
          <h2>
            <Activity size={20} /> Profit &amp; Loss
          </h2>
          <p className="portfolio-pnl-subtitle">
            Portfolio data from Django · Auto-refresh every 5 seconds
          </p>
        </div>

        <button
          className="portfolio-refresh"
          type="button"
          disabled={refreshing}
          onClick={() => void refresh(true)}
        >
          <RefreshCw
            size={15}
            className={refreshing ? "pnl-spinning" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="portfolio-pnl-error" role="alert">
          {error}
          <button type="button" onClick={() => void refresh(true)}>
            Try again
          </button>
        </div>
      )}

      {loading && !portfolio && (
        <p className="portfolio-pnl-muted">Loading your P&amp;L…</p>
      )}

      {!loading && !portfolio && error && (
        <p className="portfolio-pnl-muted">
          Portfolio figures will appear after the API connection works.
        </p>
      )}

      {portfolio && (
        <>
          <div className="portfolio-pnl-grid">
            <Stat
              label="Cash balance"
              value={portfolio.cashBalance}
              note="Available virtual coins"
            />
            <Stat
              label="Unrealized P&L"
              value={portfolio.unrealized}
              pnl
              note="Profit/loss on open positions"
            />
            <Stat
              label="Realized P&L"
              value={portfolio.realized}
              pnl
              note="Profit/loss from completed sells"
            />
            <Stat
              label="Total equity"
              value={portfolio.equity}
              note={`Open assets: ${money(portfolio.marketValue)} BB`}
            />
          </div>

          <div className="portfolio-position-heading">
            <h3>Open positions</h3>
            <span>{portfolio.positions.length} assets</span>
          </div>

          {portfolio.positions.length > 0 ? (
            <div className="portfolio-position-list">
              {portfolio.positions.map((position, index) => {
                const pnl = number(position.unrealized_pnl);
                const quantity = number(position.quantity);
                const entry = number(position.average_entry_price);
                const basis = quantity * entry;
                const percent = basis > 0 ? (pnl / basis) * 100 : 0;

                return (
                  <div
                    className="portfolio-position-row"
                    key={position.symbol || index}
                  >
                    <div className="portfolio-position-name">
                      <strong>{position.name || position.symbol}</strong>
                      <span>
                        {position.symbol} · Quantity {quantity}
                      </span>
                    </div>

                    <div className="portfolio-position-cell">
                      <span>Entry price</span>
                      <strong>{money(entry)} BB</strong>
                    </div>

                    <div className="portfolio-position-cell">
                      <span>Current price</span>
                      <strong>{money(position.current_price)} BB</strong>
                    </div>

                    <div className="portfolio-position-cell">
                      <span>Unrealized P&amp;L</span>
                      <strong
                        className={
                          pnl >= 0 ? "pnl-positive" : "pnl-negative"
                        }
                      >
                        {pnl > 0 ? "+" : ""}
                        {money(pnl)} BB
                      </strong>
                      <small
                        className={
                          pnl >= 0 ? "pnl-positive" : "pnl-negative"
                        }
                      >
                        {percent > 0 ? "+" : ""}
                        {percent.toFixed(2)}%
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="portfolio-pnl-muted">
              No open positions. Buy a virtual asset to start tracking
              unrealized P&amp;L.
            </p>
          )}

          <p className="portfolio-pnl-footnote">
            Unrealized P&amp;L changes with market prices. Realized P&amp;L
            reflects completed sells. Both figures come from the backend.
          </p>
        </>
      )}
    </section>
  );
}
