"use client";
import React, { useState, useEffect } from "react";
import { useStore, Ic, Inp, Card, Badge, Modal, Btn, getCurrSym, Sel } from "@/app/components/AdminCore";

// ─── TYPES ────────────────────────────────────────────────────────
interface Booking {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  packageId?: string;
  packageTitle?: string;
  totalAmount: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled";
  travelDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  notes?: string;
}

export default function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...booking, status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: newStatus as Booking["status"] } : b));
        if (selected?.id === booking.id) setSelected(b => b ? { ...b, status: newStatus as Booking["status"] } : b);
      } else { alert("Status update failed."); }
    } catch (e) { alert("Network error."); }
  };

  const handleDelete = async (booking: Booking) => {
    if (!confirm(`Delete booking for "${booking.userName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/bookings?id=\${booking.id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) setBookings(p => p.filter(b => b.id !== booking.id));
    } catch (e) { alert("Delete failed."); }
  };

  const filtered = bookings.filter(b =>
    (!search || b.userName.toLowerCase().includes(search.toLowerCase()) || (b.packageTitle && b.packageTitle.toLowerCase().includes(search.toLowerCase()))) &&
    (statusFilter === "all" || b.status === statusFilter)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Ic.Search /></div>
          <Inp className="pl-9" placeholder="Search bookings…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Sel value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={["all", "pending", "confirmed", "cancelled"]} placeholder="Filter Status" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {["User", "Package", "Date", "Status", "Total", "Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No bookings found.</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">{b.userName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{b.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><p className="text-xs font-medium text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md inline-block">{b.packageTitle || "N/A"}</p></td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">{b.travelDate}</td>
                  <td className="px-4 py-3.5">
                    <Badge className={
                      b.status === "confirmed" ? "bg-emerald-100 text-emerald-800" :
                      b.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                    }>{b.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-gray-900">{getCurrSym(b.currency || "INR")}{Number(b.totalAmount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelected(b); setDetailOpen(true); }} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors" title="View"><Ic.Eye /></button>
                      <button onClick={() => handleDelete(b)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Delete"><Ic.Trash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Booking Details">
        {selected && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div><h2 className="text-xl font-bold text-gray-900">Booking Details</h2><p className="text-xs text-gray-400">ID: {selected.id}</p></div>
              <Badge className={
                selected.status === "confirmed" ? "bg-emerald-100 text-emerald-800 text-sm py-1 px-3" :
                selected.status === "pending" ? "bg-amber-100 text-amber-800 text-sm py-1 px-3" : "bg-red-100 text-red-800 text-sm py-1 px-3"
              }>{selected.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <section>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer Information</label>
                  <div className="mt-2 space-y-1">
                    <p className="font-bold text-gray-900">{selected.userName}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-2"><span className="opacity-50 text-xs">✉</span> {selected.userEmail}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-2"><span className="opacity-50 text-xs">☏</span> {selected.userPhone}</p>
                  </div>
                </section>
                <section>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Travel Dates</label>
                  <p className="text-sm font-bold mt-2 text-gray-900 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">{selected.travelDate} <Ic.Arrow /> {selected.returnDate || "N/A"}</p>
                </section>
              </div>
              <div className="space-y-4">
                <section>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Booked Package</label>
                  <p className="text-sm font-bold mt-2 text-blue-900">{selected.packageTitle || "N/A"}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">Adults: <span className="font-bold text-gray-900">{selected.adults}</span></span>
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">Children: <span className="font-bold text-gray-900">{selected.children}</span></span>
                  </div>
                </section>
                <section className="p-4 bg-blue-900 text-white rounded-2xl shadow-lg border border-blue-800">
                  <label className="text-[10px] font-bold text-blue-100/50 uppercase tracking-wider">Total Amount Paid</label>
                  <p className="text-2xl font-black mt-1">{getCurrSym(selected.currency || "INR")}{Number(selected.totalAmount || 0).toLocaleString()}</p>
                </section>
              </div>
            </div>
            {selected.notes && (
              <section>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Guest Notes</label>
                <p className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm italic text-gray-600 mt-2">\"{selected.notes}\"</p>
              </section>
            )}
            <div className="pt-6 border-t flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setDetailOpen(false)}>Close</Btn>
              {selected.status === "pending" && <Btn variant="success" onClick={() => handleStatusChange(selected, "confirmed")}>Confirm Booking</Btn>}
              {selected.status !== "cancelled" && <Btn variant="danger" onClick={() => handleStatusChange(selected, "cancelled")}>Cancel Booking</Btn>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
