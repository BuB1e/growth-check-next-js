import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

const isMockMode = process.env.USE_MOCK_DATA === "true";
const mockRole = process.env.DEV_MOCK_ROLE || "ADMIN";

// Routes that don't require authentication
const publicPaths = ["/login", "/register", "/api/auth", "/api/"];

// Role → default redirect path
const roleHomePaths: Record<string, string> = {
  ADMIN: "/admin",
  HEAD: "/head",
  STAFF: "/staff",
};

// Route prefix → required role(s)
const routeRoleMap: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/head": ["HEAD"],
  "/staff": ["STAFF"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and API routes
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ─── MOCK MODE: skip real auth, use DEV_MOCK_ROLE ─────────
  if (isMockMode) {
    const userRole = mockRole;

    // Root path → redirect to role home
    if (pathname === "/") {
      const homePath = roleHomePaths[userRole] || "/staff";
      return NextResponse.redirect(new URL(homePath, request.url));
    }

    // Check role access
    for (const [prefix, allowedRoles] of Object.entries(routeRoleMap)) {
      if (pathname.startsWith(prefix) && !allowedRoles.includes(userRole)) {
        const homePath = roleHomePaths[userRole] || "/staff";
        return NextResponse.redirect(new URL(homePath, request.url));
      }
    }

    return NextResponse.next();
  }

  // ─── PRODUCTION MODE: real BetterAuth session ─────────────
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Not authenticated → redirect to login
  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = (session.user as { role?: string }).role ?? "STAFF";

  // Root path → redirect to role home
  if (pathname === "/") {
    const homePath = roleHomePaths[userRole] || "/staff";
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  // Check role access for protected route prefixes
  for (const [prefix, allowedRoles] of Object.entries(routeRoleMap)) {
    if (pathname.startsWith(prefix) && !allowedRoles.includes(userRole)) {
      const homePath = roleHomePaths[userRole] || "/staff";
      return NextResponse.redirect(new URL(homePath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
