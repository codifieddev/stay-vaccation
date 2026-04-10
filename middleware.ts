import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Paths that require the 'admin' role
  const isAdminPath = pathname.startsWith("/admin");
  
  // API paths that only admins should modify (POST/PUT/DELETE)
  const isAdminAPI = [
    "/api/packages",
    "/api/destinations",
    "/api/transfers",
    "/api/activities",
    "/api/hotels",
    "/api/coupons",
  ].some((p) => pathname.startsWith(p));

  // If it's an admin UI route or a modifying admin API request
  if (isAdminPath || (isAdminAPI && req.method !== "GET")) {
    const token = req.cookies.get("sv_token")?.value;

    if (!token) {
      if (isAdminAPI) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }
      // Redirect to login for UI
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, encodedSecret);
      
      if (payload.role !== "admin") {
        if (isAdminAPI) {
          return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }
        // Redirect standard users away from admin panel
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Allow access
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware JWT verification failed:", error);
      
      const response = isAdminAPI
        ? NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 })
        : NextResponse.redirect(new URL("/login", req.url));

      // Clear the invalid cookie
      response.cookies.delete("sv_token");
      return response;
    }
  }

  // Next.js static files and other public routes pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/packages/:path*",
    "/api/destinations/:path*",
    "/api/transfers/:path*",
    "/api/activities/:path*",
    "/api/hotels/:path*",
    "/api/coupons/:path*"
  ],
};
