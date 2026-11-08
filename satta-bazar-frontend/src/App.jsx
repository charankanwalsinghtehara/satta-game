import { useCallback, useEffect, useState } from "react";

import {
  LayoutDashboard,
  CandlestickChart,
  Trophy,
  History,
  Gavel,
  Menu,
  X,
} from "lucide-react";

import Navbar from "./components/Navbar";
import NuksaanNawab from "./components/NuksaanNawab";

import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import Leaderboard from "./pages/Leaderboard";
import AuthPage from "./pages/AuthPage";
import TradeHistory from "./pages/TradeHistory";
import AuctionArena from "./pages/AuctionArena";
import { unlockTradeAudio } from "./utils/tradeSounds";

import {
  getMarketOverview,
  getMarketMovers,
  getLeaderboard,
  getMe,
  getWallet,
  login,
  register,
  logout,
  buyAsset,
  sellAsset,
} from "../services/api";

import "./App.css";

export default function App() {
  const [page, setPage] = useState("dashboard");

  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);

  const [assets, setAssets] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [events, setEvents] = useState([]);

  const [marketPaused, setMarketPaused] = useState(false);
  const [rank, setRank] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication state
  const [authMode, setAuthMode] = useState("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Refresh market, wallet and leaderboard data
  const refresh = useCallback(async () => {
    try {
      const [
        market,
        moversResponse,
        wallet,
        leaderboard,
      ] = await Promise.all([
        getMarketOverview(),
        getMarketMovers(),
        getWallet(),
        getLeaderboard(),
      ]);

      // Market assets
      const rawAssets = Array.isArray(market?.assets)
        ? market.assets
        : Array.isArray(market?.results)
          ? market.results
          : [];

      // Market movers
      const movers = Array.isArray(moversResponse)
        ? moversResponse
        : moversResponse?.movers ||
          moversResponse?.results ||
          [];

      const moversBySymbol = Object.fromEntries(
        movers.map((item) => [
          item.symbol,
          item,
        ])
      );

      // Normalize asset data
      const updatedAssets = rawAssets.map((asset) => {
        const mover =
          moversBySymbol[asset.symbol] || {};

        const currentPrice = Number(
          asset.current_price ??
          mover.price ??
          asset.price ??
          0
        );

        const change = Number(
          mover.change_percent ??
          mover.change ??
          asset.change ??
          0
        );

        return {
          ...asset,

          current_price: currentPrice,
          price: currentPrice,

          change,
          change_percent: Number(
            mover.change_percent ??
            mover.change ??
            asset.change_percent ??
            0
          ),
        };
      });

      setAssets(updatedAssets);

      // Historical market data
      setMarketData(
        market?.history ||
        market?.market_history ||
        []
      );

      // Market status
      setMarketPaused(Boolean(market?.paused));

      // Active events
      setEvents(
        market?.active_events ||
        market?.events ||
        []
      );

      // Wallet balance
      setBalance(
        Number(wallet?.balance ?? wallet?.coins ?? 0)
      );

      // Leaderboard
      const players = Array.isArray(leaderboard)
        ? leaderboard
        : leaderboard?.results ||
          leaderboard?.rankings ||
          [];

      setRankings(players);

    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize application
  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const currentUser = await getMe();

        if (active && currentUser) {
          setUser(
            currentUser.user || currentUser
          );
        }
      } catch {
        if (active) {
          setUser(null);
        }
      }

      if (active) {
        await refresh();
      }
    }

    void initialize();

    // Refresh data every 10 seconds
    const timer = window.setInterval(() => {
      void refresh();
    }, 10000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [refresh]);

  // Navigation
  const navigate = (nextPage) => {
    setPage(nextPage);
    setSidebarOpen(false);
  };

  // Authentication form changes
  const handleAuthChange = (name, value) => {
    setAuthForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Login and registration
  const handleAuth = async (event) => {
    event.preventDefault();

    setAuthBusy(true);
    setAuthError("");

    try {
      const response =
        authMode === "register"
          ? await register(authForm)
          : await login({
              username: authForm.username,
              password: authForm.password,
            });

      setUser(
        response.user || response
      );

      setPage("dashboard");

      await refresh();

    } catch (error) {
      setAuthError(
        error.message ||
        "Authentication failed."
      );
    } finally {
      setAuthBusy(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }

    setUser(null);
    setPage("dashboard");
  };

  // Buy and sell assets
  const handleTrade = async (asset, side) => {
    if (!user) {
      setAuthMode("login");
      setPage("auth");
      return;
    }
    
void unlockTradeAudio();

    try {
      const payload = {
        symbol: asset.symbol,
        quantity: 1,

        idempotency_key:
          `${asset.symbol}-${side}-${Date.now()}-${Math.random()}`,
      };

      const result =
        side === "buy"
          ? await buyAsset(payload)
          : await sellAsset(payload);

      // Notify portfolio components
      window.dispatchEvent(
        new Event("portfolio:refresh")
      );

      await refresh();

      const { showTradePopup } = await import(
        "./components/TradePopup"
      );

      showTradePopup(
        side,
        result.message ||
          `${side === "buy" ? "Bought" : "Sold"} ${asset.symbol} successfully.`
      );

    } catch (error) {
      const { default: Swal } = await import(
        "sweetalert2"
      );

      Swal.fire({
        icon: "error",
        title: "Trade failed",
        text: error.message || "Please try again.",
        background: "#18181b",
        color: "#fff",
      });
    }
  };

  // Login / registration page
  if (page === "auth") {
    return (
      <AuthPage
        mode={authMode}
        form={authForm}
        busy={authBusy}
        error={authError}
        onChange={handleAuthChange}
        onSubmit={handleAuth}
        onModeChange={(mode) => {
          setAuthMode(mode);
          setAuthError("");
        }}
        onBack={() => setPage("dashboard")}
      />
    );
  }

  // Initial loading screen
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-mark">
          ₹
        </div>

        <h2>Satta Bazar</h2>

        <p>Loading the chaos...</p>
      </div>
    );
  }

  // Sidebar navigation
  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      Icon: LayoutDashboard,
    },
    {
      id: "markets",
      label: "Markets",
      Icon: CandlestickChart,
    },
    {
      id: "auction",
      label: "Auction Arena",
      Icon: Gavel,
    },
    {
      id: "leaderboard",
      label: "Leaderboard",
      Icon: Trophy,
    },
    {
      id: "history",
      label: "Trade History",
      Icon: History,
    },
  ];

  return (
    <div className="app-shell">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="mobile-overlay"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        {/* Brand */}
        <div className="brand">

          <div className="brand-mark">
            ₹
          </div>

          <div>
            <strong>SATTA BAZAR</strong>
            <span>THE CHAOS EXCHANGE</span>
          </div>

          <button
            type="button"
            className="close-sidebar"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={19} />
          </button>

        </div>

        <p className="sidebar-label">
          MAIN MENU
        </p>

        {/* Navigation items */}
        <nav className="side-nav">

          {navigationItems.map(
            ({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={`nav-item ${
                  page === id ? "active" : ""
                }`}
                onClick={() => navigate(id)}
              >
                <Icon size={18} />

                <span>
                  {label}
                </span>
              </button>
            )
          )}

        </nav>

        <div className="sidebar-spacer" />

        {/* Sidebar footer */}
        <div className="sidebar-footer">

          <div className="footer-status">
            <span className="live-dot" />
            Market system online
          </div>

          <p>
            Virtual trading only. Play responsibly.
          </p>

          <span className="version-label">
            SATTA BAZAR
          </span>

        </div>

      </aside>

      {/* Main application */}
      <div className="main-column">

        {/* Mobile toolbar */}
        <div className="mobile-toolbar">

          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <span>
            ₹ SATTA BAZAR
          </span>

        </div>

        {/* Top navbar */}
        <Navbar
          balance={balance}
          user={user}
          onNavigate={navigate}
          onLogin={() => {
            setAuthMode("login");
            setPage("auth");
          }}
          onLogout={handleLogout}
        />

        {/* Page content */}
        <main className="main-content">

          {/* Dashboard */}
          {page === "dashboard" && (
            <>
              <Dashboard
                balance={balance}
                assets={assets}
                events={events}
                marketData={marketData}
                marketPaused={marketPaused}
                rank={rank}
                onTrade={handleTrade}
              />

              <TradeHistory />
            </>
          )}

          {/* Markets */}
          {page === "markets" && (
            <Markets
              assets={assets}
              onTrade={handleTrade}
            />
          )}

          {/* Auction Arena */}
          {page === "auction" && (
            <AuctionArena
              user={user}
              balance={balance}
              onLogin={() => {
                setAuthMode("login");
                setPage("auth");
              }}
              onBalanceRefresh={refresh}
            />
          )}

          {/* Leaderboard */}
          {page === "leaderboard" && (
            <Leaderboard
              rankings={rankings}
            />
          )}

          {/* Trade History */}
          {page === "history" && (
            <TradeHistory />
          )}

        </main>

        {/* Existing Nuksaan Nawab assistant */}
        <NuksaanNawab />

      </div>

    </div>
  );
}
