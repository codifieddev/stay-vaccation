import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../apiUtils";
import { BookingsState, Booking } from "./types";

export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async () => {
    return apiFetch<Booking[]>("/api/bookings");
  },
  {
    condition: (_, { getState }) => {
      const { bookings } = getState() as { bookings: BookingsState };
      if (bookings.loading || bookings.bookings.length > 0) {
        return false;
      }
    },
  }
);

export const updateBooking = createAsyncThunk(
  "bookings/updateBooking",
  async (booking: Booking) => {
    const res = await apiFetch<{ success: boolean; data?: Booking }>("/api/bookings", {
      method: "PUT",
      body: JSON.stringify(booking),
    });
    // Support either backend returning data or fallback to the input booking
    return (res as any).data || booking;
  }
);

export const deleteBooking = createAsyncThunk(
  "bookings/deleteBooking",
  async (id: string) => {
    await apiFetch(`/api/bookings?id=${id}`, {
      method: "DELETE",
    });
    return id;
  }
);
