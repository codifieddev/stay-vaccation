"use client";
import React, { useState, useMemo, useRef, createContext, useContext, useEffect } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setPackages } from "@/app/store/features/packages/packageSlice";
import { fetchPackages, createPackage, updatePackage, deletePackage, importPackages } from "@/app/store/features/packages/packageThunks";
import { setMasterActivities } from "@/app/store/features/activities/activitySlice";
import { fetchActivities, createActivity, updateActivity, deleteActivity } from "@/app/store/features/activities/activityThunks";
import { setMasterHotels } from "@/app/store/features/hotels/hotelSlice";
import { fetchHotels, createHotel, updateHotel, deleteHotel } from "@/app/store/features/hotels/hotelThunks";
import { setCoupons } from "@/app/store/features/coupons/couponSlice";
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/app/store/features/coupons/couponThunks";
import { setTransfers } from "@/app/store/features/transfers/transferSlice";
import { fetchTransfers, createTransfer, updateTransfer, deleteTransfer } from "@/app/store/features/transfers/transferThunks";
import { setDestinations } from "@/app/store/features/destinations/destinationSlice";
import { fetchDestinations, createDestination, updateDestination, deleteDestination } from "@/app/store/features/destinations/destinationThunks";

import { setRegions } from "@/app/store/features/regions/regionSlice";
import { fetchRegions, createRegion, updateRegion, deleteRegion } from "@/app/store/features/regions/regionThunks";
import { setCategories } from "@/app/store/features/categories/categorySlice";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/app/store/features/categories/categoryThunks";
import { logout } from "@/app/store/features/auth/authThunks";
import { apiFetch } from "@/app/store/apiUtils";

// ══════════════════════════════════════════════════════════════════
//   STAY VACATION — Admin Panel v6                                  
//   Master Activities · Master Hotels · Two-Way Sync               
//   Summarised View · SaaS-level Architecture                      
// ══════════════════════════════════════════════════════════════════

// Redux hooks are now used directly in components.

