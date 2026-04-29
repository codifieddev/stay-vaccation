export interface Currency {
  _id?: string;
  code: string;
  name: string;
  symbol: string;
  flag: string;
  exchangeRate: number; // rate relative to INR
  isDefault: boolean;
  isEnabled: boolean;
}

export interface CurrencyState {
  selectedCurrency: Currency;
  currencies: Currency[];
  fxMarkup: number; // e.g. 0.02 for 2% buffer
  loading: boolean;
  error: string | null;
}
