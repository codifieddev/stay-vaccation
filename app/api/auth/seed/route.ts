import { NextResponse } from "next/server";
import { getDatabase } from "../../../utils/getDatabase";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const db = await getDatabase();
    const col = db.collection("users");

    const defaultUsers = [
      {
        email: "admin@stayvacation.com",
        password: "Admin@123",
        role: "admin",
        name: "Admin User",
      },
      {
        email: "user@stayvacation.com",
        password: "User@123",
        role: "user",
        name: "Guest User",
      },
    ];

    const results = [];

    for (const u of defaultUsers) {
      const existing = await col.findOne({ email: u.email });
      if (existing) {
        results.push({ email: u.email, status: "already_exists" });
        continue;
      }
      const hashed = await bcrypt.hash(u.password, 12);
      await col.insertOne({
        email: u.email,
        password: hashed,
        role: u.role,
        name: u.name,
        createdAt: new Date(),
      });
      results.push({ email: u.email, status: "created" });
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("SEED USERS ERROR DETAILS:", {
      message: err.message,
      stack: err.stack,
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
      }
    });
    return NextResponse.json(
      { 
        success: false, 
        message: "Seed failed. Environment might missing MONGODB_URI.",
        debug: process.env.NODE_ENV === "development" ? err.message : undefined
      }, 
      { status: 500 }
    );
  }
}

