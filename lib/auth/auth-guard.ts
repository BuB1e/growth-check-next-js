import { headers } from "next/headers";
import { cache } from "react";
import { UserCreateStatusAction } from "@/actions/UserCreateStatusAction";
import { Request_status } from "@/types/Enums";

import type { UserCreateStatusResponse } from "@/dto";

type AuthUser = { id: string; email: string; teamId?: string | number; name?: string | null; image?: string | null };

export type AuthStatus =
  | { status: "UNAUTHENTICATED" }
  | { status: "NEED_REGISTRATION"; user: AuthUser }
  | { status: typeof Request_status.WAITING; user: AuthUser; requestStatus: UserCreateStatusResponse }
  | { status: typeof Request_status.REJECTED; user: AuthUser; requestStatus: UserCreateStatusResponse }
  | { status: typeof Request_status.APPROVED; user: AuthUser; requestStatus: UserCreateStatusResponse }
  | { status: "ERROR"; message: string };

/**
 * Internal helper to fetch session directly from backend using request headers.
 * Bypasses local BetterAuth instance to avoid port/cookie-name mismatch issues.
 * Memoized using React cache to prevent multiple fetches in one request.
 */
export const getInternalSession = cache(async () => {
  const headersList = await getForwardHeaders();
  const backendUrl = process.env.BACKEND_ENDPOINT || "";
  try {
    const sessionRes = await fetch(`${backendUrl}/api/auth/get-session`, {
      headers: headersList,
      cache: 'no-store'
    });
    if (sessionRes.ok) {
      return await sessionRes.json();
    }
  } catch (e) {
    console.error("[Auth Guard] Session Fetch Error:", e);
  }
  return null;
});

/**
 * Helper to get headers for forwarding authentication to the backend.
 * Works only on the server side (RSC, Server Actions).
 */
export async function getForwardHeaders() {
  const headersList = await headers();
  return {
    cookie: headersList.get("cookie") || "",
    "user-agent": headersList.get("user-agent") || "",
  };
}

/**
 * Get the current user's ID from the session (Server Side).
 * Throws an error if the user is not authenticated.
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await getInternalSession();
  if (!session || !session.user) {
    throw new Error("User not authenticated");
  }
  return session.user.id;
}

/**
 * Server-side utility to check the current user's session and registration/approval status.
 * Memoized using React cache to prevent multiple checks in one request.
 */
export const checkUserStatus = cache(async (): Promise<AuthStatus> => {
  try {
    const session = await getInternalSession();

    if (!session || !session.user) {
      return { status: "UNAUTHENTICATED" };
    }

    const user = session.user as AuthUser;

    // 1. Check if user is registered (has teamId)
    if (!user.teamId) {
      return { status: "NEED_REGISTRATION", user };
    }

    // 2. Fetch UserCreateStatus to check for approval status
    try {
      const statusData = await UserCreateStatusAction.getStatuses({
        q: user.id
      });

      const userStatus = statusData.data?.find(s => s.userId === user.id);

      if (!userStatus) {
        return { status: "NEED_REGISTRATION", user };
      }

      const requestStatusStr = userStatus.requestStatus as string;

      if (requestStatusStr === Request_status.APPROVED || requestStatusStr === "APPROVE") {
        return { status: Request_status.APPROVED, user, requestStatus: userStatus };
      } else if (requestStatusStr === Request_status.REJECTED || requestStatusStr === "REJECT") {
        return { status: Request_status.REJECTED, user, requestStatus: userStatus };
      } else {
        return { status: Request_status.WAITING, user, requestStatus: userStatus };
      }

    } catch (statusError) {
      console.error("Failed to fetch user status:", statusError);
      return { status: "ERROR", message: "Failed to verify account status" };
    }

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Authentication check failed";
    console.error("Auth Guard Error:", error);
    return { status: "ERROR", message: errorMsg };
  }
});
