import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/app/utils/getDatabase";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_initialization_only";
    const encodedSecret = new TextEncoder().encode(JWT_SECRET);

    const { email, password } = await req.json();


    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const user = await db.collection("users").findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await new SignJWT({ userId: user._id.toString(), role: user.role, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(encodedSecret);

    const res = NextResponse.json({
      success: true,
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      token,
      message: "Login successful",
    });

    res.cookies.set("sv_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch (err: any) {
    console.error("LOGIN ERROR DETAILS:", {
      message: err.message,
      stack: err.stack,
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
      }
    });

    return NextResponse.json(
      { 
        success: false, 
        message: "Server error during login.",
        debug: process.env.NODE_ENV === "development" ? err.message : undefined 
      },
      { status: 500 }
    );
  }
}

