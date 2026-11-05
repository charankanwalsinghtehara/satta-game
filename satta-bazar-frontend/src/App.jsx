
import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  CandlestickChart,
  Trophy,
  History,
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

  const [authMode, setAuthMode] = useState("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const refresh = useCallback(async () => {
    try {
      const [market, moversResponse, wallet, leaderboard] =
        await Promise.all([
          getMarketOverview(),
          getMarketMovers(),
          getWallet(),
          getLeaderboard(),
        ]);

      // Backend market overview returns assets with current_price.
      const rawAssets = Array.isArray(market?.assets)
        ? market.assets
        : Array.isArray(market?.results)
          ? market.results
          : [];

      // Backend market movers returns { movers: [...] }.
      const movers = Array.isArray(moversResponse)
        ? moversResponse
        : moversResponse?.movers ||
          moversResponse?.results ||
          [];

      const moversBySymbol = Object.fromEntries(
        movers.map((item) => [item.symbol, item])
      );

      const updatedAssets = rawAssets.map((asset) => {
        const mover = moversBySymbol[asset.symbol] || {};

        return {
          ...asset,

          // Keep both names so existing components can use either.
          current_price: Number(
            asset.current_price ??
            mover.price ??
            asset.price ??
            0
          ),

          price: Number(
            asset.current_price ??
            mover.price ??
            asset.price ??
            0
          ),

          change: Number(
            mover.change_percent ??
            mover.change ??
            asset.change ??
            0
          ),

          change_percent: Number(
            mover.change_percent ??
            mover.change ??
            asset.change_percent ??
            0
          ),
        };
      });

      setAssets(updatedAssets);

      setMarketData(
        market?.history ||
        market?.market_history ||
        []
      );

      setMarketPaused(Boolean(market?.paused));

      setEvents(
        market?.active_events ||
        market?.events ||
        []
      );

      setBalance(
        Number(wallet?.balance ?? wallet?.coins ?? 0)
      );

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

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const currentUser = await getMe();

        if (active && currentUser) {
          setUser(currentUser.user || currentUser);
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

    const timer = window.setInterval(() => {
      void refresh();
    }, 10000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [refresh]);

  const navigate = (nextPage) => {
    setPage(nextPage);
    setSidebarOpen(false);
  };

  const handleAuthChange = (name, value) => {
    setAuthForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

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

      setUser(response.user || response);
      setPage("dashboard");

      await refresh();
    } catch (error) {
      setAuthError(
        error.message || "Authentication failed."
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }

    setUser(null);
    setPage("dashboard");
  };

  const handleTrade = async (asset, side) => {
    if (!user) {
      setAuthMode("login");
      setPage("auth");
      return;
    }

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

  // Authentication page
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
        <div className="loading-mark">₹</div>
        <h2>Satta Bazar</h2>
        <p>Loading the chaos...</p>
      </div>
    );
  }

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
        <div className="brand">
          <div className="brand-mark">₹</div>

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

        <p className="sidebar-label">MAIN MENU</p>

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
                <span>{label}</span>
              </button>
            )
          )}
        </nav>

        <div className="sidebar-spacer" />

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

      {/* Main content */}
      <div className="main-column">

        {/* Mobile menu bar */}
        <div className="mobile-toolbar">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <span>₹ SATTA BAZAR</span>
        </div>

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

        <main className="main-content">
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

          {page === "markets" && (
            <Markets
              assets={assets}
              onTrade={handleTrade}
            />
          )}

          {page === "leaderboard" && (
            <Leaderboard
              rankings={rankings}
            />
          )}

          {page === "history" && (
            <TradeHistory />
          )}
        </main>

        {/* Bot intentionally left untouched */}
        <NuksaanNawab />

        <footer className="app-footer">
          <span>SATTA BAZAR</span>
          <span>
            Virtual trading only · Play responsibly
          </span>
        </footer>
      </div>
    </div>
  );
}
