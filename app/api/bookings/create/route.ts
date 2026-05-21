import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/app/utils/getDatabase";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const db = await getDatabase();

    // Ensure index exists on bookingId
    try {
      await db.collection("bookings").createIndex({ bookingId: 1 }, { unique: true });
    } catch (err) {
      console.error("Index creation error", err);
    }

    // Prepare data
    const travellers = {
      adults: Number(body.adults || body.travellers?.adults || 1),
      children: Number(body.children || body.travellers?.children || 0),
    };

    const bookingStatus = body.bookingStatus || body.status || "pending";
    const paymentStatus = body.paymentStatus || "pending";
    const bookingDate = new Date();

    const insertData = {
      userId: decoded.userId,
      packageId: body.packageId || "",
      packageName: body.packageName || body.packageTitle || "",
      packageTitle: body.packageName || body.packageTitle || "", // backward compatibility
      totalAmount: Number(body.totalAmount || 0),
      bookingDate,
      travelDate: body.travelDate || "",
      returnDate: body.returnDate || "",
      travellers,
      adults: travellers.adults, // backward compatibility
      children: travellers.children, // backward compatibility
      bookingStatus,
      status: bookingStatus, // backward compatibility
      paymentStatus,
      userName: body.userName || "",
      userEmail: body.userEmail || decoded.email || "",
      userPhone: body.userPhone || "",
      notes: body.notes || body.message || "",
      currency: body.currency || "INR",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let bookingId = "";
    let insertedId = "";
    let attempts = 0;

    while (attempts < 5) {
      const currentYear = new Date().getFullYear();
      const regex = new RegExp(`^BK-${currentYear}-`);
      const lastBooking = await db.collection("bookings")
        .find({ bookingId: regex })
        .sort({ bookingId: -1 })
        .limit(1)
        .toArray();

      let newSeq = 1;
      if (lastBooking.length > 0 && lastBooking[0].bookingId) {
        const parts = lastBooking[0].bookingId.split("-");
        const lastSeqStr = parts[parts.length - 1];
        const lastSeq = parseInt(lastSeqStr, 10);
        if (!isNaN(lastSeq)) {
          newSeq = lastSeq + 1;
        }
      }
      bookingId = `BK-${currentYear}-${String(newSeq).padStart(4, "0")}`;

      try {
        const result = await db.collection("bookings").insertOne({
          ...insertData,
          bookingId,
        });
        insertedId = result.insertedId.toString();
        break;
      } catch (err: any) {
        if (err.code === 11000 && attempts < 4) {
          attempts++;
          continue;
        }
        throw err;
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        insertedId, 
        bookingId,
        data: {
          ...insertData,
          id: insertedId,
          bookingId,
        }
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("BOOKINGS CREATE POST ERROR:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
