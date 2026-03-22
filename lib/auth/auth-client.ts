// Client-side BetterAuth

import { EnvConfig } from "@/configs/BackendConfig";
import { createAuthClient } from "better-auth/react";

// The baseURL is relative to the current origin.
// Next.js middleware will rewrite /api/auth requests to the BACKEND_ENDPOINT.
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // In SSR, BetterAuth needs a full URL.
  // We'll use a placeholder or the actual APP_URL if we had one.
  // If we don't have one, omitting it might be safer IF the calling code handles it,
  // but many BetterAuth versions require a string.
  return EnvConfig.BACKEND_ENDPOINT || "NO_BACKEND_ENDPOINT_IN_ENV_CONFIG";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});
