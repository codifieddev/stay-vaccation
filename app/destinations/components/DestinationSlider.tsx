"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useCurrency } from "@/app/hooks/useCurrency";
import "swiper/css";
import "swiper/css/navigation";

interface Destination {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  packageCount?: number;
  startingPrice?: number;
  isTrending?: boolean;
}

interface DestinationSliderProps {
  destinations: Destination[];
}

function TrendingSliderCard({ dest, index }: { dest: Destination; index: number }) {
  const { convert } = useCurrency();
  const [imgFailed, setImgFailed] = useState(false);
  const hasPrice = (dest.startingPrice || 0) > 0;
  const { amountFormatted, symbol } = convert(dest.startingPrice || 0, "INR");

  return (
    <Link
      href={`/destinations/${dest.slug}`}
      className="group relative block overflow-hidden rounded-[2rem] shadow-lg transition-all duration-500 h-[420px]"
    >
      {/* Full-bleed image */}
      {dest.image && !imgFailed ? (
        <Image
          src={dest.image}
          alt={dest.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={() => setImgFailed(true)}
          priority={index < 4}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3f4e] via-[#2a5f74] to-[#1a7abf]" />
      )}

      {/* Initial Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500" />
      
      {/* Hover Overlay — darker and more saturated */}
      <div className="absolute inset-0 bg-[#1a3f4e]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]" />

      {/* 🔥 Trending badge (Always visible) */}
      <div className="absolute top-5 left-5 z-20">
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
          🔥 Trending
        </span>
      </div>

      {/* Content Container */}
      <div className="absolute inset-x-0 bottom-0 p-8 z-20 flex flex-col justify-end min-h-[50%]">
        {/* Name (Always visible, shifts up on hover) */}
        <h3 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight mb-2 drop-shadow-xl group-hover:-translate-y-2 transition-transform duration-500">
          {dest.name}
        </h3>

        {/* Hover-only content (Price + CTA) */}
        <div className="max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden">
          <div className="flex items-end justify-between pt-4 border-t border-white/20">
            <div>
              {hasPrice ? (
                <>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                    Starting from
                  </p>
                  <p className="text-[#2fa3f2] font-black text-2xl leading-none">
                    {symbol}&nbsp;{amountFormatted}
                  </p>
                </>
              ) : (
                <p className="text-white/70 text-xs font-medium">
                  {dest.packageCount ?? 0} Packages Available
                </p>
              )}
            </div>

            {/* Arrow CTA */}
            <div className="w-12 h-12 rounded-2xl bg-[#2fa3f2] flex items-center justify-center shadow-lg group-hover:rotate-[-45deg] transition-all duration-500">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DestinationSlider({ destinations }: DestinationSliderProps) {
  if (destinations.length === 0) return null;

  return (
    <section className="section-pad bg-white overflow-hidden">
      <div className="container-sv relative">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10 gap-4 pr-20 md:pr-0">
          <div>
            <p className="text-[#2fa3f2] font-bold text-xs uppercase tracking-[0.3em] mb-2">
              🔥 Hot Right Now
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-[#1a3f4e] leading-tight">
              Trending Destinations
            </h2>
            <p className="text-gray-500 text-sm mt-2 max-w-md leading-relaxed">
              Curated by our travel experts — the places everyone is talking about right now.
            </p>
          </div>
          <Link
            href="#all-destinations"
            className="flex-shrink-0 hidden md:flex items-center gap-2 text-[#1a3f4e] font-bold text-sm hover:text-[#2fa3f2] transition-colors group"
          >
            <span className="border-b-2 border-[#2fa3f2]/30 group-hover:border-[#2fa3f2] pb-0.5 transition-colors">
              View All
            </span>
            <svg className="w-4 h-4 text-[#2fa3f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Swiper Slider */}
        <div className="relative group/slider px-2 md:px-0">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1.2}
            navigation={{
              prevEl: ".trending-prev",
              nextEl: ".trending-next",
            }}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="!overflow-visible"
          >
            {destinations.map((dest, i) => (
              <SwiperSlide key={dest._id}>
                <TrendingSliderCard dest={dest} index={i} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Arrows (On Edges) */}
          <button className="trending-prev absolute left-0 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center text-[#1a3f4e] hover:bg-[#1a3f4e] hover:text-white transition-all duration-300 border border-gray-100 opacity-0 group-hover/slider:opacity-100 -translate-x-4 group-hover/slider:translate-x-0 disabled:opacity-0 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="trending-next absolute right-0 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center text-[#1a3f4e] hover:bg-[#1a3f4e] hover:text-white transition-all duration-300 border border-gray-100 opacity-0 group-hover/slider:opacity-100 translate-x-4 group-hover/slider:translate-x-0 disabled:opacity-0 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
