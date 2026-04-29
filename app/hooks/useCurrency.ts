import { useAppSelector } from "@/app/store/hooks";

export function useCurrency() {
  const { selectedCurrency, currencies, fxMarkup } = useAppSelector((state) => state.currency);

  const convert = (amount: number | string | undefined | null, baseCurrency: string = "INR") => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      return {
        amount: 0,
        amountFormatted: "0",
        symbol: selectedCurrency.symbol,
        code: selectedCurrency.code,
      };
    }

    const rates: Record<string, number> = {};
    currencies.forEach(c => {
      rates[c.code] = c.exchangeRate;
    });
    
    // Ensure the currently selected currency's rate is available even if the full list isn't yet (hydration)
    if (!rates[selectedCurrency.code]) {
      rates[selectedCurrency.code] = selectedCurrency.exchangeRate;
    }
    if (!rates["INR"]) {
      rates["INR"] = 1;
    }

    const baseRate = rates[baseCurrency] || 1;
    const amountInINR = numAmount / baseRate;
    const targetRate = rates[selectedCurrency.code] || 1;
    
    // Apply FX Markup Buffer (Optional configurable buffer for stable travel pricing)
    const markupMultiplier = selectedCurrency.code !== "INR" ? (1 + fxMarkup) : 1;
    let finalAmount = amountInINR * targetRate * markupMultiplier;

    // Apply Rounding Rules for "Clean Display Pricing"
    if (selectedCurrency.code === "INR") {
      if (finalAmount >= 10000) {
        finalAmount = Math.round(finalAmount / 1000) * 1000;
      } else if (finalAmount >= 2000) {
        finalAmount = Math.round(finalAmount / 500) * 500;
      } else {
        finalAmount = Math.round(finalAmount / 100) * 100;
      }
    } else {
      // USD and all other international currencies: round to whole numbers
      finalAmount = Math.round(finalAmount);
    }

    return {
      amount: finalAmount,
      amountFormatted: selectedCurrency.code === "INR" 
        ? finalAmount.toLocaleString("en-IN") 
        : finalAmount.toLocaleString("en-US"),
      symbol: selectedCurrency.symbol,
      code: selectedCurrency.code,
    };
  };

  const formatPrice = (amount: number | string | undefined | null, baseCurrency: string = "INR") => {
    const res = convert(amount, baseCurrency);
    if (!res.amount && amount !== 0) return "—";
    return `${res.symbol}${res.amountFormatted}`;
  };

  return { selectedCurrency, convert, formatPrice, currencies };
}
