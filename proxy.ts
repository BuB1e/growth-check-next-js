import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip rewrites for API, internal Next.js paths, or static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.includes("/api/") ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Define which shared top-level routes need to be routed
  const sharedRoutes = [
    "/dashboard",
    "/staff",
    "/children",
    "/requests",
    "/history",
  ];

  // Head-only routes
  const headRoutes = ["/head"]; // captures /head/history, /head/requests, etc.

  // Check if current path starts with any of our known route prefixes
  const isSharedOrHeadRoute =
    sharedRoutes.some((route) => pathname.startsWith(route)) ||
    headRoutes.some((route) => pathname.startsWith(route));

  // If this is one of our app routes (not the root `/` or an unhandled path)
  if (isSharedOrHeadRoute) {
    const ua = request.headers.get("user-agent")?.toLowerCase() || "";
    // Simple mobile device check (can be expanded)
    const isMobileDevice = /iphone|ipad|ipod|android|mobile/.test(ua);

    // You mentioned: Desktop = Admin/Head, Mobile = Staff.
    // Ideally, this is determined by a Session Cookie/JWT (e.g. `role=STAFF`),
    // but without seeing your auth implementation, checking the User-Agent
    // serves as the device bridge while you implement backend auth.
    //
    // TODO: If you have a role cookie, do this instead:
    // const role = request.cookies.get("role")?.value;
    // const isMobileView = role === "STAFF";
    const isMobileView = isMobileDevice;

    const url = request.nextUrl.clone();

    if (isMobileView) {
      // Rewrite transparently to /mobile/...
      url.pathname = `/mobile${pathname}`;
    } else {
      // Rewrite transparently to /desktop/...
      url.pathname = `/desktop${pathname}`;
    }

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// Config to run proxy only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
