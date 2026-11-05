import { useEffect, useRef, useState } from "react";
import {
  Search,
  Wallet,
  LogIn,
  LogOut,
  UserRound,
  X,
  Command,
} from "lucide-react";

export default function Navbar({
  balance = 0,
  user,
  onNavigate,
  onLogin,
  onLogout,
}) {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const formattedBalance = Number(balance || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );

  useEffect(() => {
    function handleKeyDown(event) {
      const isShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k";

      if (isShortcut) {
        event.preventDefault();
        setSearchOpen(true);
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setSearch("");
        searchRef.current?.blur();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleSearch(event) {
    const value = event.target.value;
    setSearch(value);

    if (value.trim()) {
      onNavigate?.("markets");
    }
  }

  function handleBrandClick() {
    setSearch("");
    setSearchOpen(false);
    onNavigate?.("dashboard");
  }

  return (
    <header className="topbar navbar-modern">
      <button
        type="button"
        className="mobile-brand"
        onClick={handleBrandClick}
        aria-label="Go to dashboard"
      >
        <span className="brand-mark">₹</span>
        <span>Satta Bazar</span>
      </button>

      <div className="navbar-search-area">
        <label
          className={`search-box navbar-search ${
            searchOpen ? "search-focused" : ""
          }`}
        >
          <Search size={17} />

          <input
            ref={searchRef}
            type="search"
            aria-label="Search markets"
            placeholder="Search assets, memes, markets..."
            value={search}
            onFocus={() => setSearchOpen(true)}
            onChange={handleSearch}
          />

          {search ? (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => {
                setSearch("");
                searchRef.current?.focus();
              }}
            >
              <X size={14} />
            </button>
          ) : (
            <kbd>
              <Command size={11} />
              K
            </kbd>
          )}
        </label>

        {searchOpen && search.trim() && (
          <div className="navbar-search-hint">
            <Search size={14} />
            <span>
              Searching markets for{" "}
              <strong>{search}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchOpen(false);
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="topbar-actions navbar-actions">
        <div
          className="wallet-pill navbar-wallet"
          title="Your virtual wallet balance"
        >
          <span className="wallet-icon">
            <Wallet size={16} />
          </span>

          <span className="wallet-copy">
            <small>YOUR WALLET</small>
            <strong>{formattedBalance}</strong>
          </span>

          <span className="wallet-currency">COINS</span>
        </div>

        {user ? (
          <div className="navbar-account">
            <div className="navbar-user-info">
              <div className="avatar navbar-avatar">
                {user.username?.charAt(0).toUpperCase() || "?"}
              </div>

              <div className="navbar-user-copy">
                <strong>{user.username}</strong>
                <small>Trader account</small>
              </div>
            </div>

            <button
              type="button"
              className="account-button navbar-account-button"
              onClick={onLogout}
              title="Log out"
            >
              <LogOut size={15} />
              <span>Log out</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="account-button navbar-login-button"
            onClick={onLogin}
          >
            <LogIn size={16} />
            <span>Log in</span>
          </button>
        )}

        {!user && (
          <div className="avatar navbar-avatar guest-avatar">
            <UserRound size={17} />
          </div>
        )}
      </div>
    </header>
  );
}
