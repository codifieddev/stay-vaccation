import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "../../utils/getDatabase";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// GET ALL ACTIVITY PAGES
export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    const collection = db.collection("activity_pages");

    const pages = await collection.find({}).toArray();

    return NextResponse.json({
      success: true,
      data: pages
    });
  } catch (err) {
    console.error("GET ACTIVITY PAGES ERROR:", err);
    return NextResponse.json({ success: false, message: "Error fetching activity pages" }, { status: 500 });
  }
}

// CREATE ACTIVITY PAGE
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.slug || !body.city) {
      return NextResponse.json({ success: false, message: "Slug and City are required" }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection("activity_pages");

    // Check for unique slug
    const existing = await collection.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json({ success: false, message: "A page with this slug already exists" }, { status: 409 });
    }

    const result = await collection.insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: "Activity page created successfully",
      insertedId: result.insertedId
    }, { status: 201 });

  } catch (err) {
    console.error("POST ACTIVITY PAGE ERROR:", err);
    return NextResponse.json({ success: false, message: "Error creating activity page" }, { status: 500 });
  }
}
