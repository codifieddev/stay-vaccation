import { getAllDestinationsWithRegions, getAllCategories } from "@/app/utils/getDestinations";
import { getBestSellingPackages } from "@/app/utils/getPackages";
import DestinationsPageContent from "./DestinationsPageContent";

export const metadata = {
  title: "Explore All Destinations — Stay Vacation",
  description:
    "Browse all travel destinations across India and the world. Find your perfect holiday — beaches, mountains, heritage, and more.",
};

export const dynamic = "force-dynamic";

import { Suspense } from "react";

export default async function DestinationsPage() {
  const [{ destinations, regions }, bestSellers, categories] = await Promise.all([
    getAllDestinationsWithRegions(),
    getBestSellingPackages(8),
    getAllCategories(),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DestinationsPageContent
        destinations={destinations}
        regions={regions}
        bestSellers={bestSellers}
        categories={categories}
      />
    </Suspense>
  );
}
