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
    const destinations = await db.collection("destinations").find({ isEnabled: true }).toArray();
    
    return JSON.parse(JSON.stringify(destinations));
  } catch (error) {
    console.error("Error fetching all destinations:", error);
    return [];
  }
}
