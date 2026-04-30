import { getAllDestinationsWithRegions, getAllCategories } from "@/app/utils/getDestinations";
import { getBestSellingPackages } from "@/app/utils/getPackages";
import DestinationsPageContent from "../DestinationsPageContent";
import { Suspense } from "react";

export const metadata = {
  title: "Explore International Destinations — Stay Vacation",
  description: "Discover top travel destinations around the world. Bali, Dubai, Maldives, Europe, and more — find your perfect global escape.",
};

export const dynamic = "force-dynamic";

export default async function InternationalDestinationsPage() {
  const [{ destinations, regions }, bestSellers, categories] = await Promise.all([
    getAllDestinationsWithRegions(),
    getBestSellingPackages(8, "International"),
    getAllCategories(),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DestinationsPageContent
        destinations={destinations}
        regions={regions}
        bestSellers={bestSellers}
        categories={categories}
        initialTypeOverride="international"
      />
    </Suspense>
  );
}
