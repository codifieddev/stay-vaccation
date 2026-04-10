import EditPackageContent from "./EditPackageContent";

export const metadata = {
  title: "Edit Package — Stay Vacation",
  description: "Modify an existing travel package details and itinerary.",
};

export default function EditPackagePage({ params }: { params: { id: string } }) {
  return <EditPackageContent id={params.id} />;
}
