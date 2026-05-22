import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/app/utils/getDatabase";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import {
  sendBookingModificationRequestAsync,
  sendAdminBookingModificationAlertAsync,
} from "@/app/utils/email";

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

// PATCH — User edits their own booking (limited fields only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> | { bookingId: string } }
) {
  try {
    // --- Auth ---
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
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; email: string };
    } catch {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    // --- Resolve params ---
    const resolvedParams = await params;
    const { bookingId } = resolvedParams;
    if (!bookingId) {
      return NextResponse.json({ success: false, message: "Booking ID required" }, { status: 400 });
    }

    const db = await getDatabase();
    const bookingCol = db.collection<any>("bookings");
    const booking = await bookingCol.findOne({ bookingId });

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    // --- Ownership check ---
    if (booking.userId !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // --- Status guard: only pending/confirmed are editable ---
    const currentStatus = booking.bookingStatus || booking.status || "pending";
    if (currentStatus === "completed" || currentStatus === "cancelled") {
      return NextResponse.json(
        { success: false, message: `Bookings with status "${currentStatus}" cannot be edited.` },
        { status: 422 }
      );
    }

    // --- Parse request body (only allow whitelisted fields) ---
    const body = await req.json();
    const { adults, children, travelDate, returnDate, notes } = body;

    // Validate types
    const newAdults = typeof adults === "number" && adults >= 1 ? adults : null;
    const newChildren = typeof children === "number" && children >= 0 ? children : null;

    // --- Seat-availability check when traveller count increases ---
    const oldAdults = booking.travellers?.adults ?? booking.adults ?? 1;
    const oldChildren = booking.travellers?.children ?? booking.children ?? 0;
    const oldTotal = oldAdults + oldChildren;
    const resolvedAdults = newAdults !== null ? newAdults : oldAdults;
    const resolvedChildren = newChildren !== null ? newChildren : oldChildren;
    const newTotal = resolvedAdults + resolvedChildren;

    if (newTotal > oldTotal) {
      // Need to check if the package has enough seats
      const packageId = booking.packageId || "";
      if (packageId) {
        const pkgCol = db.collection("packages");
        let pkgObj = null;
        if (ObjectId.isValid(packageId)) {
          pkgObj = await pkgCol.findOne({ _id: new ObjectId(packageId) });
        } else {
          pkgObj = await pkgCol.findOne({ id: packageId });
        }

        if (pkgObj && pkgObj.maxTravelersLimit !== undefined && pkgObj.maxTravelersLimit !== null) {
          const available =
            pkgObj.availableSeats !== undefined && pkgObj.availableSeats !== null
              ? pkgObj.availableSeats
              : pkgObj.maxTravelersLimit;
          // Extra seats needed beyond the already-reserved ones
          const extraSeatsNeeded = newTotal - oldTotal;
          if (extraSeatsNeeded > available) {
            return NextResponse.json(
              {
                success: false,
                message: `Only ${available} additional seat(s) available. You need ${extraSeatsNeeded} more.`,
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Recover basePrice: prefer explicitly stored value, fall back to reverse calculation
    const basePrice: number =
      booking.paymentSummary?.basePrice ??
      booking.basePrice ??
      booking.totalAmount / (1.05 * (oldAdults + oldChildren * 0.5));

    const adultUnitPrice = basePrice;
    const childUnitPrice = basePrice * 0.5;
    const adultTotal = adultUnitPrice * resolvedAdults;
    const childTotal = childUnitPrice * resolvedChildren;
    const subtotal = adultTotal + childTotal;
    const taxRate = 0.05;
    const taxesAndFees = subtotal * taxRate;
    const proposedTotalAmount = subtotal + taxesAndFees;

    const originalTotalAmount =
      booking.originalTotalAmount ??
      booking.paymentSummary?.originalTotalAmount ??
      booking.totalAmount;

    const adjustmentAmount = proposedTotalAmount - originalTotalAmount; // negative = refund

    const proposedPaymentSummary = {
      basePrice,
      adultCount: resolvedAdults,
      adultUnitPrice,
      adultTotal,
      childCount: resolvedChildren,
      childUnitPrice,
      childTotal,
      subtotal,
      taxRate,
      taxesAndFees,
      totalAmount: proposedTotalAmount,
      originalTotalAmount,
      adjustmentAmount,
      lastRecalculatedAt: new Date(),
    };

    const editRequest = {
      requestId: new ObjectId().toString(),
      adults: resolvedAdults,
      children: resolvedChildren,
      travelDate: typeof travelDate === "string" && travelDate ? travelDate : booking.travelDate,
      returnDate: typeof returnDate === "string" ? returnDate : booking.returnDate,
      notes: typeof notes === "string" ? notes : (booking.notes || ""),
      totalAmount: proposedTotalAmount,
      paymentSummary: proposedPaymentSummary,
      status: "pending",
      requestedAt: new Date(),
    };

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
      pendingEdit: editRequest,
    };
    if (!booking.originalTotalAmount) {
      updateFields.originalTotalAmount = originalTotalAmount;
    }
    if (!booking.basePrice) {
      updateFields.basePrice = basePrice;
    }

    await bookingCol.updateOne(
      { bookingId },
      {
        $set: updateFields,
        $push: { editRequests: editRequest }
      } as any
    );

    // Send email notifications
    const userEmailPayload = {
      bookingId: booking.bookingId,
      packageName: booking.packageName || booking.packageTitle || "Travel Package",
      userName: booking.userName || "Valued Customer",
      userEmail: booking.userEmail || decoded.email || "",
      currentDetails: {
        travelDate: booking.travelDate,
        returnDate: booking.returnDate,
        travellers: {
          adults: oldAdults,
          children: oldChildren,
        },
        totalAmount: booking.totalAmount,
      },
      proposedDetails: {
        travelDate: editRequest.travelDate,
        returnDate: editRequest.returnDate,
        travellers: {
          adults: editRequest.adults,
          children: editRequest.children,
        },
        totalAmount: editRequest.totalAmount,
        notes: editRequest.notes,
      },
      currency: booking.currency || "INR",
    };

    sendBookingModificationRequestAsync(userEmailPayload);
    sendAdminBookingModificationAlertAsync({
      ...userEmailPayload,
      userPhone: booking.userPhone,
    });

    const fresh = await bookingCol.findOne({ bookingId });
    const normalized = {
      ...fresh,
      id: fresh!._id.toString(),
      _id: undefined,
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (err) {
    console.error("PATCH SINGLE BOOKING ERROR:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
