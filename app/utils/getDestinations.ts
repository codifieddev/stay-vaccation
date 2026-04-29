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
