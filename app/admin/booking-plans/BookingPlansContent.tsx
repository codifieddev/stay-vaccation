"use client";
import React, { useState, useEffect } from "react";
import { Ic, Inp, Card, Badge, Modal, Btn, Sel } from "@/app/components/AdminCore";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { fetchBookingPlans, updateBookingPlan, deleteBookingPlan } from "@/app/store/features/bookingPlans/bookingPlanThunks";
import { BookingPlan } from "@/app/store/types";

export default function BookingPlansContent() {
  const dispatch = useAppDispatch();
  const { bookingPlans, loading } = useAppSelector(state => state.bookingPlans);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<BookingPlan | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchBookingPlans());
  }, [dispatch]);

  const handleStatusChange = async (plan: BookingPlan, newStatus: string) => {
    const updated = {
      ...plan,
      status: newStatus as BookingPlan["status"]
    };
    const result = await dispatch(updateBookingPlan(updated));
    if (updateBookingPlan.fulfilled.match(result)) {
      if (selected?.id === plan.id) setSelected(updated);
    } else {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (plan: BookingPlan) => {
    if (!confirm(`Are you sure you want to delete the booking plan for "${plan.fullName}"? This action cannot be undone.`)) return;
    const result = await dispatch(deleteBookingPlan(plan.id));
    if (deleteBookingPlan.fulfilled.match(result)) {
      if (selected?.id === plan.id) setDetailOpen(false);
    } else {
      alert("Failed to delete booking plan.");
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      alert("No booking plans to export.");
      return;
    }
    const headers = ["ID", "Full Name", "Email", "Destination", "Status", "Created At"];
    const rows = filtered.map(p => [
      p.id,
      p.fullName || "",
      p.email || "",
      p.destination || "",
      p.status || "pending",
      p.createdAt ? new Date(p.createdAt).toLocaleString() : "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `booking_plans_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = bookingPlans.filter(p => {
    const searchLower = search.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      (p.fullName && p.fullName.toLowerCase().includes(searchLower)) ||
      (p.email && p.email.toLowerCase().includes(searchLower)) ||
      (p.destination && p.destination.toLowerCase().includes(searchLower));

    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-250";
      case "contacted":
        return "bg-blue-100 text-blue-800 border-blue-250";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-250";
      case "pending":
      default:
        return "bg-amber-100 text-amber-800 border-amber-250";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 w-full">
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Ic.Search />
            </div>
            <Inp
              className="pl-9 w-full"
              placeholder="Search by name, email or destination..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="w-48 shrink-0">
            <Sel
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Contacted", value: "contacted" },
                { label: "Completed", value: "completed" },
                { label: "Cancelled", value: "cancelled" }
              ]}
            />
          </div>
        </div>
        <Btn variant="outline" onClick={handleExport} className="h-10 text-xs flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto">
          <Ic.Document className="w-3.5 h-3.5" /> Export CSV
        </Btn>
      </div>

      {/* Main Table View */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {["Guest Details", "Destination", "Submitted Date", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && bookingPlans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400 font-medium">
                    <span className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                    Loading custom booking plans...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400 font-medium">
                    No custom booking plans found.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/15 transition-colors">
                    {/* Guest Name & Email */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{p.fullName}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{p.email}</p>
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-blue-900 bg-blue-50/70 border border-blue-100/50 px-2.5 py-1 rounded-lg inline-block">
                        📍 {p.destination}
                      </span>
                    </td>

                    {/* Submitted At */}
                    <td className="px-5 py-4 text-xs font-medium text-gray-500">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "N/A"}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <Badge className={getStatusBadgeClass(p.status)}>
                        {p.status || "pending"}
                      </Badge>
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelected(p);
                            setDetailOpen(true);
                          }}
                          className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                          title="View Details"
                        >
                          <Ic.Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                          title="Delete Plan"
                        >
                          <Ic.Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Plan Details Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Custom Booking Plan Details">
        {selected && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selected.fullName}</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {selected.id}</p>
              </div>
              <Badge className={`${getStatusBadgeClass(selected.status)} text-xs py-1 px-3 border`}>
                {selected.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Guest Name</span>
                  <span className="text-sm font-bold text-slate-800">{selected.fullName}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Email Address</span>
                  <a href={`mailto:${selected.email}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                    ✉ {selected.email}
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Requested Destination</span>
                  <span className="text-sm font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    📍 {selected.destination}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Submitted On</span>
                  <span className="text-sm font-medium text-slate-700">
                    {selected.createdAt ? new Date(selected.createdAt).toLocaleString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }) : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Control and Close actions */}
            <div className="pt-4 border-t border-gray-150 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Update Status:</span>
                <div className="w-40">
                  <Sel
                    value={selected.status}
                    onChange={(e) => handleStatusChange(selected, e.target.value)}
                    options={[
                      { label: "Pending", value: "pending" },
                      { label: "Contacted", value: "contacted" },
                      { label: "Completed", value: "completed" },
                      { label: "Cancelled", value: "cancelled" }
                    ]}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Btn variant="outline" onClick={() => setDetailOpen(false)} className="px-5 py-2 text-xs">
                  Close
                </Btn>
                <Btn
                  variant="danger"
                  onClick={() => handleDelete(selected)}
                  className="px-4 py-2 text-xs flex items-center gap-1"
                >
                  <Ic.Trash className="w-3.5 h-3.5" /> Delete Entry
                </Btn>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
