"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthModal from "./AuthModal";
import CurrencyModal from "./CurrencyModal";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { logout } from "@/app/store/features/auth/authThunks";
import { setCurrency } from "@/app/store/features/currency/currencySlice";
import { fetchCurrencies } from "@/app/store/features/currency/currencyThunks";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/packages", label: "Packages" },
  { href: "/categories", label: "Categories" },
  { href: "/destinations", label: "Locations" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, authChecked } = useAppSelector((state) => state.auth);
  const { settings } = useAppSelector((state) => state.businessSettings);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const selectedCurrency = useAppSelector((state) => state.currency.selectedCurrency);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check route change effects
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setCurrencyMenuOpen(false);
  }, [pathname]);

  const { currencies } = useAppSelector(state => state.currency);
  useEffect(() => {
    if (currencies.length === 0) {
      dispatch(fetchCurrencies());
    }
  }, [dispatch, currencies.length]);

  const handleLogout = async () => {
    await dispatch(logout());
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const isHome = pathname === "/";
  const initial = user?.email?.[0]?.toUpperCase() || "U";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHome
            ? "bg-[#1a3f4e]/95 backdrop-blur-xl shadow-lg shadow-[#1a3f4e]/20"
            : "bg-transparent"
        }`}
      >
        <div className="container-sv">
          <div className="flex items-center justify-between h-18 py-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              {settings?.logo ? (
                <img src={settings.logo} alt="Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2fa3f2] to-[#1a7abf] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <div>
                <div className="text-white font-bold text-lg leading-none tracking-tight">{settings?.businessName || "Stay Vacation"}</div>
                <div className="text-[#2fa3f2] text-xs font-medium">Premium Travel</div>
              </div>
            </Link>

            <nav className="hidden lg:absolute lg:left-1/2 lg:-translate-x-1/2 md:flex items-center gap-1 lg:gap-2">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active ? "bg-[#2fa3f2]/20 text-[#2fa3f2]" : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/packages"
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-[#2fa3f2] hover:bg-[#1a8fd8] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-[#2fa3f2]/30 hover:-translate-y-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explore
              </Link>

              {/* Currency Picker */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setCurrencyMenuOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <span className="text-base leading-none">{selectedCurrency.flag}</span>
                  <span>{selectedCurrency.code} {selectedCurrency.symbol}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${currencyMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              {authChecked && (
                <>
                  {user ? (
                    <div className="relative hidden md:block">
                      <button
                        onClick={() => setUserMenuOpen((v) => !v)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/10"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#2fa3f2] flex items-center justify-center text-white text-sm font-bold shadow">
                          {initial}
                        </div>
                        <svg className={`w-4 h-4 text-white/60 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {userMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-2xl overflow-hidden z-50"
                          style={{ background: "#152e3a", border: "1px solid rgba(255,255,255,0.12)" }}>
                          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                            <p className="text-xs font-bold text-white truncate">{user.email}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1"
                              style={{
                                background: user.role === "admin" ? "rgba(251,191,36,0.18)" : "rgba(47,163,242,0.18)",
                                color: user.role === "admin" ? "#fbbf24" : "#2fa3f2",
                              }}>
                              {user.role === "admin" ? "⭐ Admin" : "👤 Member"}
                            </span>
                          </div>
                          {user.role === "admin" && (
                            <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Admin Panel
                            </Link>
                          )}
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      id="navbar-login-btn"
                      onClick={() => setModalOpen(true)}
                      className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        border: "1px solid rgba(255,255,255,0.20)",
                        color: "white",
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Login
                    </button>
                  )}
                </>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}

      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <CurrencyModal
        isOpen={currencyMenuOpen}
        onClose={() => setCurrencyMenuOpen(false)}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={(curr) => dispatch(setCurrency(curr))}
      />

      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-72 bg-[#1a3f4e] shadow-2xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="p-6 pt-20 space-y-2">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? "bg-[#2fa3f2]/20 text-[#2fa3f2]" : "text-white/80 hover:text-white hover:bg-white/10"}`}>
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {/* Mobile Currency Picker */}
              <div className="space-y-1">
                <button
                  onClick={() => setCurrencyMenuOpen(true)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all text-white/80 hover:text-white hover:bg-white/10"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{selectedCurrency.flag}</span>
                    <span>{selectedCurrency.code} {selectedCurrency.symbol}</span>
                  </span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${currencyMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              <Link href="/packages"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full px-4 py-3 bg-[#2fa3f2] text-white font-semibold rounded-xl">
                Explore Packages
              </Link>

              {authChecked && (
                user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="w-8 h-8 rounded-full bg-[#2fa3f2] flex items-center justify-center text-white text-sm font-bold">{initial}</div>
                      <div>
                        <p className="text-white text-xs font-semibold truncate max-w-[150px]">{user.email}</p>
                        <p className="text-[#2fa3f2] text-xs capitalize">{user.role}</p>
                      </div>
                    </div>
                    {user.role === "admin" && (
                      <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all">
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all">
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setMobileOpen(false); setModalOpen(true); }}
                    className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)" }}>
                    Login / Sign Up
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
