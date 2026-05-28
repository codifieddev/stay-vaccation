import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/app/utils/getDatabase";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDatabase();

    // Fetch CMS document for featured packages
    const cmsDoc = await db.collection("page_cms").findOne({ page: "featured-packages" });

    const settings = cmsDoc?.data || {
      sectionTitle: "Featured Packages",
      sectionSubtitle: "Handpicked premium packages for your next vacation",
      selectedPackages: [],
      isActive: true,
      displayOrder: 1
    };

    // If the entire featured packages section is inactive, return an empty array of packages
    if (settings.isActive === false) {
      return NextResponse.json({
        success: true,
        data: {
          sectionTitle: settings.sectionTitle,
          sectionSubtitle: settings.sectionSubtitle,
          isActive: false,
          displayOrder: settings.displayOrder,
          packages: []
        }
      });
    }

    const selectedIds = settings.selectedPackages || [];

    // Convert string IDs to ObjectId for query
    const objectIds = selectedIds
      .map((id: string) => ObjectId.isValid(id) ? new ObjectId(id) : null)
      .filter(Boolean) as ObjectId[];

    let optimizedPackages: any[] = [];
    if (objectIds.length > 0) {
      const dbPackages = await db.collection("packages").find({
        _id: { $in: objectIds }
      }).toArray();

      // Normalize and index packages by ID
      const pkgMap = new Map();
      for (const pkg of dbPackages) {
        pkgMap.set(pkg._id.toString(), pkg);
      }

      // Map back in the exact order selected by the administrator
      optimizedPackages = selectedIds
        .map((id: string) => {
          const pkg = pkgMap.get(id);
          if (!pkg) return null;

          // Check both package-level active flags to ensure only active packages are returned
          const isPkgActive = pkg.isActive !== false && pkg.isEnabled !== false;
          if (!isPkgActive) return null;

          // Return only lightweight optimized fields required for frontend rendering
          return {
            id: pkg._id.toString(),
            packageId: pkg.id || "",
            title: pkg.title || "",
            slug: pkg.slug || pkg.id || "",
            image: pkg.coverImage || (Array.isArray(pkg.images) && pkg.images.length > 0 ? pkg.images[0] : (pkg.image || "")),
            rating: Number(pkg.rating) || Number(pkg.packageRating) || 5,
            duration: pkg.tripDuration || pkg.duration || "",
            price: {
              amount: Number(pkg.price?.amount) || 0,
              currency: pkg.price?.currency || "INR",
              originalAmount: Number(pkg.price?.originalAmount) || 0
            },
            maxGuests: Number(pkg.maxGuests) || Number(pkg.capacity) || 12,
            displayOrder: pkg.displayOrder !== undefined && pkg.displayOrder !== null ? Number(pkg.displayOrder) : undefined
          };
        })
        .filter(Boolean);

      // Sort by displayOrder ASC (packages without displayOrder appear at the end)
      optimizedPackages.sort((a: any, b: any) => {
        const orderA = a.displayOrder ?? Infinity;
        const orderB = b.displayOrder ?? Infinity;
        return orderA - orderB;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        sectionTitle: settings.sectionTitle,
        sectionSubtitle: settings.sectionSubtitle,
        isActive: true,
        displayOrder: settings.displayOrder,
        packages: optimizedPackages
      }
    });
  } catch (err) {
    console.error("GET FEATURED PACKAGES ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
