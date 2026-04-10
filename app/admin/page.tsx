import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Dashboard — Stay Vacation",
  description: "Overview of packages, bookings, transfers and revenue on the Stay Vacation admin dashboard.",
};

export default function AdminRootPage() {
  redirect("/admin/dashboard");
}
