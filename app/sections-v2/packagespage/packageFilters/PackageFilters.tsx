import React from "react";
import { FilterGroup } from "./packageFiltersData";

interface PackageFiltersProps {
  filterGroups: FilterGroup[];
  activeFilters: number;
  clearFilters: () => void;
  toggleFilter: (
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
    option: string
  ) => void;
}

export default function PackageFilters({
  filterGroups,
  activeFilters,
  clearFilters,
  toggleFilter,
}: PackageFiltersProps) {
  return (
    <aside className="hidden lg:block w-[300px] shrink-0">
      <div className="sticky top-28 bg-white p-7 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
        <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
          <h3 className="font-['Poppins'] font-extrabold text-[#1a3f4e] text-[1.05rem]">
            Filters
          </h3>
          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="text-[10px] text-[#ff6b00] font-black uppercase tracking-wider border-none bg-transparent cursor-pointer hover:text-[#ff9500] transition-colors duration-300"
            >
              Clear ({activeFilters})
            </button>
          )}
        </div>

        {/* Filter Groups */}
        {filterGroups.map((group) => {
          if (group.options.length === 0) return null;
          return (
            <div key={group.label} className="mb-8 last:mb-0">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3.5">
                {group.label}
              </h4>
              <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto scrollbar-hide pr-1">
                {group.options.map((opt) => {
                  const isActive = group.state.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleFilter(group.state, group.setter, opt)}
                      className={`text-left text-xs px-4 py-3 rounded-xl border transition-all duration-300 font-bold ${
                        isActive
                          ? "border-[#4a90e2]/30 bg-[#e8f4fd]/50 text-[#4a90e2] shadow-sm"
                          : "border-transparent text-gray-500 bg-transparent hover:bg-gray-50 hover:text-[#1a3f4e]"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
