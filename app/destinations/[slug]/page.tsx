import { getDatabase } from "@/app/utils/getDatabase";
import { ObjectId } from "mongodb";
import LayoutV2 from "../../layouts-v2/LayoutV2";
import FilteredPackageList from "../../components/frontend/FilteredPackageList";
import SearchBar from "../../components/frontend/SearchBar";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Destination {
  _id?: string;
  name: string;
  slug: string;
  image?: string;
  label?: string;
  type?: string;
  description?: string;
}

const FALLBACK_DESTINATIONS: Destination[] = [
  // INDIA
  { name: "Kashmir", slug: "kashmir", image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Paradise on Earth" },
  { name: "Goa", slug: "goa", image: "https://images.unsplash.com/photo-1512356181113-853a150f1ea7?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Sun, Sand & Sea" },
  { name: "Himachal", slug: "himachal", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Valley of Gods" },
  { name: "Manali", slug: "manali", image: "https://images.unsplash.com/photo-1594142571210-9cf63657739f?q=80&w=1974&auto=format&fit=crop", type: "india", label: "Mountain Escapes" },
  { name: "Kerala", slug: "kerala", image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2069&auto=format&fit=crop", type: "india", label: "Backwater Bliss" },
  { name: "Jaipur", slug: "jaipur", image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=2071&auto=format&fit=crop", type: "india", label: "The Pink City" },
  { name: "Munnar", slug: "munnar", image: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Tea Garden Serenity" },
  { name: "Andaman", slug: "andaman", image: "https://images.unsplash.com/photo-1589330273594-fade1ee91647?q=80&w=2070&auto=format&fit=crop", type: "india", label: "Crystal Waters" },
  { name: "Leh Ladakh", slug: "leh-ladakh", image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=2070&auto=format&fit=crop", type: "india", label: "High Pass Adventure" },

  // INTERNATIONAL
  { name: "Thailand", slug: "thailand", image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Tropical Gateway" },
  { name: "Bali", slug: "bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1938&auto=format&fit=crop", type: "international", label: "Island of Gods" },
  { name: "Dubai", slug: "dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Luxury & Innovation" },
  { name: "Paris", slug: "paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop", type: "international", label: "City of Love" },
  { name: "Tokyo", slug: "tokyo", image: "https://images.unsplash.com/photo-1540959733332-e94e270b2d42?q=80&w=2041&auto=format&fit=crop", type: "international", label: "Future & Heritage" },
  { name: "Switzerland", slug: "switzerland", image: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Alpine Escapes" },
  { name: "Singapore", slug: "singapore", image: "https://images.unsplash.com/photo-1525625239514-75b436f0102b?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Garden City" },
  { name: "Santorini", slug: "santorini", image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Aegean Dream" },
  { name: "London", slug: "london", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop", type: "international", label: "Historic Splendour" },
];

import { Package } from "@/app/store/features/packages/types";

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
      <LayoutV2>
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-10 text-center bg-gray-50">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="font-['Poppins'] text-4xl font-extrabold text-[#1a3f4e] mb-4">Destination Not Found</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-10 leading-relaxed">
            The destination <span className="font-bold text-red-500">"{slug}"</span> doesn't seem to exist or has been moved. Explore our other trending locations instead!
          </p>
          <Link
            href="/locations"
            className="px-10 py-4 bg-[#4a90e2] text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(74,144,226,0.4)] transition-all"
          >
            Explore All Destinations
          </Link>
        </div>
      </LayoutV2>
    );
  }

  // 2. Fetch Packages for this destination
  const query: any = {
    $or: [
      { destination: { $regex: destination.name, $options: "i" } },
      { title: { $regex: destination.name, $options: "i" } },
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

  // Sort by displayOrder ASC (packages without displayOrder appear at the end)
  normalizedPackages.sort((a, b) => {
    const orderA = a.displayOrder ?? Infinity;
    const orderB = b.displayOrder ?? Infinity;
    return orderA - orderB;
  });

  return (
    <LayoutV2>
      {/* Hero Section */}
      <section className="relative h-[65vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src={destination.image || "/images/placeholder.jpg"}
          alt={destination.name}
          fill
          className="object-cover scale-102 transition-transform duration-10000 ease-out"
          priority
        />
        {/* Modern dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/80" />

        <div className="container-sv relative z-10 text-center text-white px-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50/90 to-amber-50/90 border border-orange-200/60 text-[#ff6b00] text-[10px] font-black uppercase tracking-widest px-4.5 py-2.5 rounded-full shadow-sm mb-6">
            ✦ {destination.type === "india" ? "India Gateway" : "International Gateway"}
          </div>

          <h1 className="font-['Poppins'] text-5xl md:text-7xl font-black mb-5 tracking-tight drop-shadow-sm">
            {destination.name}
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto font-medium drop-shadow-md mb-10 leading-relaxed">
            {destination.label || destination.description || "Unveil spectacular sites and create long-lasting memories."}
          </p>

          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl">
            <SearchBar placeholder={`Search packages in ${destination.name}...`} />
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-24 bg-[#f8f9fa] flex-1">
        <div className="container-sv">
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1 bg-sky-50 text-[#4a90e2] text-[10px] font-black uppercase tracking-widest px-4.5 py-2 rounded-full border border-sky-100/50 mb-4">
              ✦ CURATED LISTING
            </div>
            <h2 className="font-['Poppins'] font-extrabold text-3xl md:text-4xl text-[#1a3f4e] tracking-tight">
              Featured <span>Packages</span>
            </h2>
            <p className="text-gray-450 text-xs md:text-sm mt-3 leading-relaxed">
              Explore dynamic itineraries, group vacations, and customized tours in {destination.name}.
            </p>
          </div>

          <FilteredPackageList
            packages={normalizedPackages}
            destinationTitle={destination.name}
          />
        </div>
      </section>

      {/* Expert Connect CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white relative overflow-hidden">
        {/* Floating radial glow backgrounds */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-radial from-sky-500/10 to-transparent pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-radial from-orange-500/5 to-transparent pointer-events-none -translate-x-1/3 translate-y-1/3" />

        <div className="container-sv relative z-10 text-center max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 text-[#ff9500] text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            ✦ Custom Built Itineraries
          </div>
          <h2 className="font-['Poppins'] font-black text-3xl md:text-5xl mb-6 tracking-tight leading-tight">
            Want a <span className="bg-gradient-to-r from-[#ff9500] to-[#ff6b00] bg-clip-text text-transparent">Custom Built</span> Adventure?
          </h2>
          <p className="text-gray-400 mb-10 text-sm md:text-base leading-relaxed">
            Our travel curators can design a personalized itinerary for <span className="text-white font-bold">{destination.name}</span> tailored exactly to your preferences, budget, and style.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-10 py-4.5 bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-[0_6px_20px_rgba(255,149,0,0.25)] hover:shadow-[0_8px_30px_rgba(255,149,0,0.45)] hover:-translate-y-0.5"
          >
            Connect with an Expert →
          </Link>
        </div>
      </section>
    </LayoutV2>
  );
}
