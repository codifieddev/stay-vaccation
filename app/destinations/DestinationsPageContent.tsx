"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/frontend/Navbar";
import Footer from "@/app/components/frontend/Footer";

// Sub-components
import HeroSection from "./components/HeroSection";
import DestinationSlider from "./components/DestinationSlider";
import DestinationCard from "./components/DestinationCard";
import BestSellerCard from "./components/BestSellerCard";

// ─── Shared Types ─────────────────────────────────────────────────────────────
export interface Destination {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  category?: string;
  regionId?: string;
  isTrending?: boolean;
  packageCount?: number;
  startingPrice?: number;
}

export interface Package {
  id: string;
  title: string;
  images: string[];
  price: {
    currency: string;
    amount: number;
    originalAmount: number;
  };
  tripDuration: string;
  destination: string;
  travelStyle: string;
}

export interface Region {
  _id: string;
  name: string;
  icon?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  gradient?: string;
}

// ─── Theme styles mapping ─────────────────────────────────────────────────────
const THEME_STYLES: Record<string, { gradient: string; icon: string }> = {
  Spiritual: { icon: "🕌", gradient: "from-orange-500 via-amber-600 to-yellow-700" },
  Honeymoon: { icon: "💑", gradient: "from-rose-500 via-pink-600 to-fuchsia-700" },
  Luxury: { icon: "💎", gradient: "from-slate-700 via-gray-800 to-zinc-900" },
  Wildlife: { icon: "🐆", gradient: "from-green-700 via-emerald-800 to-teal-900" },
  Adventure: { icon: "🏔️", gradient: "from-sky-500 via-blue-600 to-indigo-700" },
  Beach: { icon: "🏖️", gradient: "from-cyan-400 via-sky-500 to-blue-600" },
  Cultural: { icon: "🏛️", gradient: "from-purple-600 via-violet-700 to-indigo-800" },
  Family: { icon: "👨‍👩‍👧‍👦", gradient: "from-lime-500 via-green-600 to-emerald-700" },
};

const DEFAULT_THEME_STYLE = { icon: "🌍", gradient: "from-[#1a3f4e] via-[#2a5f74] to-[#2fa3f2]" };

// ─── Tab config ───────────────────────────────────────────────────────────────
type TabKey = string;
interface TabOption {
  key: TabKey;
  label: string;
  emoji: string;
}

