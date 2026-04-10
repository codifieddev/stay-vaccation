import { getDatabase } from "./getDatabase";

export async function getActivitiesByDestination(slug: string) {
  try {
    const db = await getDatabase();
    const activities = await db.collection("activities").find({ 
      destinationSlug: slug,
      isEnabled: true 
    }).toArray();
    
    return JSON.parse(JSON.stringify(activities));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
}
