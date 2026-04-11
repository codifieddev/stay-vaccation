"use client";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/frontend/Navbar";
import Footer from "@/app/components/frontend/Footer";
import Link from "next/link";

interface Activity {
  title: string;
  image: string;
  duration: string;
  price: string | number;
  rating: string | number;
  slug?: string; // Added slug for linking
}

interface Faq {
  question: string;
  answer: string;
}

interface Review {
  name: string;
  rating: number;
  comment: string;
  image: string;
}

interface ActivityPage {
  slug: string;
  city: string;
  heroImages: string[];
  description: {
    short: string;
    full: string;
  };
  activities: Activity[];
  faqs: Faq[];
  reviews: Review[];
}

export default function ActivityPageContent({ page }: { page: ActivityPage }) {
  const [readMore, setReadMore] = useState(false);
  const [currentHero, setCurrentHero] = useState(0);
  console.log("page---", page);
  // Auto-play hero carousel
  useEffect(() => {
    if (!page.heroImages?.length) return;
    const timer = setInterval(() => {
      setCurrentHero(prev => (prev + 1) % page.heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [page.heroImages]);

  const avgRating = page.reviews?.length
    ? (page.reviews.reduce((acc, r) => acc + r.rating, 0) / page.reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-[#1a3f4e]">
      <Navbar />

      {/* ─── HERO SECTION (CAROUSEL) ─────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {page.heroImages?.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 z-0 ${currentHero === idx ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={img || "https://images.unsplash.com/photo-1549466600-82cfec243e91?q=80&w=2070&auto=format&fit=crop"}
              alt={`${page.city} Hero ${idx}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a3f4e]/90 via-[#1a3f4e]/40 to-transparent" />
          </div>
        ))}

        <div className="container-sv relative z-10 text-center text-white pt-20 animate-fadeUp">
          <nav className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 opacity-70">
            <Link href="/" className="hover:text-[#2fa3f2] transition-colors">Home</Link>
            <span className="w-1 h-1 bg-white/40 rounded-full" />
            <span className="text-[#2fa3f2]">Activities</span>
          </nav>

          <h1 className="text-5xl md:text-7xl font-display font-black mb-6 uppercase tracking-tighter leading-none">
            Things to do in <br />
            <span className="text-[#2fa3f2] drop-shadow-2xl">{page.city}</span>
          </h1>

          <p className="text-white/80 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed drop-shadow-md">
            {page.description.short}
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <div className="flex -space-x-3">
              {page.reviews?.slice(0, 3).map((r, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1a3f4e] overflow-hidden bg-gray-200">
                  <img src={r.image || "https://randomuser.me/api/portraits/men/32.jpg"} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                {"★".repeat(Math.round(Number(avgRating)))}
                <span className="text-white ml-1">{avgRating}/5</span>
              </div>
              <div className="text-[10px] text-white/60 font-bold uppercase tracking-widest">From {page.reviews?.length || 0}+ Happy Travelers</div>
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {page.heroImages?.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHero(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentHero === idx ? "w-8 bg-[#2fa3f2]" : "w-2 bg-white/40"}`}
            />
          ))}
        </div>
      </section>

      {/* ─── DESCRIPTION SECTION ───────────────────────────────────── */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="container-sv max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-12 h-1 bg-[#2fa3f2] rounded-full" />
            <h2 className="text-sm font-black uppercase tracking-widest text-[#2fa3f2]">Destination Guide</h2>
          </div>

          <div className={`relative transition-all duration-500 overflow-hidden ${readMore ? "max-h-[2000px]" : "max-h-[160px]"}`}>
            <div
              className="text-lg leading-loose text-gray-600 font-medium"
              dangerouslySetInnerHTML={{ __html: page.description.full }}
            />
            {!readMore && <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent" />}
          </div>

          <button
            onClick={() => setReadMore(!readMore)}
            className="mt-8 flex items-center gap-2 group text-[#1a3f4e] font-black uppercase text-xs tracking-widest hover:text-[#2fa3f2] transition-colors"
          >
            {readMore ? "Show Less" : "Read Full Guide"}
            <svg className={`w-4 h-4 transition-transform duration-300 ${readMore ? "rotate-180" : "group-hover:translate-y-1"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </section>

      {/* ─── ACTIVITIES LIST ───────────────────────────────────────── */}
      <section className="py-24 container-sv">
        <div className="flex items-end justify-between mb-16 px-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              Exclusive <span className="text-[#2fa3f2]">Experiences</span>
            </h2>
            <p className="text-gray-400 font-medium">Handpicked activities curated for the ultimate {page.city} adventure.</p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-5xl font-black text-gray-100 mb-2">{page.activities?.length}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Activities</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {page.activities?.map((act, idx) => {
            const cardLink = act.slug ? `/activities/${page.slug}/${act.slug}` : "#";
            return (
              <Link key={idx} href={cardLink} className={`group flex flex-col h-full bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${!act.slug ? "pointer-events-none opacity-80" : ""}`}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={act.image || "https://images.unsplash.com/photo-1549466600-82cfec243e91?q=80&w=1000&auto=format&fit=crop"}
                    alt={act.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 flex gap-2">
                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur-md text-[#1a3f4e] text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm border border-black/5">
                      {act.duration}
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 bg-[#1a3f4e]/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <span className="text-amber-400 font-black">★</span> {act.rating}
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-black text-[#1a3f4e] mb-4 group-hover:text-[#2fa3f2] transition-colors leading-tight">
                    {act.title}
                  </h3>

                  <div className="flex items-center gap-6 mt-auto pt-6 border-t border-gray-50">
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Starting from</span>
                      <span className="text-2xl font-black text-[#1a3f4e]">{act.price}</span>
                    </div>
                    <button className="px-6 py-3.5 bg-gray-50 text-[#1a3f4e] font-black text-xs uppercase tracking-widest rounded-2xl group-hover:bg-[#2fa3f2] group-hover:text-white transition-all shadow-sm active:scale-95">
                      {act.slug ? "Book Now" : "Coming Soon"}
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>


      {/* ─── FAQ SECTION ───────────────────────────────────────────── */}
      <section className="py-24 bg-[#1a3f4e] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2fa3f2]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="container-sv max-w-3xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-[#2fa3f2] uppercase tracking-[0.3em] mb-4">Common Questions</h2>
            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Everything You <br /> <span className="text-[#2fa3f2]">Need to Know</span></h3>
          </div>

          <div className="space-y-4">
            {page.faqs?.map((faq, i) => (
              <FaqItem key={i} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── REVIEWS SECTION ────────────────────────────────────────── */}
      <section className="py-24 container-sv">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <h2 className="text-sm font-black text-[#2fa3f2] uppercase tracking-[0.3em] mb-6">Testimonials</h2>
              <h3 className="text-4xl font-black uppercase tracking-tighter mb-8 leading-tight">What Travelers <br /> <span className="text-[#2fa3f2]">Are Saying</span></h3>

              <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                <div className="text-5xl font-black text-[#1a3f4e] mb-2">{avgRating}</div>
                <div className="flex text-amber-400 text-xl mb-4">
                  {"★".repeat(Math.round(Number(avgRating)))}
                </div>
                <p className="text-gray-400 font-medium text-sm">Average rating based on {page.reviews?.length} authentic guest reviews from around the globe.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            {page.reviews?.map((rev, i) => (
              <div key={i} className="p-10 bg-white rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-200 shadow-sm">
                    <img src={rev.image || "https://randomuser.me/api/portraits/men/32.jpg"} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#1a3f4e]">{rev.name}</h4>
                    <div className="flex text-amber-400 text-xs">{"★".repeat(rev.rating)}</div>
                  </div>
                </div>
                <p className="text-lg text-gray-500 font-medium leading-relaxed italic">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FaqItem({ faq }: { faq: Faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border border-white/10 rounded-[1.5rem] transition-all duration-300 ${open ? "bg-white/5 border-white/20" : "hover:bg-white/5"}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-4"
      >
        <span className="text-lg md:text-xl font-black uppercase tracking-tight">{faq.question}</span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${open ? "bg-[#2fa3f2] rotate-180" : "bg-white/10"}`}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>
      <div className={`transition-all duration-500 overflow-hidden ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="px-6 md:px-8 pb-8 text-white/60 text-lg font-medium leading-relaxed">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}
