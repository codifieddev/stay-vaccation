import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/app/utils/getDatabase";
import { ObjectId } from "mongodb";

// GET all currencies
export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    let currencies = await db.collection("currencies").find({}).toArray();
    
    // Fetch global settings
    let settingsDoc = await db.collection("currencies").findOne({ type: "settings" });
    if (!settingsDoc) {
      const defaultSettings = { type: "settings", fxMarkup: 0.02 };
      await db.collection("currencies").insertOne(defaultSettings);
      settingsDoc = await db.collection("currencies").findOne({ type: "settings" });
    }
    
    const fxMarkup = settingsDoc?.fxMarkup || 0;
    
    // Auto-seed if empty (excluding settings doc)
    const currencyDocs = currencies.filter(c => c.type !== "settings");
    if (currencyDocs.length === 0) {
      const defaultCurrencies = [
        { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", exchangeRate: 1, isDefault: true, isEnabled: true },
        { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", exchangeRate: 0.012, isDefault: false, isEnabled: true },
        { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", exchangeRate: 0.011, isDefault: false, isEnabled: true },
        { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", exchangeRate: 0.0094, isDefault: false, isEnabled: true },
        { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", exchangeRate: 0.044, isDefault: false, isEnabled: true },
        { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", exchangeRate: 0.016, isDefault: false, isEnabled: true },
        { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭", exchangeRate: 0.44, isDefault: false, isEnabled: true },
      ];
      await db.collection("currencies").insertMany(defaultCurrencies.map(c => ({ ...c, createdAt: new Date(), updatedAt: new Date() })));
      currencies = await db.collection("currencies").find({}).toArray();
    }

    const normalized = currencies
      .filter(c => c.type !== "settings")
      .map(c => ({
        ...c,
        _id: c._id.toString()
      }));

    return NextResponse.json({ 
      success: true, 
      data: normalized,
      fxMarkup: fxMarkup
    });
  } catch (err) {
    console.error("GET CURRENCIES ERROR:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST new currency or update settings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDatabase();
    
    // Check if updating global settings
    if (body.type === "settings") {
      await db.collection("currencies").updateOne(
        { type: "settings" },
        { $set: { fxMarkup: body.fxMarkup, updatedAt: new Date() } },
        { upsert: true }
      );
      return NextResponse.json({ success: true, message: "Settings updated" });
    }

    // If setting as default, unset others
    if (body.isDefault) {
      await db.collection("currencies").updateMany({}, { $set: { isDefault: false } });
    }

    const result = await db.collection("currencies").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      message: "Currency added", 
      data: { ...body, _id: result.insertedId.toString() } 
    });
  } catch (err) {
    console.error("POST CURRENCY ERROR:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PUT update currency
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { _id, ...updateData } = body;
    
    if (!_id || !ObjectId.isValid(_id)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const db = await getDatabase();

    // If setting as default, unset others
    if (updateData.isDefault) {
      await db.collection("currencies").updateMany(
        { _id: { $ne: new ObjectId(_id) } }, 
        { $set: { isDefault: false } }
      );
    }

    await db.collection("currencies").updateOne(
      { _id: new ObjectId(_id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: "Currency updated" });
  } catch (err) {
    console.error("PUT CURRENCY ERROR:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PATCH - Sync rates with external API
export async function PATCH(req: NextRequest) {
  try {
    const db = await getDatabase();
    const currencies = await db.collection("currencies").find({ isEnabled: true }).toArray();
    
    // Fetch latest rates from public API (Base: INR)
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
    const marketData = await response.json();
    
    if (!marketData || !marketData.rates) {
      throw new Error("Failed to fetch market rates");
    }

    let updatedCount = 0;
    const rates = marketData.rates;

    for (const curr of currencies) {
      if (curr.code === "INR") continue; // INR is always 1
      
      const newRate = rates[curr.code];
      if (newRate) {
        await db.collection("currencies").updateOne(
          { _id: curr._id },
          { $set: { exchangeRate: newRate, updatedAt: new Date() } }
        );
        updatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Synced ${updatedCount} currencies with live market rates`,
      updatedCount 
    });
  } catch (err: any) {
    console.error("SYNC CURRENCIES ERROR:", err);
    return NextResponse.json({ success: false, message: err.message || "Sync failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const db = await getDatabase();
    await db.collection("currencies").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, message: "Currency deleted" });
  } catch (err) {
    console.error("DELETE CURRENCY ERROR:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
