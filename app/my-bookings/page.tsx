"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/store/hooks";
import { useCurrency } from "@/app/hooks/useCurrency";
import LayoutV2 from "../layouts-v2/LayoutV2";
import LucideIcon from "../components/LucideIcon";

interface Booking {
  id: string;
  bookingId: string;
  userId: string;
  packageId?: string;
  packageName?: string;
  packageTitle?: string;
  totalAmount: number;
  currency: string;
  bookingStatus: "pending" | "confirmed" | "cancelled";
  status: "pending" | "confirmed" | "cancelled";
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
  createdAt?: string;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, authChecked, loading: authLoading } = useAppSelector((state) => state.auth);
  const { formatPrice } = useCurrency();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Authentication Check Redirect
  useEffect(() => {
    if (authChecked && !user) {
      router.push(`/login?from=${encodeURIComponent("/my-bookings")}`);
    }
  }, [user, authChecked, router]);

  // Fetch user bookings
  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/bookings/my-bookings");
        const json = await res.json();
        if (json.success) {
          setBookings(json.data || []);
        } else {
          setError(json.message || "Failed to load bookings.");
        }
      } catch (err) {
        console.error(err);
        setError("A network error occurred while fetching bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
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
            {(["all", "pending", "confirmed", "cancelled"] as const).map((tab) => {
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

              {/* Special Request Note */}
              {selectedBooking.notes && (
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5">Special Instructions</h4>
                  <p className="bg-[#f8f9fa] rounded-xl p-4 text-xs font-bold text-[#1a3f4e] border border-gray-200/50 leading-relaxed italic">
                    "{selectedBooking.notes}"
                  </p>
                </div>
              )}

              {/* Total Paid Section */}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Total Invoice Paid</span>
                  <span className="text-xs font-bold text-gray-400">VAT and processing inclusive</span>
                </div>
                <div className="text-2xl font-black text-[#1a3f4e]">
                  {formatPrice(selectedBooking.totalAmount, selectedBooking.currency)}
                </div>
              </div>

            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-3 bg-white hover:bg-gray-100 border border-gray-200/80 rounded-xl text-xs font-black uppercase tracking-widest text-[#1a3f4e] transition-all"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}
    </LayoutV2>
  );
}
