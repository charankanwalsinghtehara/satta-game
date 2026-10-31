
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

import { ApiError, getPortfolioPositions } from "../../services/api";
import "./PortfolioPnl.css";

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
  return toNumber(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

function getPnlClass(value) {
  return toNumber(value) >= 0 ? "pnl-positive" : "pnl-negative";
}

function getPositionKey(position, index) {
  return position.id ?? position.symbol ?? `position-${index}`;
}

export default function PortfolioPnl() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [authRequired, setAuthRequired] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const refreshPortfolio = useCallback(async () => {
    setRefreshing(true);

    try {
      const data = await getPortfolioPositions();

      // Support either a direct array or a wrapped API response.
      const nextPositions = Array.isArray(data)
        ? data
        : Array.isArray(data?.positions)
          ? data.positions
          : Array.isArray(data?.results)
            ? data.results
            : null;

      if (!nextPositions) {
        throw new Error(
          "Unexpected portfolio response. Check the Django positions endpoint."
        );
      }

      setPositions(nextPositions);
      setAuthRequired(false);
      setError("");
      setLastUpdated(new Date());
    } catch (requestError) {
      if (
        requestError instanceof ApiError &&
        requestError.status === 401
      ) {
        setAuthRequired(true);
        setPositions([]);
        setError("");
      } else if (
        requestError instanceof ApiError &&
        requestError.status === 403
      ) {
        setError(
          "Access was denied. Check your login session and backend permissions."
        );
      } else {
        setError(
          requestError?.message || "Could not refresh your portfolio."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let timer;

    async function refreshSafely() {
      if (!active) return;

      setRefreshing(true);

      try {
        const data = await getPortfolioPositions();

        if (!active) return;

        const nextPositions = Array.isArray(data)
          ? data
          : Array.isArray(data?.positions)
            ? data.positions
            : Array.isArray(data?.results)
              ? data.results
              : null;

        if (!nextPositions) {
          throw new Error(
            "Unexpected portfolio response. Check the Django positions endpoint."
          );
        }

        setPositions(nextPositions);
        setAuthRequired(false);
        setError("");
        setLastUpdated(new Date());
      } catch (requestError) {
        if (!active) return;

        if (
          requestError instanceof ApiError &&
          requestError.status === 401
        ) {
          setAuthRequired(true);
          setPositions([]);
          setError("");
        } else if (
          requestError instanceof ApiError &&
          requestError.status === 403
        ) {
          setError(
            "Access was denied. Check your login session and backend permissions."
          );
        } else {
          setError(
            requestError?.message || "Could not refresh your portfolio."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void refreshSafely();

    timer = window.setInterval(() => {
      void refreshSafely();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [refreshTick]);

  const totalUnrealized = positions.reduce(
    (sum, position) => sum + toNumber(position.unrealized_pnl),
    0
  );

  const totalRealized = positions.reduce(
    (sum, position) => sum + toNumber(position.realized_pnl),
    0
  );

  const totalMarketValue = positions.reduce(
    (sum, position) =>
      sum + toNumber(position.market_value),
    0
  );

  const totalCost = positions.reduce(
    (sum, position) => {
      if (position.cost_basis != null) {
        return sum + toNumber(position.cost_basis);
      }

      return (
        sum +
        toNumber(position.average_entry_price) *
          toNumber(position.quantity)
      );
    },
    0
  );

  const pnlPercent =
    totalCost > 0 ? (totalUnrealized / totalCost) * 100 : 0;

  const manualRefresh = useCallback(() => {
    setRefreshTick((current) => current + 1);
  }, []);

  if (authRequired && !loading) {
    return (
      <section className="panel portfolio-pnl">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">YOUR TRADING SCORE</p>
            <h2>Profit &amp; Loss</h2>
          </div>
          <Activity size={21} aria-hidden="true" />
        </div>

        <div className="pnl-empty">
          <Activity size={25} aria-hidden="true" />
          <p>Login required</p>
          <span>
            Log in to view your open positions and trading P&amp;L.
          </span>
        </div>

        <button
          type="button"
          className="pnl-manual-refresh"
          onClick={manualRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={14} />
          Check again
        </button>
      </section>
    );
  }

  return (
    <section className="panel portfolio-pnl">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">YOUR TRADING SCORE</p>
          <h2>Profit &amp; Loss</h2>
        </div>

        <span className="pnl-refresh-state">
          <span
            className={
              refreshing ? "pnl-refresh-dot" : "live-dot"
            }
            aria-hidden="true"
          />
          {refreshing ? "Refreshing" : "Auto-refresh · 5s"}
        </span>
      </div>

      {loading && !lastUpdated ? (
        <p className="muted">Loading your portfolio...</p>
      ) : (
        <>
          <div className="pnl-main-row">
            <div>
              <p className="muted small">Unrealized P&amp;L</p>

              <h3
                className={`pnl-total ${getPnlClass(totalUnrealized)}`}
              >
                {totalUnrealized > 0 ? "+" : ""}
                {formatMoney(totalUnrealized)}
              </h3>

              <p
                className={`pnl-percent ${getPnlClass(totalUnrealized)}`}
              >
                {pnlPercent > 0 ? "+" : ""}
                {pnlPercent.toFixed(2)}% on open positions
              </p>
            </div>

            {totalUnrealized >= 0 ? (
              <ArrowUpRight
                size={30}
                className="pnl-positive"
                aria-hidden="true"
              />
            ) : (
              <ArrowDownRight
                size={30}
                className="pnl-negative"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="pnl-summary-grid">
            <div className="pnl-summary-item">
              <span>Realized P&amp;L</span>
              <strong className={getPnlClass(totalRealized)}>
                {totalRealized > 0 ? "+" : ""}
                {formatMoney(totalRealized)}
              </strong>
              <small>Closed trades</small>
            </div>

            <div className="pnl-summary-item">
              <span>Current market value</span>
              <strong>{formatMoney(totalMarketValue)}</strong>
              <small>Open positions</small>
            </div>
          </div>

          {error && (
            <p className="pnl-error" role="alert">
              {error}
            </p>
          )}

          <div className="pnl-positions-heading">
            <h3>Open positions</h3>
            <span>{positions.length} assets</span>
          </div>

          {positions.length > 0 ? (
            <div className="pnl-position-list">
              {positions.map((position, index) => {
                const quantity = toNumber(position.quantity);
                const averagePrice = toNumber(
                  position.average_entry_price
                );
                const currentPrice = toNumber(position.current_price);
                const pnl = toNumber(position.unrealized_pnl);

                const cost =
                  position.cost_basis != null
                    ? toNumber(position.cost_basis)
                    : averagePrice * quantity;

                const percentage =
                  cost > 0 ? (pnl / cost) * 100 : 0;

                return (
                  <article
                    className="pnl-position"
                    key={getPositionKey(position, index)}
                  >
                    <div className="pnl-position-info">
                      <strong>
                        {position.symbol || position.name || "Asset"}
                      </strong>

                      {position.name &&
                        position.name !== position.symbol && (
                          <span>{position.name}</span>
                        )}

                      <small>
                        {quantity} shares · Avg.{" "}
                        {formatMoney(averagePrice)}
                      </small>
                    </div>

                    <div className="pnl-position-numbers">
                      <strong className={getPnlClass(pnl)}>
                        {pnl > 0 ? "+" : ""}
                        {formatMoney(pnl)}
                      </strong>

                      <span className={getPnlClass(pnl)}>
                        {percentage > 0 ? "+" : ""}
                        {percentage.toFixed(2)}%
                      </span>

                      <small>
                        Current: {formatMoney(currentPrice)}
                      </small>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="pnl-empty">
              <Activity size={24} aria-hidden="true" />
              <p>No open positions yet.</p>
              <span>
                Buy a stock to start tracking your virtual P&amp;L.
              </span>
            </div>
          )}
        </>
      )}

      {lastUpdated && (
        <p className="muted small">
          Last updated: {lastUpdated.toLocaleTimeString("en-IN")}
        </p>
      )}

      <button
        type="button"
        className="pnl-manual-refresh"
        onClick={manualRefresh}
        disabled={refreshing}
      >
        <RefreshCw size={14} />
        {refreshing ? "Refreshing..." : "Refresh portfolio"}
      </button>
    </section>
  );
}
