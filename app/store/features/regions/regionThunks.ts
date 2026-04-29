import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../apiUtils";
import { RegionsState } from "./types";
import { Region } from "@/app/components/AdminCore";

export const fetchRegions = createAsyncThunk(
  "regions/fetchRegions",
  async () => {
    return apiFetch<Region[]>("/api/regions");
  },
  {
    condition: (_, { getState }) => {
      const { regions } = getState() as { regions: RegionsState };
      if (regions.loading || regions.regions.length > 0) {
        return false;
      }
    },
  }
);

export const createRegion = createAsyncThunk("regions/createRegion", async (region: Partial<Region>) => {
  return apiFetch<Region>("/api/regions", {
    method: "POST",
    body: JSON.stringify(region),
  });
});

export const updateRegion = createAsyncThunk("regions/updateRegion", async (region: Region) => {
  return apiFetch<Region>(`/api/regions`, {
    method: "PUT",
    body: JSON.stringify(region),
  });
});

export const deleteRegion = createAsyncThunk("regions/deleteRegion", async (id: string) => {
  await apiFetch(`/api/regions?id=${id}`, {
    method: "DELETE",
  });
  return id;
});
