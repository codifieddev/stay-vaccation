"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/app/store/hooks";
import { useCurrency } from "@/app/hooks/useCurrency";
import LayoutV2 from "../layouts-v2/LayoutV2";
import LucideIcon from "../components/LucideIcon";
import Script from "next/script";

function BookingFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { formatPrice, convert } = useCurrency();

  // Read search params
  const packageId = searchParams.get("packageId") || "";
  const packageName = searchParams.get("packageName") || "Premium Experience";
  const basePrice = Number(searchParams.get("price") || 0);
  const duration = searchParams.get("duration") || "Flexible";
  const destination = searchParams.get("destination") || "Global";
  const baseCurrency = searchParams.get("currency") || "INR";

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [notes, setNotes] = useState("");

  // UI status
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<any | null>(null);
  const [showMockModal, setShowMockModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState("");
  const [livePkg, setLivePkg] = useState<any | null>(null);
  const [loadingPkg, setLoadingPkg] = useState(true);

  useEffect(() => {
    async function fetchLivePackage() {
      if (!packageId) return;
      try {
        setLoadingPkg(true);
        const res = await fetch(`/api/packages?id=${packageId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setLivePkg(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch live package available seats:", err);
      } finally {
        setLoadingPkg(false);
      }
    }
    fetchLivePackage();
  }, [packageId]);

  // Auto-fill logged-in user details
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  // Pricing calculations
  const adultTotal = basePrice * adults;
  const childTotal = basePrice * 0.5 * children;
  const subtotal = adultTotal + childTotal;
  const taxesAndFees = subtotal * 0.05; // 5% luxury tax
  const totalRaw = subtotal + taxesAndFees;

  const liveMaxLimit = livePkg?.maxTravelersLimit;
  const liveAvailable = livePkg?.availableSeats;
  const isSoldOut = liveMaxLimit !== undefined && liveAvailable !== undefined && liveAvailable <= 0;
  const totalOccupants = adults + children;
  const isOverbooked = liveMaxLimit !== undefined && liveAvailable !== undefined && totalOccupants > liveAvailable;

  const isFormValid = name.trim() && email.trim() && phone.trim() && travelDate;

  const handlePaymentSuccess = async (paymentId: string, orderId: string, signature: string) => {
    try {
      setSubmitting(true);
      setErrorMsg(null);
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          packageName,
          totalAmount: totalRaw,
          travelDate,
          returnDate,
          travellers: { adults, children },
          adults,
          children,
          userName: name,
          userEmail: email,
          userPhone: phone,
          notes,
          currency: baseCurrency,
          paymentId,
          orderId,
          signature,
          paymentStatus: "paid",
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        setSuccessBooking(resData.data || { bookingId: resData.bookingId });
      } else {
        setErrorMsg(resData.message || "Failed to complete your booking. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("A network error occurred. Please check your connection.");
    } finally {
      setSubmitting(false);
      setShowMockModal(false);
    }
  };

  const handlePaymentFailure = async (orderId: string, reason: "failed" | "cancelled", errorDetails?: any) => {
    try {
      setSubmitting(true);
      setErrorMsg(null);
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          packageName,
          totalAmount: totalRaw,
          travelDate,
          returnDate,
          travellers: { adults, children },
          adults,
          children,
          userName: name,
          userEmail: email,
          userPhone: phone,
          notes,
          currency: baseCurrency,
          orderId,
          paymentStatus: reason === "failed" ? "failed" : "pending",
          bookingStatus: "pending",
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        setErrorMsg(`Payment ${reason === "failed" ? "failed" : "was cancelled"}. Booking (ID: ${resData.bookingId}) is saved as pending/unpaid. You can pay for it later under My Bookings.`);
      } else {
        setErrorMsg(resData.message || "Payment failed and booking could not be saved.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("A network error occurred. Booking could not be saved.");
    } finally {
      setSubmitting(false);
      setShowMockModal(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isSoldOut) {
      setErrorMsg("This package is sold out.");
      return;
    }
    if (isOverbooked) {
      setErrorMsg(`Only ${liveAvailable} seat(s) are available. You have selected ${totalOccupants} travellers.`);
      return;
    }

    if (!name.trim()) return setErrorMsg("Full Name is required");
    if (!email.trim()) return setErrorMsg("Email is required");
    if (!phone.trim()) return setErrorMsg("Phone number is required");
    if (!travelDate) return setErrorMsg("Travel date is required");

    setSubmitting(true);

    try {
      const orderResponse = await fetch("/api/bookings/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalRaw,
          currency: baseCurrency,
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderData.success) {
        setErrorMsg(orderData.message || "Failed to initialize payment order.");
        setSubmitting(false);
        return;
      }

      const { orderId, amount, currency, mock, keyId } = orderData;
      setCurrentOrderId(orderId);

      if (mock) {
        setShowMockModal(true);
      } else {
        if (!(window as any).Razorpay) {
          setErrorMsg("Razorpay SDK failed to load. Please refresh the page and try again.");
          setSubmitting(false);
          return;
        }

        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "StayVacation",
          description: `Booking for ${packageName}`,
          order_id: orderId,
          handler: async function (response: any) {
            await handlePaymentSuccess(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );
          },
          prefill: {
            name: name,
            email: email,
            contact: phone,
          },
          theme: {
            color: "#061217",
          },
          modal: {
            ondismiss: async function () {
              await handlePaymentFailure(orderId, "cancelled");
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", async function (resp: any) {
          await handlePaymentFailure(orderId, "failed", resp.error);
        });
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("A network error occurred. Please check your connection.");
      setSubmitting(false);
    }
  };

  if (successBooking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8f9fa] py-16 px-6">
        <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-gray-100 text-center relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-orange-500 to-[#ff6b00]" />
          
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <LucideIcon name="Check" size={40} />
          </div>

          <h2 className="font-['Poppins'] font-black text-[#1a3f4e] text-3xl mb-3 tracking-tight">Booking Confirmed!</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto font-medium">
            Your premium journey is secured. We have sent the confirmation details to <strong className="text-gray-805">{email}</strong>.
          </p>

          <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-gray-100 mb-8 inline-block w-full text-left space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200/50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Booking ID</span>
              <span className="text-sm font-black text-orange-600 font-mono bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                {successBooking.bookingId}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Destination</span>
              <span className="text-xs font-bold text-[#1a3f4e]">{destination}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Travel Date</span>
              <span className="text-xs font-bold text-[#1a3f4e]">{travelDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Travellers</span>
              <span className="text-xs font-bold text-[#1a3f4e]">
                {adults} Adult{adults > 1 ? "s" : ""}{children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200/50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Paid</span>
              <span className="text-base font-black text-[#1a3f4e]">
                {formatPrice(totalRaw, baseCurrency)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/")}
              className="px-8 py-4 bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-[0_4px_15px_rgba(255,149,0,0.2)] hover:shadow-[0_6px_25px_rgba(255,149,0,0.35)] transition-all hover:-translate-y-0.5 active:scale-95"
            >
              Go to Home
            </button>
            <button
              onClick={() => router.push("/packages")}
              className="px-8 py-4 bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-black uppercase tracking-widest rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95"
            >
              Browse Packages
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-8 pb-20">
      <div className="container-sv mx-auto px-4 max-w-6xl">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-6">
          <span className="cursor-pointer hover:text-gray-600" onClick={() => router.push("/packages")}>Packages</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 font-extrabold truncate max-w-[200px]">{packageName}</span>
          <span className="text-gray-300">/</span>
          <span className="text-orange-500 font-black uppercase">Secure Booking</span>
        </div>

        {/* Header Title */}
        <div className="mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b00] mb-2 block">Checkout Journey</span>
          <h1 className="font-['Poppins'] text-3xl md:text-5xl font-black text-[#1a3f4e] tracking-tight">
            Complete Your Booking
          </h1>
          <p className="text-gray-505 text-xs md:text-sm font-bold mt-2 leading-relaxed">
            Fill in your details below to reserve your luxury staycation.
          </p>
        </div>

        {/* Sold Out Banner */}
        {isSoldOut && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-3xl flex items-center gap-4 shadow-sm animate-pulse">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-650 shrink-0">
              <LucideIcon name="AlertOctagon" size={24} />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-black text-red-800 uppercase tracking-wider">This Package is Sold Out</h4>
              <p className="text-xs text-red-505 font-bold mt-0.5">Unfortunately, there are no remaining seats left. You cannot complete this booking.</p>
            </div>
          </div>
        )}

        {/* Overbooked Banner */}
        {!isSoldOut && isOverbooked && (
          <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-650 shrink-0">
              <LucideIcon name="AlertTriangle" size={24} />
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-black text-amber-800 uppercase tracking-wider">Insufficient Seats Available</h4>
              <p className="text-xs text-amber-600 font-bold mt-0.5">You requested {totalOccupants} seat(s) but only {liveAvailable} seat(s) are left. Please reduce the number of adults or children.</p>
            </div>
          </div>
        )}

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-10 items-start">
          
          {/* Left Column: Form Details */}
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            
            {/* Guest Details Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_4px_20px_rgba(15,23,42,0.02)] space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-[#e8f4fd] flex items-center justify-center text-[#4a90e2]">
                  <LucideIcon name="User" size={16} />
                </div>
                <h3 className="font-['Poppins'] font-extrabold text-[#1a3f4e] text-lg">Guest Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/15 transition-all placeholder:text-gray-400 bg-gray-50/30"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/15 transition-all placeholder:text-gray-400 bg-gray-50/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Phone Number *</label>
                <div className="flex gap-3">
                  <div className="w-20 shrink-0 relative">
                    <select className="w-full px-3 py-4 rounded-xl border border-gray-200 text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] appearance-none bg-white">
                      <option>+91</option>
                      <option>+1</option>
                      <option>+44</option>
                      <option>+61</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <LucideIcon name="ChevronDown" size={12} />
                    </div>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1 px-5 py-4 rounded-xl border border-gray-200 text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/15 transition-all placeholder:text-gray-400 bg-gray-50/30"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Travel details Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_4px_20px_rgba(15,23,42,0.02)] space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#ff6b00]">
                  <LucideIcon name="Calendar" size={16} />
                </div>
                <h3 className="font-['Poppins'] font-extrabold text-[#1a3f4e] text-lg">Travel Dates & Travellers</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Travel Date *</label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/15 transition-all bg-gray-50/30"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Return Date (Optional)</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/15 transition-all bg-gray-50/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Adults Counter */}
                <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-xs font-black text-[#1a3f4e] block">Adults</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block mt-0.5">Age 12+</span>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 text-[#1a3f4e] transition-all font-black"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-[#1a3f4e] min-w-[12px] text-center">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 text-[#1a3f4e] transition-all font-black"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children Counter */}
                <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-xs font-black text-[#1a3f4e] block">Children</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase block mt-0.5">Age 2-11 (50% Off)</span>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 text-[#1a3f4e] transition-all font-black"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-[#1a3f4e] min-w-[12px] text-center">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren(children + 1)}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 text-[#1a3f4e] transition-all font-black"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Special Request Notes Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_4px_20px_rgba(15,23,42,0.02)] space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                  <LucideIcon name="MessageSquare" size={16} />
                </div>
                <h3 className="font-['Poppins'] font-extrabold text-[#1a3f4e] text-lg">Special Request</h3>
              </div>
              <p className="text-xs text-gray-400 font-bold leading-normal mb-2">
                Let us know if you require special diets, hotel preferences, airport assistance, or any other customized needs.
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share your special instructions..."
                rows={4}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 text-xs font-bold text-[#1a3f4e] focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/15 transition-all placeholder:text-gray-400 bg-gray-50/30 resize-none"
              />
            </div>
            
            {/* Show local errors */}
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold flex gap-3 items-center">
                <LucideIcon name="AlertTriangle" size={16} />
                <p>{errorMsg}</p>
              </div>
            )}
          </form>

          {/* Right Column: Dynamic Price Summary Card */}
          <div className="lg:sticky lg:top-28 space-y-6">
            
            <div className="bg-white rounded-[2rem] shadow-[0_20px_45px_rgba(15,23,42,0.06)] border border-gray-100 overflow-hidden">
              
              {/* Package Header Panel */}
              <div className="p-6 md:p-8 bg-gray-50/60 border-b border-gray-100 space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-orange-500 rounded-full border border-orange-100 shadow-sm text-[9px] font-black uppercase tracking-wider">
                  📍 {destination}
                </span>
                <h3 className="font-['Poppins'] text-xl font-extrabold text-[#1a3f4e] leading-snug line-clamp-2">
                  {packageName}
                </h3>
                <div className="flex gap-3 text-xs font-bold text-gray-400 pt-1">
                  <span className="flex items-center gap-1">📅 {duration}</span>
                </div>
              </div>

              {/* Price Breakdown Details */}
              <div className="p-6 md:p-8 space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-2">Price Breakdown</h4>

                <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                  <span>Adults ({adults} × {formatPrice(basePrice, baseCurrency)})</span>
                  <span className="text-[#1a3f4e] font-black">{formatPrice(adultTotal, baseCurrency)}</span>
                </div>

                {children > 0 && (
                  <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                    <span>Children ({children} × {formatPrice(basePrice * 0.5, baseCurrency)})</span>
                    <span className="text-[#1a3f4e] font-black">{formatPrice(childTotal, baseCurrency)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs font-bold text-gray-600 pt-2 border-t border-gray-100">
                  <span>Subtotal</span>
                  <span className="text-[#1a3f4e] font-black">{formatPrice(subtotal, baseCurrency)}</span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                  <span>Luxury Service Fees & Taxes (5%)</span>
                  <span className="text-[#1a3f4e] font-black">{formatPrice(taxesAndFees, baseCurrency)}</span>
                </div>

                {/* Final Total */}
                <div className="p-4 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/10 border border-orange-600 mt-6 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black uppercase text-white/70 block tracking-widest">Total Price</span>
                    <span className="text-xs font-bold text-white/90">Includes all duties & fees</span>
                  </div>
                  <span className="text-2xl font-black">{formatPrice(totalRaw, baseCurrency)}</span>
                </div>

                <button
                  type="submit"
                  onClick={handleBookingSubmit}
                  disabled={submitting || !isFormValid || isSoldOut || isOverbooked}
                  className={`w-full py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-xl ${
                    submitting || !isFormValid || isSoldOut || isOverbooked
                      ? "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
                      : "bg-[#1a3f4e] hover:bg-[#1a3f4e]/90 text-white shadow-sky-955/10 hover:-translate-y-0.5 active:scale-[0.98]"
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <LucideIcon name="CreditCard" size={14} />
                      <span>Confirm & Book Now</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] font-bold text-gray-400 text-center leading-normal pt-2 px-4">
                  By clicking, you agree to our booking terms, confirmation policy, and cancellation policy.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Mock Payment Simulation Modal */}
      {showMockModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#061217]/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[#061217] rounded-[2rem] border border-gray-800 shadow-2xl p-8 text-center text-white overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-[#ff6b00]" />
            
            <div className="w-16 h-16 bg-[#ff6b00]/10 text-[#ff6b00] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#ff6b00]/25">
              <LucideIcon name="CreditCard" size={28} />
            </div>

            <h3 className="font-['Poppins'] font-black text-xl mb-2 tracking-tight">StayVacation Secure Pay</h3>
            <p className="text-gray-400 text-xs mb-6 font-bold uppercase tracking-wider">Simulation Mode</p>

            <div className="bg-[#0c1f28] rounded-2xl p-5 border border-gray-800/80 text-left mb-6 space-y-3.5 text-xs">
              <div className="flex justify-between font-bold text-gray-400">
                <span>Order ID:</span>
                <span className="font-mono text-white">{currentOrderId}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-400">
                <span>Package:</span>
                <span className="text-white truncate max-w-[180px]">{packageName}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-400 pt-3 border-t border-gray-800">
                <span>Amount:</span>
                <span className="text-base font-black text-[#ff6b00]">{formatPrice(totalRaw, baseCurrency)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handlePaymentSuccess(`pay_mock_${Math.random().toString(36).substring(2, 10)}`, currentOrderId, `sig_mock_${Math.random().toString(36).substring(2, 10)}`)}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-950/20 active:scale-[0.98] transition-all"
              >
                Simulate Successful Payment
              </button>
              
              <button
                type="button"
                onClick={() => handlePaymentFailure(currentOrderId, "failed")}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-950/20 active:scale-[0.98] transition-all"
              >
                Simulate Payment Failure
              </button>

              <button
                type="button"
                onClick={() => handlePaymentFailure(currentOrderId, "cancelled")}
                className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-2xl text-xs font-black uppercase tracking-wider active:scale-[0.98] transition-all"
              >
                Cancel & Pay Later
              </button>
            </div>

            <p className="text-[9px] text-gray-500 mt-5 font-medium leading-normal">
              This simulated gateway mimics official Razorpay triggers for test environments. No actual funds are processed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <LayoutV2>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center pt-20 bg-white">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-[#ff6b00] rounded-full mx-auto mb-4 animate-spin" />
              <p className="text-gray-400 text-xs font-bold">Loading secure portal…</p>
            </div>
          </div>
        }
      >
        <BookingFormContent />
      </Suspense>
    </LayoutV2>
  );
}
