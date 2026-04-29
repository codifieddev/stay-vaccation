"use client";
import { useState, useMemo } from "react";
import { useCurrency } from "@/app/hooks/useCurrency";

import { Currency } from "@/app/store/features/currency/types";

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: Currency;
  onSelectCurrency: (currency: Currency) => void;
}

export default function CurrencyModal({ isOpen, onClose, selectedCurrency, onSelectCurrency }: CurrencyModalProps) {
  const { currencies } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");

  const enabledCurrencies = useMemo(() => currencies.filter(c => c.isEnabled), [currencies]);

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return enabledCurrencies;
    const lowerQ = searchQuery.toLowerCase();
    return enabledCurrencies.filter(
      (c) =>
        c.code.toLowerCase().includes(lowerQ) ||
        c.name.toLowerCase().includes(lowerQ)
    );
  }, [searchQuery, enabledCurrencies]);

  const commonCurrencies = useMemo(() => {
     // For now, let's just pick the first few or some specific ones if we had a field
     // Or just use the first 6 enabled ones as "Common"
     return enabledCurrencies.slice(0, 6);
  }, [enabledCurrencies]);

  if (!isOpen) return null;

  const CurrencyBtn = ({ curr }: { curr: Currency }) => {
    const isSelected = selectedCurrency.code === curr.code;
    return (
      <button
        onClick={() => {
          onSelectCurrency(curr);
          onClose();
        }}
        className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${
          isSelected 
            ? "bg-[#2fa3f2]/10 border border-[#2fa3f2]/30" 
            : "hover:bg-white/5 border border-transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{curr.flag}</span>
          <div className="text-left">
            <div className={`font-bold text-sm ${isSelected ? "text-[#2fa3f2]" : "text-white"}`}>{curr.code}</div>
            <div className="text-xs text-white/50">{curr.name}</div>
          </div>
        </div>
        <div className={`text-sm font-semibold ${isSelected ? "text-[#2fa3f2]" : "text-white/70"}`}>
          {curr.symbol}
        </div>
      </button>
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease" }}
      />
      
      <div
        className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4"
        style={{ animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <div
          className="rounded-3xl shadow-2xl overflow-hidden w-full flex flex-col max-h-[85vh]"
          style={{
            background: "rgba(15,42,53,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {/* Header */}
          <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-lg font-bold text-white">Select Currency</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search currency by code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all placeholder-white/30"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.13)" }}
                onFocus={(e) => { e.target.style.border = "1px solid #2fa3f2"; e.target.style.boxShadow = "0 0 0 3px rgba(47,163,242,0.18)"; }}
                onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.13)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 p-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
            {!searchQuery && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 px-2">Common Currencies</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {commonCurrencies.map(c => <CurrencyBtn key={`common-${c.code}`} curr={c} />)}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 px-2">
                {searchQuery ? "Search Results" : "All Currencies"}
              </h3>
              {filteredCurrencies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredCurrencies.map(c => <CurrencyBtn key={`all-${c.code}`} curr={c} />)}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40 text-sm">
                  No currencies found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
