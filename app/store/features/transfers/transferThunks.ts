import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../apiUtils";
import { TransfersState } from "./types";
import { TransferRecord } from "@/app/components/AdminCore";

export const fetchTransfers = createAsyncThunk(
  "transfers/fetchTransfers",
  async () => {
    return apiFetch<TransferRecord[]>("/api/transfers");
  },
  {
    condition: (_, { getState }) => {
      const { transfers } = getState() as { transfers: TransfersState };
      if (transfers.loading || transfers.transfers.length > 0) {
        return false;
      }
    },
  }
);

export const createTransfer = createAsyncThunk("transfers/createTransfer", async (transfer: Partial<TransferRecord>) => {
  return apiFetch<TransferRecord>("/api/transfers", {
    method: "POST",
    body: JSON.stringify(transfer),
  });
});

export const updateTransfer = createAsyncThunk("transfers/updateTransfer", async (transfer: TransferRecord) => {
  return apiFetch<TransferRecord>(`/api/transfers`, {
    method: "PUT",
    body: JSON.stringify(transfer),
  });
});

export const deleteTransfer = createAsyncThunk("transfers/deleteTransfer", async (id: string) => {
  await apiFetch(`/api/transfers?id=${id}`, {
    method: "DELETE",
  });
  return id;
});
