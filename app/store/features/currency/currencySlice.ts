import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CurrencyState, Currency } from "./types";
import { fetchCurrencies } from "./currencyThunks";

const getInitialCurrency = (): Currency => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("selectedCurrency");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved currency", e);
      }
    }
  }
  return { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", exchangeRate: 1, isDefault: true, isEnabled: true };
};

const initialState: CurrencyState = {
  selectedCurrency: getInitialCurrency(),
  currencies: [],
  fxMarkup: 0,
  loading: false,
  error: null,
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency(state, action: PayloadAction<Currency>) {
      state.selectedCurrency = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem("selectedCurrency", JSON.stringify(action.payload));
      }
    },
    setAllCurrencies(state, action: PayloadAction<Currency[]>) {
      state.currencies = action.payload;
    },
    setFxMarkup(state, action: PayloadAction<number>) {
      state.fxMarkup = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrencies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrencies.fulfilled, (state, action) => {
        state.loading = false;
        const { currencies, fxMarkup } = action.payload as any;
        state.currencies = currencies;
        state.fxMarkup = fxMarkup;
        
        // Sync selectedCurrency with fresh data from DB (in case rates changed)
        const currentCode = state.selectedCurrency.code;
        const freshData = currencies.find((c: any) => c.code === currentCode && c.isEnabled);
        
        if (freshData) {
          state.selectedCurrency = freshData;
          if (typeof window !== 'undefined') {
            localStorage.setItem("selectedCurrency", JSON.stringify(freshData));
          }
        } else {
          // If previous selection is gone or disabled, fall back to default
          const defaultCurr = currencies.find((c: any) => c.isDefault && c.isEnabled);
          if (defaultCurr) {
             state.selectedCurrency = defaultCurr;
             if (typeof window !== 'undefined') {
               localStorage.setItem("selectedCurrency", JSON.stringify(defaultCurr));
             }
          }
        }
      })
      .addCase(fetchCurrencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrency, setAllCurrencies } = currencySlice.actions;
export default currencySlice.reducer;
