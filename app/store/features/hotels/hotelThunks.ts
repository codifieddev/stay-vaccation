import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../apiUtils";
import { HotelsState } from "./types";
import { MasterHotel } from "@/app/components/AdminCore";

export const fetchHotels = createAsyncThunk(
  "hotels/fetchHotels",
  async () => {
    return apiFetch<MasterHotel[]>("/api/hotels");
  },
  {
    condition: (_, { getState }) => {
      const { hotels } = getState() as { hotels: HotelsState };
      if (hotels.loading || hotels.masterHotels.length > 0) {
        return false;
      }
    },
  }
);

export const createHotel = createAsyncThunk("hotels/createHotel", async (hotel: Partial<MasterHotel>) => {
  return apiFetch<MasterHotel>("/api/hotels", {
    method: "POST",
    body: JSON.stringify(hotel),
  });
});

export const updateHotel = createAsyncThunk("hotels/updateHotel", async (hotel: MasterHotel) => {
  return apiFetch<MasterHotel>(`/api/hotels`, {
    method: "PUT",
    body: JSON.stringify(hotel),
  });
});

export const deleteHotel = createAsyncThunk("hotels/deleteHotel", async (id: string) => {
  await apiFetch(`/api/hotels?id=${id}`, {
    method: "DELETE",
  });
  return id;
});
