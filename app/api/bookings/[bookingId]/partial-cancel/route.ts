import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/app/utils/getDatabase";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET!;

// Helper: resolve JWT from cookie or Bearer header
function extractToken(req: NextRequest): string | null {
  const cookie = req.cookies.get("sv_token")?.value;
  if (cookie) return cookie;
  const auth = req.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.split(" ")[1];
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> | { bookingId: string } }
) {
  try {
    // ── Auth ────────────────────────────────────────────────────────
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let decoded: { userId: string; role: string; email: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; email: string };
    } catch {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    // ── Resolve params ───────────────────────────────────────────────
    const resolvedParams = await params;
    const { bookingId } = resolvedParams;
    if (!bookingId) {
      return NextResponse.json({ success: false, message: "Booking ID required" }, { status: 400 });
    }

    const db = await getDatabase();
    const bookingCol = db.collection("bookings");
    const booking = await bookingCol.findOne({ bookingId });

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    // ── Ownership check ──────────────────────────────────────────────
    if (booking.userId !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // ── Status guard ─────────────────────────────────────────────────
    const currentStatus = booking.bookingStatus || booking.status || "pending";
    if (currentStatus === "completed" || currentStatus === "cancelled") {
      return NextResponse.json(
        { success: false, message: `Cannot cancel travelers on a "${currentStatus}" booking.` },
        { status: 422 }
      );
    }

    // ── Parse body ───────────────────────────────────────────────────
    const body = await req.json();
    const cancelAdults: number = typeof body.cancelAdults === "number" ? Math.floor(body.cancelAdults) : 0;
    const cancelChildren: number = typeof body.cancelChildren === "number" ? Math.floor(body.cancelChildren) : 0;
    const reason: string = typeof body.reason === "string" ? body.reason.trim() : "";

    // Must cancel at least one traveler
    if (cancelAdults <= 0 && cancelChildren <= 0) {
      return NextResponse.json(
        { success: false, message: "Must cancel at least 1 traveler." },
        { status: 400 }
      );
    }

    // ── Current counts ───────────────────────────────────────────────
    const currentAdults: number = booking.travellers?.adults ?? booking.adults ?? 1;
    const currentChildren: number = booking.travellers?.children ?? booking.children ?? 0;

    // Validate: can't cancel more than what exists
    if (cancelAdults > currentAdults) {
      return NextResponse.json(
        { success: false, message: `Cannot cancel ${cancelAdults} adult(s); only ${currentAdults} on this booking.` },
        { status: 400 }
      );
    }
    if (cancelChildren > currentChildren) {
      return NextResponse.json(
        { success: false, message: `Cannot cancel ${cancelChildren} child(ren); only ${currentChildren} on this booking.` },
        { status: 400 }
      );
    }

    const newAdults = currentAdults - cancelAdults;
    const newChildren = currentChildren - cancelChildren;
    const remainingTotal = newAdults + newChildren;
    const isFullCancellation = remainingTotal === 0;

    // ── Price recalculation ──────────────────────────────────────────
    const basePrice: number =
      booking.paymentSummary?.basePrice ??
      booking.basePrice ??
      booking.totalAmount / (1.05 * (currentAdults + currentChildren * 0.5));

    const adultUnitPrice = basePrice;
    const childUnitPrice = basePrice * 0.5;

    // Amount being cancelled (what the user should receive as refund)
    const cancelledAdultAmount = adultUnitPrice * cancelAdults;
    const cancelledChildAmount = childUnitPrice * cancelChildren;
    const cancelledSubtotal = cancelledAdultAmount + cancelledChildAmount;
    const cancelledTax = cancelledSubtotal * 0.05;
    const refundAmount = cancelledSubtotal + cancelledTax;

    // New booking total
    const newAdultTotal = adultUnitPrice * newAdults;
    const newChildTotal = childUnitPrice * newChildren;
    const newSubtotal = newAdultTotal + newChildTotal;
    const newTaxesAndFees = newSubtotal * 0.05;
    const newTotalAmount = newSubtotal + newTaxesAndFees;

    const originalTotalAmount =
      booking.originalTotalAmount ??
      booking.paymentSummary?.originalTotalAmount ??
      booking.totalAmount;

    const adjustmentAmount = newTotalAmount - originalTotalAmount; // negative = refund

    // ── Seat inventory management ────────────────────────────────────
    const seatsFreed = cancelAdults + cancelChildren;
    if (seatsFreed > 0 && (currentStatus === "confirmed" || currentStatus === "pending")) {
      const packageId = booking.packageId || "";
      if (packageId) {
        const pkgCol = db.collection("packages");
        let pkgObj = null;
        if (ObjectId.isValid(packageId)) {
          pkgObj = await pkgCol.findOne({ _id: new ObjectId(packageId) });
        } else {
          pkgObj = await pkgCol.findOne({ id: packageId });
        }
        if (pkgObj && pkgObj.maxTravelersLimit != null) {
          const currentAvail = pkgObj.availableSeats ?? 0;
          const newAvail = Math.min(pkgObj.maxTravelersLimit, currentAvail + seatsFreed);
          await pkgCol.updateOne({ _id: pkgObj._id }, { $set: { availableSeats: newAvail } });
        }
      }
    }

    // ── Build cancellation log entry ─────────────────────────────────
    const cancellationEntry = {
      cancelAdults,
      cancelChildren,
      newAdults,
      newChildren,
      refundAmount,
      reason: reason || null,
      at: new Date(),
    };

    // ── Build update fields ──────────────────────────────────────────
    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
      adults: newAdults,
      children: newChildren,
      travellers: { adults: newAdults, children: newChildren },
      totalAmount: newTotalAmount,
      basePrice,
      originalTotalAmount: originalTotalAmount, // preserve original
      paymentSummary: {
        basePrice,
        adultCount: newAdults,
        adultUnitPrice,
        adultTotal: newAdultTotal,
        childCount: newChildren,
        childUnitPrice,
        childTotal: newChildTotal,
        subtotal: newSubtotal,
        taxRate: 0.05,
        taxesAndFees: newTaxesAndFees,
        totalAmount: newTotalAmount,
        originalTotalAmount,
        adjustmentAmount,
        lastRecalculatedAt: new Date(),
      },
    };

    if (isFullCancellation) {
      updateFields.bookingStatus = "cancelled";
      updateFields.status = "cancelled";
    }

    const editHistoryEntry = {
      oldAdults: currentAdults,
      oldChildren: currentChildren,
      newAdults,
      newChildren,
      oldTravelerCount: currentAdults + currentChildren,
      newTravelerCount: newAdults + newChildren,
      previousAmount: booking.totalAmount,
      updatedAmount: newTotalAmount,
      modifiedBy: decoded.email || "Customer",
      timestamp: new Date(),
    };

    // Append to cancellations and editHistory arrays
    await bookingCol.updateOne(
      { bookingId },
      {
        $set: updateFields,
        $push: {
          cancellations: cancellationEntry,
          editHistory: editHistoryEntry,
        } as any,
      }
    );

    const fresh = await bookingCol.findOne({ bookingId });
    const normalized = {
      ...fresh,
      id: fresh!._id.toString(),
      _id: undefined,
    };

    return NextResponse.json({
      success: true,
      data: normalized,
      refundAmount,
      isFullCancellation,
      cancelledAdults: cancelAdults,
      cancelledChildren: cancelChildren,
    });
  } catch (err) {
    console.error("PARTIAL CANCEL ERROR:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
