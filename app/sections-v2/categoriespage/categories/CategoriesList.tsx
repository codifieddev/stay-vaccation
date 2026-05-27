"use client";

import React, { useMemo } from "react";
import CategoryCardV2 from "../../../components-v2/CategoryCardV2";
import { Category } from "@/app/store/features/categories/types";
import { sortCategories } from "./categoriesSort";

interface CategoriesListProps {
  categories: Category[];
}

export default function CategoriesList({ categories }: CategoriesListProps) {
  // 1. Sort categories using our reusable sorting utility
  const sortedCategories = useMemo(() => {
    return sortCategories(categories);
  }, [categories]);

  // 2. Filter active categories
  const activeCategories = useMemo(() => {
    return sortedCategories.filter((cat) => cat.isActive);
  }, [sortedCategories]);

  return (
    <section style={{ padding: '6rem 0', background: 'var(--white)' }}>
      <div className="container-v2">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {activeCategories.map((cat, i) => (
            <CategoryCardV2 key={cat._id || cat.slug} cat={cat as any} index={i} />
          ))}
        </div>

        {activeCategories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0', background: 'var(--cream)', borderRadius: '2rem', border: '2px dashed #e5e7eb' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏝️</div>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.4rem', marginBottom: '1rem' }}>No categories found</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Check back later for exciting travel styles.</p>
          </div>
        )}
      </div>
    </section>
  );
}
