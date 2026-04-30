import Navbar from "@/app/components/frontend/Navbar";
import Footer from "@/app/components/frontend/Footer";
import PackageCard from "@/app/components/frontend/PackageCard";
import { notFound } from "next/navigation";
import Link from "next/link";

async function getCategory(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/categories?slug=${slug}`, { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

async function getPackagesByCategory(categoryId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/packages?categoryId=${categoryId}`, { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
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
    <>
      <Navbar />
      
      {/* Category Hero */}
      <section className="pt-32 pb-24 relative overflow-hidden min-h-[400px] flex items-center">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          {category.image ? (
            <>
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover object-center"
                decoding="async"
              />
              {/* Rich dark gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            </>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${category.color || category.gradient || 'from-blue-900 to-indigo-950'} opacity-90`} />
          )}
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-black/10 -skew-x-12 -translate-x-1/2" />
        </div>
        
        <div className="container-sv relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="text-7xl md:text-8xl drop-shadow-2xl animate-bounce-subtle">
              {category.icon}
            </div>
            <div className="text-center md:text-left">
              <nav className="flex items-center justify-center md:justify-start gap-2 text-white/60 text-xs font-bold uppercase tracking-widest mb-4">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
                <span>/</span>
                <span className="text-white">{category.name}</span>
              </nav>
              <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                {category.name} <span className="text-white/40">Packages</span>
              </h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl leading-relaxed font-light">
                {category.description || `Discover hand-picked itineraries specifically curated for ${category.name.toLowerCase()} enthusiasts.`}
              </p>
              
              <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white text-xs font-bold uppercase tracking-wider">{packages.length} Tours Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 48H1440V0C1440 0 1140 32 720 32C300 32 0 0 0 0V48Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20 bg-white">
        <div className="container-sv">
          {packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg: any) => (
                <PackageCard key={pkg.id || pkg._id} pkg={pkg} />
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-20 px-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <div className="text-6xl mb-6 grayscale opacity-50">🧭</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No packages available</h2>
              <p className="text-gray-500 mb-8">
                We're currently updating our {category.name.toLowerCase()} catalog. 
                Please check back soon or explore our other exciting travel categories.
              </p>
              <Link 
                href="/categories" 
                className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
              >
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Explore other Categories
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges / Info */}
      <section className="pb-24 bg-white">
        <div className="container-sv">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-[#1a3f4e] rounded-3xl text-white">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-2xl">🛡️</div>
              <h4 className="font-bold mb-2">Verified Operators</h4>
              <p className="text-white/60 text-sm">All {category.name.toLowerCase()} tours are conducted by licensed, local experts.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border-y md:border-y-0 md:border-x border-white/10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-2xl">💰</div>
              <h4 className="font-bold mb-2">Best Price Guarantee</h4>
              <p className="text-white/60 text-sm">Found it cheaper elsewhere? We'll match the price and give you 5% off.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-2xl">⚡</div>
              <h4 className="font-bold mb-2">Instant Confirmation</h4>
              <p className="text-white/60 text-sm">Secure your spot instantly with our real-time booking engine.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
