"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { categoriesHeroData } from './categoriesHeroData';

interface DynamicContent {
  [key: string]: string;
}

interface CategoriesHeroProps {
  section?: {
    adminTitle?: string;
    props?: {
      badge?: DynamicContent;
      heading?: DynamicContent;
      description?: DynamicContent;
      overlay_color?: string;
      image?: string;
    };
  };
}

const CategoriesHero: React.FC<CategoriesHeroProps> = ({ section: propSection }) => {
  const pathname = usePathname();

  const lang = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'hi') return 'hi';
    return 'en';
  }, [pathname]);

  // Prioritize exported TS data, fallback to CMS prop section
  const section = (categoriesHeroData as any) || propSection || {};
  const { props = {} } = section;

  // i18n helper
  const t = (obj?: DynamicContent | string): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj['en'] || '';
  };

  const imageSrc = props.image || categoriesHeroData.props.image;
  const overlayColor = props.overlay_color || categoriesHeroData.props.overlay_color || 'rgba(0,0,0,0.4)';

  return (
    <section
      id="categories-hero"
      className="page-hero-v2"
      style={{ 
        padding: '10rem 0 6rem', 
        background: `linear-gradient(${overlayColor}, ${overlayColor}), url('${imageSrc}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container-v2" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {props.badge && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-badge reveal visible"
            style={{ 
              display: 'inline-block', 
              background: 'rgba(255,255,255,0.15)', 
              backdropFilter: 'blur(10px)',
              padding: '0.4rem 1.2rem',
              borderRadius: '2rem',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {t(props.badge)}
          </motion.div>
        )}
        
        {props.heading && (
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="reveal visible delay-1"
            style={{ 
              fontFamily: 'Poppins, sans-serif', 
              fontWeight: 900, 
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
              color: '#fff', 
              lineHeight: 1.1,
              marginBottom: '1.5rem'
            }}
          >
            {t(props.heading)}
          </motion.h1>
        )}
        
        {props.description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="reveal visible delay-2"
            style={{ 
              color: 'rgba(255,255,255,0.85)', 
              fontSize: '1.1rem', 
              maxWidth: '700px', 
              margin: '0 auto',
              lineHeight: 1.6 
            }}
          >
            {t(props.description)}
          </motion.p>
        )}
      </div>

      <div className="hero-wave" style={{ 
        position: 'absolute', 
        bottom: -1, 
        left: 0, 
        width: '100%', 
        height: '60px', 
        background: 'linear-gradient(to top, var(--white), transparent)' 
      }} />
    </section>
  );
};

export default CategoriesHero;
