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
}

export interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}
