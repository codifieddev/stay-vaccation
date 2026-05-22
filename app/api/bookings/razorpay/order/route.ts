import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const currency = body.currency || "INR";

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ success: false, message: "Valid amount is required" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.log("[Razorpay API] Key ID/Secret not set in .env. Falling back to Mock Order Creation.");
      const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        amount: Math.round(amount * 100), // in paise
        currency,
        mock: true,
        keyId: "rzp_test_mock_stayvacation",
      });
    }

    // Try to load razorpay package dynamically
    let Razorpay;
    try {
      Razorpay = require("razorpay");
    } catch (e) {
      console.warn("[Razorpay API] razorpay package not installed. Using mock fallback despite credentials.");
      const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        amount: Math.round(amount * 100), // in paise
        currency,
        mock: true,
        keyId: "rzp_test_mock_stayvacation",
      });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receipt = `rcpt_${Math.random().toString(36).substring(2, 10)}`;
    const order = await instance.orders.create({
      amount: Math.round(amount * 100), // in paise (e.g. INR 100 => 10000 paise)
      currency,
      receipt,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      mock: false,
      keyId,
    });
  } catch (err: any) {
    console.error("RAZORPAY ORDER API ERROR:", err);
    return NextResponse.json({ success: false, message: err.message || "Internal server error" }, { status: 500 });
  }
}
