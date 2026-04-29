"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCurrency } from "@/app/hooks/useCurrency";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { fetchTrending } from "@/app/store/features/destinations/destinationThunks";

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Destination {
  _id?: string;
  name?: string;
  title?: string;
  slug: string;
  image?: string;
  price?: string | number;
  category?: string;
  isTrending?: boolean;
  description?: string;
  packageCount?: number;
  startingPrice?: number;
}

// ─── Image card ───────────────────────────────────────────────────────────────
function DestinationCardImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a3f4e] via-[#2a5f74] to-[#1a7abf]" />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 300px"
      className="object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out"
      onError={() => setFailed(true)}
    />
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="w-full h-[450px] rounded-[32px] bg-gradient-to-b from-gray-200 to-gray-100 animate-pulse" />
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center py-20 min-h-[400px] w-full bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
      <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h4 className="text-[#1a3f4e] font-bold text-2xl mb-2">No {tab} Destinations Found</h4>
      <p className="text-gray-400 text-sm max-w-xs text-center leading-relaxed mb-8">
        We haven't marked any {tab.toLowerCase()} destinations as trending yet. 
      </p>
      <Link
        href="/destinations"
        className="px-8 py-3 bg-[#1a3f4e] text-white font-bold rounded-full hover:shadow-xl hover:-translate-y-1 transition-all"
      >
        Explore All Destinations
      </Link>
    </div>
  );
}

// ─── Destination card ─────────────────────────────────────────────────────────
function DestinationCard({ dest, index }: { dest: Destination; index: number }) {
  const price = dest.startingPrice || Number(dest.price) || 0;
  const hasPrice = price > 0;
  const { convert } = useCurrency();
  const { amountFormatted, symbol } = convert(price, "INR");

  return (
    <Link
      href={`/destinations/${dest.slug}`}
      className="group block h-[450px] bg-[#1a3f4e] rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#2fa3f2]/20 transition-all duration-500 relative"
    >
      <div className="absolute inset-0">
        <DestinationCardImage src={dest.image} alt={dest.title || "Destination"} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-100" />

      <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-center text-center z-10 transition-transform duration-500 group-hover:-translate-y-2">
        <h3 className="text-white font-display font-bold text-3xl leading-tight mb-3 drop-shadow-lg">
          {dest.title || dest.name}
        </h3>
        
        <div className="flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-[#2fa3f2] text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
            {dest.packageCount} {dest.packageCount === 1 ? "Package" : "Packages"}
          </span>
          
          {hasPrice && (
            <div className="mt-3">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Starting From</p>
              <p className="text-white font-bold text-2xl">
                {symbol} {amountFormatted}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 z-20">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TrendingDestinations() {
  const [activeTab, setActiveTab] = useState<"India" | "International">("India");
  const dispatch = useAppDispatch();
  const { trendingIndia, trendingInternational, loading: reduxLoading, error: reduxError } = useAppSelector(state => state.destinations);
  
  useEffect(() => {
    dispatch(fetchTrending("India"));
    dispatch(fetchTrending("International"));
  }, [dispatch]);
  
  const loading = reduxLoading && trendingIndia.length === 0 && trendingInternational.length === 0;
  const error = !!reduxError;
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const displayedItems = activeTab === "India" ? trendingIndia : trendingInternational;

  return (
    <section className="section-pad bg-white overflow-hidden">
      <div className="container-sv relative">

        {/* ── Header & Tabs ────────────────────────────────────── */}
        <div className="flex flex-col items-center mb-16">
          <p className="text-[#2fa3f2] font-bold text-xs uppercase tracking-[0.3em] mb-4">
            Curated For You
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-[#1a3f4e] text-center mb-10 leading-tight">
            Trending Holiday <br /> Destinations
          </h2>

          <div className="flex bg-gray-100/80 p-1.5 rounded-full backdrop-blur-sm border border-gray-200/50">
            {(["India", "International"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-10 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-500 ${
                  activeTab === tab
                    ? "bg-[#1a3f4e] text-white shadow-xl scale-105"
                    : "text-gray-400 hover:text-[#1a3f4e]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Slider Area ───────────────────────────────────────── */}
        <div className="relative px-4 md:px-16">
          
          {/* Custom Navigation Arrows (Outside) */}
          <button
            ref={prevRef}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white border border-gray-100 shadow-xl flex items-center justify-center text-[#1a3f4e] hover:bg-[#1a3f4e] hover:text-white transition-all z-30 hidden lg:flex disabled:opacity-30 disabled:cursor-not-allowed group"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            ref={nextRef}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white border border-gray-100 shadow-xl flex items-center justify-center text-[#1a3f4e] hover:bg-[#1a3f4e] hover:text-white transition-all z-30 hidden lg:flex disabled:opacity-30 disabled:cursor-not-allowed group"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {error ? (
            <div className="text-center py-20 bg-red-50/50 rounded-[40px] border border-dashed border-red-100">
              <p className="text-red-400 font-bold">Failed to load destinations. Please try again later.</p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : displayedItems.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              onBeforeInit={(swiper) => {
                // @ts-ignore
                swiper.params.navigation.prevEl = prevRef.current;
                // @ts-ignore
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              className="!pb-16 !px-2"
            >
              {displayedItems.map((dest, i) => (
                <SwiperSlide key={dest._id || i}>
                  <DestinationCard dest={dest} index={i} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <EmptyState tab={activeTab} />
          )}
        </div>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <div className="text-center mt-8">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-3 text-[#1a3f4e] font-bold hover:gap-5 transition-all group"
          >
            <span className="border-b-2 border-[#2fa3f2]/30 group-hover:border-[#2fa3f2] pb-1">
              Explore All Destinations
            </span>
            <svg className="w-5 h-5 text-[#2fa3f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

      </div>

      <style jsx global>{`
        .swiper-pagination-bullet-active {
          background: #1a3f4e !important;
          width: 24px !important;
          border-radius: 4px !important;
        }
        .swiper-button-disabled {
          opacity: 0.1 !important;
        }
      `}</style>
    </section>
  );
}
