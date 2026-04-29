import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../apiUtils";
import { PackagesState } from "./types";
import { Package } from "@/app/components/AdminCore";

export const fetchPackages = createAsyncThunk(
  "packages/fetchPackages",
  async () => {
    return apiFetch<Package[]>("/api/packages");
  },
  {
    condition: (_, { getState }) => {
      const { packages } = getState() as { packages: PackagesState };
      if (packages.loading || packages.packages.length > 0) {
        return false;
      }
    },
  }
);

export const createPackage = createAsyncThunk("packages/createPackage", async (pkg: Partial<Package>) => {
  return apiFetch<Package>("/api/packages", {
    method: "POST",
    body: JSON.stringify(pkg),
  });
});

export const updatePackage = createAsyncThunk("packages/updatePackage", async (pkg: Package) => {
  return apiFetch<Package>(`/api/packages`, {
    method: "PUT",
    body: JSON.stringify(pkg),
  });
});

export const deletePackage = createAsyncThunk("packages/deletePackage", async (id: string) => {
  await apiFetch(`/api/packages?id=${id}`, {
    method: "DELETE",
  });
  return id;
});

export const importPackages = createAsyncThunk("packages/importPackages", async (data: any[]) => {
  return apiFetch<{ imported: number; skipped: number; total: number; errors: any[] }>("/api/packages/import", {
    method: "POST",
    body: JSON.stringify(data),
  });
});
