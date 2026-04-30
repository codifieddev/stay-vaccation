"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCurrency } from "@/app/hooks/useCurrency";

interface Package {
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

interface BestSellerCardProps {
  pkg: Package;
  index: number;
}

export default function BestSellerCard({ pkg, index }: BestSellerCardProps) {
  const { convert } = useCurrency();
  const [imgFailed, setImgFailed] = useState(false);
  
  const baseAmount = pkg.price.amount || 0;
  const baseOriginalAmount = pkg.price.originalAmount || 0;
  
  const currentPrice = convert(baseAmount, "INR");
  const originalPrice = convert(baseOriginalAmount, "INR");
  const hasDiscount = originalPrice.amount > currentPrice.amount;
  
  const featuredImage = pkg.images?.[0] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

  return (
    <div 
      className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#1a3f4e]/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full relative"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Image Area */}
      <div className="relative h-60 overflow-hidden shrink-0">
        <Image 
          src={featuredImage} 
          alt={pkg.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImgFailed(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {hasDiscount && (
            <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
              SPECIAL OFFER
            </div>
          )}
          <div className="bg-white/90 backdrop-blur-md text-[#1a3f4e] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
            {pkg.travelStyle || "Trending"}
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-4 right-4 bg-[#2fa3f2] text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg">
          {pkg.tripDuration}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1">
        {/* Destination */}
        <div className="flex items-start gap-2 mb-3">
          <svg className="w-4 h-4 text-[#2fa3f2] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider truncate">
            {pkg.destination}
          </p>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-bold text-[#1a3f4e] mb-3 line-clamp-2 leading-snug group-hover:text-[#2fa3f2] transition-colors">
          {pkg.title}
        </h3>

        {/* Footer */}
        <div className="mt-auto pt-5 border-t border-gray-100 flex items-end justify-between gap-4">
          <div className="shrink-0">
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through mb-0.5">
                {currentPrice.symbol} {originalPrice.amountFormatted}
              </p>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-[#1a3f4e] tracking-tight">
                {currentPrice.symbol} {currentPrice.amountFormatted}
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase">/ Person</span>
            </div>
          </div>

          <Link
            href={`/packages/${pkg.id}`}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1a3f4e] text-white flex items-center justify-center hover:bg-[#2fa3f2] transition-all duration-300 shadow-lg shadow-[#1a3f4e]/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
