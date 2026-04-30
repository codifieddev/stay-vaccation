import { getDatabase } from "./getDatabase";

/**
 * Fetches the top N packages sorted by price (ascending = best value / best sellers).
 * Only pulls lightweight fields needed for the card: title, images, price, duration, slug.
 */
export async function getBestSellingPackages(limit = 8, category?: string) {
  try {
    const db = await getDatabase();

    const pipeline: any[] = [
      { $match: { "price.amount": { $exists: true, $gt: 0 } } },
    ];

    if (category) {
      pipeline.push(
        {
          $lookup: {
            from: "destinations",
            localField: "destinationSlug",
            foreignField: "slug",
            as: "destinationInfo",
          },
        },
        { $unwind: "$destinationInfo" },
        { $match: { "destinationInfo.category": category } }
      );
    }

    pipeline.push(
      { $sort: { "price.amount": 1 } },
      { $limit: limit },
      {
        $project: {
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
    );

    const packages = await db.collection("packages").aggregate(pipeline).toArray();

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
