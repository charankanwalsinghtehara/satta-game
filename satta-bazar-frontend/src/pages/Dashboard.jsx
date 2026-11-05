
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Trophy,
  TrendingUp,
  TrendingDown,
  Zap,
} from "lucide-react";

import AssetCard from "../components/AssetCard";
import MarketChart from "../components/MarketChart";
import MemeCard from "../components/MemeCard";
import PortfolioPnl from "../components/PortfolioPnl";

const MARKET_FALLBACKS = [
  "Market shaant hai. Matlab kuch bada kaand hone wala hai. 👀",
  "Abhi koi naya lafda nahi. Apni positions check kar lo, bhai. 📊",
  "Market so raha hai; tumhara FOMO abhi bhi jaag raha hai. 💀",
  "Breaking news nahi mili. Rumour pe trade karna band karo, chacha. 📰",
];

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

export default function Dashboard({
  balance = 0,
  assets = [],
  events = [],
  marketData = [],
  marketPaused = false,
  rank = 0,
  onTrade,
}) {
  const safeAssets = Array.isArray(assets) ? assets : [];
  const safeEvents = Array.isArray(events) ? events : [];
  const safeMarketData = Array.isArray(marketData)
    ? marketData
    : [];

  const sortedAssets = [...safeAssets].sort(
    (a, b) => Number(b.change || 0) - Number(a.change || 0)
  );

  const topGainer = sortedAssets[0] || null;
  const topLoser =
    [...safeAssets].sort(
      (a, b) => Number(a.change || 0) - Number(b.change || 0)
    )[0] || null;

  const trending = safeAssets.reduce(
    (best, asset) =>
      !best ||
      Math.abs(Number(asset.change || 0)) >
        Math.abs(Number(best.change || 0))
        ? asset
        : best,
    null
  );

  const gainers = safeAssets.filter(
    (asset) => Number(asset.change || 0) > 0
  ).length;

  const losers = safeAssets.filter(
    (asset) => Number(asset.change || 0) < 0
  ).length;

  const marketCommentary =
    safeEvents[0]?.commentary ||
    MARKET_FALLBACKS[
      safeAssets.length % MARKET_FALLBACKS.length
    ];

  return (
    <div className="page-stack dashboard-page">
      {/* HERO */}
      <section className="welcome-row">
        <div>
          <p className="eyebrow">
            FICTIONAL ASSETS · VIRTUAL CURRENCY ONLY
          </p>

          <h1>
            Market ka <span>mahaul.</span> 🎭
          </h1>

          <p className="muted">
            Welcome to the chaos exchange. Research optional,
            chai mandatory.
          </p>
        </div>

        <div className="session-chip">
          <span
            className={
              marketPaused ? "market-dot paused" : "live-dot"
            }
          />
          {marketPaused ? "MARKET PAUSED" : "MARKET LIVE"}
        </div>
      </section>

      {/* OVERVIEW STATS */}
      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-icon purple">
            <Activity size={19} />
          </span>

          <p>Virtual wallet</p>

          <h2>
            {money(balance)} <small>coins</small>
          </h2>

          <span className="stat-note">
            Your available virtual balance
          </span>
        </article>

        <article className="stat-card">
          <span className="stat-icon green">
            <TrendingUp size={19} />
          </span>

          <p>Listed assets</p>

          <h2>{safeAssets.length}</h2>

          <span className="stat-note">
            Assets in the live market catalog
          </span>
        </article>

        <article className="stat-card">
          <span className="stat-icon orange">
            <Zap size={19} />
          </span>

          <p>Market gainers</p>

          <h2>{gainers}</h2>

          <span className="stat-note">
            {losers} assets currently down
          </span>
        </article>

        <article className="stat-card">
          <span className="stat-icon pink">
            <Trophy size={19} />
          </span>

          <p>Your rank</p>

          <h2>{rank > 0 ? `#${rank}` : "—"}</h2>

          <span className="stat-note">
            Your leaderboard position
          </span>
        </article>
      </section>

      {/* PORTFOLIO */}
      <PortfolioPnl />

      {/* MARKET HIGHLIGHTS */}
      <section className="dashboard-highlights">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MARKET INTELLIGENCE</p>
            <h2>Today's highlights</h2>
          </div>

          <span className="muted small">
            Latest market movement
          </span>
        </div>

        <div className="dashboard-highlight-grid">
          <article className="dashboard-highlight-card">
            <div className="dashboard-highlight-icon positive">
              <TrendingUp size={19} />
            </div>

            <div>
              <span className="dashboard-highlight-label">
                TOP GAINER
              </span>

              <h3>
                {topGainer?.name || "Waiting for data"}
              </h3>

              <p className="positive-text">
                {topGainer
                  ? `+${Number(topGainer.change || 0).toFixed(2)}%`
                  : "No movement available"}
              </p>
            </div>
          </article>

          <article className="dashboard-highlight-card">
            <div className="dashboard-highlight-icon negative">
              <TrendingDown size={19} />
            </div>

            <div>
              <span className="dashboard-highlight-label">
                TOP LOSER
              </span>

              <h3>
                {topLoser?.name || "Waiting for data"}
              </h3>

              <p className="negative-text">
                {topLoser
                  ? `${Number(topLoser.change || 0).toFixed(2)}%`
                  : "No movement available"}
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* CHART AND EVENTS */}
      <section className="content-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">THE CHAOS INDEX</p>
              <h2>Market performance</h2>
            </div>

            {trending && (
              <span
                className={`change-chip ${
                  Number(trending.change || 0) >= 0
                    ? "up"
                    : "down"
                }`}
              >
                {Number(trending.change || 0) >= 0 ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}

                {Math.abs(
                  Number(trending.change || 0)
                ).toFixed(2)}
                %
              </span>
            )}
          </div>

          <div className="chart-price">
            {trending ? money(trending.price) : "—"}{" "}
            <span>coins</span>
          </div>

          <p className="muted small">
            {safeMarketData.length
              ? "Price history from Django"
              : "Price history appears after market snapshots are recorded"}
          </p>

          {safeMarketData.length > 1 ? (
            <MarketChart data={safeMarketData} />
          ) : (
            <div className="dashboard-chart-empty">
              <Activity size={27} />
              <p>Waiting for more market snapshots...</p>
            </div>
          )}

          <div className="chart-legend">
            <span />
            Virtual market index
          </div>
        </article>

        <div className="side-stack">
          <MemeCard
            meme={{
              emoji: safeEvents.length ? "📣" : "💀",
              caption: marketCommentary,
              source: safeEvents.length
                ? safeEvents[0].name
                : "Satta Bazar Originals",
            }}
          />

          <article className="panel activity-panel">
            <div className="panel-heading">
              <h2>Market ki bakchodi</h2>

              <span className="muted small">
                {safeEvents.length} active events
              </span>
            </div>

            {safeEvents.slice(0, 3).map((event) => (
              <div
                className="activity-row"
                key={event.id}
              >
                <span className="activity-emoji">📣</span>

                <div className="activity-copy">
                  <strong>{event.name}</strong>
                  <p>
                    {event.commentary || marketCommentary}
                  </p>
                </div>

                <span className="activity-up">•</span>
              </div>
            ))}

            {!safeEvents.length && (
              <div className="activity-row">
                <span className="activity-emoji">💀</span>

                <div className="activity-copy">
                  <strong>No active events</strong>
                  <p>{marketCommentary}</p>
                </div>

                <span className="activity-up">•</span>
              </div>
            )}
          </article>
        </div>
      </section>

      {/* TRENDING ASSETS */}
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              LIVE FROM THE DJANGO API
            </p>

            <h2>Trending assets</h2>
          </div>

          <span className="muted small">
            Virtual coins only
          </span>
        </div>

        <div className="assets-grid">
          {sortedAssets.slice(0, 6).map((asset) => (
            <AssetCard
              key={asset.symbol}
              asset={asset}
              onTrade={onTrade}
            />
          ))}

          {!safeAssets.length && (
            <div className="empty-state">
              <h3>No market assets are available.</h3>
              <p>
                Check that the backend catalog has been seeded.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="disclaimer">
        <ArrowDownRight size={16} />
        Satta Bazar is a virtual trading game. No real money,
        deposits, or prizes.
      </div>
    </div>
  );
}
