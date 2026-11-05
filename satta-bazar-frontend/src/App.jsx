
import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import NuksaanNawab from "./components/NuksaanNawab";
import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import Leaderboard from "./pages/Leaderboard";
import AuthPage from "./pages/AuthPage";
import TradeHistory from "./pages/TradeHistory";
import {
  getMarketOverview,
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
      const [market, wallet, leaderboard] = await Promise.all([
        getMarketOverview(),
        getWallet(),
        getLeaderboard(),
      ]);

      const rawAssets = market.assets || market.results || [];

      setAssets(
        rawAssets.map((asset) => ({
          ...asset,
          symbol: asset.symbol,
          price: Number(asset.price || 0),
          change: Number(asset.change ?? asset.change_percent ?? 0),
        }))
      );

      setMarketData(market.history || market.market_history || []);
      setMarketPaused(Boolean(market.paused));
      setBalance(Number(wallet.balance ?? wallet.coins ?? 0));

      const players = Array.isArray(leaderboard)
        ? leaderboard
        : leaderboard.results || leaderboard.rankings || [];

      setRankings(players);
      setEvents(market.events || []);
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
        if (active && currentUser) setUser(currentUser);
      } catch {
        if (active) setUser(null);
      }

      if (active) await refresh();
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

  const navigate = (nextPage) => setPage(nextPage);

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
      setAuthError(error.message || "Authentication failed.");
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

      window.dispatchEvent(new Event("portfolio:refresh"));

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
      const { default: Swal } = await import("sweetalert2");

      Swal.fire({
        icon: "error",
        title: "Trade failed",
        text: error.message || "Please try again.",
        background: "#18181b",
        color: "#fff",
      });
    }
  };

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

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-mark">₹</div>
        <h2>Satta Bazar</h2>
        <p>Loading the chaos...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
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
          <Markets assets={assets} onTrade={handleTrade} />
        )}

        {page === "leaderboard" && (
          <Leaderboard rankings={rankings} />
        )}

        {page === "history" && <TradeHistory />}
      </main>

      <NuksaanNawab />

      <footer className="app-footer">
        <span>SATTA BAZAR</span>
        <span>Virtual trading only · Play responsibly</span>
      </footer>
    </div>
  );
}
