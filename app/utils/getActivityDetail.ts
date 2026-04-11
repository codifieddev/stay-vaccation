import { getDatabase } from "./getDatabase";

export async function getActivityDetail(citySlug: string, activitySlug: string) {
  try {
    const db = await getDatabase();
    // Case-insensitive query for robustness
    const detail = await db.collection("activity_details").findOne({
      $or: [
        { "activity.slug": { $regex: new RegExp(`^${activitySlug}$`, "i") } },
        { "activity.id": activitySlug }
      ]
    });

    if (detail) {
      return JSON.parse(JSON.stringify(detail.activity));
    }
    return null;
  } catch (error) {
    console.error("Error fetching activity detail:", error);
    return null;
  }
}