function getTabConfig(regions: Region[], destinations: Destination[], override?: string): TabOption[] {
  // If on a specific category page (like India), show sub-regions instead of global India/Intl
  if (override === "india") {
    const indiaRegions = regions.filter(r => 
      destinations.some(d => d.regionId === r._id && d.category === "India") &&
      r.name.toLowerCase() !== "around"
    );
    return [
      { key: "All", label: "All India", emoji: "🇮🇳" },
      ...indiaRegions.map(r => ({
        key: r._id,
        label: r.name,
        emoji: r.icon || "📍",
      })),
    ];
  }

  if (override === "international") {
    const intlRegions = regions.filter(r => 
      destinations.some(d => d.regionId === r._id && d.category === "International")
    );
    return [
      { key: "All", label: "All International", emoji: "✈️" },
      ...intlRegions.map(r => ({
        key: r._id,
        label: r.name,
        emoji: r.icon || "📍",
      })),
    ];
  }

  const fixed: TabOption[] = [
    { key: "All", label: "All Destinations", emoji: "🌎" },
    { key: "India", label: "India", emoji: "🇮🇳" },
    { key: "International", label: "International", emoji: "✈️" },
  ];
  const regionTabs = regions.map(r => ({
    key: r._id,
    label: r.name,
    emoji: r.icon || "📍",
  }));
  return [...fixed, ...regionTabs];
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DestinationsPageContent({
  destinations,
  regions,
  bestSellers = [],
  categories = [],
  initialTypeOverride,
}: {
  destinations: Destination[];
  regions: Region[];
  bestSellers?: Package[];
  categories?: Category[];
  initialTypeOverride?: string;
}) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>("All");
  const [search, setSearch] = useState("");

  // Handle initial tab from query param or direct prop override
  useEffect(() => {
    const type = initialTypeOverride || searchParams.get("type")?.toLowerCase();
    if (type === "india") setActiveTab("India");
    else if (type === "international") setActiveTab("International");
  }, [searchParams, initialTypeOverride]);

  const tabs = useMemo(() => getTabConfig(regions, destinations, initialTypeOverride), [regions, destinations, initialTypeOverride]);

  // Trending destinations (isTrending === true) - Filtered by tab if India/International selected
  const trendingDestinations = useMemo(() => {
    let list = destinations.filter(d => d.isTrending === true && d.packageCount > 0);
    if (activeTab === "India") list = list.filter(d => d.category === "India");
    if (activeTab === "International") list = list.filter(d => d.category === "International");
    return list;
  }, [destinations, activeTab]);

  const filtered = useMemo(() => {
    let list = destinations;

    // Apply Global Category Override (Force filter by India or International if on that page)
    if (initialTypeOverride === "india") {
      list = list.filter(d => d.category === "India");
    } else if (initialTypeOverride === "international") {
      list = list.filter(d => d.category === "International");
    }
    
    // Support ?trending=true query param for strict trending view
    const showOnlyTrending = searchParams.get("trending") === "true";
    if (showOnlyTrending) {
      list = list.filter(d => d.isTrending === true);
    }

    if (activeTab === "India") {
      list = list.filter(d => d.category === "India");
    } else if (activeTab === "International") {
      list = list.filter(d => d.category === "International");
    } else if (activeTab !== "All") {
      list = list.filter(d => d.regionId === activeTab);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        d => d.name.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [destinations, activeTab, search]);

  const indiaCnt = destinations.filter(d => d.category === "India").length;
  const intlCnt = destinations.filter(d => d.category === "International").length;

  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = { All: destinations.length, India: indiaCnt, International: intlCnt };
    regions.forEach(r => { counts[r._id] = destinations.filter(d => d.regionId === r._id).length; });
    return counts;
  }, [destinations, regions, indiaCnt, intlCnt]);

  return (
    <>
      <Navbar />

      <HeroSection 
        type={(initialTypeOverride as any) || "all"}
        totalCount={destinations.length}
        indiaCount={indiaCnt}
        intlCount={intlCnt}
        trendingCount={trendingDestinations.length}
      />

      <DestinationSlider destinations={trendingDestinations} />

      {/* ── Explore Themes (Dynamic Categories) ─────────────────── */}
      {categories.length > 0 && (
        <section className="section-pad bg-[#f8fafc]">
          <div className="container-sv">
            <div className="text-center mb-12">
              <p className="text-[#2fa3f2] font-bold text-xs uppercase tracking-[0.3em] mb-3">
                Travel Your Way
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-[#1a3f4e] mb-4 leading-tight">
                Explore by Theme
              </h2>
              <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
                Every journey has a soul. Pick a theme that speaks to yours and we'll match you with the perfect destinations.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((cat, i) => {
                const style = THEME_STYLES[cat.name] || DEFAULT_THEME_STYLE;
                return (
                  <Link
                    key={cat._id}
                    href={`/packages?categoryId=${cat._id}`}
                    className="group relative overflow-hidden rounded-[2rem] cursor-pointer h-full flex flex-col min-h-[200px] md:min-h-[240px]"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Background image or gradient fallback */}
                    <div className="absolute inset-0 z-0">
                      {cat.image ? (
                        <>
                          <img 
                            src={cat.image} 
                            alt={cat.name} 
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" 
                            loading="lazy"
                            decoding="async"
                          />
                          {/* Sophisticated dark gradient for readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-colors" />
                        </>
                      ) : (
                        <>
                          <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient || style.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-500`} />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </>
                      )}
                    </div>

                    <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
                    <div className={`absolute -bottom-8 -right-8 w-36 h-36 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-700 z-0`} />
                    <div className="relative z-10 p-6 md:p-8 flex flex-col h-full min-h-[200px] md:min-h-[240px]">
                      <div className={`w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-2xl mb-auto group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300 shadow-lg border border-white/20`}>
                        {cat.icon || style.icon}
                      </div>
                      <div className="mt-6">
                        <h3 className="text-white font-display font-bold text-xl md:text-2xl leading-tight mb-1.5 drop-shadow">{cat.name}</h3>
                        {cat.description && <p className="text-white/70 text-xs font-medium leading-relaxed line-clamp-2">{cat.description}</p>}
                      </div>
                      <div className="mt-4 flex items-center gap-1.5 text-white/80 group-hover:text-white transition-colors">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Explore</span>
                        <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Best Selling Packages ──────────────────────────────────── */}
      {bestSellers.length > 0 && (
        <section className="section-pad bg-white">
          <div className="container-sv">
            <div className="flex items-end justify-between mb-10 gap-4">
              <div>
                <p className="text-[#2fa3f2] font-bold text-xs uppercase tracking-[0.3em] mb-2">Top Choices</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1a3f4e] leading-tight">Best Selling Packages</h2>
              </div>
              <Link href="/packages" className="flex-shrink-0 hidden sm:flex items-center gap-2 text-[#1a3f4e] font-bold text-sm hover:text-[#2fa3f2] transition-colors group">
                <span className="border-b-2 border-[#2fa3f2]/30 group-hover:border-[#2fa3f2] pb-0.5 transition-colors">View All</span>
                <svg className="w-4 h-4 text-[#2fa3f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bestSellers.map((pkg, i) => (
                <BestSellerCard key={pkg.id} pkg={pkg} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── All Destinations Grid ────────────────────────────────── */}
      <section id="all-destinations" className="section-pad bg-[#f8fafc] min-h-[600px]">
        <div className="container-sv">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <p className="text-[#2fa3f2] font-bold text-xs uppercase tracking-[0.3em] mb-3">Discovery</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1a3f4e] leading-tight">All Destinations</h2>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {tabs.map(tab => {
                const count = tabCounts[tab.key] ?? 0;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold tracking-wide uppercase transition-all duration-300 whitespace-nowrap ${isActive ? "bg-[#1a3f4e] text-white shadow-lg shadow-[#1a3f4e]/30 scale-105" : "bg-white text-gray-500 border border-gray-200 hover:border-[#2fa3f2]/40 hover:text-[#1a3f4e] hover:bg-[#F4F9E9]"}`}
                  >
                    <span className="text-sm leading-none">{tab.emoji}</span>
                    <span>{tab.label}</span>
                    <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}>{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-5 gap-4 flex-wrap">
              <p className="text-sm text-gray-400 font-medium">Showing <span className="text-[#1a3f4e] font-bold">{filtered.length}</span> destination{filtered.length !== 1 ? "s" : ""}{search ? ` for "${search}"` : ""}</p>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by name…" className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2fa3f2]/30 focus:border-[#2fa3f2] transition-all w-52" />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
              </div>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((dest, i) => (
                <DestinationCard key={dest._id} dest={dest} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🏜️</div>
              <h3 className="text-[#1a3f4e] font-bold text-2xl mb-2">No destinations available</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed mb-10">
                We couldn't find any destinations matching your criteria. Try adjusting your filters or browse our full collection of packages.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/packages" 
                  className="px-8 py-3 bg-[#1a3f4e] text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Browse all packages
                </Link>
                <button 
                  onClick={() => { setActiveTab("All"); setSearch(""); }} 
                  className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-sv">
          <div className="relative rounded-[3rem] overflow-hidden bg-[#1a3f4e] p-8 md:p-16 text-center shadow-2xl">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">Can't find your <span className="text-[#2fa3f2]">dream destination</span>?</h2>
              <p className="text-white/70 text-lg mb-10 leading-relaxed">We cover 100+ hidden gems worldwide. Tell us what you're looking for and our experts will craft a bespoke itinerary just for you.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact" className="w-full sm:w-auto px-10 py-4 bg-[#2fa3f2] text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[#2fa3f2]/30">Plan Custom Trip</Link>
                <Link href="/packages" className="w-full sm:w-auto px-10 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md border border-white/20">Browse All Packages</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
