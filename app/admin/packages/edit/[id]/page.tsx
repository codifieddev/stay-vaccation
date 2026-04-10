import EditPackageContent from "./EditPackageContent";

export const metadata = {
  title: "Edit Package — Stay Vacation",
  description: "Modify an existing travel package details and itinerary.",
};

// Next.js 15+: params is a Promise — must be an async server component
export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditPackageContent id={id} />;
}
