import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/app/utils/getDatabase";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> | { bookingId: string } }
) {
  try {
    let token = req.cookies.get("sv_token")?.value;
    if (!token) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let decoded: { userId: string; role: string; email: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        role: string;
        email: string;
      };
    } catch (err) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    // Resolve params if it is a Promise (Next.js 15 compatibility)
    const resolvedParams = await params;
    const { bookingId } = resolvedParams;

    if (!bookingId) {
      return NextResponse.json({ success: false, message: "Booking ID required" }, { status: 400 });
    }

    const db = await getDatabase();
    const booking = await db.collection("bookings").findOne({ bookingId });

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    // Check ownership or admin role
    if (booking.userId !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const normalized = {
      ...booking,
      id: booking._id.toString(),
      _id: undefined,
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (err) {
    console.error("GET SINGLE BOOKING ERROR:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
