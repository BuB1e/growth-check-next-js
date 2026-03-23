/**
 * Client-safe header utilities (for Middleware, Edge Runtime).
 * This file should NOT import from "next/headers".
 */

/**
 * Create headers object for middleware/edge runtime.
 * Use this in proxy.ts (middleware) instead of getForwardHeaders.
 */
export function createMiddlewareHeaders(requestHeaders: Headers): Record<string, string> {
  return {
    cookie: requestHeaders.get("cookie") || "",
    "user-agent": requestHeaders.get("user-agent") || "",
  };
}
