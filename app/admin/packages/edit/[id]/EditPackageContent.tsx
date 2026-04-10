"use client";
import React, { useState } from "react";
import { PackageForm, useStore } from "@/app/components/AdminCore";
import { useRouter } from "next/navigation";

export default function EditPackageContent({ id }: { id: string }) {
  const router = useRouter();
  const { packages, setPackages } = useStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pkg = packages.find(p => p.id === id || (p as any)._id === id);

  const handleSave = async (data: any) => {
    if (!data.title?.trim()) { setError("Package title is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: id }),
      });
      const result = await res.json();
      if (result.success) {
        setPackages(prev => prev.map(p => p.id === id ? { ...data, id: id } : p));
        router.push("/admin/packages");
      } else {
        setError(result.message || "Failed to update package.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!pkg) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Loading package data...</p>
          <p className="text-gray-400 text-sm mt-1">ID: {id}</p>
          <button onClick={() => router.push("/admin/packages")} className="mt-4 text-sm text-blue-700 underline">
            ← Back to packages
          </button>
        </div>
      </div>
    );
  }

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
          Saving changes...
        </div>
      )}
      <PackageForm
        key={id}
        initial={pkg}
        mode="edit"
        onSave={handleSave}
        onCancel={() => router.push("/admin/packages")}
      />
    </div>
  );
}
