"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../components/frontend/Navbar";
import Footer from "../components/frontend/Footer";
import PackageCard from "../components/frontend/PackageCard";

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ", SGD: "S$", AUD: "A$", THB: "฿",
};

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "duration-asc", label: "Duration: Shortest" },
  { value: "duration-desc", label: "Duration: Longest" },
];

const TOUR_TYPES = ["Relaxation", "Heritage", "Adventure Sports", "Wildlife", "Religious", "Culinary", "Beach", "Honeymoon", "Family"];
const TRAVEL_STYLES = ["Luxury", "Premium", "Budget", "Adventure", "Cultural Immersion", "Family", "Group Tour"];
const DURATIONS = ["1-3 Days", "4-5 Days", "6-7 Days", "8-10 Days", "10+ Days"];

function parseDays(dur: string): number {
  const m = dur?.match(/^(\d+)/);
  return m ? parseInt(m[1]) : 0;
}
function durationBucket(days: number): string {
  if (days <= 3) return "1-3 Days";
  if (days <= 5) return "4-5 Days";
  if (days <= 7) return "6-7 Days";
  if (days <= 10) return "8-10 Days";
  return "10+ Days";
}

function PackagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters from URL
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(decodeURIComponent(searchParams.get("type") || ""));
  const [style, setStyle] = useState(searchParams.get("style") || "");
  const [duration, setDuration] = useState(searchParams.get("duration") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "default");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/packages", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setPackages(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...packages];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.destination?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q)
      );
    }
    if (type) list = list.filter(p => p.tourType === type);
    if (style) list = list.filter(p => p.travelStyle === style);
    if (duration) list = list.filter(p => durationBucket(parseDays(p.tripDuration)) === duration);

    // Sort
    if (sort === "price-asc") list.sort((a, b) => Number(a.price?.amount) - Number(b.price?.amount));
    if (sort === "price-desc") list.sort((a, b) => Number(b.price?.amount) - Number(a.price?.amount));
    if (sort === "duration-asc") list.sort((a, b) => parseDays(a.tripDuration) - parseDays(b.tripDuration));
    if (sort === "duration-desc") list.sort((a, b) => parseDays(b.tripDuration) - parseDays(a.tripDuration));

    return list;
  }, [packages, search, type, style, duration, sort]);

  const activeFilters = [type, style, duration].filter(Boolean).length;

  const clearFilters = () => { setType(""); setStyle(""); setDuration(""); setSearch(""); setSort("default"); };

  return (
    <>
      <Navbar />

      {/* Page Hero */}
      <section className="hero-bg pt-32 pb-16">
        <div className="container-sv text-center">
          <p className="text-[#2fa3f2] font-semibold text-sm uppercase tracking-widest mb-3">Curated for you</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-5">All Packages</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            Browse our complete collection of handcrafted travel experiences.
          </p>
          {/* Search bar */}
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search destinations, packages…"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#2fa3f2] transition-colors text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="section-pad bg-gray-50 min-h-screen">
        <div className="container-sv">
          <div className="flex gap-8">

            {/* ── Sidebar Filters (desktop) ── */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#1a3f4e] text-sm">Filters</h3>
                    {activeFilters > 0 && (
                      <button onClick={clearFilters} className="text-xs text-red-500 hover:underline font-medium">
                        Clear all ({activeFilters})
                      </button>
                    )}
                  </div>

                  {/* Tour Type */}
                  <div className="mb-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tour Type</p>
                    <div className="space-y-1">
                      {TOUR_TYPES.map(t => (
                        <button
                          key={t}
                          onClick={() => setType(type === t ? "" : t)}
                          className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${type === t ? "bg-[#1a3f4e] text-white font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Travel Style */}
                  <div className="mb-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Travel Style</p>
                    <div className="space-y-1">
                      {TRAVEL_STYLES.map(s => (
                        <button
                          key={s}
                          onClick={() => setStyle(style === s ? "" : s)}
                          className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${style === s ? "bg-[#2fa3f2] text-white font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Duration</p>
                    <div className="space-y-1">
                      {DURATIONS.map(d => (
                        <button
                          key={d}
                          onClick={() => setDuration(duration === d ? "" : d)}
                          className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${duration === d ? "bg-[#1a3f4e] text-white font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Package Grid ── */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <p className="text-gray-500 text-sm flex-1">
                  {loading ? "Loading…" : (
                    <><span className="font-bold text-[#1a3f4e]">{filtered.length}</span> package{filtered.length !== 1 ? "s" : ""} found</>
                  )}
                </p>
                {/* Mobile filter button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  Filters {activeFilters > 0 && <span className="bg-[#2fa3f2] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilters}</span>}
                </button>
                {/* Sort */}
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white focus:outline-none focus:border-[#2fa3f2] cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Active filter pills */}
              {(type || style || duration) && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {type && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a3f4e] text-white rounded-full text-xs font-semibold">{type} <button onClick={() => setType("")} className="text-white/60 hover:text-white">✕</button></span>}
                  {style && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2fa3f2] text-white rounded-full text-xs font-semibold">{style} <button onClick={() => setStyle("")} className="text-white/60 hover:text-white">✕</button></span>}
                  {duration && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a3f4e]/70 text-white rounded-full text-xs font-semibold">{duration} <button onClick={() => setDuration("")} className="text-white/60 hover:text-white">✕</button></span>}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                      <div className="h-52 skeleton" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 skeleton rounded w-3/4" />
                        <div className="h-3 skeleton rounded w-full" />
                        <div className="h-3 skeleton rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 font-semibold text-lg">No packages found</p>
                  <p className="text-gray-400 text-sm mt-1 mb-6">Try adjusting your filters or search term</p>
                  <button onClick={clearFilters} className="px-6 py-3 bg-[#1a3f4e] text-white rounded-xl text-sm font-semibold hover:bg-[#2a5f74] transition-colors">
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((pkg, i) => (
                    <PackageCard key={pkg.id} pkg={pkg} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#1a3f4e] text-lg">Filters</h3>
              <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">✕</button>
            </div>
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tour Type</p>
              <div className="flex flex-wrap gap-2">
                {TOUR_TYPES.map(t => (
                  <button key={t} onClick={() => setType(type === t ? "" : t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${type === t ? "bg-[#1a3f4e] text-white border-[#1a3f4e]" : "border-gray-200 text-gray-600"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Travel Style</p>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_STYLES.map(s => (
                  <button key={s} onClick={() => setStyle(style === s ? "" : s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${style === s ? "bg-[#2fa3f2] text-white border-[#2fa3f2]" : "border-gray-200 text-gray-600"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Duration</p>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map(d => (
                  <button key={d} onClick={() => setDuration(duration === d ? "" : d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${duration === d ? "bg-[#1a3f4e] text-white border-[#1a3f4e]" : "border-gray-200 text-gray-600"}`}>{d}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { clearFilters(); setSidebarOpen(false); }} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">Clear All</button>
              <button onClick={() => setSidebarOpen(false)} className="flex-1 py-3 bg-[#1a3f4e] text-white rounded-xl text-sm font-semibold">Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen hero-bg flex items-center justify-center"><div className="text-white text-xl">Loading packages…</div></div>}>
      <PackagesContent />
    </Suspense>
  );
}
