"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LucideIcon from '../../../components/LucideIcon';
import { heroSectionData } from './heroSectionData';

interface DynamicContent {
  [key: string]: string;
}

interface SectionItem {
  id: string;
  type: string;
  props: {
    image?: string;
    title?: DynamicContent;
    [key: string]: any;
  };
}

import SearchBarV2 from '../../../components-v2/SearchBarV2';

interface HeroSectionProps {
  section?: {
    adminTitle?: string;
    props?: {
      badge?: DynamicContent;
      heading?: DynamicContent;
      heading_highlight?: DynamicContent;
      description?: DynamicContent;
      primary_btn_text?: DynamicContent;
      primary_btn_link?: string;
      secondary_btn_text?: DynamicContent;
      secondary_btn_link?: string;
      search_label_destination?: DynamicContent;
      search_placeholder_destination?: DynamicContent;
      search_label_checkin?: DynamicContent;
      search_label_checkout?: DynamicContent;
      search_label_guests?: DynamicContent;
      search_placeholder_guests?: DynamicContent;
      search_btn_text?: DynamicContent;
      overlay_color?: string;
      overlay_opacity?: number;
    };
    content?: SectionItem[];
  };
  destinations?: any[];
  lang?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ section: propSection, destinations = [], lang = 'en' }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Prioritize exported TS data
  const section = (heroSectionData as any) || propSection || {};
  const { props = {}, content = [] } = section;
  const t = (obj?: DynamicContent) => obj?.[lang] || obj?.['en'] || '';
  const cleanBtnText = (txt: string) => {
    return txt.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF]/g, "").trim();
  };

  const slides = content.length > 0 ? content.map((item: any) => item.props.image).filter(Boolean) : [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section id="hero-v2">
      <div className="hero-slides">
        {slides.map((slide: string, index: number) => (
          <div
            key={index}
            className={`hero-slide ${index === activeSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `url('${slide}')`,
              '--overlay-color': props.overlay_color,
              '--overlay-opacity': props.overlay_opacity
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="hero-content-v2">
        {props.badge && (
          <div className="hero-badge reveal visible">
            {t(props.badge)}
          </div>
        )}

        <div className="hero-logo-large reveal visible delay-1">
          stay<span>Vacation</span>
        </div>

        {(props.heading || props.heading_highlight) && (
          <h1 className="hero-title-v2 reveal visible delay-2">
            {t(props.heading)}
            {props.heading_highlight && (
              <>
                <br />
                <span className="text-[#ff9500]">{t(props.heading_highlight)}</span>
              </>
            )}
          </h1>
        )}

        {props.description && (
          <p className="hero-sub-v2 reveal visible delay-3">
            {t(props.description)}
          </p>
        )}

        <div className="hero-btns flex flex-row items-center justify-center gap-4 flex-wrap reveal visible delay-4 mt-2 mb-10">
          {props.primary_btn_text && (
            <Link 
              href={props.primary_btn_link || '/destinations'} 
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white text-xs font-black uppercase tracking-[0.15em] rounded-full shadow-[0_6px_20px_rgba(255,149,0,0.3)] hover:shadow-[0_8px_30px_rgba(255,149,0,0.45)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
            >
              <LucideIcon name="Compass" size={14} className="group-hover:rotate-12 transition-transform duration-500" />
              {cleanBtnText(t(props.primary_btn_text))}
            </Link>
          )}
          {props.secondary_btn_text && (
            <Link 
              href={props.secondary_btn_link || '/contact'} 
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/30 text-xs font-black uppercase tracking-[0.15em] rounded-full hover:bg-white hover:text-[#1a3f4e] hover:border-white hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all duration-300 group cursor-pointer"
            >
              <LucideIcon name="Calendar" size={14} className="group-hover:scale-110 transition-transform duration-500" />
              {cleanBtnText(t(props.secondary_btn_text))}
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar Component */}
      <SearchBarV2
        destinations={destinations}
        labels={{
          destination: t(props.search_label_destination),
          placeholder_destination: t(props.search_placeholder_destination),
          checkin: t(props.search_label_checkin),
          checkout: t(props.search_label_checkout),
          guests: t(props.search_label_guests),
          placeholder_guests: t(props.search_placeholder_guests),
          search_btn: t(props.search_btn_text)
        }}
      />


      {slides.length > 1 && (
        <div className="hero-dots">
          {slides.map((_: any, index: number) => (
            <button
              key={index}
              className={`hero-dot ${index === activeSlide ? 'active' : ''}`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
