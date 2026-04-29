"use client";
import { PackagesListing, DuplicatePackageModal } from "@/app/components/AdminCore";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { createPackage } from "@/app/store/features/packages/packageThunks";

export default function PackagesPageContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { packages } = useAppSelector(state => state.packages);
  
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
        finalItinerary = baseItinerary;
      } else if (days < currentLen) {
        finalItinerary = baseItinerary.slice(0, days);
      } else {
        finalItinerary = [...baseItinerary];
        const lastDay = JSON.parse(JSON.stringify(baseItinerary[baseItinerary.length - 1]));

        for (let i = 0; i < days - currentLen; i++) {
          finalItinerary.push({
            ...lastDay,
            id: undefined,
            dayNumber: currentLen + i + 1,
            title: `Day ${currentLen + i + 1}`,
            activities: (lastDay.activities || []).map((a: any) => ({ ...a, id: undefined })),
            hotelStays:  (lastDay.hotelStays  || []).map((h: any) => ({ ...h, id: undefined })),
            transfers:   (lastDay.transfers   || []).map((t: any) => ({ ...t, id: undefined })),
          });
        }
      }

      const newTitle    = (deepCloned.title || deepCloned.destination || "Package") + " (Copy)";
      const newDuration = days === 1 ? "1 Day" : `${days} Days / ${days - 1} Night${days - 1 === 1 ? "" : "s"}`;
      const baseSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const newSlug  = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

      const dupePayload = {
        ...deepCloned,
        title: newTitle,
        slug: newSlug,
        tripDuration: newDuration,
        itinerary: finalItinerary,
        createdAt: undefined,
        updatedAt: undefined,
      };

      const resultAction = await dispatch(createPackage(dupePayload));
      if (createPackage.fulfilled.match(resultAction)) {
        const result = resultAction.payload as any;
        setDuplicateModalOpen(false);
        router.push(`/admin/packages/edit/${result.insertedId || result.id}`);
      } else {
        alert("Duplicate failed: " + (resultAction.error?.message || "Unknown error"));
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
