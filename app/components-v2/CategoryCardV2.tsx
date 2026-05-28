"use client";
import React from 'react';
import Link from 'next/link';
import LucideIcon from '../components/LucideIcon';
import { getCategoryFallbackImage, getCategoryIcon } from '../utils/categoryMapping';
 
interface CategoryCardV2Props {
  cat: {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    icon?: string;
    description?: string;
    packageCount?: number;
    gradient?: string;
  };
  index?: number;
}

const CategoryCardV2: React.FC<CategoryCardV2Props> = ({ cat, index = 0 }) => {
  return (
    <Link
      href={`/categories/${cat.slug}`}
      className="category-card-v2 reveal visible"
      style={{
        animationDelay: `${index * 100}ms`,
        display: 'block',
        position: 'relative',
        borderRadius: '2rem',
        overflow: 'hidden',
        height: '320px',
        boxShadow: 'var(--shadow)',
        transition: 'transform 0.4s ease'
      }}
    >
      <div className="cat-img-wrap" style={{ height: '100%', width: '100%' }}>
        <img
          src={cat.image || getCategoryFallbackImage(cat.name)}
          alt={cat.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="cat-overlay" style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)'
        }} />
      </div>

      <div className="cat-content" style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '2rem',
        zIndex: 2
      }}>
        <div className="cat-icon-v2" style={{
          width: '44px',
          height: '44px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          marginBottom: '1rem',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <LucideIcon name={getCategoryIcon(cat.name, cat.icon)} size={20} />
        </div>

        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#fff', marginBottom: '0.4rem' }}>
          {cat.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--orange)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {cat.packageCount || 0} Packages
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>→</span>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCardV2;
