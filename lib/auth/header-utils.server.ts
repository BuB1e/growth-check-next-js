/**
 * Server-only header utilities (for RSC, Server Actions).
 * Uses dynamic import to prevent bundling next/headers in client contexts.
 */

function isPrerenderHeadersError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("During prerendering") &&
    error.message.includes("`headers()`")
  );
}

export async function getForwardHeaders(): Promise<Record<string, string>> {
  // During static prerender there is no request context, so header access can reject.
  // Return empty forwarding headers in that scenario to keep builds deterministic.
  try {
    const { headers } = await import("next/headers");
    const headersList = await headers();
    return {
      cookie: headersList.get("cookie") || "",
      "user-agent": headersList.get("user-agent") || "",
    };
  } catch (error) {
    if (isPrerenderHeadersError(error)) {
      return {};
    }

    throw error;
  }
}