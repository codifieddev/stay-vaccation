import LayoutV2 from "../../layouts-v2/LayoutV2";
import CategoryHeroV2 from "../../sections-v2/categorydetails/CategoryHeroV2";
import CategoryPackagesGridV2 from "../../sections-v2/categorydetails/CategoryPackagesGridV2";
import CategoryTrustSectionV2 from "../../sections-v2/categorydetails/CategoryTrustSectionV2";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getCategory(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/categories?slug=${slug}`, { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (err) {
    console.error("Error fetching category:", err);
    return null;
  }
}

async function getPackagesByCategory(categoryId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/packages?categoryId=${categoryId}`, { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) {
    console.error("Error fetching packages by category:", err);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} Tour Packages — Stay Vacation`,
    description: category.description || `Explore our best ${category.name} travel packages and itineraries.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const packages = await getPackagesByCategory(category._id);

  return (
    <LayoutV2>
      {/* Category Hero */}
      <CategoryHeroV2 category={category} totalPackages={packages.length} />

      {/* Packages Grid */}
      <CategoryPackagesGridV2 category={category} packages={packages} />

      {/* Trust Badges */}
      <CategoryTrustSectionV2 categoryName={category.name} />
    </LayoutV2>
  );
}
