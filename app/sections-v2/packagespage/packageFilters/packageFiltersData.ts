export interface FilterGroup {
  label: string;
  options: string[];
  state: string[];
  setter: React.Dispatch<React.SetStateAction<string[]>>;
}

export const BUDGET_BRACKETS = [
  { label: "Under ₹50k", min: 0, max: 50000 },
  { label: "₹50k - ₹1.5L", min: 50000, max: 150000 },
  { label: "₹1.5L - ₹3L", min: 150000, max: 300000 },
  { label: "₹3L - ₹5L", min: 300000, max: 500000 },
  { label: "Over ₹5L", min: 500000, max: Infinity },
];

export function parseDays(dur: string): number {
  const m = dur?.match(/^(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

export function durationBucket(days: number): string {
  if (days <= 3) return "1-3 Days";
  if (days <= 5) return "4-5 Days";
  if (days <= 7) return "6-7 Days";
  if (days <= 10) return "8-10 Days";
  return "10+ Days";
}
