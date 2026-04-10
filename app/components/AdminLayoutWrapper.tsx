"use client";
import React from "react";
import { Sidebar, Topbar, StoreContext } from "./AdminCore";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const segments = pathname.split("/").filter(Boolean); // ['admin', 'packages', 'create']
  const section = segments[1] || "dashboard"; // 'packages', 'transfers', 'dashboard', etc.

  const setPage = (key: string) => {
    router.push(`/admin/${key}`);
  };

  const store = React.useContext(StoreContext);
  const counts = store
    ? {
        packages: store.packages.length,
        activities: store.masterActivities.length,
        hotels: store.masterHotels.length,
        coupons: store.coupons.length,
        bookings: 0,
        transfers: store.transfers.length,
      }
    : { packages: 0, activities: 0, hotels: 0, coupons: 0, bookings: 0, transfers: 0 };

  const PAGE_META: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: "Dashboard", subtitle: "Stay Vacation — Travel Management" },
    packages: { title: "Travel Packages", subtitle: store ? `${store.packages.length} packages in catalog` : "" },
    create: { title: "Create Package", subtitle: "Add a new travel package to your catalog" },
    edit: { title: "Edit Package", subtitle: "Modify an existing travel package" },
    view: { title: "Package Details", subtitle: "Viewing package details" },
    "master-activities": {
      title: "Master Activities",
      subtitle: store ? `${store.masterActivities.length} reusable activities` : "",
    },
    "master-hotels": {
      title: "Master Hotels",
      subtitle: store ? `${store.masterHotels.length} hotels in global catalog` : "",
    },
    coupons: { title: "Coupons & Discounts", subtitle: store ? `${store.coupons.length} active coupons` : "" },
    bookings: { title: "Bookings", subtitle: "View and manage all guest bookings" },
    transfers: {
      title: "Transfer Management",
      subtitle: store ? `${store.transfers.length} active transfer routes` : "",
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
