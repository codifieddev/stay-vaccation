import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/app/utils/getDatabase";
import { ObjectId } from "mongodb";
import { sendEmailAsync, sendAdminBookingAlertAsync } from "@/app/utils/email";

export const dynamic = "force-dynamic";

// GET ALL BOOKINGS
export async function GET() {
  try {
    const db = await getDatabase();
    const bookings = await db.collection("bookings").find().toArray();

    const normalized = bookings.map((b) => ({
      ...b,
      id: b._id.toString(),
      _id: undefined, // remove raw ObjectId
    }));

    return NextResponse.json({ success: true, data: normalized }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err) {
    console.error("BOOKINGS GET ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// CREATE BOOKING (Mainly for mock/manual entry)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDatabase();

    const { id, _id, ...insertData } = body;

    const result = await db.collection("bookings").insertOne({
      ...insertData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, insertedId: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("BOOKINGS POST ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// UPDATE BOOKING STATUS
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDatabase();

    const { id, _id, ...updateData } = body;
    const updateId = id || _id;

    if (!updateId || !ObjectId.isValid(updateId)) {
      return NextResponse.json({ success: false, message: "Valid id required" }, { status: 400 });
    }

    const bookingCol = db.collection("bookings");
    const oldBooking = await bookingCol.findOne({ _id: new ObjectId(updateId) });
    if (!oldBooking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    // Keep fields unified: status and bookingStatus should match
    if (updateData.bookingStatus && !updateData.status) {
      updateData.status = updateData.bookingStatus;
    } else if (updateData.status && !updateData.bookingStatus) {
      updateData.bookingStatus = updateData.status;
    }

    const oldStatus = oldBooking.bookingStatus || oldBooking.status || "pending";
    const newStatus = updateData.bookingStatus || updateData.status || oldStatus;

    const isOldActive = oldStatus === "confirmed" || oldStatus === "completed";
    const isNewActive = newStatus === "confirmed" || newStatus === "completed";

    const requestedSeats = Number(
      (oldBooking.travellers?.adults || oldBooking.adults || 1) +
      (oldBooking.travellers?.children || oldBooking.children || 0)
    );

    const packageId = oldBooking.packageId || "";
    let pkgObj = null;

    if (packageId) {
      const pkgCol = db.collection("packages");
      if (ObjectId.isValid(packageId)) {
        pkgObj = await pkgCol.findOne({ _id: new ObjectId(packageId) });
      } else {
        pkgObj = await pkgCol.findOne({ id: packageId });
      }
    }

    if (!isOldActive && isNewActive) {
      // Transition from inactive to active: Check seats and decrement
      if (pkgObj && pkgObj.maxTravelersLimit !== undefined && pkgObj.maxTravelersLimit !== null) {
        const available = pkgObj.availableSeats !== undefined && pkgObj.availableSeats !== null ? pkgObj.availableSeats : pkgObj.maxTravelersLimit;
        if (requestedSeats > available) {
          return NextResponse.json(
            { success: false, message: `Not enough seats available. Only ${available} seat(s) left.` },
            { status: 400 }
          );
        }
        // Decrement
        await db.collection("packages").updateOne(
          { _id: pkgObj._id },
          { $inc: { availableSeats: -requestedSeats } }
        );
        console.log(`[Inventory System] Status transition to active (${newStatus}). Reduced availableSeats by ${requestedSeats} for package ${pkgObj._id}.`);
      }
    } else if (isOldActive && !isNewActive) {
      // Transition from active to inactive: Increment seats (restore)
      if (pkgObj && pkgObj.maxTravelersLimit !== undefined && pkgObj.maxTravelersLimit !== null) {
        const currentAvailable = pkgObj.availableSeats !== undefined && pkgObj.availableSeats !== null ? pkgObj.availableSeats : pkgObj.maxTravelersLimit;
        const newAvailable = Math.min(pkgObj.maxTravelersLimit, currentAvailable + requestedSeats);
        await db.collection("packages").updateOne(
          { _id: pkgObj._id },
          { $set: { availableSeats: newAvailable } }
        );
        console.log(`[Inventory System] Status transition to inactive (${newStatus}). Restored ${requestedSeats} seats to package ${pkgObj._id} (new available: ${newAvailable}).`);
      }
    }

    const updatedFields = {
      ...updateData,
      updatedAt: new Date()
    };

    await bookingCol.updateOne(
      { _id: new ObjectId(updateId) },
      { $set: updatedFields }
    );

    const freshBooking = await bookingCol.findOne({ _id: new ObjectId(updateId) });
    const normalized: any = {
      ...freshBooking,
      id: freshBooking!._id.toString(),
      _id: undefined
    };

    // Build the response — email runs asynchronously so status updates are instant
    const responseJson = NextResponse.json({ success: true, data: normalized });

    // Fire-and-forget emails on status change
    const oldStatusLower = (oldStatus || "").toLowerCase();
    const newStatusLower = (newStatus || "").toLowerCase();

    if (
      newStatusLower !== oldStatusLower &&
      ["pending", "confirmed", "cancelled", "completed"].includes(newStatusLower)
    ) {
      const emailPayload = {
        bookingId: normalized.bookingId,
        packageName: normalized.packageName || normalized.packageTitle,
        travelDate: normalized.travelDate,
        returnDate: normalized.returnDate,
        travellers: normalized.travellers || { adults: normalized.adults || 1, children: normalized.children || 0 },
        totalAmount: normalized.totalAmount,
        currency: normalized.currency,
        bookingStatus: normalized.bookingStatus,
        userEmail: normalized.userEmail,
        userName: normalized.userName || "Valued Customer",
        userPhone: normalized.userPhone,
        notes: normalized.notes,
      };

      // User notification
      sendEmailAsync(emailPayload, `${normalized.bookingId} (${oldStatus} -> ${newStatus})`);

      // Admin notification
      sendAdminBookingAlertAsync({
        ...emailPayload,
        eventType: "status_change",
        previousStatus: oldStatus,
        adminNotes: normalized.adminNotes,
      });
    }

    return responseJson;
  } catch (err) {
    console.error("BOOKINGS PUT ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// DELETE BOOKING
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
    const bookingCol = db.collection("bookings");
    const booking = await bookingCol.findOne({ _id: new ObjectId(id) });
    
    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    const status = booking.bookingStatus || booking.status || "pending";
    const isActive = status === "confirmed" || status === "completed";
    
    if (isActive) {
      // Restore seats back to the package
      const requestedSeats = Number(
        (booking.travellers?.adults || booking.adults || 1) +
        (booking.travellers?.children || booking.children || 0)
      );
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
          const currentAvailable = pkgObj.availableSeats !== undefined && pkgObj.availableSeats !== null ? pkgObj.availableSeats : pkgObj.maxTravelersLimit;
          const newAvailable = Math.min(pkgObj.maxTravelersLimit, currentAvailable + requestedSeats);
          await pkgCol.updateOne(
            { _id: pkgObj._id },
            { $set: { availableSeats: newAvailable } }
          );
          console.log(`[Inventory System] Active booking ${booking.bookingId} deleted. Restored ${requestedSeats} seats to package ${pkgObj._id}.`);
        }
      }
    }

    const result = await bookingCol.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Booking deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("BOOKINGS DELETE ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
