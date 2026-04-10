import ViewPackageContent from "./ViewPackageContent";

export const metadata = {
  title: "Package Details — Stay Vacation",
  description: "View complete details of a travel package.",
};

// Next.js 15+: params is a Promise — must be an async server component
export default async function ViewPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ViewPackageContent id={id} />;
}
