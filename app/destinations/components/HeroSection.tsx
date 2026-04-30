"use client";

import SearchBar from "@/app/components/frontend/SearchBar";

interface HeroSectionProps {
  totalCount: number;
  indiaCount: number;
  intlCount: number;
  trendingCount: number;
  type: "all" | "india" | "international";
}

export default function HeroSection({ 
  totalCount, 
  indiaCount, 
  intlCount, 
  trendingCount,
  type
}: HeroSectionProps) {
  const isIndia = type === "india";
  const isIntl = type === "international";

  const eyebrow = isIndia ? "Exploring Incredible India" : isIntl ? "World Discovery" : "Around the World";
  const title = isIndia ? (
    <>
      India <span className="text-[#2fa3f2]">Holidays</span>
    </>
  ) : isIntl ? (
    <>
      Global <span className="text-[#2fa3f2]">Discovery</span>
    </>
  ) : (
    <>
      Explore All <br className="hidden sm:block" />
      <span className="text-[#2fa3f2]">Destinations</span>
    </>
  );

  const description = isIndia 
    ? `From the mighty Himalayas to the serene backwaters of Kerala — discover ${indiaCount}+ handpicked Indian destinations.`
    : isIntl
    ? `From Bali's temples to Paris's boulevards — explore ${intlCount}+ handpicked international destinations.`
    : `From breathtaking Himalayan valleys to sun-kissed tropical shores — discover ${totalCount}+ handpicked destinations across the globe.`;

  const stats = isIndia 
    ? [
        { label: "India Total", value: indiaCount },
        { label: "Trending", value: trendingCount },
      ]
    : isIntl
    ? [
        { label: "Intl Total", value: intlCount },
        { label: "Trending", value: trendingCount },
      ]
    : [
        { label: "Total", value: totalCount },
        { label: "India", value: indiaCount },
        { label: "Intl", value: intlCount },
        { label: "Trending", value: trendingCount },
      ];
  return (
    <section className="relative hero-bg pt-36 pb-28 overflow-hidden">
      <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice">
          <circle cx="100" cy="400" r="320" stroke="white" strokeWidth="0.8" fill="none" />
          <circle cx="1100" cy="80" r="260" stroke="white" strokeWidth="0.8" fill="none" />
          <circle cx="600" cy="500" r="200" stroke="white" strokeWidth="0.6" fill="none" />
        </svg>
      </div>

      <div className="container-sv relative z-10 text-center">
        <p className="text-[#2fa3f2] font-bold text-xs uppercase tracking-[0.3em] mb-4">{eyebrow}</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          {description}
        </p>

        <div className="max-w-lg mx-auto mb-10 relative z-50">
          <SearchBar showButton={false} placeholder="Search destinations…" />
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          {stats.map(stat => (
            <div key={stat.label} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-white font-bold text-sm">{stat.value}</span>
              <span className="text-white/60 text-xs font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