// ─── UTILS ───────────────────────────────────────────────────────
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
export const cls = (...a) => a.filter(Boolean).join(" ");
const fmt12 = (t) => { if (!t) return "—"; const [h, m] = t.split(":").map(Number); return `${(h % 12) || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };
export const getCurrSym = (code) => ({ INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ" }[code] || code);
const parseDays = (dur) => { const m = dur?.match(/^(\d+)\s*Day/i); return m ? parseInt(m[1]) : 0; };

// ─── CONSTANTS ────────────────────────────────────────────────────
const DURATION_OPTIONS = Array.from({ length: 15 }, (_, i) => {
  const d = i + 1;
  const n = i;
  if (d === 1) return "1 Day";
  return `${d} Days / ${n} Night${n === 1 ? '' : 's'}`;
});
const OPTIONS = {
  activityType: ["sightseeing", "adventure", "water sports", "cultural", "nature", "leisure", "food", "photography", "shopping", "attraction", "tour", "mountain", "beach"],
  dayType: ["arrival", "sightseeing", "transfer", "leisure", "departure"],
  starRating: ["1", "2", "3", "4", "5"],
  roomType: ["Deluxe Room", "Superior Room", "Suite", "Junior Suite", "Sea View Room", "Pool Villa", "Cottage", "Penthouse"],
  vehicleType: ["Sedan", "SUV", "Tempo Traveller", "Luxury Coach", "Speedboat", "Ferry", "Train", "Tuk-Tuk", "Helicopter"],
  transferType: ["Private", "Shared"],
  mealsOptions: ["Breakfast", "Lunch", "Dinner"],
  travelStyle: ["Luxury", "Premium", "Budget", "Adventure", "Cultural Immersion", "Family", "Group Tour"],
  exclusivity: ["Standard", "Premium", "Exclusive", "Ultra-Luxury"],
  tourType: ["Relaxation", "Heritage", "Adventure Sports", "Wildlife", "Religious", "Culinary", "Beach", "Honeymoon", "Family"],
  amenities: ["Swimming Pool", "Spa & Wellness", "Fitness Center", "Restaurant", "Bar/Lounge", "Business Center",
    "Airport Shuttle", "Concierge", "Valet Parking", "Kids Club", "Room Service", "Butler Service",
    "Private Beach", "Rooftop", "Laundry"],
};

const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "INR — Indian Rupee" },
  { code: "USD", symbol: "$", label: "USD — US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR — Euro" },
  { code: "GBP", symbol: "£", label: "GBP — British Pound" },
  { code: "AED", symbol: "د.إ", label: "AED — UAE Dirham" },
  { code: "SGD", symbol: "S$", label: "SGD — Singapore Dollar" },
  { code: "AUD", symbol: "A$", label: "AUD — Australian Dollar" },
  { code: "THB", symbol: "฿", label: "THB — Thai Baht" },
];

// ─── STYLE MAPS ───────────────────────────────────────────────────
const DAY_GRAD = {
  arrival: "from-emerald-900 to-emerald-800", sightseeing: "from-blue-950 to-blue-900",
  transfer: "from-orange-900 to-orange-800", leisure: "from-violet-900 to-violet-800",
  departure: "from-slate-800 to-slate-700",
};
const DAY_BADGE = {
  arrival: "bg-emerald-100 text-emerald-800 border-emerald-200",
  sightseeing: "bg-sky-100 text-sky-800 border-sky-200",
  transfer: "bg-orange-100 text-orange-800 border-orange-200",
  leisure: "bg-violet-100 text-violet-800 border-violet-200",
  departure: "bg-slate-100 text-slate-700 border-slate-200",
};
const ACT_DOT = {
  meal: "bg-amber-500", sightseeing: "bg-blue-600", adventure: "bg-emerald-600",
  transfer: "bg-orange-500", leisure: "bg-violet-500", wellness: "bg-pink-500", shopping: "bg-rose-500",
};
const ACT_BADGE = {
  meal: "bg-amber-50 text-amber-800", sightseeing: "bg-blue-50 text-blue-800",
  adventure: "bg-emerald-50 text-emerald-800", transfer: "bg-orange-50 text-orange-800",
  leisure: "bg-violet-50 text-violet-800", wellness: "bg-pink-50 text-pink-800", shopping: "bg-rose-50 text-rose-800",
};

// ─── INTERFACES ───────────────────────────────────────────────────
export interface MasterActivity {
  _id: string;
  title: string;
  description: string;
  activityType: string;
  defaultDuration: string;
  location: string;
  state?: string;
  country?: string;
  price?: number;
  discountPrice?: number;
  rating?: number;
  highlights?: string[];
  isEnabled?: boolean;
  destinationSlug?: string;
  tags: string[];
  images: string[];
}



export interface Region {
  _id: string;
  name: string;
  icon: string;
  order: number;
  isActive?: boolean;
}

export type DestinationStatus = "Visible" | "Hidden" | "Draft" | "Unpublished";

export interface Destination {
  _id: string;
  name: string;
  slug: string;
  regionId: string;
  image: string;
  description: string;
  isEnabled: boolean;
  isActive: boolean;
  packageCount?: number;
  isTrending?: boolean;
  category?: "India" | "International";
  displayOrder?: number;
  status: DestinationStatus;
}

export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  color?: string; // keeping for UI gradient
  gradient?: string; // explicitly naming for fallback
  image?: string;    // [NEW]
  link?: string;  // keeping for UI
  order?: number; // keeping for UI
  shortLocationList?: string;
}

export interface MasterHotel {
  _id: string;
  hotelName: string;
  city: string;
  starRating: string;
  description: string;
  roomTypes: string[];
  amenities: string[];
  images: string[];
}

export interface DayActivity {
  id: string;
  activityRef: string | null;
  time: string;
  customTitle: string;
  customDescription: string;
  customImages: string[];
  guideIncluded: boolean;
  ticketIncluded: boolean;
  coverTitle: string;
}

export interface DayHotel {
  id: string;
  hotelRef: string | null;
  customRoomType: string;
  checkInTime: string;
  checkOutTime: string;
  customNotes: string;
  customImages: string[];
  mealInclusions: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
}

export interface Transfer {
  id: string;
  source: "custom" | "existing";
  transferId: string | null;
  transferType: string;
  vehicleType: string;
  from: string;
  to: string;
  startTime: string;
  endTime: string;
  notes: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface KBYG {
  id: string;
  point: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  city: string;
  dayType: string;
  mealsIncluded: string[];
  notes: string;
  description: string;
  hotelStays: DayHotel[];
  transfers: Transfer[];
  activities: DayActivity[];
}

export interface Package {
  id: string;
  _id?: string;
  slug?: string;
  title: string;
  destination: string;
  destinationId?: string;
  destinationSlug?: string;
  categoryId?: string;
  categorySlug?: string;
  tripDuration: string;
  travelStyle: string;
  tourType: string;
  exclusivityLevel: string;
  price: {
    currency: string;
    amount: number | string;
  };
  shortDescription: string;
  availability: {
    availableMonths: string[];
    fixedDepartureDates: string[];
    blackoutDates: string[];
  };
  inclusions: string[];
  exclusions: string[];
  knowBeforeYouGo: KBYG[];
  additionalInfo: {
    aboutDestination: string;
    quickInfo: {
      destinationsCovered: string;
      duration: string;
      startPoint: string;
      endPoint: string;
    };
    experiencesCovered: string[];
    notToMiss: string[];
  };
  faqs: Faq[];
  itinerary: ItineraryDay[];
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  description: string;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiryDate: string;
}

export interface Booking {
  id: string;
  packageId: string;
  packageTitle: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  travelDate: string;
  returnDate: string;
  adults: number;
  children: number;
  totalPrice: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled";
  notes: string;
  createdAt: string;
}

export interface TransferRecord {
  _id?: string;
  pickupLocation: string;
  dropLocation: string;
  vehicleType: string;
  price: number;
  currency: string;
  duration?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

// ─── FACTORIES ────────────────────────────────────────────────────
const emptyMasterActivity = (): MasterActivity => ({ _id: uid(), title: "", description: "", activityType: "sightseeing", defaultDuration: "1 hr", location: "", tags: [], images: [] });
const emptyMasterHotel = (): MasterHotel => ({ _id: uid(), hotelName: "", city: "", starRating: "5", description: "", roomTypes: [], amenities: [], images: [] });
const emptyDayActivity = (): DayActivity => ({ id: uid(), activityRef: null, time: "09:00", customTitle: "", customDescription: "", customImages: [], guideIncluded: false, ticketIncluded: false, coverTitle: "" });
const emptyDayHotel = (): DayHotel => ({ id: uid(), hotelRef: null, customRoomType: "", checkInTime: "14:00", checkOutTime: "11:00", customNotes: "", customImages: [], mealInclusions: { breakfast: false, lunch: false, dinner: false } });
const emptyTransfer = (): Transfer => ({ id: uid(), source: "custom", transferId: null, transferType: "Private", vehicleType: "Sedan", from: "", to: "", startTime: "08:00", endTime: "10:00", notes: "" });
const emptyFaq = (): Faq => ({ id: uid(), question: "", answer: "" });
const emptyKBYG = (): KBYG => ({ id: uid(), point: "" });
const emptyAdditionalInfo = () => ({ aboutDestination: "", quickInfo: { destinationsCovered: "", duration: "", startPoint: "", endPoint: "" }, experiencesCovered: [], notToMiss: [] });
const makeDay = (n: number): ItineraryDay => ({ id: uid(), dayNumber: n, title: n === 1 ? "Arrival Day" : `Day ${n}`, city: "", dayType: n === 1 ? "arrival" : "sightseeing", mealsIncluded: [], notes: "", description: "", hotelStays: [], transfers: [], activities: [] });

const emptyCategory = (): Category => ({ name: "", slug: "", icon: "Beach", color: "from-cyan-400 to-blue-500", gradient: "from-cyan-400 to-blue-500", image: "", link: "", order: 0, description: "", shortLocationList: "", isActive: true });

// ─── RESOLVE HELPERS (two-way sync merge) ─────────────────────────
const resolveActivity = (dayAct: DayActivity, masters: MasterActivity[]) => {
  const m = masters.find(x => x._id === dayAct.activityRef);
  return {
    ...m, ...dayAct,
    title: dayAct.customTitle || m?.title || "Untitled Activity",
    description: dayAct.customDescription || m?.description || "",
    images: dayAct.customImages?.length ? dayAct.customImages : (m?.images || []),
    activityType: m?.activityType || "sightseeing",
    duration: m?.defaultDuration || "—",
    isLinked: !!m, masterTitle: m?.title,
  };
};
const resolveHotel = (dayHotel: DayHotel, masters: MasterHotel[]) => {
  const m = masters.find(x => x._id === dayHotel.hotelRef);
  return {
    ...m, ...dayHotel,
    hotelName: m?.hotelName || "Unknown Hotel",
    city: m?.city || "",
    starRating: m?.starRating || "5",
    images: dayHotel.customImages?.length ? dayHotel.customImages : (m?.images || []),
    roomType: dayHotel.customRoomType || m?.roomTypes?.[0] || "",
    notes: dayHotel.customNotes || "",
    isLinked: !!m, masterName: m?.hotelName,
  };
};


const resolveTransfer = (dayTr: Transfer, masters: TransferRecord[]) => {
  const m = masters.find(x => x._id === dayTr.transferId);
  return {
    ...m, ...dayTr,
    from: dayTr.from || m?.pickupLocation || "",
    to: dayTr.to || m?.dropLocation || "",
    vehicleType: dayTr.vehicleType || m?.vehicleType || "Sedan",
    isLinked: !!m,
    isExistingSource: dayTr.source === "existing"
  };
};

// ─── MOCK DATA ────────────────────────────────────────────────────
const INIT_ACTIVITIES: MasterActivity[] = [
  { _id: "ma-001", title: "Amber Fort Guided Tour", description: "Explore the magnificent Amber Fort with a certified local guide. Includes elephant ride option.", activityType: "sightseeing", defaultDuration: "3 hrs", location: "Jaipur, Rajasthan", tags: ["Heritage", "UNESCO", "Fort"], images: [] },
  { _id: "ma-002", title: "Sunrise Yoga on Beach", description: "Rejuvenating beachfront yoga session with a certified instructor. All mats and props provided.", activityType: "wellness", defaultDuration: "1 hr", location: "Seminyak, Bali", tags: ["Wellness", "Beach", "Morning"], images: [] },
  { _id: "ma-003", title: "Kelingking Beach Viewpoint", description: "Iconic T-Rex cliff viewpoint visit with optional snorkeling. Breathtaking Pacific views.", activityType: "adventure", defaultDuration: "2 hrs", location: "Nusa Penida, Bali", tags: ["Beach", "Scenic", "Adventure"], images: [] },
  { _id: "ma-004", title: "Traditional Cooking Class", description: "Learn authentic local recipes from a master chef. Includes market visit and 3-course meal.", activityType: "meal", defaultDuration: "4 hrs", location: "Ubud, Bali", tags: ["Culinary", "Cultural", "Hands-on"], images: [] },
  { _id: "ma-005", title: "Desert Camel Safari", description: "Sunset camel safari across the Sam Sand Dunes with cultural camp dinner and folk performance.", activityType: "adventure", defaultDuration: "3 hrs", location: "Jaisalmer, Rajasthan", tags: ["Desert", "Safari", "Sunset"], images: [] },
];
const INIT_HOTELS: MasterHotel[] = [
  { _id: "mh-001", hotelName: "The Layar Private Villas", city: "Seminyak, Bali", starRating: "5", description: "Iconic private pool villas with butler service and tropical gardens.", roomTypes: ["Private Pool Villa", "Garden Villa", "Royal Villa"], amenities: ["Swimming Pool", "Spa & Wellness", "Restaurant", "Butler Service", "Room Service"], images: [] },
  { _id: "mh-002", hotelName: "Rambagh Palace", city: "Jaipur, Rajasthan", starRating: "5", description: "Former residence of the Maharaja of Jaipur — legendary Taj property.", roomTypes: ["Deluxe Room", "Suite", "Signature Suite", "Royal Suite"], amenities: ["Swimming Pool", "Spa & Wellness", "Restaurant", "Bar/Lounge", "Butler Service", "Fitness Center"], images: [] },
  { _id: "mh-003", hotelName: "COMO Uma Ubud", city: "Ubud, Bali", starRating: "5", description: "Stunning hillside retreat above the Tjujungan River renowned for wellness.", roomTypes: ["Uma Suite", "Pool Villa", "Garden Terrace Suite"], amenities: ["Swimming Pool", "Spa & Wellness", "Restaurant", "Fitness Center", "Concierge"], images: [] },
];
const INIT_PACKAGES: Package[] = [
  {
    id: "pkg-001", title: "Bali Royal Escape", destination: "Bali, Indonesia",
    tripDuration: "5 Days / 4 Nights", travelStyle: "Luxury", tourType: "Relaxation",
    exclusivityLevel: "Premium", price: { currency: "USD", amount: 2499 },
    shortDescription: "An immersive Bali escape blending ancient temples, rice terraces, and pristine beaches.",
    availability: { availableMonths: ["October", "November", "December"], fixedDepartureDates: [], blackoutDates: [] },
    inclusions: ["4 nights luxury accommodation", "Daily breakfast", "Airport transfers", "Private villa pool access", "Certified local guide for all excursions"],
    exclusions: ["International airfare", "Travel insurance", "Personal expenses", "Visa charges"],
    knowBeforeYouGo: [
      { id: "kbyg-1", point: "We are not liable for change in itinerary due to any reason like a change in flight schedule, political disturbances, or natural phenomena." },
      { id: "kbyg-2", point: "Prices are subject to change as per availability of hotel rooms, especially during peak season." },
      { id: "kbyg-3", point: "Personal expenses and mandatory hotel taxes (if any) will have to be paid by you at the destination." },
      { id: "kbyg-4", point: "ID proof is mandatory for each individual guest at the time of booking and also upon arrival." },
    ],
    additionalInfo: {
      aboutDestination: "Known as the 'Island of the Gods', Bali is renowned for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs. The island is home to religious sites such as cliffside Uluwatu Temple. To the south, the beachside town of Kuta is known for surfing, nightlife and shops.",
      quickInfo: { destinationsCovered: "Seminyak, Ubud, Nusa Penida", duration: "5 Days, 4 Nights", startPoint: "Ngurah Rai International Airport (DPS)", endPoint: "Ngurah Rai International Airport (DPS)" },
      experiencesCovered: ["Sunrise yoga on the beach at Seminyak", "Kelingking Beach T-Rex viewpoint on Nusa Penida", "Authentic Balinese cooking class in Ubud", "Speedboat island hopping"],
      notToMiss: ["Witness the Kecak fire dance at Uluwatu Temple", "Explore the Sacred Monkey Forest Sanctuary", "Visit Tegalalang Rice Terraces at sunrise"],
    },
    faqs: [
      { id: "faq-1", question: "Are international flights included?", answer: "No, international airfare is not included. The package covers all local transfers, accommodation, and listed activities. We recommend booking flights to Ngurah Rai International Airport (DPS)." },
      { id: "faq-2", question: "What is the best time to visit Bali?", answer: "October to March is ideal — warm weather, clear skies, and festive energy. Our package runs during these peak months for the best experience." },
      { id: "faq-3", question: "Is this package suitable for solo travelers?", answer: "Absolutely. You'll have your own private villa room and a dedicated guide throughout. Solo supplements may apply — please enquire at booking." },
    ],
    itinerary: [
      {
        id: "d1", dayNumber: 1, title: "Arrival & Welcome", city: "Seminyak", dayType: "arrival", mealsIncluded: ["Dinner"], notes: "Private airport transfer included.", description: "",
        hotelStays: [{ id: "dh1", hotelRef: "mh-001", customRoomType: "Private Pool Villa", checkInTime: "15:00", checkOutTime: "11:00", customNotes: "Welcome fruit basket.", customImages: [], mealInclusions: { breakfast: true, lunch: false, dinner: true } }],
        transfers: [{ id: "dt1", source: "custom", transferId: null, transferType: "Private", vehicleType: "SUV", from: "Ngurah Rai Airport", to: "Seminyak", startTime: "14:00", endTime: "15:00", notes: "Name board at arrivals." }],
        activities: [{ id: "da1", activityRef: "ma-002", time: "06:30", customTitle: "", customDescription: "", customImages: [], guideIncluded: true, ticketIncluded: false, coverTitle: "Start your day right" }]
      },
      {
        id: "d2", dayNumber: 2, title: "Temples & Rice Terraces", city: "Ubud", dayType: "sightseeing", mealsIncluded: ["Breakfast", "Lunch"], notes: "Wear modest clothing.", description: "",
        hotelStays: [{ id: "dh2", hotelRef: "mh-003", customRoomType: "Uma Suite", checkInTime: "14:00", checkOutTime: "11:00", customNotes: "", customImages: [], mealInclusions: { breakfast: true, lunch: true, dinner: false } }],
        transfers: [{ id: "dt2", source: "custom", transferId: null, transferType: "Private", vehicleType: "Sedan", from: "Seminyak", to: "Ubud", startTime: "08:00", endTime: "09:00", notes: "" }],
        activities: [
          { id: "da2", activityRef: "ma-003", time: "09:30", customTitle: "", customDescription: "", customImages: [], guideIncluded: true, ticketIncluded: true, coverTitle: "" },
          { id: "da3", activityRef: "ma-004", time: "14:00", customTitle: "", customDescription: "", customImages: [], guideIncluded: false, ticketIncluded: false, coverTitle: "" },
        ]
      },
      { id: "d3", dayNumber: 3, title: "Beach Leisure", city: "Seminyak", dayType: "leisure", mealsIncluded: ["Breakfast"], notes: "", description: "", hotelStays: [{ id: "dh3", hotelRef: "mh-001", customRoomType: "", checkInTime: "14:00", checkOutTime: "11:00", customNotes: "", customImages: [], mealInclusions: { breakfast: true, lunch: false, dinner: false } }], transfers: [], activities: [] },
      {
        id: "d4", dayNumber: 4, title: "Island Adventure", city: "Nusa Penida", dayType: "sightseeing", mealsIncluded: ["Breakfast", "Lunch"], notes: "Speedboat at 7:30 AM.", description: "",
        hotelStays: [{ id: "dh4", hotelRef: "mh-001", customRoomType: "", checkInTime: "14:00", checkOutTime: "11:00", customNotes: "", customImages: [], mealInclusions: { breakfast: true, lunch: false, dinner: false } }],
        transfers: [{ id: "dt3", source: "custom", transferId: null, transferType: "Private", vehicleType: "Speedboat", from: "Sanur Beach", to: "Nusa Penida", startTime: "07:30", endTime: "08:15", notes: "" }],
        activities: [{ id: "da4", activityRef: "ma-003", time: "09:00", customTitle: "", customDescription: "", customImages: [], guideIncluded: true, ticketIncluded: true, coverTitle: "Jaw-dropping vistas" }]
      },
      {
        id: "d5", dayNumber: 5, title: "Departure", city: "Denpasar", dayType: "departure", mealsIncluded: ["Breakfast"], notes: "Check-out 11 AM.", description: "",
        hotelStays: [], transfers: [{ id: "dt4", source: "custom", transferId: null, transferType: "Private", vehicleType: "SUV", from: "Seminyak", to: "Airport", startTime: "12:30", endTime: "13:15", notes: "" }], activities: []
      },
    ],
    createdAt: "2025-01-15",
  },
];

// ─── BASE UI PRIMITIVES ───────────────────────────────────────────
export const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={cls("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", className)}>{children}</span>
);
export const Inp = ({ className = "", ...p }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cls("w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 placeholder:text-gray-400 transition-all", className)} {...p} />
);
export const TA = ({ className = "", rows = 3, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea rows={rows} className={cls("w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 placeholder:text-gray-400 transition-all resize-none", className)} {...p} />
);
export const Sel = ({ options, placeholder, value, onChange, className = "" }: { options: (string | { label: string; value: string })[]; placeholder?: string; value?: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; className?: string }) => (
  <select value={value || ""} onChange={onChange}
    className={cls("w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all cursor-pointer", !value ? "text-gray-400" : "text-gray-900", className)}>
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {options.map(o => {
      const label = typeof o === "string" ? o : o.label;
      const val = typeof o === "string" ? o : o.value;
      return <option key={val} value={val}>{label}</option>;
    })}
  </select>
);
export const Card = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={cls("bg-white rounded-xl border border-gray-100 shadow-sm", className)} {...props}>
    {children}
  </div>
);
export const FL = ({ children, required, optional, className }: { children: React.ReactNode; required?: boolean; optional?: boolean; className?: string }) => (
  <label className={cls("block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5", className)}>
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}{optional && <span className="ml-1 text-gray-400 font-normal normal-case">(optional)</span>}
  </label>
);

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost" | "outline" | "soft" | "dashed" | "d-em" | "d-am";
  size?: "xs" | "sm" | "md" | "lg";
}

export const Btn = ({ variant = "primary", size = "md", className = "", children, ...p }: BtnProps) => {
  const sz = { xs: "px-2 py-1 text-xs", sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-2.5 text-sm" };
  const va = {
    primary: "bg-blue-950 text-white hover:bg-blue-900 shadow-sm",
    secondary: "bg-white text-blue-950 border border-blue-950 hover:bg-blue-50",
    success: "bg-emerald-700 text-white hover:bg-emerald-600 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-500",
    ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
    outline: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    soft: "bg-blue-50 text-blue-900 hover:bg-blue-100",
    dashed: "bg-white text-blue-900 border-2 border-dashed border-blue-300 hover:bg-blue-50",
    "d-em": "bg-white text-emerald-800 border-2 border-dashed border-emerald-300 hover:bg-emerald-50",
    "d-am": "bg-white text-amber-800 border-2 border-dashed border-amber-300 hover:bg-amber-50",
  };
  return <button className={cls("inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none disabled:opacity-50 gap-1.5 whitespace-nowrap", sz[size], va[variant], className)} {...p}>{children}</button>;
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}

export const Modal = ({ open, onClose, title, children, wide = false }: ModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cls("relative bg-white rounded-2xl shadow-2xl w-full overflow-hidden", wide ? "max-w-3xl" : "max-w-2xl")} style={{ maxHeight: "90vh" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 text-lg">✕</button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 65px)" }}>{children}</div>
      </div>
    </div>
  );
};

// ─── ICONS ────────────────────────────────────────────────────────
export const Ic = {
  Dashboard: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Package: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>,
  Activity: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Hotel: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Plus: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Trash: (p: any) => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Edit: (p: any) => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Eye: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Search: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Back: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  Chevron: ({ open, ...p }: any) => <svg className={cls("w-4 h-4 transition-transform", open && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  Globe: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" strokeWidth={2} d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
  Arrow: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>,
  MapPin: (p: any) => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Clock: (p: any) => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>,
  Car: (p: any) => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16H7m9.293-9H6l-3 6h18l-1-4.5H16.29" /></svg>,
  Star: (p: any) => <svg className="w-3.5 h-3.5 fill-amber-400 text-amber-400" viewBox="0 0 24 24" {...p}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  Link: (p: any) => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  Sync: (p: any) => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Info: (p: any) => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01" /></svg>,
  Summary: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  Check: (p: any) => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>,
  X: (p: any) => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>,
  Flame: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>,
  Tag: (p: any) => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  Booking: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Document: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Logout: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Close: (p: any) => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...p}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
};

// ─── IMAGE UPLOADER ───────────────────────────────────────────────
interface ImageUploaderProps {
  images?: string[];
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
  label?: string;
}

export const ImageUploader = ({ images = [], onAdd, onRemove, label = "Images" }: ImageUploaderProps) => {

  const ref = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];

    for (const file of files) {

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "aventara");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dpq1lw5zb/image/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();

      onAdd(data.secure_url);
    }

    e.target.value = "";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <FL>{label}</FL>
        <Btn variant="outline" size="xs" onClick={() => ref.current?.click()}>
          + Add
        </Btn>

        <input
          ref={ref}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      {images.length === 0 ? (
        <div
          onClick={() => ref.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all"
        >
          <p className="text-xs text-gray-400">Click to upload images</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img src={url} className="w-full h-full object-cover" />

              <button
                onClick={() => onRemove(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
                  <Ic.X />
                </div>
              </button>
            </div>
          ))}

          <div
            onClick={() => ref.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-300 transition-all text-gray-400"
          >
            <Ic.Plus />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MASTER ACTIVITY FORM ─────────────────────────────────────────
const MasterActivityForm = ({ initial, onSave, onClose }) => {
  const { destinations } = useAppSelector(state => state.destinations);
  const [form, setForm] = useState(initial || emptyMasterActivity());
  const [tagIn, setTagIn] = useState("");
  const [highIn, setHighIn] = useState("");

  useEffect(() => {
    setForm(initial || emptyMasterActivity());
  }, [initial]);

  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }));
  
  return (
    <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FL required>Activity Title</FL>
          <Inp placeholder="e.g. Amber Fort Guided Tour" value={form.title} onChange={e => upd("title", e.target.value)} />
        </div>
        
        <div>
          <FL>Destination Link</FL>
          <Sel 
            placeholder="Link to destination…" 
            options={destinations.map(d => ({ label: d.name, value: d.slug }))} 
            value={form.destinationSlug || ""} 
            onChange={e => upd("destinationSlug", e.target.value)} 
          />
        </div>
        
        <div><FL>Activity Type</FL><Sel options={OPTIONS.activityType} value={form.activityType} onChange={e => upd("activityType", e.target.value)} /></div>
        
        <div><FL>State</FL><Inp placeholder="e.g. Rajasthan" value={form.state || ""} onChange={e => upd("state", e.target.value)} /></div>
        <div><FL>Country</FL><Inp placeholder="e.g. India" value={form.country || ""} onChange={e => upd("country", e.target.value)} /></div>
        
        <div><FL>Default Duration</FL><Inp placeholder="e.g. 2 hrs" value={form.defaultDuration} onChange={e => upd("defaultDuration", e.target.value)} /></div>
        <div>
          <FL>Rating (1-5)</FL>
          <Inp type="number" min="1" max="5" step="0.1" value={form.rating || ""} onChange={e => upd("rating", parseFloat(e.target.value))} />
        </div>

        <div className="col-span-2"><FL>Location / Address</FL><Inp placeholder="e.g. Jaipur, Rajasthan" value={form.location} onChange={e => upd("location", e.target.value)} /></div>

        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 col-span-2 grid grid-cols-2 gap-4">
          <div>
            <FL>Base Price ({getCurrSym("INR")})</FL>
            <Inp type="number" value={form.price || ""} onChange={e => upd("price", parseFloat(e.target.value))} />
          </div>
          <div>
            <FL>Discounted Price</FL>
            <Inp type="number" value={form.discountPrice || ""} onChange={e => upd("discountPrice", parseFloat(e.target.value))} />
          </div>
        </div>

        <div className="col-span-2"><FL>Description</FL><TA placeholder="Full description…" value={form.description} onChange={e => upd("description", e.target.value)} rows={3} /></div>
      </div>

      <div>
        <FL optional>Highlights (Key points)</FL>
        <div className="flex gap-2 mb-2">
          <Inp placeholder="e.g. Expert guided tour" value={highIn} onChange={e => setHighIn(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && highIn.trim()) { e.preventDefault(); upd("highlights", [...(form.highlights || []), highIn.trim()]); setHighIn(""); } }} />
          <Btn variant="outline" size="sm" onClick={() => { if (highIn.trim()) { upd("highlights", [...(form.highlights || []), highIn.trim()]); setHighIn(""); } }}>Add</Btn>
        </div>
        <div className="space-y-1.5">
          {(form.highlights || []).map((h, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-200">
              <span className="flex-1 line-clamp-1">{h}</span>
              <button onClick={() => upd("highlights", form.highlights.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><Ic.X /></button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <FL optional>Tags</FL>
        <div className="flex gap-2 mb-2">
          <Inp placeholder="e.g. Heritage" value={tagIn} onChange={e => setTagIn(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && tagIn.trim()) { e.preventDefault(); upd("tags", [...form.tags, tagIn.trim()]); setTagIn(""); } }} />
          <Btn variant="outline" size="sm" onClick={() => { if (tagIn.trim()) { upd("tags", [...form.tags, tagIn.trim()]); setTagIn(""); } }}>Add</Btn>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {form.tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg text-xs font-medium border border-blue-200">
              <Ic.Tag />{tag}
              <button onClick={() => upd("tags", form.tags.filter((_, j) => j !== i))} className="text-blue-400 hover:text-red-500 ml-0.5"><Ic.X /></button>
            </span>
          ))}
        </div>
      </div>

      <ImageUploader images={form.images} onAdd={url => upd("images", [...form.images, url])} onRemove={i => upd("images", form.images.filter((_, j) => j !== i))} />
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={cls("w-10 h-5 rounded-full relative transition-all", form.isEnabled !== false ? "bg-emerald-500" : "bg-gray-300")}>
            <div className={cls("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", form.isEnabled !== false ? "right-1" : "left-1")} />
          </div>
          <input type="checkbox" className="sr-only" checked={form.isEnabled !== false} onChange={e => upd("isEnabled", e.target.checked)} />
          <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Enabled for Frontend</span>
        </label>
        <div className="flex gap-3">
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn variant="success" onClick={() => { if (form.title.trim()) onSave(form); }}>Save Activity</Btn>
        </div>
      </div>
    </div>
  );
};

// ─── MASTER HOTEL FORM ────────────────────────────────────────────
const MasterHotelForm = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial || emptyMasterHotel());

  useEffect(() => {
    setForm(initial || emptyMasterHotel());
  }, [initial]);

  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }));
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><FL required>Hotel Name</FL><Inp placeholder="e.g. The Taj Lake Palace" value={form.hotelName} onChange={e => upd("hotelName", e.target.value)} /></div>
        <div><FL>City</FL><Inp placeholder="e.g. Udaipur, Rajasthan" value={form.city} onChange={e => upd("city", e.target.value)} /></div>
        <div>
          <FL>Star Rating</FL>
          <div className="flex gap-2">
            {OPTIONS.starRating.map(s => (
              <button key={s} type="button" onClick={() => upd("starRating", s)} className={cls("flex-1 py-2 text-sm font-bold rounded-lg border transition-all", form.starRating === s ? "bg-amber-400 text-white border-amber-400" : "bg-white text-gray-500 border-gray-200 hover:border-amber-300")}>{s}★</button>
            ))}
          </div>
        </div>
        <div className="col-span-2"><FL>Description</FL><TA placeholder="What makes this hotel special…" value={form.description} onChange={e => upd("description", e.target.value)} rows={2} /></div>
      </div>
      <div>
        <FL>Room Types</FL>
        <Sel options={OPTIONS.roomType.filter(r => !form.roomTypes.includes(r))} placeholder="Select room type to add" value="" onChange={e => { if (e.target.value) upd("roomTypes", [...form.roomTypes, e.target.value]); }} />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {form.roomTypes.map((r, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200">
              {r}<button onClick={() => upd("roomTypes", form.roomTypes.filter((_, j) => j !== i))} className="text-emerald-400 hover:text-red-500"><Ic.X /></button>
            </span>
          ))}
        </div>
      </div>
      <div>
        <FL>Amenities</FL>
        <div className="grid grid-cols-3 gap-1.5 mt-1">
          {OPTIONS.amenities.map(a => {
            const has = form.amenities.includes(a);
            return (
              <label key={a} className={cls("flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all text-xs font-medium", has ? "bg-blue-950 text-white border-blue-950" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300")}>
                <input type="checkbox" className="sr-only" checked={has} onChange={e => upd("amenities", e.target.checked ? [...form.amenities, a] : form.amenities.filter(x => x !== a))} />
                {a}
              </label>
            );
          })}
        </div>
      </div>
      <ImageUploader images={form.images} onAdd={url => upd("images", [...form.images, url])} onRemove={i => upd("images", form.images.filter((_, j) => j !== i))} />
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="success" onClick={() => { if (form.hotelName.trim()) onSave(form); }}>Save Hotel</Btn>
      </div>
    </div>
  );
};

// ─── ACTIVITY PAGE FORM ───────────────────────────────────────────


// ─── ACTIVITY PAGES LISTING ───────────────────────────────────────


// ─── MASTER ACTIVITIES PAGE ───────────────────────────────────────
export const MasterActivitiesPage = () => {
  const dispatch = useAppDispatch();
  const { masterActivities } = useAppSelector(state => state.activities);
  const { packages } = useAppSelector(state => state.packages);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; data: MasterActivity | null } | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  const filtered = masterActivities.filter(a => {
    const q = search.toLowerCase();
    return (!q || a.title.toLowerCase().includes(q) || a.location?.toLowerCase().includes(q)) && (!filterType || a.activityType === filterType);
  });

  const usageCount = useMemo(() => {
    const map: Record<string, number> = {};
    masterActivities.forEach(a => { map[a._id] = 0; });
    packages.forEach(pkg => pkg.itinerary?.forEach(day => day.activities?.forEach(act => {
      if (act.activityRef && map[act.activityRef] !== undefined) map[act.activityRef]++;
    })));
    return map;
  }, [masterActivities, packages]);

  const handleSave = async (data: MasterActivity) => {
    if (modal?.mode === "create") {
      dispatch(createActivity(data));
    } else {
      dispatch(updateActivity(data));
    }
    setModal(null);
  };

  const handleDelete = async (id: string) => {
    const count = usageCount[id] || 0;

    if (!window.confirm(
      count > 0
        ? `Used in ${count} package(s). Continue?`
        : "Delete this master activity?"
    )) return;

    dispatch(deleteActivity(id));
  };

  const typeCls: Record<string, string> = { meal: "text-amber-700 bg-amber-50 border-amber-200", sightseeing: "text-blue-700 bg-blue-50 border-blue-200", adventure: "text-emerald-700 bg-emerald-50 border-emerald-200", transfer: "text-orange-700 bg-orange-50 border-orange-200", leisure: "text-violet-700 bg-violet-50 border-violet-200", wellness: "text-pink-700 bg-pink-50 border-pink-200", shopping: "text-rose-700 bg-rose-50 border-rose-200" };

  return (
    <div className="space-y-5">

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Ic.Search /></div><Inp className="pl-9" placeholder="Search activities…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Sel className="w-40" options={OPTIONS.activityType} placeholder="All Types" value={filterType} onChange={e => setFilterType(e.target.value)} />
        {filterType && <Btn variant="ghost" size="sm" onClick={() => setFilterType("")}>Clear</Btn>}
        <Btn className="ml-auto" onClick={() => setModal({ mode: "create", data: null })}><Ic.Plus />New Activity</Btn>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-xl"><p className="text-gray-400 text-sm">No activities found</p></div>}
        {filtered.map(act => {
          const usage = usageCount[act._id] || 0;
          return (
            <Card key={act._id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={cls("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm", ACT_BADGE[act.activityType as keyof typeof ACT_BADGE])}><Ic.Activity /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900">{act.title}</h3>
                      <Badge className={cls("border", typeCls[act.activityType] || "bg-gray-50 text-gray-600 border-gray-200")}>{act.activityType}</Badge>
                      {usage > 0 && <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold"><Ic.Link />Used in {usage} pkg</span>}
                    </div>
                    {act.location && <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Ic.MapPin />{act.location}</p>}
                    {act.defaultDuration && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Ic.Clock />{act.defaultDuration}</p>}
                    {act.description && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{act.description}</p>}
                    {act.tags?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{act.tags.map(t => <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>)}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setModal({ mode: "edit", data: act })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Ic.Edit /></button>
                  <button onClick={() => handleDelete(act._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Ic.Trash /></button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 text-center">{masterActivities.length} master activities · {Object.values(usageCount).reduce((a, b) => Number(a) + Number(b), 0)} total usages</p>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "create" ? "Create Master Activity" : "Edit Master Activity"}>
        <MasterActivityForm initial={modal?.data} onSave={handleSave} onClose={() => setModal(null)} />
      </Modal>
    </div>
  );
};


// ─── MASTER HOTELS PAGE ───────────────────────────────────────────
export const MasterHotelsPage = () => {
  const dispatch = useAppDispatch();
  const { masterHotels } = useAppSelector(state => state.hotels);
  const { packages } = useAppSelector(state => state.packages);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; data: MasterHotel | null } | null>(null);
  const [search, setSearch] = useState("");

  const filtered = masterHotels.filter(h => !search || h.hotelName.toLowerCase().includes(search.toLowerCase()) || (h.city && h.city.toLowerCase().includes(search.toLowerCase())));

  const usageCount = useMemo(() => {
    const map: Record<string, number> = {};
    masterHotels.forEach(h => { map[h._id] = 0; });
    packages.forEach(pkg => pkg.itinerary?.forEach(day => day.hotelStays?.forEach(hs => {
      if (hs.hotelRef && map[hs.hotelRef] !== undefined) map[hs.hotelRef]++;
    })));
    return map;
  }, [masterHotels, packages]);

  const handleSave = async (data: MasterHotel) => {
    if (modal?.mode === "create") {
      dispatch(createHotel(data));
    } else {
      dispatch(updateHotel(data));
    }
    setModal(null);
  };

  const handleDelete = async (id: string) => {
    const count = usageCount[id] || 0;

    if (!window.confirm(
      count > 0
        ? `Used in ${count} package(s). Continue?`
        : "Delete this hotel?"
    )) return;

    dispatch(deleteHotel(id));
  };

  return (
    <div className="space-y-5">

      <div className="flex items-center gap-3">
        <div className="relative flex-1"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Ic.Search /></div><Inp className="pl-9" placeholder="Search hotels, cities…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Btn onClick={() => setModal({ mode: "create", data: null })}><Ic.Plus />New Hotel</Btn>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-xl"><p className="text-gray-400 text-sm">No hotels found</p></div>}
        {filtered.map(hotel => {
          const usage = usageCount[hotel._id] || 0;
          return (
            <Card key={hotel._id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0"><Ic.Hotel /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900">{hotel.hotelName}</h3>
                      <div className="flex">{Array.from({ length: Number(hotel.starRating) || 0 }).map((_, i) => <Ic.Star key={i} />)}</div>
                      {usage > 0 && <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold"><Ic.Link />Used in {usage} pkg</span>}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Ic.MapPin />{hotel.city}</p>
                    {hotel.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{hotel.description}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">{hotel.roomTypes?.map(r => <span key={r} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{r}</span>)}</div>
                    {hotel.amenities?.length > 0 && <p className="text-xs text-gray-400 mt-1.5">{hotel.amenities.slice(0, 4).join(" · ")}{hotel.amenities.length > 4 ? ` +${hotel.amenities.length - 4} more` : ""}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setModal({ mode: "edit", data: hotel })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Ic.Edit /></button>
                  <button onClick={() => handleDelete(hotel._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Ic.Trash /></button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "create" ? "Create Master Hotel" : "Edit Master Hotel"} wide>
        <MasterHotelForm initial={modal?.data} onSave={handleSave} onClose={() => setModal(null)} />
      </Modal>
    </div>
  );
};


// ─── DESTINATION FORM ──────────────────────────────────────────
export const DestinationForm = ({ initial, onSave, onCancel }) => {
  const [data, setData] = useState(initial || { name: "", slug: "", image: "", description: "", isEnabled: true, isTrending: false, category: "India" });
  
  const slugify = (text: string) => text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  const upd = (f, v) => setData(p => ({ ...p, [f]: v }));

  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FL required>Name</FL>
          <Inp 
            placeholder="e.g. Dubai" 
            value={data.name || ""} 
            onChange={e => setData({ 
              ...data, 
              name: e.target.value, 
              slug: slugify(e.target.value) 
            })} 
          />
        </div>
        <div>
          <FL required>Slug</FL>
          <Inp 
            placeholder="e.g. dubai" 
            value={data.slug || ""} 
            onChange={e => upd("slug", slugify(e.target.value))} 
          />
        </div>
      </div>
      
      <div><FL>Description</FL><TA value={data.description || ""} onChange={e => upd("description", e.target.value)} rows={3} placeholder="A brief overview of this destination..." /></div>
      
      <div>
        <FL>Hero Image</FL>
        <div className="space-y-3">
          <Inp value={data.image || ""} onChange={e => upd("image", e.target.value)} placeholder="Enter image URL..." />
          <ImageUploader 
            images={data.image ? [data.image] : []} 
            onAdd={url => upd("image", url)} 
            onRemove={() => upd("image", "")} 
          />
        </div>
      </div>

      {/* ─── Trending & Category ─── */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <FL>Category</FL>
          <div className="flex gap-2 mt-1">
            {(["India", "International"] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => upd("category", cat)}
                className={cls(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all",
                  data.category === cat
                    ? cat === "India"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                )}
              >
                {cat === "India" ? "🇮🇳 India" : "🌍 International"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-3 cursor-pointer group pb-1">
            <div className={cls("w-10 h-5 rounded-full relative transition-all", data.isTrending ? "bg-amber-500" : "bg-gray-300")}>
              <div className={cls("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", data.isTrending ? "right-1" : "left-1")} />
            </div>
            <input type="checkbox" className="sr-only" checked={!!data.isTrending} onChange={e => upd("isTrending", e.target.checked)} />
            <div>
              <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors block">Trending</span>
              <span className="text-[10px] text-gray-400">Show on homepage</span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={cls("w-10 h-5 rounded-full relative transition-all", data.isEnabled !== false ? "bg-blue-600" : "bg-gray-300")}>
              <div className={cls("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", data.isEnabled !== false ? "right-1" : "left-1")} />
            </div>
            <input type="checkbox" className="sr-only" checked={data.isEnabled !== false} onChange={e => upd("isEnabled", e.target.checked)} />
            <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Searchable</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={cls("w-10 h-5 rounded-full relative transition-all", data.isActive !== false ? "bg-emerald-500" : "bg-gray-300")}>
              <div className={cls("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", data.isActive !== false ? "right-1" : "left-1")} />
            </div>
            <input type="checkbox" className="sr-only" checked={data.isActive !== false} onChange={e => upd("isActive", e.target.checked)} />
            <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Active Status</span>
          </label>
        </div>
        <div className="flex gap-3">
          <Btn variant="outline" onClick={onCancel}>Cancel</Btn>
          <Btn variant="success" onClick={() => { if (data.name.trim()) onSave(data); }}>Save Changes</Btn>
        </div>
      </div>
    </div>
  );
};

// ─── REGION FORM ──────────────────────────────────────────────
export const RegionForm = ({ initial, onSave, onCancel }) => {
  const [data, setData] = useState(initial || { name: "", icon: "📍", order: 0, isActive: true });
  
  const upd = (f, v) => setData(p => ({ ...p, [f]: v }));

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <FL required>Region Name</FL>
          <Inp 
            placeholder="e.g. South East Asia" 
            value={data.name || ""} 
            onChange={e => upd("name", e.target.value)} 
          />
        </div>
        <div>
          <FL required>Icon / Emoji</FL>
          <Inp 
            placeholder="📍" 
            value={data.icon || ""} 
            onChange={e => upd("icon", e.target.value)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FL>Display Order</FL>
          <Inp 
            type="number" 
            value={data.order || 0} 
            onChange={e => upd("order", parseInt(e.target.value) || 0)} 
          />
        </div>
        <div className="flex items-end pb-2">
           <label className="flex items-center gap-3 cursor-pointer group">
              <div className={cls("w-10 h-5 rounded-full relative transition-all", data.isActive !== false ? "bg-emerald-500" : "bg-gray-300")}>
                <div className={cls("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", data.isActive !== false ? "right-1" : "left-1")} />
              </div>
              <input type="checkbox" className="sr-only" checked={data.isActive !== false} onChange={e => upd("isActive", e.target.checked)} />
              <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Active for Frontend</span>
           </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
        <Btn variant="outline" onClick={onCancel}>Cancel</Btn>
        <Btn variant="success" onClick={() => { if (data.name.trim()) onSave(data); }}>Save Region</Btn>
      </div>
    </div>
  );
};

export const ActivityRefSelector = ({ value, onChange, label, className = "" }: { value: string | null; onChange: (id: string | null) => void; label?: string; className?: string }) => {
  const { masterActivities } = useAppSelector(state => state.activities);
  return (
    <div className={className}>
      {label && <FL>{label}</FL>}
      <Sel 
        placeholder="— Select from catalog —"
        options={masterActivities.map(a => ({ label: a.title, value: a._id }))}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
};

export const HotelRefSelector = ({ value, onChange, label, className = "" }: { value: string | null; onChange: (id: string | null) => void; label?: string; className?: string }) => {
  const { masterHotels } = useAppSelector(state => state.hotels);
  return (
    <div className={className}>
      {label && <FL>{label}</FL>}
      <Sel 
        placeholder="— Select from catalog —"
        options={masterHotels.map(h => ({ label: h.hotelName, value: h._id }))}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
};

export const TransferRefSelector = ({ value, onChange, label, className = "" }: { value: string | null; onChange: (id: string | null) => void; label?: string; className?: string }) => {
  const { transfers } = useAppSelector(state => state.transfers);
  return (
    <div className={className}>
      {label && <FL>{label}</FL>}
      <Sel 
        placeholder="— Select from routes —"
        options={transfers.map(t => ({ label: `${t.pickupLocation} → ${t.dropLocation}`, value: t._id }))}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
};

export const QuickPackageBuilder = ({ onAdd }: { onAdd: (p: Package) => void }) => {
  const { masterActivities } = useAppSelector(state => state.activities);
  const { masterHotels } = useAppSelector(state => state.hotels);
  const { transfers } = useAppSelector(state => state.transfers);
  // Implementation...
};

const ActivityPicker = ({ dayAct, dayId, onUpdate, onRemove }) => {
  const { masterActivities } = useAppSelector(state => state.activities);
  const [open, setOpen] = useState(true);
  const resolved = resolveActivity(dayAct, masterActivities);
  const upd = (f, v) => onUpdate(dayId, dayAct.id, f, v);
  return (
    <div className="border border-blue-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border-b border-blue-100">
        <div className={cls("w-2.5 h-2.5 rounded-full flex-shrink-0", ACT_DOT[resolved.activityType] || "bg-gray-400")} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-blue-900 truncate">{resolved.title}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-500 font-mono">{fmt12(dayAct.time)}</span>
            {resolved.isLinked && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5"><Ic.Sync />Master Linked</span>}
          </div>
        </div>
        <button onClick={() => setOpen(o => !o)} className="p-1 text-blue-500 hover:bg-blue-100 rounded-lg"><Ic.Chevron open={open} /></button>
        <button onClick={() => onRemove(dayId, dayAct.id)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg"><Ic.Trash /></button>
      </div>
      {open && (
        <div className="p-4 space-y-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <FL className="text-emerald-700">Link to Master Activity</FL>
            <Sel options={masterActivities.map(a => a.title)} placeholder="— Select from master catalog —"
              value={resolved.masterTitle || ""}
              onChange={e => { const m = masterActivities.find(x => x.title === e.target.value); if (m) { upd("activityRef", m._id); upd("customTitle", ""); upd("customDescription", ""); upd("customImages", []); } }} />
            {resolved.isLinked && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><Ic.Check />Linked: {resolved.masterTitle}</p>
                <button onClick={() => upd("activityRef", null)} className="text-xs text-red-500 hover:underline">Unlink</button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><FL>Activity Time</FL><Inp type="time" value={dayAct.time} onChange={e => upd("time", e.target.value)} /></div>
            <div><FL optional>Cover Title</FL><Inp placeholder="Gallery section heading" value={dayAct.coverTitle || ""} onChange={e => upd("coverTitle", e.target.value)} /></div>
          </div>
          {resolved.isLinked && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg flex items-center gap-2"><Ic.Info />Override fields below replace master data for this package only</p>
              <div><FL optional>Custom Title (Override)</FL><Inp placeholder={`Default: "${resolved.masterTitle}"`} value={dayAct.customTitle || ""} onChange={e => upd("customTitle", e.target.value)} /></div>
              <div><FL optional>Custom Description (Override)</FL><TA placeholder="Default from master" value={dayAct.customDescription || ""} onChange={e => upd("customDescription", e.target.value)} rows={2} /></div>
            </div>
          )}
          {!resolved.isLinked && (
            <div className="space-y-3">
              <div><FL>Activity Title</FL><Inp placeholder="e.g. Amber Fort Visit" value={dayAct.customTitle || ""} onChange={e => upd("customTitle", e.target.value)} /></div>
              <div><FL>Description</FL><TA placeholder="Activity description…" value={dayAct.customDescription || ""} onChange={e => upd("customDescription", e.target.value)} rows={2} /></div>
            </div>
          )}
          <div className="flex items-center gap-6 pt-1 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 font-medium"><input type="checkbox" className="w-3.5 h-3.5 rounded accent-blue-900" checked={dayAct.guideIncluded} onChange={e => upd("guideIncluded", e.target.checked)} />Guide Included</label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 font-medium"><input type="checkbox" className="w-3.5 h-3.5 rounded accent-blue-900" checked={dayAct.ticketIncluded} onChange={e => upd("ticketIncluded", e.target.checked)} />Ticket Included</label>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── HOTEL PICKER (two-way sync) ──────────────────────────────────
const HotelPicker = ({ dayHotel, dayId, onUpdate, onRemove }) => {
  const { masterHotels } = useAppSelector(state => state.hotels);
  const [open, setOpen] = useState(true);
  const resolved = resolveHotel(dayHotel, masterHotels);
  const upd = (f, v) => onUpdate(dayId, dayHotel.id, f, v);
  const masterRoomTypes = masterHotels.find(m => m._id === dayHotel.hotelRef)?.roomTypes || OPTIONS.roomType;
  return (
    <div className="border border-emerald-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 border-b border-emerald-100">
        <div className="text-emerald-700"><Ic.Hotel /></div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-900 truncate">{resolved.hotelName}</p>
          <div className="flex items-center gap-2">
            {resolved.city && <span className="text-xs text-emerald-600 flex items-center gap-0.5"><Ic.MapPin />{resolved.city}</span>}
            {resolved.isLinked && <span className="text-xs bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5"><Ic.Sync />Linked</span>}
          </div>
        </div>
        <button onClick={() => setOpen(o => !o)} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-lg"><Ic.Chevron open={open} /></button>
        <button onClick={() => onRemove(dayId, dayHotel.id)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg"><Ic.Trash /></button>
      </div>
      {open && (
        <div className="p-4 space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <FL className="text-blue-700">Link to Master Hotel</FL>
            <Sel options={masterHotels.map(h => h.hotelName)} placeholder="— Select from hotel catalog —"
              value={resolved.masterName || ""}
              onChange={(e) => {
                const selectedHotel = masterHotels.find(
                  h => h.hotelName === e.target.value
                );

                if (selectedHotel) {
                  upd("hotelRef", selectedHotel._id);
                  upd("customRoomType", "");
                  upd("customNotes", "");
                  upd("customImages", []);
                }
              }} />
            {resolved.isLinked && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-blue-600 font-medium flex items-center gap-1"><Ic.Check />{resolved.masterName} · {resolved.city}</p>
                <button onClick={() => upd("hotelRef", null)} className="text-xs text-red-500 hover:underline">Unlink</button>
              </div>
            )}
          </div>
          <div>
            <FL>Room Type</FL>
            <Sel options={masterRoomTypes} placeholder="Select room type" value={dayHotel.customRoomType || ""} onChange={e => upd("customRoomType", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><FL>Check-in</FL><Inp type="time" value={dayHotel.checkInTime} onChange={e => upd("checkInTime", e.target.value)} /></div>
            <div><FL>Check-out</FL><Inp type="time" value={dayHotel.checkOutTime} onChange={e => upd("checkOutTime", e.target.value)} /></div>
          </div>

          {/* Meal Inclusions */}
          <div>
            <FL>Meal Inclusions</FL>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[["breakfast", "☕ Breakfast"], ["lunch", "🍽 Lunch"], ["dinner", "🌙 Dinner"]].map(([meal, label]) => {
                const included = dayHotel.mealInclusions?.[meal] || false;
                return (
                  <button key={meal} type="button"
                    onClick={() => upd("mealInclusions", { ...(dayHotel.mealInclusions || {}), [meal]: !included })}
                    className={cls("flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all font-medium text-xs",
                      included ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                    )}>
                    <span className="text-base">{label.split(" ")[0]}</span>
                    <span className="leading-tight text-center">{label.split(" ").slice(1).join(" ")}</span>
                    <span className={cls("text-xs font-bold", included ? "text-emerald-600" : "text-gray-400")}>{included ? "Included" : "Not included"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div><FL optional>Notes</FL><TA placeholder="Check-in instructions, special requests…" value={dayHotel.customNotes || ""} onChange={e => upd("customNotes", e.target.value)} rows={2} /></div>
        </div>
      )}
    </div>
  );
};

// ─── TRANSFER PICKER (manual + existing) ──────────────────────────
const TransferPicker = ({ dayTr, dayId, onUpdate, onRemove }) => {
  const { transfers } = useAppSelector(state => state.transfers);
  const [open, setOpen] = useState(true);
  const resolved = resolveTransfer(dayTr, transfers);
  const upd = (f, v) => onUpdate(dayId, dayTr.id, f, v);

  return (
    <div className="border border-orange-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-orange-50 border-b border-orange-100">
        <div className="text-orange-600"><Ic.Car /></div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-orange-900 truncate">
            {resolved.from || "—"} → {resolved.to || "—"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-orange-500 font-medium">{resolved.vehicleType}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-blue-500 font-mono">{fmt12(dayTr.startTime)}</span>
            {dayTr.source === "existing" ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"><Ic.Check />Linked</span>
            ) : (
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">Custom</span>
            )}
          </div>
        </div>
        <button onClick={() => setOpen(o => !o)} className="p-1 text-orange-500 hover:bg-orange-100 rounded-lg"><Ic.Chevron open={open} /></button>
        <button onClick={() => onRemove(dayId, dayTr.id)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg"><Ic.Trash /></button>
      </div>

      {open && (
        <div className="p-4 space-y-4">
          <div className="flex gap-2 p-1 bg-gray-50 rounded-lg">
            <button type="button" onClick={() => upd("source", "custom")} className={cls("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", dayTr.source === "custom" ? "bg-white text-blue-950 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600")}>Create New</button>
            <button type="button" onClick={() => upd("source", "existing")} className={cls("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", dayTr.source === "existing" ? "bg-white text-blue-950 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600")}>Select Existing</button>
          </div>

          {dayTr.source === "existing" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <FL className="text-blue-700">Link to Existing Transfer</FL>
                <Sel 
                    placeholder="— Select from routes —"
                    options={transfers.map(t => ({ label: `${t.pickupLocation} → ${t.dropLocation} (${t.vehicleType})`, value: t._id || "" }))}
                    value={dayTr.transferId || ""}
                    onChange={e => {
                        const t = transfers.find(x => x._id === e.target.value);
                        if (t) {
                            upd("transferId", t._id);
                            upd("from", t.pickupLocation);
                            upd("to", t.dropLocation);
                            upd("vehicleType", t.vehicleType);
                            if (t.defaultStartTime) upd("startTime", t.defaultStartTime);
                            if (t.defaultEndTime) upd("endTime", t.defaultEndTime);
                        }
                    }}
                />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
             <div className="col-span-2 grid grid-cols-2 gap-3">
                <div><FL>From</FL><Inp placeholder="Pickup" value={dayTr.from} onChange={e => upd("from", e.target.value)} /></div>
                <div><FL>To</FL><Inp placeholder="Drop" value={dayTr.to} onChange={e => upd("to", e.target.value)} /></div>
             </div>
             <div><FL>Transfer Type</FL><Sel options={OPTIONS.transferType} value={dayTr.transferType} onChange={e => upd("transferType", e.target.value)} /></div>
             <div><FL>Vehicle</FL><Sel options={OPTIONS.vehicleType} value={dayTr.vehicleType} onChange={e => upd("vehicleType", e.target.value)} /></div>
             <div><FL>Start Time</FL><Inp type="time" value={dayTr.startTime} onChange={e => upd("startTime", e.target.value)} /></div>
             <div><FL>End Time</FL><Inp type="time" value={dayTr.endTime} onChange={e => upd("endTime", e.target.value)} /></div>
          </div>
          <div><FL optional>Notes</FL><TA placeholder="Special instructions…" value={dayTr.notes || ""} onChange={e => upd("notes", e.target.value)} rows={2} /></div>
        </div>
      )}
    </div>
  );
};

// ─── SUMMARISED VIEW ──────────────────────────────────────────────
const SummarisedView = ({ itinerary, pkg }) => {
  const { masterActivities } = useAppSelector(state => state.activities);
  const { masterHotels } = useAppSelector(state => state.hotels);
  const { transfers } = useAppSelector(state => state.transfers);
  const [openDays, setOpenDays] = useState(() => new Set([itinerary[0]?.id]));
  const toggle = (id) => setOpenDays(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const mealCls = { Breakfast: "bg-amber-100 text-amber-800", Lunch: "bg-orange-100 text-orange-800", Dinner: "bg-rose-100 text-rose-800" };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-blue-950 text-white rounded-xl">
        <div>
          <h2 className="text-sm font-bold">{pkg?.title || "Package"} — Summarised Itinerary</h2>
          <p className="text-xs text-blue-300 mt-0.5">{itinerary.length} days · read-only overview</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" size="sm" className="text-blue-300 hover:text-white hover:bg-white/10" onClick={() => setOpenDays(new Set(itinerary.map(d => d.id)))}>Expand All</Btn>
          <Btn variant="ghost" size="sm" className="text-blue-300 hover:text-white hover:bg-white/10" onClick={() => setOpenDays(new Set())}>Collapse All</Btn>
        </div>
      </div>

      {itinerary.map(day => {
        const isOpen = openDays.has(day.id);
        const rHotels = (day.hotelStays || []).map(h => resolveHotel(h, masterHotels));
        const rActs = (day.activities || []).map(a => ({ ...resolveActivity(a, masterActivities), time: a.time })).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
        const hasItems = rHotels.length + (day.transfers?.length || 0) + rActs.length > 0;
        return (
          <div key={day.id} className="rounded-xl overflow-hidden border border-gray-200">
            <button type="button" onClick={() => toggle(day.id)}
              className={cls("w-full flex items-center gap-4 px-5 py-3.5 text-left bg-gradient-to-r text-white", DAY_GRAD[day.dayType] || "from-blue-950 to-blue-900")}>
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">{day.dayNumber}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{day.title}</span>
                  {day.city && <span className="text-xs opacity-60 flex items-center gap-1"><Ic.MapPin />{day.city}</span>}
                </div>
                <div className="flex items-center gap-4 mt-0.5 text-xs opacity-70">
                  {(day.transfers?.length > 0) && <span className="flex items-center gap-1"><Ic.Car />{day.transfers.length} transfer{day.transfers.length > 1 ? "s" : ""}</span>}
                  {rActs.length > 0 && <span className="flex items-center gap-1"><Ic.Activity />{rActs.length} activit{rActs.length > 1 ? "ies" : "y"}</span>}
                  {rHotels.length > 0 && <span className="flex items-center gap-1"><Ic.Hotel />{rHotels.length} hotel{rHotels.length > 1 ? "s" : ""}</span>}
                  {(day.mealsIncluded?.length > 0) && <span>🍽 {day.mealsIncluded.join(" + ")}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={cls("text-xs px-2.5 py-0.5 rounded-full border font-semibold", DAY_BADGE[day.dayType])}>{day.dayType}</span>
                <Ic.Chevron open={isOpen} />
              </div>
            </button>

            {isOpen && (
              <div className="bg-white divide-y divide-gray-50">
                {day.notes && <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-start gap-2"><div className="text-amber-500 mt-0.5 flex-shrink-0"><Ic.Info /></div><p className="text-xs text-amber-800">{day.notes}</p></div>}

                {/* Day Description */}
                {day.description && (
                  <div className="px-5 py-4 border-b border-gray-50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Day Overview</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{day.description}</p>
                  </div>
                )}

                {/* Meals */}
                {day.mealsIncluded?.length > 0 && (
                  <div className="px-5 py-3 flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500 w-20 flex-shrink-0">Meals</span>
                    <div className="flex gap-2">{day.mealsIncluded.map(m => <span key={m} className={cls("text-xs px-2.5 py-1 rounded-full font-semibold", mealCls[m] || "bg-gray-100 text-gray-700")}>{m}</span>)}</div>
                  </div>
                )}

                {/* Transfers */}
                {(day.transfers?.length > 0) && (
                  <div className="px-5 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center text-orange-600"><Ic.Car /></div>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Transfers ({day.transfers.length})</span>
                    </div>
                    <div className="space-y-2 ml-7">
                      {day.transfers.map(tr => {
                        const resolved = resolveTransfer(tr, transfers);
                        return (
                        <div key={tr.id} className="flex items-center gap-2 text-xs text-gray-700">
                          <span className="font-semibold text-gray-400 w-14 flex-shrink-0">{fmt12(tr.startTime)}</span>
                          <span className="font-semibold truncate max-w-[90px]">{resolved.from || "—"}</span>
                          <div className="flex items-center gap-1 text-orange-400 flex-shrink-0"><div className="w-3 h-px bg-orange-200" /><Ic.Arrow /><div className="w-3 h-px bg-orange-200" /></div>
                          <span className="font-semibold truncate max-w-[90px]">{resolved.to || "—"}</span>
                          <span className={cls("ml-auto text-xs px-2 py-0.5 rounded-full border flex-shrink-0", "bg-orange-50 text-orange-700 border-orange-200")}>{resolved.vehicleType}</span>
                          {resolved.isExistingSource && <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">Linked</span>}
                        </div>
                      ); })}
                    </div>
                  </div>
                )}

                {/* Activities */}
                {rActs.length > 0 && (
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-600"><Ic.Activity /></div>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Activities ({rActs.length})</span>
                    </div>
                    <div className="space-y-4 ml-7">
                      {rActs.map((act, i) => (
                        <div key={act.id || act.activityRef || `${act.title}-${act.time}-${i}`} className="flex items-start gap-3">
                          <span className="text-xs font-mono text-gray-400 w-14 flex-shrink-0 mt-0.5">{fmt12(act.time)}</span>
                          <div className={cls("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", ACT_DOT[act.activityType] || "bg-gray-400")} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-gray-900">{act.title}</span>
                              <span className={cls("text-xs px-1.5 py-0.5 rounded-full", ACT_BADGE[act.activityType])}>{act.activityType}</span>
                              {act.duration && <span className="text-xs text-gray-400 flex items-center gap-0.5"><Ic.Clock />{act.duration}</span>}
                              {act.isLinked && <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-semibold"><Ic.Sync />Master</span>}
                            </div>
                            {act.description && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{act.description.substring(0, 100)}{act.description.length > 100 ? "…" : ""}</p>}
                            <div className="flex gap-2 mt-0.5">
                              {act.guideIncluded && <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5"><Ic.Check />Guide</span>}
                              {act.ticketIncluded && <span className="text-xs text-blue-600 font-medium flex items-center gap-0.5"><Ic.Check />Ticket</span>}
                            </div>
                            {/* Activity Images */}
                            {act.images?.length > 0 && (
                              <div className="mt-2">
                                {act.coverTitle && <p className="text-xs font-semibold text-blue-900 mb-1.5 italic">"{act.coverTitle}"</p>}
                                <div className="grid grid-cols-4 gap-1.5">
                                  {act.images.map((url, j) => (
                                    <div key={j} className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                                      <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hotels */}
                {rHotels.length > 0 && (
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600"><Ic.Hotel /></div>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Staying At ({rHotels.length})</span>
                    </div>
                    <div className="space-y-3 ml-7">
                      {rHotels.map((h) => (
                        <div key={h.id} className="rounded-xl border border-emerald-100 bg-emerald-50/30 overflow-hidden">
                          {/* Hotel image strip */}
                          {h.images?.length > 0 && (
                            <div className={cls("grid gap-1", h.images.length === 1 ? "grid-cols-1" : h.images.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
                              {h.images.slice(0, 3).map((url, j) => (
                                <div key={j} className={cls("overflow-hidden bg-gray-200", h.images.length === 1 ? "h-40" : "h-28")}>
                                  <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                </div>
                              ))}
                              {h.images.length > 3 && (
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg font-semibold">+{h.images.length - 3} more</div>
                              )}
                            </div>
                          )}
                          {/* Hotel info */}
                          <div className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-sm font-bold text-gray-900">{h.hotelName}</span>
                                  {h.starRating && <div className="flex">{Array.from({ length: Number(h.starRating) }).map((_, k) => <svg key={k} className="w-3 h-3 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}</div>}
                                  {h.isLinked && <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-semibold"><Ic.Sync />Master</span>}
                                </div>
                                {h.city && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Ic.MapPin />{h.city}</p>}
                                {h.roomType && <p className="text-xs text-gray-600 font-medium mt-1">🛏 {h.roomType}</p>}
                                {h.notes && <p className="text-xs text-gray-400 mt-1 italic">{h.notes}</p>}
                              </div>
                              <div className="text-right flex-shrink-0 text-xs text-gray-500 space-y-1">
                                <div className="flex items-center gap-1 justify-end"><span>🔑</span><span className="font-semibold">{fmt12(h.checkInTime)}</span></div>
                                <div className="flex items-center gap-1 justify-end"><span>🚪</span><span className="font-semibold">{fmt12(h.checkOutTime)}</span></div>
                              </div>
                            </div>
                            {/* Meal inclusions display */}
                            {h.mealInclusions && (
                              <div className="mt-3 pt-3 border-t border-emerald-100">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Inclusions</p>
                                <div className="grid grid-cols-3 gap-2">
                                  {[["breakfast", "☕", "Breakfast"], ["lunch", "🍽", "Lunch"], ["dinner", "🌙", "Dinner"]].map(([meal, icon, label]) => {
                                    const inc = h.mealInclusions[meal];
                                    return (
                                      <div key={meal} className={cls("flex flex-col items-center gap-1 py-2.5 rounded-xl border", inc ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200")}>
                                        <span className="text-base">{icon}</span>
                                        <span className="text-xs font-semibold text-gray-700">{label}</span>
                                        <div className={cls("flex items-center gap-1 text-xs font-bold", inc ? "text-emerald-600" : "text-gray-400")}>
                                          {inc ? <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Included</> : <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>Not Included</>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!hasItems && <div className="px-5 py-4 text-center text-xs text-gray-400 italic">No activities, hotels or transfers added yet.</div>}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
        <span className="text-xs font-semibold text-gray-500 mr-1">Legend:</span>
        {[["sightseeing", "Sightseeing"], ["meal", "Meal"], ["adventure", "Adventure"], ["leisure", "Leisure"], ["wellness", "Wellness"]].map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-gray-600"><div className={cls("w-2.5 h-2.5 rounded-full", ACT_DOT[type])} />{label}</div>
        ))}
        <div className="flex items-center gap-1 text-xs text-emerald-600 ml-2 font-semibold"><Ic.Sync />=Master linked</div>
      </div>
    </div>
  );
};

// ─── DAY DESCRIPTION FIELD — stable top-level to avoid focus loss on each keystroke ──
const DayDescriptionField = ({ dayId, value, onCommit }) => {
  const [local, setLocal] = useState(value || "");
  const prevId = useRef(dayId);
  if (prevId.current !== dayId) { prevId.current = dayId; setLocal(value || ""); }
  return (
    <textarea
      rows={4}
      placeholder="Describe the full day experience — what travellers will see, do, feel and enjoy. This narrative appears on the package detail page."
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => { if (local !== (value || "")) onCommit(local); }}
      className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 placeholder:text-gray-400 transition-all resize-none leading-relaxed"
    />
  );
};

// ─── ITINERARY BUILDER ────────────────────────────────────────────
const ItineraryBuilder = ({ itinerary, setItinerary }) => {
  const [openDays, setOpenDays] = useState(() => new Set([itinerary[0]?.id]));
  const toggle = (id) => setOpenDays(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const updateDay = (id, f, v) => setItinerary(p => p.map(d => d.id === id ? { ...d, [f]: v } : d));
  const addHotel = (did) => setItinerary(p => p.map(d => d.id === did ? { ...d, hotelStays: [...d.hotelStays, emptyDayHotel()] } : d));
  const removeHotel = (did, hid) => setItinerary(p => p.map(d => d.id === did ? { ...d, hotelStays: d.hotelStays.filter(h => h.id !== hid) } : d));
  const updateHotel = (did, hid, f, v) => setItinerary(p => p.map(d => d.id === did ? { ...d, hotelStays: d.hotelStays.map(h => h.id === hid ? { ...h, [f]: v } : h) } : d));
  const addAct = (did) => setItinerary(p => p.map(d => d.id === did ? { ...d, activities: [...d.activities, emptyDayActivity()] } : d));
  const removeAct = (did, aid) => setItinerary(p => p.map(d => d.id === did ? { ...d, activities: d.activities.filter(a => a.id !== aid) } : d));
  const updateAct = (did, aid, f, v) => setItinerary(p => p.map(d => d.id === did ? { ...d, activities: d.activities.map(a => a.id === aid ? { ...a, [f]: v } : a) } : d));
  const addTr = (did) => setItinerary(p => p.map(d => d.id === did ? { ...d, transfers: [...d.transfers, emptyTransfer()] } : d));
  const removeTr = (did, tid) => setItinerary(p => p.map(d => d.id === did ? { ...d, transfers: d.transfers.filter(t => t.id !== tid) } : d));
  const updateTr = (did, tid, f, v) => setItinerary(p => p.map(d => d.id === did ? { ...d, transfers: d.transfers.map(t => t.id === tid ? { ...t, [f]: v } : t) } : d));

  if (itinerary.length === 0) return (
    <div className="py-12 text-center border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/40">
      <p className="text-sm font-bold text-blue-900">Select trip duration to generate days</p>
      <p className="text-xs text-gray-400 mt-1">Days auto-generate based on duration selection</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
        <Ic.Sync /><span className="font-bold">{itinerary.length} days</span>
        <span className="text-blue-500">· Hotels & Activities link to Master Catalog · Two-way sync via activityRef/hotelRef</span>
      </div>
      {itinerary.map((day, idx) => {
        const isOpen = openDays.has(day.id);
        return (
          <div key={day.id} className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <button type="button" onClick={() => toggle(day.id)}
              className={cls("w-full flex items-center gap-3 px-5 py-4 bg-gradient-to-r text-white", DAY_GRAD[day.dayType] || "from-blue-950 to-blue-900")}>
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold">{day.dayNumber}</div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-bold text-sm">{day.title || `Day ${day.dayNumber}`}</p>
                <p className="text-xs opacity-60">{day.city && `${day.city} · `}{day.hotelStays.length} hotel · {day.activities.length} activity · {day.transfers.length} transfer</p>
              </div>
              <span className={cls("text-xs px-2.5 py-0.5 rounded-full border font-semibold", DAY_BADGE[day.dayType])}>{day.dayType}</span>
              <Ic.Chevron open={isOpen} />
            </button>

            {isOpen && (
              <div className="bg-white divide-y divide-gray-100">
                {/* Day Info */}
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div><FL>Day Title</FL><Inp value={day.title} onChange={e => updateDay(day.id, "title", e.target.value)} placeholder={`Day ${day.dayNumber}`} /></div>
                  <div><FL>City</FL><Inp value={day.city} onChange={e => updateDay(day.id, "city", e.target.value)} placeholder="e.g. Jaipur" /></div>
                  <div><FL>Day Type</FL><Sel options={OPTIONS.dayType} value={day.dayType} onChange={e => updateDay(day.id, "dayType", e.target.value)} /></div>
                  <div>
                    <FL>Meals Included</FL>
                    <div className="flex items-center gap-3 h-9">
                      {OPTIONS.mealsOptions.map(m => (
                        <label key={m} className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600 font-medium">
                          <input type="checkbox" className="w-3.5 h-3.5 rounded accent-blue-900" checked={(Array.isArray(day.mealsIncluded) ? day.mealsIncluded : []).includes(m)} onChange={e => updateDay(day.id, "mealsIncluded", e.target.checked ? [...(Array.isArray(day.mealsIncluded) ? day.mealsIncluded : []), m] : (Array.isArray(day.mealsIncluded) ? day.mealsIncluded : []).filter((x: string) => x !== m))} />{m}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2"><FL optional>Day Notes</FL><Inp value={day.notes || ""} onChange={e => updateDay(day.id, "notes", e.target.value)} placeholder="Special instructions…" /></div>
                  <div className="col-span-2">
                    <FL optional>Day Description</FL>
                    <DayDescriptionField
                      dayId={day.id}
                      value={day.description}
                      onCommit={v => updateDay(day.id, "description", v)}
                    />
                    {day.description && (
                      <p className="text-xs text-gray-400 mt-1 text-right">{day.description.length} chars</p>
                    )}
                  </div>
                </div>

                {/* Hotels */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-emerald-700 flex items-center justify-center text-white"><Ic.Hotel /></div>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Hotel Stays</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{day.hotelStays.length}</span>
                    </div>
                    <Btn variant="d-em" size="sm" onClick={() => addHotel(day.id)}><Ic.Plus />Add Hotel</Btn>
                  </div>
                  {day.hotelStays.length === 0 && <p className="text-xs text-center text-gray-400 py-4 border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50/30">Click "Add Hotel" to link from master catalog</p>}
                  <div className="space-y-2">{day.hotelStays.map(hs => <HotelPicker key={hs.id} dayHotel={hs} dayId={day.id} onUpdate={(did, hid, f, v) => updateHotel(did, hid, f, v)} onRemove={(did, hid) => removeHotel(did, hid)} />)}</div>
                </div>

                {/* Transfers */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-orange-600 flex items-center justify-center text-white"><Ic.Car /></div>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Transfers</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{day.transfers.length}</span>
                    </div>
                    <Btn variant="d-am" size="sm" onClick={() => addTr(day.id)}><Ic.Plus />Add Transfer</Btn>
                  </div>
                  {day.transfers.length === 0 && <p className="text-xs text-center text-gray-400 py-4 border-2 border-dashed border-orange-200 rounded-xl bg-orange-50/30">No transfers added</p>}
                  <div className="space-y-2">
                    {day.transfers.map(tr => (
                      <TransferPicker key={tr.id} dayTr={tr} dayId={day.id} onUpdate={(did, tid, f, v) => updateTr(did, tid, f, v)} onRemove={(did, tid) => removeTr(did, tid)} />
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-700 flex items-center justify-center text-white"><Ic.Activity /></div>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Activities</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{day.activities.length}</span>
                    </div>
                    <Btn variant="dashed" size="sm" onClick={() => addAct(day.id)}><Ic.Plus />Add Activity</Btn>
                  </div>
                  {day.activities.length === 0 && <p className="text-xs text-center text-gray-400 py-4 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30">Click "Add Activity" to link from master catalog</p>}
                  <div className="space-y-2">{day.activities.map(act => <ActivityPicker key={act.id} dayAct={act} dayId={day.id} onUpdate={updateAct} onRemove={removeAct} />)}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── EDITABLE LIST ITEM (stable identity, avoids re-mount on each keystroke) ─
// Used by Inclusions/Exclusions. Key is item index — stable as long as list doesn't reorder.
const EditableListItem = ({ value, onBlur, onRemove, icon, rowCls, iconCls }) => {
  const [local, setLocal] = useState(value);
  // sync if parent pushes a new value (e.g. after delete re-index)
  const prevRef = useRef(value);
  if (prevRef.current !== value && (document.activeElement as HTMLElement)?.dataset?.itemid !== String(value)) {
    prevRef.current = value;
    setLocal(value);
  }
  return (
    <div className={cls("flex items-center gap-2 px-3 py-2.5 rounded-lg group", rowCls)}>
      <span className={cls("flex-shrink-0 font-bold text-sm", iconCls)}>{icon}</span>
      <input
        type="text"
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => { if (local.trim() !== value) onBlur(local.trim() || value); }}
        className="flex-1 bg-transparent text-sm text-gray-900 font-medium focus:outline-none border-none min-w-0 placeholder:text-gray-400"
        placeholder="Type here…"
      />
      <button
        type="button"
        onClick={onRemove}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors rounded opacity-0 group-hover:opacity-100"
      ><Ic.Trash /></button>
    </div>
  );
};

// ─── INCLUSIONS & EXCLUSIONS SECTION ─────────────────────────────
const InclusionsExclusionsSection = ({ inclusions, exclusions, onChangeInc, onChangeExc }) => {
  const [newInc, setNewInc] = useState("");
  const [newExc, setNewExc] = useState("");
  const newIncRef = useRef(null);
  const newExcRef = useRef(null);

  const addInc = () => {
    const v = newInc.trim();
    if (!v) return;
    onChangeInc([...inclusions, v]);
    setNewInc("");
    setTimeout(() => newIncRef.current?.focus(), 0);
  };
  const addExc = () => {
    const v = newExc.trim();
    if (!v) return;
    onChangeExc([...exclusions, v]);
    setNewExc("");
    setTimeout(() => newExcRef.current?.focus(), 0);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-lg bg-blue-950 text-white flex items-center justify-center text-sm font-bold">3</div>
        <div>
          <h3 className="font-bold text-gray-900">What's Inside the Package?</h3>
          <p className="text-xs text-gray-400 mt-0.5">Add inclusions (what's covered) and exclusions (what's not covered)</p>
        </div>
      </div>

      {/* TABLE LAYOUT */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="px-5 py-3 bg-emerald-50 border-b border-gray-200 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
            <span className="text-sm font-bold text-emerald-800">Inclusions</span>
            <span className="ml-auto text-xs text-emerald-600 font-semibold">{inclusions.length} item{inclusions.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="px-5 py-3 bg-red-50 border-b border-gray-200 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✕</div>
            <span className="text-sm font-bold text-red-700">Exclusions</span>
            <span className="ml-auto text-xs text-red-500 font-semibold">{exclusions.length} item{exclusions.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Rows */}
        {(inclusions.length > 0 || exclusions.length > 0) && (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: Math.max(inclusions.length, exclusions.length) }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 divide-x divide-gray-100">
                {/* Inclusion cell */}
                <div className="px-4 py-1">
                  {inclusions[i] !== undefined ? (
                    <EditableListItem
                      value={inclusions[i]}
                      onBlur={v => onChangeInc(inclusions.map((x, j) => j === i ? v : x))}
                      onRemove={() => onChangeInc(inclusions.filter((_, j) => j !== i))}
                      icon="✓"
                      rowCls="bg-white"
                      iconCls="text-emerald-500"
                    />
                  ) : <div className="h-10" />}
                </div>
                {/* Exclusion cell */}
                <div className="px-4 py-1">
                  {exclusions[i] !== undefined ? (
                    <EditableListItem
                      value={exclusions[i]}
                      onBlur={v => onChangeExc(exclusions.map((x, j) => j === i ? v : x))}
                      onRemove={() => onChangeExc(exclusions.filter((_, j) => j !== i))}
                      icon="✕"
                      rowCls="bg-white"
                      iconCls="text-red-400"
                    />
                  ) : <div className="h-10" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state row */}
        {inclusions.length === 0 && exclusions.length === 0 && (
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="px-5 py-6 text-center text-xs text-gray-400 italic">No inclusions yet</div>
            <div className="px-5 py-6 text-center text-xs text-gray-400 italic">No exclusions yet</div>
          </div>
        )}

        {/* Add row */}
        <div className="grid grid-cols-2 divide-x divide-gray-200 border-t border-gray-200 bg-gray-50/60">
          <div className="px-4 py-3 flex gap-2">
            <input
              ref={newIncRef}
              type="text"
              placeholder="+ Type inclusion and press Enter…"
              value={newInc}
              onChange={e => setNewInc(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addInc(); } }}
              className="flex-1 px-3 py-1.5 text-sm text-gray-900 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/30 bg-white placeholder:text-gray-400 min-w-0"
            />
            <button type="button" onClick={addInc} className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors flex-shrink-0 flex items-center gap-1"><Ic.Plus />Add</button>
          </div>
          <div className="px-4 py-3 flex gap-2">
            <input
              ref={newExcRef}
              type="text"
              placeholder="+ Type exclusion and press Enter…"
              value={newExc}
              onChange={e => setNewExc(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addExc(); } }}
              className="flex-1 px-3 py-1.5 text-sm text-gray-900 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300/30 bg-white placeholder:text-gray-400 min-w-0"
            />
            <button type="button" onClick={addExc} className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors flex-shrink-0 flex items-center gap-1"><Ic.Plus />Add</button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ─── KNOW BEFORE YOU GO SECTION ──────────────────────────────────
// Uses internal state per item via a stable sub-component to avoid re-mount on each keystroke
const KBYGItem = ({ item, index, onBlur, onRemove }) => {
  const [local, setLocal] = useState(item.point);
  const prevRef = useRef(item.point);
  if (prevRef.current !== item.point) { prevRef.current = item.point; setLocal(item.point); }
  return (
    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl group">
      <div className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{index + 1}</div>
      <textarea
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => { if (local.trim() !== item.point) onBlur(local.trim() || item.point); }}
        rows={2}
        className="flex-1 bg-transparent text-sm text-gray-900 leading-relaxed focus:outline-none resize-none border-b border-transparent focus:border-amber-400 transition-colors min-w-0"
        placeholder="Enter guideline or policy…"
      />
      <button type="button" onClick={onRemove} className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-50 mt-0.5"><Ic.Trash /></button>
    </div>
  );
};

const KnowBeforeYouGoSection = ({ points, onChange }) => {
  const [newPt, setNewPt] = useState("");
  const inputRef = useRef(null);

  const handleAdd = () => {
    const v = newPt.trim();
    if (!v) return;
    onChange([...points, { id: uid(), point: v }]);
    setNewPt("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-7 h-7 rounded-lg bg-blue-950 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">Know Before You Go</h3>
            {points.length > 0 && <span className="text-xs bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">{points.length} point{points.length > 1 ? "s" : ""}</span>}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Important traveller guidelines, policies and notices</p>
        </div>
      </div>

      {points.length === 0 && (
        <div className="py-8 text-center border-2 border-dashed border-amber-200 rounded-xl bg-amber-50/30 mb-4">
          <p className="text-sm font-semibold text-amber-800">No guidelines added yet</p>
          <p className="text-xs text-gray-400 mt-1">Add important policies travellers should know before booking</p>
        </div>
      )}

      {points.length > 0 && (
        <div className="space-y-2 mb-4">
          {points.map((pt, i) => (
            <KBYGItem
              key={pt.id}
              item={pt}
              index={i}
              onBlur={v => onChange(points.map(p => p.id === pt.id ? { ...p, point: v } : p))}
              onRemove={() => onChange(points.filter(p => p.id !== pt.id))}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a guideline and press Enter or click Add…"
          value={newPt}
          onChange={e => setNewPt(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
          className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 bg-white placeholder:text-gray-400"
        />
        <Btn variant="primary" size="sm" onClick={handleAdd}><Ic.Plus />Add Point</Btn>
      </div>
    </Card>
  );
};

// ─── STRING LIST ITEM — top-level so React never re-mounts it on parent re-render ──
const StringListItem = ({ value, icon, iconCls, rowCls, onCommit, onRemove }) => {
  const [loc, setLoc] = useState(value);
  // Only sync from parent when value changes externally (e.g. after delete re-index)
  const extRef = useRef(value);
  if (extRef.current !== value) { extRef.current = value; setLoc(value); }
  return (
    <div className={cls("flex items-center gap-2 px-3 py-2 rounded-lg group", rowCls)}>
      <span className={cls("text-sm flex-shrink-0", iconCls)}>{icon}</span>
      <input
        type="text"
        value={loc}
        onChange={e => setLoc(e.target.value)}
        onBlur={() => { if (loc !== value) onCommit(loc || value); }}
        className="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none min-w-0"
      />
      <button type="button" onClick={onRemove}
        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
        <Ic.Trash />
      </button>
    </div>
  );
};

// ─── ADDITIONAL INFORMATION SECTION ──────────────────────────────
// Internal state for all text fields — only flushes to parent on blur to avoid focus loss
const AdditionalInfoSection = ({ info, onChange }) => {
  const init = info || emptyAdditionalInfo();
  const [about, setAbout] = useState(init.aboutDestination || "");
  const [qi, setQi] = useState(init.quickInfo || { destinationsCovered: "", duration: "", startPoint: "", endPoint: "" });
  const [exps, setExps] = useState(init.experiencesCovered || []);
  const [ntm, setNtm] = useState(init.notToMiss || []);
  const [newExp, setNewExp] = useState("");
  const [newNtm, setNewNtm] = useState("");

  const flush = (patch) => onChange({ aboutDestination: about, quickInfo: qi, experiencesCovered: exps, notToMiss: ntm, ...patch });

  const addExp = () => {
    const v = newExp.trim();
    if (!v) return;
    const next = [...exps, v];
    setExps(next);
    setNewExp("");
    flush({ experiencesCovered: next });
  };
  const addNtm = () => {
    const v = newNtm.trim();
    if (!v) return;
    const next = [...ntm, v];
    setNtm(next);
    setNewNtm("");
    flush({ notToMiss: next });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-lg bg-blue-950 text-white flex items-center justify-center text-sm font-bold">6</div>
        <div>
          <h3 className="font-bold text-gray-900">Additional Information</h3>
          <p className="text-xs text-gray-400 mt-0.5">Destination overview, quick info, experiences and highlights</p>
        </div>
      </div>
      <div className="space-y-5">

        {/* About Destination */}
        <div>
          <FL optional>About the Destination</FL>
          <textarea
            rows={4}
            placeholder="Write a compelling overview of the destination for travellers…"
            value={about}
            onChange={e => setAbout(e.target.value)}
            onBlur={() => flush({ aboutDestination: about })}
            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 placeholder:text-gray-400 transition-all resize-none"
          />
        </div>

        {/* Quick Info */}
        <div>
          <FL>Quick Info</FL>
          <div className="grid grid-cols-2 gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            {[
              ["destinationsCovered", "🗺 Destinations Covered", "e.g. Phuket, Pattaya, Bangkok"],
              ["duration", "📅 Duration", "e.g. 7 Days, 6 Nights"],
              ["startPoint", "✈ Start Point", "e.g. Phuket International Airport (HKT)"],
              ["endPoint", "🏁 End Point", "e.g. Bangkok International Airport (BKK)"],
            ].map(([key, label, ph]) => (
              <div key={key}>
                <label className="block text-xs font-bold text-blue-900 mb-1">{label}</label>
                <input
                  type="text"
                  placeholder={ph}
                  value={qi[key] || ""}
                  onChange={e => setQi(q => ({ ...q, [key]: e.target.value }))}
                  onBlur={() => flush({ quickInfo: qi })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 placeholder:text-gray-400 transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Experiences Covered */}
        <div>
          <FL optional>Experiences Covered</FL>
          <div className="space-y-2 mb-2">
            {exps.length === 0 && <p className="text-xs text-gray-400 italic">No experiences added yet</p>}
            {exps.map((exp, i) => (
              <StringListItem
                key={`exp-${i}`}
                value={exp}
                icon="✦" iconCls="text-violet-500"
                rowCls="bg-violet-50 border border-violet-200"
                onCommit={v => { const next = exps.map((x, j) => j === i ? v : x); setExps(next); flush({ experiencesCovered: next }); }}
                onRemove={() => { const next = exps.filter((_, j) => j !== i); setExps(next); flush({ experiencesCovered: next }); }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="e.g. Snorkeling at Coral Island…" value={newExp} onChange={e => setNewExp(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addExp(); } }} className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 bg-white placeholder:text-gray-400" />
            <Btn variant="primary" size="sm" onClick={addExp}><Ic.Plus />Add</Btn>
          </div>
        </div>

        {/* Not to Miss */}
        <div>
          <FL optional>Not to Miss</FL>
          <div className="space-y-2 mb-2">
            {ntm.length === 0 && <p className="text-xs text-gray-400 italic">No highlights added yet</p>}
            {ntm.map((item, i) => (
              <StringListItem
                key={`ntm-${i}`}
                value={item}
                icon="★" iconCls="text-rose-500"
                rowCls="bg-rose-50 border border-rose-200"
                onCommit={v => { const next = ntm.map((x, j) => j === i ? v : x); setNtm(next); flush({ notToMiss: next }); }}
                onRemove={() => { const next = ntm.filter((_, j) => j !== i); setNtm(next); flush({ notToMiss: next }); }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="e.g. Kecak fire dance at Uluwatu Temple…" value={newNtm} onChange={e => setNewNtm(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addNtm(); } }} className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 bg-white placeholder:text-gray-400" />
            <Btn variant="primary" size="sm" onClick={addNtm}><Ic.Plus />Add</Btn>
          </div>
        </div>

      </div>
    </Card>
  );
};

// ─── FAQ COMPONENTS ───────────────────────────────────────────────
const FAQItemForm = ({ faq, index, onUpdate, onRemove }) => {
  const [open, setOpen] = useState(true);
  const [q, setQ] = useState(faq.question);
  const [a, setA] = useState(faq.answer);
  // Sync if parent sends a reset (e.g. edit loads new data)
  const prevId = useRef(faq.id);
  if (prevId.current !== faq.id) { prevId.current = faq.id; setQ(faq.question); setA(faq.answer); }
  return (
    <div className="border border-blue-100 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-blue-100">
        <div className="w-6 h-6 rounded-lg bg-blue-950 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{index + 1}</div>
        <p className="flex-1 text-xs font-semibold text-blue-900 truncate min-w-0">
          {q || <span className="text-gray-400 font-normal italic">Question not set</span>}
        </p>
        <button type="button" onClick={() => setOpen(o => !o)} className="p-1.5 text-blue-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"><Ic.Chevron open={open} /></button>
        <button type="button" onClick={() => onRemove(faq.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Ic.Trash /></button>
      </div>
      {open && (
        <div className="p-4 space-y-3">
          <div>
            <FL required>Question</FL>
            <input
              type="text"
              placeholder="e.g. Are flights included?"
              value={q}
              onChange={e => setQ(e.target.value)}
              onBlur={() => { if (q !== faq.question) onUpdate(faq.id, "question", q); }}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 placeholder:text-gray-400 transition-all"
            />
          </div>
          <div>
            <FL required>Answer</FL>
            <textarea
              rows={3}
              placeholder="Provide a clear, helpful answer…"
              value={a}
              onChange={e => setA(e.target.value)}
              onBlur={() => { if (a !== faq.answer) onUpdate(faq.id, "answer", a); }}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 placeholder:text-gray-400 transition-all resize-none"
            />
            {a && <p className="text-xs text-gray-400 mt-1 text-right">{a.length} chars</p>}
          </div>
        </div>
      )}
    </div>
  );
};

const FAQSection = ({ faqs, onChange, sectionNum = 4 }) => {
  const addFaq = () => onChange([...faqs, emptyFaq()]);
  const removeFaq = (id) => onChange(faqs.filter(f => f.id !== id));
  const updateFaq = (id, field, value) => onChange(faqs.map(f => f.id === id ? { ...f, [field]: value } : f));
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-950 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{sectionNum}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">Frequently Asked Questions</h3>
              {faqs.length > 0 && <span className="text-xs bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">{faqs.length} FAQ{faqs.length > 1 ? "s" : ""}</span>}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Common traveller questions — shown as an accordion on the package page</p>
          </div>
        </div>
        <Btn variant="primary" size="sm" onClick={addFaq}><Ic.Plus />Add FAQ</Btn>
      </div>
      {faqs.length === 0 && (
        <div className="py-10 text-center border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/40">
          <div className="flex justify-center mb-3">
            <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-sm font-semibold text-blue-900">No FAQs added yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Add common questions travellers ask about this package</p>
          <Btn variant="soft" size="sm" onClick={addFaq}><Ic.Plus />Add your first FAQ</Btn>
        </div>
      )}
      {faqs.length > 0 && (
        <div className="space-y-3">
          {faqs.map((faq, i) => <FAQItemForm key={faq.id} faq={faq} index={i} onUpdate={updateFaq} onRemove={removeFaq} />)}
          <button type="button" onClick={addFaq}
            className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-xs font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center gap-1.5">
            <Ic.Plus />Add another FAQ
          </button>
        </div>
      )}
    </Card>
  );
};

// FAQ Accordion Display (View Page)
const FAQDisplay = ({ faqs }) => {
  const [openId, setOpenId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const PREVIEW = 5;
  if (!faqs?.length) return null;
  const visible = showAll ? faqs : faqs.slice(0, PREVIEW);
  const hasMore = faqs.length > PREVIEW;
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">Frequently Asked Questions</h3>
          <p className="text-xs text-gray-400 mt-0.5">{faqs.length} question{faqs.length > 1 ? "s" : ""}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-950 text-white flex items-center justify-center text-sm font-bold">?</div>
      </div>
      <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
        {visible.map((faq, i) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="bg-white">
              <button type="button" onClick={() => setOpenId(isOpen ? null : faq.id)}
                className={cls("w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-all", isOpen ? "bg-blue-950 text-white" : "bg-white text-gray-800 hover:bg-blue-50")}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cls("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors", isOpen ? "bg-white/20 text-white" : "bg-blue-100 text-blue-900")}>{i + 1}</div>
                  <span className={cls("text-sm font-semibold leading-snug", isOpen ? "text-white" : "text-gray-900")}>{faq.question}</span>
                </div>
                <div className={cls("flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all", isOpen ? "bg-white/20 text-white rotate-180" : "bg-gray-100 text-gray-500")}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              <div className={cls("overflow-hidden transition-all duration-300 ease-in-out", isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
                <div className="px-5 pb-5 pt-4 bg-blue-50/60 border-t border-blue-100">
                  <div className="flex gap-3">
                    <div className="w-0.5 bg-blue-300 rounded-full flex-shrink-0 self-stretch min-h-[1.5rem]" />
                    <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <div className="mt-4 text-center">
          <button type="button" onClick={() => setShowAll(s => !s)}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue-200 bg-white text-blue-900 text-sm font-semibold rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm">
            {showAll ? <>↑ Show fewer FAQs</> : <>↓ Load {faqs.length - PREVIEW} more FAQ{faqs.length - PREVIEW > 1 ? "s" : ""}</>}
          </button>
        </div>
      )}
    </Card>
  );
};

// ─── PACKAGE FORM ─────────────────────────────────────────────────
export const PackageForm = ({ initial, onSave, onCancel, mode }) => {
  const [form, setForm] = useState(initial);
  const [itinerary, setItinerary] = useState(initial.itinerary || []);
  const [faqs, setFaqs] = useState(initial.faqs || []);
  const [inclusions, setInclusions] = useState(initial.inclusions || []);
  const [exclusions, setExclusions] = useState(initial.exclusions || []);
  const [knowBeforeYouGo, setKnowBeforeYouGo] = useState(initial.knowBeforeYouGo || []);
  const [additionalInfo, setAdditionalInfo] = useState(initial.additionalInfo || emptyAdditionalInfo());
  const [tab, setTab] = useState("builder");

  React.useEffect(() => {
    setForm(initial);
    setItinerary(initial.itinerary || []);
    setFaqs(initial.faqs || []);
    setInclusions(initial.inclusions || []);
    setExclusions(initial.exclusions || []);
    setKnowBeforeYouGo(initial.knowBeforeYouGo || []);
    setAdditionalInfo(initial.additionalInfo || emptyAdditionalInfo());
  }, [initial]);
  const upd = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const updPx = (f, v) => setForm(p => ({ ...p, price: { ...p.price, [f]: v } }));

  const handleDurationChange = (dur) => {
    upd("tripDuration", dur);
    const n = parseDays(dur);
    setItinerary(old => {
      if (n === old.length) return old;
      if (n > old.length) return [...old, ...Array.from({ length: n - old.length }, (_, i) => makeDay(old.length + i + 1))];
      return old.slice(0, n);
    });
  };

  const { destinations } = useAppSelector(state => state.destinations);
  const { categories } = useAppSelector(state => state.categories);

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-6">
      {/* SECTION 1 — Basic Package Info + Price */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-lg bg-blue-950 text-white flex items-center justify-center text-sm font-bold">1</div>
          <h3 className="font-bold text-gray-900">Package Information</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><FL required>Package Title</FL><Inp placeholder="e.g. Bali Royal Escape" value={form.title || ""} onChange={e => upd("title", e.target.value)} /></div>
          <div>
            <FL required>Destination</FL>
            <Sel 
              placeholder="Select destination…" 
              options={destinations.map(d => ({ label: d.name, value: d._id }))} 
              value={form.destinationId || ""} 
              onChange={e => {
                const dest = destinations.find(d => d._id === e.target.value);
                if (dest) {
                  setForm(p => ({
                    ...p,
                    destination: dest.name,
                    destinationId: dest._id,
                    destinationSlug: dest.slug
                  }));
                }
              }} 
            />
          </div>
          <div>
            <FL>Category</FL>
            <Sel 
              placeholder="Select category…" 
              options={categories.map(c => ({ label: c.name, value: c._id || "" }))} 
              value={form.categoryId || ""} 
              onChange={e => {
                const cat = categories.find(c => c._id === e.target.value);
                setForm(p => ({
                  ...p,
                  categoryId: cat?._id || "",
                  categorySlug: cat?.slug || ""
                }));
              }} 
            />
          </div>
          <div>
            <FL required>Trip Duration</FL>
            <Sel options={DURATION_OPTIONS} placeholder="Select duration" value={form.tripDuration || ""} onChange={e => handleDurationChange(e.target.value)} />
            {itinerary.length > 0 && <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1"><Ic.Check />{itinerary.length} days auto-generated</p>}
          </div>

          {/* ── Price (Base: INR) ── */}
          <div className="col-span-2">
            <FL required>Base Price (in INR — Source of Truth)</FL>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold select-none">₹</span>
                <Inp
                  type="number"
                  placeholder="e.g. 45000"
                  value={form.price?.amount || ""}
                  onChange={e => {
                    setForm(p => ({
                      ...p,
                      price: { ...p.price, amount: e.target.value, currency: "INR" }
                    }));
                  }}
                  className="pl-8"
                />
              </div>
              <div className="w-1/3">
                <FL>Discounted Price (Optional)</FL>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold select-none">₹</span>
                  <Inp
                    type="number"
                    placeholder="Original price"
                    value={form.price?.originalAmount || ""}
                    onChange={e => updPx("originalAmount", e.target.value)}
                    className="pl-8 text-gray-500"
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 italic">
              * Enter all prices in Indian Rupees (INR). The system will automatically convert this to other currencies for international travellers.
            </p>
          </div>

          <div><FL>Travel Style</FL><Sel options={OPTIONS.travelStyle} placeholder="Select…" value={form.travelStyle || ""} onChange={e => upd("travelStyle", e.target.value)} /></div>
          <div><FL>Exclusivity</FL><Sel options={OPTIONS.exclusivity} placeholder="Select…" value={form.exclusivityLevel || ""} onChange={e => upd("exclusivityLevel", e.target.value)} /></div>
          <div className="col-span-2"><FL>Short Description</FL><Inp placeholder="1-line teaser for listing cards" value={form.shortDescription || ""} onChange={e => upd("shortDescription", e.target.value)} /></div>
          <div className="col-span-2"><FL optional>Full Description</FL><TA placeholder="Detailed narrative about the package…" value={form.longDescription || ""} onChange={e => upd("longDescription", e.target.value)} rows={3} /></div>
        </div>
      </Card>

      {/* SECTION 2 — Itinerary Builder with tabs */}
      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-6 pt-4 pb-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-950 text-white flex items-center justify-center text-sm font-bold">2</div>
              <h3 className="font-bold text-gray-900">Itinerary Builder</h3>
              {itinerary.length > 0 && <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">{itinerary.length} Days</span>}
            </div>
          </div>
          <div className="flex gap-0">
            {([] as [string, React.ReactNode][]).concat([
              ["builder", <><Ic.Package /> Builder</>],
              ["summary", <><Ic.Summary /> Summarised View</>]
            ]).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key as any)}
                className={cls("flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all", tab === key ? "border-blue-950 text-blue-950 bg-white" : "border-transparent text-gray-500 hover:text-gray-700")}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {tab === "builder" && <ItineraryBuilder itinerary={itinerary} setItinerary={setItinerary} />}
          {tab === "summary" && <SummarisedView itinerary={itinerary} pkg={form} />}
        </div>
      </Card>

      {/* SECTION 3 — Inclusions & Exclusions */}
      <InclusionsExclusionsSection
        inclusions={inclusions} exclusions={exclusions}
        onChangeInc={setInclusions} onChangeExc={setExclusions}
      />

      {/* SECTION 4 — FAQs */}
      <FAQSection faqs={faqs} onChange={setFaqs} sectionNum={4} />

      {/* SECTION 5 — Know Before You Go */}
      <KnowBeforeYouGoSection points={knowBeforeYouGo} onChange={setKnowBeforeYouGo} />

      {/* SECTION 6 — Additional Information */}
      <AdditionalInfoSection info={additionalInfo} onChange={setAdditionalInfo} />

      <div className="flex justify-end gap-3">
        <Btn variant="outline" onClick={onCancel}>Cancel</Btn>
        <Btn variant="success" onClick={() => onSave({ ...form, itinerary, faqs, inclusions, exclusions, knowBeforeYouGo, additionalInfo })}>
          {mode === "create" ? "✓ Create Package" : "✓ Save Changes"}
        </Btn>
      </div>
    </div>
  );
};

// ─── VIEW PACKAGE ─────────────────────────────────────────────────
export const ViewPackage = ({ pkg, onEdit }: any) => {
  const { transfers } = useAppSelector(state => state.transfers);
  const [tab, setTab] = useState("summary");
  const sym = getCurrSym(pkg.price?.currency);
  const [kbygOpen, setKbygOpen] = useState(true);
  const [addInfoOpen, setAddInfoOpen] = useState(false);

  const tabs = [
    ["summary", "Summary"],
    ["inclusions", "What's Inside"],
    ["kbyg", "Know Before You Go"],
    ["faqs", `FAQs${pkg.faqs?.length ? ` (${pkg.faqs.length})` : ""}`],
    ["additional", "Additional Info"],
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Hero */}
      <div className="bg-blue-950 text-white rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{pkg.title || pkg.destination}</h2>
            <p className="text-blue-300 flex items-center gap-1 mt-1"><Ic.MapPin />{pkg.destination} · {pkg.tripDuration}</p>
            {pkg.shortDescription && <p className="text-blue-200/70 text-sm mt-2 max-w-xl">{pkg.shortDescription}</p>}
            <div className="flex gap-2 mt-3 flex-wrap">
              {pkg.travelStyle && <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full font-medium">{pkg.travelStyle}</span>}
              {pkg.exclusivityLevel && <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full font-medium">{pkg.exclusivityLevel}</span>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {pkg.price?.amount && Number(pkg.price.amount) > 0 ? (
              <>
                <p className="text-3xl font-bold">₹{Number(pkg.price.amount).toLocaleString("en-IN")}</p>
                <p className="text-xs text-blue-400 mt-1">Base Price (INR) / person</p>
              </>
            ) : (
              <p className="text-sm text-blue-400">Price not set</p>
            )}
            <Btn variant="secondary" size="sm" className="mt-3" onClick={onEdit}><Ic.Edit />Edit Package</Btn>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={cls("flex-shrink-0 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap", tab === key ? "border-blue-950 text-blue-950" : "border-transparent text-gray-500 hover:text-gray-700")}>
            {label}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {tab === "summary" && <SummarisedView itinerary={pkg.itinerary || []} pkg={pkg} />}

      {/* What's Inside Tab */}
      {tab === "inclusions" && (
        <Card className="p-6">
          <h3 className="text-base font-bold text-gray-900 mb-5">What's Inside the Package?</h3>
          <div className="grid grid-cols-2 gap-8">
            {/* Inclusions */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
                Inclusions <span className="text-gray-400 font-normal">({(pkg.inclusions || []).length})</span>
              </h4>
              {(pkg.inclusions || []).length === 0
                ? <p className="text-sm text-gray-400 italic">No inclusions listed</p>
                : <ul className="space-y-2.5">{pkg.inclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}</ul>
              }
            </div>
            {/* Divider */}
            <div className="border-l border-gray-200 pl-8">
              <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">✕</div>
                Exclusions <span className="text-gray-400 font-normal">({(pkg.exclusions || []).length})</span>
              </h4>
              {(pkg.exclusions || []).length === 0
                ? <p className="text-sm text-gray-400 italic">No exclusions listed</p>
                : <ul className="space-y-2.5">{pkg.exclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}</ul>
              }
            </div>
          </div>
        </Card>
      )}

      {/* Know Before You Go Tab */}
      {tab === "kbyg" && (
        <Card className="overflow-hidden">
          <button type="button" onClick={() => setKbygOpen(o => !o)}
            className="w-full flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <h3 className="text-base font-bold text-gray-900">Know Before You Go</h3>
            <Ic.Chevron open={kbygOpen} />
          </button>
          {kbygOpen && (
            <div className="px-6 py-5">
              {(pkg.knowBeforeYouGo || []).length === 0
                ? <p className="text-sm text-gray-400 italic text-center py-6">No guidelines added</p>
                : <ul className="space-y-3">
                  {pkg.knowBeforeYouGo.map((pt, i) => (
                    <li key={pt.id || i} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-950 mt-2 flex-shrink-0" />
                      <span>{pt.point}</span>
                    </li>
                  ))}
                </ul>
              }
            </div>
          )}
        </Card>
      )}

      {/* FAQs Tab */}
      {tab === "faqs" && (
        pkg.faqs?.length > 0
          ? <FAQDisplay faqs={pkg.faqs} />
          : <div className="py-16 text-center border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/40">
            <p className="text-sm font-semibold text-blue-900">No FAQs added</p>
            <p className="text-xs text-gray-400 mt-1">Edit this package to add FAQs</p>
          </div>
      )}

      {/* Additional Information Tab */}
      {tab === "additional" && (() => {
        const ai = pkg.additionalInfo;
        if (!ai || (!ai.aboutDestination && !ai.quickInfo?.destinationsCovered && !(ai.experiencesCovered?.length) && !(ai.notToMiss?.length)))
          return (
            <div className="py-16 text-center border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/40">
              <p className="text-sm font-semibold text-blue-900">No additional information added</p>
              <p className="text-xs text-gray-400 mt-1">Edit this package to add destination info</p>
            </div>
          );
        return (
          <div className="space-y-4">
            {/* About Destination */}
            {ai.aboutDestination && (
              <Card className="p-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">About the Destination</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{ai.aboutDestination}</p>
              </Card>
            )}

            {/* Quick Info */}
            {(ai.quickInfo?.destinationsCovered || ai.quickInfo?.duration || ai.quickInfo?.startPoint || ai.quickInfo?.endPoint) && (
              <Card className="p-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Quick Info</h4>
                <div className="space-y-3">
                  {[
                    ["🗺", "Destinations Covered", "destinationsCovered"],
                    ["📅", "Duration", "duration"],
                    ["✈", "Start Point", "startPoint"],
                    ["🏁", "End Point", "endPoint"],
                  ].filter(([, , k]) => ai.quickInfo?.[k]).map(([icon, label, key]) => (
                    <div key={key} className="flex items-start gap-3 text-sm">
                      <span className="text-lg flex-shrink-0">{icon}</span>
                      <div>
                        <span className="font-bold text-gray-900">{label}: </span>
                        <span className="text-gray-700">{ai.quickInfo[key]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Experiences Covered */}
            {ai.experiencesCovered?.length > 0 && (
              <Card className="p-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Experiences Covered</h4>
                <ul className="space-y-2.5">
                  {ai.experiencesCovered.map((exp, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-violet-500 font-bold flex-shrink-0 mt-0.5">✦</span>
                      <span className="leading-snug">{exp}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Not to Miss */}
            {ai.notToMiss?.length > 0 && (
              <Card className="p-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Not to Miss</h4>
                <ul className="space-y-2.5">
                  {ai.notToMiss.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-rose-500 font-bold flex-shrink-0 mt-0.5">★</span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        );
      })()}
    </div>
  );
};

// ─── COUPONS PAGE ────────────────────────────────────────────────
interface CouponFormData {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number | string;
  description: string;
  minOrderValue: number | string;
  maxUses: number | string;
  isActive: boolean;
  expiryDate: string;
}

const emptyCouponForm = (): CouponFormData => ({
  code: "", discountType: "percentage", discountValue: "", description: "",
  minOrderValue: "", maxUses: "", isActive: true, expiryDate: "",
});

export const CouponsPage = () => {
  const dispatch = useAppDispatch();
  const { coupons } = useAppSelector(state => state.coupons);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; data: Coupon | null } | null>(null);
  const [form, setForm] = useState<CouponFormData>(emptyCouponForm());
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  const filtered = coupons.filter(c =>
    !search || c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm(emptyCouponForm()); setModal({ mode: "create", data: null }); };
  const openEdit = (c: Coupon) => {
    setForm({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, description: c.description || "", minOrderValue: c.minOrderValue || "", maxUses: c.maxUses || "", isActive: c.isActive, expiryDate: c.expiryDate || "" });
    setModal({ mode: "edit", data: c });
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upd = (f: keyof CouponFormData, v: any) => setForm(p => ({ ...p, [f]: v }));

  const handleSave = async () => {
    if (!form.code.trim()) { alert("Coupon code is required"); return; }
    const payload = { ...form, discountValue: Number(form.discountValue) || 0, minOrderValue: Number(form.minOrderValue) || 0, maxUses: Number(form.maxUses) || 0 };
    
    if (modal?.mode === "create") {
      dispatch(createCoupon(payload)).then((res) => {
        if (createCoupon.fulfilled.match(res)) setModal(null);
        else alert("Failed to create coupon: " + (res.error?.message || "Unknown error"));
      });
    } else if (modal?.data) {
      dispatch(updateCoupon({ ...modal.data, ...payload })).then((res) => {
        if (updateCoupon.fulfilled.match(res)) setModal(null);
        else alert("Failed to update coupon: " + (res.error?.message || "Unknown error"));
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    dispatch(deleteCoupon(id)).then((res) => {
      if (!deleteCoupon.fulfilled.match(res)) {
        alert("Delete failed: " + (res.error?.message || "Unknown error"));
      }
    });
  };

  const getStatus = (c: Coupon) => {
    if (!c.isActive) return { label: "Inactive", cls: "bg-gray-100 text-gray-500 border-gray-200" };
    if (c.expiryDate && new Date(c.expiryDate) < new Date()) return { label: "Expired", cls: "bg-red-50 text-red-600 border-red-200" };
    return { label: "Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Ic.Search /></div><Inp className="pl-9" placeholder="Search coupons…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Btn className="ml-auto" onClick={openCreate}><Ic.Plus />New Coupon</Btn>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50/80">
              {["Code", "Discount", "Description", "Min Order", "Uses", "Expiry", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No coupons yet. Click "New Coupon" to add one.</td></tr>}
              {filtered.map(c => {
                const st = getStatus(c);
                return (
                  <tr key={c._id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-4 py-3.5"><span className="font-mono font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-xs tracking-widest">{c.code}</span></td>
                    <td className="px-4 py-3.5"><span className="font-bold text-gray-900">{c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`}</span><span className="ml-1.5 text-xs text-gray-400 capitalize">{c.discountType}</span></td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 max-w-[160px] truncate">{c.description || "—"}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{c.minOrderValue ? `₹${c.minOrderValue}` : "—"}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600"><span className="font-semibold">{c.usedCount || 0}</span>{c.maxUses ? <span className="text-gray-400"> / {c.maxUses}</span> : <span className="text-gray-400"> / ∞</span>}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-IN") : "No expiry"}</td>
                    <td className="px-4 py-3.5"><Badge className={st.cls}>{st.label}</Badge></td>
                    <td className="px-4 py-3.5"><div className="flex items-center gap-0.5">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg"><Ic.Edit /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"><Ic.Trash /></button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60 rounded-b-xl">
          <p className="text-xs text-gray-500">{filtered.length} of {coupons.length} coupons · {coupons.filter(c => c.isActive).length} active</p>
        </div>
      </Card>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "create" ? "New Coupon" : "Edit Coupon"}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><FL required>Coupon Code</FL><Inp placeholder="e.g. SUMMER20" value={form.code} onChange={e => upd("code", e.target.value.toUpperCase())} className="font-mono tracking-widest uppercase" /></div>
            <div><FL required>Discount Type</FL><Sel options={["percentage", "fixed"]} value={form.discountType} onChange={e => upd("discountType", e.target.value)} /></div>
            <div><FL required>Value</FL>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold select-none">{form.discountType === "percentage" ? "%" : "₹"}</span>
                <Inp type="number" placeholder="0" value={String(form.discountValue)} onChange={e => upd("discountValue", e.target.value)} className="pl-8" />
              </div>
            </div>
            <div><FL optional>Min Order (₹)</FL><Inp type="number" placeholder="e.g. 5000" value={String(form.minOrderValue)} onChange={e => upd("minOrderValue", e.target.value)} /></div>
            <div><FL optional>Max Uses</FL><Inp type="number" placeholder="Unlimited if blank" value={String(form.maxUses)} onChange={e => upd("maxUses", e.target.value)} /></div>
            <div><FL optional>Expiry Date</FL><Inp type="date" value={form.expiryDate} onChange={e => upd("expiryDate", e.target.value)} /></div>
            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 font-medium"><input type="checkbox" className="w-4 h-4 rounded accent-blue-900" checked={form.isActive} onChange={e => upd("isActive", e.target.checked)} />Active</label>
            </div>
            <div className="col-span-2"><FL optional>Description</FL><TA placeholder="e.g. 20% off on all summer packages" value={form.description} onChange={e => upd("description", e.target.value)} rows={2} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Btn variant="outline" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="success" onClick={handleSave}>{modal?.mode === "create" ? "Create Coupon" : "Save Changes"}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── PACKAGES LISTING ─────────────────────────────────────────────
