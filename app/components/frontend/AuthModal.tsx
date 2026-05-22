"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { login, signup } from "@/app/store/features/auth/authThunks";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
  <button type="button" onClick={toggle} tabIndex={-1}
    className="absolute right-4.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-all duration-200 cursor-pointer p-1 rounded-lg hover:bg-white/5">
    {show ? (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943-9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}
  </button>
);

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error: authError } = useAppSelector(state => state.auth);

  // ─── Login State ──────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [localError, setLocalError] = useState("");

  // ─── Signup State ─────────────────
  const [signupForm, setSignupForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const updSignup = (k: keyof typeof signupForm, v: string) =>
    setSignupForm((p) => ({ ...p, [k]: v }));

  if (!isOpen) return null;

  // ─── Handlers ─────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    const result = await dispatch(login({ email: loginEmail, password: loginPassword }));
    if (login.fulfilled.match(result)) {
      onClose();
      if (result.payload.role === "admin") router.push("/admin");
      else router.refresh();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (signupForm.password !== signupForm.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (signupForm.password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }
    const result = await dispatch(signup({
      name: signupForm.name,
      email: signupForm.email,
      phone: signupForm.phone,
      password: signupForm.password,
    }));
    if (signup.fulfilled.match(result)) {
      onClose();
      router.refresh();
    }
  };

  const currentError = localError || authError;
  const inputCls = "w-full px-4.5 py-3.5 rounded-2xl text-sm bg-white/5 border border-white/10 text-white outline-none placeholder:text-white/30 hover:border-white/15 focus:border-sky-400/80 focus:bg-white/8 focus:ring-4 focus:ring-sky-400/10 transition-all duration-300 font-['Plus_Jakarta_Sans',sans-serif]";

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
        style={{ animation: "fadeIn 0.25s ease-out" }}
      />

      <div
        className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-auto px-4"
        style={{ animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <div className="rounded-[2.5rem] bg-[#0c1e26]/90 backdrop-blur-2xl border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.4)] overflow-hidden w-full transition-all duration-300">
          
          <div className="flex items-center border-b border-white/5 bg-black/10">
            <div className="flex flex-1">
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setLocalError(""); }}
                  className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all duration-300 relative font-['Poppins',sans-serif] ${
                    tab === t ? "text-sky-400" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {t === "login" ? "Login" : "Sign Up"}
                  {tab === t && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.75 w-10 bg-sky-400 rounded-full shadow-[0_1px_8px_rgba(56,189,248,0.5)] animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="mr-5 w-8.5 h-8.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {tab === "login" && (
            <form onSubmit={handleLogin} className="p-8 space-y-5">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight font-['Poppins',sans-serif]">
                  Welcome Back
                </h2>
                <p className="text-xs text-white/50 mt-1.5 font-medium leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                  Welcome back! Enter your credentials below to access premium travels.
                </p>
              </div>

              {currentError && (
                <div className="flex items-start gap-2.5 px-4.5 py-3 rounded-2xl text-xs bg-red-500/10 border border-red-500/20 text-red-300 font-semibold tracking-wide shadow-sm">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{currentError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block font-['Poppins',sans-serif]">Email Address</label>
                <div className="relative">
                  <input id="modal-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com" required autoComplete="email"
                    className={inputCls} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block font-['Poppins',sans-serif]">Password</label>
                  <a href="/forgot-password" className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors font-['Plus_Jakarta_Sans',sans-serif]">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <input id="modal-password" type={showLoginPw ? "text" : "password"} value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password"
                    className={inputCls + " pr-11"} />
                  <EyeBtn show={showLoginPw} toggle={() => setShowLoginPw((v) => !v)} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-sky-400 to-blue-600 shadow-[0_4px_16px_rgba(74,144,226,0.25)] hover:shadow-[0_6px_22px_rgba(74,144,226,0.35)] hover:scale-[1.015] hover:brightness-105 active:scale-[0.985] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins',sans-serif] mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Login & Continue"}
              </button>

              <p className="text-center text-xs text-white/40 pt-1 font-medium font-['Plus_Jakarta_Sans',sans-serif]">
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => setTab("signup")} className="font-bold text-sky-400 hover:text-sky-300 transition-colors">
                  Sign Up
                </button>
              </p>
            </form>
          )}

          {tab === "signup" && (
            <form onSubmit={handleSignup} className="p-8 space-y-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight font-['Poppins',sans-serif]">
                  Create Your Account
                </h2>
                <p className="text-xs text-white/50 mt-1.5 font-medium leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                  Join Stay Vacation and start exploring premium travel collections.
                </p>
              </div>

              {currentError && (
                <div className="flex items-start gap-2.5 px-4.5 py-3 rounded-2xl text-xs bg-red-500/10 border border-red-500/20 text-red-300 font-semibold tracking-wide shadow-sm">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{currentError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block font-['Poppins',sans-serif]">Full Name</label>
                <input type="text" value={signupForm.name} onChange={(e) => updSignup("name", e.target.value)}
                  placeholder="John Doe" required autoComplete="name" className={inputCls} />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block font-['Poppins',sans-serif]">Email Address</label>
                <input type="email" value={signupForm.email} onChange={(e) => updSignup("email", e.target.value)}
                  placeholder="you@example.com" required autoComplete="email" className={inputCls} />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block font-['Poppins',sans-serif]">Phone (optional)</label>
                <input type="tel" value={signupForm.phone} onChange={(e) => updSignup("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000" autoComplete="tel" className={inputCls} />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block font-['Poppins',sans-serif]">Password</label>
                <div className="relative">
                  <input type={showSignupPw ? "text" : "password"} value={signupForm.password}
                    onChange={(e) => updSignup("password", e.target.value)}
                    placeholder="Min 6 characters" required autoComplete="new-password"
                    className={inputCls + " pr-11"} />
                  <EyeBtn show={showSignupPw} toggle={() => setShowSignupPw((v) => !v)} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block font-['Poppins',sans-serif]">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirmPw ? "text" : "password"} value={signupForm.confirmPassword}
                    onChange={(e) => updSignup("confirmPassword", e.target.value)}
                    placeholder="••••••••" required autoComplete="new-password"
                    className={inputCls + " pr-11"} />
                  <EyeBtn show={showConfirmPw} toggle={() => setShowConfirmPw((v) => !v)} />
                </div>
                {signupForm.confirmPassword && (
                  <p className="text-xs font-semibold flex items-center gap-1.5 mt-1.5 font-['Plus_Jakarta_Sans',sans-serif]"
                    style={{ color: signupForm.password === signupForm.confirmPassword ? "#34d399" : "#f87171" }}>
                    {signupForm.password === signupForm.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              <p className="text-xs text-white/40 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif] pt-1">
                By joining, you agree to the{" "}
                <a href="/pages/terms-of-service" className="underline text-white/60 hover:text-white transition-colors">Terms</a>
                {" "}and{" "}
                <a href="/pages/privacy-policy" className="underline text-white/60 hover:text-white transition-colors">Privacy Policy</a>.
              </p>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-sky-400 to-blue-600 shadow-[0_4px_16px_rgba(74,144,226,0.25)] hover:shadow-[0_6px_22px_rgba(74,144,226,0.35)] hover:scale-[1.015] hover:brightness-105 active:scale-[0.985] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-['Poppins',sans-serif] mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating account...
                  </span>
                ) : "Sign Up"}
              </button>

              <p className="text-center text-xs text-white/40 pt-1 font-medium font-['Plus_Jakarta_Sans',sans-serif]">
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("login")} className="font-bold text-sky-400 hover:text-sky-300 transition-colors">
                  Log In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
