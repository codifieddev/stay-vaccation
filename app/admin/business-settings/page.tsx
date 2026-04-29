"use client";

import React, { useState, useEffect } from "react";
import { Card, Inp, FL, TA, Btn, ImageUploader, Ic } from "@/app/components/AdminCore";
import { apiFetch } from "@/app/store/apiUtils";

export default function BusinessSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    businessName: "",
    address: "",
    phoneNumber: "",
    email: "",
    logo: "",
    facebook: "",
    instagram: "",
    twitter: "",
    footerText: ""
  });

  useEffect(() => {
    apiFetch<any>("/api/business-settings").then(data => {
      setForm({
        businessName: data.businessName || "",
        address: data.address || "",
        phoneNumber: data.phoneNumber || "",
        email: data.email || "",
        logo: data.logo || "",
        facebook: data.facebook || "",
        instagram: data.instagram || "",
        twitter: data.twitter || "",
        footerText: data.footerText || ""
      });
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch settings", err);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
      const data = await apiFetch<any>("/api/business-settings", {
        method: "PUT",
        body: JSON.stringify(form)
      });
      alert(data.message || "Settings saved successfully! ✅");
    } catch(err: any) {
      console.error(err);
      alert("Error saving settings: " + err.message);
    }
  };

  const upd = (k: string, v: string) => setForm(prev => ({...prev, [k]: v}));

  if(loading) return <div className="py-16 text-center text-gray-500 font-semibold">Loading Settings...</div>;

  return (
    <div className="space-y-5">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <div className="text-blue-600 mt-0.5"><Ic.Info /></div>
        <div>
          <p className="text-sm font-semibold text-blue-900">Global Business Settings</p>
          <p className="text-xs text-blue-700 mt-0.5">These settings reflect across all customer-facing pages dynamically.</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <FL required>Business Name</FL>
            <Inp placeholder="e.g. Stay Vacation" value={form.businessName} onChange={e => upd("businessName", e.target.value)} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <FL>Email Address</FL>
            <Inp placeholder="e.g. contact@stayvacation.com" value={form.email} onChange={e => upd("email", e.target.value)} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <FL>Phone Number</FL>
            <Inp placeholder="e.g. +1 234 567 890" value={form.phoneNumber} onChange={e => upd("phoneNumber", e.target.value)} />
          </div>
          <div className="col-span-2 md:col-span-1">
            <FL>HQ Address</FL>
            <Inp placeholder="e.g. 123 Travel Street, NY" value={form.address} onChange={e => upd("address", e.target.value)} />
          </div>

          <div className="col-span-2">
            <FL>Footer Text</FL>
            <TA rows={3} placeholder="Brief description shown in the footer..." value={form.footerText} onChange={e => upd("footerText", e.target.value)} />
          </div>

          <div className="col-span-2 md:col-span-1">
            <FL>Social Links</FL>
            <div className="space-y-3 mt-1.5">
              <div className="flex items-center gap-3">
                <span className="w-24 text-xs font-semibold text-gray-600">Facebook</span>
                <Inp placeholder="https://facebook.com/..." value={form.facebook} onChange={e => upd("facebook", e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 text-xs font-semibold text-gray-600">Instagram</span>
                <Inp placeholder="https://instagram.com/..." value={form.instagram} onChange={e => upd("instagram", e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 text-xs font-semibold text-gray-600">Twitter (X)</span>
                <Inp placeholder="https://twitter.com/..." value={form.twitter} onChange={e => upd("twitter", e.target.value)} />
              </div>
            </div>
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <FL>Brand Logo</FL>
            <div className="mt-1.5 max-w-[12rem]">
              <ImageUploader images={form.logo ? [form.logo] : []} onAdd={url => upd("logo", url)} onRemove={() => upd("logo", "")} label="" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-5 mt-6 border-t border-gray-100">
          <Btn variant="success" onClick={handleSave}>✓ Save Settings</Btn>
        </div>
      </Card>
    </div>
  );
}
