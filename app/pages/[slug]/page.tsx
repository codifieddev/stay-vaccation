import { notFound } from "next/navigation";
import { getDatabase } from "@/app/utils/getDatabase";
import LayoutV2 from "@/app/layouts-v2/LayoutV2";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const db = await getDatabase();
    const page = await db.collection("pages").findOne({ slug });
    if (!page) {
      return {
        title: "Page Not Found — Stay Vacation",
      };
    }
    return {
      title: `${page.title} — Stay Vacation`,
      description: page.description || `Read the ${page.title} on Stay Vacation.`,
    };
  } catch (error) {
    return {
      title: "Stay Vacation",
    };
  }
}

export default async function CMSPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let page = null;
  try {
    const db = await getDatabase();
    page = await db.collection("pages").findOne({ slug });
  } catch (error) {
    console.error("Failed to fetch CMS page:", error);
  }

  if (!page) {
    notFound();
  }

  return (
    <LayoutV2>
      <div className="min-h-screen flex flex-col bg-[#061217]">
        {/* Page Hero */}
        <section className="pt-36 pb-20 relative overflow-hidden bg-gradient-to-br from-[#061217] via-[#0b1d25] to-[#122e3b] border-b border-white/5">
          {/* Ambient Blur Glows */}
          <div className="absolute top-1/4 right-1/3 w-80 h-80 rounded-full bg-sky-500/5 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-1/3 left-1/4 w-72 h-72 rounded-full bg-[#ff9500]/3 blur-[80px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h1 className="font-['Poppins',sans-serif] text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-6 animate-fade-in">
              {page.title}
            </h1>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-sm md:text-base font-semibold text-white/50 max-w-2xl mx-auto leading-relaxed">
              {page.description || "StayVacation Premium CMS Page"}
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 md:py-24 bg-[#061217] flex-grow">
          <div className="max-w-3xl mx-auto px-4 relative z-10">
            <div 
              className="cms-content text-white/70 font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed text-sm md:text-base space-y-6"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </section>
        
        <style>{`
          .cms-content h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            color: #ffffff;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 0.5rem;
          }
          .cms-content p {
            margin-bottom: 1.25rem;
            line-height: 1.8;
          }
          .cms-content ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-bottom: 1.5rem;
          }
          .cms-content li {
            margin-bottom: 0.5rem;
            line-height: 1.7;
          }
          .cms-content strong {
            color: #ffffff;
            font-weight: 600;
          }
        `}</style>
      </div>
    </LayoutV2>
  );
}
