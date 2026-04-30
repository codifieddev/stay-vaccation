import { getDatabase } from "./getDatabase";

/**
 * Fetches the top N packages sorted by price (ascending = best value / best sellers).
 * Only pulls lightweight fields needed for the card: title, images, price, duration, slug.
 */
export async function getBestSellingPackages(limit = 8) {
  try {
    const db = await getDatabase();

    const packages = await db
      .collection("packages")
      .find(
        { "price.amount": { $exists: true, $gt: 0 } },
        {
          projection: {
            _id: 1,
            id: 1,
            title: 1,
            images: 1,
            price: 1,
            tripDuration: 1,
            destination: 1,
            destinationSlug: 1,
            travelStyle: 1,
            shortDescription: 1,
          },
        }
      )
      .sort({ "price.amount": 1 })   // lowest price first = best value / best selling
      .limit(limit)
      .toArray();

    return packages.map((p: any) => ({
      id: p._id.toString(),
      title: p.title || "",
      images: Array.isArray(p.images) ? p.images : [],
      price: {
        currency: p.price?.currency || "INR",
        amount: Number(p.price?.amount) || 0,
        originalAmount: Number(p.price?.originalAmount) || 0,
      },
      tripDuration: p.tripDuration || "",
      destination: p.destination || "",
      destinationSlug: p.destinationSlug || "",
      travelStyle: p.travelStyle || "",
      shortDescription: p.shortDescription || "",
    }));
  } catch (error) {
    console.error("Error fetching best selling packages:", error);
    return [];
  }
}
