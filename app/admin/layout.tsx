import React from "react";
import { AdminStateProvider } from "@/app/components/AdminCore";
import AdminLayoutWrapper from "@/app/components/AdminLayoutWrapper";

export const metadata = {
  title: "Admin Panel — Stay Vacation",
  description: "Manage packages, transfers, bookings, coupons and more from the Stay Vacation admin panel.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminStateProvider>
      <AdminLayoutWrapper>
        {children}
      </AdminLayoutWrapper>
    </AdminStateProvider>
  );
}
