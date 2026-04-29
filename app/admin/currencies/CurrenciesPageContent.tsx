"use client";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { createCurrency, updateCurrency, deleteCurrency, syncCurrencies, updateFxMarkup } from "@/app/store/features/currency/currencyThunks";
import { Btn, Card, Ic, Modal, CurrencyForm, Badge, Inp, FL } from "@/app/components/AdminCore";
import { Currency } from "@/app/store/features/currency/types";

export default function CurrenciesPageContent() {
  const dispatch = useAppDispatch();
  const { currencies, loading, fxMarkup } = useAppSelector(state => state.currency);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [localMarkup, setLocalMarkup] = useState(fxMarkup * 100);

  // Sync local state when global state loads
  React.useEffect(() => {
    setLocalMarkup(fxMarkup * 100);
  }, [fxMarkup]);

  const handleSaveMarkup = async () => {
    try {
      await dispatch(updateFxMarkup(localMarkup / 100)).unwrap();
      alert("Markup settings saved!");
    } catch (err: any) {
      alert("Failed to save markup: " + err);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingCurrency?._id) {
        await dispatch(updateCurrency({ ...data, _id: editingCurrency._id }));
      } else {
        await dispatch(createCurrency(data));
      }
      setIsModalOpen(false);
      setEditingCurrency(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save currency");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this currency?")) return;
    try {
      await dispatch(deleteCurrency(id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete currency");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Currencies</h2>
          <p className="text-sm text-gray-500">Manage sitewide currencies and exchange rates (relative to INR)</p>
        </div>
        <div className="flex gap-3">
          <Btn 
            variant="outline" 
            onClick={async () => {
              if (!confirm("Update all exchange rates with live market data (Base: INR)?")) return;
              try {
                const result = await dispatch(syncCurrencies()).unwrap();
                alert(`Success: ${result} currencies updated!`);
              } catch (err: any) {
                alert("Sync failed: " + err);
              }
            }}
            disabled={loading}
          >
            <Ic.Sync className={loading ? "animate-spin" : ""} /> Sync with Market
          </Btn>
          <Btn variant="primary" onClick={() => { setEditingCurrency(null); setIsModalOpen(true); }}>
            <Ic.Plus /> Add Currency
          </Btn>
        </div>
      </div>

      <Card className="p-6 border-blue-100 bg-blue-50/30">
        <div className="flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Ic.Sync className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900">Pricing Stability & FX Markup Buffer</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl">
              This global buffer is added on top of market exchange rates to account for currency volatility. 
              Markup is only applied when converting from INR to international currencies.
            </p>
            <div className="mt-4 flex items-end gap-4">
              <div className="w-48">
                <FL>Global FX Markup (%)</FL>
                <div className="relative">
                  <Inp 
                    type="number" 
                    step="0.1"
                    value={localMarkup} 
                    onChange={e => setLocalMarkup(Number(e.target.value))} 
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
                </div>
              </div>
              <Btn variant="primary" onClick={handleSaveMarkup} disabled={loading}>
                Save Settings
              </Btn>
              {fxMarkup > 0 && (
                <div className="flex-1 flex items-center gap-2 mb-2">
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    Active Buffer: {(fxMarkup * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Currency</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Exchange Rate (vs INR)</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currencies.map((curr) => (
              <tr key={curr._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{curr.flag}</span>
                    <div>
                      <p className="font-bold text-gray-900">{curr.code}</p>
                      <p className="text-xs text-gray-500">{curr.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-gray-700">{curr.symbol}</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700">
                  {curr.exchangeRate}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {curr.isDefault && <Badge className="bg-blue-50 text-blue-700 border-blue-100">Default</Badge>}
                    {curr.isEnabled ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">Enabled</Badge>
                    ) : (
                      <Badge className="bg-gray-50 text-gray-500 border-gray-100">Disabled</Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setEditingCurrency(curr); setIsModalOpen(true); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Ic.Edit />
                    </button>
                    {!curr.isDefault && (
                      <button
                        onClick={() => handleDelete(curr._id!)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Ic.Trash />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {currencies.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No currencies configured. Add your first currency to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCurrency(null); }}
        title={editingCurrency ? "Edit Currency" : "Add New Currency"}
      >
        <CurrencyForm
          initial={editingCurrency}
          onSave={handleSave}
          onCancel={() => { setIsModalOpen(false); setEditingCurrency(null); }}
        />
      </Modal>
    </div>
  );
}
