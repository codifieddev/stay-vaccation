"use client";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/frontend/Navbar";
import Footer from "@/app/components/frontend/Footer";
import Link from "next/link";

interface ActivityDetail {
  id: string;
  title: string;
  slug: string;
  location: string;
  rating: number;
  total_reviews: number;
  category: string[];
  tags: string[];
  pricing: {
    currency: string;
    original_price: number;
    discounted_price: number;
    discount_percent: number;
    price_per: string;
    offer_label: string;
  };
  ticket_types: {
    id: string;
    name: string;
    duration: string;
    original_price: number;
    discounted_price: number;
    price_per: string;
    voucher_type: string;
  }[];
  highlights: string[];
  overview: {
    about: string;
    know_before_you_go: string[];
    things_to_carry: string[];
    accessibility: string[];
  };
  policies: {
    confirmation: any;
    cancellation: { days_before: string; charge_percent: number }[];
    force_majeure: string;
  };
  faqs: { question: string; answer: string }[];
  reviews: { reviewer: string; rating: number; label: string; comment: string }[];
  contact: { phone: string; support_hours: string };
  nearby_attractions: { name: string; description: string; slug: string }[];
  meta: any;
}

export default function ActivityDetailContent({ activity }: { activity: ActivityDetail }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const TABS = ["Overview", "Tickets", "Policies", "FAQs", "Reviews"];

  return (
    <div className="bg-white min-h-screen font-sans text-[#1a3f4e]">
      <Navbar />

      {/* ─── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative h-[65vh] min-h-[500px] flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1549466600-82cfec243e91?q=80&w=2070&auto=format&fit=crop" // Mock hero image (would be dynamic if JSON provided it)
            alt={activity.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a3f4e] via-[#1a3f4e]/40 to-transparent" />
        </div>

        <div className="container-sv relative z-10 pb-16">
          <div className="max-w-4xl">
             <div className="flex flex-wrap gap-2 mb-6">
                {activity.category?.map(cat => (
                   <span key={cat} className="px-3 py-1 bg-[#2fa3f2]/20 text-[#2fa3f2] backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-[#2fa3f2]/30">
                      {cat}
                   </span>
                ))}
             </div>
             
             <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                {activity.title}
             </h1>

             <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                   <span className="text-amber-400 text-lg">★</span>
                   <span className="text-white font-black">{activity.rating}</span>
                   <span className="text-white/40 text-xs font-bold uppercase tracking-widest border-l border-white/20 pl-2">
                      {activity.total_reviews}+ Reviews
                   </span>
                </div>
                <div className="flex items-center gap-2 text-white/80 font-bold text-sm">
                   <svg className="w-4 h-4 text-[#2fa3f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   {activity.location}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT GRID ───────────────────────────────────── */}
      <section className="bg-gray-50/50">
        <div className="container-sv py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Tab Navigation */}
              <div className="flex overflow-x-auto pb-2 gap-2 sticky top-[72px] z-30 bg-gray-50/80 backdrop-blur-md py-4">
                 {TABS.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeTab === tab 
                          ? "bg-[#1a3f4e] text-white shadow-xl shadow-blue-900/20" 
                          : "bg-white text-gray-400 border border-gray-100 hover:border-[#2fa3f2] hover:text-[#1a3f4e]"
                      }`}
                    >
                       {tab}
                    </button>
                 ))}
              </div>

              {/* OVERVIEW TAB */}
              {activeTab === "Overview" && (
                <div className="space-y-12 animate-fadeUp">
                   {/* Highlights */}
                   <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                      <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                         <span className="w-2 h-8 bg-[#2fa3f2] rounded-full" />
                         Activity <span className="text-[#2fa3f2]">Highlights</span>
                      </h2>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {activity.highlights?.map((h, i) => (
                           <li key={i} className="flex items-start gap-4">
                              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </div>
                              <p className="text-sm text-gray-600 font-medium leading-relaxed">{h}</p>
                           </li>
                         ))}
                      </ul>
                   </div>

                   {/* About */}
                   <div className="max-w-none">
                      <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">About the Experience</h2>
                      <div 
                        className="text-lg text-gray-500 font-medium leading-loose"
                        dangerouslySetInnerHTML={{ __html: activity.overview?.about }} 
                      />
                   </div>

                   {/* Important Info */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-[#F4F9E9] rounded-[2rem] p-8 border border-[#1a3f4e]/5">
                         <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                           <span className="text-xl">📋</span> Know Before You Go
                         </h3>
                         <ul className="space-y-3">
                            {activity.overview?.know_before_you_go?.map((point, i) => (
                              <li key={i} className="text-xs text-[#1a3f4e]/70 font-bold flex items-start gap-2">
                                <span className="text-[#2fa3f2]">•</span> {point}
                              </li>
                            ))}
                         </ul>
                      </div>
                      <div className="bg-orange-50 rounded-[2rem] p-8 border border-orange-100">
                         <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                           <span className="text-xl">🎒</span> Things to Carry
                         </h3>
                         <ul className="space-y-3">
                            {activity.overview?.things_to_carry?.map((point, i) => (
                              <li key={i} className="text-xs text-orange-900/70 font-bold flex items-start gap-2">
                                <span className="text-orange-400">•</span> {point}
                              </li>
                            ))}
                         </ul>
                      </div>
                   </div>
                </div>
              )}

              {/* TICKETS TAB */}
              {activeTab === "Tickets" && (
                <div className="space-y-6 animate-fadeUp">
                   {activity.ticket_types?.map(ticket => (
                     <div key={ticket.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <div>
                              <h3 className="text-xl font-black mb-2">{ticket.name}</h3>
                              <div className="flex flex-wrap gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                 <span className="flex items-center gap-1.5"><span className="text-lg">🕒</span> {ticket.duration}</span>
                                 <span className="flex items-center gap-1.5"><span className="text-lg">📱</span> {ticket.voucher_type}</span>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-xs text-gray-400 line-through">₹{ticket.original_price.toLocaleString()}</div>
                              <div className="text-3xl font-black text-[#1a3f4e]">₹{ticket.discounted_price.toLocaleString()}</div>
                              <div className="text-[10px] font-black text-gray-400 uppercase">per {ticket.price_per}</div>
                              <button className="mt-4 px-8 py-3 bg-[#2fa3f2] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#1a3f4e] transition-all">
                                 Select Ticket
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              )}

              {/* POLICIES TAB */}
              {activeTab === "Policies" && (
                 <div className="space-y-10 animate-fadeUp">
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100">
                       <h2 className="text-xl font-black uppercase tracking-tighter mb-8">Cancellation Policy</h2>
                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {activity.policies?.cancellation?.map(p => (
                             <div key={p.days_before} className="text-center p-4 bg-gray-50 rounded-2xl">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{p.days_before} Days</div>
                                <div className="text-xl font-black text-red-500">{p.charge_percent}%</div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase">Charge</div>
                             </div>
                          ))}
                       </div>
                    </div>
                    <div>
                       <h2 className="text-xl font-black uppercase tracking-tighter mb-4">Force Majeure</h2>
                       <p className="text-gray-500 font-medium leading-loose text-sm">{activity.policies?.force_majeure}</p>
                    </div>
                 </div>
              )}

              {/* FAQS TAB */}
              {activeTab === "FAQs" && (
                <div className="space-y-4 animate-fadeUp">
                   {activity.faqs?.map((faq, i) => (
                      <details key={i} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                         <summary className="p-6 cursor-pointer list-none flex items-center justify-between font-black uppercase tracking-tight text-sm">
                            {faq.question}
                            <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform group-open:rotate-180">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                            </span>
                         </summary>
                         <div className="px-6 pb-6 text-gray-500 font-medium leading-relaxed text-sm border-t border-gray-50 pt-4">
                            {faq.answer}
                         </div>
                      </details>
                   ))}
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === "Reviews" && (
                <div className="space-y-8 animate-fadeUp">
                   {activity.reviews?.map((r, i) => (
                     <div key={i} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-12 h-12 rounded-2xl bg-[#2fa3f2]/10 flex items-center justify-center text-[#2fa3f2] font-black text-lg uppercase">
                              {r.reviewer[0]}
                           </div>
                           <div>
                              <div className="font-black text-sm">{r.reviewer}</div>
                              <div className="flex items-center gap-2">
                                 <div className="flex text-amber-400 text-xs text-[10px]">{"★".repeat(r.rating)}</div>
                                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{r.label}</span>
                              </div>
                           </div>
                        </div>
                        <p className="text-gray-500 font-medium leading-relaxed italic text-sm">"{r.comment || "No written comment, but highly recommended!"}"</p>
                     </div>
                   ))}
                </div>
              )}
            </div>

            {/* Right Column: Sticky Pricing Sidecard */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                 <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10 border border-gray-100">
                    <div className="bg-[#1a3f4e] p-8 text-white">
                       <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-md">
                             {activity.pricing?.offer_label}
                          </span>
                       </div>
                       <div className="flex items-end gap-2 mb-2">
                          <span className="text-4xl font-black">₹{activity.pricing?.discounted_price.toLocaleString()}</span>
                          <span className="text-white/40 text-sm line-through mb-1">₹{activity.pricing?.original_price.toLocaleString()}</span>
                       </div>
                       <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                          Per {activity.pricing?.price_per} Inclusive of all taxes
                       </p>
                    </div>
                    
                    <div className="p-8 space-y-4">
                       <div className="space-y-3">
                          <div className="flex items-center gap-3 text-xs font-bold text-[#1a3f4e]">
                             <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">✓</span>
                             Instant confirmation
                          </div>
                          <div className="flex items-center gap-3 text-xs font-bold text-[#1a3f4e]">
                             <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">✓</span>
                             Best price guaranteed
                          </div>
                       </div>
                       
                       <button className="w-full py-4 bg-[#2fa3f2] hover:bg-[#1a3f4e] text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-blue-400/20 transition-all hover:-translate-y-1">
                          Book Now
                       </button>
                    </div>

                    {/* Support footer */}
                    <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Need Help?</p>
                       <p className="text-sm font-black text-[#1a3f4e]">{activity.contact?.phone}</p>
                       <p className="text-[9px] text-gray-400 font-bold">{activity.contact?.support_hours}</p>
                    </div>
                 </div>

                 {/* meta trust */}
                 <div className="bg-[#F4F9E9] rounded-[2.5rem] p-8 border border-[#1a3f4e]/5 space-y-6">
                    {activity.meta?.trust_badges?.map((badge: any, i: number) => (
                       <div key={i} className="flex gap-4">
                          <div className="text-2xl">✨</div>
                          <div>
                             <h4 className="text-xs font-black uppercase tracking-tight mb-1">{badge.label}</h4>
                             <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{badge.detail}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─────────────────────────────────────────── */}
      <section className="py-24 bg-[#1a3f4e] text-white overflow-hidden relative">
         <div className="container-sv text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">
               Plan Your Next <span className="text-[#2fa3f2]">Adventure</span>
            </h2>
            <p className="text-white/60 max-w-lg mx-auto mb-10 font-medium">
               Explore 1000+ handpicked experiences across the world with Stay Vacation's premium guide.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
               <Link href="/activities" className="px-8 py-4 bg-white text-[#1a3f4e] font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-[#2fa3f2] hover:text-white transition-all">
                  All Activities
               </Link>
               <Link href="/contact" className="px-8 py-4 bg-[#2fa3f2] text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white hover:text-[#1a3f4e] transition-all">
                  Contact Expert
               </Link>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}
