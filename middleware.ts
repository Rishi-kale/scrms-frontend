import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Minimal auth guard: redirect to /login if no token for protected routes
const PROTECTED_PREFIXES = ["/leads", "/projects", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("Company_token")?.value;
  console.log("Middleware - checking auth for path:", pathname, "Token found:", !!token);
  // Fallback to header from the browser is not available in middleware; rely on cookie if present
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/leads",
    "/projects",
    "/settings",
  ],
};




