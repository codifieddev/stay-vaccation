"use client";
import React, { useState, useEffect } from "react";
import { Ic, Inp, Card, Badge, Modal, Btn, getCurrSym, Sel } from "@/app/components/AdminCore";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { fetchBookings, updateBooking, deleteBooking } from "@/app/store/features/bookings/bookingThunks";
import { Booking } from "@/app/store/types";

export default function BookingsContent() {
  const dispatch = useAppDispatch();
  const { bookings, loading } = useAppSelector(state => state.bookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [localAdminNotes, setLocalAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  useEffect(() => {
    if (selected) {
      setLocalAdminNotes(selected.adminNotes || "");
    } else {
      setLocalAdminNotes("");
    }
  }, [selected]);

  const handleSaveAdminNotes = async () => {
    if (!selected) return;
    setSavingNotes(true);
    const updated = {
      ...selected,
      adminNotes: localAdminNotes
    };
    const result = await dispatch(updateBooking(updated));
    setSavingNotes(false);
    if (updateBooking.fulfilled.match(result)) {
      setSelected(updated);
      alert("Admin notes saved successfully!");
    } else {
      alert("Failed to save admin notes.");
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      alert("No bookings to export.");
      return;
    }
    const headers = [
      "Booking ID",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Package Name",
      "Travel Date",
      "Return Date",
      "Adults",
      "Children",
      "Status",
      "Amount",
      "Currency",
      "Admin Notes",
      "Guest Notes"
    ];
    const rows = filtered.map(b => [
      b.bookingId || "N/A",
      b.userName || "",
      b.userEmail || "",
      b.userPhone || "",
      b.packageName || b.packageTitle || "N/A",
      b.travelDate || "",
      b.returnDate || "",
      b.travellers?.adults ?? b.adults ?? 0,
      b.travellers?.children ?? b.children ?? 0,
      b.bookingStatus || b.status || "",
      b.totalAmount || 0,
      b.currency || "INR",
      b.adminNotes || "",
      b.notes || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    const updated = {
      ...booking,
      status: newStatus as Booking["status"],
      bookingStatus: newStatus as Booking["bookingStatus"]
    };
    const result = await dispatch(updateBooking(updated));
    if (updateBooking.fulfilled.match(result)) {
      if (selected?.id === booking.id) setSelected(updated);
    } else {
      alert("Status update failed.");
    }
  };

  const handleDelete = async (booking: Booking) => {
    if (!confirm(`Delete booking for "${booking.userName}"? This cannot be undone.`)) return;
    const result = await dispatch(deleteBooking(booking.id));
    if (!deleteBooking.fulfilled.match(result)) {
      alert("Delete failed.");
    }
  };

  const filtered = bookings.filter(b => {
    const searchLower = search.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      (b.bookingId && b.bookingId.toLowerCase().includes(searchLower)) ||
      (b.userName && b.userName.toLowerCase().includes(searchLower)) ||
      (b.packageName && b.packageName.toLowerCase().includes(searchLower)) ||
      (b.packageTitle && b.packageTitle.toLowerCase().includes(searchLower)) ||
      (b.userEmail && b.userEmail.toLowerCase().includes(searchLower));

    const matchesStatus =
      statusFilter === "all" ||
      b.status === statusFilter ||
      b.bookingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Ic.Search /></div>
            <Inp className="pl-9" placeholder="Search bookings…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="w-48">
            <Sel value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={["all", "pending", "confirmed", "completed", "cancelled"]} placeholder="Filter Status" />
          </div>
        </div>
        <Btn variant="outline" onClick={handleExport} className="h-10 text-xs flex items-center gap-1.5">
          <Ic.Document className="w-3.5 h-3.5" /> Export CSV
        </Btn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {["Booking ID", "User", "Package", "Date", "Status", "Total", "Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && bookings.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No bookings found.</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-xs text-orange-600 bg-orange-50/20">
                    {b.bookingId || "N/A"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">{b.userName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{b.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-medium text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                      {b.packageName || b.packageTitle || "N/A"}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">{b.travelDate}</td>
                  <td className="px-4 py-3.5">
                    <Badge className={
                      (b.bookingStatus || b.status) === "confirmed" ? "bg-emerald-100 text-emerald-800" :
                      (b.bookingStatus || b.status) === "completed" ? "bg-blue-100 text-blue-800" :
                      (b.bookingStatus || b.status) === "pending" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                    }>
                      {b.bookingStatus || b.status}
                    </Badge>
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
              <div>
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <div className="flex flex-col gap-0.5 mt-1">
                  <p className="text-xs font-mono font-bold text-orange-600">Booking ID: {selected.bookingId || "N/A"}</p>
                  <p className="text-[10px] text-gray-400">System ID: {selected.id}</p>
                </div>
              </div>
              <Badge className={
                (selected.bookingStatus || selected.status) === "confirmed" ? "bg-emerald-100 text-emerald-800 text-sm py-1 px-3 border-emerald-200" :
                (selected.bookingStatus || selected.status) === "completed" ? "bg-blue-100 text-blue-800 text-sm py-1 px-3 border-blue-200" :
                (selected.bookingStatus || selected.status) === "pending" ? "bg-amber-100 text-amber-800 text-sm py-1 px-3 border-amber-200" : "bg-red-100 text-red-800 text-sm py-1 px-3 border-red-200"
              }>{selected.bookingStatus || selected.status}</Badge>
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
                  <p className="text-sm font-bold mt-2 text-blue-900">{selected.packageName || selected.packageTitle || "N/A"}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">Adults: <span className="font-bold text-gray-900">{selected.travellers?.adults ?? selected.adults}</span></span>
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">Children: <span className="font-bold text-gray-900">{selected.travellers?.children ?? selected.children}</span></span>
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
                <p className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm italic text-gray-600 mt-2">&ldquo;{selected.notes}&rdquo;</p>
              </section>
            )}

            {/* Quick Actions Section */}
            <section className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Quick Actions</label>
              <div className="flex flex-wrap gap-2">
                {(selected.bookingStatus || selected.status) !== "confirmed" && (
                  <Btn variant="success" size="sm" onClick={() => handleStatusChange(selected, "confirmed")}>
                    Confirm Booking
                  </Btn>
                )}
                {(selected.bookingStatus || selected.status) !== "completed" && (
                  <Btn variant="primary" size="sm" onClick={() => handleStatusChange(selected, "completed")}>
                    Mark Completed
                  </Btn>
                )}
                {(selected.bookingStatus || selected.status) !== "cancelled" && (
                  <Btn variant="danger" size="sm" onClick={() => handleStatusChange(selected, "cancelled")}>
                    Cancel Booking
                  </Btn>
                )}
              </div>
            </section>

            {/* Admin Notes Section */}
            <section className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Admin Notes</label>
              <div className="space-y-2">
                <textarea
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4a90e2] transition-all duration-300 resize-none shadow-[inset_0_1px_2px_rgba(74,144,226,0.01)]"
                  rows={3}
                  placeholder="Add private admin notes about this booking..."
                  value={localAdminNotes}
                  onChange={(e) => setLocalAdminNotes(e.target.value)}
                />
                <div className="flex justify-end">
                  <Btn variant="soft" size="sm" onClick={handleSaveAdminNotes} disabled={savingNotes}>
                    {savingNotes ? "Saving..." : "Save Notes"}
                  </Btn>
                </div>
              </div>
            </section>

            <div className="pt-6 border-t flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Change Status:</span>
                <div className="w-36">
                  <Sel
                    value={selected.bookingStatus || selected.status}
                    onChange={(e) => handleStatusChange(selected, e.target.value)}
                    options={[
                      { label: "Pending", value: "pending" },
                      { label: "Confirmed", value: "confirmed" },
                      { label: "Completed", value: "completed" },
                      { label: "Cancelled", value: "cancelled" }
                    ]}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Btn variant="outline" onClick={() => setDetailOpen(false)}>Close</Btn>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
