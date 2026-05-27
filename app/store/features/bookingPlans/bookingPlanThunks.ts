import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../apiUtils";
import { BookingPlansState, BookingPlan } from "./types";

export const fetchBookingPlans = createAsyncThunk(
  "bookingPlans/fetchBookingPlans",
  async () => {
    return apiFetch<BookingPlan[]>("/api/booking-plans");
  },
  {
    condition: (_, { getState }) => {
      const { bookingPlans } = getState() as { bookingPlans: BookingPlansState };
      if (bookingPlans.loading || bookingPlans.bookingPlans.length > 0) {
        return false;
      }
    },
  }
);

export const updateBookingPlan = createAsyncThunk(
  "bookingPlans/updateBookingPlan",
  async (plan: BookingPlan) => {
    const res = await apiFetch<{ success: boolean; data?: BookingPlan }>("/api/booking-plans", {
      method: "PUT",
      body: JSON.stringify(plan),
    });
    return (res as any).data || plan;
  }
);

export const deleteBookingPlan = createAsyncThunk(
  "bookingPlans/deleteBookingPlan",
  async (id: string) => {
    await apiFetch(`/api/booking-plans?id=${id}`, {
      method: "DELETE",
    });
    return id;
  }
);
