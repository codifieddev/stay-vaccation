import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("sv_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
      email: string;
    };

    return NextResponse.json({
      success: true,
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token." },
      { status: 401 }
    );
  }
}
