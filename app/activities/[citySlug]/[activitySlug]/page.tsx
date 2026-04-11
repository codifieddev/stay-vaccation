import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActivityDetail } from "@/app/utils/getActivityDetail";
import ActivityDetailContent from "./ActivityDetailContent";

interface PageProps {
  params: Promise<{
    citySlug: string;
    activitySlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { citySlug, activitySlug } = await params;
  const activity = await getActivityDetail(citySlug, activitySlug);

  if (!activity) {
    return {
      title: "Activity Not Found | Stay Vacation",
    };
  }

  // Activity data is under the "activity" key in the JSON format provided
  const data = activity.activity || activity;

  return {
    title: `${data.title} | ${data.location || "Stay Vacation"}`,
    description: data.overview?.about || "Explore beautiful activities with Stay Vacation.",
  };
}

export default async function ActivityPage({ params }: PageProps) {
  const { citySlug, activitySlug } = await params;
  const activity = await getActivityDetail(citySlug, activitySlug);

  if (!activity) {
    notFound();
  }

  // Consistent with the JSON format provided, activity data is nested under "activity"
  return <ActivityDetailContent activity={activity.activity || activity} />;
}
