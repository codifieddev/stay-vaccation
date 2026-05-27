import LayoutV2 from "../layouts-v2/LayoutV2";
import CategoriesHero from "../sections-v2/categoriespage/categoriesHero/CategoriesHero";
import CategoriesList from "../sections-v2/categoriespage/categories/CategoriesList";
import ButtonV2 from "../components-v2/ButtonV2";
import LucideIcon from "../components/LucideIcon";
import { getCategoryIcon } from "../utils/categoryMapping";

export const metadata = {
  title: "Tour Categories — Stay Vacation",
  description: "Browse our travel packages by category — Beach, Adventure, Heritage, Honeymoon, Family tours and more.",
};

async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/categories`, { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

async function getPackages() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/packages`, { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const [categories, packages] = await Promise.all([
    getCategories(),
    getPackages()
  ]);

  // Map package counts to categories
  const categoriesWithCount = categories.map((cat: any) => {
    const count = packages.filter((pkg: any) => pkg.categoryId === cat._id).length;
    return { ...cat, packageCount: count };
  });

  return (
    <LayoutV2>
      <CategoriesHero />

      <CategoriesList categories={categoriesWithCount} />

      {/* CTA Section */}
      <section style={{ padding: '6rem 0', background: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
        <div className="container-v2" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text)' }}>
            Can't find what you're looking for?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Our travel experts can craft a completely custom itinerary based on your preferences, budget, and travel dates. Let's build your dream trip together.
          </p>
          <ButtonV2 href="/contact" variant="orange" pulse>Request Custom Package</ButtonV2>
        </div>
      </section>
    </LayoutV2>
  );
}
