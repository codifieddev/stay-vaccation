import AdminLayoutWrapper from "@/app/components/AdminLayoutWrapper";
import CurrenciesPageContent from "./CurrenciesPageContent";

export const metadata = {
  title: "Currency Settings — Admin Dashboard",
  description: "Manage sitewide currencies and exchange rates.",
};

export default function CurrenciesPage() {
  return (
    <AdminLayoutWrapper section="currencies">
      <CurrenciesPageContent />
    </AdminLayoutWrapper>
  );
}
