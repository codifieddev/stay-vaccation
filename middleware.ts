import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_initialization_only";
const encodedSecret = new TextEncoder().encode(JWT_SECRET);


export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /api/bookings API route
  if (pathname.startsWith("/api/bookings")) {
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

    try {
      const { payload } = await jwtVerify(token, encodedSecret);
      
      // GET, PUT, and DELETE methods on /api/bookings require admin role
      // Exempt my-bookings and specific booking GET requests from admin check
      if (["GET", "PUT", "DELETE"].includes(req.method)) {
        const isMyBookings = pathname === "/api/bookings/my-bookings";
        const isSingleBooking = pathname.match(/^\/api\/bookings\/BK-\d{4}-\d{4}$/);
        
        if (!isMyBookings && !isSingleBooking) {
          if (payload.role !== "admin") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
          }
        }
      }
      
      // POST requires at least a valid logged-in user, which is verified by jwtVerify
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware booking verification failed:", error);
      const response = NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
      response.cookies.delete("sv_token");
      return response;
    }
  }


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
    "/api/categories",
    "/api/regions",
    "/api/activity-pages",
    "/api/business-settings",
    "/api/admin",
    "/api/page-cms",
  ].some((p) => pathname.startsWith(p));

  // If it's an admin UI route or a modifying admin API request (or any request to /api/admin)
  const isStrictAdminAPI = pathname.startsWith("/api/admin");
  
  if (isAdminPath || (isAdminAPI && req.method !== "GET") || isStrictAdminAPI) {
    let token = req.cookies.get("sv_token")?.value;

    if (!token) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

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
    "/api/coupons/:path*",
    "/api/categories/:path*",
    "/api/regions/:path*",
    "/api/activity-pages/:path*",
    "/api/business-settings/:path*",
    "/api/admin/:path*",
    "/api/page-cms/:path*",
    "/api/bookings/:path*",
    "/api/bookings"
  ],
};
