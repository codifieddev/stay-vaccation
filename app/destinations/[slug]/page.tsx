import { getDatabase } from "../../utils/getDatabase";
import { ObjectId } from "mongodb";
import Navbar from "../../components/frontend/Navbar";
import Footer from "../../components/frontend/Footer";
import PackageCard from "../../components/frontend/PackageCard";
import FilteredPackageList from "../../components/frontend/FilteredPackageList";
import SearchBar from "../../components/frontend/SearchBar";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Destination {
  _id?: string;
  title: string;
  slug: string;
  image?: string;
  label?: string;
  type?: string;
  description?: string;
}

const FALLBACK_DESTINATIONS: Destination[] = [
  // INDIA & AROUND
  { title: "Kashmir", slug: "kashmir", image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Paradise on Earth" },
  { title: "Goa", slug: "goa", image: "https://images.unsplash.com/photo-1512356181113-853a150f1ea7?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Sun, Sand & Sea" },
  { title: "Himachal", slug: "himachal", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Valley of Gods" },
  { title: "Manali", slug: "manali", image: "https://images.unsplash.com/photo-1594142571210-9cf63657739f?q=80&w=1974&auto=format&fit=crop", type: "india", label: "Mountain Escapes" },
  { title: "Kerala", slug: "kerala", image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2069&auto=format&fit=crop", type: "india", label: "Backwater Bliss" },
  { title: "Jaipur", slug: "jaipur", image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=2071&auto=format&fit=crop", type: "india", label: "The Pink City" },
  { title: "Munnar", slug: "munnar", image: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Tea Garden Serenity" },
  { title: "Andaman", slug: "andaman", image: "https://images.unsplash.com/photo-1589330273594-fade1ee91647?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Crystal Waters" },
  { title: "Leh Ladakh", slug: "leh-ladakh", image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=2070&auto=format&fit=crop", type: "india", label: "High Pass Adventure" },

  // INTERNATIONAL
  { title: "Thailand", slug: "thailand", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Tropical Gateway" },
  { title: "Bali", slug: "bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1938&auto=format&fit=crop", type: "international", label: "Island of Gods" },
  { title: "Dubai", slug: "dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Luxury & Innovation" },
  { title: "Paris", slug: "paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop", type: "international", label: "City of Love" },
  { title: "Tokyo", slug: "tokyo", image: "https://images.unsplash.com/photo-1540959733332-e94e270b2d42?q=80&w=2041&auto=format&fit=crop", type: "international", label: "Future & Heritage" },
  { title: "Switzerland", slug: "switzerland", image: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Alpine Escapes" },
  { title: "Singapore", slug: "singapore", image: "https://images.unsplash.com/photo-1525625239514-75b436f0102b?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Garden City" },
  { title: "Santorini", slug: "santorini", image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Aegean Dream" },
  { title: "London", slug: "london", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Historic Splendour" },
];

interface Package {
  id: string;
  title: string;
  destination: string;
  tripDuration: string;
  travelStyle: string;
  tourType: string;
  exclusivityLevel: string;
  price: { currency: string; amount: number | string };
  shortDescription: string;
  inclusions?: string[];
  itinerary?: any[];
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDatabase();

  // 1. Fetch Destination details
  let destination = await db.collection("destinations").findOne({ slug }) as unknown as Destination | null;

  // Fallback to local list if not in DB
  if (!destination) {
    destination = FALLBACK_DESTINATIONS.find(d => d.slug === slug) || null;
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="font-display text-4xl font-bold text-[#1a3f4e] mb-4">Destination Not Found</h1>
          <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
            The destination <span className="font-bold text-red-500">"{slug}"</span> doesn't seem to exist or has been moved. Explore our other trending locations instead!
          </p>
          <Link 
            href="/locations" 
            className="px-10 py-4 bg-[#2fa3f2] text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(47,163,242,0.4)] transition-all"
          >
            Explore All Destinations
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // 2. Fetch Packages for this destination
  // We search for the destination title/slug in the package's fields
  const query: any = {
    $or: [
      { destination: { $regex: destination.title, $options: "i" } },
      { title: { $regex: destination.title, $options: "i" } },
      { destinationSlug: slug }
    ]
  };

  // If the destination has a real database ID, add it to the search criteria
  if (destination._id && /^[0-9a-fA-F]{24}$/.test(destination?._id?.toString() || "")) {
    query.$or.push({ destinationId: new ObjectId(destination._id) });
    query.$or.push({ destinationId: destination._id.toString() }); 
  }

  const packages = await db.collection("packages").find(query).toArray();

  const normalizedPackages: Package[] = packages.map(p => ({
    ...p,
    id: p._id.toString(),
  })) as any;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <Image
          src={destination.image || "/images/placeholder.jpg"}
          alt={destination.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="container-sv relative z-10 text-center text-white">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 mb-6 text-sm font-medium text-white/60">
            <Link href="/" className="hover:text-[#2fa3f2] transition-colors">Home</Link>
            <span className="text-white/20">/</span>
            <Link href="/locations" className="hover:text-[#2fa3f2] transition-colors">Destinations</Link>
            <span className="text-white/20">/</span>
            <span className="text-white">{destination.title}</span>
          </nav>

          <p className="text-[#2fa3f2] font-semibold text-sm uppercase tracking-widest mb-4 drop-shadow-md">
            {destination.type === "india" ? "India & Around" : "International Gateway"}
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
            {destination.title}
          </h1>
          <p className="text-white/90 text-xl max-w-2xl mx-auto font-medium drop-shadow-md mb-10">
            {destination.label}
          </p>

          <div className="max-w-xl mx-auto">
            <SearchBar placeholder={`Search packages in ${destination.title}...`} />
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="section-pad flex-1">
        <div className="container-sv">
          <FilteredPackageList 
            packages={normalizedPackages} 
            destinationTitle={destination.title} 
          />
        </div>
      </section>

      {/* Explore More */}
      <section className="py-20 bg-[#1a3f4e] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4">
           <svg className="w-[600px] h-[600px]" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="white" /></svg>
        </div>
        
        <div className="container-sv relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Want something custom built?</h2>
          <p className="text-white/60 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
            Our travel experts can design a personalized itinerary for {destination.title} tailored exactly to your preferences.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#2fa3f2] text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(47,163,242,0.4)] transition-all"
          >
            Connect with an Expert
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
