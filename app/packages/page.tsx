"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LayoutV2 from "../layouts-v2/LayoutV2";
import PackagesHero from "../sections-v2/packagespage/packagesHero/PackagesHero";
import { useAppSelector } from "@/app/store/hooks";
import { useCurrency } from "@/app/hooks/useCurrency";
import PackageFilters from "../sections-v2/packagespage/packageFilters/PackageFilters";
import Packages from "../sections-v2/packagespage/packages/Packages";
import {
  BUDGET_BRACKETS,
  parseDays,
  durationBucket,
} from "../sections-v2/packagespage/packageFilters/packageFiltersData";

function PackagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { convert, currencies } = useCurrency();

  const { packages, loading: reduxLoading } = useAppSelector(state => state.packages);
  const { categories } = useAppSelector(state => state.categories);
  const loading = reduxLoading && packages.length === 0;

  // Filters state as arrays to support multi-select
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [destParam, setDestParam] = useState(searchParams.get("destination") || "");
  
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get("type") ? decodeURIComponent(searchParams.get("type")!).split(",").filter(Boolean) : []
  );
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    searchParams.get("style") ? decodeURIComponent(searchParams.get("style")!).split(",").filter(Boolean) : []
  );
  const [selectedDurations, setSelectedDurations] = useState<string[]>(
    searchParams.get("duration") ? decodeURIComponent(searchParams.get("duration")!).split(",").filter(Boolean) : []
  );
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
  const [sort, setSort] = useState(searchParams.get("sort") || "default");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPriceInINR = (pkg: any) => {
    const baseAmount = Number(pkg.price?.amount) || Number(pkg.price) || 0;
    const baseCurrency = pkg.price?.currency || "INR";
    const rates: Record<string, number> = {};
    currencies.forEach(c => {
      rates[c.code] = c.exchangeRate;
    });
    if (!rates["INR"]) rates["INR"] = 1;
    const baseRate = rates[baseCurrency] || 1;
    return baseAmount / baseRate;
  };

  // Helper to toggle filter selection
  const toggleFilter = (selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>>, option: string) => {
    setSelected(prev => 
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  // Dynamic filter lists derived from active packages
  const tourTypesList = useMemo(() => {
    const types = new Set<string>();
    packages.forEach(p => {
      if (p.tourType?.trim()) {
        types.add(p.tourType.trim());
      }
    });
    return Array.from(types).sort();
  }, [packages]);

  const travelStylesList = useMemo(() => {
    const styles = new Set<string>();
    packages.forEach(p => {
      if (p.travelStyle?.trim()) {
        styles.add(p.travelStyle.trim());
      }
    });
    return Array.from(styles).sort();
  }, [packages]);

  const durationBucketsList = useMemo(() => {
    const buckets = new Set<string>();
    packages.forEach(p => {
      const days = parseDays(p.tripDuration);
      if (days > 0) {
        buckets.add(durationBucket(days));
      }
    });
    const order = ["1-3 Days", "4-5 Days", "6-7 Days", "8-10 Days", "10+ Days"];
    return Array.from(buckets).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [packages]);

  const destinationsList = useMemo(() => {
    const dests = new Set<string>();
    packages.forEach(p => {
      if (p.destination?.trim()) {
        dests.add(p.destination.trim());
      }
    });
    return Array.from(dests).sort();
  }, [packages]);

  const categoriesList = useMemo(() => {
    const activeCategoryIds = new Set<string>();
    packages.forEach(p => {
      if (p.categoryId) {
        activeCategoryIds.add(p.categoryId.toString());
      }
    });
    const names = Array.from(activeCategoryIds).map(id => {
      const cat = categories.find((c: any) => c._id === id || c.id === id);
      return cat ? cat.name : null;
    }).filter(Boolean) as string[];
    return Array.from(new Set(names)).sort();
  }, [packages, categories]);

  const budgetBracketsList = useMemo(() => {
    const activeBrackets = new Set<string>();
    packages.forEach(p => {
      const priceINR = getPriceInINR(p);
      const bracket = BUDGET_BRACKETS.find(b => priceINR >= b.min && priceINR < b.max);
      if (bracket) {
        activeBrackets.add(bracket.label);
      }
    });
    return BUDGET_BRACKETS.map(b => b.label).filter(l => activeBrackets.has(l));
  }, [packages, currencies]);

  const filtered = useMemo(() => {
    let list = [...packages];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.destination?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q)
      );
    }

    if (destParam.trim()) {
      const d = destParam.toLowerCase();
      list = list.filter(p => 
        p.destinationSlug === d || 
        p.destination?.toLowerCase().includes(d)
      );
    }

    if (selectedTypes.length > 0) {
      list = list.filter(p => p.tourType && selectedTypes.includes(p.tourType));
    }
    
    if (selectedStyles.length > 0) {
      list = list.filter(p => p.travelStyle && selectedStyles.includes(p.travelStyle));
    }
    
    if (selectedDurations.length > 0) {
      list = list.filter(p => selectedDurations.includes(durationBucket(parseDays(p.tripDuration))));
    }

    if (selectedDestinations.length > 0) {
      list = list.filter(p => p.destination && selectedDestinations.includes(p.destination));
    }

    if (selectedCategories.length > 0) {
      list = list.filter(p => {
        const cat = categories.find((c: any) => c._id === p.categoryId || c.id === p.categoryId);
        return cat && selectedCategories.includes(cat.name);
      });
    }

    if (selectedBudgets.length > 0) {
      list = list.filter(p => {
        const priceINR = getPriceInINR(p);
        const bracket = BUDGET_BRACKETS.find(b => priceINR >= b.min && priceINR < b.max);
        return bracket && selectedBudgets.includes(bracket.label);
      });
    }

    // Sort
    if (sort === "price-asc") list.sort((a, b) => Number(a.price?.amount) - Number(b.price?.amount));
    if (sort === "price-desc") list.sort((a, b) => Number(b.price?.amount) - Number(a.price?.amount));
    if (sort === "duration-asc") list.sort((a, b) => parseDays(a.tripDuration) - parseDays(b.tripDuration));
    if (sort === "duration-desc") list.sort((a, b) => parseDays(b.tripDuration) - parseDays(a.tripDuration));

    return list;
  }, [packages, search, destParam, selectedTypes, selectedStyles, selectedDurations, selectedDestinations, selectedCategories, selectedBudgets, sort, categories]);

  const activeFilters = 
    selectedTypes.length + 
    selectedStyles.length + 
    selectedDurations.length + 
    selectedDestinations.length + 
    selectedCategories.length + 
    selectedBudgets.length + 
    (destParam ? 1 : 0);

  const clearFilters = () => { 
    setSelectedTypes([]); 
    setSelectedStyles([]); 
    setSelectedDurations([]); 
    setSelectedDestinations([]); 
    setSelectedCategories([]); 
    setSelectedBudgets([]); 
    setSearch(""); 
    setDestParam(""); 
    setSort("default"); 
  };

  return (
    <LayoutV2>
      <PackagesHero
        searchValue={search}
        onSearchChange={setSearch}
      />

      <section className="py-24 bg-[#f8f9fa]">
        <div className="container-v2">

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Filters */}
            <PackageFilters
              filterGroups={[
                { label: 'Tour Type', options: tourTypesList, state: selectedTypes, setter: setSelectedTypes },
                { label: 'Travel Style', options: travelStylesList, state: selectedStyles, setter: setSelectedStyles },
                { label: 'Duration', options: durationBucketsList, state: selectedDurations, setter: setSelectedDurations },
                { label: 'Destination', options: destinationsList, state: selectedDestinations, setter: setSelectedDestinations },
                { label: 'Category', options: categoriesList, state: selectedCategories, setter: setSelectedCategories },
                { label: 'Budget', options: budgetBracketsList, state: selectedBudgets, setter: setSelectedBudgets },
              ]}
              activeFilters={activeFilters}
              clearFilters={clearFilters}
              toggleFilter={toggleFilter}
            />

            {/* Main Content Area */}
            <Packages
              packages={filtered}
              loading={loading}
              activeFilters={activeFilters}
              clearFilters={clearFilters}
              destParam={destParam}
              setDestParam={setDestParam}
              selectedTypes={selectedTypes}
              setSelectedTypes={setSelectedTypes}
              selectedStyles={selectedStyles}
              setSelectedStyles={setSelectedStyles}
              selectedDurations={selectedDurations}
              setSelectedDurations={setSelectedDurations}
              selectedDestinations={selectedDestinations}
              setSelectedDestinations={setSelectedDestinations}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedBudgets={selectedBudgets}
              setSelectedBudgets={setSelectedBudgets}
              toggleFilter={toggleFilter}
              sort={sort}
              setSort={setSort}
            />
          </div>
        </div>
      </section>
    </LayoutV2>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen hero-bg flex items-center justify-center"><div className="text-white text-xl">Loading packages…</div></div>}>
      <PackagesContent />
    </Suspense>
  );
}
