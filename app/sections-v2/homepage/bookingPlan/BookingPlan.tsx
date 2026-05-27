"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { bookingPlanData } from './bookingPlanData';

interface BookingPlanProps {
  section?: any;
  lang?: string;
}

const BookingPlan: React.FC<BookingPlanProps> = ({ section: propSection }) => {
  const pathname = usePathname();

  const lang = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'hi') return 'hi';
    return 'en';
  }, [pathname]);

  // Prioritize exported TS data, fallback to CMS prop section
  const section = (bookingPlanData as any) || propSection || {};
  const p = section.props || {};

  // i18n helper – mirrors HeroSection / FaqSection pattern
  const t = (obj?: Record<string, string> | string): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj['en'] || '';
  };

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [destination, setDestination] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !destination) {
      alert('Please fill in all the details.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/booking-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, destination }),
      });
      const result = await res.json();
      if (result.success) {
        setIsSuccess(true);
        setFullName('');
        setEmail('');
        setDestination('');
      } else {
        alert(result.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting booking plan:', err);
      alert('Failed to submit booking plan. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const destinationOptions: string[] = p.destinationOptions || [];

  return (
    <section id="booking" className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Soft abstract blurs */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-50/30 rounded-full blur-3xl pointer-events-none" />

      <div className="container-v2 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Side: Overlapping Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative pr-6 pb-6 md:pr-12 md:pb-12"
          >
            {/* Main Image */}
            <div className="overflow-hidden rounded-[2rem] shadow-xl border border-slate-100 aspect-[4/3] relative">
              <img
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                src={p.mainImage}
                alt={t(p.mainImageAlt)}
              />
            </div>
            {/* Overlapping Thumbnail */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 1 }}
              className="absolute bottom-0 right-0 w-[160px] h-[120px] md:w-[240px] md:h-[180px] rounded-3xl overflow-hidden border-4 md:border-8 border-white shadow-2xl"
            >
              <img
                className="w-full h-full object-cover"
                src={p.thumbImage}
                alt={t(p.thumbImageAlt)}
              />
            </motion.div>
          </motion.div>

          {/* Right Side: Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Badge */}
            {p.badge && (
              <div className="w-fit inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold tracking-widest uppercase mb-4">
                {t(p.badge)}
              </div>
            )}

            {/* Heading */}
            {(p.titleNormal || p.titleHighlight) && (
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                {t(p.titleNormal)}
                <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  {t(p.titleHighlight)}
                </span>
              </h2>
            )}

            {/* Subtitle */}
            {p.subtitle && (
              <p className="text-slate-500 text-base md:text-lg mb-8 leading-relaxed">
                {t(p.subtitle)}
              </p>
            )}

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form
                  key="booking-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-5 w-full"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                        {t(p.fullNameLabel)}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t(p.fullNamePlaceholder)}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="px-4 py-3.5 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none rounded-xl text-slate-800 bg-slate-50 font-medium transition-all duration-200"
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                        {t(p.emailLabel)}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder={t(p.emailPlaceholder)}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="px-4 py-3.5 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none rounded-xl text-slate-800 bg-slate-50 font-medium transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                      {t(p.destinationLabel)}
                    </label>
                    <select
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="px-4 py-3.5 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none rounded-xl text-slate-800 bg-slate-50 font-medium transition-all duration-200 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.25rem'
                      }}
                    >
                      <option value="">{t(p.destinationPlaceholder)}</option>
                      {destinationOptions.map((opt: string, i: number) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Submit */}
                  <motion.button
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 transition-all duration-300 disabled:opacity-50 flex items-center justify-center cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      t(p.submitButtonText)
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center p-8 bg-emerald-50/50 border border-emerald-100 rounded-3xl text-center"
                >
                  <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" strokeWidth={1.5} />
                  <h3 className="text-xl font-bold text-emerald-900 mb-2">Thank you!</h3>
                  <p className="text-emerald-700 text-sm md:text-base max-w-sm">
                    Your details have been received. One of our travel experts will contact you within the next 24 hours to craft your itinerary.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="mt-6 text-xs text-emerald-600 font-bold border-b border-emerald-600 hover:text-emerald-800 transition-colors uppercase tracking-wider pb-0.5"
                  >
                    Send another request
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default BookingPlan;
