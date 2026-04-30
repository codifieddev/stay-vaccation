import Navbar from "../components/frontend/Navbar";
import Footer from "../components/frontend/Footer";
import Link from "next/link";

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
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero-bg pt-32 pb-20 text-center relative overflow-hidden">
        <div className="container-sv relative z-10">
          <p className="text-[#2fa3f2] font-semibold text-sm uppercase tracking-widest mb-4">Browse by interest</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
            Tour Categories
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            From sun-soaked beaches to spiritual pilgrimages — find your perfect travel style.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 50C120 40 240 22 360 18C480 14 600 22 720 26C840 32 960 36 1080 36C1200 36 1320 28 1380 24L1440 22V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section-pad bg-white">
        <div className="container-sv">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoriesWithCount.filter((cat: any) => cat.isActive).map((cat: any) => (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug}`}
                className="group rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full relative"
              >
                {/* Background image or gradient fallback */}
                {cat.image ? (
                  <>
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" 
                      loading="lazy"
                      decoding="async"
                    />
                    {/* Sophisticated dark gradient overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-colors" />
                  </>
                ) : (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color || cat.gradient || 'from-blue-600 to-indigo-700'} opacity-90`} />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </>
                )}

                {/* Top content overlay */}
                <div className="h-32 flex items-center justify-between px-8 relative z-10 overflow-hidden">
                   {/* Background pattern overlay (subtle) */}
                  {!cat.image && (
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 L100 0 L100 100 Z" fill="white" />
                      </svg>
                    </div>
                  )}

                  <div className="relative">
                    <h2 className="text-white font-bold text-xl drop-shadow-md">{cat.name}</h2>
                    <p className="text-white/90 text-xs mt-1 font-semibold tracking-wide drop-shadow-sm">
                      {cat.packageCount} {cat.packageCount === 1 ? 'Package' : 'Packages'} Available
                    </p>
                  </div>
                  <div className="text-5xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-500 relative">
                    {cat.icon}
                  </div>
                </div>

                {/* Bottom content */}
                <div className="p-6 bg-white flex flex-col flex-1">
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 italic">
                    {cat.description || "Explore curated travel experiences specifically designed for this style."}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-[#2fa3f2] text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                      View Packages
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                    {cat.shortLocationList && (
                       <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-1 rounded-full font-bold uppercase tracking-tighter">
                         {cat.shortLocationList}
                       </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {categoriesWithCount.length === 0 && (
             <div className="text-center py-20">
               <div className="text-6xl mb-4">🏝️</div>
               <h3 className="text-2xl font-bold text-gray-900 mb-2">No categories found</h3>
               <p className="text-gray-500">Check back later for exciting travel styles.</p>
             </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        
        <div className="container-sv relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-[#1a3f4e] mb-6">
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-500 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
            Our travel experts can craft a completely custom itinerary based on your preferences, budget, and travel dates. Let's build your dream trip together.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#1a3f4e] text-white font-bold rounded-2xl hover:bg-[#2a5f74] hover:-translate-y-1 shadow-lg shadow-[#1a3f4e]/20 transition-all duration-300"
          >
            Request Custom Package
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
