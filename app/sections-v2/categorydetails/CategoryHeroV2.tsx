"use client";
import React from 'react';
import { motion } from 'framer-motion';
import LucideIcon from "@/app/components/LucideIcon";
import { getCategoryIcon } from "@/app/utils/categoryMapping";

interface CategoryHeroV2Props {
  category: {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    icon?: string;
    color?: string;
    gradient?: string;
  };
  totalPackages: number;
}

const CategoryHeroV2: React.FC<CategoryHeroV2Props> = ({ category, totalPackages }) => {
  const iconName = getCategoryIcon(category.name, category.icon);

  return (
    <section className="relative pt-32 pb-24 md:py-36 overflow-hidden min-h-[440px] flex items-center bg-slate-950">
      {/* Background Cover Image with Rich Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        {category.image ? (
          <>
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover object-center scale-105 animate-pulse-slow"
              decoding="async"
            />
            {/* Rich dark gradient for high text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${category.color || category.gradient || 'from-sky-950 to-indigo-950'} opacity-95`} />
        )}

        {/* Dynamic Abstract Shapes */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-black/20 -skew-x-12 -translate-x-1/2 blur-3xl" />
      </div>

      <div className="container-v2 relative z-10">
        <div className="max-w-3xl text-left">
          {/* Category Badge with Icon */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6"
          >
            <span className="text-orange-400 flex items-center justify-center">
              <LucideIcon name={iconName} size={16} strokeWidth={2.5} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider font-['Poppins']">
              {category.name} Experiences
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white font-['Poppins'] tracking-tight leading-none mb-6"
          >
            {category.name}{' '}
            <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Adventures
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-200/90 text-base md:text-lg lg:text-xl font-light leading-relaxed max-w-2xl mb-8"
          >
            {category.description || `Embark on beautifully curated itineraries custom-crafted for ${category.name.toLowerCase()} enthusiasts and global explorers alike.`}
          </motion.p>

          {/* Live Tour Count Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="w-fit bg-emerald-500/10 backdrop-blur-sm px-4.5 py-2.5 rounded-full border border-emerald-500/25 flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-white text-xs font-bold uppercase tracking-wider font-['Poppins']">
              {totalPackages} {totalPackages === 1 ? 'Tour Available' : 'Tours Available'}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Modern Wave Wave Divider Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none translate-y-[2px]">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 48H1440V0C1440 0 1140 32 720 32C300 32 0 0 0 0V48Z" fill="#f8f9fa" />
        </svg>
      </div>
    </section>
  );
};

export default CategoryHeroV2;