export const PackagesListing = ({ setPage, setSelectedId, onDuplicate }) => {
  const dispatch = useAppDispatch();
  const { packages } = useAppSelector(state => state.packages);
  const _pkgRouter = useNextRouter();
  const [search, setSearch] = useState("");
  const [bookingModal, setBookingModal] = useState<Package | null>(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const downloadSample = () => {
    const sampleData = {
      success: true,
      data: [
        {
          title: "Jaipur Royal Getaway",
          destination: "Jaipur, India",
          tripDuration: "3 Days / 2 Nights",
          travelStyle: "Premium",
          tourType: "Leisure",
          exclusivityLevel: "Standard",
          price: {
            currency: "INR",
            amount: 8999
          },
          shortDescription: "Experience Jaipur’s royal heritage with forts, culture, and local experiences.",
          
          inclusions: [
            "2 nights hotel stay",
            "Daily breakfast",
            "Private cab transfers",
            "Sightseeing tours"
          ],
          
          exclusions: [
            "Airfare/train tickets",
            "Personal expenses",
            "Entry tickets (if not mentioned)"
          ],

          itinerary: [
            {
              id: "d1",
              dayNumber: 1,
              title: "Arrival & Local Market Visit",
              city: "Jaipur",
              dayType: "arrival",
              mealsIncluded: ["Dinner"],
              
              hotelStays: [
                {
                  id: "h1",
                  customRoomType: "Deluxe Room",
                  checkInTime: "13:00",
                  checkOutTime: "11:00",
                  mealInclusions: {
                    breakfast: true,
                    lunch: false,
                    dinner: true
                  },
                  hotelData: {
                    hotelName: "Hotel Grand Eagle",
                    city: "Jaipur",
                    starRating: "3",
                    amenities: ["Wi-Fi", "AC", "Room Service"]
                  }
                }
              ],

              transfers: [
                {
                  id: "t1",
                  transferType: "Private",
                  vehicleType: "Sedan",
                  from: "Jaipur Railway Station",
                  to: "Hotel Grand Eagle",
                  pickupTime: "12:00",
                  dropTime: "13:00"
                }
              ],

              activities: [
                {
                  id: "a1",
                  time: "17:00",
                  activityData: {
                    title: "Local Market Visit",
                    description: "Explore Bapu Bazaar & Johari Bazaar for shopping and local culture.",
                    location: "Jaipur"
                  }
                }
              ]
            },

            {
              id: "d2",
              dayNumber: 2,
              title: "Jaipur Sightseeing",
              city: "Jaipur",
              dayType: "sightseeing",
              mealsIncluded: ["Breakfast"],

              hotelStays: [
                {
                  id: "h2",
                  customRoomType: "Deluxe Room",
                  checkInTime: "13:00",
                  checkOutTime: "11:00",
                  mealInclusions: {
                    breakfast: true,
                    lunch: false,
                    dinner: false
                  },
                  hotelData: {
                    hotelName: "Hotel Grand Eagle",
                    city: "Jaipur",
                    starRating: "3"
                  }
                }
              ],

              transfers: [
                {
                  id: "t2",
                  transferType: "Private",
                  vehicleType: "Sedan",
                  from: "Hotel",
                  to: "Sightseeing",
                  pickupTime: "09:00",
                  dropTime: "17:00"
                }
              ],

              activities: [
                {
                  id: "a2",
                  time: "10:00",
                  activityData: {
                    title: "Amber Fort Visit",
                    description: "Explore the historic Amber Fort.",
                    location: "Jaipur"
                  }
                },
                {
                  id: "a3",
                  time: "14:00",
                  activityData: {
                    title: "City Palace & Hawa Mahal",
                    description: "Visit iconic landmarks of Jaipur.",
                    location: "Jaipur"
                  }
                }
              ]
            },

            {
              id: "d3",
              dayNumber: 3,
              title: "Departure",
              city: "Jaipur",
              dayType: "departure",
              mealsIncluded: ["Breakfast"],

              hotelStays: [],

              transfers: [
                {
                  id: "t3",
                  transferType: "Private",
                  vehicleType: "Sedan",
                  from: "Hotel Grand Eagle",
                  to: "Railway Station / Airport",
                  pickupTime: "11:30",
                  dropTime: "12:30"
                }
              ],

              activities: []
            }
          ],

          id: "pkg_3day_001",
          packageId: "pkg_jaipur_3d"
        }
      ]
    };
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stayvacation_sample_package.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filtered = packages.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.destination?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Ic.Search /></div><Inp className="pl-9" placeholder="Search packages…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="ml-auto flex items-center gap-2">
          <Btn variant="outline" onClick={() => setImportModalOpen(true)}>Import Packages</Btn>
          <Btn onClick={() => _pkgRouter.push('/admin/packages/create')}><Ic.Plus />Create Package</Btn>
        </div>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {["Package", "Duration", "Style", "Exclusivity", "Itinerary Stats", "Price", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No packages found</td></tr>}
              {filtered.map((pkg, index) => {
                const totalH = pkg.itinerary?.reduce((s, d) => s + (d.hotelStays?.length || 0), 0) || 0;
                const totalA = pkg.itinerary?.reduce((s, d) => s + (d.activities?.length || 0), 0) || 0;
                const totalT = pkg.itinerary?.reduce((s, d) => s + (d.transfers?.length || 0), 0) || 0;
                const linked = pkg.itinerary?.reduce((s, d) => s + (d.activities?.filter(a => a.activityRef).length || 0) + (d.hotelStays?.filter(h => h.hotelRef).length || 0), 0) || 0;
                return (
                  <tr key={`${pkg.id}-${index}`} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-900 flex-shrink-0"><Ic.Globe /></div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm leading-tight">{pkg.title || pkg.destination}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Ic.MapPin />{pkg.destination}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">{pkg.tripDuration}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{pkg.travelStyle || "—"}</td>
                    <td className="px-4 py-3.5"><Badge className="bg-violet-50 text-violet-700 border-violet-200">{pkg.exclusivityLevel || "—"}</Badge></td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Ic.Hotel />{totalH}</span>
                          <span className="flex items-center gap-1"><Ic.Activity />{totalA}</span>
                          <span className="flex items-center gap-1"><Ic.Car />{totalT}</span>
                        </div>
                        {linked > 0 && <div className="flex items-center gap-1 text-emerald-600 font-semibold"><Ic.Sync />{linked} master-linked</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-blue-900 whitespace-nowrap">
                      {getCurrSym(pkg.price?.currency)}{Number(pkg.price?.amount || 0).toLocaleString("en-IN")}
                      <span className="text-xs text-gray-400 font-normal ml-1">{pkg.price?.currency}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => _pkgRouter.push('/admin/packages/view/' + pkg.id)} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors" title="View"><Ic.Eye /></button>
                        <button onClick={() => _pkgRouter.push('/admin/packages/edit/' + pkg.id)} className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors" title="Edit"><Ic.Edit /></button>
                        <button onClick={() => onDuplicate(pkg)} className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1" title="Duplicate Package"><Ic.Package /></button>
                        <button onClick={async () => { if (!window.confirm("Delete this package?")) return; dispatch(deletePackage(pkg.id)).then((res) => { if (!deletePackage.fulfilled.match(res)) alert("Delete failed: " + (res.error?.message || "Unknown error")); }); }} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Delete"><Ic.Trash /></button>
                        <button onClick={() => setBookingModal(pkg)} className="ml-2 px-2.5 py-1 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"><Ic.Plus />Book</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60 rounded-b-xl">
          <p className="text-xs text-gray-500">{filtered.length} of {packages.length} packages</p>
        </div>
      </Card>

      {bookingModal && (
        <BookingFormModal pkg={bookingModal} onClose={() => setBookingModal(null)} />
      )}

      <Modal open={importModalOpen} onClose={() => !isImporting && setImportModalOpen(false)} title="Import Packages">
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Select a valid .json file containing travel packages export data.</p>
          <input 
            type="file" 
            accept=".json" 
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-[1px] file:border-blue-100 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
          />

          <details className="bg-gray-50 rounded-xl border border-gray-100 p-3 text-sm">
            <summary className="font-semibold text-gray-700 cursor-pointer outline-none">View JSON Structure</summary>
            <div className="mt-3 space-y-3 text-gray-600">
              <p>The uploaded file must precisely match this format:</p>
              <pre className="bg-slate-900 text-teal-400 p-3 rounded-lg text-xs overflow-x-auto">
{`{
  "success": true,
  "data": [ 
    { 
      "title": "Package Title",
      "destination": "...",
      "tripDuration": "...",
      "price": { "amount": 0, "currency": "USD" },
      "itinerary": [ ... ]
    } 
  ]
}`}
              </pre>
              <p className="pt-1"><b>Required array object properties:</b> <code className="bg-white border px-1 py-0.5 rounded text-gray-800">title</code>, <code className="bg-white border px-1 py-0.5 rounded text-gray-800">destination</code>, <code className="bg-white border px-1 py-0.5 rounded text-gray-800">tripDuration</code>, <code className="bg-white border px-1 py-0.5 rounded text-gray-800">price.amount</code>, <code className="bg-white border px-1 py-0.5 rounded text-gray-800">itinerary</code>.</p>
              <p className="text-amber-700 text-xs mt-1 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200">⚠️ Invalid or missing fields will be automatically skipped.</p>
            </div>
          </details>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <Btn variant="outline" size="sm" onClick={downloadSample}>Download Sample JSON</Btn>
            <div className="flex gap-3">
              <Btn variant="ghost" onClick={() => setImportModalOpen(false)} disabled={isImporting}>Cancel</Btn>
              <Btn 
                variant="success" 
                disabled={!importFile || isImporting} 
                onClick={async () => {
                if (!importFile) return;
                try {
                  setIsImporting(true);
                  const text = await importFile.text();
                  
                  let parsed;
                  try {
                    parsed = JSON.parse(text);
                  } catch (e) {
                    alert("Invalid file: File must be a valid JSON.");
                    setIsImporting(false);
                    return;
                  }

                  if (typeof parsed.success !== "boolean" || !Array.isArray(parsed.data)) {
                     alert("Invalid format: JSON must contain 'success' as boolean and 'data' as an array.");
                     setIsImporting(false);
                     return;
                  }

                  const dataToImport = parsed.data;
                  dispatch(importPackages(dataToImport)).then((res) => {
                    if (importPackages.fulfilled.match(res)) {
                      const result = res.payload;
                      let msg = `Import complete: ${result.imported} imported, ${result.skipped} skipped out of ${result.total} total.`;
                      if (result.errors?.length) {
                        msg += `\nErrors: ${result.errors.map((e: any) => e.packageTitle + " - " + e.reason).join(" | ")}`;
                      }
                      alert(msg);
                      dispatch(fetchPackages()); // Refresh the list
                    } else {
                      alert("Import failed: " + (res.error?.message || "Unknown error"));
                    }
                    setIsImporting(false);
                  });
                } catch (err: any) {
                  console.error(err);
                  alert("Failed to import. Error: " + err.message);
                  setIsImporting(false);
                }
              }}
            >
              {isImporting ? "Importing..." : "Upload File"}
            </Btn>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const DuplicatePackageModal = ({ isOpen, onClose, basePkgId, setBasePkgId, packages, onSubmit }: any) => {
  const basePkg = packages.find((p: any) => p.id === basePkgId);
  const minDays = basePkg?.itinerary?.length || 1;
  const [days, setDays] = useState(5);
  
  React.useEffect(() => {
    if (basePkg) setDays(minDays);
  }, [basePkgId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Duplicate Package</h3>
          <button onClick={onClose} className="text-gray-400 font-bold hover:text-gray-900">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select Base Package</label>
            <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900" value={basePkgId} onChange={e => setBasePkgId(e.target.value)}>
              <option value="" disabled>Select package to clone...</option>
              {packages.map((p: any) => <option key={p.id} value={p.id}>{p.title || p.destination}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">New Duration (Days)</label>
            <input type="number" min={minDays} max="15" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900" value={days} onChange={e => setDays(parseInt(e.target.value) || minDays)} />
             <p className="text-[10px] text-gray-500 mt-1">Minimum {minDays} days. Maximum 15 days allowed.</p>
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={() => onSubmit(packages.find((p: any) => p.id === basePkgId), days)} className="px-4 py-2 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-sm">Clone Package</button>
        </div>
      </div>
    </div>
  );
};

const BookingFormModal = ({ pkg, onClose }: { pkg: Package; onClose: () => void }) => {
  const [form, setForm] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    travelDate: "",
    returnDate: "",
    adults: 2,
    children: 0,
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute estimated price automatically
  const basePrice = Number(pkg.price?.amount || 0);
  const totalGuests = Number(form.adults) + (Number(form.children) * 0.5); // Example: kids are half price
  const estimatedTotal = basePrice * totalGuests;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userName || !form.travelDate) return alert("Name and Travel Date are required.");

    setIsSubmitting(true);
    try {
      const payload: Omit<Booking, "id"> = { // Using the Booking type we made earlier
        packageId: pkg.id,
        packageTitle: pkg.title || pkg.destination,
        userName: form.userName,
        userEmail: form.userEmail,
        userPhone: form.userPhone,
        travelDate: form.travelDate,
        returnDate: form.returnDate,
        adults: Number(form.adults),
        children: Number(form.children),
        totalPrice: estimatedTotal,
        currency: pkg.price?.currency || "INR",
        status: "pending",
        notes: form.notes,
        createdAt: new Date().toISOString()
      };

      const result = await apiFetch<any>("/api/bookings", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      alert(result.message || "Booking created successfully!");
      onClose();
    } catch (err: any) {
      console.error(err);
      alert("Booking failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const upd = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal open={true} onClose={onClose} title="Create Booking">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-4 mb-2">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-900"><Ic.Package /></div>
          <div>
            <p className="font-bold text-gray-900">{pkg.title || pkg.destination}</p>
            <p className="text-sm text-gray-500 mt-1">{pkg.tripDuration} · Base Price: <strong className="text-blue-900">{getCurrSym(pkg.price?.currency)}{basePrice.toLocaleString("en-IN")}</strong></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1"><FL required>Guest Name</FL><Inp required value={form.userName} onChange={e => upd("userName", e.target.value)} placeholder="John Doe" /></div>
          <div className="col-span-2 sm:col-span-1"><FL>Guest Email</FL><Inp type="email" value={form.userEmail} onChange={e => upd("userEmail", e.target.value)} placeholder="john@example.com" /></div>
          <div className="col-span-2 sm:col-span-1"><FL>Guest Phone</FL><Inp type="tel" value={form.userPhone} onChange={e => upd("userPhone", e.target.value)} placeholder="+1 234 567 8900" /></div>

          <div className="col-span-2 sm:col-span-1"><FL required>Travel Date</FL><Inp required type="date" value={form.travelDate} onChange={e => upd("travelDate", e.target.value)} /></div>
          <div className="col-span-2 sm:col-span-1"><FL>Return Date</FL><Inp type="date" value={form.returnDate} onChange={e => upd("returnDate", e.target.value)} /></div>

          <div className="col-span-2 sm:col-span-1"><FL required>Adults</FL><Inp required type="number" min="1" value={form.adults} onChange={e => upd("adults", e.target.value)} /></div>
          <div className="col-span-2 sm:col-span-1"><FL>Children (under 12)</FL><Inp type="number" min="0" value={form.children} onChange={e => upd("children", e.target.value)} /></div>

          <div className="col-span-2"><FL>Special Requests / Notes</FL><TA value={form.notes} onChange={e => upd("notes", e.target.value)} placeholder="Dietary requirements, occasion, etc." /></div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
          <div className="text-left">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Estimated Total Price</p>
            <p className="text-xl font-bold text-blue-900">{getCurrSym(pkg.price?.currency)}{estimatedTotal.toLocaleString("en-IN")}</p>
          </div>
          <div className="flex gap-3">
            <Btn type="button" variant="outline" onClick={onClose}>Cancel</Btn>
            <Btn type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Create Booking"}</Btn>
          </div>
        </div>
      </form>
    </Modal>
  );
};


// ─── DASHBOARD ────────────────────────────────────────────────────
export const Dashboard = ({ setPage, onOpenDuplicateModal }: any) => {
  const { packages } = useAppSelector(state => state.packages);
  const { masterActivities } = useAppSelector(state => state.activities);
  const { masterHotels } = useAppSelector(state => state.hotels);
  const totalDays = packages.reduce((s, p) => s + (p.itinerary?.length || 0), 0);
  const linkedActs = packages.reduce((s, p) => s + (p.itinerary?.reduce((sd, d) => sd + (d.activities?.filter(a => a.activityRef).length || 0), 0) || 0), 0);
  const linkedHotels = packages.reduce((s, p) => s + (p.itinerary?.reduce((sd, d) => sd + (d.hotelStays?.filter(h => h.hotelRef).length || 0), 0) || 0), 0);
  const unlinkedActs = packages.reduce((s, p) => s + (p.itinerary?.reduce((sd, d) => sd + (d.activities?.filter(a => !a.activityRef).length || 0), 0) || 0), 0);

  const stats = [
    { label: "Packages", value: packages.length, sub: "In catalog", color: "bg-blue-950", icon: <Ic.Package /> },
    { label: "Itinerary Days", value: totalDays, sub: "Total days planned", color: "bg-emerald-700", icon: <Ic.Summary /> },
    { label: "Master Activities", value: masterActivities.length, sub: `${linkedActs} linked in pkgs`, color: "bg-violet-700", icon: <Ic.Activity /> },
    { label: "Master Hotels", value: masterHotels.length, sub: `${linkedHotels} linked in pkgs`, color: "bg-amber-600", icon: <Ic.Hotel /> },
  ];

  return (
    <div className="space-y-6">


      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, color, icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 leading-none">{value}</p>
                <p className="text-xs text-gray-400 mt-2">{sub}</p>
              </div>
              <div className={cls("w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0", color)}>{icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">Recent Packages</h3>
              <Btn variant="ghost" size="sm" onClick={() => setPage("packages")}>View all →</Btn>
            </div>
            <div className="space-y-3">
              {packages.slice(0, 4).map((pkg, index) => {
                const linked = pkg.itinerary.reduce((s, d) => s + d.activities.filter(a => a.activityRef).length + d.hotelStays.filter(h => h.hotelRef).length, 0);
                return (
                  <div key={`${pkg.id}-${index}`} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-900"><Ic.Globe /></div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{pkg.title || pkg.destination}</p>
                        <p className="text-xs text-gray-400">{pkg.tripDuration} · {linked} master-linked item{linked !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-900">{getCurrSym(pkg.price?.currency)}{Number(pkg.price?.amount || 0).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-gray-400">{pkg.price?.currency}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-2.5">
            <Btn variant="secondary" className="w-full" onClick={() => setPage("master-activities")}><Ic.Activity />Manage Activities</Btn>
            <Btn variant="secondary" className="w-full" onClick={() => setPage("master-hotels")}><Ic.Hotel />Manage Hotels</Btn>
            <Btn variant="secondary" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" onClick={onOpenDuplicateModal}><Ic.Package />Duplicate Package</Btn>
            <div className="pt-2">
              <Btn variant="dashed" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => (window as any).handleGlobalSeed()}><Ic.Sync />Seed Demo Data (Safe)</Btn>
              <p className="text-[10px] text-blue-500 mt-1 text-center font-medium">✨ This will NOT delete existing data</p>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Catalog Health</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600"><span>Master activities linked</span><span className="font-bold text-emerald-700">{linkedActs}</span></div>
              <div className="flex justify-between text-gray-600"><span>Master hotels linked</span><span className="font-bold text-emerald-700">{linkedHotels}</span></div>
              <div className="flex justify-between text-gray-600"><span>Unlinked activities</span><span className={cls("font-bold", unlinkedActs > 0 ? "text-amber-600" : "text-gray-400")}>{unlinkedActs}</span></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── BOOKINGS PAGE ────────────────────────────────────────────────
const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-50 text-red-800 border-red-200",
};


// ─── SIDEBAR ──────────────────────────────────────────────────────
export const Sidebar = ({ page, setPage, counts }) => {
  const dispatch = useAppDispatch();
  const router = useNextRouter();
  const { user } = useAppSelector(state => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/");
  };
  const nav = [
    { key: "dashboard", label: "Dashboard", icon: <Ic.Dashboard />, group: "main" },
    { key: "packages", label: "Travel Packages", icon: <Ic.Package />, group: "main", badge: counts.packages },
    { key: "bookings", label: "Bookings", icon: <Ic.Booking />, group: "main", badge: counts.bookings },
    { key: "transfers", label: "Transfers", icon: <Ic.Car />, group: "main", badge: counts.transfers },
    { key: "coupons", label: "Coupons", icon: <Ic.Tag />, group: "main", badge: counts.coupons },

    { key: "page-cms", label: "Page CMS", icon: <Ic.Document />, group: "main" },
    { key: "locations", label: "Locations", icon: <Ic.Globe />, group: "main" },
    { key: "categories", label: "Categories", icon: <Ic.Tag />, group: "main" },
    { key: "trending", label: "Trending Destinations", icon: <Ic.Flame />, group: "main" },
    { key: "currencies", label: "Currencies", icon: <Ic.Sync />, group: "main", badge: counts.currencies },
    { key: "business-settings", label: "Business Settings", icon: <Ic.Star />, group: "main" },
    { key: "master-activities", label: "Activities", icon: <Ic.Activity />, group: "master", badge: counts.activities },
    { key: "master-hotels", label: "Hotels", icon: <Ic.Hotel />, group: "master", badge: counts.hotels },
  ];
  const isActive = (key) => key === "dashboard" ? page === "dashboard" : (key === "packages" ? ["packages", "create", "edit", "view"].includes(page) : page === key);
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-blue-950 text-white flex flex-col z-30 shadow-xl">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg"><Ic.Globe /></div>
          <div><div className="font-bold text-sm tracking-wide">Stay Vacation</div></div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="space-y-0.5">
          {nav.filter(n => n.group === "main").map(item => (
            <button key={item.key} onClick={() => setPage(item.key)}
              className={cls("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all", isActive(item.key) ? "bg-white/15 text-white" : "text-blue-300 hover:bg-white/8 hover:text-white")}>
              {item.icon}<span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && <span className={cls("text-xs px-2 py-0.5 rounded-full font-bold", isActive(item.key) ? "bg-white/20 text-white" : "bg-blue-900 text-blue-300")}>{item.badge}</span>}
            </button>
          ))}
        </div>
        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest px-3 pt-4 pb-2">Master Catalog</p>
        <div className="space-y-0.5">
          {nav.filter(n => n.group === "master").map(item => (
            <button key={item.key} onClick={() => setPage(item.key)}
              className={cls("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all", isActive(item.key) ? "bg-white/15 text-white" : "text-blue-300 hover:bg-white/8 hover:text-white")}>
              {item.icon}<span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && <span className={cls("text-xs px-2 py-0.5 rounded-full font-bold", isActive(item.key) ? "bg-white/20 text-white" : "bg-blue-900 text-blue-300")}>{item.badge}</span>}
            </button>
          ))}
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-white/10 bg-black/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">
            {user?.email?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-white truncate">{user?.email || "Admin User"}</p>
            <p className="text-[9px] text-blue-400 uppercase tracking-tighter">Administrator</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all uppercase tracking-wider"
        >
          <Ic.Logout className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
      <div className="px-5 py-3 border-t border-white/5 opacity-40"><p className="text-[9px] text-blue-600">© 2025 Stay Vacation</p></div>
    </aside>
  );
};

// ─── TOPBAR ───────────────────────────────────────────────────────
export const Topbar = ({ title, subtitle }) => (
  <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-gray-100 flex items-center px-6 z-20 shadow-sm">
    <div>
      <h1 className="text-base font-bold text-gray-900 leading-tight">{title}</h1>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </header>
);

// ─── APP ROOT ─────────────────────────────────────────────────────
export const AdminStateProvider = ({ children }: { children: React.ReactNode }) => {
  const handleSeed = async () => {
    if (!confirm("Are you sure? This will safely inject demo data. Existing user data will be kept intact.")) return;
    try {
      const result = await apiFetch<any>("/api/seed", { method: "POST" });
      alert(result.message || "Seed successful! Page will reload.");
      window.location.reload();
    } catch (e: any) {
      alert("Seed failed: " + e.message);
    }
  };

  useEffect(() => {
    (window as any).handleGlobalSeed = handleSeed;
  }, []);

  return (
    <>
      {children}
    </>
  );
};

// ─── TRANSFER FORM ───────────────────────────────────────────────
export const TransferForm = ({ initial, onSave, onCancel }: { initial: any; onSave: (d: any) => void; onCancel: () => void }) => {
  const [data, setData] = React.useState(initial);
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pickup Location</label>
          <Inp value={data.pickupLocation || ""} onChange={e => setData({ ...data, pickupLocation: e.target.value })} placeholder="e.g. Jaipur Airport" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Drop Location</label>
          <Inp value={data.dropLocation || ""} onChange={e => setData({ ...data, dropLocation: e.target.value })} placeholder="e.g. Hotel Rambagh Palace" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vehicle Type</label>
          <Sel value={data.vehicleType || "Sedan"} onChange={e => setData({ ...data, vehicleType: e.target.value })} options={["Sedan", "SUV", "Minivan", "Bus"]} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Average Duration</label>
          <Inp value={data.duration || ""} onChange={e => setData({ ...data, duration: e.target.value })} placeholder="e.g. 45 mins" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">{getCurrSym(data.currency)}</span>
            <Inp type="number" className="pl-8" value={data.price || 0} onChange={e => setData({ ...data, price: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Currency</label>
          <Sel value={data.currency || "INR"} onChange={e => setData({ ...data, currency: e.target.value })} options={["INR", "USD", "EUR"]} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Default Start Time</label>
          <Inp type="time" value={data.defaultStartTime || "08:00"} onChange={e => setData({ ...data, defaultStartTime: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Default End Time</label>
          <Inp type="time" value={data.defaultEndTime || "10:00"} onChange={e => setData({ ...data, defaultEndTime: e.target.value })} />
        </div>
      </div>
      <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
        <Btn variant="outline" onClick={onCancel}>Cancel</Btn>
        <Btn variant="success" onClick={() => onSave(data)}>Save Route</Btn>
      </div>
    </div>
  );
};

export const CategoryForm = ({ initial, onSave, onCancel }: { initial: Category; onSave: (d: Category) => void; onCancel: () => void }) => {
  const [data, setData] = useState<Category>(initial || emptyCategory());
  return (
    <div className="bg-white p-6 space-y-6">
       <div className="grid grid-cols-2 gap-6">
        {/* ─── Image Priority ─── */}
        <div className="col-span-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
          <FL required>Category Hero Image</FL>
          <div className="space-y-3 mt-2">
            <div className="flex gap-2">
               <Inp className="bg-white" value={data.image || ""} onChange={e => setData({ ...data, image: e.target.value })} placeholder="Enter image URL or upload below..." />
            </div>
            <ImageUploader 
              images={data.image ? [data.image] : []} 
              onAdd={url => setData({ ...data, image: url })} 
              onRemove={() => setData({ ...data, image: "" })} 
            />
            <p className="text-[10px] text-blue-400 italic flex items-center gap-1"><Ic.Info /> Recommended: 1200x600px. This image will represent this category across the site.</p>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1">
          <FL required>Category Name</FL>
          <Inp value={data.name} onChange={e => {
            const name = e.target.value;
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            setData({ ...data, name, slug });
          }} placeholder="e.g. Beach & Islands" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <FL required>Slug</FL>
          <Inp value={data.slug} onChange={e => setData({ ...data, slug: e.target.value })} placeholder="e.g. beach-islands" />
        </div>
        <div>
          <FL>Icon (Emoji or Icon Name)</FL>
          <Inp value={data.icon} onChange={e => setData({ ...data, icon: e.target.value })} placeholder="e.g. 🏖️" />
        </div>
        <div>
          <FL>Display Order</FL>
          <Inp type="number" value={data.order} onChange={e => setData({ ...data, order: Number(e.target.value) })} />
        </div>
        <div className="col-span-2">
          <FL>Description</FL>
          <TA value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} placeholder="Describe this category..." rows={3} />
        </div>
        <div className="col-span-2">
          <label className="flex items-center gap-3 cursor-pointer group p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
            <input type="checkbox" className="w-5 h-5 rounded accent-blue-600" checked={data.isActive} onChange={e => setData({ ...data, isActive: e.target.checked })} />
            <div>
              <p className="text-sm font-bold text-gray-900">Active</p>
              <p className="text-xs text-gray-400">Show this category on the website</p>
            </div>
          </label>
        </div>

        {/* ─── De-prioritized Visual Settings ─── */}
        <div className="col-span-2 border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fallback Styling</p>
            <span className="text-[10px] text-gray-300 font-medium bg-gray-50 px-2 py-0.5 rounded">Secondary Settings</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FL>Gradient Fallback</FL>
              <Inp value={data.color} onChange={e => setData({ ...data, color: e.target.value, gradient: e.target.value })} placeholder="from-cyan-400 to-blue-500" />
              <p className="text-[10px] text-gray-400 mt-1">Used if Hero Image is not provided.</p>
            </div>
            <div>
              <FL>Target Link (Override)</FL>
              <Inp value={data.link} onChange={e => setData({ ...data, link: e.target.value })} placeholder="/packages?type=Beach" />
            </div>
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 bg-white pt-6 pb-2 border-t border-gray-100 flex items-center justify-end gap-3 mt-8 z-20">
        <Btn variant="secondary" onClick={onCancel}>
          Cancel
        </Btn>
        <Btn variant="primary" onClick={() => onSave(data)} className="px-8 shadow-lg shadow-blue-600/20">
          Save Changes
        </Btn>
      </div>
    </div>
  );
};

export const CurrencyForm = ({ initial, onSave, onCancel }: { initial: any; onSave: (d: any) => void; onCancel: () => void }) => {
  const [data, setData] = useState(initial || { code: "", name: "", symbol: "", flag: "", exchangeRate: 1, isDefault: false, isEnabled: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.code || !data.name || !data.symbol) return alert("Please fill in all required fields.");
    onSave(data);
  };

  return (
    <div className="bg-white p-6 space-y-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="col-span-2 md:col-span-1">
          <FL required>Currency Code</FL>
          <Inp value={data.code} onChange={e => setData({ ...data, code: e.target.value.toUpperCase() })} placeholder="e.g. USD" maxLength={3} />
        </div>
        <div className="col-span-2 md:col-span-1">
          <FL required>Currency Name</FL>
          <Inp value={data.name} onChange={e => setData({ ...data, name: e.target.value })} placeholder="e.g. US Dollar" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <FL required>Symbol</FL>
          <Inp value={data.symbol} onChange={e => setData({ ...data, symbol: e.target.value })} placeholder="e.g. $" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <FL>Flag Emoji</FL>
          <Inp value={data.flag} onChange={e => setData({ ...data, flag: e.target.value })} placeholder="e.g. 🇺🇸" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <FL required>Exchange Rate (Relative to INR)</FL>
          <Inp type="number" step="0.000001" value={data.exchangeRate} onChange={e => setData({ ...data, exchangeRate: Number(e.target.value) })} />
          <p className="text-[10px] text-gray-500 mt-1">Example: If 1 INR = 0.012 USD, enter 0.012</p>
        </div>
        <div className="col-span-2 flex flex-col gap-4">
          <label className="flex items-center gap-3 cursor-pointer group p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
            <input type="checkbox" className="w-5 h-5 rounded accent-blue-600" checked={data.isDefault} onChange={e => setData({ ...data, isDefault: e.target.checked })} />
            <div>
              <p className="text-sm font-bold text-gray-900">Set as Default</p>
              <p className="text-xs text-gray-400">This currency will be the default for all users</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
            <input type="checkbox" className="w-5 h-5 rounded accent-blue-600" checked={data.isEnabled} onChange={e => setData({ ...data, isEnabled: e.target.checked })} />
            <div>
              <p className="text-sm font-bold text-gray-900">Enabled</p>
              <p className="text-xs text-gray-400">Toggle visibility on the frontend</p>
            </div>
          </label>
        </div>
        <div className="col-span-2 border-t border-gray-100 pt-6 flex justify-end gap-3">
          <Btn variant="outline" type="button" onClick={onCancel}>Cancel</Btn>
          <Btn variant="success" type="submit">Save Currency</Btn>
        </div>
      </form>
    </div>
  );
};
