import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminJWT, COOKIE_NAME } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and login API endpoint without authentication
  if (pathname === "/admin/login" || pathname === "/api/admin/auth/login") {
    return NextResponse.next();
  }

  // Intercept all other /admin or /api/admin requests
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyAdminJWT(token);
    if (!session) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "INVALID_SESSION" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
