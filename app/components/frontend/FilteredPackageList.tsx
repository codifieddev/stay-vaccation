"use client";

import { useState, useMemo } from "react";
import PackageCard from "./PackageCard";
import Link from "next/link";

interface Package {
  id: string;
  title: string;
  destination: string;
  tripDuration: string;
  travelStyle: string;
  tourType: string;
  exclusivityLevel: string;
  price: { currency: string; amount: number | string };
  shortDescription: string;
  inclusions?: string[];
  itinerary?: any[];
}

interface FilteredPackageListProps {
  packages: Package[];
  destinationTitle: string;
}

type TabType = "all" | "group" | "custom" | "recommended";
type SortType = "default" | "price-asc" | "price-desc" | "popular";

export default function FilteredPackageList({ packages, destinationTitle }: FilteredPackageListProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [sortOrder, setSortOrder] = useState<SortType>("popular");

  const filteredItems = useMemo(() => {
    let list = [...packages];

    // 1. Category Filtering
    switch (activeTab) {
      case "group":
        list = list.filter(p => p.travelStyle === "Group Tour");
        break;
      case "custom":
        list = list.filter(p => p.travelStyle !== "Group Tour");
        break;
      case "recommended":
        list = list.filter(p => p.exclusivityLevel === "Premium" || p.travelStyle === "Luxury");
        break;
    }

    // 2. Sorting
    if (sortOrder === "price-asc") {
      list.sort((a, b) => Number(a.price?.amount) - Number(b.price?.amount));
    } else if (sortOrder === "price-desc") {
      list.sort((a, b) => Number(b.price?.amount) - Number(a.price?.amount));
    } else if (sortOrder === "popular") {
      // Heuristic: Premium exclusivity or higher price first
      list.sort((a, b) => {
        if (a.exclusivityLevel === "Premium" && b.exclusivityLevel !== "Premium") return -1;
        if (b.exclusivityLevel === "Premium" && a.exclusivityLevel !== "Premium") return 1;
        return Number(b.price?.amount) - Number(a.price?.amount);
      });
    }

    return list;
  }, [packages, activeTab, sortOrder]);

  const tabs: { id: TabType; label: string }[] = [
    { id: "all", label: "All Packages" },
    { id: "group", label: "Group Tours" },
    { id: "custom", label: "Customized Tours" },
    { id: "recommended", label: "Recommended" },
  ];

  return (
    <div className="space-y-10">
      {/* Tabs & Sort UI */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-gray-200">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide w-full lg:w-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            let count = 0;
            if (tab.id === "all") count = packages.length;
            else if (tab.id === "group") count = packages.filter(p => p.travelStyle === "Group Tour").length;
            else if (tab.id === "custom") count = packages.filter(p => p.travelStyle !== "Group Tour").length;
            else if (tab.id === "recommended") count = packages.filter(p => p.exclusivityLevel === "Premium" || p.travelStyle === "Luxury").length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
                  isActive ? "text-[#2fa3f2]" : "text-gray-400 hover:text-[#1a3f4e]"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#2fa3f2]/10 text-[#2fa3f2]" : "bg-gray-100 text-gray-400"}`}>
                  {count}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2fa3f2] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto mb-4">
          <div className="flex-1 lg:flex-none flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-[#2fa3f2] animate-pulse" />
            <span className="text-[#1a3f4e] text-xs font-bold uppercase tracking-wider">{filteredItems.length} Available</span>
          </div>

          <div className="relative group">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortType)}
              className="appearance-none bg-white border border-gray-100 px-6 py-2.5 rounded-2xl text-xs font-bold text-[#1a3f4e] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2fa3f2]/20 cursor-pointer pr-10"
            >
              <option value="popular">🔥 Popular</option>
              <option value="price-asc">💰 Price: Low to High</option>
              <option value="price-desc">💎 Price: High to Low</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Package Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100 max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
            {activeTab === "group" ? "👥" : activeTab === "recommended" ? "✨" : "🏝️"}
          </div>
          <h3 className="text-2xl font-bold text-[#1a3f4e] mb-4">
            No {tabs.find(t => t.id === activeTab)?.label} Found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
            We don't have any packages matching this category in {destinationTitle} right now. Try browsing our other categories or all packages.
          </p>
          <button 
            onClick={() => setActiveTab("all")}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1a3f4e] text-white font-bold rounded-full hover:bg-[#2a5f74] transition-all"
          >
            View All Packages
          </button>
        </div>
      )}
    </div>
  );
}
