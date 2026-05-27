"use client";
import React from 'react';
import Link from 'next/link';
import TourCardV2 from "@/app/components-v2/TourCardV2";

interface CategoryPackagesGridV2Props {
  category: {
    name: string;
  };
  packages: any[];
}

const CategoryPackagesGridV2: React.FC<CategoryPackagesGridV2Props> = ({ category, packages }) => {
  return (
    <section className="py-20 bg-[#f8f9fa] relative z-20">
      <div className="container-v2">
        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {packages.map((pkg, idx) => (
              <TourCardV2 key={pkg.id || pkg._id} pkg={pkg} index={idx} />
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-20 px-8 bg-white rounded-[2rem] border border-gray-150 shadow-sm">
            <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
              🧭
            </div>
            <h2 className="text-2xl font-black text-[#1a3f4e] font-['Poppins'] mb-3">
              No active packages found
            </h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto">
              Our travel specialists are actively updating the {category.name.toLowerCase()} catalog. In the meantime, discover other stunning getaways.
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(255,149,0,0.15)] hover:shadow-[0_6px_20px_rgba(255,149,0,0.3)] hover:-translate-y-0.5"
            >
              Explore other Categories
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryPackagesGridV2;
