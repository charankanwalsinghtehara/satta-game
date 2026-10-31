
import { Coffee, ArrowLeft, ShieldCheck } from "lucide-react";
import "./AuthPage.css";

export default function AuthPage({
  mode,
  form,
  busy,
  error,
  onChange,
  onSubmit,
  onModeChange,
  onBack,
}) {
  const isRegister = mode === "register";

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand">
          <span className="auth-brand-mark">
            <Coffee size={25} />
          </span>
          <span>
            <strong>SATTA BAZAR</strong>
            <small>THE CHAOS EXCHANGE</small>
          </span>
        </div>

        <div className="auth-hero-copy">
          <span className="auth-eyebrow">THE MARKET PLAYGROUND</span>
          <h1>
            Trade the chaos.
            <br />
            <span>Not real money.</span>
          </h1>
          <p>
            Virtual trading, market memes and Nuksaan Nawab.
            Maximum drama, zero real-money stakes.
          </p>

          <div className="auth-feature-list">
            <div>
              <span>📊</span>
              <p>
                <strong>Explore the market</strong>
                <small>Follow prices and virtual positions.</small>
              </p>
            </div>

            <div>
              <span>👑</span>
              <p>
                <strong>Build your rank</strong>
                <small>Compete on the leaderboard.</small>
              </p>
            </div>

            <div>
              <span>🤡</span>
              <p>
                <strong>Survive the roast</strong>
                <small>Nuksaan Nawab is always ready.</small>
              </p>
            </div>
          </div>
        </div>

        <div className="auth-visual-footer">
          <ShieldCheck size={16} />
          <span>Virtual trading only. No real-money trades.</span>
        </div>
      </section>

      <section className="auth-form-side">
        <button
          type="button"
          className="auth-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Back to app
        </button>

        <div className="auth-form-card">
          <div className="auth-mobile-brand">
            <span className="auth-brand-mark">
              <Coffee size={22} />
            </span>
            <strong>SATTA BAZAR</strong>
          </div>

          <span className="auth-eyebrow">
            YOUR VIRTUAL ACCOUNT
          </span>

          <h2>
            {isRegister ? "Join the chaos." : "Welcome back."}
          </h2>

          <p className="auth-form-intro">
            {isRegister
              ? "Create an account and enter the market playground."
              : "Log in and get back to your virtual portfolio."}
          </p>

          <div className="auth-mode-switch">
            <button
              type="button"
              className={!isRegister ? "selected" : ""}
              onClick={() => onModeChange("login")}
            >
              Log in
            </button>

            <button
              type="button"
              className={isRegister ? "selected" : ""}
              onClick={() => onModeChange("register")}
            >
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={onSubmit}>
            <label>
              Username
              <input
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                required
                maxLength={150}
                value={form.username}
                onChange={(event) =>
                  onChange("username", event.target.value)
                }
              />
            </label>

            {isRegister && (
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={(event) =>
                    onChange("email", event.target.value)
                  }
                />
              </label>
            )}

            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={
                  isRegister ? "new-password" : "current-password"
                }
                placeholder={
                  isRegister
                    ? "Create a password"
                    : "Enter your password"
                }
                required
                value={form.password}
                onChange={(event) =>
                  onChange("password", event.target.value)
                }
              />
            </label>

            {error && (
              <div className="auth-form-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="auth-submit-button"
              type="submit"
              disabled={busy}
            >
              {busy
                ? "Please wait..."
                : isRegister
                  ? "Create account"
                  : "Log in"}
            </button>
          </form>

          <p className="auth-switch-copy">
            {isRegister
              ? "Already have an account?"
              : "New to Satta Bazar?"}{" "}
            <button
              type="button"
              onClick={() =>
                onModeChange(isRegister ? "login" : "register")
              }
            >
              {isRegister ? "Log in" : "Create an account"}
            </button>
          </p>

          <p className="auth-small-print">
            By continuing, you agree to use this demo for virtual
            trading only. Market outcomes are not guaranteed.
          </p>
        </div>
      </section>
    </main>
  );
}
