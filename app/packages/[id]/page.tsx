"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAppSelector } from "@/app/store/hooks";
import { useCurrency } from "@/app/hooks/useCurrency";
import LayoutV2 from "../../layouts-v2/LayoutV2";
import Image from "next/image";
import LucideIcon from "../../components/LucideIcon";
import { useParams } from "next/navigation";

const DAY_COLORS: Record<string, string> = {
  arrival: "border-l-emerald-500 bg-emerald-50",
  sightseeing: "border-l-blue-500 bg-blue-50",
  transfer: "border-l-orange-500 bg-orange-50",
  leisure: "border-l-violet-500 bg-violet-50",
  departure: "border-l-slate-400 bg-slate-50",
};

const DAY_TYPE_BADGE: Record<string, string> = {
  arrival: "bg-emerald-100 text-emerald-700",
  sightseeing: "bg-blue-100 text-blue-700",
  transfer: "bg-orange-100 text-orange-700",
  leisure: "bg-violet-100 text-violet-700",
  departure: "bg-slate-100 text-slate-600",
};

function fmt12(t: string) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${(h % 12) || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

const TABS = ["Overview", "Itinerary", "Activities", "Hotels", "Transfers", "Policies", "Reviews"];

const HeroSlider = ({ images, title }: { images: string[]; title: string }) => {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx(p => (p + 1) % images.length);
  const prev = () => setIdx(p => (p - 1 + images.length) % images.length);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div className="relative w-full aspect-[4/3] lg:aspect-square rounded-[2rem] overflow-hidden shadow-xl group border border-gray-100">
      {images.map((img, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
          <Image src={img} alt={`${title} ${i}`} fill className="object-cover" priority={i === 0} sizes="(max-w-lg) 100vw, 500px" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-20 pointer-events-none" />
      
      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {images.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-[#4a90e2]" : "w-2 bg-white/40 hover:bg-white/60"}`} />
        ))}
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-30 hover:bg-[#4a90e2]">
        <LucideIcon name="ChevronLeft" size={20} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-30 hover:bg-[#4a90e2]">
        <LucideIcon name="ChevronRight" size={20} />
      </button>
    </div>
  );
};

const Lightbox = ({ images, initialIdx, onClose }: { images: string[]; initialIdx: number; onClose: () => void }) => {
  const [idx, setIdx] = useState(initialIdx);
  const next = (e?: React.MouseEvent) => { e?.stopPropagation(); setIdx((p) => (p + 1) % images.length); };
  const prev = (e?: React.MouseEvent) => { e?.stopPropagation(); setIdx((p) => (p - 1 + images.length) % images.length); };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 lg:p-10" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white z-[110] transition-colors">
        <LucideIcon name="X" size={32} />
      </button>

      <div className="relative w-full h-full max-w-6xl mx-auto flex items-center justify-center" onClick={e => e.stopPropagation()}>
        <Image 
          src={images[idx]} 
          alt={`Gallery Image ${idx + 1}`} 
          fill 
          className="object-contain"
          sizes="100vw"
        />
      </div>

      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all z-[110]">
            <LucideIcon name="ChevronLeft" size={24} />
          </button>
          <button onClick={next} className="absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all z-[110]">
            <LucideIcon name="ChevronRight" size={24} />
          </button>
        </>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium tracking-widest z-[110]">
        {idx + 1} / {images.length}
      </div>
    </div>
  );
};

export default function SinglePackagePage() {
  const params = useParams();
  const matchedId = params?.id as string;

  const { packages, loading: reduxLoading } = useAppSelector(state => state.packages);
  const { user } = useAppSelector(state => state.auth);
  const pkg = packages.find(p => p.id === matchedId || p._id === matchedId);
  const loading = reduxLoading && !pkg;
  
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState("Overview");
  const [openDays, setOpenDays] = useState<Set<number>>(new Set([0]));

  // Enquiry form state
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", adults: "2", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isFormValid = !!(
    form.name.trim() && 
    form.email.trim() && 
    form.phone.trim() && 
    form.date && 
    form.adults
  );

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [openPolicy, setOpenPolicy] = useState<string | null>("Cancellation");
  const tabBarRef = useRef<HTMLDivElement>(null);

  const toggleDay = (i: number) => {
    setOpenDays(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (form.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Enter a valid 10-digit number";
    }

    if (!form.date) newErrors.date = "Travel date is required";
    if (!form.adults || Number(form.adults) < 1) newErrors.adults = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSending(true);
    setServerError(null);

    try {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 2000);
      });
      setSent(true);
    } catch (err) {
      setServerError("Failed to send enquiry. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  if (loading) {
    return (
      <LayoutV2>
        <div className="min-h-[70vh] flex items-center justify-center pt-20 bg-white">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-[#4a90e2] rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-gray-400 text-xs font-bold">Loading package details…</p>
          </div>
        </div>
      </LayoutV2>
    );
  }

  if (!pkg) {
    return (
      <LayoutV2>
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 pt-20 px-6">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-6">🏜️</div>
            <h1 className="text-3xl font-extrabold text-[#1a3f4e] mb-3 font-['Poppins']">Package Not Found</h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">This package may have been temporarily removed or its link has changed.</p>
            <Link href="/packages" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(255,149,0,0.15)] hover:shadow-[0_6px_20px_rgba(255,149,0,0.3)] hover:-translate-y-0.5">
              Browse All Packages
            </Link>
          </div>
        </div>
      </LayoutV2>
    );
  }

  const basePriceValue = Number(pkg.price?.amount) || 0;
  const discountedPriceValue = Number(pkg.price?.originalAmount) || 0;
  
  const hasDiscount = discountedPriceValue > 0 && discountedPriceValue < basePriceValue;
  const savingsValue = hasDiscount ? basePriceValue - discountedPriceValue : 0;

  const mainPrice = hasDiscount ? formatPrice(discountedPriceValue, "INR") : formatPrice(basePriceValue, "INR");
  const strikePrice = hasDiscount ? formatPrice(basePriceValue, "INR") : null;
  const savings = hasDiscount ? formatPrice(savingsValue, "INR") : null;
  const days = pkg.tripDuration?.match(/^(\d+)/)?.[1] || "—";
  const nights = pkg.tripDuration?.match(/(\d+)\s*Night/i)?.[1] || String(Number(days) - 1);

  const maxTravelersLimit = pkg.maxTravelersLimit;
  const availableSeats = pkg.availableSeats;
  const isSoldOut = maxTravelersLimit !== undefined && availableSeats !== undefined && availableSeats <= 0;
  const isLowSeats = maxTravelersLimit !== undefined && availableSeats !== undefined && availableSeats > 0 && availableSeats <= 5;

  const getBookingUrl = () => {
    const searchParamsObj = new URLSearchParams({
      packageId: matchedId,
      packageName: pkg.title,
      price: String(basePriceValue),
      duration: pkg.duration || pkg.tripDuration || "Flexible",
      destination: pkg.location || pkg.destination || "Global",
      currency: pkg.price?.currency || "INR",
    });
    if (form.date) searchParamsObj.append("date", form.date);
    if (form.adults) searchParamsObj.append("adults", form.adults);
    
    const target = `/booking?${searchParamsObj.toString()}`;
    return user ? target : `/login?from=${encodeURIComponent(target)}`;
  };

  return (
    <LayoutV2>
      {/* ─── HERO & GALLERY ────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-24 bg-[#f8f9fa] overflow-hidden">
        <div className="container-sv relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-12 items-start">
            {/* Left Column */}
            <div className="space-y-10">
              {/* Gallery Grid */}
              <div className="w-full">
                {pkg.images && pkg.images.length >= 5 ? (
                  <div className="relative group cursor-pointer" onClick={() => setLightboxIdx(0)}>
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px] rounded-[2.5rem] flex items-center justify-center z-25">
                        <span className="text-white text-base md:text-lg font-black uppercase tracking-widest border-4 border-white px-6 py-3 rounded-2xl rotate-12 shadow-2xl">
                          Sold Out
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-4 grid-rows-2 gap-3.5 aspect-[16/9] lg:aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl border border-gray-100/30">
                      <div className="col-span-2 row-span-2 relative overflow-hidden">
                        <Image src={pkg.images[0]} alt={`${pkg.title} 1`} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" priority sizes="(max-w-lg) 100vw, 800px" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      </div>
                      {pkg.images.slice(1, 5).map((img, i) => (
                        <div key={i} className="relative overflow-hidden">
                          <Image src={img} alt={`${pkg.title} ${i + 2}`} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" sizes="(max-w-md) 50vw, 400px" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                        </div>
                      ))}
                    </div>
                    
                    {/* View All Photos Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setLightboxIdx(0); }}
                      className="absolute bottom-6 right-6 px-6 py-3.5 bg-white/95 backdrop-blur-md text-[#1a3f4e] rounded-2xl shadow-xl flex items-center gap-2 hover:bg-[#ff6b00] hover:text-white transition-all duration-300 z-20 group/btn border border-white/20"
                    >
                      <LucideIcon name="Grid" size={16} className="group-hover/btn:rotate-12 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-wider">View All {pkg.images.length} Photos</span>
                    </button>
                  </div>
                ) : pkg.images && pkg.images.length > 1 ? (
                  <div className="relative w-full aspect-[4/3] lg:aspect-square">
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px] rounded-[2rem] flex items-center justify-center z-25">
                        <span className="text-white text-base md:text-lg font-black uppercase tracking-widest border-4 border-white px-6 py-3 rounded-2xl rotate-12 shadow-2xl">
                          Sold Out
                        </span>
                      </div>
                    )}
                    <HeroSlider images={pkg.images} title={pkg.title} />
                  </div>
                ) : (
                  <div className="relative w-full aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-150">
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px] rounded-[2.5rem] flex items-center justify-center z-25">
                        <span className="text-white text-base md:text-lg font-black uppercase tracking-widest border-4 border-white px-6 py-3 rounded-2xl rotate-12 shadow-2xl">
                          Sold Out
                        </span>
                      </div>
                    )}
                    <Image src={pkg.coverImage || pkg.images?.[0] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"} alt={pkg.title} fill className="object-cover" />
                  </div>
                )}
              </div>

              {/* Package Header Section */}
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3.5 py-1.5 bg-[#4a90e2]/10 text-[#4a90e2] rounded-full text-[10px] font-black uppercase tracking-wider">{pkg.travelStyle}</span>
                  <span className="px-3.5 py-1.5 bg-orange-50 text-[#ff6b00] rounded-full text-[10px] font-black uppercase tracking-wider">{pkg.tourType}</span>
                  {pkg.summary?.tags?.map(tag => (
                    <span key={tag} className="px-3.5 py-1.5 bg-white text-gray-500 border border-gray-200/60 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="font-['Poppins'] text-3xl md:text-5xl lg:text-[3.25rem] font-extrabold text-[#1a3f4e] leading-[1.1] tracking-tight">
                  {pkg.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-gray-400 pt-2 border-t border-gray-200/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#e8f4fd] flex items-center justify-center text-[#4a90e2]">
                      <LucideIcon name="MapPin" size={14} />
                    </div>
                    <span className="text-[#1a3f4e] font-extrabold text-sm">{pkg.location || pkg.destination}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#ff6b00]">
                      <LucideIcon name="Clock" size={14} />
                    </div>
                    <span className="text-[#1a3f4e] font-extrabold text-sm">{pkg.duration || `${days} Days / ${nights} Nights`}</span>
                  </div>
                  {pkg.rating && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                        <LucideIcon name="Star" size={14} className="fill-amber-500" />
                      </div>
                      <span className="text-[#1a3f4e] font-extrabold text-sm">{pkg.rating} <span className="text-gray-400 font-medium">/ 5 Rating</span></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Highlights List */}
              {(pkg.highlights?.length || pkg.additionalInfo?.experiencesCovered?.length) && (
                <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Trip Highlights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                    {(pkg.highlights?.length ? pkg.highlights : pkg.additionalInfo?.experiencesCovered || []).map((exp: string, i: number) => (
                      <div key={i} className="flex items-start gap-3.5 group">
                        <div className="w-5.5 h-5.5 rounded-full bg-[#e8f4fd] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-[#4a90e2]/15 transition-all duration-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#4a90e2]" />
                        </div>
                        <p className="text-[13px] text-[#1a3f4e] font-bold leading-relaxed">{exp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Description */}
              <div className="max-w-3xl space-y-4 pt-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience Summary</h3>
                <p className="text-base text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                  {pkg.summary?.description || pkg.shortDescription}
                </p>
              </div>

              {/* Tab Navigation Sticky capsule style */}
              <div ref={tabBarRef} className="sticky top-20 z-45 bg-white/80 backdrop-blur-xl border border-gray-100/50 p-2 rounded-2.5xl shadow-[0_15px_40px_rgba(15,23,42,0.04)] mb-10 sticky-tab-nav">
                <div className="flex overflow-x-auto no-scrollbar gap-1">
                  {TABS.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded-2xl transition-all duration-300 ${
                        activeTab === tab 
                          ? "bg-[#4a90e2] text-white shadow-[0_4px_15px_rgba(74,144,226,0.25)] hover:translate-y-[-1px]" 
                          : "text-gray-400 hover:text-[#1a3f4e] hover:bg-gray-50/80"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="pt-4 pb-12">
                {activeTab === "Overview" && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                      <h2 className="font-['Poppins'] font-extrabold text-[#1a3f4e] text-xl mb-6 tracking-tight">🗺️ Trip Summary</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: "Location", value: pkg.location || pkg.destination },
                          { label: "Duration", value: pkg.duration || pkg.tripDuration },
                          { label: "Start Point", value: pkg.additionalInfo?.quickInfo?.startPoint },
                          { label: "End Point", value: pkg.additionalInfo?.quickInfo?.endPoint },
                        ].filter(i => i.value).map(item => (
                          <div key={item.label} className="text-center p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{item.label}</p>
                            <p className="text-xs font-bold text-[#1a3f4e] leading-snug">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-[#1a3f4e] mb-6 flex items-center gap-2.5 text-base">
                          <LucideIcon name="CheckCircle" size={18} className="text-emerald-500" /> Inclusions
                        </h3>
                        <ul className="space-y-4">
                          {pkg.inclusions?.map((inc, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs font-bold text-gray-505 leading-relaxed">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              {inc}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-[#1a3f4e] mb-6 flex items-center gap-2.5 text-base">
                          <LucideIcon name="XCircle" size={18} className="text-red-500" /> Exclusions
                        </h3>
                        <ul className="space-y-4">
                          {pkg.exclusions?.map((exc, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs font-bold text-gray-505 leading-relaxed">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                              {exc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Itinerary" && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="font-['Poppins'] font-extrabold text-[#1a3f4e] text-2xl tracking-tight">Daily Journey</h2>
                      <button onClick={() => setOpenDays(new Set(pkg.itinerary?.map((_, i) => i) || []))} className="text-[10px] font-black uppercase tracking-widest text-[#4a90e2] hover:text-[#ff6b00] transition-colors duration-300">Expand All</button>
                    </div>

                    {/* Daily Journey vertical timeline */}
                    <div className="relative border-l-2 border-dashed border-gray-200 pl-8 ml-6 space-y-12">
                      {pkg.itinerary?.map((day, idx) => {
                        const open = openDays.has(idx);
                        return (
                          <div key={idx} className="relative group">
                            {/* Glowing Day Indicator Node */}
                            <div className={`absolute -left-[50px] top-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-300 ${
                              open 
                                ? "bg-[#4a90e2] text-white ring-4 ring-[#e8f4fd]" 
                                : "bg-white text-gray-400 border border-gray-200 group-hover:border-[#4a90e2] group-hover:text-[#4a90e2]"
                            }`}>
                              {day.day || day.dayNumber}
                            </div>

                            {/* Card Body */}
                            <div className={`bg-white rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                              open 
                                ? "border-[#4a90e2]/25 shadow-[0_15px_40px_rgba(74,144,226,0.04)]" 
                                : "border-gray-100/80 shadow-sm hover:border-gray-200 hover:shadow-md"
                            }`}>
                              <button onClick={() => toggleDay(idx)} className="w-full text-left flex items-center gap-6 p-6 md:p-8 hover:bg-gray-50/50 transition-colors duration-300">
                                <div className="flex-1 min-w-0">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-[#4a90e2] mb-1.5 block">Day {day.day || day.dayNumber}</span>
                                  <h3 className="font-['Poppins'] font-extrabold text-[#1a3f4e] text-lg md:text-xl tracking-tight leading-snug">{day.title}</h3>
                                  
                                  <div className="flex flex-wrap items-center gap-2.5 mt-3">
                                    {day.city && (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-500 border border-gray-200/50 rounded-full text-[9px] font-black uppercase tracking-wider">
                                        📍 {day.city}
                                      </span>
                                    )}
                                    {day.dayType && (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-[#ff6b00] border border-orange-100/50 rounded-full text-[9px] font-black uppercase tracking-wider">
                                        ✦ {day.dayType}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  open ? "bg-[#e8f4fd] text-[#4a90e2] rotate-180" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                                }`}>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                              </button>

                              {/* Smooth Collapse Content */}
                              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                open ? "max-h-[800px] border-t border-gray-50" : "max-h-0"
                              }`}>
                                <div className="p-6 md:p-8 space-y-6">
                                  <div className="flex flex-col xl:flex-row gap-8">
                                    <div className="flex-1">
                                      {day.description && day.description.trim() && (
                                        <p className="text-sm md:text-base text-gray-600 leading-relaxed font-bold italic border-l-4 border-[#4a90e2]/30 pl-4 py-1">
                                          "{day.description}"
                                        </p>
                                      )}
                                      {day.notes && (
                                        <div className="mt-4 p-4 bg-amber-50/50 rounded-2xl text-xs text-amber-900 border border-amber-100/50 font-bold flex gap-2.5 items-start">
                                          <span className="text-base leading-none">💡</span>
                                          <p className="leading-relaxed">{day.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                    {day.images && day.images.length > 0 && (
                                      <div className="w-full xl:w-72 flex-shrink-0 rounded-2xl overflow-hidden border border-gray-100 shadow-md">
                                        <HeroSlider images={day.images} title={day.title} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "Activities" && (
                  <div className="space-y-8 animate-fade-in">
                    <h2 className="font-['Poppins'] font-extrabold text-[#1a3f4e] text-2xl tracking-tight mb-8">Curated Activities</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {(pkg.activities || pkg.activitiesList || []).map((act: any, i: number) => {
                        const title = typeof act === "string" ? act : act.title;
                        return (
                          <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 p-6 flex gap-6 hover:shadow-[0_15px_35px_rgba(15,23,42,0.06)] hover:border-gray-200 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-[#e8f4fd] text-[#4a90e2] rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#4a90e2] group-hover:text-white transition-all duration-300 shadow-sm">
                              <LucideIcon name="Camera" size={24} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-['Poppins'] font-bold text-[#1a3f4e] text-base mb-1.5 group-hover:text-[#4a90e2] transition-colors duration-300">{title}</h3>
                              <p className="text-gray-500 text-xs leading-relaxed">{act.description || "Immerse yourself in this curated local experience."}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "Hotels" && (
                  <div className="space-y-8 animate-fade-in">
                    <h2 className="font-['Poppins'] font-extrabold text-[#1a3f4e] text-2xl tracking-tight mb-8">Luxury Accommodations</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      {(pkg.hotels || pkg.hotelsList || []).map((hotel: any, i: number) => (
                        <div key={i} className="group rounded-[2rem] overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-505">
                          <div className="relative h-64 overflow-hidden">
                            <Image src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945"} alt={hotel.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 text-white flex justify-between items-end">
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur-md text-white/90 rounded-full text-[9px] font-black uppercase tracking-wider mb-2 border border-white/15">
                                  📍 {hotel.location}
                                </span>
                                <h3 className="font-['Poppins'] text-xl font-extrabold tracking-tight">{hotel.name}</h3>
                              </div>
                              <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                ★ <span className="text-white font-extrabold">{hotel.stars || "5"} Star</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "Transfers" && (
                  <div className="space-y-8 animate-fade-in">
                    <h2 className="font-['Poppins'] font-extrabold text-[#1a3f4e] text-2xl tracking-tight mb-8">Seamless Logistics</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {(pkg.transfers || pkg.transfersList || []).map((tr: string, i: number) => (
                        <div key={i} className="p-6 bg-white border border-gray-100 rounded-[2rem] flex items-center gap-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300">
                          <div className="w-14 h-14 bg-orange-50 text-[#ff6b00] rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-orange-100/30">
                            <LucideIcon name="MoveHorizontal" size={24} />
                          </div>
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#ff6b00] block mb-1">Logistics & Route</span>
                            <p className="text-[15px] font-bold text-[#1a3f4e] leading-snug">{tr}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "Policies" && (
                  <div className="space-y-8 animate-fade-in">
                    <h2 className="font-['Poppins'] font-extrabold text-[#1a3f4e] text-2xl tracking-tight mb-8">Terms & Policies</h2>
                    <div className="space-y-4">
                      {["Cancellation", "Refund", "Confirmation"].map(policy => {
                        const isActive = openPolicy === policy;
                        return (
                          <div key={policy} className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                            isActive ? "border-[#4a90e2]/25 shadow-[0_15px_30px_rgba(74,144,226,0.04)]" : "border-gray-100 shadow-sm hover:border-gray-200"
                          }`}>
                            <button onClick={() => setOpenPolicy(isActive ? null : policy)} className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors text-left">
                              <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                                  isActive ? "bg-[#e8f4fd] text-[#4a90e2]" : "bg-gray-55 text-gray-400"
                                }`}>
                                  ★
                                </div>
                                <h3 className="font-['Poppins'] font-bold text-[#1a3f4e] text-base">{policy} Policy</h3>
                              </div>
                              <LucideIcon name={isActive ? "ChevronUp" : "ChevronDown"} size={16} className={`text-gray-305 transition-transform duration-300 ${isActive ? "text-[#4a90e2]" : ""}`} />
                            </button>
                            <div className={`transition-all duration-300 overflow-hidden ${
                              isActive ? "max-h-[300px] border-t border-gray-50" : "max-h-0"
                            }`}>
                              <div className="p-6 text-gray-500 text-xs md:text-sm leading-relaxed font-bold">
                                 {pkg.policies?.[policy.toLowerCase() as keyof typeof pkg.policies] || "Standard policies apply. Please refer to your booking confirmation for full details."}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "Reviews" && (
                  <div className="space-y-10 animate-fade-in">
                    <div className="flex flex-col xl:flex-row items-center justify-between bg-[#1a3f4e] rounded-[2.5rem] p-10 text-white shadow-xl">
                       <div className="text-center xl:text-left mb-6 xl:mb-0">
                          <p className="text-white/50 text-[9px] font-black uppercase tracking-widest mb-1">Guest Satisfaction</p>
                          <h2 className="text-5xl font-black">{pkg.rating || "4.9"}</h2>
                          <div className="flex text-amber-400 mt-2 justify-center xl:justify-start">
                            {[1,2,3,4,5].map(s => <LucideIcon key={s} name="Star" size={16} className="fill-current" />)}
                          </div>
                          <p className="text-white/40 text-xs font-bold mt-4">Based on verified guest reviews</p>
                       </div>
                       <div className="w-full xl:w-64 space-y-2.5">
                          {[5,4,3,2,1].map(star => (
                            <div key={star} className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-white/50 w-4">{star}</span>
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-[#4a90e2]" style={{ width: star === 5 ? "85%" : star === 4 ? "12%" : "3%" }} />
                              </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                      {(pkg.reviews || [
                        { name: "Lakshit Bhardwaj", rating: 5, comment: "Incredible attention to detail. Every day felt like a dream." },
                        { name: "Priya Sharma", rating: 5, comment: "The best travel experience we've had. Seamless and luxurious." }
                      ]).map((rev, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300">
                           <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2.5">
                                 <div className="w-8 h-8 rounded-full bg-[#e8f4fd] text-[#4a90e2] font-black text-xs flex items-center justify-center">
                                   {rev.name.charAt(0)}
                                 </div>
                                 <h4 className="font-bold text-[#1a3f4e] text-sm">{rev.name}</h4>
                              </div>
                              <div className="flex text-amber-400 bg-amber-50/50 px-2 py-0.5 rounded border border-amber-100/50">
                                 {Array.from({length: rev.rating}).map((_, j) => <span key={j} className="text-xs">★</span>)}
                              </div>
                           </div>
                           <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-bold pl-10">"{rev.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sticky Price & Enquiry */}
            <div className="lg:sticky lg:top-36 space-y-6">
              {/* Main Booking Card */}
              <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-gray-100 overflow-hidden transform transition-all duration-500 hover:shadow-2xl">
                {/* Pricing Header */}
                <div className="p-8 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-[#1a3f4e]">{mainPrice}</span>
                      <span className="text-gray-400 text-xs font-bold mb-1">Per Adult</span>
                    </div>
                    {pkg.rating && (
                      <div className="flex items-center gap-1 text-[#ff6b00] font-black text-xs bg-white px-3 py-1 rounded-full shadow-sm border border-orange-100/50">
                        <LucideIcon name="Star" size={12} className="fill-[#ff6b00]" />
                        <span>{pkg.rating}</span>
                      </div>
                    )}
                  </div>
                  {strikePrice && (
                    <div className="flex items-center gap-2.5">
                      <div className="text-gray-400 text-sm line-through decoration-[#ff6b00]/30 decoration-2">{strikePrice}</div>
                      <span className="px-2.5 py-0.5 bg-[#ff6b00] text-white text-[8px] font-black uppercase tracking-wider rounded">Save {savings}</span>
                    </div>
                  )}
                </div>

                {/* Form Section */}
                <div id="enquiry-form" className="p-8">
                  {isSoldOut && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-center shadow-sm">
                      <span className="text-red-600 font-extrabold text-xs tracking-widest uppercase block animate-pulse">🛑 Sold Out</span>
                      <p className="text-[10px] text-gray-505 font-bold mt-1 leading-normal">All available seats have been fully booked for this experience.</p>
                    </div>
                  )}
                  {isLowSeats && (
                    <div className="mb-6 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-center shadow-sm">
                      <span className="text-amber-700 font-extrabold text-xs tracking-widest uppercase block">🔥 Only {availableSeats} spots left!</span>
                      <p className="text-[10px] text-gray-505 font-bold mt-1 leading-normal">Book now to secure your travel dates before it sells out.</p>
                    </div>
                  )}
                  <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Secure Your Experience</h3>
                  
                  {sent ? (
                    <div className="py-10 text-center animate-fade-in">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LucideIcon name="Check" size={32} />
                      </div>
                      <h3 className="font-['Poppins'] font-bold text-[#1a3f4e] text-xl mb-2 tracking-tight">Request Received!</h3>
                      <p className="text-gray-500 text-xs leading-relaxed">Our travel expert will contact you within 24 hours.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleEnquiry} className="space-y-4">
                      <div className="relative">
                        <input 
                          value={form.name} 
                          onChange={e => upd("name", e.target.value)} 
                          placeholder="Full Name*" 
                          className={`w-full px-5 py-4.5 rounded-xl border ${errors.name ? 'border-red-500 bg-red-50/30' : 'border-gray-200'} text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/15 transition-all placeholder:text-gray-400`} 
                        />
                        {errors.name && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{errors.name}</p>}
                      </div>

                      <div className="relative">
                        <input 
                          type="email" 
                          value={form.email} 
                          onChange={e => upd("email", e.target.value)} 
                          placeholder="Email*" 
                          className={`w-full px-5 py-4.5 rounded-xl border ${errors.email ? 'border-red-500 bg-red-50/30' : 'border-gray-200'} text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/15 transition-all placeholder:text-gray-400`} 
                        />
                        {errors.email && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{errors.email}</p>}
                      </div>

                      <div className="flex gap-3">
                        <div className="w-20 shrink-0 relative">
                          <select className="w-full px-3 py-4.5 rounded-xl border border-gray-200 text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] appearance-none bg-white">
                            <option>+91</option>
                            <option>+1</option>
                            <option>+44</option>
                          </select>
                          <LucideIcon name="ChevronDown" size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="flex-1 relative">
                          <input 
                            value={form.phone} 
                            onChange={e => upd("phone", e.target.value)} 
                            placeholder="Phone Number*" 
                            className={`w-full px-5 py-4.5 rounded-xl border ${errors.phone ? 'border-red-500 bg-red-50/30' : 'border-gray-200'} text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/15 transition-all placeholder:text-gray-400`} 
                          />
                          {errors.phone && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{errors.phone}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <input 
                            type="date" 
                            value={form.date} 
                            onChange={e => upd("date", e.target.value)} 
                            className={`w-full px-3 py-4.5 rounded-xl border ${errors.date ? 'border-red-500 bg-red-50/30' : 'border-gray-200'} text-[10px] font-bold focus:outline-none focus:border-[#4a90e2] transition-all text-gray-400`} 
                          />
                          {errors.date && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{errors.date}</p>}
                        </div>
                        <div className="relative">
                          <input 
                            type="number"
                            min="1"
                            value={form.adults} 
                            onChange={e => upd("adults", e.target.value)} 
                            placeholder="Adults*" 
                            className={`w-full px-3 py-4.5 rounded-xl border ${errors.adults ? 'border-red-500 bg-red-50/30' : 'border-gray-200'} text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/15 transition-all placeholder:text-gray-400`} 
                          />
                          {errors.adults && <p className="text-[9px] text-red-500 font-bold mt-1 ml-1">{errors.adults}</p>}
                        </div>
                      </div>

                      {isSoldOut ? (
                        <button 
                          disabled
                          type="button"
                          className="w-full py-4.5 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl bg-gray-200 cursor-not-allowed flex items-center justify-center gap-3 border border-gray-300"
                        >
                          Sold Out
                        </button>
                      ) : (
                        <Link 
                          href={getBookingUrl()}
                          className="w-full py-4.5 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-[0_6px_20px_rgba(255,149,0,0.2)] hover:shadow-[0_8px_30px_rgba(255,149,0,0.35)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-[#ff9500] to-[#ff6b00]"
                        >
                          {user ? "Book Your Spot" : "Sign In to Book"}
                        </Link>
                      )}
                    </form>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-[2rem] p-6 flex items-center justify-between gap-4 border border-gray-100 shadow-sm">
                <div className="flex flex-col items-center text-center gap-2 flex-1">
                  <LucideIcon name="ShieldCheck" size={18} className="text-[#4a90e2]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#1a3f4e]/60 leading-tight">Secure<br/>Booking</span>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="flex flex-col items-center text-center gap-2 flex-1">
                  <LucideIcon name="Banknote" size={18} className="text-[#ff6b00]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#1a3f4e]/60 leading-tight">Best Price<br/>Guaranteed</span>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="flex flex-col items-center text-center gap-2 flex-1">
                  <LucideIcon name="Headphones" size={18} className="text-[#4a90e2]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#1a3f4e]/60 leading-tight">24/7 Luxury<br/>Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {lightboxIdx !== null && pkg.images && (
        <Lightbox images={pkg.images} initialIdx={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </LayoutV2>
  );
}
