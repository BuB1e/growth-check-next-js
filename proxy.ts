import { NextRequest, NextResponse } from "next/server";
import { UserCreateStatusAction } from "@/actions/UserCreateStatusAction";
import { Request_status } from "@/types";

// Structured Logger for Proxy
const log = {
  info: (msg: string, ctx?: any) => console.log(`[Proxy:INFO] ${msg}`, ctx ? JSON.stringify(ctx) : ""),
  error: (msg: string, ctx?: any) => console.error(`[Proxy:ERROR] ${msg}`, ctx || ""),
  auth: (outcome: string, user?: string, path?: string) => 
    console.log(`[Proxy:AUTH] [${outcome}] user=${user || 'guest'} path=${path}`),
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  const headers = new Headers(request.headers);
  headers.set("x-pathname", pathname);

  // 1. Proxy /api requests to backend
  if (pathname.startsWith("/api/")) {
    const backendUrl = process.env.BACKEND_ENDPOINT;
    if (!backendUrl) {
      log.error(`No BACKEND_ENDPOINT configured for ${pathname}`);
      return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });
    }

    let backendPath = pathname;
    if (!pathname.startsWith("/api/auth")) {
      backendPath = pathname.replace(/^\/api/, "");
    }
    const targetUrl = new URL(backendPath + search, backendUrl);
    
    // Minimal log for standard API calls to reduce noise
    // Hide full backend endpoint to adhere to security rules
    if (!pathname.startsWith("/api/auth/get-session")) {
      log.info(`API: ${method} ${pathname} -> ${backendPath}${search}`);
    }

    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.set("X-Forwarded-Host", request.nextUrl.host);
    proxyHeaders.set("X-Forwarded-Port", request.nextUrl.port || (request.nextUrl.protocol === "https:" ? "443" : "80"));
    proxyHeaders.set("X-Forwarded-Proto", request.nextUrl.protocol.replace(":", ""));

    return NextResponse.rewrite(targetUrl, {
      request: {
        headers: proxyHeaders,
      },
    });
  }

  // 1.5. Global Auth Guard & RBAC
  const isAuthRoute = pathname === "/login" || pathname === "/register" || pathname.startsWith("/api/auth");
  const isPendingPageRoute = pathname === "/pending-approval";
  const isPublicAsset = pathname.startsWith("/_next") || /\.(.*)$/.test(pathname);

  if (!isAuthRoute && !isPendingPageRoute && !isPublicAsset && !pathname.startsWith("/api/")) {
    const backendUrl = process.env.BACKEND_ENDPOINT;
    let session: any = null;
    try {
      const sessionRes = await fetch(`${backendUrl}/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
          "user-agent": request.headers.get("user-agent") || "",
          "x-forwarded-host": request.nextUrl.host,
        },
      });
      if (sessionRes.ok) {
        session = await sessionRes.json();
      }
    } catch (e) {
      log.error("Session Fetch Error", e);
    }

    if (!session) {
      log.auth("Unauthenticated - Redirecting to /login", undefined, pathname);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const user = session.user as { id: string; email: string; role: string; teamId?: string | number };
    
    // Check approval status FIRST
    try {
      const statusData = await UserCreateStatusAction.getStatuses({
        q: user.id,
        limit: 10
      }, {
        cookie: request.headers.get("cookie") || "",
        "user-agent": request.headers.get("user-agent") || "",
      });
      const userStatus = (statusData.data || []).find(s => s.userId === user.id);

      if (userStatus) {
        const currentStatus = userStatus.requestStatus as string;
        
        if (currentStatus !== Request_status.APPROVED && currentStatus !== "APPROVE") {
          log.auth("Pending Approval", user.email, pathname);
          return NextResponse.redirect(new URL("/pending-approval", request.url));
        }
      } else if (!user.teamId) {
        log.auth("Incomplete Registration", user.email, pathname);
        return NextResponse.redirect(new URL("/register?method=SOCIAL", request.url));
      }

      // 1.6. Role-Based Access Control (RBAC) Enforcement
      // Rule: Staff -> Mobile, Admin/Head -> Desktop
      const isDesktopPlatform = pathname.startsWith("/desktop");
      const isMobilePlatform = pathname.startsWith("/mobile");

      if (user.role === 'STAFF') {
        if (isDesktopPlatform) {
          log.auth("RBAC Restriction: Staff restricted to Mobile. Redirecting to shared path.", user.email, pathname);
          // Redirect to the shared equivalent (e.g., /desktop/dashboard -> /dashboard)
          const sharedPath = pathname.replace("/desktop", "") || "/dashboard";
          return NextResponse.redirect(new URL(sharedPath, request.url));
        }
      } else if (user.role === 'ADMIN' || user.role === 'HEAD') {
        if (isMobilePlatform) {
          log.auth("RBAC Restriction: Admin/Head restricted to Desktop. Redirecting to shared path.", user.email, pathname);
          // Redirect to the shared equivalent (e.g., /mobile/dashboard -> /dashboard)
          const sharedPath = pathname.replace("/mobile", "") || "/dashboard";
          return NextResponse.redirect(new URL(sharedPath, request.url));
        }
      }

      log.auth("Approved", user.email, pathname);

    } catch (error) {
      log.error("Status Check Error", error);
      return NextResponse.redirect(new URL("/pending-approval", request.url));
    }
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
    return NextResponse.rewrite(url, {
      request: {
        headers,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers,
    },
  });
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
