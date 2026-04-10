"use client";
import { PackagesListing, useStore } from "@/app/components/AdminCore";
import { useRouter } from "next/navigation";

export default function PackagesPageContent() {
  const router = useRouter();
  const { setPackages } = useStore();

  const setPage = (p: string) => {
    // Map old page keys to correct routes
    if (p === "create") return router.push("/admin/packages/create");
    router.push("/admin/" + p);
  };

  const setSelectedId = (id: string) => {
    router.push(`/admin/packages/edit/${id}`);
  };

  const onView = (id: string) => {
    router.push(`/admin/packages/view/${id}`);
  };

  const handleDuplicate = async (pkg: any) => {
    if (!confirm(`Duplicate "${pkg.title || pkg.destination}"? A copy will be created.`)) return;
    try {
      const { id, _id, ...rest } = pkg;
      const dupeData = {
        ...rest,
        title: (rest.title || rest.destination || "Package") + " (Copy)",
        itinerary: (rest.itinerary || []).map((day: any) => ({
          ...day,
          id: undefined, // server will assign
        })),
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
        alert("Package duplicated successfully ✅");
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
    <PackagesListing
      setPage={setPage}
      setSelectedId={setSelectedId}
      onDuplicate={handleDuplicate}
    />
  );
}
