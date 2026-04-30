"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCurrency } from "@/app/hooks/useCurrency";

interface DestinationCardProps {
  dest: {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    description?: string;
    category?: string;
    packageCount?: number;
    startingPrice?: number;
    isTrending?: boolean;
  };
  index: number;
}

export default function DestinationCard({ dest, index }: DestinationCardProps) {
  const { convert } = useCurrency();
  const [imgFailed, setImgFailed] = useState(false);
  const hasPrice = (dest.startingPrice || 0) > 0;
  const { amountFormatted, symbol } = convert(dest.startingPrice || 0, "INR");

  return (
    <Link
      href={`/destinations/${dest.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-[#1a3f4e] shadow-md hover:shadow-2xl hover:shadow-[#2fa3f2]/20 transition-all duration-500 hover:-translate-y-1 h-full"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
    >
      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-[#1a3f4e] to-[#2a5f74] flex-shrink-0">
        {dest.image && !imgFailed ? (
          <Image
            src={dest.image}
            alt={dest.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
            onError={() => setImgFailed(true)}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {dest.category && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white border border-white/30">
              {dest.category === "India" ? "🇮🇳" : "✈️"} {dest.category}
            </span>
          </div>
        )}

        {dest.isTrending && (
          <div className="absolute top-4 right-4">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/90 text-amber-900 shadow">
              🔥 Trending
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-4">
          <span className="inline-flex items-center gap-1.5 bg-[#2fa3f2] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow">
            {dest.packageCount ?? 0}&nbsp;{(dest.packageCount ?? 0) === 1 ? "Package" : "Packages"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 bg-white">
        <div className="flex items-start justify-between gap-2 flex-1">
          <div className="min-w-0">
            <h3 className="font-bold text-[#1a3f4e] text-base leading-tight mb-1 group-hover:text-[#2fa3f2] transition-colors truncate">
              {dest.name}
            </h3>
            {dest.description && (
              <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{dest.description}</p>
            )}
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#F4F9E9] flex items-center justify-center text-[#2fa3f2] group-hover:bg-[#2fa3f2] group-hover:text-white transition-all duration-300">
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>

        {hasPrice && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Starting from</span>
            <span className="text-sm font-bold text-[#1a3f4e]">{symbol} {amountFormatted}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
