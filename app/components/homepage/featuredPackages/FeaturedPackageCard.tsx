"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Package } from "./featuredPackages.types";
import { ratingStyles, durationStyles, categoryStyles, bookBtnStyles } from "./featuredPackages.styles";
import { useCurrency } from "@/app/hooks/useCurrency";

interface FeaturedPackageCardProps {
  pkg: Package;
  index?: number;
}

export default function FeaturedPackageCard({ pkg, index = 0 }: FeaturedPackageCardProps) {
  const { formatPrice } = useCurrency();

  const hasDiscount = pkg.price?.originalAmount && pkg.price.originalAmount > pkg.price.amount;
  const savings = hasDiscount ? pkg.price.originalAmount! - pkg.price.amount : 0;

  return (
    <article 
      className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#1a3f4e]/12 transition-all duration-500 hover:-translate-y-2.5 flex flex-col h-full relative"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* ── Image Area & Gradient Overlay ──────────────────────────────── */}
      <div className="relative h-64 overflow-hidden shrink-0">
        <Image 
          src={pkg.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80'} 
          alt={pkg.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={index === 0}
        />
        
        {/* Modern Rich Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a3f4e]/85 via-[#1a3f4e]/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />

        {/* Dynamic Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-2">
          {hasDiscount && (
            <div className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Save {formatPrice(savings, pkg.price.currency)}
            </div>
          )}
          <div className="bg-white/90 backdrop-blur-md text-[#1a3f4e] text-[9px] font-black px-3.5 py-1.5 rounded-full shadow-sm uppercase tracking-widest">
            💎 Elite Curated
          </div>
        </div>

        {/* Rating Floating Chip */}
        <div className="absolute top-5 right-5 bg-white/92 backdrop-blur-md text-[#1a3f4e] text-[10px] font-black px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1" style={ratingStyles}>
          <span className="text-amber-400 text-sm leading-none">★</span> {pkg.rating.toFixed(1)}
        </div>

        {/* Duration Floating Bottom-Left Chip */}
        <div className="absolute bottom-5 left-5 bg-[#2fa3f2] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg ring-4 ring-[#2fa3f2]/30" style={durationStyles}>
          📅 {pkg.duration}
        </div>
      </div>

      {/* ── Content Area ──────────────────────────────────────────────── */}
      <div className="p-7 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-display text-base font-extrabold text-[#1a3f4e] mb-3 line-clamp-2 leading-snug group-hover:text-[#2fa3f2] transition-colors duration-300">
          {pkg.title}
        </h3>

        {/* Feature Icons Grid (Max Guests & Elite Details) */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            <svg className="w-3.5 h-3.5 text-[#2fa3f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Max {pkg.maxGuests} Guests</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Verified Luxury</span>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between gap-4" style={{ borderTop: '1px solid #f1f5f9' }}>
          <div>
            {hasDiscount && (
              <p className="text-[10px] text-gray-400 line-through mb-0.5 font-bold tracking-wider">
                {formatPrice(pkg.price.originalAmount!, pkg.price.currency)}
              </p>
            )}
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-[#1a3f4e] tracking-tight">
                {formatPrice(pkg.price.amount, pkg.price.currency)}
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">/person</span>
            </div>
          </div>

          <Link
            href={`/packages/${pkg.slug}`}
            className="flex-1 max-w-[130px] py-3.5 rounded-2xl bg-[#1a3f4e] text-white text-[11px] font-black text-center shadow-lg shadow-[#1a3f4e]/15 hover:bg-[#2fa3f2] hover:shadow-[#2fa3f2]/25 hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-widest no-underline"
          >
            <button className="w-full h-full text-white font-black" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              Explore
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
}
