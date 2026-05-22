import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/app/utils/getDatabase";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { sendBookingModificationProcessedAsync } from "@/app/utils/email";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(
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

    if (decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
    }

    // --- Resolve params ---
    const resolvedParams = await params;
    const { bookingId } = resolvedParams;
    if (!bookingId) {
      return NextResponse.json({ success: false, message: "Booking ID required" }, { status: 400 });
    }

    const body = await req.json();
    const { action, adminNotes } = body;

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ success: false, message: "Invalid action. Must be 'approve' or 'reject'" }, { status: 400 });
    }

    const db = await getDatabase();
    const bookingCol = db.collection<any>("bookings");
    const booking = await bookingCol.findOne({ bookingId });

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    const pendingEdit = booking.pendingEdit;
    if (!pendingEdit) {
      return NextResponse.json({ success: false, message: "No pending modification request found for this booking" }, { status: 400 });
    }

    const requestId = pendingEdit.requestId;

    if (action === "approve") {
      // 1. Calculate seats adjustments
      const currentStatus = booking.bookingStatus || booking.status || "pending";
      const oldAdults = booking.travellers?.adults ?? booking.adults ?? 1;
      const oldChildren = booking.travellers?.children ?? booking.children ?? 0;
      const oldTotal = oldAdults + oldChildren;

      const newAdults = pendingEdit.adults;
      const newChildren = pendingEdit.children;
      const newTotal = newAdults + newChildren;
      const extraSeatsNeeded = newTotal - oldTotal;

      const packageId = booking.packageId || "";
      let pkgObj = null;

      if (packageId) {
        const pkgCol = db.collection("packages");
        if (ObjectId.isValid(packageId)) {
          pkgObj = await pkgCol.findOne({ _id: new ObjectId(packageId) });
        } else {
          pkgObj = await pkgCol.findOne({ id: packageId });
        }
      }

      // Check seat availability if extra seats are needed
      if (extraSeatsNeeded > 0 && pkgObj) {
        const available = pkgObj.availableSeats !== undefined && pkgObj.availableSeats !== null
          ? pkgObj.availableSeats
          : pkgObj.maxTravelersLimit || 999;
        
        if (extraSeatsNeeded > available) {
          return NextResponse.json(
            { success: false, message: `Insufficient package seats. Only ${available} available. Requested ${extraSeatsNeeded} more.` },
            { status: 400 }
          );
        }
      }

      // Update package seats inventory if confirmed booking
      if (currentStatus === "confirmed" && pkgObj && pkgObj.maxTravelersLimit !== undefined) {
        const pkgCol = db.collection("packages");
        const currentAvailable = pkgObj.availableSeats !== undefined && pkgObj.availableSeats !== null
          ? pkgObj.availableSeats
          : pkgObj.maxTravelersLimit;
        const newAvailable = Math.max(0, Math.min(pkgObj.maxTravelersLimit, currentAvailable - extraSeatsNeeded));
        await pkgCol.updateOne(
          { _id: pkgObj._id },
          { $set: { availableSeats: newAvailable } }
        );
        console.log(`[Inventory System] Modification approved. Adjusted availableSeats by ${-extraSeatsNeeded} (New: ${newAvailable}) for package ${pkgObj._id}`);
      }

      // Apply changes to core booking details
      const updatedFields: Record<string, any> = {
        updatedAt: new Date(),
        adults: newAdults,
        children: newChildren,
        travellers: { adults: newAdults, children: newChildren },
        travelDate: pendingEdit.travelDate,
        returnDate: pendingEdit.returnDate,
        notes: pendingEdit.notes,
        totalAmount: pendingEdit.totalAmount,
        paymentSummary: pendingEdit.paymentSummary,
        pendingEdit: null,
      };

      if (pendingEdit.paymentSummary?.basePrice) {
        updatedFields.basePrice = pendingEdit.paymentSummary.basePrice;
      }
      if (pendingEdit.paymentSummary?.originalTotalAmount) {
        updatedFields.originalTotalAmount = pendingEdit.paymentSummary.originalTotalAmount;
      }

      const editHistoryEntry = {
        oldAdults,
        oldChildren,
        newAdults,
        newChildren,
        oldTravelerCount: oldTotal,
        newTravelerCount: newTotal,
        previousAmount: booking.totalAmount,
        updatedAmount: pendingEdit.totalAmount,
        modifiedBy: decoded.email || "Admin",
        timestamp: new Date(),
      };

      // Update in db: set new values, clear pendingEdit, and push to editHistory
      await bookingCol.updateOne(
        { bookingId },
        {
          $set: updatedFields,
          $push: { editHistory: editHistoryEntry } as any,
        } as any
      );

      // Find the index or item in editRequests and update it
      const editRequests = booking.editRequests || [];
      const updatedRequests = editRequests.map((req: any) => {
        if (req.requestId === requestId) {
          return {
            ...req,
            status: "approved",
            adminNotes: adminNotes || "",
            processedAt: new Date(),
          };
        }
        return req;
      });

      await bookingCol.updateOne(
        { bookingId },
        {
          $set: { editRequests: updatedRequests }
        } as any
      );

      // Send confirmation email
      sendBookingModificationProcessedAsync({
        bookingId: booking.bookingId,
        packageName: booking.packageName || booking.packageTitle || "Travel Package",
        userName: booking.userName || "Valued Customer",
        userEmail: booking.userEmail || "",
        status: "approved",
        adminNotes: adminNotes || undefined,
        details: {
          travelDate: pendingEdit.travelDate,
          returnDate: pendingEdit.returnDate,
          travellers: { adults: newAdults, children: newChildren },
          totalAmount: pendingEdit.totalAmount,
        },
        currency: booking.currency || "INR",
      });

    } else {
      // action === "reject"
      // Clear pendingEdit, and update history item to rejected
      const editRequests = booking.editRequests || [];
      const updatedRequests = editRequests.map((req: any) => {
        if (req.requestId === requestId) {
          return {
            ...req,
            status: "rejected",
            adminNotes: adminNotes || "",
            processedAt: new Date(),
          };
        }
        return req;
      });

      await bookingCol.updateOne(
        { bookingId },
        {
          $set: {
            pendingEdit: null,
            editRequests: updatedRequests,
            updatedAt: new Date(),
          }
        } as any
      );

      // Send rejection email
      sendBookingModificationProcessedAsync({
        bookingId: booking.bookingId,
        packageName: booking.packageName || booking.packageTitle || "Travel Package",
        userName: booking.userName || "Valued Customer",
        userEmail: booking.userEmail || "",
        status: "rejected",
        adminNotes: adminNotes || undefined,
        details: {
          travelDate: booking.travelDate,
          returnDate: booking.returnDate,
          travellers: {
            adults: booking.travellers?.adults ?? booking.adults ?? 1,
            children: booking.travellers?.children ?? booking.children ?? 0,
          },
          totalAmount: booking.totalAmount,
        },
        currency: booking.currency || "INR",
      });
    }

    const fresh = await bookingCol.findOne({ bookingId });
    const normalized = {
      ...fresh,
      id: fresh!._id.toString(),
      _id: undefined,
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (err) {
    console.error("PROCESS EDIT BOOKING ERROR:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
