"use client";
import React, { useState, useEffect } from "react";
import { PackageForm, useStore } from "@/app/components/AdminCore";
import { useRouter } from "next/navigation";

export default function EditPackageContent({ id }: { id: string }) {
  const router = useRouter();
  const { setPackages } = useStore();

  const [pkg, setPkg]               = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);

  // ── Fetch the package DIRECTLY from the API by its MongoDB _id ──
  // Never rely on shared React state — state may be missing, stale, or injected
  // with wrong data (e.g. right after duplication, hard refresh, or direct URL nav).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    setPkg(null);

    fetch(`/api/packages?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(result => {
        if (cancelled) return;
        if (result.success && result.data) {
          setPkg(result.data);
        } else {
          setFetchError(result.message || "Package not found");
        }
      })
      .catch(() => {
        if (!cancelled) setFetchError("Network error — could not load package");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  // ── Save handler ──
  const handleSave = async (data: any) => {
    if (!pkg) return;
    if (!data.title?.trim()) { setSaveError("Package title is required."); return; }
    setSaving(true);
    setSaveError(null);
    setSaved(false);
 
    let saveResult: any = null;
    try {
      const res = await fetch("/api/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: pkg.id }), // pkg.id = real MongoDB _id hex string
      });
      saveResult = await res.json();

      if (saveResult.success) {
        // Also update the shared store so the package list reflects the new title/data immediately
        setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, ...data, id: pkg.id } : p));
        setSaved(true);
        // Brief pause to show success state
        setTimeout(() => {
          router.push("/admin/packages");
        }, 1000);
      } else {
        setSaveError(saveResult.message || "Failed to update package.");
      }
    } catch (err) {
      console.error(err);
      setSaveError("Network error. Please try again.");
    } finally {
      // Don't turn off saving immediately if we succeeded, to keep the layout stable during redirect
      if (!saveResult?.success) setSaving(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Loading package…</p>
          <p className="text-gray-400 text-xs mt-1">ID: {id}</p>
        </div>
      </div>
    );
  }

  // ── Error / Not found ──
  if (fetchError || !pkg) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <p className="text-gray-800 font-semibold">{fetchError || "Package not found"}</p>
          <p className="text-gray-400 text-xs mt-1">ID: {id}</p>
          <button onClick={() => router.push("/admin/packages")} className="mt-4 text-sm text-blue-700 underline">
            ← Back to packages
          </button>
        </div>
      </div>
    );
  }

  // ── Edit form ──
  return (
    <div>
      {saveError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <span className="text-red-500 font-bold text-lg">⚠</span>
          <div>
            <p className="font-semibold text-red-700 text-sm">Error</p>
            <p className="text-red-600 text-sm mt-0.5">{saveError}</p>
          </div>
          <button onClick={() => setSaveError(null)} className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none">×</button>
        </div>
      )}
      {saving && !saved && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 font-medium flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Saving changes…
        </div>
      )}
      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium flex items-center gap-2">
          <span className="text-lg">✓</span>
          Changes saved successfully! Redirecting…
        </div>
      )}
      <PackageForm
        key={pkg.id}
        initial={pkg}
        mode="edit"
        onSave={handleSave}
        onCancel={() => router.push("/admin/packages")}
      />
    </div>
  );
}
