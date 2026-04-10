"use client";
import React, { useState } from "react";
import { TransferForm, useStore } from "@/app/components/AdminCore";
import { useRouter } from "next/navigation";

export default function NewTransferContent() {
  const router = useRouter();
  const { setTransfers } = useStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (data: any) => {
    if (!data.pickupLocation?.trim()) { setError("Pickup location is required."); return; }
    if (!data.dropLocation?.trim()) { setError("Drop location is required."); return; }
    if (!data.vehicleType) { setError("Vehicle type is required."); return; }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setTransfers(p => [...p, { ...data, _id: result.insertedId }]);
        router.push("/admin/transfers");
      } else {
        setError(result.message || "Failed to create transfer.");
      }
    } catch (e) {
      console.error(e);
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Create New Transfer Route</h1>
        <p className="text-sm text-gray-500 mt-1">Add a reusable transfer route to your master catalog.</p>
      </div>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <span className="text-red-500 font-bold">⚠</span>
          <p className="text-red-600 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
        </div>
      )}
      {saving && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Saving transfer...
        </div>
      )}
      <TransferForm
        initial={{ pickupLocation: "", dropLocation: "", vehicleType: "Sedan", price: 0, currency: "INR", duration: "" }}
        onSave={handleSave}
        onCancel={() => router.push("/admin/transfers")}
      />
    </div>
  );
}
