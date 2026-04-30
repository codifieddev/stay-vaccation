import { Metadata } from "next";
import { getDestinationBySlug } from "@/app/utils/getDestinations";
import { getActivitiesByDestination } from "@/app/utils/getActivities";
import ActivityClientPage from "@/app/components/ActivityClientPage";

export const dynamic = "force-dynamic";

async function getActivityData(slug: string) {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase();

  // Try to fetch Destination + Master Activities
  // If slug is "things-to-do-in-paris", try "paris"
  const cityMatch = cleanSlug.match(/things-to-do-in-(.+)/);
  const citySlug = cityMatch ? cityMatch[1] : cleanSlug;

  const destination = await getDestinationBySlug(citySlug);
  if (destination) {
    const activities = await getActivitiesByDestination(citySlug);
    return { destination, activities, slug: citySlug };
  }

  // Last attempt: Direct slug as destination
  const directDest = await getDestinationBySlug(cleanSlug);
  if (directDest) {
    const activities = await getActivitiesByDestination(cleanSlug);
    return { destination: directDest, activities, slug: cleanSlug };
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string }> }): Promise<Metadata> {
  const { citySlug } = await params;
  const result = await getActivityData(citySlug);

  if (result) {
    return {
      title: `Things to do in ${result.destination.name} | Stay Vacation`,
      description: result.destination.description || `Explore activities in ${result.destination.name}.`
    };
  }

  return { title: "Activities | Stay Vacation" };
}

export default async function Page({ params }: { params: Promise<{ citySlug: string }> }) {
  const { citySlug } = await params;
  const result = await getActivityData(citySlug);
  
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

  return (
    <ActivityClientPage
      destination={result.destination}
      initialActivities={result.activities}
      slug={result.slug}
    />
  );
}
