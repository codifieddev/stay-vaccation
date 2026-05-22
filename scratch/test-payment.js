const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(url, method, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== Starting Razorpay & Booking payment Integration Tests ===");

  try {
    // 1. Seed the default users
    console.log("\n1. Seeding default users...");
    const seedRes = await makeRequest(`${BASE_URL}/api/auth/seed`, 'POST');
    console.log("Seed Response status:", seedRes.statusCode);
    
    // 2. Login as regular user
    console.log("\n2. Authenticating as regular user...");
    const loginRes = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', {}, {
      email: "user@stayvacation.com",
      password: "User@123"
    });
    console.log("Login Response status:", loginRes.statusCode);
    
    const token = loginRes.body?.token;
    if (!token) {
      console.error("Login failed. Cannot proceed with booking tests.");
      return;
    }
    console.log("User logged in successfully. Token acquired.");

    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // 3. Test Order Creation
    console.log("\n3. Testing Razorpay Order Creation API...");
    const orderRes = await makeRequest(`${BASE_URL}/api/bookings/razorpay/order`, 'POST', authHeaders, {
      amount: 15000,
      currency: "INR"
    });
    console.log("Order API Response status:", orderRes.statusCode);
    console.log("Order API Response body:", orderRes.body);

    if (!orderRes.body || !orderRes.body.success) {
      console.error("Failed to create Razorpay Order. Stopping tests.");
      return;
    }

    const { orderId, amount, currency, mock } = orderRes.body;
    console.log(`Order ID generated: ${orderId} (Mock mode: ${mock})`);

    // 4. Test Successful Payment Booking Creation
    console.log("\n4. Testing Booking Creation with Successful Payment (Confirmed/Paid)...");
    const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
    const mockSignature = `sig_mock_${Math.random().toString(36).substring(2, 10)}`;

    const bookingSuccessRes = await makeRequest(`${BASE_URL}/api/bookings/create`, 'POST', authHeaders, {
      packageId: "test-package-123",
      packageName: "Ultimate Swiss Alps Escape",
      totalAmount: 15000,
      travelDate: "2026-07-15",
      returnDate: "2026-07-22",
      travellers: { adults: 2, children: 0 },
      userName: "Guest User",
      userEmail: "user@stayvacation.com",
      userPhone: "9876543210",
      notes: "Vegetarian meals preferred",
      currency: "INR",
      orderId: orderId,
      paymentId: mockPaymentId,
      signature: mockSignature,
      paymentStatus: "paid"
    });

    console.log("Booking Success API status:", bookingSuccessRes.statusCode);
    console.log("Booking Success response:", bookingSuccessRes.body);

    if (bookingSuccessRes.body && bookingSuccessRes.body.success) {
      const createdBooking = bookingSuccessRes.body.data;
      const bookingId = bookingSuccessRes.body.bookingId;
      console.log(`\u2714 SUCCESS: Booking ${bookingId} created with status: ${createdBooking.bookingStatus}, paymentStatus: ${createdBooking.paymentStatus}`);
      
      // Check if email HTML file is generated in scratch/emails
      const emailPath = path.join(__dirname, 'emails', `${bookingId}.html`);
      if (fs.existsSync(emailPath)) {
        console.log(`\u2714 SUCCESS: Confirmation email HTML mockup saved at: ${emailPath}`);
      } else {
        console.warn(`\u26A0 WARNING: Confirmation email mockup not found at expected path: ${emailPath}`);
      }
    } else {
      console.error("\u274C FAILURE: Booking creation failed:", bookingSuccessRes.body);
    }

    // 5. Test Failed/Cancelled Payment Booking Creation
    console.log("\n5. Testing Booking Creation with Failed/Cancelled Payment (Pending/Unpaid)...");
    const orderRes2 = await makeRequest(`${BASE_URL}/api/bookings/razorpay/order`, 'POST', authHeaders, {
      amount: 9999,
      currency: "INR"
    });
    const orderId2 = orderRes2.body?.orderId;

    const bookingFailedRes = await makeRequest(`${BASE_URL}/api/bookings/create`, 'POST', authHeaders, {
      packageId: "test-package-456",
      packageName: "Goa Beachfront Villa Stay",
      totalAmount: 9999,
      travelDate: "2026-08-01",
      returnDate: "2026-08-05",
      travellers: { adults: 1, children: 1 },
      userName: "Guest User",
      userEmail: "user@stayvacation.com",
      userPhone: "9876543210",
      notes: "",
      currency: "INR",
      orderId: orderId2,
      paymentStatus: "failed", // simulated failure
      bookingStatus: "pending"
    });

    console.log("Booking Failed API status:", bookingFailedRes.statusCode);
    console.log("Booking Failed response:", bookingFailedRes.body);

    if (bookingFailedRes.body && bookingFailedRes.body.success) {
      const createdBooking = bookingFailedRes.body.data;
      const bookingId = bookingFailedRes.body.bookingId;
      console.log(`\u2714 SUCCESS: Booking ${bookingId} created with status: ${createdBooking.bookingStatus}, paymentStatus: ${createdBooking.paymentStatus}`);
      
      // Verify NO email mockup is generated for pending bookings
      const emailPath = path.join(__dirname, 'emails', `${bookingId}.html`);
      if (fs.existsSync(emailPath)) {
        console.error(`\u274C FAILURE: Email mockup generated for a pending booking! Path: ${emailPath}`);
      } else {
        console.log(`\u2714 SUCCESS: No email mockup generated for pending/unpaid booking.`);
      }
    } else {
      console.error("\u274C FAILURE: Failed booking creation API call failed.");
    }

    console.log("\n=== Razorpay & Booking Payment Tests Completed ===");
  } catch (err) {
    console.error("\nTests failed with error:", err.message);
    console.log("Make sure Next.js dev server is running on port 3000 before executing.");
  }
}

runTests();
