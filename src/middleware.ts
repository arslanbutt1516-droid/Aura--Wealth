import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/features",
  "/prize-bonds",
  "/currency",
  "/faq",
  "/contact",
  "/login",
  "/register",
];

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_PREFIX = "/dashboard";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Allow API routes to handle their own auth
    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/favicon") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    const user = await getAuthFromRequest(request);

    // Redirect authenticated users away from auth pages
    if (AUTH_ROUTES.includes(pathname) && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Protect dashboard routes
    if (pathname.startsWith(PROTECTED_PREFIX)) {
      if (!user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware execution warning:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
