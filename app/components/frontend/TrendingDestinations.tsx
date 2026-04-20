"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export interface Destination {
  _id?: string;
  title: string;
  slug: string;
  icon?: string;
  image?: string;
  price?: string | number;
  label?: string;
  type?: string;
  description?: string;
}

const FALLBACK_DESTINATIONS: Destination[] = [
  // INDIA 
  { title: "Kashmir", slug: "kashmir", image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Paradise on Earth", price: 12499 },
  { title: "Goa", slug: "goa", image: "https://images.unsplash.com/photo-1512356181113-853a150f1ea7?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Sun, Sand & Sea", price: 8999 },
  { title: "Himachal", slug: "himachal", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Valley of Gods", price: 9999 },
  { title: "Manali", slug: "manali", image: "https://images.unsplash.com/photo-1594142571210-9cf63657739f?q=80&w=1974&auto=format&fit=crop", type: "india", label: "Mountain Escapes", price: 7499 },
  { title: "Kerala", slug: "kerala", image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2069&auto=format&fit=crop", type: "india", label: "Backwater Bliss", price: 11499 },
  { title: "Jaipur", slug: "jaipur", image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=2071&auto=format&fit=crop", type: "india", label: "The Pink City", price: 6999 },
  { title: "Munnar", slug: "munnar", image: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Tea Garden Serenity", price: 8499 },
  { title: "Andaman", slug: "andaman", image: "https://images.unsplash.com/photo-1589330273594-fade1ee91647?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Crystal Waters", price: 21499 },
  { title: "Leh Ladakh", slug: "leh-ladakh", image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=2070&auto=format&fit=crop", type: "india", label: "High Pass Adventure", price: 18999 },

  // INTERNATIONAL
  { title: "Thailand", slug: "thailand", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Tropical Gateway", price: 34999 },
  { title: "Bali", slug: "bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1938&auto=format&fit=crop", type: "international", label: "Island of Gods", price: 42999 },
  { title: "Dubai", slug: "dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Luxury & Innovation", price: 54999 },
  { title: "Paris", slug: "paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop", type: "international", label: "City of Love", price: 124999 },
  { title: "Tokyo", slug: "tokyo", image: "https://images.unsplash.com/photo-1540959733332-e94e270b2d42?q=80&w=2041&auto=format&fit=crop", type: "international", label: "Future & Heritage", price: 89999 },
  { title: "Switzerland", slug: "switzerland", image: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Alpine Escapes", price: 154999 },
  { title: "Singapore", slug: "singapore", image: "https://images.unsplash.com/photo-1525625239514-75b436f0102b?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Garden City", price: 44999 },
  { title: "Santorini", slug: "santorini", image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Aegean Dream", price: 164999 },
  { title: "London", slug: "london", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Historic Splendour", price: 114999 },
];

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop";

function DestinationCardImage({ src, alt }: { src?: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_IMAGE);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out"
      onError={() => setImgSrc(DEFAULT_IMAGE)}
    />
  );
}

export default function TrendingDestinations({ destinations: initialDestinations = [] }: { destinations?: Destination[] }) {
  const [activeTab, setActiveTab] = useState<"india" | "international">("india");
  const [items, setItems] = useState<Destination[]>(initialDestinations);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/destinations")
      .then(res => res.json())
      .then(data => {
        console.log("Trending Destinations API Response:", data);
        if (data.success && data.data) {
          // Schema Validation: title, slug, image, type
          const validItems = data.data.filter((item: any) => {
            const isValid = item.title && item.slug && item.image && item.type;
            if (!isValid) {
              console.warn("Skipping destination due to missing required fields (title, slug, image, type):", item);
            }
            return isValid;
          });

          if (validItems.length === 0) {
            console.warn("DB is empty or data is invalid. Showing fallback dummy destinations.");
            setItems(FALLBACK_DESTINATIONS);
          } else {
            setItems(validItems);
          }
        } else {
          // If API fails or success is false, use fallback
          setItems(FALLBACK_DESTINATIONS);
        }
      })
      .catch(err => {
        console.error("Error fetching trending destinations:", err);
        setItems(FALLBACK_DESTINATIONS);
      });
  }, []);

  // Filter based on the selected type, case insensitive check for robustness.
  const filteredDestinations = items.filter(dest => {
    const destType = (dest.type || "").toLowerCase().trim();
    if (activeTab === "india") {
      return destType === "india";
    } else {
      return destType === "international";
    }
  });

  const handleTabChange = (tab: "india" | "international") => {
    setActiveTab(tab);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className="section-pad bg-white border-b border-gray-50">
      <div className="container-sv">
        {/* Header & Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div>
            <p className="text-[#2fa3f2] font-semibold text-sm uppercase tracking-widest mb-2 md:text-left text-center">Top Picks</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#1a3f4e] text-center md:text-left">Trending Holiday Destinations</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Toggle Buttons */}
            <div className="flex bg-gray-100 p-1 rounded-full shrink-0">
              <button
                onClick={() => handleTabChange("india")}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === "india"
                    ? "bg-white text-[#1a3f4e] shadow-sm"
                    : "text-gray-500 hover:text-[#1a3f4e]"
                  }`}
              >
                India
              </button>
              <button
                onClick={() => handleTabChange("international")}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === "international"
                    ? "bg-white text-[#1a3f4e] shadow-sm"
                    : "text-gray-500 hover:text-[#1a3f4e]"
                  }`}
              >
                International
              </button>
            </div>

            {/* Navigation Arrows */}
            <div className="hidden md:flex gap-2">
              <button
                onClick={scrollLeft}
                className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-[#2fa3f2] hover:text-white hover:border-[#2fa3f2] transition-colors focus:outline-none"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={scrollRight}
                className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-[#2fa3f2] hover:text-white hover:border-[#2fa3f2] transition-colors focus:outline-none"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Cards */}
        <div className="relative group/scroll">
          {/* Fading edges for scroll indication */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none hidden md:block" />

          {/* scrollbar-width: none is available natively in many modern browsers, masking scrollbar but allowing scroll */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-hide md:-mx-4 md:px-4 [&::-webkit-scrollbar]:hidden"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {filteredDestinations.length > 0 ? (
              filteredDestinations.map((dest, i) => (
                <Link
                  href={`/destinations/${dest.slug}`}
                  key={dest.slug || i}
                  className="snap-start shrink-0 w-[240px] h-[360px] group block bg-[#1a3f4e] rounded-[100px] overflow-hidden shadow-md hover:shadow-2xl hover:shadow-[#2fa3f2]/20 transition-all duration-500 hover:-translate-y-2 relative"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Image Area Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a3f4e] via-[#2a5f74] to-[#1a7abf]">
                    <DestinationCardImage src={dest.image} alt={dest.title || "Destination"} />
                  </div>

                  {/* Always Visible Content Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 flex flex-col items-center justify-center p-6 text-center z-10">
                    <h3 className="text-white font-display font-bold text-3xl leading-tight mb-2 group-hover:-translate-y-8 transition-transform duration-500 ease-out">{dest.title}</h3>
                    <p className="text-white/80 font-medium text-sm group-hover:-translate-y-8 transition-transform duration-500 ease-out">{dest.label}</p>
                  </div>

                  {/* Hover Overlay at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 pt-12 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center text-center opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out z-20">
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Starting at</p>
                    <p className="text-white font-bold text-2xl mb-4">₹ {dest.price}</p>

                    {/* Arrow Button */}
                    <div className="w-12 h-12 bg-[#2fa3f2] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-white hover:text-[#2fa3f2] transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>

                </Link>
              ))
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center py-20 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100 min-h-[360px]">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-[#1a3f4e] font-bold text-xl mb-2">No destinations available</h4>
                <p className="text-gray-400 text-sm max-w-[280px] text-center leading-relaxed">
                  We couldn't find any destinations for this category yet. Check back soon for new getaways!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 mb-4">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-[#1a3f4e] text-[#1a3f4e] font-bold rounded-full hover:bg-[#1a3f4e] hover:text-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            Explore Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}
