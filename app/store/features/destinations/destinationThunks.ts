import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../apiUtils";
import { DestinationsState } from "./types";
import { Destination } from "@/app/components/AdminCore";

export const fetchDestinations = createAsyncThunk(
  "destinations/fetchDestinations",
  async () => {
    return apiFetch<Destination[]>("/api/destinations");
  },
  {
    condition: (_, { getState }) => {
      const { destinations } = getState() as { destinations: DestinationsState };
      if (destinations.loading || destinations.destinations.length > 0) {
        return false;
      }
    },
  }
);

export const fetchTrending = createAsyncThunk(
  "destinations/fetchTrending",
  async (category: "India" | "International") => {
    const data = await apiFetch<Destination[]>(`/api/destinations?trending=true&category=${category}&hideEmpty=true`);
    return { data, category };
  }
);

export const createDestination = createAsyncThunk("destinations/createDestination", async (dest: Partial<Destination>) => {
  return apiFetch<Destination>("/api/destinations", {
    method: "POST",
    body: JSON.stringify(dest),
  });
});

export const updateDestination = createAsyncThunk("destinations/updateDestination", async (dest: Destination) => {
  return apiFetch<Destination>(`/api/destinations`, {
    method: "PUT",
    body: JSON.stringify(dest),
  });
});

export const deleteDestination = createAsyncThunk("destinations/deleteDestination", async (id: string) => {
  await apiFetch(`/api/destinations?id=${id}`, {
    method: "DELETE",
  });
  return id;
});
