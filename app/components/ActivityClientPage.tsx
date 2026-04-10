"use client";
import { useState, useMemo } from "react";
import Navbar from "@/app/components/frontend/Navbar";
import Footer from "@/app/components/frontend/Footer";
import Link from "next/link";

interface Activity {
  _id: string;
  title: string;
  description: string;
  activityType: string;
  defaultDuration: string;
  location: string;
  price?: number;
  discountPrice?: number;
  rating?: number;
  images: string[];
  destinationSlug?: string;
  highlights?: string[];
}

interface Destination {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export default function ActivityClientPage({ 
  destination, 
  initialActivities,
  slug 
}: { 
  destination: Destination | null;
  initialActivities: Activity[];
  slug: string;
}) {
  const [filter, setFilter] = useState("All");
  
  const categories = ["All", ...Array.from(new Set(initialActivities.map(a => a.activityType)))];

  const filteredActivities = useMemo(() => {
    if (filter === "All") return initialActivities;
    return initialActivities.filter(a => a.activityType === filter);
  }, [filter, initialActivities]);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />

      {/* ─── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={destination?.image || "/hero-default.jpg"} 
            alt={destination?.name || slug}
            className="w-full h-full object-cover transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="container-sv relative z-10 text-center text-white pt-20">
          <nav className="flex items-center justify-center gap-2 text-sm font-medium mb-6 animate-fadeUp opacity-80">
            <Link href="/" className="hover:text-[#2fa3f2] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/activities" className="hover:text-[#2fa3f2] transition-colors">Activities</Link>
            <span>/</span>
            <span className="text-[#2fa3f2]">{destination?.name || slug}</span>
          </nav>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 animate-fadeUp delay-100 uppercase tracking-tight">
            Things to do in <span className="text-[#2fa3f2]">{destination?.name || slug}</span>
          </h1>
          
          <p className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed animate-fadeUp delay-200">
            {destination?.description || `Discover handpicked activities, guided tours, and unique experiences in ${destination?.name || slug}.`}
          </p>
        </div>
      </section>

      {/* ─── MAIN CONTENT ────────────────────────────────────────── */}
      <main className="flex-1 container-sv py-12">
        
        {/* Category Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-gray-100 pb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  filter === cat 
                    ? "bg-[#1a3f4e] text-white border-[#1a3f4e] shadow-lg shadow-blue-900/20" 
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#2fa3f2] hover:text-[#2fa3f2]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="text-sm font-medium text-gray-400">
            Showing <span className="text-[#1a3f4e] font-bold">{filteredActivities.length}</span> activities
          </div>
        </div>

        {/* Activity Grid */}
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((act, idx) => (
              <ActivityCard key={act._id} act={act} idx={idx} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">🏞️</div>
            <h3 className="text-xl font-bold text-[#1a3f4e]">No activities found</h3>
            <p className="text-gray-400 mt-2">Try selecting a different category or destination.</p>
            <Link href="/" className="inline-block mt-6 px-8 py-3 bg-[#2fa3f2] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
              Explore Home
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ActivityCard({ act, idx }: { act: Activity; idx: number }) {
  return (
    <div 
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full animate-fadeUp"
      style={{ animationDelay: `${idx * 100}ms` }}
    >
      {/* Image Block */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={act.images?.[0] || "/placeholder-act.jpg"} 
          alt={act.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-[#1a3f4e] text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm border border-black/5">
            {act.activityType}
          </span>
        </div>
        
        {act.rating && (
          <div className="absolute bottom-4 left-4 bg-[#1a3f4e]/80 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
            ⭐ {act.rating}
          </div>
        )}
      </div>

      {/* Content Block */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-[#2fa3f2] text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {act.location}
          </p>
          <h3 className="text-xl font-bold text-[#1a3f4e] mb-3 line-clamp-1 group-hover:text-[#2fa3f2] transition-colors">
            {act.title}
          </h3>
          
          <div className="flex items-center gap-4 mb-4 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {act.defaultDuration}
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Free Cancellation
            </span>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-6">
            {act.description}
          </p>
        </div>

        {/* Footer/CTA */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Starting from</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-[#1a3f4e]">
                ₹{act.discountPrice || act.price || "—"}
              </span>
              {act.discountPrice && act.price && (
                <span className="text-xs text-gray-400 line-through">₹{act.price}</span>
              )}
            </div>
          </div>
          
          <Link 
            href={`/activities/book/${act._id}`}
            className="px-6 py-3 bg-[#F4F9E9] text-[#1a3f4e] font-bold text-xs rounded-2xl hover:bg-[#1a3f4e] hover:text-white transition-all duration-300 transform group-hover:-translate-x-1"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
