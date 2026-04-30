import { getAllDestinationsWithRegions, getAllCategories } from "@/app/utils/getDestinations";
import { getBestSellingPackages } from "@/app/utils/getPackages";
import DestinationsPageContent from "../DestinationsPageContent";
import { Suspense } from "react";

export const metadata = {
  title: "Explore India Destinations — Stay Vacation",
  description: "Browse top travel destinations across India. From the Himalayas to Kerala backwaters — find your perfect Indian holiday.",
};

export const dynamic = "force-dynamic";

export default async function IndiaDestinationsPage() {
  const [{ destinations, regions }, bestSellers, categories] = await Promise.all([
    getAllDestinationsWithRegions(),
    getBestSellingPackages(8, "India"),
    getAllCategories(),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DestinationsPageContent
        destinations={destinations}
        regions={regions}
        bestSellers={bestSellers}
        categories={categories}
        initialTypeOverride="india"
      />
    </Suspense>
  );
}
