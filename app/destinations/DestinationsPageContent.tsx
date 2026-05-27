"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LayoutV2 from "@/app/layouts-v2/LayoutV2";
import LocationsHero from "@/app/sections-v2/locationspage/locationsHero/LocationsHero";
import TourCardV2 from "@/app/components-v2/TourCardV2";
import SectionHeaderV2 from "@/app/components-v2/SectionHeaderV2";
import ButtonV2 from "@/app/components-v2/ButtonV2";

// Sub-components
import HeroSection from "./components/HeroSection";
import DestinationSlider from "./components/DestinationSlider";
import DestinationCard from "./components/DestinationCard";
import BestSellerCard from "./components/BestSellerCard";
import LucideIcon from "@/app/components/LucideIcon";

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

import { Package } from "@/app/store/features/packages/types";

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
  Spiritual: { icon: "Compass", gradient: "from-orange-500 via-amber-600 to-yellow-700" },
  Honeymoon: { icon: "Heart", gradient: "from-rose-500 via-pink-600 to-fuchsia-700" },
  Luxury: { icon: "Gem", gradient: "from-slate-700 via-gray-800 to-zinc-900" },
  Wildlife: { icon: "Leaf", gradient: "from-green-700 via-emerald-800 to-teal-900" },
  Adventure: { icon: "Mountain", gradient: "from-sky-500 via-blue-600 to-indigo-700" },
  Beach: { icon: "Waves", gradient: "from-cyan-400 via-sky-500 to-blue-600" },
  Cultural: { icon: "Landmark", gradient: "from-purple-600 via-violet-700 to-indigo-800" },
  Family: { icon: "Users", gradient: "from-lime-500 via-green-600 to-emerald-700" },
};

const DEFAULT_THEME_STYLE = { icon: "Globe", gradient: "from-[#1a3f4e] via-[#2a5f74] to-[#2fa3f2]" };

// ─── Tab config ───────────────────────────────────────────────────────────────
type TabKey = string;
interface TabOption {
  key: TabKey;
  label: string;
  icon: string;
}

function getTabConfig(regions: Region[], destinations: Destination[], override?: string): TabOption[] {
  // If on a specific category page (like India), show sub-regions instead of global India/Intl
  if (override === "india") {
    const indiaRegions = regions.filter(r => 
      destinations.some(d => d.regionId === r._id && d.category === "India") &&
      r.name.toLowerCase() !== "around"
    );
    return [
      { key: "All", label: "All India", icon: "Map" },
      ...indiaRegions.map(r => ({
        key: r._id,
        label: r.name,
        icon: r.icon || "MapPin",
      })),
    ];
  }

  if (override === "international") {
    const intlRegions = regions.filter(r => 
      destinations.some(d => d.regionId === r._id && d.category === "International")
    );
    return [
      { key: "All", label: "All International", icon: "Plane" },
      ...intlRegions.map(r => ({
        key: r._id,
        label: r.name,
        icon: r.icon || "MapPin",
      })),
    ];
  }

  const fixed: TabOption[] = [
    { key: "All", label: "All Destinations", icon: "Globe" },
    { key: "India", label: "India", icon: "Map" },
    { key: "International", label: "International", icon: "Plane" },
  ];
  const regionTabs = regions.map(r => ({
    key: r._id,
    label: r.name,
    icon: r.icon || "MapPin",
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
    <LayoutV2>
      <LocationsHero initialTypeOverride={initialTypeOverride} />

      {/* Trending Slider - V2 Style */}
      {trendingDestinations.length > 0 && (
        <section style={{ padding: '5rem 0', background: 'var(--white)' }}>
          <div className="container-v2">
            <SectionHeaderV2 
              label="Trending Now"
              title="Most Popular"
              titleHighlight="Destinations"
              subtitle="The places everyone is talking about this season. Book early to secure your spot."
              className="mb-10"
            />
            <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1.5rem' }}>
              {trendingDestinations.map((dest, i) => (
                <Link 
                  key={dest._id} 
                  href={`/destinations/${dest.slug}`}
                  style={{ flex: '0 0 300px', borderRadius: '1.5rem', overflow: 'hidden', position: 'relative', height: '400px' }}
                >
                  <img src={dest.image} alt={dest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
                  <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>{dest.name}</h3>
                    <p style={{ color: 'var(--orange)', fontSize: '0.75rem', fontWeight: 700 }}>{dest.packageCount} Packages</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers - V2 Style */}
      {bestSellers.length > 0 && (
        <section style={{ padding: '5rem 0', background: 'var(--cream)' }}>
          <div className="container-v2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
              <SectionHeaderV2 
                label="Top Choices"
                title="Best Selling"
                titleHighlight="Packages"
              />
              <ButtonV2 href="/packages" variant="outline">View All</ButtonV2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {bestSellers.map((pkg: any, i) => (
                <TourCardV2 key={pkg.id} pkg={pkg} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Destinations Grid - V2 Style */}
      <section style={{ padding: '5rem 0', background: 'var(--white)' }}>
        <div className="container-v2">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <SectionHeaderV2 
              label="The Collection"
              title="All"
              titleHighlight="Destinations"
              subtitle="Browse our entire portfolio of travel locations."
              centered
            />
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    borderRadius: '2rem',
                    border: '1.5px solid',
                    borderColor: isActive ? 'var(--sky)' : '#e5e7eb',
                    background: isActive ? 'var(--sky)' : 'var(--white)',
                    color: isActive ? '#fff' : 'var(--text)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
            {filtered.map((dest, i) => (
              <Link 
                key={dest._id} 
                href={`/destinations/${dest.slug}`}
                className="reveal visible"
                style={{ 
                  borderRadius: '1.5rem', 
                  overflow: 'hidden', 
                  background: 'var(--cream)', 
                  border: '1px solid #e5e7eb',
                  animationDelay: `${i * 50}ms`
                }}
              >
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <img src={dest.image} alt={dest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{dest.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{dest.packageCount} Packages</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sky)' }}>Explore →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem 0', background: 'var(--cream)', borderRadius: '2rem', border: '2px dashed #e5e7eb' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏜️</div>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.4rem' }}>No destinations found</h3>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '6rem 0', background: 'var(--sky-dk)', position: 'relative', overflow: 'hidden' }}>
        <div className="container-v2" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: '2.5rem', marginBottom: '1.5rem', color: '#fff' }}>
            Can't find your <span style={{ color: 'var(--orange)' }}>dream destination</span>?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            We cover 100+ hidden gems worldwide. Tell us what you're looking for and our experts will craft a bespoke itinerary just for you.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <ButtonV2 href="/contact" variant="orange">Plan Custom Trip</ButtonV2>
            <ButtonV2 href="/packages" variant="outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>Browse Packages</ButtonV2>
          </div>
        </div>
      </section>
    </LayoutV2>
  );
}
