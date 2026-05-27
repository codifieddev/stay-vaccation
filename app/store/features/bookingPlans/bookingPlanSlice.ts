import { createSlice } from "@reduxjs/toolkit";
import { BookingPlansState } from "./types";
import { fetchBookingPlans, updateBookingPlan, deleteBookingPlan } from "./bookingPlanThunks";

const initialState: BookingPlansState = {
  bookingPlans: [],
  loading: false,
  error: null,
};

const bookingPlanSlice = createSlice({
  name: "bookingPlans",
  initialState,
  reducers: {
    addBookingPlan: (state, action) => {
      // Proactively add to state if submitted from client-side
      state.bookingPlans.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingPlans = action.payload;
      })
      .addCase(fetchBookingPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch booking plans";
      })
      .addCase(updateBookingPlan.fulfilled, (state, action) => {
        const index = state.bookingPlans.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.bookingPlans[index] = action.payload;
        }
      })
      .addCase(deleteBookingPlan.fulfilled, (state, action) => {
        state.bookingPlans = state.bookingPlans.filter((p) => p.id !== action.payload);
      });
  },
});

export const { addBookingPlan } = bookingPlanSlice.actions;
export default bookingPlanSlice.reducer;
