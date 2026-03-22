import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const method = request.method;

  // 1. Proxy /api requests to backend
  // This handles both /api/auth (BetterAuth) and other generic /api/... calls
  if (pathname.startsWith("/api/")) {
    const backendUrl = process.env.BACKEND_ENDPOINT;
    if (!backendUrl) {
      console.error(`[Proxy] ERROR: No BACKEND_ENDPOINT configured for ${pathname}`);
      return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });
    }

    // BetterAuth expects /api/auth. Other routes might not have /api prefix on backend.
    // If it's NOT /api/auth, we strip the /api prefix for the backend call.
    let backendPath = pathname;
    if (!pathname.startsWith("/api/auth")) {
      backendPath = pathname.replace(/^\/api/, "");
    }
    const targetUrl = new URL(backendPath + search, backendUrl);
    console.log(`[Proxy] API: ${method} ${pathname} -> ${targetUrl.toString()}`);

    // Standard proxy headers to help backend handle redirects correctly
    const headers = new Headers(request.headers);
    headers.set("X-Forwarded-Host", request.nextUrl.host);
    headers.set("X-Forwarded-Port", request.nextUrl.port || (request.nextUrl.protocol === "https:" ? "443" : "80"));
    headers.set("X-Forwarded-Proto", request.nextUrl.protocol.replace(":", ""));

    return NextResponse.rewrite(targetUrl, {
      request: {
        headers,
      },
    });
  }

  // 2. Original proxy.ts logic for route groups (desktop/mobile)
  
  // Skip internal Next.js paths or static assets
  if (
    pathname.startsWith("/_next") ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Define which shared top-level routes need to be routed
  const sharedRoutes = [
    "/dashboard",
    "/location",
    "/staff",
    "/children",
    "/requests",
    "/history",
    "/profile",
  ];

  const headRoutes = ["/head"];

  const isSharedOrHeadRoute =
    sharedRoutes.some((route) => pathname.startsWith(route)) ||
    headRoutes.some((route) => pathname.startsWith(route));

  if (isSharedOrHeadRoute) {
    const ua = request.headers.get("user-agent")?.toLowerCase() || "";
    const isMobileDevice = /iphone|ipad|ipod|android|mobile/.test(ua);
    const isMobileView = isMobileDevice;

    const url = request.nextUrl.clone();

    if (pathname.startsWith("/location")) {
      url.pathname = `/desktop${pathname}`;
      console.log(`[Proxy] ROUTE: ${pathname} -> (Static Desktop) ${url.pathname}`);
      return NextResponse.rewrite(url);
    }

    if (isMobileView) {
      url.pathname = `/mobile${pathname}`;
    } else {
      url.pathname = `/desktop${pathname}`;
    }

    console.log(`[Proxy] ROUTE: ${pathname} -> (${isMobileView ? "Mobile" : "Desktop"}) ${url.pathname}`);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
