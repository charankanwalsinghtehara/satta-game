
import { useMemo, useState } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  SlidersHorizontal,
  ArrowUpDown,
  Zap,
  X,
} from "lucide-react";

import AssetCard from "../components/AssetCard";
import "./Markets.css";

export default function Markets({ assets = [], onTrade }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("popular");

  const stats = useMemo(() => {
    const rising = assets.filter(
      (asset) => Number(asset.change) > 0
    ).length;

    const falling = assets.filter(
      (asset) => Number(asset.change) < 0
    ).length;

    return {
      total: assets.length,
      rising,
      falling,
      stable: assets.length - rising - falling,
    };
  }, [assets]);

  const filtered = useMemo(() => {
    let result = assets.filter((asset) => {
      const matchesSearch =
        `${asset.name} ${asset.symbol} ${asset.joke || ""}`
          .toLowerCase()
          .includes(query.toLowerCase().trim());

      const change = Number(asset.change);

      const matchesFilter =
        filter === "all" ||
        (filter === "up" && change > 0) ||
        (filter === "down" && change < 0) ||
        (filter === "stable" && change === 0);

      return matchesSearch && matchesFilter;
    });

    result = [...result];

    if (sort === "gainers") {
      result.sort(
        (a, b) => Number(b.change) - Number(a.change)
      );
    } else if (sort === "losers") {
      result.sort(
        (a, b) => Number(a.change) - Number(b.change)
      );
    } else if (sort === "price-high") {
      result.sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    } else if (sort === "price-low") {
      result.sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    }

    return result;
  }, [assets, query, filter, sort]);

  const biggestGainer = useMemo(
    () =>
      assets.reduce(
        (best, asset) =>
          !best ||
          Number(asset.change) > Number(best.change)
            ? asset
            : best,
        null
      ),
    [assets]
  );

  const biggestLoser = useMemo(
    () =>
      assets.reduce(
        (worst, asset) =>
          !worst ||
          Number(asset.change) < Number(worst.change)
            ? asset
            : worst,
        null
      ),
    [assets]
  );

  return (
    <div className="page-stack markets-page">

      <section className="markets-hero">
        <div className="markets-hero-content">
          <div className="markets-live-label">
            <span />
            THE CHAOS EXCHANGE
          </div>

          <h1>
            Pick your <span>poison.</span> 🎭
          </h1>

          <p>
            Every asset has a story. Every price has drama.
            Find your next virtual trade.
          </p>

          <div className="markets-hero-tags">
            <span>⚡ LIVE MARKET</span>
            <span>📊 REAL-TIME DATA</span>
            <span>🪙 VIRTUAL TRADING</span>
          </div>
        </div>

        <div className="markets-hero-decoration">
          <div className="markets-big-icon">📈</div>
          <div className="markets-floating-icon">💸</div>
          <div className="markets-floating-icon second">🚀</div>
        </div>
      </section>

      <section className="markets-stats">
        <article className="market-stat">
          <span className="market-stat-icon purple">
            <Activity size={19} />
          </span>
          <div>
            <p>Total assets</p>
            <h2>{stats.total}</h2>
          </div>
        </article>

        <article className="market-stat">
          <span className="market-stat-icon green">
            <TrendingUp size={19} />
          </span>
          <div>
            <p>Going crazy up</p>
            <h2 className="market-green">
              {stats.rising}
            </h2>
          </div>
        </article>

        <article className="market-stat">
          <span className="market-stat-icon red">
            <TrendingDown size={19} />
          </span>
          <div>
            <p>Getting destroyed</p>
            <h2 className="market-red">
              {stats.falling}
            </h2>
          </div>
        </article>

        <article className="market-stat">
          <span className="market-stat-icon orange">
            <Zap size={19} />
          </span>
          <div>
            <p>Not moving</p>
            <h2>{stats.stable}</h2>
          </div>
        </article>
      </section>

      {assets.length > 0 && (
        <section className="market-featured">

          <div className="market-featured-card gainer">
            <div className="featured-top">
              <span>🏆 TOP GAINER</span>
              <TrendingUp size={19} />
            </div>

            {biggestGainer && (
              <>
                <h2>{biggestGainer.emoji} {biggestGainer.name}</h2>

                <p>{biggestGainer.symbol}</p>

                <strong>
                  +{Number(biggestGainer.change).toFixed(2)}%
                </strong>

                <small>
                  {Number(biggestGainer.price).toLocaleString("en-IN")} BB
                </small>
              </>
            )}
          </div>

          <div className="market-featured-card loser">
            <div className="featured-top">
              <span>💀 TOP LOSER</span>
              <TrendingDown size={19} />
            </div>

            {biggestLoser && (
              <>
                <h2>{biggestLoser.emoji} {biggestLoser.name}</h2>

                <p>{biggestLoser.symbol}</p>

                <strong>
                  {Number(biggestLoser.change).toFixed(2)}%
                </strong>

                <small>
                  {Number(biggestLoser.price).toLocaleString("en-IN")} BB
                </small>
              </>
            )}
          </div>

        </section>
      )}

      <section className="markets-toolbar">

        <div className="markets-toolbar-title">
          <div>
            <p className="eyebrow">EXPLORE THE MADNESS</p>
            <h2>All markets</h2>
          </div>

          <span className="markets-count">
            {filtered.length} RESULTS
          </span>
        </div>

        <label className="markets-search">
          <Search size={18} />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search Chai, Billi, Chappal..."
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </label>

        <div className="markets-controls">

          <div className="market-filter-label">
            <SlidersHorizontal size={15} />
            FILTER
          </div>

          <div className="market-filter-buttons">
            {[
              ["all", "All"],
              ["up", "🟢 Gainers"],
              ["down", "🔴 Losers"],
              ["stable", "Stable"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  filter === value ? "active" : ""
                }
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="market-sort">
            <ArrowUpDown size={15} />

            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value)
              }
            >
              <option value="popular">Default order</option>
              <option value="gainers">Top gainers</option>
              <option value="losers">Top losers</option>
              <option value="price-high">Highest price</option>
              <option value="price-low">Lowest price</option>
            </select>
          </label>
        </div>

      </section>

      {filtered.length > 0 ? (
        <section className="assets-grid markets-assets-grid">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.symbol}
              asset={asset}
              onTrade={onTrade}
            />
          ))}
        </section>
      ) : (
        <section className="markets-empty">
          <span>🕵️</span>
          <h2>Asset nahi mila, detective ji.</h2>
          <p>
            Try another search or change your filters.
          </p>

          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
              setSort("popular");
            }}
          >
            Reset filters
          </button>
        </section>
      )}

      <footer className="markets-footer">
        <span>⚡ CHAOS EXCHANGE</span>
        <span>{filtered.length} VIRTUAL ASSETS DISPLAYED</span>
        <span>ZERO REAL MONEY</span>
      </footer>

    </div>
  );
}
