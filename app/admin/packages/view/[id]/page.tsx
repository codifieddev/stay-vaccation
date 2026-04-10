import ViewPackageContent from "./ViewPackageContent";

export const metadata = {
  title: "Package Details — Stay Vacation",
  description: "View complete details of a travel package.",
};

export default function ViewPackagePage({ params }: { params: { id: string } }) {
  return <ViewPackageContent id={params.id} />;
}
