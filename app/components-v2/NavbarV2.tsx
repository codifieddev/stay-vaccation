"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CurrencyModal from "../components/frontend/CurrencyModal";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { logout } from "@/app/store/features/auth/authThunks";
import { setCurrency } from "@/app/store/features/currency/currencySlice";
import { fetchCurrencies } from "@/app/store/features/currency/currencyThunks";
import LucideIcon from "../components/LucideIcon";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/packages", label: "Packages" },
  { href: "/categories", label: "Categories" },
  { href: "/destinations", label: "Locations" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function NavbarV2() {
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
    const onScroll = () => setScrolled(window.scrollY > 50);
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

  // Design.html tokens
  const colors = {
    orange: "#ff9500",
    orange2: "#ff6b00",
    text: "#1a1a2e",
    sky: "#4a90e2",
    muted: "#64748b"
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
          scrolled
            ? "bg-white/92 backdrop-blur-xl shadow-[0_2px_20px_rgba(74,144,226,0.12)] py-3"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container-v2">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              {settings?.logo ? (
                <img src={settings.logo} alt="Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff9500] to-[#ff6b00] flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <div className="flex flex-col">
                <div className={`font-['Poppins'] font-[900] text-2xl tracking-[-0.02em] leading-none transition-colors duration-500 ${scrolled ? 'text-[#1a1a2e]' : 'text-white'}`}>
                  stay<span className="text-[#ff9500]">Vacation</span>
                </div>
                <div className={`text-[9px] font-bold uppercase tracking-[0.3em] mt-1.5 transition-colors duration-500 ${scrolled ? 'text-[#64748b]' : 'text-white/60'}`}>
                  Premium Getaways
                </div>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`relative px-4 py-2 text-[0.88rem] font-bold tracking-tight transition-all duration-300 group ${
                      scrolled 
                        ? (active ? "text-[#ff9500]" : "text-[#1a1a2e] hover:text-[#ff9500]") 
                        : (active ? "text-[#ff9500]" : "text-white/90 hover:text-white")
                    }`}
                  >
                    {link.label}
                    <span className={`absolute bottom-0 left-4 right-4 h-[2px] bg-[#ff9500] transition-all duration-300 origin-left ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {/* Currency Picker */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setCurrencyMenuOpen(true)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 border ${
                    scrolled 
                      ? "text-[#1a1a2e]/80 hover:text-[#1a1a2e] bg-gray-100/50 border-gray-200" 
                      : "text-white/80 hover:text-white bg-white/10 border-white/10"
                  }`}
                >
                  <LucideIcon name="Globe" size={13} className="text-[#ff9500]" />
                  <span>{selectedCurrency.code} {selectedCurrency.symbol}</span>
                </button>
              </div>

              {/* Explore Button - btn-orange from design.html */}
              <Link href="/packages"
                className="hidden md:inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white text-[0.85rem] font-bold uppercase tracking-wider rounded-full transition-all duration-300 shadow-[0_4px_18px_rgba(255,149,0,0.35)] hover:shadow-[0_8px_28px_rgba(255,149,0,0.45)] hover:-translate-y-0.5 active:scale-95 group">
                <LucideIcon name="Search" size={15} className="group-hover:rotate-12 transition-transform duration-500" />
                Explore
              </Link>

              {authChecked && (
                <>
                  {user ? (
                    <div className="relative hidden md:block">
                      <button
                        onClick={() => setUserMenuOpen((v) => !v)}
                        className={`p-1 rounded-full border transition-all duration-300 ${
                          scrolled ? "border-gray-200 hover:border-[#ff9500]/50" : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff9500] to-[#ff6b00] flex items-center justify-center text-white text-xs font-black shadow-lg">
                          {initial}
                        </div>
                      </button>

                      {userMenuOpen && (
                        <div className="absolute right-0 top-full mt-4 w-64 rounded-[2rem] shadow-2xl overflow-hidden z-50 border border-gray-100 bg-white/95 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                          <div className="px-6 py-5 border-b border-gray-50">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1.5">Your Account</p>
                            <p className="text-sm font-black text-[#1a1a2e] truncate">{user.email}</p>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-3"
                              style={{
                                background: user.role === "admin" ? "rgba(251,191,36,0.12)" : "rgba(74,144,226,0.12)",
                                color: user.role === "admin" ? "#d97706" : "#4a90e2",
                                border: `1px solid ${user.role === "admin" ? "rgba(251,191,36,0.2)" : "rgba(74,144,226,0.2)"}`
                              }}>
                              <LucideIcon name={user.role === "admin" ? "Star" : "User"} size={8} className="mr-1.5" />
                              {user.role === "admin" ? "Administrator" : "Exclusive Member"}
                            </span>
                          </div>
                          
                          <div className="p-2.5">
                            {user.role === "admin" && (
                              <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3.5 px-4 py-3.5 text-[0.75rem] font-bold uppercase tracking-widest text-[#1a1a2e]/70 hover:bg-gray-50 hover:text-[#ff9500] rounded-2xl transition-all">
                                <LucideIcon name="LayoutDashboard" size={15} />
                                Admin Panel
                              </Link>
                            )}
                            <Link href="/my-bookings" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3.5 px-4 py-3.5 text-[0.75rem] font-bold uppercase tracking-widest text-[#1a1a2e]/70 hover:bg-gray-50 hover:text-[#ff9500] rounded-2xl transition-all">
                              <LucideIcon name="Calendar" size={15} />
                              My Bookings
                            </Link>
                            <button onClick={handleLogout}
                              className="w-full flex items-center gap-3.5 px-4 py-3.5 text-[0.75rem] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all">
                                <LucideIcon name="LogOut" size={15} />
                                Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      id="navbar-login-btn"
                      href="/login"
                      className={`hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 border ${
                        scrolled 
                          ? "bg-white text-[#1a1a2e] border-gray-200 hover:border-[#ff9500] hover:text-[#ff9500]" 
                          : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      }`}
                    >
                      <LucideIcon name="User" size={14} />
                      Login
                    </Link>
                  )}
                </>
              )}

              {/* Mobile Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5 rounded-full transition-all duration-300 border ${
                  scrolled ? "bg-gray-100 border-gray-200 text-[#1a1a2e]" : "bg-white/10 border-white/20 text-white"
                }`}
                aria-label="Toggle menu"
              >
                <span className={`block w-5 h-[2px] bg-current transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-4 h-[2px] bg-current transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-[2px] bg-current transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Overlays */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}

      <CurrencyModal
        isOpen={currencyMenuOpen}
        onClose={() => setCurrencyMenuOpen(false)}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={(curr) => dispatch(setCurrency(curr))}
      />

      {/* Mobile Menu - centered fullscreen from design.html */}
      <div className={`fixed inset-0 z-[110] lg:hidden transition-all duration-600 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-white/98 backdrop-blur-2xl" onClick={() => setMobileOpen(false)} />
        
        <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl transition-all hover:bg-gray-200" onClick={() => setMobileOpen(false)}>
           <LucideIcon name="X" size={24} />
        </button>

        <div className="relative h-full flex flex-col items-center justify-center gap-8 p-10">
            <div className="mb-4 text-center">
               <div className="text-[#1a1a2e] font-[900] text-4xl tracking-tighter">stay<span className="text-[#ff9500]">Vacation</span></div>
               <p className="text-[#ff9500] text-[10px] font-black uppercase tracking-[0.5em] mt-3">World Class Travel</p>
            </div>

            <nav className="flex flex-col items-center gap-5">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-2xl font-[900] tracking-tight transition-all duration-300 ${
                      active ? "text-[#ff9500] scale-110" : "text-[#1a1a2e] hover:text-[#ff9500]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {user && (
                <Link
                  href="/my-bookings"
                  onClick={() => setMobileOpen(false)}
                  className={`text-2xl font-[900] tracking-tight transition-all duration-300 ${
                    pathname === "/my-bookings" ? "text-[#ff9500] scale-110" : "text-[#1a1a2e] hover:text-[#ff9500]"
                  }`}
                >
                  My Bookings
                </Link>
              )}
            </nav>

            <div className="flex flex-col items-center gap-4 w-full max-w-xs mt-8">
               <button onClick={() => setCurrencyMenuOpen(true)} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gray-100 w-full justify-center font-bold text-[#1a1a2e]">
                  <LucideIcon name="Globe" size={18} className="text-[#ff9500]" />
                  <span>{selectedCurrency.code} {selectedCurrency.symbol}</span>
               </button>

               <Link href="/packages" onClick={() => setMobileOpen(false)} className="w-full text-center px-6 py-5 bg-[#1a1a2e] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl">
                  Start Booking Now
               </Link>

               {authChecked && (
                 user ? (
                   <button onClick={handleLogout} className="text-red-500 font-bold uppercase tracking-widest text-[10px] mt-4">
                      Logout Account
                   </button>
                 ) : (
                   <Link href="/login" onClick={() => setMobileOpen(false)} className="text-[#4a90e2] font-bold uppercase tracking-widest text-[10px] mt-4 block text-center">
                      Login / Sign Up
                  </Link>
                 )
               )}
            </div>
        </div>
      </div>
    </>
  );
}
