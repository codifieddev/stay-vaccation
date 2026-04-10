import Navbar from "../components/frontend/Navbar";
import Footer from "../components/frontend/Footer";
import SearchBar from "../components/frontend/SearchBar";
import Link from "next/link";

export const metadata = {
  title: "Travel Destinations — Stay Vacation",
  description: "Explore top travel destinations around the world — India, Bali, Dubai, Maldives, Europe, and many more.",
};

const REGIONS = [
  {
    name: "South East Asia",
    icon: "🌴",
    color: "from-[#1a7abf] to-[#0d4f7c]",
    destinations: [
      { name: "Bali, Indonesia", emoji: "🌺", tagline: "Island of the Gods", packages: 8 },
      { name: "Phuket, Thailand", emoji: "🏝️", tagline: "Pearl of the Andaman", packages: 5 },
      { name: "Singapore", emoji: "🦁", tagline: "Lion City Marvels", packages: 4 },
      { name: "Vietnam", emoji: "🛵", tagline: "Cultural Tapestry", packages: 3 },
    ],
  },
  {
    name: "India",
    icon: "🇮🇳",
    color: "from-[#f97316] to-[#c2440c]",
    destinations: [
      { name: "Rajasthan", emoji: "🏰", tagline: "Land of Maharajas", packages: 9 },
      { name: "Kerala", emoji: "🌿", tagline: "God's Own Country", packages: 6 },
      { name: "Goa", emoji: "🏖️", tagline: "Sun, Sand & Spice", packages: 7 },
      { name: "Himachal Pradesh", emoji: "🏔️", tagline: "Mountain Paradise", packages: 5 },
    ],
  },
  {
    name: "Middle East",
    icon: "🕌",
    color: "from-[#d4a017] to-[#8b6914]",
    destinations: [
      { name: "Dubai, UAE", emoji: "🌆", tagline: "City of Gold", packages: 6 },
      { name: "Abu Dhabi, UAE", emoji: "🕌", tagline: "Capital of Wonder", packages: 3 },
      { name: "Maldives", emoji: "🌊", tagline: "Ocean Paradise", packages: 7 },
      { name: "Istanbul, Turkey", emoji: "🌉", tagline: "Where East Meets West", packages: 4 },
    ],
  },
  {
    name: "Europe",
    icon: "🏛️",
    color: "from-[#4f46e5] to-[#312e81]",
    destinations: [
      { name: "Paris, France", emoji: "🗼", tagline: "City of Love", packages: 5 },
      { name: "Santorini, Greece", emoji: "💙", tagline: "White & Blue Magic", packages: 4 },
      { name: "Rome, Italy", emoji: "🏛️", tagline: "Eternal City", packages: 4 },
      { name: "Switzerland", emoji: "⛷️", tagline: "Alpine Splendor", packages: 3 },
    ],
  },
  {
    name: "Oceania & East Asia",
    icon: "🦘",
    color: "from-[#059669] to-[#065f46]",
    destinations: [
      { name: "Bali (Ubud)", emoji: "🌾", tagline: "Art & Soul of Bali", packages: 4 },
      { name: "Japan", emoji: "⛩️", tagline: "Land of Rising Sun", packages: 3 },
      { name: "Australia", emoji: "🦘", tagline: "Down Under Adventures", packages: 3 },
      { name: "New Zealand", emoji: "🌿", tagline: "Middle Earth Magic", packages: 2 },
    ],
  },
];

export default function LocationsPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative hero-bg pt-32 pb-24">
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1200 400">
            <circle cx="200" cy="200" r="300" stroke="white" strokeWidth="0.5" fill="none" />
            <circle cx="900" cy="100" r="200" stroke="white" strokeWidth="0.5" fill="none" />
            <circle cx="600" cy="350" r="250" stroke="white" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="container-sv relative z-10 text-center">
          <p className="text-[#2fa3f2] font-semibold text-sm uppercase tracking-widest mb-4">Around the world</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
            Travel Destinations
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
            From tropical paradises to ancient civilizations — explore our handpicked destinations across every continent.
          </p>
          {/* Search */}
          <div className="max-w-lg mx-auto mb-20 relative z-50">
            <SearchBar showButton={false} placeholder="Search destinations…" />
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="section-pad bg-white">
        <div className="container-sv space-y-16">
          {REGIONS.map((region) => (
            <div key={region.name}>
              {/* Region header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${region.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {region.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1a3f4e]">{region.name}</h2>
                  <p className="text-gray-400 text-sm">{region.destinations.length} destinations</p>
                </div>
              </div>

              {/* Destination cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {region.destinations.map((dest) => (
                  <Link
                    key={dest.name}
                    href={`/packages?q=${encodeURIComponent(dest.name.split(",")[0])}`}
                    className="group p-5 rounded-2xl border border-gray-100 bg-white hover:bg-[#F4F9E9] hover:border-[#2fa3f2]/30 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="text-3xl mb-3">{dest.emoji}</div>
                    <h3 className="font-bold text-[#1a3f4e] text-sm mb-0.5 group-hover:text-[#2fa3f2] transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-gray-400 text-xs mb-3">{dest.tagline}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-[#F4F9E9] text-[#1a3f4e] font-semibold px-2.5 py-1 rounded-full">
                        {dest.packages} packages
                      </span>
                      <svg className="w-4 h-4 text-[#2fa3f2] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#1a3f4e] to-[#2a5f74]">
        <div className="container-sv text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Don't see your dream destination?
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            We cover 100+ destinations worldwide. Contact us for custom-built itineraries.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#2fa3f2] text-white font-bold rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Plan Custom Trip
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
