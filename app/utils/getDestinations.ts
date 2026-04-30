import { getDatabase } from "./getDatabase";

export async function getDestinationBySlug(slug: string) {
  try {
    const db = await getDatabase();
    const destination = await db.collection("destinations").findOne({ slug });
    
    return destination ? JSON.parse(JSON.stringify(destination)) : null;
  } catch (error) {
    console.error("Error fetching destination:", error);
    return null;
  }
}

export async function getAllDestinations() {
  try {
    const db = await getDatabase();
    const destinations = await db.collection("destinations").find({ 
      $or: [
        { status: "Visible" },
        { isEnabled: true, status: { $exists: false } }
      ]
    }).sort({ displayOrder: 1 }).toArray();
    
    // Fetch real package counts
    const packageCounts = await db.collection("packages").aggregate([
      { $group: { _id: "$destinationSlug", count: { $sum: 1 } } }
    ]).toArray();
    
    const countMap: Record<string, number> = {};
    packageCounts.forEach(pc => {
      if (pc._id) countMap[pc._id] = pc.count;
    });

    const normalized = destinations.map(d => ({
      ...JSON.parse(JSON.stringify(d)),
      packageCount: countMap[d.slug] || 0
    }));

    return normalized;
  } catch (error) {
    console.error("Error fetching all destinations:", error);
    return [];
  }
}

export async function getAllDestinationsWithRegions() {
  try {
    const db = await getDatabase();

    const [destinations, regions, packageCounts, minPrices] = await Promise.all([
      db.collection("destinations").find({
        $or: [
          { status: "Visible" },
          { isEnabled: true, status: { $exists: false } }
        ]
      }).sort({ displayOrder: 1 }).toArray(),
      db.collection("regions").find({ isActive: { $ne: false } }).sort({ order: 1 }).toArray(),
      // Count packages per destination
      db.collection("packages").aggregate([
        { $group: { _id: "$destinationSlug", count: { $sum: 1 } } }
      ]).toArray(),
      // Min package price per destination slug
      db.collection("packages").aggregate([
        { $match: { "price.amount": { $exists: true, $gt: 0 } } },
        { $group: { _id: "$destinationSlug", minPrice: { $min: { $toDouble: "$price.amount" } } } }
      ]).toArray()
    ]);

    const countMap: Record<string, number> = {};
    packageCounts.forEach((pc: any) => {
      if (pc._id) countMap[pc._id] = pc.count;
    });

    const priceMap: Record<string, number> = {};
    minPrices.forEach((mp: any) => {
      if (mp._id && mp.minPrice > 0) priceMap[mp._id] = mp.minPrice;
    });

    const normalizedDestinations = destinations.map((d: any) => ({
      ...JSON.parse(JSON.stringify(d)),
      packageCount: countMap[d.slug] || 0,
      startingPrice: priceMap[d.slug] || 0,
    }));

    const normalizedRegions = JSON.parse(JSON.stringify(regions));

    return { destinations: normalizedDestinations, regions: normalizedRegions };
  } catch (error) {
    console.error("Error fetching destinations with regions:", error);
    return { destinations: [], regions: [] };
  }
}
export async function getAllCategories() {
  try {
    const db = await getDatabase();
    const categories = await db.collection("categories").find({ isActive: { $ne: false } }).sort({ order: 1 }).toArray();
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
