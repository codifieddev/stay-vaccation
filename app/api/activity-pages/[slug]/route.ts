import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "../../../utils/getDatabase";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// GET SINGLE ACTIVITY PAGE
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const db = await getDatabase();
    const collection = db.collection("activity_pages");

    const page = await collection.findOne({ slug });

    if (!page) {
      return NextResponse.json({ success: false, message: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: page
    });
  } catch (err) {
    console.error("GET SINGLE ACTIVITY PAGE ERROR:", err);
    return NextResponse.json({ success: false, message: "Error fetching activity page" }, { status: 500 });
  }
}

// UPDATE ACTIVITY PAGE
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const body = await req.json();
    const { _id, ...updateData } = body;

    const db = await getDatabase();
    const collection = db.collection("activity_pages");

    const result = await collection.updateOne(
      { slug },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Activity page updated successfully"
    });

  } catch (err) {
    console.error("PUT ACTIVITY PAGE ERROR:", err);
    return NextResponse.json({ success: false, message: "Error updating activity page" }, { status: 500 });
  }
}

// DELETE ACTIVITY PAGE
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const db = await getDatabase();
    const collection = db.collection("activity_pages");

    const result = await collection.deleteOne({ slug });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Activity page deleted successfully"
    });

  } catch (err) {
    console.error("DELETE ACTIVITY PAGE ERROR:", err);
    return NextResponse.json({ success: false, message: "Error deleting activity page" }, { status: 500 });
  }
}
