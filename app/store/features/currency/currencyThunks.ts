import { createAsyncThunk } from "@reduxjs/toolkit";
import { Currency } from "./types";
import { apiFetch } from "../../apiUtils";

export const fetchCurrencies = createAsyncThunk(
  "currency/fetchCurrencies",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiFetch<any>("/api/currencies", { fullResponse: true });
      return {
        currencies: data.data as Currency[],
        fxMarkup: data.fxMarkup as number
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const syncCurrencies = createAsyncThunk(
  "currency/syncCurrencies",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const data = await apiFetch<any>("/api/currencies", { method: "PATCH" });
      dispatch(fetchCurrencies());
      return data.updatedCount;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createCurrency = createAsyncThunk(
  "currency/createCurrency",
  async (currency: Omit<Currency, "_id">, { rejectWithValue, dispatch }) => {
    try {
      const data = await apiFetch<Currency>("/api/currencies", {
        method: "POST",
        body: JSON.stringify(currency),
      });
      dispatch(fetchCurrencies());
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCurrency = createAsyncThunk(
  "currency/updateCurrency",
  async (currency: Currency, { rejectWithValue, dispatch }) => {
    try {
      const data = await apiFetch<Currency>("/api/currencies", {
        method: "PUT",
        body: JSON.stringify(currency),
      });
      dispatch(fetchCurrencies());
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteCurrency = createAsyncThunk(
  "currency/deleteCurrency",
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      await apiFetch(`/api/currencies?id=${id}`, {
        method: "DELETE",
      });
      dispatch(fetchCurrencies());
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateFxMarkup = createAsyncThunk(
  "currency/updateFxMarkup",
  async (markup: number, { rejectWithValue, dispatch }) => {
    try {
      await apiFetch("/api/currencies", {
        method: "POST",
        body: JSON.stringify({ type: "settings", fxMarkup: markup }),
      });
      dispatch(fetchCurrencies());
      return markup;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);
