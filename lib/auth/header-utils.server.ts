/**
 * Server-only header utilities (for RSC, Server Actions).
 * Uses dynamic import to prevent bundling next/headers in client contexts.
 */

export async function getForwardHeaders() {
  // Dynamic import ensures next/headers is only loaded in server contexts
  const { headers } = await import("next/headers");
  const headersList = await headers();
  return {
    cookie: headersList.get("cookie") || "",
    "user-agent": headersList.get("user-agent") || "",
  };
}