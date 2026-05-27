import { Category } from "@/app/store/features/categories/types";

/**
 * Reusable utility to sort categories by displayOrder ASC.
 * - Categories with displayOrder sort ascending first.
 * - Categories without displayOrder appear at the end.
 * - Identical weights fall back to alphabetical order by name.
 */
export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    const orderA = a.displayOrder ?? Infinity;
    const orderB = b.displayOrder ?? Infinity;
    if (orderA === orderB) {
      return (a.name || "").localeCompare(b.name || "");
    }
    return orderA - orderB;
  });
}
