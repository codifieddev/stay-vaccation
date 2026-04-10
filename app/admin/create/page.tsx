import { redirect } from "next/navigation";

// /admin/create was the old broken route - redirect to correct path
export default function AdminCreateRedirect() {
  redirect("/admin/packages/create");
}
