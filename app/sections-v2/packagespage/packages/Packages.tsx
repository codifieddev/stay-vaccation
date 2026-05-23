"use client";

import React, { useMemo } from "react";
import TourCardV2 from "../../../components-v2/TourCardV2";
import { Package } from "./packages.types";
import { SORT_OPTIONS, sortPackages } from "./packagesData";

interface PackagesProps {
  packages: Package[];
  loading: boolean;
  activeFilters: number;
  clearFilters: () => void;
  destParam: string;
  setDestParam: (d: string) => void;
  selectedTypes: string[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedStyles: string[];
  setSelectedStyles: React.Dispatch<React.SetStateAction<string[]>>;
  selectedDurations: string[];
  setSelectedDurations: React.Dispatch<React.SetStateAction<string[]>>;
  selectedDestinations: string[];
  setSelectedDestinations: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedBudgets: string[];
  setSelectedBudgets: React.Dispatch<React.SetStateAction<string[]>>;
  toggleFilter: (
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    option: string
  ) => void;
  sort: string;
  setSort: (s: string) => void;
}

export default function Packages({
  packages,
  loading,
  activeFilters,
  clearFilters,
  destParam,
  setDestParam,
  selectedTypes,
  setSelectedTypes,
  selectedStyles,
  setSelectedStyles,
  selectedDurations,
  setSelectedDurations,
  selectedDestinations,
  setSelectedDestinations,
  selectedCategories,
  setSelectedCategories,
  selectedBudgets,
  setSelectedBudgets,
  toggleFilter,
  sort,
  setSort,
}: PackagesProps) {
  // Sort the packages list according to the selected configuration
  const sorted = useMemo(() => {
    return sortPackages(packages, sort);
  }, [packages, sort]);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 pb-4 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {loading ? (
            "Loading packages..."
          ) : (
            <>
              Found{" "}
              <span className="text-[#1a3f4e] font-black text-sm normal-case">
                {sorted.length}
              </span>{" "}
              adventures for you
            </>
          )}
        </p>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Sort by:
          </span>
          <div className="relative group shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-white border border-gray-200 px-6 py-3 rounded-2xl text-xs font-bold text-[#1a3f4e] shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4a90e2]/15 cursor-pointer pr-10 transition-all duration-300"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 transition-transform duration-300 group-hover:translate-y-[-30%]">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Active filter pills */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap gap-2.5 mb-8">
          {destParam && (
            <span className="inline-flex items-center gap-2 bg-[#e8f4fd] text-[#4a90e2] text-[10px] font-bold px-4 py-2 rounded-full border border-sky-100">
              Location: {destParam}
              <button
                onClick={() => setDestParam("")}
                className="hover:text-red-500 transition-colors font-bold ml-1"
              >
                ✕
              </button>
            </span>
          )}
          {selectedTypes.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-2 bg-[#e8f4fd] text-[#4a90e2] text-[10px] font-bold px-4 py-2 rounded-full border border-sky-100"
            >
              Type: {t}
              <button
                onClick={() => toggleFilter(selectedTypes, setSelectedTypes, t)}
                className="hover:text-red-500 transition-colors font-bold ml-1"
              >
                ✕
              </button>
            </span>
          ))}
          {selectedStyles.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-2 bg-orange-50 text-[#ff6b00] text-[10px] font-bold px-4 py-2 rounded-full border border-orange-100"
            >
              Style: {s}
              <button
                onClick={() => toggleFilter(selectedStyles, setSelectedStyles, s)}
                className="hover:text-red-500 transition-colors font-bold ml-1"
              >
                ✕
              </button>
            </span>
          ))}
          {selectedDurations.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-2 bg-slate-50 text-slate-550 text-[10px] font-bold px-4 py-2 rounded-full border border-slate-100"
            >
              Duration: {d}
              <button
                onClick={() =>
                  toggleFilter(selectedDurations, setSelectedDurations, d)
                }
                className="hover:text-red-500 transition-colors font-bold ml-1"
              >
                ✕
              </button>
            </span>
          ))}
          {selectedDestinations.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-2 bg-[#e8f4fd] text-[#4a90e2] text-[10px] font-bold px-4 py-2 rounded-full border border-sky-100"
            >
              Dest: {d}
              <button
                onClick={() =>
                  toggleFilter(selectedDestinations, setSelectedDestinations, d)
                }
                className="hover:text-red-500 transition-colors font-bold ml-1"
              >
                ✕
              </button>
            </span>
          ))}
          {selectedCategories.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-2 bg-orange-50 text-[#ff6b00] text-[10px] font-bold px-4 py-2 rounded-full border border-orange-100"
            >
              Cat: {c}
              <button
                onClick={() =>
                  toggleFilter(selectedCategories, setSelectedCategories, c)
                }
                className="hover:text-red-500 transition-colors font-bold ml-1"
              >
                ✕
              </button>
            </span>
          ))}
          {selectedBudgets.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-2 bg-slate-50 text-slate-550 text-[10px] font-bold px-4 py-2 rounded-full border border-slate-100"
            >
              Budget: {b}
              <button
                onClick={() =>
                  toggleFilter(selectedBudgets, setSelectedBudgets, b)
                }
                className="hover:text-red-500 transition-colors font-bold ml-1"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[440px] bg-white border border-gray-100 rounded-[1.8rem] shadow-sm animate-pulse"
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm max-w-3xl mx-auto px-6">
          <div className="w-20 h-20 bg-[#e8f4fd] rounded-full flex items-center justify-center mx-auto mb-6 text-[#4a90e2]">
            <span className="text-3xl">🏜️</span>
          </div>
          <h3 className="text-2xl font-extrabold text-[#1a3f4e] mb-3 font-['Poppins']">
            No Packages Found
          </h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
            We don't have any travel listings matching your selected filters. Try
            widening your criteria or clearing some filters!
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(255,149,0,0.15)] hover:shadow-[0_6px_20px_rgba(255,149,0,0.3)] hover:-translate-y-0.5"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
          {sorted.map((pkg, i) => (
            <TourCardV2 key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
