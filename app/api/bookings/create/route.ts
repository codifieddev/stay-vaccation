import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/app/utils/getDatabase";
import jwt from "jsonwebtoken";
import { sendBookingEmail, sendEmailAsync, sendAdminBookingAlert, sendAdminBookingAlertAsync } from "@/app/utils/email";
import { ObjectId } from "mongodb";

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

    // Fetch package to verify availability
    const packageId = body.packageId || "";
    let pkgObj = null;
    if (packageId) {
      const pkgCol = db.collection("packages");
      if (ObjectId.isValid(packageId)) {
        pkgObj = await pkgCol.findOne({ _id: new ObjectId(packageId) });
      } else {
        pkgObj = await pkgCol.findOne({ id: packageId });
      }
    }

    const requestedSeats = travellers.adults + travellers.children;

    if (pkgObj && pkgObj.maxTravelersLimit !== undefined && pkgObj.maxTravelersLimit !== null) {
      const available = pkgObj.availableSeats !== undefined && pkgObj.availableSeats !== null ? pkgObj.availableSeats : pkgObj.maxTravelersLimit;
      if (requestedSeats > available) {
        return NextResponse.json(
          { success: false, message: `Not enough seats available. Only ${available} seat(s) left.` },
          { status: 400 }
        );
      }
    }

    const paymentId = body.paymentId || body.razorpay_payment_id || "";
    const orderId = body.orderId || body.razorpay_order_id || "";
    const signature = body.signature || body.razorpay_signature || "";

    let isPaid = false;

    if (paymentId && orderId) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (keySecret) {
        // Live signature verification
        try {
          const crypto = require("crypto");
          const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(orderId + "|" + paymentId)
            .digest("hex");
          if (expectedSignature === signature) {
            isPaid = true;
          } else {
            console.error("[Razorpay Verification] Signature mismatch!");
          }
        } catch (verifErr) {
          console.error("[Razorpay Verification] Verification failed:", verifErr);
        }
      } else {
        // Mock verification
        console.log("[Razorpay Verification] Mock mode. Auto-verifying signature.");
        isPaid = true;
      }
    }

    const bookingStatus = isPaid ? "confirmed" : "pending";
    const paymentStatus = isPaid ? "paid" : (body.paymentStatus || "pending");
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
      paymentId: paymentId || undefined,
      orderId: orderId || undefined,
      signature: signature || undefined,
      transactionDetails: paymentId ? { paymentId, orderId, signature, verified: isPaid } : undefined,
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

    if (bookingStatus === "confirmed" && pkgObj && pkgObj.maxTravelersLimit !== undefined && pkgObj.maxTravelersLimit !== null) {
      await db.collection("packages").updateOne(
        { _id: pkgObj._id },
        { $inc: { availableSeats: -requestedSeats } }
      );
      console.log(`[Inventory System] Booking confirmed on creation. Reduced availableSeats by ${requestedSeats} for package ${pkgObj._id}.`);
    }

    // Build the response first — email runs asynchronously and never delays the API
    const responsePayload = NextResponse.json(
      {
        success: true,
        insertedId,
        bookingId,
        data: { ...insertData, id: insertedId, bookingId },
      },
      { status: 201 }
    );

    // User-facing email: fire-and-forget for all relevant statuses
    const notifyStatuses = ["confirmed", "pending", "cancelled", "completed"];
    if (notifyStatuses.includes(bookingStatus)) {
      sendEmailAsync({
        bookingId,
        packageName: insertData.packageName,
        travelDate: insertData.travelDate,
        returnDate: insertData.returnDate,
        travellers: insertData.travellers,
        totalAmount: insertData.totalAmount,
        currency: insertData.currency,
        bookingStatus: insertData.bookingStatus,
        userEmail: insertData.userEmail,
        userName: insertData.userName || "Valued Customer",
      });
    }

    // Admin alert: always notify admin on new booking creation
    try {
      console.log(`[Admin Email] Attempting to send admin notification for booking ${bookingId} to ${process.env.ADMIN_EMAIL || 'default admin'}`);
      await sendAdminBookingAlert({
        bookingId,
        packageName: insertData.packageName,
        travelDate: insertData.travelDate,
        returnDate: insertData.returnDate,
        travellers: insertData.travellers,
        totalAmount: insertData.totalAmount,
        currency: insertData.currency,
        bookingStatus: insertData.bookingStatus,
        userEmail: insertData.userEmail,
        userName: insertData.userName || "Valued Customer",
        userPhone: insertData.userPhone,
        notes: insertData.notes,
        eventType: "new_booking",
      });
      console.log(`[Admin Email] Admin notification sent successfully for booking ${bookingId}`);
    } catch (err: any) {
      console.error(`[Admin Email] Failed to send admin notification for booking ${bookingId}:`, err);
    }

    return responsePayload;
  } catch (err) {
    console.error("BOOKINGS CREATE POST ERROR:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
