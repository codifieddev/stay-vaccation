import { Metadata } from "next";
import { getDatabase } from "@/app/utils/getDatabase";
import { getDestinationBySlug } from "@/app/utils/getDestinations";
import { getActivitiesByDestination } from "@/app/utils/getActivities";
import ActivityPageContent from "./ActivityPageContent";
import ActivityClientPage from "@/app/components/ActivityClientPage";

export const dynamic = "force-dynamic";

async function getActivityData(slug: string) {
  // 1. Try to fetch CMS Activity Page DIRECTLY FROM DB
  try {
    const db = await getDatabase();
    const cmsPage = await db.collection("activity_pages").findOne({ slug });
    
    if (cmsPage) {
      // Convert to plain object to avoid serialization issues
      return { type: "cms", data: JSON.parse(JSON.stringify(cmsPage)) };
    }
  } catch (e) {
    console.error("CMS DB FETCH ERROR", e);
  }

  // 2. Fallback: Try to fetch Destination + Master Activities
  const destination = await getDestinationBySlug(slug);
  if (destination) {
    const activities = await getActivitiesByDestination(slug);
    return { type: "fallback", data: { destination, activities, slug } };
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getActivityData(slug);
  
  if (result?.type === "cms") {
    return {
      title: `Things to do in ${result.data.city} | Stay Vacation`,
      description: result.data.description?.short || "Explore the best activities."
    };
  } else if (result?.type === "fallback") {
    return {
      title: `Things to do in ${result.data.destination.name} | Stay Vacation`,
      description: result.data.destination.description || `Explore activities in ${result.data.destination.name}.`
    };
  }

  return { title: "Activities | Stay Vacation" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getActivityData(slug);
  
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-black text-[#1a3f4e] mb-4">404</h1>
          <p className="text-gray-500 font-medium">We couldn't find any activities for this location.</p>
        </div>
      </div>
    );
  }

  if (result.type === "cms") {
    return <ActivityPageContent page={result.data} />;
  }

  return (
    <ActivityClientPage 
      destination={result.data.destination}
      initialActivities={result.data.activities}
      slug={result.data.slug}
    />
  );
}

