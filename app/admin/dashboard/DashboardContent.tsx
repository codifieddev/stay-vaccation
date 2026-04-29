"use client";
import React, { useState } from "react";
import { Dashboard, DuplicatePackageModal } from "@/app/components/AdminCore";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { createPackage } from "@/app/store/features/packages/packageThunks";

export default function DashboardContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { packages } = useAppSelector(state => state.packages);
  const [isDupeModalOpen, setIsDupeModalOpen] = useState(false);
  const [basePkgId, setBasePkgId] = useState("");

  const handleDuplicateSubmit = async (pkg: any, days: number) => {
    if (!pkg) return;
    try {
      const { id, _id, ...rest } = pkg;
      const dupeData = {
        ...rest,
        title: (rest.title || rest.destination || "Package") + " (Copy)",
        tripDuration: `${days} Days / ${days - 1} Nights`,
        itinerary: Array.from({ length: days }, (_, i) => {
          const existingDay = (rest.itinerary || [])[i];
          if (existingDay) {
            return {
              ...existingDay,
              id: undefined,
              day: i + 1
            };
          }
          return {
            day: i + 1,
            title: `Day ${i + 1}`,
            description: "Details to be added...",
            activities: [],
            hotelStays: [],
          };
        }),
        createdAt: undefined,
        updatedAt: undefined,
      };

      const resultAction = await dispatch(createPackage(dupeData));
      if (createPackage.fulfilled.match(resultAction)) {
        const result = resultAction.payload as any;
        setIsDupeModalOpen(false);
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
      <Dashboard
        setPage={(p: string) => router.push("/admin/" + p)}
        onOpenDuplicateModal={() => setIsDupeModalOpen(true)}
      />
      
      <DuplicatePackageModal
        isOpen={isDupeModalOpen}
        onClose={() => setIsDupeModalOpen(false)}
        basePkgId={basePkgId}
        setBasePkgId={setBasePkgId}
        packages={packages}
        onSubmit={handleDuplicateSubmit}
      />
    </>
  );
}
