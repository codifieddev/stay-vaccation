"use client";
import React, { useState } from "react";
import { Dashboard, useStore, DuplicatePackageModal } from "@/app/components/AdminCore";
import { useRouter } from "next/navigation";

export default function DashboardContent() {
  const router = useRouter();
  const { packages, setPackages } = useStore();
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
              id: undefined, // let server generate new IDs
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

      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dupeData),
      });
      const result = await res.json();
      if (result.success) {
        // Refresh packages list
        const refreshRes = await fetch("/api/packages");
        const refreshData = await refreshRes.json();
        if (refreshData.success) setPackages(refreshData.data);
        
        setIsDupeModalOpen(false);
        router.push(`/admin/packages/edit/${result.insertedId}`);
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
