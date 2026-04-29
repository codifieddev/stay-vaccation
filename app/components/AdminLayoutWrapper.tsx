"use client";
import React from "react";
import { Sidebar, Topbar } from "./AdminCore";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/app/store/hooks";

export default function AdminLayoutWrapper({ children, section: propSection }: { children: React.ReactNode; section?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, authChecked, loading: authLoading } = useAppSelector(state => state.auth);

  React.useEffect(() => {
    if (authChecked) {
      if (!user) {
        router.push(`/login?from=${encodeURIComponent(pathname)}`);
      } else if (user.role !== "admin") {
        router.push("/unauthorized");
      }
    }
  }, [user, authChecked, router, pathname]);

  const segments = pathname.split("/").filter(Boolean); // ['admin', 'packages', 'create']
  const section = propSection || segments[1] || "dashboard"; // 'packages', 'transfers', 'dashboard', etc.

  const setPage = (key: string) => {
    router.push(`/admin/${key}`);
  };

  const packages = useAppSelector(state => state.packages.packages);
  const masterActivities = useAppSelector(state => state.activities.masterActivities);
  const masterHotels = useAppSelector(state => state.hotels.masterHotels);
  const coupons = useAppSelector(state => state.coupons.coupons);
  const transfers = useAppSelector(state => state.transfers.transfers);
  const destinations = useAppSelector(state => state.destinations.destinations);
  const activityPages = useAppSelector(state => state.activityPages.activityPages);
  const categories = useAppSelector(state => state.categories.categories);
  const currencies = useAppSelector(state => state.currency.currencies);

  const counts = {
    packages: packages.length,
    activities: masterActivities.length,
    hotels: masterHotels.length,
    coupons: coupons.length,
    bookings: 0,
    transfers: transfers.length,
    destinations: destinations.length,
    activityPages: activityPages.length,
    categories: categories.length,
    currencies: currencies.length,
  };

  const PAGE_META: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: "Dashboard", subtitle: "Stay Vacation — Travel Management" },
    packages: { title: "Travel Packages", subtitle: `${packages.length} packages in catalog` },
    create: { title: "Create Package", subtitle: "Add a new travel package to your catalog" },
    edit: { title: "Edit Package", subtitle: "Modify an existing travel package" },
    view: { title: "Package Details", subtitle: "Viewing package details" },
    "master-activities": {
      title: "Master Activities",
      subtitle: `${masterActivities.length} reusable activities`,
    },
    "master-hotels": {
      title: "Master Hotels",
      subtitle: `${masterHotels.length} hotels in global catalog`,
    },
    coupons: { title: "Coupons & Discounts", subtitle: `${coupons.length} active coupons` },
    bookings: { title: "Bookings", subtitle: "View and manage all guest bookings" },
    transfers: {
      title: "Transfer Management",
      subtitle: `${transfers.length} active transfer routes`,
    },
    "activity-pages": {
      title: "Activity Landing Pages",
      subtitle: `${activityPages.length} pages managed`,
    },
    "page-cms": {
      title: "Page CMS",
      subtitle: "Manage content for dynamic web pages",
    },
    locations: {
      title: "Locations",
      subtitle: "Manage travel locations",
    },
    trending: {
      title: "Trending Destinations",
      subtitle: "Manage destinations shown on the homepage trending section",
    },
    "business-settings": {
      title: "Business Settings",
      subtitle: "Manage your travel agency identity, branding, and contact information",
    },
    categories: {
      title: "Homepage Categories",
      subtitle: `${categories.length} categories on homepage`,
    },
    currencies: {
      title: "Currency Settings",
      subtitle: `${currencies.length} currencies configured`,
    },
    new: { title: "New Transfer Route", subtitle: "Add a new transfer route" },
  };

  // Determine which meta to show based on path depth
  let metaKey = section;
  if (segments[2] === "create") metaKey = "create";
  else if (segments[2] === "edit") metaKey = "edit";
  else if (segments[2] === "view") metaKey = "view";
  else if (segments[2] === "new") metaKey = "new";

  const meta = PAGE_META[metaKey] || PAGE_META.dashboard;

  if (!authChecked || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/80">
      <Sidebar page={section} setPage={setPage} counts={counts} />
      <Topbar title={meta.title} subtitle={meta.subtitle} />
      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-6 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
