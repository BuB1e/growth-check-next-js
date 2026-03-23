import { headers } from "next/headers";

/**
 * Helper to get headers for forwarding authentication to the backend.
 * Works only on the server side (RSC, Server Actions, Middleware).
 * Using dynamic import in shared actions prevents this from leaking into client bundles.
 */
export async function getForwardHeaders() {
  const headersList = await headers();
  return {
    cookie: headersList.get("cookie") || "",
    "user-agent": headersList.get("user-agent") || "",
  };
}
