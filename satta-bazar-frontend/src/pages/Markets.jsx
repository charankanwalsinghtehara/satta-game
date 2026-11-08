import { useEffect, useMemo, useState } from "react";

import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  SlidersHorizontal,
  ArrowUpDown,
  Zap,
  X,
  RefreshCw,
  BarChart3,
  Clock,
} from "lucide-react";

import AssetCard from "../components/AssetCard";
import MarketChart from "../components/MarketChart";
import MarketComparisonChart from "../components/MarketComparisonChart";

import { getAssetHistory } from "../../services/api";

import "./Markets.css";

const formatPrice = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

export default function Markets({
  assets = [],
  onTrade,
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("popular");

  // Historical chart state
  const [selectedSymbol, setSelectedSymbol] = useState(
    assets[0]?.symbol || ""
  );

  const [selectedHistory, setSelectedHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Keep selected asset valid when market assets change
  useEffect(() => {
    if (!assets.length) {
      setSelectedSymbol("");
      return;
    }

    const selectedStillExists = assets.some(
      (asset) => asset.symbol === selectedSymbol
    );

    if (!selectedStillExists) {
      setSelectedSymbol(assets[0].symbol);
    }
  }, [assets, selectedSymbol]);

  // Load selected asset history
  useEffect(() => {
    if (!selectedSymbol) {
      setSelectedHistory([]);
      setHistoryError("");
      setHistoryLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadHistory() {
      setHistoryLoading(true);
      setHistoryError("");

      try {
        const response = await getAssetHistory(selectedSymbol);

        if (cancelled) return;

        const records = Array.isArray(response)
          ? response
          : response?.results ||
            response?.history ||
            response?.data ||
            [];

        setSelectedHistory(
          Array.isArray(records) ? records : []
        );
      } catch (error) {
        if (cancelled) return;

        setSelectedHistory([]);

        setHistoryError(
          error.message ||
            "Unable to load historical prices."
        );
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [selectedSymbol]);

  // Market statistics
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

  // Search, filter and sort
  const filtered = useMemo(() => {
    let result = assets.filter((asset) => {
      const searchableText = [
        asset.name,
        asset.symbol,
        asset.joke,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(
        query.toLowerCase().trim()
      );

      const change = Number(asset.change || 0);

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
        (a, b) =>
          Number(b.change || 0) -
          Number(a.change || 0)
      );
    } else if (sort === "losers") {
      result.sort(
        (a, b) =>
          Number(a.change || 0) -
          Number(b.change || 0)
      );
    } else if (sort === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    } else if (sort === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    return result;
  }, [assets, query, filter, sort]);

  // Biggest gainer
  const biggestGainer = useMemo(
    () =>
      assets.reduce(
        (best, asset) =>
          !best ||
          Number(asset.change || 0) >
            Number(best.change || 0)
            ? asset
            : best,
        null
      ),
    [assets]
  );

  // Biggest loser
  const biggestLoser = useMemo(
    () =>
      assets.reduce(
        (worst, asset) =>
          !worst ||
          Number(asset.change || 0) <
            Number(worst.change || 0)
            ? asset
            : worst,
        null
      ),
    [assets]
  );

  // Selected asset
  const selectedAsset = useMemo(
    () =>
      assets.find(
        (asset) => asset.symbol === selectedSymbol
      ) || null,
    [assets, selectedSymbol]
  );

  // Reload history manually
  const reloadHistory = async () => {
    if (!selectedSymbol) return;

    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await getAssetHistory(selectedSymbol);

      const records = Array.isArray(response)
        ? response
        : response?.results ||
          response?.history ||
          response?.data ||
          [];

      setSelectedHistory(
        Array.isArray(records) ? records : []
      );
    } catch (error) {
      setHistoryError(
        error.message ||
          "Unable to refresh historical prices."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setQuery("");
    setFilter("all");
    setSort("popular");
  };

  return (
    <div className="page-stack markets-page">

      {/* =========================================
          HERO
      ========================================= */}

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
            <span>📊 PRICE CHARTS</span>
            <span>🪙 VIRTUAL TRADING</span>
          </div>

        </div>

        <div className="markets-hero-decoration">
          <div className="markets-big-icon">
            📈
          </div>

          <div className="markets-floating-icon">
            💸
          </div>

          <div className="markets-floating-icon second">
            🚀
          </div>
        </div>

      </section>


      {/* =========================================
          MARKET STATISTICS
      ========================================= */}

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


      {/* =========================================
          TOP GAINER AND LOSER
      ========================================= */}

      {assets.length > 0 && (
        <section className="market-featured">

          <div className="market-featured-card gainer">

            <div className="featured-top">
              <span>🏆 TOP GAINER</span>
              <TrendingUp size={19} />
            </div>

            {biggestGainer && (
              <>
                <h2>
                  {biggestGainer.emoji}{" "}
                  {biggestGainer.name}
                </h2>

                <p>{biggestGainer.symbol}</p>

                <strong>
                  {Number(biggestGainer.change || 0) > 0
                    ? "+"
                    : ""}
                  {Number(
                    biggestGainer.change || 0
                  ).toFixed(2)}
                  %
                </strong>

                <small>
                  {formatPrice(biggestGainer.price)} BB
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
                <h2>
                  {biggestLoser.emoji}{" "}
                  {biggestLoser.name}
                </h2>

                <p>{biggestLoser.symbol}</p>

                <strong>
                  {Number(
                    biggestLoser.change || 0
                  ).toFixed(2)}
                  %
                </strong>

                <small>
                  {formatPrice(biggestLoser.price)} BB
                </small>
              </>
            )}

          </div>

        </section>
      )}


      {/* =========================================
          CHART SECTION
      ========================================= */}

      <section className="market-charts-grid">

        {/* Current price comparison */}

        <article className="panel market-chart-panel">

          <div className="panel-heading">

            <div>
              <p className="eyebrow">
                MARKET OVERVIEW
              </p>

              <h2>
                <BarChart3
                  size={19}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 7,
                  }}
                />

                Asset price comparison
              </h2>
            </div>

            <span className="markets-count">
              TOP 12
            </span>

          </div>

          <p className="muted small">
            Compare current virtual prices across assets.
          </p>

          <MarketComparisonChart
            assets={assets}
          />

        </article>


        {/* Historical price chart */}

        <article className="panel market-chart-panel">

          <div className="panel-heading">

            <div>
              <p className="eyebrow">
                PRICE HISTORY
              </p>

              <h2>
                <TrendingUp
                  size={19}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 7,
                  }}
                />

                Asset performance
              </h2>
            </div>

            <button
              type="button"
              className="market-chart-refresh"
              onClick={reloadHistory}
              disabled={!selectedSymbol || historyLoading}
              aria-label="Refresh price history"
              title="Refresh price history"
            >
              <RefreshCw
                size={16}
                className={
                  historyLoading ? "spin" : ""
                }
              />
            </button>

          </div>


          {/* Asset selector */}

          <div className="market-history-controls">

            <label
              htmlFor="market-history-asset"
              className="market-history-label"
            >
              SELECT ASSET
            </label>

            <select
              id="market-history-asset"
              className="market-history-select"
              value={selectedSymbol}
              onChange={(event) =>
                setSelectedSymbol(event.target.value)
              }
              disabled={!assets.length}
            >
              {assets.map((asset) => (
                <option
                  key={asset.symbol}
                  value={asset.symbol}
                >
                  {asset.name} ({asset.symbol})
                </option>
              ))}
            </select>

          </div>


          {/* Selected asset price */}

          {selectedAsset && (
            <div className="market-history-summary">

              <div>
                <span className="market-history-asset-name">
                  {selectedAsset.emoji}{" "}
                  {selectedAsset.name}
                </span>

                <strong>
                  {formatPrice(selectedAsset.price)} BB
                </strong>
              </div>

              <span
                className={
                  Number(selectedAsset.change || 0) >= 0
                    ? "market-green"
                    : "market-red"
                }
              >
                {Number(selectedAsset.change || 0) > 0
                  ? "+"
                  : ""}
                {Number(
                  selectedAsset.change || 0
                ).toFixed(2)}
                %
              </span>

            </div>
          )}


          {/* History chart */}

          {historyLoading ? (

            <div className="chart-empty">
              <RefreshCw
                size={24}
                className="spin"
              />

              <p>
                Loading historical prices...
              </p>
            </div>

          ) : historyError ? (

            <div className="chart-empty chart-error">
              <span>⚠️</span>

              <p>{historyError}</p>

              <button
                type="button"
                onClick={reloadHistory}
              >
                Try again
              </button>
            </div>

          ) : selectedHistory.length > 0 ? (

            <MarketChart
              data={selectedHistory}
              height={225}
            />

          ) : (

            <div className="chart-empty">
              <Clock size={25} />

              <p>
                No historical snapshots available yet.
              </p>

              <small>
                Price history will appear after the backend
                records market snapshots.
              </small>
            </div>

          )}

        </article>

      </section>


      {/* =========================================
          SEARCH AND FILTER TOOLBAR
      ========================================= */}

      <section className="markets-toolbar">

        <div className="markets-toolbar-title">

          <div>
            <p className="eyebrow">
              EXPLORE THE MADNESS
            </p>

            <h2>All markets</h2>
          </div>

          <span className="markets-count">
            {filtered.length} RESULTS
          </span>

        </div>


        {/* Search */}

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


        {/* Filters and sorting */}

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


          {/* Sorting */}

          <label className="market-sort">

            <ArrowUpDown size={15} />

            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value)
              }
            >
              <option value="popular">
                Default order
              </option>

              <option value="gainers">
                Top gainers
              </option>

              <option value="losers">
                Top losers
              </option>

              <option value="price-high">
                Highest price
              </option>

              <option value="price-low">
                Lowest price
              </option>

            </select>

          </label>

        </div>

      </section>


      {/* =========================================
          ASSET GRID
      ========================================= */}

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

          <h2>
            Asset nahi mila, detective ji.
          </h2>

          <p>
            Try another search or change your filters.
          </p>

          <button
            type="button"
            onClick={resetFilters}
          >
            Reset filters
          </button>

        </section>

      )}


      {/* =========================================
          FOOTER
      ========================================= */}

      <footer className="markets-footer">

        <span>⚡ CHAOS EXCHANGE</span>

        <span>
          {filtered.length} VIRTUAL ASSETS DISPLAYED
        </span>

        <span>ZERO REAL MONEY</span>

      </footer>

    </div>
  );
}
