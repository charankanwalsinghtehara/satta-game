
import { useMemo, useState } from "react";
import {
  Trophy,
  Search,
  Crown,
  Medal,
  Users,
  TrendingUp,
  X,
} from "lucide-react";

const formatCoins = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

const getMedal = (index) => {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return `#${index + 1}`;
};

export default function Leaderboard({ rankings = [] }) {
  const [query, setQuery] = useState("");

  const safeRankings = Array.isArray(rankings)
    ? rankings
    : [];

  const sortedRankings = useMemo(() => {
    return [...safeRankings].sort(
      (a, b) => Number(b.score || 0) - Number(a.score || 0)
    );
  }, [safeRankings]);

  const filteredRankings = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return sortedRankings;

    return sortedRankings.filter((player) =>
      String(player.username || "")
        .toLowerCase()
        .includes(search)
    );
  }, [sortedRankings, query]);

  const totalCoins = sortedRankings.reduce(
    (total, player) => total + Number(player.score || 0),
    0
  );

  const highestScore = sortedRankings[0]
    ? Number(sortedRankings[0].score || 0)
    : 0;

  const podium = sortedRankings.slice(0, 3);

  return (
    <div className="page-stack leaderboard-page">
      {/* HEADER */}
      <section className="welcome-row">
        <div>
          <p className="eyebrow">
            FLEX KARNE KA TIME
          </p>

          <h1>
            Hall of <span>legends.</span> 🏆
          </h1>

          <p className="muted">
            Some are skilled. Some are suspiciously lucky.
          </p>
        </div>

        <span className="session-chip">
          <span className="live-dot" />
          LIVE RANKINGS
        </span>
      </section>

      {/* STATS */}
      <section className="stats-grid leaderboard-stats">
        <article className="stat-card">
          <span className="stat-icon purple">
            <Users size={19} />
          </span>

          <p>Total traders</p>
          <h2>{sortedRankings.length}</h2>

          <span className="stat-note">
            Players on the leaderboard
          </span>
        </article>

        <article className="stat-card">
          <span className="stat-icon orange">
            <Crown size={19} />
          </span>

          <p>Highest score</p>
          <h2>{formatCoins(highestScore)}</h2>

          <span className="stat-note">
            Coins held by the top trader
          </span>
        </article>

        <article className="stat-card">
          <span className="stat-icon green">
            <TrendingUp size={19} />
          </span>

          <p>Total virtual coins</p>
          <h2>{formatCoins(totalCoins)}</h2>

          <span className="stat-note">
            Combined leaderboard score
          </span>
        </article>
      </section>

      {/* TOP THREE */}
      {podium.length > 0 && (
        <section className="leaderboard-podium-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                THE BIG THREE
              </p>
              <h2>Top traders</h2>
            </div>

            <span className="muted small">
              Hall of fame
            </span>
          </div>

          <div className="leaderboard-podium">
            {podium.map((player, index) => (
              <article
                key={player.username}
                className={`podium-card podium-${index + 1}`}
              >
                <div className="podium-medal">
                  {getMedal(index)}
                </div>

                {index === 0 && (
                  <div className="podium-crown">
                    <Crown size={19} />
                  </div>
                )}

                <div className="podium-avatar">
                  {String(player.username || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <h3>{player.username}</h3>

                <span className="podium-position">
                  {index === 0
                    ? "CHAMPION"
                    : index === 1
                      ? "RUNNER UP"
                      : "THIRD PLACE"}
                </span>

                <strong className="podium-score">
                  {formatCoins(player.score)}
                </strong>

                <span className="podium-currency">
                  VIRTUAL COINS
                </span>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* COMPLETE RANKINGS */}
      <section className="panel leaderboard-panel">
        <div className="panel-heading leaderboard-title-row">
          <div>
            <p className="eyebrow">
              THE COMPLETE LIST
            </p>

            <h2>
              <Trophy size={20} />
              Trader rankings
            </h2>
          </div>

          <span className="session-chip">
            {sortedRankings.length} PLAYERS
          </span>
        </div>

        <label className="leaderboard-search">
          <Search size={17} />

          <input
            type="search"
            placeholder="Search trader username..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            >
              <X size={15} />
            </button>
          )}
        </label>

        <div className="leaderboard-table-heading">
          <span>RANK</span>
          <span>TRADER</span>
          <span>VIRTUAL SCORE</span>
        </div>

        {filteredRankings.length > 0 ? (
          filteredRankings.map((player) => {
            const originalRank = sortedRankings.findIndex(
              (entry) => entry.username === player.username
            );

            return (
              <div
                className={`leader-row leaderboard-modern-row ${
                  originalRank < 3 ? "top-player-row" : ""
                }`}
                key={player.username}
              >
                <span className="leader-rank">
                  {getMedal(originalRank)}
                </span>

                <span className="leader-avatar leaderboard-avatar">
                  {String(player.username || "?")
                    .charAt(0)
                    .toUpperCase()}
                </span>

                <div className="leaderboard-player-name">
                  <strong>{player.username}</strong>

                  {originalRank === 0 && (
                    <span className="leader-tag">
                      <Crown size={11} />
                      Top trader
                    </span>
                  )}

                  {originalRank === 1 && (
                    <span className="leader-tag silver-tag">
                      Runner up
                    </span>
                  )}

                  {originalRank === 2 && (
                    <span className="leader-tag bronze-tag">
                      Top 3
                    </span>
                  )}
                </div>

                <span className="leader-coins leaderboard-score">
                  {formatCoins(player.score)}
                  <small> coins</small>
                </span>
              </div>
            );
          })
        ) : (
          <div className="leaderboard-empty">
            <span>🔎</span>

            <h3>
              {query
                ? "Trader nahi mila."
                : "Abhi koi trader nahi hai."}
            </h3>

            <p>
              {query
                ? "Try another username."
                : "Rankings will appear when players join."}
            </p>

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
              >
                Clear search
              </button>
            )}
          </div>
        )}

        <div className="leaderboard-footer">
          <Medal size={15} />

          <span>
            Rankings are based on virtual coin scores.
          </span>
        </div>
      </section>

      <div className="disclaimer">
        Virtual trading game · No real-money rewards.
      </div>
    </div>
  );
}
