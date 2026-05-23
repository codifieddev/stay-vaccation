import { MasterActivity } from "../activities/types";
import { MasterHotel } from "../hotels/types";

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
  activityData?: MasterActivity;
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
  hotelData?: MasterHotel;
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
  day: number;
  dayNumber: number;
  title: string;
  city?: string;
  dayType?: string;
  mealsIncluded?: string[];
  notes?: string;
  description: string;
  images: string[];
  hotelStays?: DayHotel[];
  transfers?: Transfer[];
  activities?: DayActivity[];
}



export interface PackageReview {
  id?: string;
  name: string;
  rating: number;
  comment: string;
}

export interface PackageHotel {
  id?: string;
  name: string;
  location: string;
  image: string;
}

export interface PackagePolicies {
  cancellation: string;
  refund: string;
  confirmation: string;
}

export interface Package {
  id: string;
  _id?: string;
  slug?: string;
  title: string;
  destination: string; // logically maps to "location"
  destinationId?: string;
  destinationSlug?: string;
  categoryId?: string;
  categorySlug?: string;
  tripDuration: string; // logically maps to "duration"
  travelStyle: string;
  tourType?: string;
  exclusivityLevel?: string;
  price: {
    currency: string;
    amount: number | string;
    originalAmount?: number;
  };
  rating?: number;
  shortDescription: string;
  summary?: {
    description?: string;
    tags?: string[];
  };
  highlights?: string[];
  availability?: {
    availableMonths: string[];
    fixedDepartureDates: string[];
    blackoutDates: string[];
  };
  inclusions?: string[];
  exclusions?: string[];
  knowBeforeYouGo?: KBYG[];
  additionalInfo?: {
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
  faqs?: Faq[];
  itinerary?: ItineraryDay[];

  // New premium schema alignment
  location?: string;
  duration?: string;
  hotels?: PackageHotel[];
  transfers?: string[];
  activities?: string[];
  policies?: PackagePolicies;
  reviews?: PackageReview[];

  // Legacy fields (kept for compatibility)
  hotelsList?: PackageHotel[];
  transfersList?: string[];
  activitiesList?: string[];


  coverImage?: string;
  images?: string[];
  maxTravelersLimit?: number;
  availableSeats?: number;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PackagesState {
  packages: Package[];
  loading: boolean;
  error: string | null;
}
