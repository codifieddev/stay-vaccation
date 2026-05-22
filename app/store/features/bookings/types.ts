export interface Booking {
  id: string;
  bookingId: string;
  userId: string;
  packageId?: string;
  packageName?: string;
  packageTitle?: string;
  totalAmount: number;
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
  paymentId?: string;
  orderId?: string;
  signature?: string;
  transactionDetails?: any;
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

export interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}
