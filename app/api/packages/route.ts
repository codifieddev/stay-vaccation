import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "../../utils/getDatabase";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";

//  CREATE PACKAGE
export async function POST(req: NextRequest) {
  try {
    const bodyRaw = await req.json();
    const { id, _id, ...body } = bodyRaw; // Remove client-generated IDs

    console.log("[SERVER] Creating new package:", body.title);

    if (!body.title || !Array.isArray(body.itinerary)) {
      return NextResponse.json(
        { message: "Invalid package data", success: false },
        { status: 400 }
      );
    }

    if (body.itinerary.length < 1 || body.itinerary.length > 15) {
      return NextResponse.json(
        { message: "Duration validation failed: Package must be between 1 and 15 days.", success: false },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection("packages");

    const safeObjectId = (ref: any) => {
      if (!ref) return null;
      const str = typeof ref === 'string' ? ref : ref.toString();
      return ObjectId.isValid(str) ? new ObjectId(str) : null;
    };

    //  Clean itinerary safely
    const cleanedItinerary = body.itinerary.map((day: any) => ({
      ...day,
      hotelStays: day.hotelStays?.map((h: any) => ({
        ...h,
        hotelRef: safeObjectId(h.hotelRef),
      })) || [],
      activities: day.activities?.map((a: any) => ({
        ...a,
        activityRef: safeObjectId(a.activityRef),
      })) || [],
    }));

    const result = await collection.insertOne({
      ...body,
      itinerary: cleanedItinerary,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Package created successfully",
        success: true,
        insertedId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST ERROR:", err);

    return NextResponse.json(
      { message: "Server Error", success: false },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

//  GET ALL PACKAGES
export async function GET() {
  try {
    const db = await getDatabase();

    const packagesCollection = db.collection("packages");
    const hotelsCollection = db.collection("hotels");
    const activitiesCollection = db.collection("activity");

    const packages = await packagesCollection.find({}).toArray();

    // Manual populate
    for (const pkg of packages) {
      for (const day of pkg.itinerary || []) {

        for (const stay of day.hotelStays || []) {
          if (stay.hotelRef) {
            stay.hotelData = await hotelsCollection.findOne({
              _id: stay.hotelRef,
            });
          }
        }

        for (const act of day.activities || []) {
          if (act.activityRef) {
            act.activityData = await activitiesCollection.findOne({
              _id: act.activityRef,
            });
          }
        }
      }
    }

   // IMPORTANT NORMALIZATION
const normalizedPackages = packages.map((pkg) => {
  const { _id, id, ...rest } = pkg;

  return {
    ...rest,
    id: _id.toString(), // Convert Mongo _id to string

    itinerary: (rest.itinerary || []).map((day: any) => ({
      ...day,
      id: day.id || randomUUID(),

      // Ensure mealsIncluded is always an array (may come back as string or undefined from DB)
      mealsIncluded: Array.isArray(day.mealsIncluded)
        ? day.mealsIncluded
        : typeof day.mealsIncluded === "string" && day.mealsIncluded
        ? day.mealsIncluded.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],

      hotelStays: (day.hotelStays || []).map((h: any) => ({
        ...h,
        id: h.id || randomUUID(),
      })),

      activities: (day.activities || []).map((a: any) => ({
        ...a,
        id: a.id || randomUUID(),
      })),

      transfers: (day.transfers || []).map((t: any) => ({
        ...t,
        id: t.id || randomUUID(),
      })),
    })),
  };
});

    return NextResponse.json(
      { success: true, data: normalizedPackages },
      { 
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        }
      }
    );

  } catch (err) {
    console.error("GET ERROR:", err);

    return NextResponse.json(
      { message: "Server Error", success: false },
      { status: 500 }
    );
  }
}


// UPDATE PACKAGE
export async function PUT(req: NextRequest) {
  try {
    const bodyRaw = await req.json();
    const { id, _id, ...body } = bodyRaw; // Extract unwanted fields

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Valid Package id is required", success: false },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection("packages");

    const safeObjectId = (ref: any) => {
      if (!ref) return null;
      const str = typeof ref === 'string' ? ref : ref.toString();
      return ObjectId.isValid(str) ? new ObjectId(str) : null;
    };

    // Clean itinerary (same as POST)
    const cleanedItinerary = (body.itinerary || []).map((day: any) => ({
      ...day,
      hotelStays: day.hotelStays?.map((h: any) => ({
        ...h,
        hotelRef: safeObjectId(h.hotelRef),
      })) || [],
      activities: day.activities?.map((a: any) => ({
        ...a,
        activityRef: safeObjectId(a.activityRef),
      })) || [],
    }));

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          itinerary: cleanedItinerary,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      { message: "Package updated successfully", success: true },
      { status: 200 }
    );

  } catch (err) {
    console.error("PUT ERROR:", err);

    return NextResponse.json(
      { message: "Server Error", success: false },
      { status: 500 }
    );
  }
}

// DELETE PACKAGE
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Valid Package id is required", success: false },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection("packages");

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Package not found in database", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Package deleted successfully", success: true },
      { status: 200 }
    );

  } catch (err) {
    console.error("DELETE ERROR:", err);

    return NextResponse.json(
      { message: "Server Error", success: false },
      { status: 500 }
    );
  }
}


// export async function GET() {
//   try {
//     const db = await getDatabase();

//     const packagesCollection = db.collection("packages");
//     const hotelsCollection = db.collection("master_hotels");
//     const activitiesCollection = db.collection("master_activities");

//     const packages = await packagesCollection.find({}).toArray();

//     // ✅ Manual populate
//     for (const pkg of packages) {
//       for (const day of pkg.itinerary || []) {

//         // Populate Hotels
//         for (const stay of day.hotelStays || []) {
//           if (stay.hotelRef) {
//             stay.hotelData = await hotelsCollection.findOne({
//               _id: stay.hotelRef,
//             });
//           }
//         }

//         // Populate Activities
//         for (const act of day.activities || []) {
//           if (act.activityRef) {
//             act.activityData = await activitiesCollection.findOne({
//               _id: act.activityRef,
//             });
//           }
//         }
//       }
//     }

//     // return NextResponse.json(
//     //   { success: true, data: packages },
//     //   { status: 200 }
//     // );

//     // Convert ObjectId to string
// const normalizedPackages = packages.map((pkg) => ({
//   ...pkg,
//   _id: pkg._id.toString(),

//   itinerary: (pkg.itinerary || []).map((day: any) => ({
//     ...day,
//     id: day.id || crypto.randomUUID(),

//     hotelStays: (day.hotelStays || []).map((h: any) => ({
//       ...h,
//       id: h.id || crypto.randomUUID(),
//     })),

//     activities: (day.activities || []).map((a: any) => ({
//       ...a,
//       id: a.id || crypto.randomUUID(),
//     })),

//     transfers: (day.transfers || []).map((t: any) => ({
//       ...t,
//       id: t.id || crypto.randomUUID(),
//     })),
//   })),
// }));

// return NextResponse.json(
//   { success: true, data: normalizedPackages },
//   { status: 200 }
// );
//   } catch (err) {
//     console.error("GET ERROR:", err);

//     return NextResponse.json(
//       { message: "Server Error", success: false },
//       { status: 500 }
//     );
//   }
// }