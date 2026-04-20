"use client";

import Link from "next/link";
import Image from "next/image";

interface Package {
  id: string;
  title: string;
  destination: string;
  tripDuration: string;
  travelStyle: string;
  tourType: string;
  exclusivityLevel: string;
  price: { 
    currency: string; 
    amount: number | string;
    originalAmount?: number | string; 
  };
  shortDescription: string;
  inclusions?: string[];
  itinerary?: any[];
  additionalInfo?: {
    quickInfo?: {
      destinationsCovered?: string;
    };
  };
  images?: string[];
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ", SGD: "S$", AUD: "A$", THB: "฿",
};

export default function PackageCard({ pkg, index = 0 }: { pkg: Package; index?: number }) {
  const sym = CURRENCY_SYMBOLS[pkg.price?.currency] || pkg.price?.currency || "₹";
  
  // Format Price
  const amount = Number(pkg.price?.amount) || 0;
  const originalAmount = Number(pkg.price?.originalAmount) || 0;
  const hasDiscount = originalAmount > amount;
  const discountPercent = hasDiscount ? Math.round(((originalAmount - amount) / originalAmount) * 100) : 0;

  // Format Duration
  const daysMatch = pkg.tripDuration?.match(/(\d+)\s*Days?/i);
  const nightsMatch = pkg.tripDuration?.match(/(\d+)\s*Nights?/i);
  const days = daysMatch ? daysMatch[1] : "—";
  const nights = nightsMatch ? nightsMatch[1] : (daysMatch ? String(Number(days) - 1) : "—");
  const durationLabel = `${nights}N/${days}D`;

  // Detect Inclusions
  const hasHotel = pkg.itinerary?.some(d => d.hotelStays?.length > 0) || false;
  const hasMeals = pkg.itinerary?.some(d => d.mealsIncluded?.length > 0) || false;
  const hasSightseeing = pkg.itinerary?.some(d => d.activities?.length > 0) || false;

  // Locations covered
  const locations = pkg.additionalInfo?.quickInfo?.destinationsCovered || pkg.destination;

  // Featured Image
  const featuredImage = pkg.images?.[0] || 
    pkg.itinerary?.find(d => d.hotelStays?.[0]?.hotelData?.images?.[0])?.hotelStays?.[0]?.hotelData?.images?.[0] ||
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

  return (
    <div 
      className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#1a3f4e]/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full relative"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* ── Image Area ─────────────────────────────────────────────────── */}
      <div className="relative h-64 overflow-hidden shrink-0">
        <Image 
          src={featuredImage} 
          alt={pkg.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {hasDiscount && (
            <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
              {discountPercent}% OFF
            </div>
          )}
          <div className="bg-white/90 backdrop-blur-md text-[#1a3f4e] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
            {pkg.travelStyle}
          </div>
        </div>

        {/* Duration Chip */}
        <div className="absolute top-4 right-4 bg-[#2fa3f2] text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg ring-4 ring-[#2fa3f2]/20">
          {durationLabel}
        </div>

        {/* Inclusions floating bar */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
           <div className="flex items-center gap-4">
              <div title="Stays Included" className={`flex flex-col items-center transition-colors ${hasHotel ? "text-white" : "text-white/30"}`}>
                <svg className="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <span className="text-[8px] font-bold uppercase tracking-tighter">Hotel</span>
              </div>
              <div title="Meals Included" className={`flex flex-col items-center transition-colors ${hasMeals ? "text-white" : "text-white/30"}`}>
                <svg className="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" /></svg>
                <span className="text-[8px] font-bold uppercase tracking-tighter">Meals</span>
              </div>
              <div title="Sightseeing" className={`flex flex-col items-center transition-colors ${hasSightseeing ? "text-white" : "text-white/30"}`}>
                 <svg className="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2 2 2 0 012 2v.657m1.445-4.314a11.034 11.034 0 001.445-4.314" /></svg>
                 <span className="text-[8px] font-bold uppercase tracking-tighter">Visit</span>
              </div>
           </div>
           <div className="text-white/80 text-[10px] font-medium">+ More</div>
        </div>
      </div>

      {/* ── Content Area ────────────────────────────────────────────────── */}
      <div className="p-6 flex flex-col flex-1">
        {/* Locations Covered */}
        <div className="flex items-start gap-2 mb-3">
          <svg className="w-4 h-4 text-[#2fa3f2] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider line-clamp-1">
            {locations}
          </p>
        </div>

        {/* Title */}
        <h3 className="font-display text-xl font-bold text-[#1a3f4e] mb-3 line-clamp-2 leading-snug group-hover:text-[#2fa3f2] transition-colors">
          {pkg.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-6">
          {pkg.shortDescription}
        </p>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="mt-auto pt-5 border-t border-gray-100 flex items-end justify-between gap-4">
          <div className="shrink-0">
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through mb-0.5">
                {sym}{Number(originalAmount).toLocaleString()}
              </p>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#1a3f4e] tracking-tight">{sym}{amount.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">/ Person</span>
            </div>
          </div>

          <Link
            href={`/packages/${pkg.id}`}
            className="flex-1 max-w-[140px] py-3 bg-[#1a3f4e] text-white text-xs font-bold rounded-xl text-center shadow-lg shadow-[#1a3f4e]/20 hover:bg-[#2fa3f2] hover:shadow-[#2fa3f2]/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
