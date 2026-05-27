import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/app/utils/getDatabase";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// GET ALL BOOKING PLANS
export async function GET() {
  try {
    const db = await getDatabase();
    const plans = await db
      .collection("booking_plans")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    const normalized = plans.map((p) => ({
      ...p,
      id: p._id.toString(),
      _id: undefined, // remove raw ObjectId
    }));

    return NextResponse.json(
      { success: true, data: normalized },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (err) {
    console.error("BOOKING PLANS GET ERROR:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch plans" }, { status: 500 });
  }
}

// CREATE BOOKING PLAN
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, destination } = body;

    if (!fullName || !email || !destination) {
      return NextResponse.json(
        { success: false, message: "fullName, email, and destination are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date();
    const doc = {
      fullName,
      email,
      destination,
      status: "pending" as const,
      createdAt: now,
    };

    const result = await db.collection("booking_plans").insertOne(doc);

    const insertedObj = {
      ...doc,
      id: result.insertedId.toString(),
      createdAt: now.toISOString(),
    };

    return NextResponse.json(
      { success: true, data: insertedObj },
      { status: 201 }
    );
  } catch (err) {
    console.error("BOOKING PLANS POST ERROR:", err);
    return NextResponse.json({ success: false, error: "Failed to save plan" }, { status: 500 });
  }
}

// UPDATE BOOKING PLAN STATUS
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDatabase();

    const { id, _id, ...updateData } = body;
    const updateId = id || _id;

    if (!updateId || !ObjectId.isValid(updateId)) {
      return NextResponse.json(
        { success: false, message: "Valid id required" },
        { status: 400 }
      );
    }

    const planCol = db.collection("booking_plans");
    const oldPlan = await planCol.findOne({ _id: new ObjectId(updateId) });
    if (!oldPlan) {
      return NextResponse.json(
        { success: false, message: "Booking plan not found" },
        { status: 404 }
      );
    }

    const updatedFields = {
      ...updateData,
      updatedAt: new Date(),
    };

    await planCol.updateOne(
      { _id: new ObjectId(updateId) },
      { $set: updatedFields }
    );

    const freshPlan = await planCol.findOne({ _id: new ObjectId(updateId) });
    const normalized = {
      ...freshPlan,
      id: freshPlan!._id.toString(),
      _id: undefined,
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (err) {
    console.error("BOOKING PLANS PUT ERROR:", err);
    return NextResponse.json({ success: false, error: "Failed to update status" }, { status: 500 });
  }
}

// DELETE BOOKING PLAN
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid id required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection("booking_plans").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Booking plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Booking plan deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("BOOKING PLANS DELETE ERROR:", err);
    return NextResponse.json({ success: false, error: "Failed to delete plan" }, { status: 500 });
  }
}
