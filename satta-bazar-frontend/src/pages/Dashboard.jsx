import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Trophy,
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

export default function Dashboard({
  balance,
  assets,
  events,
  marketData,
  marketPaused,
  rank,
  onTrade,
}) {
  const trending = assets.reduce(
    (best, asset) =>
      !best ||
      Math.abs(asset.change) > Math.abs(best.change)
        ? asset
        : best,
    null,
  );

  const marketCommentary =
    events[0]?.commentary ||
    MARKET_FALLBACKS[
      assets.length % MARKET_FALLBACKS.length
    ];

  return (
    <div className="page-stack">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">
            FICTIONAL ASSETS · VIRTUAL CURRENCY ONLY
          </p>
          <h1>
            Market ka <span>mahaul.</span> 🎭
          </h1>
          <p className="muted">
            Live market data and virtual trades, powered by your
            Django account.
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

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-icon purple">
            <Activity size={19} />
          </span>
          <p>Virtual wallet</p>
          <h2>
            {balance.toLocaleString("en-IN")}{" "}
            <small>coins</small>
          </h2>
          <span className="stat-note">
            Your Django account balance · BB
          </span>
        </article>

        <article className="stat-card">
          <span className="stat-icon green">
            <ArrowUpRight size={19} />
          </span>
          <p>Listed assets</p>
          <h2>{assets.length}</h2>
          <span className="stat-note">
            From the live market catalog
          </span>
        </article>

        <article className="stat-card">
          <span className="stat-icon orange">
            <ArrowUpRight size={19} />
          </span>
          <p>Trending asset</p>
          <h2>{trending?.symbol || "—"}</h2>
          <span className="stat-note">
            {trending
              ? `${trending.change.toFixed(2)}% latest move`
              : "Waiting for market data"}
          </span>
        </article>

        <article className="stat-card">
          <span className="stat-icon pink">
            <Trophy size={19} />
          </span>
          <p>Your rank</p>
          <h2>{rank > 0 ? `#${rank}` : "—"}</h2>
          <span className="stat-note">
            Sign in to see your leaderboard rank
          </span>
        </article>
      </section>

      <PortfolioPnl />

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
                  trending.change >= 0 ? "up" : "down"
                }`}
              >
                {trending.change >= 0 ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {Math.abs(trending.change).toFixed(2)}%
              </span>
            )}
          </div>

          <div className="chart-price">
            {trending
              ? trending.price.toLocaleString("en-IN")
              : "—"}{" "}
            <span>coins</span>
          </div>

          <p className="muted small">
            {marketData.length
              ? "Price history from Django"
              : "Price history appears after market snapshots are recorded"}
          </p>

          {marketData.length > 1 && (
            <MarketChart data={marketData} />
          )}

          <div className="chart-legend">
            <span />
            Virtual market index
          </div>
        </article>

        <div className="side-stack">
          <MemeCard
            meme={{
              emoji: events.length ? "📣" : "💀",
              caption: marketCommentary,
              source: events.length
                ? events[0].name
                : "Satta Bazar Originals",
            }}
          />

          <article className="panel activity-panel">
            <div className="panel-heading">
              <h2>Market ki bakchodi</h2>
              <span className="muted small">
                Active events
              </span>
            </div>

            {events.slice(0, 3).map((event) => (
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

            {!events.length && (
              <div className="activity-row">
                <span className="activity-emoji">💀</span>
                <div className="activity-copy">
                  <strong>Abhi koi naya lafda nahi</strong>
                  <p>{marketCommentary}</p>
                </div>
                <span className="activity-up">•</span>
              </div>
            )}
          </article>
        </div>
      </section>

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
          {assets.slice(0, 6).map((asset) => (
            <AssetCard
              key={asset.symbol}
              asset={asset}
              onTrade={onTrade}
            />
          ))}

          {!assets.length && (
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
