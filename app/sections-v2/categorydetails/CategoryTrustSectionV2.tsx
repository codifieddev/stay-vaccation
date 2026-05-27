"use client";
import React from 'react';

interface CategoryTrustSectionV2Props {
  categoryName: string;
}

const CategoryTrustSectionV2: React.FC<CategoryTrustSectionV2Props> = ({ categoryName }) => {
  const lowercaseCategory = categoryName.toLowerCase();

  return (
    <section className="pb-24 bg-[#f8f9fa] relative z-20">
      <div className="container-v2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 md:p-14 bg-gradient-to-br from-[#1a3f4e] to-[#0f252f] rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
          {/* Abstract background blur rings */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sky-500/5 rounded-full blur-2xl" />

          {/* Badge 1: Operators */}
          <div className="flex flex-col items-center text-center p-4 group transition-all duration-350 hover:-translate-y-1 relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-3deg] shadow-lg border border-white/10">
              🛡️
            </div>
            <h4 className="font-['Poppins'] font-extrabold text-lg mb-3 tracking-wide">
              Verified Operators
            </h4>
            <p className="text-white/60 text-xs md:text-sm leading-relaxed max-w-[280px]">
              All {lowercaseCategory} tours are conducted by licensed, local experts vetted for safety and quality.
            </p>
          </div>

          {/* Badge 2: Price Match */}
          <div className="flex flex-col items-center text-center p-4 border-y md:border-y-0 md:border-x border-white/10 group transition-all duration-350 hover:-translate-y-1 relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-3deg] shadow-lg border border-white/10">
              💰
            </div>
            <h4 className="font-['Poppins'] font-extrabold text-lg mb-3 tracking-wide">
              Best Price Guarantee
            </h4>
            <p className="text-white/60 text-xs md:text-sm leading-relaxed max-w-[280px]">
              Found the same {lowercaseCategory} tour cheaper elsewhere? We will happily match it and offer a 5% discount.
            </p>
          </div>

          {/* Badge 3: Instant */}
          <div className="flex flex-col items-center text-center p-4 group transition-all duration-350 hover:-translate-y-1 relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-3deg] shadow-lg border border-white/10">
              ⚡
            </div>
            <h4 className="font-['Poppins'] font-extrabold text-lg mb-3 tracking-wide">
              Instant Confirmation
            </h4>
            <p className="text-white/60 text-xs md:text-sm leading-relaxed max-w-[280px]">
              Secure your slots dynamically with our instant payment processing and real-time confirmations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryTrustSectionV2;
