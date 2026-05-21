"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/app/hooks/useCurrency';
import { useAppSelector } from '@/app/store/hooks';


interface TourCardV2Props {
  pkg: {
    id?: string;
    _id?: string;
    name?: string;
    title?: string;
    image?: string;
    images?: string[];
    rating?: number;
    reviewCount?: number;
    category?: string;
    tourType?: string;
    duration?: string;
    tripDuration?: string;
    maxPeople?: number;
    price?: any;
    badge?: string;
    slug?: string;
    destination?: string;
    shortDescription?: string;
    travelStyle?: string;
  };
  index?: number;
}

const TourCardV2: React.FC<TourCardV2Props> = ({ pkg, index = 0 }) => {
  const { convert } = useCurrency();
  const [imgFailed, setImgFailed] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const id = pkg.id || pkg._id;
  const name = pkg.title || pkg.name || 'Premium Experience';
  const image = !imgFailed && (pkg.image || pkg.images?.[0]) 
    ? (pkg.image || pkg.images?.[0]) 
    : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80';
  
  const category = pkg.category || pkg.tourType || pkg.travelStyle || 'Adventure';
  const duration = pkg.duration || pkg.tripDuration || 'Flexible';
  
  const baseAmount = Number(pkg.price?.amount) || Number(pkg.price) || 0;
  const currentPrice = convert(baseAmount, "INR");
  
  const slug = pkg.slug || id;
  const location = pkg.destination || 'Global';
  const shortDesc = pkg.shortDescription || 'Embark on an unforgettable journey to discover gorgeous landscapes, vibrant cultures, and hidden treasures.';

  return (
    <article 
      className="group bg-white rounded-[1.8rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full relative reveal visible" 
      style={{ 
        animationDelay: `${index * 80}ms`,
        minHeight: '440px'
      }}
    >
      {/* Top Image Section */}
      <div className="relative h-56 overflow-hidden shrink-0">
        <img 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          src={image} 
          alt={name} 
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        
        {/* Badge in Top Left */}
        {pkg.badge && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-[9px] font-black tracking-widest px-3 py-1.5 rounded-full shadow-lg uppercase">
            {pkg.badge}
          </div>
        )}

        {/* Category in Top Right */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#1a3f4e] text-[9px] font-extrabold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
          {category}
        </div>

        {/* Location Overlay Badge (Bottom Left) */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-full border border-white/10">
          <svg className="w-3 h-3 text-[#ff9500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px] font-bold tracking-wide truncate max-w-[120px]">{location}</span>
        </div>

        {/* Rating Badge (Bottom Right) */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold">
          <span className="text-yellow-400">★</span>
          <span>{pkg.rating || 4.8} ({pkg.reviewCount || 0})</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title */}
        <Link href={`/packages/${slug}`}>
          <h3 className="font-['Poppins'] font-extrabold text-[#1a3f4e] text-[1.1rem] leading-snug mb-2 hover:text-[#4a90e2] transition-colors duration-300 line-clamp-2">
            {name}
          </h3>
        </Link>
        
        {/* Short Description */}
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {shortDesc}
        </p>

        {/* Spacer & Info Badge */}
        <div className="mt-auto flex items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-1 bg-sky-50 text-[#4a90e2] text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full">
            <span>📅</span>
            <span>{duration}</span>
          </div>
          {pkg.maxPeople && (
            <div className="inline-flex items-center gap-1 bg-sky-50 text-[#4a90e2] text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full">
              <span>👥</span>
              <span>Max {pkg.maxPeople}</span>
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
          <div>
            <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Starting from</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-black text-[#1a3f4e]">
                {currentPrice.symbol} {currentPrice.amountFormatted}
              </span>
              <span className="text-[9px] text-gray-400 font-bold">/person</span>
            </div>
          </div>

          {/* Book Now Button */}
          <Link 
            href={
              user 
                ? `/booking?packageId=${id}&packageName=${encodeURIComponent(name)}&price=${baseAmount}&duration=${encodeURIComponent(duration)}&destination=${encodeURIComponent(location)}&currency=${encodeURIComponent(pkg.price?.currency || 'INR')}`
                : `/login?from=${encodeURIComponent(`/booking?packageId=${id}&packageName=${encodeURIComponent(name)}&price=${baseAmount}&duration=${encodeURIComponent(duration)}&destination=${encodeURIComponent(location)}&currency=${encodeURIComponent(pkg.price?.currency || 'INR')}`)}`
            } 
            className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(255,149,0,0.15)] hover:shadow-[0_6px_20px_rgba(255,149,0,0.3)] hover:-translate-y-0.5"
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
};

export default TourCardV2;
