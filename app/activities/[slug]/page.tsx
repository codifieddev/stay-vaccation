import ActivityPageContent from "./ActivityPageContent";
import ActivityClientPage from "@/app/components/ActivityClientPage";
import { getActivitiesByDestination } from "@/app/utils/getActivities";
import { getDestinationBySlug } from "@/app/utils/getDestinations";
import { Metadata } from "next";

async function getActivityData(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  // 1. Try to fetch CMS Activity Page
  try {
    const res = await fetch(`${baseUrl}/api/activity-pages/${slug}`, {
      next: { revalidate: 60 }
    });
    if (res.ok) {
      const d = await res.json();
      if (d.success && d.data) return { type: "cms", data: d.data };
    }
  } catch (e) {
    console.error("CMS FETCH ERROR", e);
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
