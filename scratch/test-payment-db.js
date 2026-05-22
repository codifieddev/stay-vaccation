const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value.trim();
      }
    }
  } catch (e) {
    console.error('Could not load .env file', e);
  }
}

// Branded email mockup helper
function generateMockEmail(booking) {
  const currencySymbol = "₹";
  const formattedAmount = `${currencySymbol}${booking.totalAmount.toLocaleString()}`;
  
  let badgeBg = "#ecfdf5";
  let badgeText = "#047857";
  
  const totalTravelers = booking.travellers.adults + booking.travellers.children;
  const travelersDetail = `${totalTravelers} (${booking.travellers.adults} Adult${booking.travellers.adults > 1 ? "s" : ""}${
    booking.travellers.children > 0 ? `, ${booking.travellers.children} Child${booking.travellers.children > 1 ? "ren" : ""}` : ""
  })`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Booking Confirmation - StayVacation</title>
  <style>
    body { margin: 0; padding: 0; font-family: sans-serif; background-color: #f3f4f6; color: #1f2937; }
    .wrapper { width: 100%; background-color: #f3f4f6; padding: 40px 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
    .header { background-color: #061217; padding: 30px; text-align: center; border-bottom: 4px solid #ff6b00; }
    .logo { font-size: 24px; font-weight: 800; color: #ffffff; text-decoration: none; }
    .logo span { color: #ff9500; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 20px; font-weight: 700; color: #111827; }
    .receipt-card { background-color: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px; padding: 24px; }
    .detail-table { width: 100%; border-collapse: collapse; }
    .detail-table td { padding: 8px 0; font-size: 15px; }
    .detail-label { color: #6b7280; }
    .detail-value { color: #111827; font-weight: 600; text-align: right; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .total-row td { border-top: 1px solid #e5e7eb; padding-top: 14px; }
    .total-value { color: #ff6b00; font-weight: 800; font-size: 20px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="#" class="logo">Stay<span>Vacation</span></a>
      </div>
      <div class="content">
        <h1 class="greeting">Hi ${booking.userName},</h1>
        <p>Your booking request has been confirmed. Below are the details of your itinerary.</p>
        <div class="receipt-card">
          <table class="detail-table">
            <tr>
              <td class="detail-label">Booking ID</td>
              <td class="detail-value">${booking.bookingId}</td>
            </tr>
            <tr>
              <td class="detail-label">Package Name</td>
              <td class="detail-value">${booking.packageName}</td>
            </tr>
            <tr>
              <td class="detail-label">Travel Date</td>
              <td class="detail-value">${booking.travelDate}</td>
            </tr>
            <tr>
              <td class="detail-label">Travelers</td>
              <td class="detail-value">${travelersDetail}</td>
            </tr>
            <tr>
              <td class="detail-label">Booking Status</td>
              <td class="detail-value">
                <span class="status-badge" style="background-color: ${badgeBg}; color: ${badgeText};">${booking.bookingStatus}</span>
              </td>
            </tr>
            <tr class="total-row">
              <td class="total-label">Total Paid</td>
              <td class="total-value">${formattedAmount}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

  const emailsDir = path.join(__dirname, 'emails');
  if (!fs.existsSync(emailsDir)) {
    fs.mkdirSync(emailsDir, { recursive: true });
  }
  const filePath = path.join(emailsDir, `${booking.bookingId}.html`);
  fs.writeFileSync(filePath, htmlContent, "utf-8");
  console.log(`[Verification] Local HTML mockup written to: ${filePath}`);
}

async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in environment');
    return;
  }

  const client = new MongoClient(uri);
  try {
    console.log("Connecting to database...");
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const bookingsCol = db.collection('bookings');

    console.log("\n--- Scenario 1: Successful Payment Booking ---");
    const testSuccessBooking = {
      bookingId: "BK-TEST-SUCCESS",
      userId: "test_user_999",
      packageId: "test_pkg_100",
      packageName: "Ultimate Swiss Alps Escape",
      packageTitle: "Ultimate Swiss Alps Escape",
      totalAmount: 15000,
      currency: "INR",
      bookingStatus: "confirmed",
      status: "confirmed",
      paymentStatus: "paid",
      bookingDate: new Date(),
      travelDate: "2026-07-15",
      returnDate: "2026-07-22",
      travellers: { adults: 2, children: 0 },
      adults: 2,
      children: 0,
      userName: "Guest User",
      userEmail: "user@stayvacation.com",
      userPhone: "9876543210",
      paymentId: "pay_mock_success123",
      orderId: "order_mock_success123",
      signature: "sig_mock_success123",
      transactionDetails: {
        paymentId: "pay_mock_success123",
        orderId: "order_mock_success123",
        signature: "sig_mock_success123",
        verified: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert
    await bookingsCol.deleteOne({ bookingId: "BK-TEST-SUCCESS" });
    const insertSuccess = await bookingsCol.insertOne(testSuccessBooking);
    console.log("Successfully inserted Confirmed booking.");

    // Query back
    const querySuccess = await bookingsCol.findOne({ bookingId: "BK-TEST-SUCCESS" });
    console.log("Queried Booking status:", querySuccess.bookingStatus);
    console.log("Queried Payment status:", querySuccess.paymentStatus);
    console.log("Order ID:", querySuccess.orderId);
    console.log("Payment ID:", querySuccess.paymentId);
    console.log("Transaction Details verified field:", querySuccess.transactionDetails?.verified);

    if (querySuccess.bookingStatus === "confirmed" && querySuccess.paymentStatus === "paid") {
      console.log("\u2714 Success: Database verification fields matching successfully!");
      generateMockEmail(querySuccess);
    } else {
      console.error("\u274C Failure: Field mismatch in database storage.");
    }

    console.log("\n--- Scenario 2: Failed/Cancelled Payment Booking ---");
    const testFailedBooking = {
      bookingId: "BK-TEST-FAILED",
      userId: "test_user_999",
      packageId: "test_pkg_200",
      packageName: "Goa Beachfront Villa Stay",
      packageTitle: "Goa Beachfront Villa Stay",
      totalAmount: 9999,
      currency: "INR",
      bookingStatus: "pending",
      status: "pending",
      paymentStatus: "failed",
      bookingDate: new Date(),
      travelDate: "2026-08-01",
      returnDate: "2026-08-05",
      travellers: { adults: 1, children: 1 },
      adults: 1,
      children: 1,
      userName: "Guest User",
      userEmail: "user@stayvacation.com",
      userPhone: "9876543210",
      orderId: "order_mock_failed123",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert
    await bookingsCol.deleteOne({ bookingId: "BK-TEST-FAILED" });
    await bookingsCol.insertOne(testFailedBooking);
    console.log("Successfully inserted Failed booking.");

    // Query back
    const queryFailed = await bookingsCol.findOne({ bookingId: "BK-TEST-FAILED" });
    console.log("Queried Booking status:", queryFailed.bookingStatus);
    console.log("Queried Payment status:", queryFailed.paymentStatus);
    console.log("Order ID:", queryFailed.orderId);
    console.log("Payment ID:", queryFailed.paymentId);

    if (queryFailed.bookingStatus === "pending" && queryFailed.paymentStatus === "failed") {
      console.log("\u2714 Success: Database verification fields for failed checkout match successfully!");
    } else {
      console.error("\u274C Failure: Field mismatch in failed booking database storage.");
    }

    // Clean up
    console.log("\nCleaning up test records from database...");
    await bookingsCol.deleteOne({ bookingId: "BK-TEST-SUCCESS" });
    await bookingsCol.deleteOne({ bookingId: "BK-TEST-FAILED" });
    console.log("Database cleaned up.");

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
