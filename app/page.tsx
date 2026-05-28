import LayoutV2 from "./layouts-v2/LayoutV2";
import HeroSection from "./sections-v2/homepage/HeroSection/HeroSection";
import TopDestinations from "./sections-v2/homepage/topDestinations/TopDestinations";
import FeaturedToursSectionV2 from "./sections-v2/FeaturedToursSectionV2";
import WhyStayVacation from "./sections-v2/homepage/whyStayVacation/WhyStayVacation";
import OurImpact from "./sections-v2/homepage/ourImpact/OurImpact";
import TravelerStories from "./sections-v2/homepage/travelerStories/TravelerStories";
import FaqSection from "./sections-v2/homepage/FaqSection/FaqSection";
import BookingPlan from "./sections-v2/homepage/bookingPlan/BookingPlan";
import NewsletterSectionV2 from "./sections-v2/NewsletterSectionV2";
import { getAllDestinations } from "./utils/getDestinations";

export const dynamic = "force-dynamic";

async function getPackages() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/packages`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

async function getHomepageSettings() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/homepage`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

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

export default async function HomePage() {
  const [packages, destinations, settings, categories] = await Promise.all([
    getPackages(),
    getAllDestinations(),
    getHomepageSettings(),
    getCategories()
  ]);

  // Map packages to V2 TourPackage interface
  const v2Packages = packages.map((pkg: any) => ({
    id: pkg.id || pkg._id,
    name: pkg.name,
    image: pkg.coverImage || pkg.images?.[0] || pkg.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    rating: pkg.rating || 4.8,
    reviewCount: pkg.reviews || 0,
    category: pkg.categoryName || 'Tour',
    duration: pkg.duration || 'Flexible',
    maxPeople: pkg.maxPeople || 10,
    price: pkg.price,
    badge: pkg.isFeatured ? 'Featured' : undefined
  }));

  // Map destinations to V2 Destination interface
  const v2Destinations = destinations.map((dest: any) => ({
    id: dest.slug,
    name: dest.name,
    slug: dest.slug,
    image: dest.image || 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop&q=80',
    rating: dest.rating || 4.9,
    price: dest.startingPrice,
    tag: dest.isPopular ? '🏆 Most Popular' : undefined,
    category: dest.type || 'Escape',
    packageCount: dest.packageCount || 0,
    displayOrder: dest.displayOrder !== undefined ? dest.displayOrder : 999
  }));

  // Find the sections in settings
  const heroSection = settings?.sections?.find((s: any) => s.type === "hero-section" || s.adminTitle?.toLowerCase().includes("hero"));
  const faqSection = settings?.sections?.find((s: any) => s.type === "faq-section" || s.adminTitle?.toLowerCase().includes("faq"));
  const destinationsSection = settings?.sections?.find((s: any) => s.type === "destinations-section" || s.adminTitle?.toLowerCase().includes("destinations"));

  return (
    <LayoutV2>
      <HeroSection section={heroSection} destinations={v2Destinations} />

      <TopDestinations section={destinationsSection} destinations={v2Destinations} />
      <FeaturedToursSectionV2 packages={v2Packages} />
      <WhyStayVacation />
      <OurImpact />
      <TravelerStories />
      <FaqSection section={faqSection} />
      <BookingPlan />
      <NewsletterSectionV2 />
    </LayoutV2>
  );
}