"use client";
import React, { useState } from "react";
import { TransferForm, useStore } from "@/app/components/AdminCore";
import { useRouter } from "next/navigation";

export default function EditTransferContent({ id }: { id: string }) {
  const router = useRouter();
  const { transfers, setTransfers } = useStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = transfers.find(x => x._id === id);

  const handleSave = async (data: any) => {
    if (!data.pickupLocation?.trim()) { setError("Pickup location is required."); return; }
    if (!data.dropLocation?.trim()) { setError("Drop location is required."); return; }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/transfers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, _id: id }),
      });
      const result = await res.json();
      if (result.success) {
        setTransfers(p => p.map(item => item._id === id ? { ...data, _id: id } : item));
        router.push("/admin/transfers");
      } else {
        setError(result.message || "Failed to update transfer.");
      }
    } catch (e) {
      console.error(e);
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!t) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-gray-500 text-sm">Loading transfer data...</p>
          <button onClick={() => router.push("/admin/transfers")} className="mt-3 text-blue-700 text-sm underline">← Back to transfers</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Edit Transfer Route</h1>
        <p className="text-sm text-gray-500 mt-1">{t.pickupLocation} → {t.dropLocation}</p>
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
          Saving changes...
        </div>
      )}
      <TransferForm
        key={id}
        initial={t}
        onSave={handleSave}
        onCancel={() => router.push("/admin/transfers")}
      />
    </div>
  );
}
