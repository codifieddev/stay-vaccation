export interface BookingPlan {
  id: string;
  fullName: string;
  email: string;
  destination: string;
  status: "pending" | "contacted" | "cancelled" | "completed";
  createdAt: string;
}

export interface BookingPlansState {
  bookingPlans: BookingPlan[];
  loading: boolean;
  error: string | null;
}
