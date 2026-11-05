
import { Coffee, ArrowLeft, ShieldCheck } from "lucide-react";

const styles = `
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 0.85fr;
  color: #f4f4f5;
  background: #10111b;
}
.auth-visual {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 38px 7%;
  background: radial-gradient(ellipse at 20% 25%, #a78bfa25, transparent 45%), #141522;
  border-right: 1px solid #292a3d;
}
.auth-brand { display:flex; align-items:center; gap:12px; }
.auth-brand-mark {
  width:46px;height:46px;display:grid;place-items:center;
  color:#171324;background:#c4b5fd;border-radius:14px;
}
.auth-brand strong,.auth-brand small { display:block; }
.auth-brand small { margin-top:5px;color:#8889a3;font-size:9px;letter-spacing:1px; }
.auth-hero-copy { max-width:580px;margin:auto 0;padding:60px 0; }
.auth-eyebrow { color:#c4b5fd;font-size:10px;font-weight:800;letter-spacing:2px; }
.auth-hero-copy h1 { font-size:clamp(38px,5vw,66px);line-height:1.08;letter-spacing:-2px; }
.auth-hero-copy h1 span { color:#c4b5fd; }
.auth-hero-copy>p { color:#a6a7bc;line-height:1.8; }
.auth-feature-list { display:grid;gap:22px;margin-top:35px; }
.auth-feature-list>div { display:flex;align-items:center;gap:15px; }
.auth-feature-list>div>span { font-size:22px;background:#222337;padding:12px;border-radius:12px; }
.auth-feature-list p,.auth-feature-list strong,.auth-feature-list small { display:block;margin:0; }
.auth-feature-list small { color:#898ba3;margin-top:5px; }
.auth-visual-footer { display:flex;gap:9px;align-items:center;color:#898ba3;font-size:11px; }
.auth-visual-footer svg { color:#4ade80; }
.auth-form-side { display:flex;flex-direction:column;padding:28px clamp(22px,4vw,64px); }
.auth-back-button { display:flex;align-items:center;gap:8px;padding:9px 0;color:#a6a7bc;background:none;border:0;cursor:pointer; }
.auth-form-card { width:100%;max-width:410px;margin:auto;padding:35px 0; }
.auth-mobile-brand { display:none; }
.auth-form-card h2 { margin:12px 0 8px;font-size:36px; }
.auth-form-intro { color:#9293aa;font-size:13px;line-height:1.7; }
.auth-mode-switch { display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:28px 0;padding:5px;background:#1a1b2a;border:1px solid #2d2e42;border-radius:11px; }
.auth-mode-switch button { padding:12px;color:#9293aa;background:none;border:0;border-radius:8px;cursor:pointer; }
.auth-mode-switch button.selected { color:#e8ddff;background:#a78bfa20; }
.auth-form { display:grid;gap:18px; }
.auth-form label { display:grid;gap:9px;color:#c4c4d5;font-size:12px;font-weight:700; }
.auth-form input { width:100%;box-sizing:border-box;min-height:46px;padding:12px;color:#fff;background:#171825;border:1px solid #323348;border-radius:9px;outline:none;font:inherit;font-weight:400; }
.auth-form input:focus { border-color:#a78bfa;box-shadow:0 0 0 3px #a78bfa18; }
.auth-form-error { padding:11px;color:#fda4af;background:#fb71851a;border:1px solid #fb71853d;border-radius:9px;font-size:12px; }
.auth-submit-button { min-height:47px;margin-top:3px;color:#1b1530;background:#c4b5fd;border:0;border-radius:10px;font-weight:800;cursor:pointer; }
.auth-submit-button:disabled { opacity:.6;cursor:wait; }
.auth-switch-copy { margin-top:24px;color:#9293aa;text-align:center;font-size:12px; }
.auth-switch-copy button { color:#c4b5fd;background:none;border:0;font-weight:700;cursor:pointer; }
.auth-small-print { margin-top:30px;color:#71738b;font-size:10px;line-height:1.7;text-align:center; }
@media(max-width:680px) {
 .auth-page { display:block; }
 .auth-visual { display:none; }
 .auth-form-side { min-height:100vh;box-sizing:border-box;padding:20px 23px; }
 .auth-form-card { max-width:430px; }
 .auth-mobile-brand { display:flex;align-items:center;gap:11px;margin-bottom:38px;font-size:12px; }
 .auth-mobile-brand .auth-brand-mark { width:39px;height:39px; }
}
`;

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
    <>
      <style>{styles}</style>

      <main className="auth-page">
        <section className="auth-visual">
          <div className="auth-brand">
            <span className="auth-brand-mark"><Coffee size={25} /></span>
            <span>
              <strong>SATTA BAZAR</strong>
              <small>THE CHAOS EXCHANGE</small>
            </span>
          </div>

          <div className="auth-hero-copy">
            <span className="auth-eyebrow">THE MARKET PLAYGROUND</span>
            <h1>Trade the chaos.<br /><span>Not real money.</span></h1>
            <p>Virtual trading, market memes and Nuksaan Nawab. Maximum drama, zero real-money stakes.</p>

            <div className="auth-feature-list">
              <div><span>📊</span><p><strong>Explore the market</strong><small>Follow prices and virtual positions.</small></p></div>
              <div><span>👑</span><p><strong>Build your rank</strong><small>Compete on the leaderboard.</small></p></div>
              <div><span>🤡</span><p><strong>Survive the roast</strong><small>Nuksaan Nawab is always ready.</small></p></div>
            </div>
          </div>

          <div className="auth-visual-footer">
            <ShieldCheck size={16} />
            Virtual trading only. No real-money trades.
          </div>
        </section>

        <section className="auth-form-side">
          <button type="button" className="auth-back-button" onClick={onBack}>
            <ArrowLeft size={16} /> Back to app
          </button>

          <div className="auth-form-card">
            <div className="auth-mobile-brand">
              <span className="auth-brand-mark"><Coffee size={22} /></span>
              <strong>SATTA BAZAR</strong>
            </div>

            <span className="auth-eyebrow">YOUR VIRTUAL ACCOUNT</span>
            <h2>{isRegister ? "Join the chaos." : "Welcome back."}</h2>
            <p className="auth-form-intro">
              {isRegister
                ? "Create an account and enter the market playground."
                : "Log in and get back to your virtual portfolio."}
            </p>

            <div className="auth-mode-switch">
              <button type="button" className={!isRegister ? "selected" : ""} onClick={() => onModeChange("login")}>Log in</button>
              <button type="button" className={isRegister ? "selected" : ""} onClick={() => onModeChange("register")}>Register</button>
            </div>

            <form className="auth-form" onSubmit={onSubmit}>
              <label>
                Username
                <input name="username" type="text" autoComplete="username" placeholder="Enter your username" required maxLength={150} value={form.username} onChange={(e) => onChange("username", e.target.value)} />
              </label>

              {isRegister && (
                <label>
                  Email address
                  <input name="email" type="email" autoComplete="email" placeholder="you@example.com" required value={form.email} onChange={(e) => onChange("email", e.target.value)} />
                </label>
              )}

              <label>
                Password
                <input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} placeholder={isRegister ? "Create a password" : "Enter your password"} required value={form.password} onChange={(e) => onChange("password", e.target.value)} />
              </label>

              {error && <div className="auth-form-error" role="alert">{error}</div>}

              <button className="auth-submit-button" type="submit" disabled={busy}>
                {busy ? "Please wait..." : isRegister ? "Create account" : "Log in"}
              </button>
            </form>

            <p className="auth-switch-copy">
              {isRegister ? "Already have an account?" : "New to Satta Bazar?"}{" "}
              <button type="button" onClick={() => onModeChange(isRegister ? "login" : "register")}>
                {isRegister ? "Log in" : "Create an account"}
              </button>
            </p>

            <p className="auth-small-print">
              By continuing, you agree to use this demo for virtual trading only.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
