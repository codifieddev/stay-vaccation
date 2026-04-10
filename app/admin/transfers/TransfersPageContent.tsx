"use client";
import React, { useState, useEffect } from "react";
import { useStore, Ic, Inp, Btn, Card, Badge, getCurrSym } from "@/app/components/AdminCore";
import { useRouter } from "next/navigation";

export default function TransfersPageContent() {
  const { transfers, setTransfers } = useStore();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(transfers.length === 0);
  const router = useRouter();

  // Fetch transfers on mount if not already loaded
  useEffect(() => {
    if (transfers.length === 0) {
      fetch("/api/transfers")
        .then(r => r.json())
        .then(res => { if (res.success) setTransfers(res.data); })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const filtered = transfers.filter(t =>
    !search ||
    t.pickupLocation?.toLowerCase().includes(search.toLowerCase()) ||
    t.dropLocation?.toLowerCase().includes(search.toLowerCase()) ||
    t.vehicleType?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transfer route? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/transfers?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setTransfers(p => p.filter(t => t._id !== id));
      } else {
        alert("Delete failed: " + (result.message || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Network error. Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-gray-500 text-sm">Loading transfer routes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Ic.Search /></div>
          <Inp className="pl-9" placeholder="Search routes…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Btn className="ml-auto" onClick={() => router.push("/admin/transfers/new")}>
          <Ic.Plus />New Transfer Route
        </Btn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {["Route", "Vehicle", "Price", "Duration", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-400"><Ic.Car /></div>
                      <p className="font-medium text-gray-500">No transfer routes yet</p>
                      <button onClick={() => router.push("/admin/transfers/new")} className="text-blue-700 text-sm underline hover:text-blue-900">
                        Add your first transfer route →
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map(t => (
                <tr key={t._id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{t.pickupLocation}</span>
                      <Ic.Arrow />
                      <span className="font-bold text-gray-900">{t.dropLocation}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">{t.vehicleType}</Badge></td>
                  <td className="px-4 py-3.5"><span className="font-bold text-blue-950">{getCurrSym(t.currency)}{Number(t.price).toLocaleString("en-IN")}</span></td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{t.duration || "—"}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => router.push(`/admin/transfers/edit/${t._id}`)}
                        className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Ic.Edit />
                      </button>
                      <button
                        onClick={() => handleDelete(t._id!)}
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Ic.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60 rounded-b-xl">
            <p className="text-xs text-gray-500">{filtered.length} of {transfers.length} routes</p>
          </div>
        )}
      </Card>
    </div>
  );
}
