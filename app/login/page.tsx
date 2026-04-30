"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/frontend/Navbar";
import Footer from "../components/frontend/Footer";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { login, checkAuth } from "@/app/store/features/auth/authThunks";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const dispatch = useAppDispatch();
  const { user, loading, error: authError } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (user) {
      router.replace(user.role === "admin" ? "/admin" : from !== "/login" ? from : "/");
    }
  }, [user, from, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      if (result.payload.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace(from && from !== "/login" ? from : "/");
      }
    }
  };

  const currentError = localError || authError;

  return (
    <>
      <Navbar />
      <div className="min-h-screen hero-bg pt-24 pb-16 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "rgba(47,163,242,0.07)", filter: "blur(70px)" }} />
        <div className="absolute bottom-1/3 left-1/4 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "rgba(244,249,233,0.04)", filter: "blur(50px)" }} />

        <div className="relative z-10 w-full max-w-md mx-auto px-4">
          <p className="text-white/40 text-xs text-center mb-6 tracking-widest uppercase">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            {" / "}
            <span className="text-[#2fa3f2]">Sign In</span>
          </p>

          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-white/50 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href={`/signup${from && from !== "/login" ? `?from=${encodeURIComponent(from)}` : ""}`}
                className="text-[#2fa3f2] font-semibold hover:underline"
              >
                Create one free →
              </Link>
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {currentError && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {currentError}
                </div>
              )}

              <div>
                <label htmlFor="sv-email" className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="sv-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                    onFocus={(e) => { e.target.style.border = "1px solid #2fa3f2"; e.target.style.boxShadow = "0 0 0 3px rgba(47,163,242,0.15)"; }}
                    onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="sv-password" className="block text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-medium transition-colors" style={{ color: "rgba(47,163,242,0.8)" }}>
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="sv-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                    onFocus={(e) => { e.target.style.border = "1px solid #2fa3f2"; e.target.style.boxShadow = "0 0 0 3px rgba(47,163,242,0.15)"; }}
                    onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
                style={{
                  background: "linear-gradient(135deg, #2fa3f2, #1a7abf)",
                  boxShadow: "0 8px 24px rgba(47,163,242,0.35)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  "Sign In →"
                )}
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>or</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              </div>

              <Link
                href={`/signup${from && from !== "/login" ? `?from=${encodeURIComponent(from)}` : ""}`}
                className="block w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                Create a new account
              </Link>
            </form>
          </div>

          <p className="text-center mt-6 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            🔒 Secure, encrypted connection · © 2025 Stay Vacation
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 52C120 44 240 28 360 22C480 16 600 22 720 27C840 32 960 38 1080 38C1200 38 1320 32 1380 29L1440 27V60H0Z" fill="white" />
          </svg>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a3f4e]" />}>
      <LoginForm />
    </Suspense>
  );
}
