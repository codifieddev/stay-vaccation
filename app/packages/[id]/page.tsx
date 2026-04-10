"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/frontend/Navbar";
import Footer from "../../components/frontend/Footer";
import Link from "next/link";

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ", SGD: "S$", AUD: "A$", THB: "฿",
};

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

import { useParams } from "next/navigation";

const TABS = ["Overview", "Itinerary", "Inclusions", "Policies & FAQs"];

export default function SinglePackagePage() {
  const params = useParams();
  const matchedId = params?.id as string;

  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [openDays, setOpenDays] = useState<Set<number>>(new Set([0]));

  // Enquiry form state
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", adults: "2", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const tabBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchedId) return;
    // Fetch the specific package directly by its MongoDB ObjectId — never loads wrong one
    fetch(`/api/packages?id=${encodeURIComponent(matchedId)}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setPkg(d.data);
        } else {
          setPkg(null);
        }
      })
      .finally(() => setLoading(false));
  }, [matchedId]);

  const toggleDay = (i: number) => {
    setOpenDays(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setSending(false);
  };

  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen hero-bg flex items-center justify-center pt-20">
          <div className="text-center text-white">
            <div className="w-12 h-12 border-4 border-white/20 border-t-[#2fa3f2] rounded-full mx-auto mb-4" style={{ animation: "spin 1s linear infinite" }} />
            <p className="text-white/70 text-sm">Loading package…</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!pkg) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-[#1a3f4e] mb-2">Package Not Found</h1>
            <p className="text-gray-400 mb-6">This package may have been removed or doesn't exist.</p>
            <Link href="/packages" className="px-6 py-3 bg-[#2fa3f2] text-white font-bold rounded-xl text-sm">Browse All Packages</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const sym = CURRENCY_SYMBOLS[pkg.price?.currency] || "₹";
  const amount = typeof pkg.price?.amount === "number" ? pkg.price.amount.toLocaleString() : pkg.price?.amount;
  const days = pkg.tripDuration?.match(/^(\d+)/)?.[1] || "—";
  const nights = pkg.tripDuration?.match(/(\d+)\s*Night/i)?.[1] || String(Number(days) - 1);

  return (
    <>
      <Navbar />

      {/* ─── HERO ────────────────────────────────────────────────────── */}
      <section className="hero-bg pt-24 pb-0">
        <div className="container-sv pt-6 pb-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/50 text-xs mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/packages" className="hover:text-white">Packages</Link>
            <span>/</span>
            <span className="text-white/70 line-clamp-1">{pkg.title}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left hero content */}
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-[#2fa3f2]/20 text-[#2fa3f2] border border-[#2fa3f2]/30 rounded-full text-xs font-semibold">{pkg.travelStyle}</span>
                <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-semibold">{pkg.tourType}</span>
                <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-semibold">{pkg.exclusivityLevel}</span>
              </div>

              <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{pkg.title}</h1>
              <p className="text-white/70 text-base max-w-xl leading-relaxed mb-6">{pkg.shortDescription}</p>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: "📍", val: pkg.destination },
                  { icon: "🗓️", val: `${days} Days / ${nights} Nights` },
                  { icon: "✈️", val: pkg.travelStyle },
                ].map(m => (
                  <div key={m.val} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white">
                    <span>{m.icon}</span>{m.val}
                  </div>
                ))}
              </div>

              {/* Highlights strip */}
              {pkg.additionalInfo?.experiencesCovered?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-white/50 text-xs uppercase tracking-widest font-bold">Package Highlights</p>
                  <ul className="space-y-1.5">
                    {pkg.additionalInfo.experiencesCovered.slice(0, 4).map((exp: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                        <span className="text-[#2fa3f2] mt-0.5 flex-shrink-0">✦</span>{exp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ─── STICKY PRICE + ENQUIRY CARD ─── */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Price header */}
                <div className="bg-[#1a3f4e] px-6 py-5">
                  <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Starting from</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">{sym}{amount}</span>
                    <span className="text-white/50 text-sm mb-1">/ person</span>
                  </div>
                  <div className="flex gap-3 mt-3 text-xs text-white/60">
                    <span>✅ No booking fees</span>
                    <span>✅ Free consultation</span>
                  </div>
                </div>

                {/* Enquiry form */}
                {sent ? (
                  <div className="p-6 text-center">
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="font-bold text-[#1a3f4e] mb-1">Enquiry Sent!</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">Our expert will call you within 24 hours.</p>
                    <button onClick={() => setSent(false)} className="mt-4 text-xs text-[#2fa3f2] hover:underline font-medium">Submit another enquiry</button>
                  </div>
                ) : (
                  <form onSubmit={handleEnquiry} className="p-5 space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quick Enquiry</p>
                    <input required value={form.name} onChange={e => upd("name", e.target.value)} placeholder="Your Name *" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2fa3f2] transition-all placeholder:text-gray-300" />
                    <input required type="email" value={form.email} onChange={e => upd("email", e.target.value)} placeholder="Email Address *" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2fa3f2] transition-all placeholder:text-gray-300" />
                    <input type="tel" value={form.phone} onChange={e => upd("phone", e.target.value)} placeholder="Phone / WhatsApp" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2fa3f2] transition-all placeholder:text-gray-300" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" value={form.date} onChange={e => upd("date", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2fa3f2] transition-all text-gray-600" />
                      <select value={form.adults} onChange={e => upd("adults", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2fa3f2] transition-all bg-white text-gray-600 cursor-pointer">
                        {["1","2","3","4","5","6","7","8+"].map(n => <option key={n} value={n}>{n} {n === "1" ? "Traveller" : "Travellers"}</option>)}
                      </select>
                    </div>
                    <textarea rows={2} value={form.message} onChange={e => upd("message", e.target.value)} placeholder="Any special requirements…" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2fa3f2] transition-all resize-none placeholder:text-gray-300" />
                    <button type="submit" disabled={sending} className="w-full py-3.5 bg-[#2fa3f2] hover:bg-[#1a8fd8] text-white font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50">
                      {sending ? "Sending…" : "Send Enquiry →"}
                    </button>
                    <p className="text-gray-300 text-xs text-center">Your information is 100% secure & private</p>
                  </form>
                )}

                {/* Call */}
                <div className="border-t border-gray-100 px-5 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">📞</div>
                  <div>
                    <p className="text-xs text-gray-400">Speak with an expert</p>
                    <p className="text-sm font-bold text-[#1a3f4e]">+91 98765 43210</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div ref={tabBarRef} className="bg-[#0f2a35] border-t border-white/10 sticky top-16 z-40">
          <div className="container-sv">
            <div className="flex overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${activeTab === tab ? "border-[#2fa3f2] text-[#2fa3f2]" : "border-transparent text-white/50 hover:text-white/80"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TAB CONTENT ─────────────────────────────────────────────── */}
      <section className="bg-gray-50 min-h-screen">
        <div className="container-sv py-10">
          <div className="max-w-4xl">

            {/* ── OVERVIEW ── */}
            {activeTab === "Overview" && (
              <div className="space-y-8">
                {/* Quick Info */}
                {pkg.additionalInfo?.quickInfo && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-[#1a3f4e] text-lg mb-4">Quick Info</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Destinations", value: pkg.additionalInfo.quickInfo.destinationsCovered },
                        { label: "Duration", value: pkg.additionalInfo.quickInfo.duration },
                        { label: "Start Point", value: pkg.additionalInfo.quickInfo.startPoint },
                        { label: "End Point", value: pkg.additionalInfo.quickInfo.endPoint },
                      ].filter(i => i.value).map(item => (
                        <div key={item.label} className="text-center p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                          <p className="text-sm font-semibold text-[#1a3f4e] leading-snug">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* About Destination */}
                {pkg.additionalInfo?.aboutDestination && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-[#1a3f4e] text-lg mb-3">📍 About {pkg.destination}</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">{pkg.additionalInfo.aboutDestination}</p>
                  </div>
                )}

                {/* Highlights */}
                {pkg.additionalInfo?.experiencesCovered?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-[#1a3f4e] text-lg mb-4">✨ Experiences Covered</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {pkg.additionalInfo.experiencesCovered.map((exp: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-[#F4F9E9] rounded-xl">
                          <div className="w-5 h-5 rounded-full bg-[#2fa3f2] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <p className="text-sm text-[#1a3f4e] font-medium leading-snug">{exp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Not to Miss */}
                {pkg.additionalInfo?.notToMiss?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-[#1a3f4e] text-lg mb-4">🌟 Not to Miss</h2>
                    <ul className="space-y-3">
                      {pkg.additionalInfo.notToMiss.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-[#f97316] font-bold text-sm mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, "0")}.</span>
                          <p className="text-gray-600 text-sm leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Availability */}
                {pkg.availability?.availableMonths?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-[#1a3f4e] text-lg mb-3">📅 Best Time to Travel</h2>
                    <div className="flex flex-wrap gap-2">
                      {pkg.availability.availableMonths.map((m: string) => (
                        <span key={m} className="px-4 py-2 bg-[#F4F9E9] text-[#1a3f4e] font-semibold rounded-full text-sm border border-[#1a3f4e]/10">{m}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ITINERARY ── */}
            {activeTab === "Itinerary" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-[#1a3f4e] text-lg">{pkg.itinerary?.length || 0}-Day Itinerary</h2>
                  <button onClick={() => setOpenDays(new Set(pkg.itinerary?.map((_: any, i: number) => i) || []))} className="text-xs text-[#2fa3f2] font-semibold hover:underline">Expand All</button>
                </div>

                {pkg.itinerary?.map((day: any, idx: number) => {
                  const open = openDays.has(idx);
                  const colors = DAY_COLORS[day.dayType] || DAY_COLORS.sightseeing;
                  const badge = DAY_TYPE_BADGE[day.dayType] || "bg-blue-100 text-blue-700";
                  return (
                    <div key={day.id || idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <button
                        onClick={() => toggleDay(idx)}
                        className={`w-full text-left flex items-center gap-4 p-5 border-l-4 ${colors} transition-colors`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[#1a3f4e] flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-white/50 text-[9px] font-bold uppercase">Day</span>
                          <span className="text-white font-bold text-lg leading-none">{day.dayNumber}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-[#1a3f4e] text-sm">{day.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badge}`}>{day.dayType}</span>
                          </div>
                          <p className="text-gray-400 text-xs mt-0.5">{day.city}</p>
                          {day.mealsIncluded?.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">🍽️ {day.mealsIncluded.join(" · ")}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {day.activities?.length > 0 && <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">{day.activities.length} activities</span>}
                          <svg className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {open && (
                        <div className="p-5 bg-white space-y-5 border-t border-gray-100">
                          {day.description && <p className="text-gray-600 text-sm leading-relaxed">{day.description}</p>}
                          {day.notes && <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">📝 {day.notes}</div>}

                          {/* Activities */}
                          {day.activities?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Activities</p>
                              <div className="space-y-3">
                                {day.activities.map((act: any, ai: number) => {
                                  const title = act.customTitle || act.activityData?.title || "Activity";
                                  const desc = act.customDescription || act.activityData?.description;
                                  return (
                                    <div key={act.id || ai} className="flex gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                      <div className="w-14 h-14 rounded-xl bg-[#2fa3f2] flex flex-col items-center justify-center flex-shrink-0 text-white">
                                        <span className="text-xs font-bold leading-none">{fmt12(act.time).split(":")[0]}</span>
                                        <span className="text-[9px] font-medium leading-none opacity-70">{fmt12(act.time).includes("AM") ? "AM" : "PM"}</span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-bold text-[#1a3f4e] text-sm">{title}</p>
                                        {desc && <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-3">{desc}</p>}
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                          {act.guideIncluded && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">✓ Guide</span>}
                                          {act.ticketIncluded && <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">✓ Ticket</span>}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Transfers */}
                          {day.transfers?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Transfers</p>
                              <div className="space-y-2">
                                {day.transfers.map((tr: any, ti: number) => (
                                  <div key={tr.id || ti} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                    <span className="text-xl">🚗</span>
                                    <div>
                                      <p className="font-semibold text-[#1a3f4e] text-sm">{tr.from} → {tr.to}</p>
                                      <p className="text-gray-400 text-xs">{tr.vehicleType} · {fmt12(tr.pickupTime)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Hotels */}
                          {day.hotelStays?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Accommodation</p>
                              <div className="space-y-2">
                                {day.hotelStays.map((h: any, hi: number) => {
                                  const name = h.hotelData?.hotelName || "Hotel TBD";
                                  const stars = h.hotelData?.starRating || "5";
                                  return (
                                    <div key={h.id || hi} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                      <span className="text-xl">🏨</span>
                                      <div>
                                        <p className="font-semibold text-[#1a3f4e] text-sm">{name} {"⭐".repeat(Math.min(Number(stars), 5))}</p>
                                        <p className="text-gray-400 text-xs">{h.customRoomType || ""} · Check-in {fmt12(h.checkInTime)} · Check-out {fmt12(h.checkOutTime)}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── INCLUSIONS ── */}
            {activeTab === "Inclusions" && (
              <div className="space-y-6">
                {pkg.inclusions?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-[#1a3f4e] text-lg mb-5 flex items-center gap-2">✅ What's Included</h2>
                    <ul className="space-y-3">
                      {pkg.inclusions.map((inc: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <p className="text-gray-700 text-sm">{inc}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pkg.exclusions?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-[#1a3f4e] text-lg mb-5 flex items-center gap-2">❌ Not Included</h2>
                    <ul className="space-y-3">
                      {pkg.exclusions.map((exc: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                          </div>
                          <p className="text-gray-700 text-sm">{exc}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pkg.knowBeforeYouGo?.length > 0 && (
                  <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                    <h2 className="font-bold text-amber-900 text-lg mb-4">📋 Know Before You Go</h2>
                    <ul className="space-y-2.5">
                      {pkg.knowBeforeYouGo.map((item: any, i: number) => (
                        <li key={item.id || i} className="flex items-start gap-2 text-sm text-amber-800">
                          <span className="text-amber-500 font-bold flex-shrink-0 mt-0.5">•</span>
                          {item.point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── POLICIES & FAQs ── */}
            {activeTab === "Policies & FAQs" && (
              <div className="space-y-6">
                {/* Cancellation Policy */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-[#1a3f4e] text-lg mb-4">🔖 Cancellation Policy</h2>
                  <ul className="space-y-2.5 text-sm text-gray-600">
                    <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">•</span>Cancellation 30+ days before travel: 30% of total cost charged.</li>
                    <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">•</span>Cancellation within 30 days: Full booking cost charged.</li>
                    <li className="flex gap-2"><span className="text-orange-400 flex-shrink-0">•</span>For unforeseen weather/natural calamities, alternate options or reschedule will be offered.</li>
                  </ul>
                </div>

                {/* Confirmation Policy */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="font-bold text-[#1a3f4e] text-lg mb-4">✅ Confirmation Policy</h2>
                  <ul className="space-y-2.5 text-sm text-gray-600">
                    <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">•</span>A confirmation voucher will be sent via email within 48–72 hours of booking.</li>
                    <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">•</span>Final travel documents will be shared 7 days before your travel date.</li>
                    <li className="flex gap-2"><span className="text-blue-400 flex-shrink-0">•</span>If preferred hotels are unavailable, equivalent alternatives will be arranged.</li>
                  </ul>
                </div>

                {/* FAQs */}
                {pkg.faqs?.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-[#1a3f4e] text-lg mb-5">❓ Frequently Asked Questions</h2>
                    <div className="space-y-3">
                      {pkg.faqs.map((faq: any, i: number) => (
                        <details key={faq.id || i} className="group border border-gray-100 rounded-xl overflow-hidden">
                          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 list-none">
                            <p className="font-semibold text-[#1a3f4e] text-sm pr-4">{faq.question}</p>
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                            <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Back bar */}
      <div className="bg-white border-t border-gray-100 py-5">
        <div className="container-sv flex items-center justify-between flex-wrap gap-3">
          <Link href="/packages" className="inline-flex items-center gap-2 text-[#1a3f4e] font-semibold text-sm hover:gap-3 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to All Packages
          </Link>
          <a href="#enquiry" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2fa3f2] text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 transition-all">
            Enquire Now →
          </a>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
