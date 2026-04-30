"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/frontend/Navbar";
import Footer from "../components/frontend/Footer";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { signup } from "@/app/store/features/auth/authThunks";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const dispatch = useAppDispatch();
  const { user, loading, error: authError } = useAppSelector(state => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState("");

  const upd = (k: keyof typeof form, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (user) {
      router.replace(user.role === "admin" ? "/admin" : from !== "/signup" ? from : "/");
    }
  }, [user, from, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }
    if (!form.terms) {
      setLocalError("Please accept the terms & conditions to continue.");
      return;
    }

    const result = await dispatch(signup({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    }));
    
    if (signup.fulfilled.match(result)) {
      router.replace(from && from !== "/signup" ? from : "/");
    }
  };

  const currentError = localError || authError;

  const inputStyle = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
  };
  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = "1px solid #2fa3f2";
    e.target.style.boxShadow = "0 0 0 3px rgba(47,163,242,0.15)";
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border = "1px solid rgba(255,255,255,0.12)";
    e.target.style.boxShadow = "none";
  };

  const InputField = ({
    id, label, type = "text", value, onChange, placeholder, required = false, autoComplete,
    suffix,
  }: {
    id: string; label: string; type?: string; value: string; onChange: (v: string) => void;
    placeholder: string; required?: boolean; autoComplete?: string; suffix?: React.ReactNode;
  }) => (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: "rgba(255,255,255,0.55)" }}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} required={required} autoComplete={autoComplete}
          className="w-full pl-4 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
          style={inputStyle}
          onFocus={inputFocus}
          onBlur={inputBlur}
        />
        {suffix && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
    </div>
  );

  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle} tabIndex={-1} className="transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>
      {show ? (
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
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen hero-bg pt-24 pb-16 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 right-1/3 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "rgba(47,163,242,0.07)", filter: "blur(70px)" }} />
        <div className="absolute bottom-1/3 left-1/4 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "rgba(244,249,233,0.04)", filter: "blur(50px)" }} />

        <div className="relative z-10 w-full max-w-lg mx-auto px-4">
          <p className="text-white/40 text-xs text-center mb-6 tracking-widest uppercase">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            {" / "}
            <span className="text-[#2fa3f2]">Create Account</span>
          </p>

          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              Join Stay Vacation
            </h1>
            <p className="text-white/50 text-sm">
              Already have an account?{" "}
              <Link href={`/login${from && from !== "/signup" ? `?from=${encodeURIComponent(from)}` : ""}`}
                className="text-[#2fa3f2] font-semibold hover:underline">
                Sign in →
              </Link>
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              {currentError && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {currentError}
                </div>
              )}

              <InputField id="sv-name" label="Full Name" value={form.name}
                onChange={(v) => upd("name", v)} placeholder="John Doe" required autoComplete="name" />

              <InputField id="sv-email" label="Email Address" type="email" value={form.email}
                onChange={(v) => upd("email", v)} placeholder="you@example.com" required autoComplete="email" />

              <InputField id="sv-phone" label="Phone Number (optional)" type="tel" value={form.phone}
                onChange={(v) => upd("phone", v)} placeholder="+91 98765 43210" autoComplete="tel" />

              <div>
                <label htmlFor="sv-password" className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "rgba(255,255,255,0.55)" }}>Password</label>
                <div className="relative">
                  <input
                    id="sv-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => upd("password", e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    autoComplete="new-password"
                    className="w-full pl-4 pr-11 py-3 rounded-xl text-sm text-white outline-none transition-all"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <EyeBtn show={showPassword} toggle={() => setShowPassword((v) => !v)} />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="sv-confirm" className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "rgba(255,255,255,0.55)" }}>Confirm Password</label>
                <div className="relative">
                  <input
                    id="sv-confirm"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => upd("confirmPassword", e.target.value)}
                    placeholder="Re-enter password"
                    required
                    autoComplete="new-password"
                    className="w-full pl-4 pr-11 py-3 rounded-xl text-sm text-white outline-none transition-all"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <EyeBtn show={showConfirm} toggle={() => setShowConfirm((v) => !v)} />
                  </div>
                </div>
                {form.confirmPassword && (
                  <p className="mt-1.5 text-xs font-medium flex items-center gap-1"
                    style={{ color: form.password === form.confirmPassword ? "#34d399" : "#f87171" }}>
                    {form.password === form.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => upd("terms", e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center transition-all"
                    style={{
                      background: form.terms ? "#2fa3f2" : "rgba(255,255,255,0.07)",
                      border: form.terms ? "1px solid #2fa3f2" : "1px solid rgba(255,255,255,0.2)",
                    }}
                    onClick={() => upd("terms", !form.terms)}
                  >
                    {form.terms && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                  I agree to the{" "}
                  <Link href="/terms" className="text-[#2fa3f2] hover:underline font-medium">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-[#2fa3f2] hover:underline font-medium">Privacy Policy</Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 mt-2"
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
                    Creating account…
                  </span>
                ) : (
                  "Create Account →"
                )}
              </button>
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

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a3f4e]" />}>
      <SignupForm />
    </Suspense>
  );
}
