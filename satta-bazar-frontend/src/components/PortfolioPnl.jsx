
import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { ApiError, getPortfolio } from "../../services/api";
import "./PortfolioPnl.css";

const THRESHOLDS = [-10, -5, 5, 10];

const n = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value) =>
  n(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function thresholdToast(threshold) {
  const up = threshold > 0;

  Swal.fire({
    toast: true,
    position: "top-end",
    icon: up ? "success" : "warning",
    title: up
      ? `P&L crossed +${threshold}% 🤑`
      : `P&L crossed ${threshold}% 📉`,
    text: up
      ? "Green zone! Profit is unrealized until you sell."
      : "Risk alert. Review your position before trading more.",
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    background: "#18181b",
    color: "#fafafa",
  });
}

function crossed(previous, current, threshold) {
  return threshold > 0
    ? previous < threshold && current >= threshold
    : previous > threshold && current <= threshold;
}

function Stat({ label, value, note, positive }) {
  return (
    <article className="portfolio-pnl-stat">
      <span>{label}</span>
      <strong
        className={
          positive === undefined
            ? ""
            : positive
              ? "pnl-positive"
              : "pnl-negative"
        }
      >
        {value}
      </strong>
      <small>{note || "Current value"}</small>
    </article>
  );
}

export default function PortfolioPnl() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const previousPercent = useRef(null);
  const notified = useRef(new Set());
  const inFlight = useRef(false);
  const mounted = useRef(false);

  const refresh = useCallback(async (manual = false) => {
    // Prevent multiple requests from overlapping.
    if (inFlight.current) return;

    inFlight.current = true;

    if (manual) setRefreshing(true);

    try {
      const data = await getPortfolio();

      if (!data || typeof data !== "object") {
        throw new Error("The portfolio API returned invalid data.");
      }

      const positions = Array.isArray(data.positions)
        ? data.positions
        : [];

      const unrealized = n(data.unrealized_pnl);
      const marketValue = n(data.market_value);
      const cashBalance = n(data.cash_balance);
      const realized = n(data.realized_pnl);
      const equity = n(data.equity);

      const costBasis = positions.reduce(
        (sum, position) =>
          sum +
          n(position.quantity) *
            n(position.average_entry_price),
        0
      );

      const percent =
        costBasis > 0 ? (unrealized / costBasis) * 100 : 0;

      const previous = previousPercent.current;

      // The first response establishes the baseline.
      if (previous !== null && costBasis > 0) {
        for (const threshold of THRESHOLDS) {
          const key = String(threshold);

          if (
            crossed(previous, percent, threshold) &&
            !notified.current.has(key)
          ) {
            notified.current.add(key);
            thresholdToast(threshold);
          }
        }
      }

      previousPercent.current = percent;

      if (mounted.current) {
        setPortfolio({
          positions,
          unrealized,
          marketValue,
          cashBalance,
          realized,
          equity,
          percent,
        });

        setError("");
      }
    } catch (err) {
      if (mounted.current) {
        if (
          err instanceof ApiError &&
          [401, 403].includes(err.status)
        ) {
          setError("Please log in to view your portfolio P&L.");
        } else {
          setError(
            err?.message ||
              "Could not load P&L. Check your backend connection."
          );
        }
      }
    } finally {
      inFlight.current = false;

      if (mounted.current) {
        setLoading(false);
        if (manual) setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;

    // Load immediately when the dashboard opens.
    void refresh();

    // Keep the display responsive without overlapping requests.
    const timer = window.setInterval(() => {
      void refresh();
    }, 1000);

    // Also refresh immediately when the app announces a completed trade.
    const onTradeUpdated = (event) => {
      const data = event.detail;

      if (data && typeof data === "object") {
        const positions = Array.isArray(data.positions)
          ? data.positions
          : [];

        const unrealized = n(data.unrealized_pnl);
        const marketValue = n(data.market_value);
        const cashBalance = n(data.cash_balance);
        const realized = n(data.realized_pnl);
        const equity = n(data.equity);

        const costBasis = positions.reduce(
          (sum, position) =>
            sum +
            n(position.quantity) *
              n(position.average_entry_price),
          0
        );

        const percent =
          costBasis > 0 ? (unrealized / costBasis) * 100 : 0;

        previousPercent.current = percent;

        setPortfolio({
          positions,
          unrealized,
          marketValue,
          cashBalance,
          realized,
          equity,
          percent,
        });

        setError("");
        setLoading(false);
      }

      // Fetch the authoritative portfolio again immediately.
      void refresh(true);
    };

    window.addEventListener("portfolio:updated", onTradeUpdated);

    return () => {
      mounted.current = false;
      window.clearInterval(timer);
      window.removeEventListener(
        "portfolio:updated",
        onTradeUpdated
      );
    };
  }, [refresh]);

  return (
    <section className="portfolio-pnl panel">
      <div className="portfolio-pnl-heading">
        <div>
          <p className="eyebrow">YOUR PORTFOLIO</p>
          <h2>
            <Activity size={19} />
            Profit &amp; Loss
          </h2>
          <p className="portfolio-pnl-subtitle">
            Auto-refresh every second · Virtual trading only
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
          <button
            type="button"
            onClick={() => void refresh(true)}
          >
            Retry
          </button>
        </div>
      )}

      {loading && !portfolio && (
        <p className="portfolio-pnl-muted">
          Loading your portfolio…
        </p>
      )}

      {portfolio && (
        <>
          <div className="portfolio-pnl-grid">
            <Stat
              label="Cash balance"
              value={`${money(portfolio.cashBalance)} BB`}
              note="Available virtual coins"
            />

            <Stat
              label="Unrealized P&L"
              value={`${portfolio.unrealized > 0 ? "+" : ""}${money(portfolio.unrealized)} BB`}
              note={`${portfolio.percent > 0 ? "+" : ""}${portfolio.percent.toFixed(2)}% on open positions`}
              positive={portfolio.unrealized >= 0}
            />

            <Stat
              label="Realized P&L"
              value={`${portfolio.realized > 0 ? "+" : ""}${money(portfolio.realized)} BB`}
              note="Completed sells"
              positive={portfolio.realized >= 0}
            />

            <Stat
              label="Total equity"
              value={`${money(portfolio.equity)} BB`}
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
                const pnl = n(position.unrealized_pnl);
                const quantity = n(position.quantity);
                const entry = n(position.average_entry_price);
                const current = n(position.current_price);
                const basis = quantity * entry;
                const percent =
                  basis > 0 ? (pnl / basis) * 100 : 0;

                return (
                  <div
                    className="portfolio-position-row"
                    key={position.symbol || index}
                  >
                    <div className="portfolio-position-name">
                      <strong>
                        {position.name || position.symbol}
                      </strong>
                      <span>
                        {position.symbol} · Qty {quantity}
                      </span>
                    </div>

                    <div className="portfolio-position-cell">
                      <span>Entry price</span>
                      <strong>{money(entry)} BB</strong>
                    </div>

                    <div className="portfolio-position-cell">
                      <span>Current price</span>
                      <strong>{money(current)} BB</strong>
                    </div>

                    <div className="portfolio-position-cell">
                      <span>Unrealized P&amp;L</span>
                      <strong
                        className={
                          pnl >= 0
                            ? "pnl-positive"
                            : "pnl-negative"
                        }
                      >
                        {pnl > 0 ? "+" : ""}
                        {money(pnl)} BB
                      </strong>
                      <small
                        className={
                          pnl >= 0
                            ? "pnl-positive"
                            : "pnl-negative"
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
              No open positions yet. Buy an asset to track its
              unrealized P&amp;L.
            </p>
          )}

          <p className="portfolio-pnl-footnote">
            Unrealized P&amp;L tracks open positions. Realized
            P&amp;L tracks completed sells. Prices depend on the
            backend market engine.
          </p>
        </>
      )}

      {!loading && !portfolio && error && (
        <p className="portfolio-pnl-muted">
          Your figures will appear once the portfolio API is
          reachable.
        </p>
      )}
    </section>
  );
}
