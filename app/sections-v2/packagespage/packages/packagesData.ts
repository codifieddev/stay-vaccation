import { Package, SortOption } from "./packages.types";

export const SORT_OPTIONS: SortOption[] = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "duration-asc", label: "Duration: Shortest" },
  { value: "duration-desc", label: "Duration: Longest" },
];

export function parseDays(dur: string): number {
  const m = dur?.match(/^(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

export function sortPackages(packages: Package[], sortType: string): Package[] {
  const list = [...packages];
  if (sortType === "default") {
    list.sort((a, b) => {
      const orderA = a.displayOrder ?? Infinity;
      const orderB = b.displayOrder ?? Infinity;
      if (orderA === orderB) {
        // Fallback: Latest packages first
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      return orderA - orderB;
    });
  } else if (sortType === "price-asc") {
    list.sort((a, b) => Number(a.price?.amount) - Number(b.price?.amount));
  } else if (sortType === "price-desc") {
    list.sort((a, b) => Number(b.price?.amount) - Number(a.price?.amount));
  } else if (sortType === "duration-asc") {
    list.sort((a, b) => parseDays(a.tripDuration) - parseDays(b.tripDuration));
  } else if (sortType === "duration-desc") {
    list.sort((a, b) => parseDays(b.tripDuration) - parseDays(a.tripDuration));
  }
  return list;
}
