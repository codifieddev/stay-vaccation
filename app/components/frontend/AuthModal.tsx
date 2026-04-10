"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
  onAuthSuccess: (role: string, email: string) => void;
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login", onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const router = useRouter();

  // ─── Login State ──────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // ─── Signup State ─────────────────
  const [signupForm, setSignupForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  const updSignup = (k: keyof typeof signupForm, v: string) =>
    setSignupForm((p) => ({ ...p, [k]: v }));

  if (!isOpen) return null;

  // ─── Handlers ─────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.message || "Login failed.");
        setLoginLoading(false);
        return;
      }
      onAuthSuccess(data.role, loginEmail);
      onClose();
      if (data.role === "admin") router.push("/admin");
      else router.refresh();
    } catch {
      setLoginError("Network error. Please try again.");
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError("Passwords do not match.");
      return;
    }
    if (signupForm.password.length < 6) {
      setSignupError("Password must be at least 6 characters.");
      return;
    }
    setSignupLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          phone: signupForm.phone,
          password: signupForm.password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSignupError(data.message || "Registration failed.");
        setSignupLoading(false);
        return;
      }
      onAuthSuccess("user", signupForm.email);
      onClose();
      router.refresh();
    } catch {
      setSignupError("Network error. Please try again.");
      setSignupLoading(false);
    }
  };

  // ─── Shared input styles ──────────
  const inputCls = "w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all placeholder-white/30";
  const inputStyle = { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.13)" };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = "1px solid #2fa3f2";
    e.target.style.boxShadow = "0 0 0 3px rgba(47,163,242,0.18)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = "1px solid rgba(255,255,255,0.13)";
    e.target.style.boxShadow = "none";
  };

  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} tabIndex={-1}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
      style={{ color: "rgba(255,255,255,0.35)" }}>
      {show ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease" }}
      />

      {/* Modal */}
      <div
        className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4"
        style={{ animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <div
          className="rounded-3xl shadow-2xl overflow-hidden w-full"
          style={{
            background: "rgba(15,42,53,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {/* Header row: tabs + close */}
          <div className="flex items-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {/* Tabs */}
            <div className="flex flex-1">
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setLoginError(""); setSignupError(""); }}
                  className="flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all relative"
                  style={{
                    color: tab === t ? "#2fa3f2" : "rgba(255,255,255,0.35)",
                  }}
                >
                  {t === "login" ? "Login" : "Sign Up"}
                  {/* Active underline */}
                  {tab === t && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                      style={{ width: "40px", background: "#2fa3f2" }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="mr-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── LOGIN TAB ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="p-7 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Log into Your Account
                </h2>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Welcome back! Enter your credentials below.
                </p>
              </div>

              {loginError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {loginError}
                </div>
              )}

              <div className="relative">
                <input id="modal-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Email" required autoComplete="email"
                  className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div className="relative">
                <input id="modal-password" type={showLoginPw ? "text" : "password"} value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" required autoComplete="current-password"
                  className={inputCls + " pr-11"} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                <EyeBtn show={showLoginPw} toggle={() => setShowLoginPw((v) => !v)} />
              </div>

              <div className="flex justify-end">
                <a href="/forgot-password" className="text-xs font-semibold transition-colors" style={{ color: "#2fa3f2" }}>
                  Forgot Password?
                </a>
              </div>

              <button type="submit" disabled={loginLoading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #2fa3f2, #1a7abf)", boxShadow: "0 6px 20px rgba(47,163,242,0.35)" }}>
                {loginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in…
                  </span>
                ) : "Login & Continue"}
              </button>

              <p className="text-center text-xs pt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => setTab("signup")} className="font-bold transition-colors" style={{ color: "#2fa3f2" }}>
                  Sign Up
                </button>
              </p>
            </form>
          )}

          {/* ── SIGNUP TAB ── */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} className="p-7 space-y-3.5">
              <div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Create Your Account
                </h2>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Join Stay Vacation and start exploring premium travel.
                </p>
              </div>

              {signupError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {signupError}
                </div>
              )}

              <input type="text" value={signupForm.name} onChange={(e) => updSignup("name", e.target.value)}
                placeholder="Full Name" required autoComplete="name"
                className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />

              <input type="email" value={signupForm.email} onChange={(e) => updSignup("email", e.target.value)}
                placeholder="Email" required autoComplete="email"
                className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />

              <input type="tel" value={signupForm.phone} onChange={(e) => updSignup("phone", e.target.value)}
                placeholder="Phone (optional)" autoComplete="tel"
                className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />

              <div className="relative">
                <input type={showSignupPw ? "text" : "password"} value={signupForm.password}
                  onChange={(e) => updSignup("password", e.target.value)}
                  placeholder="Password" required autoComplete="new-password"
                  className={inputCls + " pr-11"} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                <EyeBtn show={showSignupPw} toggle={() => setShowSignupPw((v) => !v)} />
              </div>

              <div className="relative">
                <input type={showConfirmPw ? "text" : "password"} value={signupForm.confirmPassword}
                  onChange={(e) => updSignup("confirmPassword", e.target.value)}
                  placeholder="Confirm Password" required autoComplete="new-password"
                  className={inputCls + " pr-11"} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                <EyeBtn show={showConfirmPw} toggle={() => setShowConfirmPw((v) => !v)} />
              </div>

              {/* Password match indicator */}
              {signupForm.confirmPassword && (
                <p className="text-xs font-medium flex items-center gap-1"
                  style={{ color: signupForm.password === signupForm.confirmPassword ? "#34d399" : "#f87171" }}>
                  {signupForm.password === signupForm.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}

              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                By joining, you agree to the{" "}
                <a href="/terms" className="underline" style={{ color: "rgba(255,255,255,0.6)" }}>Terms</a>
                {" "}and{" "}
                <a href="/privacy" className="underline" style={{ color: "rgba(255,255,255,0.6)" }}>Privacy Policy</a>.
              </p>

              <button type="submit" disabled={signupLoading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #2fa3f2, #1a7abf)", boxShadow: "0 6px 20px rgba(47,163,242,0.35)" }}>
                {signupLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating account…
                  </span>
                ) : "Sign Up"}
              </button>

              <p className="text-center text-xs pt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("login")} className="font-bold transition-colors" style={{ color: "#2fa3f2" }}>
                  Log In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
