import Navbar from "./components/frontend/Navbar";
import Footer from "./components/frontend/Footer";
import PackageCard from "./components/frontend/PackageCard";
import SearchBar from "./components/frontend/SearchBar";
import Link from "next/link";

async function getPackages() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/packages`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

const CATEGORIES = [
  { label: "Beach & Islands", icon: "🏖️", color: "from-sky-400 to-blue-600", href: "/packages?type=Beach" },
  { label: "Heritage & Culture", icon: "🏛️", color: "from-amber-400 to-orange-600", href: "/packages?type=Heritage" },
  { label: "Adventure Sports", icon: "🧗", color: "from-emerald-400 to-teal-600", href: "/packages?type=Adventure%20Sports" },
  { label: "Wildlife & Nature", icon: "🦁", color: "from-lime-400 to-green-600", href: "/packages?type=Wildlife" },
  { label: "Honeymoon", icon: "💑", color: "from-rose-400 to-pink-600", href: "/packages?type=Honeymoon" },
  { label: "Family Tours", icon: "👨‍👩‍👧", color: "from-violet-400 to-purple-600", href: "/packages?type=Family" },
  { label: "Relaxation", icon: "🧘", color: "from-teal-400 to-cyan-600", href: "/packages?type=Relaxation" },
  { label: "Religious", icon: "🕌", color: "from-yellow-400 to-amber-600", href: "/packages?type=Religious" },
];

const HIGHLIGHTS = [
  { icon: "🌍", title: "50+ Destinations", desc: "Worldwide coverage from exotic islands to mountain retreats" },
  { icon: "⭐", title: "Luxury Curated", desc: "Handpicked premium experiences at every tier" },
  { icon: "🛡️", title: "Fully Insured", desc: "Comprehensive travel protection on every booking" },
  { icon: "🎯", title: "Custom Itineraries", desc: "Tailor-made journeys for every traveller" },
];

export default async function HomePage() {
  const packages = await getPackages();
  const featured = packages.slice(0, 6);

  return (
    <>
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center hero-bg">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#2fa3f2]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#F4F9E9]/5 rounded-full blur-2xl" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5 overflow-hidden"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />

        <div className="container-sv relative z-10 text-center pt-24 pb-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-8 animate-fadeUp">
            <span className="w-2 h-2 bg-[#2fa3f2] rounded-full animate-pulse" />
            Premium Travel Experiences Await
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-fadeUp delay-100">
            Discover Your{" "}
            <span className="gradient-text">Perfect</span>
            <br />
            Getaway
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeUp delay-200">
            Curated luxury escapes, cultural journeys, and adventure tours — crafted for those who live to explore.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-20 animate-fadeUp delay-300 relative z-50">
            <SearchBar />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mt-16 animate-fadeUp delay-400 relative z-0">
            {[
              { num: "500+", label: "Happy Clients" },
              { num: "50+", label: "Destinations" },
              { num: "10+", label: "Years Experience" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.num}</div>
                <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 69C120 58 240 36 360 29C480 22 600 29 720 36C840 43 960 51 1080 51C1200 51 1320 43 1380 40L1440 36V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ─── HIGHLIGHTS ───────────────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-sv">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {HIGHLIGHTS.map((h, i) => (
              <div
                key={h.title}
                className="text-center p-6 rounded-2xl hover:bg-[#F4F9E9] transition-colors group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{h.icon}</div>
                <h3 className="font-bold text-[#1a3f4e] text-sm mb-1">{h.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────── */}
      <section className="section-pad bg-[#F4F9E9]">
        <div className="container-sv">
          <div className="text-center mb-12">
            <p className="text-[#2fa3f2] font-semibold text-sm uppercase tracking-widest mb-3">Browse by interest</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#1a3f4e]">Explore Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group relative rounded-2xl overflow-hidden h-32 flex items-end p-4 card-hover"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90`} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-4 right-4 text-3xl">{cat.icon}</div>
                <span className="relative z-10 text-white text-sm font-bold leading-tight">{cat.label}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/categories" className="inline-flex items-center gap-2 text-[#2fa3f2] font-semibold hover:gap-3 transition-all text-sm">
              View all categories
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURED PACKAGES ────────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-sv">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#2fa3f2] font-semibold text-sm uppercase tracking-widest mb-3">Handpicked for you</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-[#1a3f4e]">Featured Packages</h2>
            </div>
            <Link href="/packages" className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 border border-[#1a3f4e] text-[#1a3f4e] text-sm font-semibold rounded-xl hover:bg-[#1a3f4e] hover:text-white transition-all">
              View All Packages
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((pkg, i) => (
                <PackageCard key={pkg.id} pkg={pkg} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
              <div className="text-6xl mb-4">✈️</div>
              <p className="text-gray-400 font-medium">Packages coming soon!</p>
              <p className="text-gray-300 text-sm mt-1">Add packages via the admin panel</p>
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link href="/packages" className="inline-flex items-center gap-2 px-8 py-3 bg-[#1a3f4e] text-white font-semibold rounded-xl">
              View All Packages
            </Link>
          </div>
        </div>
      </section>

      {/* ─── POPULAR DESTINATIONS ─────────────────────────────────── */}
      <section className="section-pad bg-[#1a3f4e]">
        <div className="container-sv">
          <div className="text-center mb-12">
            <p className="text-[#2fa3f2] font-semibold text-sm uppercase tracking-widest mb-3">Top picks</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white">Popular Destinations</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {["Bali", "Rajasthan", "Maldives", "Dubai", "Himachal"].map((dest, i) => (
              <Link
                key={dest}
                href={`/locations?q=${dest}`}
                className="group text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#2fa3f2]/50 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">
                  {["🌴", "🏰", "🌊", "🌆", "🏔️"][i]}
                </div>
                <p className="text-white font-semibold text-sm group-hover:text-[#2fa3f2] transition-colors">{dest}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/locations" className="inline-flex items-center gap-2 text-[#2fa3f2] font-semibold text-sm hover:gap-3 transition-all">
              Explore all locations
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────────── */}
      <section className="section-pad bg-gradient-to-r from-[#2fa3f2] to-[#1a7abf]">
        <div className="container-sv text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Talk to our travel experts and get a custom itinerary crafted just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-[#1a3f4e] font-bold text-sm rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              Contact Us Today
            </Link>
            <Link
              href="/packages"
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border border-white/30 font-semibold text-sm rounded-xl hover:bg-white/30 transition-all duration-200"
            >
              Browse All Packages
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}