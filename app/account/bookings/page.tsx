"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/store/hooks";
import { useCurrency } from "@/app/hooks/useCurrency";
import LayoutV2 from "../../layouts-v2/LayoutV2";
import LucideIcon from "../../components/LucideIcon";

interface PaymentSummary {
  basePrice: number;
  adultCount: number;
  adultUnitPrice: number;
  adultTotal: number;
  childCount: number;
  childUnitPrice: number;
  childTotal: number;
  subtotal: number;
  taxRate: number;
  taxesAndFees: number;
  totalAmount: number;
  originalTotalAmount: number;
  adjustmentAmount: number; // negative = refund due, positive = extra charge
  lastRecalculatedAt?: string;
}

interface Booking {
  id: string;
  bookingId: string;
  userId: string;
  packageId?: string;
  packageName?: string;
  packageTitle?: string;
  totalAmount: number;
  originalTotalAmount?: number;
  basePrice?: number;
  paymentSummary?: PaymentSummary;
  currency: string;
  bookingStatus: "pending" | "confirmed" | "cancelled" | "completed";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "failed";
  bookingDate: string;
  travelDate: string;
  returnDate?: string;
  travellers: {
    adults: number;
    children: number;
  };
  adults: number;
  children: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  notes?: string;
  adminNotes?: string;
  createdAt?: string;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  transactionDetails?: any;
  cancellations?: Array<{
    cancelAdults: number;
    cancelChildren: number;
    newAdults: number;
    newChildren: number;
    refundAmount: number;
    reason?: string | null;
    at: string;
  }>;
  pendingEdit?: {
    requestId: string;
    adults: number;
    children: number;
    travelDate: string;
    returnDate?: string;
    notes: string;
    totalAmount: number;
    paymentSummary: any;
    status: string;
    requestedAt: string;
    processedAt?: string;
    adminNotes?: string;
  } | null;
  editRequests?: Array<{
    requestId: string;
    adults: number;
    children: number;
    travelDate: string;
    returnDate?: string;
    notes: string;
    totalAmount: number;
    paymentSummary: any;
    status: string;
    requestedAt: string;
    processedAt?: string;
    adminNotes?: string;
  }>;
  editHistory?: Array<{
    oldAdults: number;
    oldChildren: number;
    newAdults: number;
    newChildren: number;
    oldTravelerCount: number;
    newTravelerCount: number;
    previousAmount: number;
    updatedAmount: number;
    modifiedBy: string;
    timestamp: string;
  }>;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, authChecked, loading: authLoading } = useAppSelector((state) => state.auth);
  const { formatPrice } = useCurrency();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{
    adults: number;
    children: number;
    travelDate: string;
    returnDate: string;
    notes: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Partial-cancellation state
  const [isCancellingTravelers, setIsCancellingTravelers] = useState(false);
  const [cancelData, setCancelData] = useState<{ cancelAdults: number; cancelChildren: number; reason: string }>({
    cancelAdults: 0,
    cancelChildren: 0,
    reason: "",
  });
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  // Authentication Check Redirect
  useEffect(() => {
    if (authChecked && !user) {
      router.push(`/login?from=${encodeURIComponent("/account/bookings")}`);
    }
  }, [user, authChecked, router]);

  const selectedBookingRef = React.useRef(selectedBooking);
  useEffect(() => {
    selectedBookingRef.current = selectedBooking;
  }, [selectedBooking]);

  // Reset edit & cancel state whenever the selected booking changes
  useEffect(() => {
    setIsEditing(false);
    setEditError(null);
    setIsCancellingTravelers(false);
    setCancelData({ cancelAdults: 0, cancelChildren: 0, reason: "" });
    setCancelError(null);
    setCancelSuccess(null);
    if (selectedBooking) {
      setEditData({
        adults: selectedBooking.travellers?.adults ?? selectedBooking.adults ?? 1,
        children: selectedBooking.travellers?.children ?? selectedBooking.children ?? 0,
        travelDate: selectedBooking.travelDate || "",
        returnDate: selectedBooking.returnDate || "",
        notes: selectedBooking.notes || "",
      });
    } else {
      setEditData(null);
    }
  }, [selectedBooking]);

  const handleEditSave = async () => {
    if (!selectedBooking || !editData) return;
    setSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const json = await res.json();
      if (json.success) {
        const updated: Booking = json.data;
        setSelectedBooking(updated);
        setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        setIsEditing(false);
      } else {
        setEditError(json.message || "Failed to save changes. Please try again.");
      }
    } catch {
      setEditError("A network error occurred. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const handlePartialCancel = async () => {
    if (!selectedBooking) return;
    if (cancelData.cancelAdults <= 0 && cancelData.cancelChildren <= 0) return;
    setCancelling(true);
    setCancelError(null);
    setCancelSuccess(null);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.bookingId}/partial-cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cancelData),
      });
      const json = await res.json();
      if (json.success) {
        const updated: Booking = json.data;
        setSelectedBooking(updated);
        setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        setIsCancellingTravelers(false);
        setCancelData({ cancelAdults: 0, cancelChildren: 0, reason: "" });
        const parts: string[] = [];
        if (json.cancelledAdults > 0) parts.push(`${json.cancelledAdults} Adult${json.cancelledAdults > 1 ? "s" : ""}`);
        if (json.cancelledChildren > 0) parts.push(`${json.cancelledChildren} Child${json.cancelledChildren > 1 ? "ren" : ""}`);
        const suffix = json.isFullCancellation
          ? " — booking fully cancelled."
          : `. Estimated refund: ${formatPrice(json.refundAmount, selectedBooking.currency)}.`;
        setCancelSuccess(`${parts.join(" & ")} cancelled${suffix}`);
      } else {
        setCancelError(json.message || "Cancellation failed. Please try again.");
      }
    } catch {
      setCancelError("A network error occurred. Please check your connection.");
    } finally {
      setCancelling(false);
    }
  };

  const silentRefetchBookings = async (showLoading = false) => {
    if (!user) return;
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("/api/bookings/my-bookings");
      const json = await res.json();
      if (json.success) {
        const updatedList: Booking[] = json.data || [];
        setBookings(updatedList);
        setError(null);

        // Update selectedBooking detail if currently open
        const currentSelected = selectedBookingRef.current;
        if (currentSelected) {
          const fresh = updatedList.find((b) => b.id === currentSelected.id);
          if (fresh && (fresh.bookingStatus !== currentSelected.bookingStatus || fresh.status !== currentSelected.status || fresh.paymentStatus !== currentSelected.paymentStatus)) {
            setSelectedBooking(fresh);
          }
        }
      } else if (showLoading) {
        setError(json.message || "Failed to load bookings.");
      }
    } catch (err) {
      console.error(err);
      if (showLoading) {
        setError("A network error occurred while fetching bookings.");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Fetch user bookings initially
  useEffect(() => {
    if (!user) return;
    silentRefetchBookings(true);
  }, [user]);

  // Setup short-polling (every 5 seconds) and focus listener for real-time status sync
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      silentRefetchBookings(false);
    }, 5000);

    const handleFocus = () => {
      silentRefetchBookings(false);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user]);

  if (!authChecked || authLoading || (!user && !bookings.length)) {
    return (
      <LayoutV2>
        <div className="min-h-[70vh] flex items-center justify-center bg-[#f8f9fa] pt-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-[#ff6b00] rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Verifying access…</p>
          </div>
        </div>
      </LayoutV2>
    );
  }

  // Filter & Search logic
  const filteredBookings = bookings.filter((b) => {
    const matchesTab = activeTab === "all" || b.bookingStatus === activeTab;
    const cleanSearch = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !cleanSearch ||
      b.bookingId.toLowerCase().includes(cleanSearch) ||
      (b.packageName || b.packageTitle || "").toLowerCase().includes(cleanSearch);
    return matchesTab && matchesSearch;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "completed":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "cancelled":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  return (
    <LayoutV2>
      <div className="min-h-screen bg-[#f8f9fa] pt-8 pb-24">
        <div className="container-sv mx-auto px-4 max-w-6xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-6">
            <span className="cursor-pointer hover:text-gray-600" onClick={() => router.push("/")}>
              Home
            </span>
            <span className="text-gray-300">/</span>
            <span className="text-orange-500 font-black uppercase">My Bookings</span>
          </div>

          {/* Page Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b00] mb-2 block">
                Exclusive Journey Portal
              </span>
              <h1 className="font-['Poppins'] text-3xl md:text-5xl font-black text-[#1a3f4e] tracking-tight">
                My Bookings
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-2 leading-relaxed">
                Track status, access invoices, and details for your booked getaways.
              </p>
            </div>

            {/* Tab Controls & Search input */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64 shrink-0">
                <input
                  type="text"
                  placeholder="Search Booking ID or Package..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] bg-white transition-all shadow-sm placeholder:text-gray-400"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <LucideIcon name="Search" size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200/50 mb-8 overflow-x-auto pb-1 gap-2 scrollbar-none">
            {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((tab) => {
              const count = tab === "all" ? bookings.length : bookings.filter((b) => b.bookingStatus === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 rounded-t-xl text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab
                      ? "border-orange-500 text-orange-600 font-extrabold"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === tab ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List Content */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-full bg-white rounded-3xl h-28 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 bg-rose-50 border border-rose-100 rounded-3xl text-center max-w-xl mx-auto">
              <LucideIcon name="AlertTriangle" size={40} className="text-rose-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Error Loading Bookings</h3>
              <p className="text-xs text-gray-500 leading-normal">{error}</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 max-w-md mx-auto shadow-[0_8px_30px_rgba(15,23,42,0.02)]">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <LucideIcon name="CalendarRange" size={32} />
              </div>
              <h3 className="font-['Poppins'] font-black text-lg text-[#1a3f4e] mb-2">No Bookings Found</h3>
              <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto mb-8 font-bold">
                {searchTerm
                  ? "We couldn't find any bookings matching your search terms."
                  : `You don't have any ${activeTab !== "all" ? activeTab : ""} bookings scheduled at the moment.`}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => router.push("/packages")}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/25 transition-all hover:-translate-y-0.5"
                >
                  Explore Packages
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-[0_4px_25px_rgba(15,23,42,0.01)] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking ID</th>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Package Details</th>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Travel Date</th>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Paid</th>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/65">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="p-6 font-mono font-black text-xs text-orange-600 bg-orange-50/20 max-w-[120px] rounded-l-xl">
                          {b.bookingId}
                        </td>
                        <td className="p-6">
                          <span className="font-extrabold text-sm text-[#1a3f4e] block max-w-xs truncate">
                            {b.packageName || b.packageTitle || "Luxury Staycation"}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 mt-1 block">
                            👤 {b.travellers?.adults || b.adults || 1} Adult(s)
                            {(b.travellers?.children || b.children || 0) > 0 ? `, ${(b.travellers?.children || b.children)} Child(ren)` : ""}
                          </span>
                        </td>
                        <td className="p-6 text-xs font-bold text-gray-600">
                          {b.travelDate}
                        </td>
                        <td className="p-6 text-sm font-black text-[#1a3f4e]">
                          {formatPrice(b.totalAmount, b.currency)}
                        </td>
                        <td className="p-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(b.bookingStatus)}`}>
                            {b.bookingStatus}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-4 py-2 bg-gray-50 hover:bg-[#1a3f4e] hover:text-white border border-gray-200/80 rounded-xl text-xs font-extrabold text-[#1a3f4e] transition-all hover:shadow-md"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Grid View */}
              <div className="grid grid-cols-1 gap-5 md:hidden">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <span className="font-mono font-black text-xs text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-100">
                        {b.bookingId}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(b.bookingStatus)}`}>
                        {b.bookingStatus}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-black text-[#1a3f4e] block leading-snug">
                        {b.packageName || b.packageTitle || "Luxury Staycation"}
                      </span>
                      <div className="flex justify-between text-[11px] font-bold text-gray-500">
                        <span>Travel Date:</span>
                        <span className="text-[#1a3f4e]">{b.travelDate}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-gray-500">
                        <span>Total Cost:</span>
                        <span className="text-[#1a3f4e] font-black">{formatPrice(b.totalAmount, b.currency)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="w-full py-3 bg-gray-50 hover:bg-[#1a3f4e] hover:text-white border border-gray-200/80 rounded-xl text-xs font-black uppercase tracking-wider text-[#1a3f4e] transition-all"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Slide-over / Modal (Glassmorphism backdrop) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedBooking(null)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 transform scale-100 animate-in zoom-in-95 duration-200">
            {/* Header Ticket Pattern */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-orange-500 to-[#ff6b00]" />
            
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between pt-8">
              <div>
                <span className="text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-100 font-mono px-3 py-1 rounded-lg">
                  {selectedBooking.bookingId}
                </span>
                <h3 className="font-['Poppins'] font-black text-xl text-[#1a3f4e] mt-3 leading-snug">
                  Reservation Ticket
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LucideIcon name="X" size={20} />
              </button>
            </div>

            {/* Boarding Pass Style Body */}
            <div className="p-6 md:p-8 space-y-6 max-h-[65vh] overflow-y-auto">

              {/* ── EDIT MODE ── */}
              {isEditing && editData ? (
                <div className="space-y-5">
                  {/* Package name (read-only even in edit) */}
                  <div className="bg-[#f8f9fa] rounded-2xl p-4 border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Travel Package</span>
                    <span className="text-sm font-extrabold text-[#1a3f4e]">
                      {selectedBooking.packageName || selectedBooking.packageTitle || "Premium Vacation Pack"}
                    </span>
                  </div>

                  {/* Travel Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Travel Date *</label>
                      <input
                        type="date"
                        value={editData.travelDate}
                        onChange={(e) => setEditData({ ...editData, travelDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/15 transition-all bg-gray-50/30"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Return Date (Optional)</label>
                      <input
                        type="date"
                        value={editData.returnDate}
                        onChange={(e) => setEditData({ ...editData, returnDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/15 transition-all bg-gray-50/30"
                      />
                    </div>
                  </div>

                  {/* Traveller Counters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-2xl border border-gray-100">
                      <div>
                        <span className="text-xs font-black text-[#1a3f4e] block">Adults</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block mt-0.5">Age 12+</span>
                      </div>
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          onClick={() => setEditData({ ...editData, adults: Math.max(1, editData.adults - 1) })}
                          className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 text-[#1a3f4e] transition-all font-black"
                        >-</button>
                        <span className="text-sm font-black text-[#1a3f4e] min-w-[12px] text-center">{editData.adults}</span>
                        <button
                          type="button"
                          onClick={() => setEditData({ ...editData, adults: editData.adults + 1 })}
                          className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 text-[#1a3f4e] transition-all font-black"
                        >+</button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-2xl border border-gray-100">
                      <div>
                        <span className="text-xs font-black text-[#1a3f4e] block">Children</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block mt-0.5">Age 2–11 (50% Off)</span>
                      </div>
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          onClick={() => setEditData({ ...editData, children: Math.max(0, editData.children - 1) })}
                          className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 text-[#1a3f4e] transition-all font-black"
                        >-</button>
                        <span className="text-sm font-black text-[#1a3f4e] min-w-[12px] text-center">{editData.children}</span>
                        <button
                          type="button"
                          onClick={() => setEditData({ ...editData, children: editData.children + 1 })}
                          className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 text-[#1a3f4e] transition-all font-black"
                        >+</button>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Special Requests</label>
                    <textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      placeholder="Any special instructions, dietary needs, or preferences…"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/15 transition-all placeholder:text-gray-400 bg-gray-50/30 resize-none"
                    />
                  </div>

                  {/* ── Live Price Impact Preview ── */}
                  {(() => {
                    const storedBase =
                      selectedBooking.paymentSummary?.basePrice ??
                      selectedBooking.basePrice;
                    const fallbackBase =
                      selectedBooking.totalAmount /
                      (1.05 *
                        ((selectedBooking.travellers?.adults ?? selectedBooking.adults ?? 1) +
                          (selectedBooking.travellers?.children ?? selectedBooking.children ?? 0) * 0.5));
                    const basePrice = storedBase ?? fallbackBase;

                    const adultTotal = basePrice * editData.adults;
                    const childTotal = basePrice * 0.5 * editData.children;
                    const subtotal = adultTotal + childTotal;
                    const taxesAndFees = subtotal * 0.05;
                    const newTotal = subtotal + taxesAndFees;

                    const originalPaid =
                      selectedBooking.originalTotalAmount ??
                      selectedBooking.paymentSummary?.originalTotalAmount ??
                      selectedBooking.totalAmount;

                    const diff = newTotal - originalPaid;
                    const isRefund = diff < 0;
                    const isExtra = diff > 0;
                    const travellersChanged =
                      editData.adults !== (selectedBooking.travellers?.adults ?? selectedBooking.adults ?? 1) ||
                      editData.children !== (selectedBooking.travellers?.children ?? selectedBooking.children ?? 0);

                    return (
                      <div className="bg-[#f8f9fa] rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                          <LucideIcon name="Calculator" size={13} className="text-[#4a90e2]" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price Impact Preview</span>
                        </div>
                        <div className="px-4 py-3 space-y-2">
                          <div className="flex justify-between text-[11px] font-bold text-gray-500">
                            <span>Adults ({editData.adults} × {formatPrice(basePrice, selectedBooking.currency)})</span>
                            <span className="text-[#1a3f4e] font-black">{formatPrice(adultTotal, selectedBooking.currency)}</span>
                          </div>
                          {editData.children > 0 && (
                            <div className="flex justify-between text-[11px] font-bold text-gray-500">
                              <span>Children ({editData.children} × {formatPrice(basePrice * 0.5, selectedBooking.currency)})</span>
                              <span className="text-[#1a3f4e] font-black">{formatPrice(childTotal, selectedBooking.currency)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-[11px] font-bold text-gray-400 pt-1 border-t border-gray-200/50">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal, selectedBooking.currency)}</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-bold text-gray-400">
                            <span>Luxury Service Fees & Taxes (5%)</span>
                            <span>{formatPrice(taxesAndFees, selectedBooking.currency)}</span>
                          </div>
                          <div className="flex justify-between text-xs font-black text-[#1a3f4e] pt-1.5 border-t border-gray-200">
                            <span>New Total</span>
                            <span>{formatPrice(newTotal, selectedBooking.currency)}</span>
                          </div>
                          {travellersChanged && (
                            <div className={`mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-black ${
                              isRefund
                                ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                                : isExtra
                                ? "bg-amber-50 border border-amber-100 text-amber-700"
                                : "bg-gray-50 border border-gray-100 text-gray-500"
                            }`}>
                              <LucideIcon
                                name={isRefund ? "TrendingDown" : isExtra ? "TrendingUp" : "Minus"}
                                size={13}
                              />
                              {isRefund && <span>Est. Refund: {formatPrice(Math.abs(diff), selectedBooking.currency)}</span>}
                              {isExtra && <span>Additional Charge: {formatPrice(diff, selectedBooking.currency)}</span>}
                              {!isRefund && !isExtra && <span>No price change</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Inline edit error */}
                  {editError && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold flex gap-2.5 items-center">
                      <LucideIcon name="AlertTriangle" size={15} />
                      <span>{editError}</span>
                    </div>
                  )}
                </div>
              ) : isCancellingTravelers ? (
                /* ── CANCEL TRAVELERS PANEL ── */
                <div className="space-y-5">
                  {/* Header summary */}
                  <div className="bg-[#f8f9fa] rounded-2xl p-4 border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Current Travelers</span>
                    <div className="flex gap-4">
                      <span className="text-xs font-bold text-[#1a3f4e]">
                        {selectedBooking.travellers?.adults ?? selectedBooking.adults ?? 1} Adult{((selectedBooking.travellers?.adults ?? selectedBooking.adults ?? 1) !== 1) ? "s" : ""}
                      </span>
                      {(selectedBooking.travellers?.children ?? selectedBooking.children ?? 0) > 0 && (
                        <span className="text-xs font-bold text-[#1a3f4e]">
                          {selectedBooking.travellers?.children ?? selectedBooking.children ?? 0} Child{((selectedBooking.travellers?.children ?? selectedBooking.children ?? 0) !== 1) ? "ren" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cancel counters */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Travelers to Cancel</label>
                    {/* Adults to cancel */}
                    <div className="flex items-center justify-between p-4 bg-rose-50/60 rounded-2xl border border-rose-100">
                      <div>
                        <span className="text-xs font-black text-[#1a3f4e] block">Cancel Adults</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block mt-0.5">Max: {selectedBooking.travellers?.adults ?? selectedBooking.adults ?? 1}</span>
                      </div>
                      <div className="flex items-center gap-3.5">
                        <button
                          type="button"
                          onClick={() => setCancelData(p => ({ ...p, cancelAdults: Math.max(0, p.cancelAdults - 1) }))}
                          className="w-8 h-8 rounded-full bg-white hover:bg-rose-50 flex items-center justify-center border border-rose-200 text-rose-600 transition-all font-black"
                        >-</button>
                        <span className="text-sm font-black text-[#1a3f4e] min-w-[12px] text-center">{cancelData.cancelAdults}</span>
                        <button
                          type="button"
                          onClick={() => setCancelData(p => ({ ...p, cancelAdults: Math.min(selectedBooking.travellers?.adults ?? selectedBooking.adults ?? 1, p.cancelAdults + 1) }))}
                          className="w-8 h-8 rounded-full bg-white hover:bg-rose-50 flex items-center justify-center border border-rose-200 text-rose-600 transition-all font-black"
                        >+</button>
                      </div>
                    </div>
                    {/* Children to cancel */}
                    {(selectedBooking.travellers?.children ?? selectedBooking.children ?? 0) > 0 && (
                      <div className="flex items-center justify-between p-4 bg-rose-50/60 rounded-2xl border border-rose-100">
                        <div>
                          <span className="text-xs font-black text-[#1a3f4e] block">Cancel Children</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase block mt-0.5">Max: {selectedBooking.travellers?.children ?? selectedBooking.children ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-3.5">
                          <button
                            type="button"
                            onClick={() => setCancelData(p => ({ ...p, cancelChildren: Math.max(0, p.cancelChildren - 1) }))}
                            className="w-8 h-8 rounded-full bg-white hover:bg-rose-50 flex items-center justify-center border border-rose-200 text-rose-600 transition-all font-black"
                          >-</button>
                          <span className="text-sm font-black text-[#1a3f4e] min-w-[12px] text-center">{cancelData.cancelChildren}</span>
                          <button
                            type="button"
                            onClick={() => setCancelData(p => ({ ...p, cancelChildren: Math.min(selectedBooking.travellers?.children ?? selectedBooking.children ?? 0, p.cancelChildren + 1) }))}
                            className="w-8 h-8 rounded-full bg-white hover:bg-rose-50 flex items-center justify-center border border-rose-200 text-rose-600 transition-all font-black"
                          >+</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live preview */}
                  {(cancelData.cancelAdults > 0 || cancelData.cancelChildren > 0) && (() => {
                    const curAdults = selectedBooking.travellers?.adults ?? selectedBooking.adults ?? 1;
                    const curChildren = selectedBooking.travellers?.children ?? selectedBooking.children ?? 0;
                    const remAdults = curAdults - cancelData.cancelAdults;
                    const remChildren = curChildren - cancelData.cancelChildren;
                    const basePrice: number =
                      selectedBooking.paymentSummary?.basePrice ??
                      selectedBooking.basePrice ??
                      selectedBooking.totalAmount / (1.05 * (curAdults + curChildren * 0.5));
                    const cancelledSubtotal = basePrice * cancelData.cancelAdults + basePrice * 0.5 * cancelData.cancelChildren;
                    const refund = cancelledSubtotal * 1.05;
                    const newTotal = selectedBooking.totalAmount - refund;
                    const isFullCancel = remAdults + remChildren === 0;
                    return (
                      <div className="space-y-3">
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">After Cancellation</span>
                          <div className="flex gap-4 text-xs font-bold text-[#1a3f4e]">
                            {remAdults > 0 && <span>{remAdults} Adult{remAdults !== 1 ? "s" : ""} remaining</span>}
                            {remChildren > 0 && <span>{remChildren} Child{remChildren !== 1 ? "ren" : ""} remaining</span>}
                            {isFullCancel && <span className="text-rose-600">All travelers removed</span>}
                          </div>
                          <div className="flex justify-between text-xs font-black text-[#1a3f4e] pt-2 border-t border-gray-100">
                            <span>New Total</span>
                            <span>{isFullCancel ? "—" : formatPrice(Math.max(0, newTotal), selectedBooking.currency)}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-black bg-emerald-50 border border-emerald-100 text-emerald-700">
                            <LucideIcon name="TrendingDown" size={13} />
                            <span>Est. Refund: {formatPrice(refund, selectedBooking.currency)}</span>
                          </div>
                        </div>
                        {isFullCancel && (
                          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-black">
                            <LucideIcon name="AlertTriangle" size={14} />
                            <span>Removing all travelers will fully cancel this booking.</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Reason textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Reason (Optional)</label>
                    <textarea
                      value={cancelData.reason}
                      onChange={(e) => setCancelData(p => ({ ...p, reason: e.target.value }))}
                      placeholder="E.g. Change of plans, scheduling conflict…"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all placeholder:text-gray-400 bg-gray-50/30 resize-none"
                    />
                  </div>

                  {/* Error */}
                  {cancelError && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold flex gap-2.5 items-center">
                      <LucideIcon name="AlertTriangle" size={15} />
                      <span>{cancelError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
              {/* Pending Edit Request Banner */}
              {selectedBooking.pendingEdit && (
                <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-900 rounded-[2rem] p-5 flex items-start gap-4 shadow-sm mb-6 animate-pulse">
                  {/* Subtle decorative pulse ring */}
                  <span className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 animate-ping duration-[3000ms]" />
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                    <LucideIcon name="Clock" size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-widest text-amber-800">
                      Pending Modification
                    </h4>
                    <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                      Your request to modify this booking is pending admin approval.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-amber-600">
                      <span>👤 {selectedBooking.pendingEdit.adults} Adults {selectedBooking.pendingEdit.children > 0 && `& ${selectedBooking.pendingEdit.children} Children`}</span>
                      <span>📅 Proposed Date: {selectedBooking.pendingEdit.travelDate}</span>
                      <span>💰 Est. Adjustment: {formatPrice(selectedBooking.pendingEdit.paymentSummary?.adjustmentAmount ?? (selectedBooking.pendingEdit.totalAmount - selectedBooking.totalAmount), selectedBooking.currency)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── VIEW MODE (original content) ── */}
              {/* Trip Section */}
              <div className="bg-[#f8f9fa] rounded-2xl p-5 border border-gray-100 space-y-3">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Travel Package</span>
                <span className="text-base font-extrabold text-[#1a3f4e]">
                  {selectedBooking.packageName || selectedBooking.packageTitle || "Premium Vacation Pack"}
                </span>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200/50 text-xs">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase block tracking-wider">Start Date</span>
                    <span className="font-bold text-[#1a3f4e]">{selectedBooking.travelDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase block tracking-wider">Return Date</span>
                    <span className="font-bold text-[#1a3f4e]">{selectedBooking.returnDate || "Flexible"}</span>
                  </div>
                </div>
              </div>

              {/* Occupant/Guest Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Guest Details */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5">Guest Information</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold">Name:</span>
                      <span className="text-[#1a3f4e] font-extrabold">{selectedBooking.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold">Email:</span>
                      <span className="text-[#1a3f4e] font-extrabold truncate max-w-[150px]">{selectedBooking.userEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold">Phone:</span>
                      <span className="text-[#1a3f4e] font-extrabold">{selectedBooking.userPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Status & Occupants */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5">Rooming & Status</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold">Occupants:</span>
                      <span className="text-[#1a3f4e] font-extrabold">
                        {selectedBooking.travellers?.adults || selectedBooking.adults || 1} Adult(s)
                        {(selectedBooking.travellers?.children || selectedBooking.children || 0) > 0
                          ? `, ${selectedBooking.travellers?.children || selectedBooking.children} Child(ren)`
                          : ""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-bold">Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(selectedBooking.bookingStatus)}`}>
                        {selectedBooking.bookingStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-bold">Payment:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        selectedBooking.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : selectedBooking.paymentStatus === "failed"
                          ? "bg-rose-50 text-rose-600 border-rose-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}>
                        {selectedBooking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Booking Journey Timeline */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5">Booking Journey</h4>
                
                <div className="relative pl-6 space-y-6">
                  {/* Vertical Line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gray-200" />
                  
                  {/* Steps mapping */}
                  {(() => {
                    // Compute steps
                    const createdDate = selectedBooking.createdAt || selectedBooking.bookingDate;
                    const formattedCreatedDate = createdDate
                      ? new Date(createdDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "";

                    const isPaid = selectedBooking.paymentStatus === "paid";
                    const isFailed = selectedBooking.paymentStatus === "failed";

                    const isConfirmed = selectedBooking.bookingStatus === "confirmed" || selectedBooking.bookingStatus === "completed";
                    const isCancelled = selectedBooking.bookingStatus === "cancelled";

                    let isTripStarted = false;
                    if (selectedBooking.bookingStatus === "completed") {
                      isTripStarted = true;
                    } else if (selectedBooking.bookingStatus === "confirmed" && selectedBooking.travelDate) {
                      try {
                        const tDate = new Date(selectedBooking.travelDate);
                        const today = new Date();
                        tDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);
                        isTripStarted = today >= tDate;
                      } catch (e) {
                        console.error(e);
                      }
                    }
                    const showTripStarted = isTripStarted && !isCancelled;

                    const isTripCompleted = selectedBooking.bookingStatus === "completed" && !isCancelled;

                    const steps = [
                      {
                        key: "created",
                        title: "Booking Created",
                        description: `Reservation initialized on ${formattedCreatedDate || "Date N/A"}`,
                        status: "completed",
                        icon: "Calendar",
                        color: "text-emerald-500 bg-emerald-50 border-emerald-200"
                      },
                      {
                        key: "payment",
                        title: "Payment Completed",
                        description: isPaid
                          ? "Payment verified successfully"
                          : isFailed
                          ? "Payment attempt failed"
                          : "Awaiting payment transaction",
                        status: isPaid ? "completed" : isFailed ? "failed" : "pending",
                        icon: isPaid ? "Check" : isFailed ? "X" : "CreditCard",
                        color: isPaid
                          ? "text-emerald-500 bg-emerald-50 border-emerald-200"
                          : isFailed
                          ? "text-rose-500 bg-rose-50 border-rose-200"
                          : "text-amber-500 bg-amber-50 border-amber-200"
                      },
                      {
                        key: "confirmed",
                        title: isCancelled ? "Booking Cancelled" : "Booking Confirmed",
                        description: isConfirmed
                          ? "Reservation approved by StayVacation"
                          : isCancelled
                          ? "This booking has been cancelled"
                          : "Awaiting confirmation check",
                        status: isConfirmed ? "completed" : isCancelled ? "cancelled" : "pending",
                        icon: isConfirmed ? "Check" : isCancelled ? "X" : "Clock",
                        color: isConfirmed
                          ? "text-emerald-500 bg-emerald-50 border-emerald-200"
                          : isCancelled
                          ? "text-rose-500 bg-rose-50 border-rose-200"
                          : "text-gray-400 bg-gray-50 border-gray-200"
                      },
                      {
                        key: "started",
                        title: "Trip Started",
                        description: showTripStarted
                          ? "Your journey has commenced!"
                          : isCancelled
                          ? "Trip cancelled"
                          : `Scheduled to start on ${selectedBooking.travelDate}`,
                        status: showTripStarted ? "completed" : isCancelled ? "cancelled" : "pending",
                        icon: "Compass",
                        color: showTripStarted
                          ? "text-emerald-500 bg-emerald-50 border-emerald-200"
                          : isCancelled
                          ? "text-gray-300 bg-gray-50 border-gray-100"
                          : "text-gray-400 bg-gray-50 border-gray-200"
                      },
                      {
                        key: "completed",
                        title: "Trip Completed",
                        description: isTripCompleted
                          ? "Hope you enjoyed your staycation!"
                          : isCancelled
                          ? "Trip cancelled"
                          : "Awaiting trip completion",
                        status: isTripCompleted ? "completed" : isCancelled ? "cancelled" : "pending",
                        icon: "MapPin",
                        color: isTripCompleted
                          ? "text-emerald-500 bg-emerald-50 border-emerald-200"
                          : isCancelled
                          ? "text-gray-300 bg-gray-50 border-gray-100"
                          : "text-gray-400 bg-gray-50 border-gray-200"
                      }
                    ];

                    return steps.map((step, index) => {
                      const isStepCompleted = step.status === "completed";
                      const isStepFailed = step.status === "failed";
                      const isStepCancelled = step.status === "cancelled";
                      const isStepPending = step.status === "pending";

                      // Line coloring logic
                      let lineClass = "bg-gray-200";
                      if (index < steps.length - 1) {
                        const nextStep = steps[index + 1];
                        if (isStepCompleted && nextStep.status === "completed") {
                          lineClass = "bg-emerald-500";
                        } else if (isStepCompleted && nextStep.status === "pending") {
                          lineClass = "bg-gradient-to-b from-emerald-500 to-gray-200";
                        } else if (isStepCompleted && (nextStep.status === "failed" || nextStep.status === "cancelled")) {
                          lineClass = "bg-gradient-to-b from-emerald-500 to-rose-500";
                        } else if (isStepCancelled || isStepFailed) {
                          lineClass = "bg-rose-200";
                        }
                      }

                      return (
                        <div key={step.key} className="relative flex gap-4 items-start group">
                          {/* Colored connection line */}
                          {index < steps.length - 1 && (
                            <div className={`absolute left-[15px] top-8 bottom-[-24px] w-[2px] transition-all duration-300 ${lineClass}`} />
                          )}

                          {/* Node Icon */}
                          <div className={`relative z-10 w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm transition-all duration-300 shrink-0 ${step.color} shadow-sm`}>
                            <LucideIcon name={step.icon} size={14} />
                          </div>

                          {/* Text info */}
                          <div className="space-y-0.5 pt-0.5">
                            <span className={`text-xs font-black uppercase tracking-wider block transition-colors duration-300 ${
                              isStepCompleted
                                ? "text-[#1a3f4e]"
                                : isStepCancelled || isStepFailed
                                ? "text-rose-500"
                                : "text-gray-400"
                            }`}>
                              {step.title}
                            </span>
                            <span className="text-[11px] font-bold text-gray-400 block leading-none">
                              {step.description}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedBooking.adminNotes && (
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5">Note from Host</h4>
                  <p className="bg-[#f0f9ff] rounded-xl p-4 text-xs font-bold text-[#1e3a8a] border border-[#dbeafe] leading-relaxed italic">
                    &ldquo;{selectedBooking.adminNotes}&rdquo;
                  </p>
                </div>
              )}

              {/* Special Request Note */}
              {selectedBooking.notes && (
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5">Special Instructions</h4>
                  <p className="bg-[#f8f9fa] rounded-xl p-4 text-xs font-bold text-[#1a3f4e] border border-gray-200/50 leading-relaxed italic">
                    &ldquo;{selectedBooking.notes}&rdquo;
                  </p>
                </div>
              )}

              {/* Cancellation History */}
              {selectedBooking.cancellations && selectedBooking.cancellations.length > 0 && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Cancellation History</span>
                  <div className="space-y-2">
                    {selectedBooking.cancellations.map((c, i) => (
                      <div key={i} className="bg-rose-50/50 border border-rose-100 rounded-xl px-4 py-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3 text-[11px] font-bold text-rose-700">
                            {c.cancelAdults > 0 && <span>-{c.cancelAdults} Adult{c.cancelAdults !== 1 ? "s" : ""}</span>}
                            {c.cancelChildren > 0 && <span>-{c.cancelChildren} Child{c.cancelChildren !== 1 ? "ren" : ""}</span>}
                          </div>
                          <span className="text-[10px] font-bold text-gray-400">{new Date(c.at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-gray-500">
                          <span>Refund: {formatPrice(c.refundAmount, selectedBooking.currency)}</span>
                          <span className="text-gray-400">Remaining: {c.newAdults}A / {c.newChildren}C</span>
                        </div>
                        {c.reason && <p className="text-[10px] text-gray-400 italic">&ldquo;{c.reason}&rdquo;</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modification Request History */}
              {selectedBooking.editRequests && selectedBooking.editRequests.length > 0 && (
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Modification Request History</span>
                  <div className="relative pl-6 space-y-6">
                    {/* Vertical line indicator */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gray-100" />
                    
                    {selectedBooking.editRequests.map((req) => {
                      const isPending = req.status === "pending";
                      const isApproved = req.status === "approved";
                      const isRejected = req.status === "rejected";
                      
                      let statusBg = "bg-gray-100 text-gray-500 border-gray-200";
                      let statusText = "Pending";
                      let statusIcon = "Clock";
                      if (isApproved) {
                        statusBg = "bg-emerald-50 text-emerald-600 border-emerald-100";
                        statusText = "Approved";
                        statusIcon = "CheckCircle";
                      } else if (isRejected) {
                        statusBg = "bg-rose-50 text-rose-600 border-rose-100";
                        statusText = "Rejected";
                        statusIcon = "XCircle";
                      }

                      const adj = req.paymentSummary?.adjustmentAmount ?? 0;
                      
                      return (
                        <div key={req.requestId} className="relative flex gap-4 items-start group">
                          {/* Timeline node */}
                          <div className={`relative z-10 w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${statusBg} shadow-sm`}>
                            <LucideIcon name={statusIcon} size={14} />
                          </div>
                          
                          {/* Content card */}
                          <div className="flex-1 bg-gray-50/50 hover:bg-gray-50 border border-gray-100/80 rounded-2xl p-4 transition-colors space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-xs font-black uppercase tracking-wider text-[#1a3f4e]">
                                Modification Request
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusBg}`}>
                                {statusText}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-bold text-gray-500">
                              <div>
                                <span className="text-[9px] font-black text-gray-400 block uppercase">Requested Travelers</span>
                                <span className="text-[#1a3f4e]">{req.adults} Adults {req.children > 0 && `, ${req.children} Children`}</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-black text-gray-400 block uppercase">Proposed Date</span>
                                <span className="text-[#1a3f4e]">{req.travelDate}</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-black text-gray-400 block uppercase">Requested On</span>
                                <span className="text-gray-400 font-medium">
                                  {new Date(req.requestedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] font-black text-gray-400 block uppercase">Price Adjustment</span>
                                <span className={adj < 0 ? "text-emerald-600 font-extrabold" : adj > 0 ? "text-[#1a3f4e] font-extrabold" : "text-gray-500"}>
                                  {adj === 0 ? "No Change" : `${adj > 0 ? "+" : ""}${formatPrice(adj, selectedBooking.currency)}`}
                                </span>
                              </div>
                            </div>

                            {req.notes && (
                              <div className="pt-1.5 border-t border-gray-200/50">
                                <span className="text-[9px] font-black text-gray-400 block uppercase">Guest Note</span>
                                <p className="text-[10px] text-gray-500 italic mt-0.5 leading-relaxed">&ldquo;{req.notes}&rdquo;</p>
                              </div>
                            )}

                            {req.adminNotes && (
                              <div className={`pt-2 border-t border-gray-200/50 mt-1.5 ${isApproved ? "text-emerald-800" : "text-rose-800"}`}>
                                <span className="text-[9px] font-black text-gray-400 block uppercase">Host Response</span>
                                <p className="text-[10.5px] font-bold mt-0.5 leading-relaxed italic">&ldquo;{req.adminNotes}&rdquo;</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cancel Success Notice */}
              {cancelSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-700 font-bold flex gap-2.5 items-center">
                  <LucideIcon name="CheckCircle" size={15} />
                  <span>{cancelSuccess}</span>
                </div>
              )}

              {/* Payment Summary Section */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                {selectedBooking.paymentSummary ? (
                  <>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Payment Summary</span>
                    <div className="space-y-1.5">
                      {/* Adult line */}
                      <div className="flex justify-between text-[11px] font-bold text-gray-500">
                        <span>Adults ({selectedBooking.paymentSummary.adultCount} × {formatPrice(selectedBooking.paymentSummary.adultUnitPrice, selectedBooking.currency)})</span>
                        <span className="text-[#1a3f4e] font-black">{formatPrice(selectedBooking.paymentSummary.adultTotal, selectedBooking.currency)}</span>
                      </div>
                      {/* Child line */}
                      {selectedBooking.paymentSummary.childCount > 0 && (
                        <div className="flex justify-between text-[11px] font-bold text-gray-500">
                          <span>Children ({selectedBooking.paymentSummary.childCount} × {formatPrice(selectedBooking.paymentSummary.childUnitPrice, selectedBooking.currency)})</span>
                          <span className="text-[#1a3f4e] font-black">{formatPrice(selectedBooking.paymentSummary.childTotal, selectedBooking.currency)}</span>
                        </div>
                      )}
                      {/* Subtotal */}
                      <div className="flex justify-between text-[11px] font-bold text-gray-400 pt-1 border-t border-gray-100">
                        <span>Subtotal</span>
                        <span>{formatPrice(selectedBooking.paymentSummary.subtotal, selectedBooking.currency)}</span>
                      </div>
                      {/* Tax */}
                      <div className="flex justify-between text-[11px] font-bold text-gray-400">
                        <span>Luxury Service Fees & Taxes ({(selectedBooking.paymentSummary.taxRate * 100).toFixed(0)}%)</span>
                        <span>{formatPrice(selectedBooking.paymentSummary.taxesAndFees, selectedBooking.currency)}</span>
                      </div>
                      {/* Current total */}
                      <div className="flex justify-between items-center text-sm font-black text-[#1a3f4e] pt-2 border-t border-gray-100">
                        <div>
                          <span className="block">Current Total</span>
                          <span className="text-[9px] font-bold text-gray-400 normal-case tracking-normal">VAT and processing inclusive</span>
                        </div>
                        <span className="text-xl">{formatPrice(selectedBooking.paymentSummary.totalAmount, selectedBooking.currency)}</span>
                      </div>
                    </div>
                    {/* Adjustment badge */}
                    {selectedBooking.paymentSummary.originalTotalAmount !== selectedBooking.paymentSummary.totalAmount && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-gray-400">
                          <span>Originally Paid</span>
                          <span>{formatPrice(selectedBooking.paymentSummary.originalTotalAmount, selectedBooking.currency)}</span>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-black ${
                          selectedBooking.paymentSummary.adjustmentAmount < 0
                            ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                            : "bg-amber-50 border border-amber-100 text-amber-700"
                        }`}>
                          <LucideIcon
                            name={selectedBooking.paymentSummary.adjustmentAmount < 0 ? "TrendingDown" : "TrendingUp"}
                            size={13}
                          />
                          {selectedBooking.paymentSummary.adjustmentAmount < 0
                            ? `Refund Due: ${formatPrice(Math.abs(selectedBooking.paymentSummary.adjustmentAmount), selectedBooking.currency)}`
                            : `Additional Charge: ${formatPrice(selectedBooking.paymentSummary.adjustmentAmount, selectedBooking.currency)}`
                          }
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Fallback: simple total for bookings that haven't been edited yet */
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Total Invoice Paid</span>
                      <span className="text-xs font-bold text-gray-400">VAT and processing inclusive</span>
                    </div>
                    <div className="text-2xl font-black text-[#1a3f4e]">
                      {formatPrice(selectedBooking.totalAmount, selectedBooking.currency)}
                    </div>
                  </div>
                )}
              </div>
              </>
            )} {/* end isEditing conditional */}

            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
              {/* Left: action buttons (view mode only, pending/confirmed only) */}
              {!isEditing && !isCancellingTravelers && !selectedBooking.pendingEdit &&
                (selectedBooking.bookingStatus === "pending" || selectedBooking.bookingStatus === "confirmed") && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditError(null);
                        setIsEditing(true);
                      }}
                      className="px-5 py-3 bg-[#1a3f4e] hover:bg-[#1a3f4e]/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <LucideIcon name="Pencil" size={13} />
                      Edit Booking
                    </button>
                    <button
                      onClick={() => {
                        setCancelError(null);
                        setCancelSuccess(null);
                        setCancelData({ cancelAdults: 0, cancelChildren: 0, reason: "" });
                        setIsCancellingTravelers(true);
                      }}
                      className="px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <LucideIcon name="UserMinus" size={13} />
                      Cancel Travelers
                    </button>
                  </div>
                )}

              {/* Spacer */}
              <div className="flex-1" />

              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditError(null);
                      if (selectedBooking) {
                        setEditData({
                          adults: selectedBooking.travellers?.adults ?? selectedBooking.adults ?? 1,
                          children: selectedBooking.travellers?.children ?? selectedBooking.children ?? 0,
                          travelDate: selectedBooking.travelDate || "",
                          returnDate: selectedBooking.returnDate || "",
                          notes: selectedBooking.notes || "",
                        });
                      }
                    }}
                    className="px-5 py-3 bg-white hover:bg-gray-100 border border-gray-200/80 rounded-xl text-xs font-black uppercase tracking-widest text-[#1a3f4e] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={saving || !editData?.travelDate}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                      saving || !editData?.travelDate
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white shadow-md shadow-orange-500/15 hover:-translate-y-0.5 active:scale-[0.98]"
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving…</span>
                      </>
                    ) : (
                      <>
                        <LucideIcon name="Save" size={13} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              ) : isCancellingTravelers ? (
                <>
                  <button
                    onClick={() => {
                      setIsCancellingTravelers(false);
                      setCancelError(null);
                      setCancelData({ cancelAdults: 0, cancelChildren: 0, reason: "" });
                    }}
                    className="px-5 py-3 bg-white hover:bg-gray-100 border border-gray-200/80 rounded-xl text-xs font-black uppercase tracking-widest text-[#1a3f4e] transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePartialCancel}
                    disabled={cancelling || (cancelData.cancelAdults <= 0 && cancelData.cancelChildren <= 0)}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                      cancelling || (cancelData.cancelAdults <= 0 && cancelData.cancelChildren <= 0)
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/15 hover:-translate-y-0.5 active:scale-[0.98]"
                    }`}
                  >
                    {cancelling ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing…</span>
                      </>
                    ) : (
                      <>
                        <LucideIcon name="UserMinus" size={13} />
                        <span>Confirm Cancellation</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-6 py-3 bg-white hover:bg-gray-100 border border-gray-200/80 rounded-xl text-xs font-black uppercase tracking-widest text-[#1a3f4e] transition-all"
                >
                  Close Details
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </LayoutV2>
  );
}
