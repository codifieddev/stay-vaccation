"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SectionHeaderV2 from '../../../components-v2/SectionHeaderV2';
import ButtonV2 from '../../../components-v2/ButtonV2';
import { topDestinationsData } from './topDestinationsData';

const MotionLink = motion(Link);

interface DynamicContent {
  [key: string]: string;
}

interface TopDestinationsProps {
  section?: {
    adminTitle?: string;
    props?: {
      label?: DynamicContent;
      title?: DynamicContent;
      title_highlight?: DynamicContent;
      subtitle?: DynamicContent;
      btn_text?: DynamicContent;
      btn_link?: string;
    };
  };
  destinations?: any[];
}

const TopDestinations: React.FC<TopDestinationsProps> = ({
  section: propSection,
  destinations = [],
}) => {
  const pathname = usePathname();

  const lang = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'hi') return 'hi';
    return 'en';
  }, [pathname]);

  const section = (topDestinationsData as any) || propSection || {};
  const { props = {} } = section;

  const t = (obj?: DynamicContent | string): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj['en'] || '';
  };

  // Build the dynamic items from database destinations sorted by displayOrder
  const displayItems = useMemo(() => {
    if (!destinations || destinations.length === 0) return [];

    // Sort by displayOrder ascending (default to 999 if displayOrder is not set)
    const sorted = [...destinations].sort(
      (a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999)
    );

    // Limit to top 5 destinations to match the grid layout design
    return sorted.slice(0, 5).map((d, index) => {
      const isFeatured = index === 0;
      return {
        id: d.id || d.slug || `dest-${index}`,
        name: d.name || '',
        slug: d.slug || '',
        image: d.image || 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop&q=80',
        rating: d.rating || 4.9,
        packageCount: d.packageCount || 0,
        isFeatured,
      };
    });
  }, [destinations]);

  return (
    <section id="top-destinations" className="py-20 md:py-28 bg-[#f8f9fa]">
      <div className="container-v2">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
          <SectionHeaderV2
            label={t(props.label) || '✦ TOP DESTINATIONS'}
            title={t(props.title) || 'Explore'}
            titleHighlight={t(props.title_highlight) || 'Dream Destinations'}
            subtitle={
              t(props.subtitle) ||
              'Hand-picked escapes that ignite your wanderlust — from turquoise lagoons to snow-capped peaks.'
            }
          />
          <div className="flex-shrink-0">
            <ButtonV2
              href={props.btn_link || '/destinations'}
              variant="outline"
              style={{ borderColor: 'var(--sky)', color: 'var(--sky)' }}
            >
              {t(props.btn_text) || 'View All →'}
            </ButtonV2>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:grid-rows-[280px_280px]">
          {displayItems.map((item, index) => {
            const isFeatured = item.isFeatured;
            return (
              <MotionLink
                key={item.id}
                href={`/destinations/${item.slug}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className={`group relative overflow-hidden rounded-[24px] cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 block
                  ${isFeatured
                    ? 'col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-2 h-[420px] md:h-[360px] lg:h-auto'
                    : 'col-span-1 h-[220px] md:h-[260px] lg:h-auto'
                  }`}
              >
                {/* Background Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col justify-end text-white">
                  <h3
                    className={`font-bold tracking-tight mb-1 text-white leading-tight
                      ${isFeatured ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}
                  >
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-2 text-white/95 font-medium text-sm md:text-base">
                    <span className="text-amber-400 text-lg">★</span>
                    <span>{item.rating?.toFixed(1)}</span>
                    <span className="opacity-60 font-light">·</span>
                    <span className="text-white/90">
                      {lang === 'hi'
                        ? `${item.packageCount} पैकेज`
                        : `${item.packageCount} Escape${item.packageCount !== 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                </div>
              </MotionLink>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default TopDestinations;
