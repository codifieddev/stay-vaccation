"use client";
import React, { useState } from "react";
import { PackageForm, useStore } from "@/app/components/AdminCore";
import { useRouter } from "next/navigation";

const emptyPackage = () => ({
  title: "",
  destination: "",
  tripDuration: "",
  travelStyle: "",
  tourType: "",
  exclusivityLevel: "Premium",
  price: { currency: "INR", amount: "" },
  shortDescription: "",
  longDescription: "",
  availability: { availableMonths: [], fixedDepartureDates: [], blackoutDates: [] },
  inclusions: [],
  exclusions: [],
  knowBeforeYouGo: [],
  additionalInfo: {
    aboutDestination: "",
    quickInfo: { destinationsCovered: "", duration: "", startPoint: "", endPoint: "" },
    experiencesCovered: [],
    notToMiss: [],
  },
  faqs: [],
  itinerary: [],
});

export default function CreatePackageContent() {
  const router = useRouter();
  const { setPackages } = useStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (data: any) => {
    if (!data.title?.trim()) { setError("Package title is required."); return; }
    if (!data.destination?.trim()) { setError("Destination is required."); return; }
    if (!data.tripDuration) { setError("Trip duration is required."); return; }
    if (!data.itinerary?.length) { setError("Itinerary must have at least 1 day. Please select a trip duration."); return; }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        // Refresh packages in store
        const refreshRes = await fetch("/api/packages");
        const refreshData = await refreshRes.json();
        if (refreshData.success) setPackages(refreshData.data);
        router.push("/admin/packages");
      } else {
        setError(result.message || "Failed to create package. Please try again.");
      }
    } catch (err) {
      console.error("Create package error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <span className="text-red-500 font-bold text-lg">⚠</span>
          <div>
            <p className="font-semibold text-red-700 text-sm">Error</p>
            <p className="text-red-600 text-sm mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none">×</button>
        </div>
      )}
      {saving && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 font-medium flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Saving package to database...
        </div>
      )}
      <PackageForm
        initial={emptyPackage()}
        mode="create"
        onSave={handleSave}
        onCancel={() => router.push("/admin/packages")}
      />
    </div>
  );
}
