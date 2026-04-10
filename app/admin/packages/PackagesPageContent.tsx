"use client";
import { PackagesListing, useStore, DuplicatePackageModal } from "@/app/components/AdminCore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PackagesPageContent() {
  const router = useRouter();
  const { packages, setPackages } = useStore();
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateBasePkgId, setDuplicateBasePkgId] = useState("");

  const setPage = (p: string) => {
    // Map old page keys to correct routes
    if (p === "create") return router.push("/admin/packages/create");
    router.push("/admin/" + p);
  };

  const setSelectedId = (id: string) => {
    router.push(`/admin/packages/edit/${id}`);
  };

  const handleOpenDuplicate = (pkg: any) => {
    setDuplicateBasePkgId(pkg.id);
    setDuplicateModalOpen(true);
  };

  const handleDuplicateSubmit = async (basePkg: any, days: number) => {
    if (!basePkg) { alert("Base package missing"); return; }

    const currentLen = basePkg.itinerary?.length || 1;
    if (days < currentLen || days > 15) {
      alert(`Validation Failed: Duration must be between ${currentLen} and 15 days`);
      return;
    }

    try {
      // Strip original Mongo IDs so server generates fresh ones
      const { id: _origRoutingId, _id: _origMongoId, ...rest } = basePkg;

      // Deep clone everything — zero reference-sharing with original
      const deepCloned: any = JSON.parse(JSON.stringify(rest));

      // ── Step 1: Clone base itinerary, stripping all sub-item IDs ──
      const baseItinerary: any[] = (deepCloned.itinerary || []).map((day: any) => ({
        ...day,
        id: undefined,
        activities: (day.activities || []).map((a: any) => ({ ...a, id: undefined })),
        hotelStays:  (day.hotelStays  || []).map((h: any) => ({ ...h, id: undefined })),
        transfers:   (day.transfers   || []).map((t: any) => ({ ...t, id: undefined })),
      }));

      // ── Step 2: Expand/trim to requested number of days ──
      let finalItinerary: any[];

      if (days === currentLen) {
        // Exact copy — no changes needed
        finalItinerary = baseItinerary;
      } else if (days < currentLen) {
        // Trim itinerary
        finalItinerary = baseItinerary.slice(0, days);
      } else {
        // Extend: duplicate the last day to fill up to `days`
        finalItinerary = [...baseItinerary];
        // Snapshot the last day ONCE before the loop to avoid re-reading a pushed item
        const lastDay = JSON.parse(JSON.stringify(baseItinerary[baseItinerary.length - 1]));

        for (let i = 0; i < days - currentLen; i++) {
          finalItinerary.push({
            ...lastDay,
            id: undefined,
            dayNumber: currentLen + i + 1,
            title: `Day ${currentLen + i + 1}`,
            // Fresh deep-copies of sub-arrays
            activities: (lastDay.activities || []).map((a: any) => ({ ...a, id: undefined })),
            hotelStays:  (lastDay.hotelStays  || []).map((h: any) => ({ ...h, id: undefined })),
            transfers:   (lastDay.transfers   || []).map((t: any) => ({ ...t, id: undefined })),
          });
        }
      }

      console.log(`[DEBUG] Expanding itinerary: ${currentLen} → ${finalItinerary.length} days`);

      const newTitle    = (deepCloned.title || deepCloned.destination || "Package") + " (Copy)";
      const newDuration = days === 1 ? "1 Day" : `${days} Days / ${days - 1} Night${days - 1 === 1 ? "" : "s"}`;

      // Generate a unique slug for routing and SEO
      const baseSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const newSlug  = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

      // Build duplicate payload — no id/packageId here; server generates them
      const dupePayload = {
        ...deepCloned,
        title: newTitle,
        slug: newSlug, // ← newly added unique slug
        tripDuration: newDuration,
        itinerary: finalItinerary, // ← guaranteed to be `days` items long
        createdAt: undefined,
        updatedAt: undefined,
      };

      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dupePayload),
      });
      const result = await res.json();

      if (result.success) {
        const mongoId: string    = result.insertedId; // e.g. "67f8a1b2..."
        const packageId: string  = result.packageId;  // e.g. "pkg_1712345678_abc1"

        console.log(`[DEBUG] Duplicate saved → mongoId: ${mongoId}, packageId: ${packageId}, itinerary days: ${finalItinerary.length}`);

        // Inject into state synchronously so the edit page finds it immediately
        const newPkg = {
          ...dupePayload,
          id: mongoId,       // routing ID (matches EditPackageContent lookup)
          packageId,         // human-readable unique ID stored in DB
          itinerary: finalItinerary,
        };
        setPackages(prev => [...prev, newPkg as any]);

        setDuplicateModalOpen(false);
        router.push(`/admin/packages/edit/${mongoId}`);
      } else {
        alert("Duplicate failed: " + (result.message || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Network error during duplication.");
    }
  };

  return (
    <>
      <PackagesListing
        setPage={setPage}
        setSelectedId={setSelectedId}
        onDuplicate={handleOpenDuplicate}
      />
      
      <DuplicatePackageModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        basePkgId={duplicateBasePkgId}
        setBasePkgId={setDuplicateBasePkgId}
        packages={packages}
        onSubmit={handleDuplicateSubmit}
      />
    </>
  );
}
