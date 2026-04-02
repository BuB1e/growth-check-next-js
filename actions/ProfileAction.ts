import axios from "axios";
import { EnvConfig } from "@/configs/BackendConfig";
import type { UserResponse, UpdateUserDto } from "@/dto";
import { getCurrentUserId } from "@/lib/auth/auth-guard";

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export class ProfileAction {
  static BACKEND_ENDPOINT = EnvConfig.BACKEND_ENDPOINT || "";
  static API_ENDPOINT = "/users";
  static ACTION_ENDPOINT = this.BACKEND_ENDPOINT + this.API_ENDPOINT;

  static async getCurrentUser(): Promise<UserResponse & { provider?: string }> {
    const userId = await getCurrentUserId();
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    
    // Fetch user details from regular API
    const response = await axios.get(
      `${this.ACTION_ENDPOINT}/getById/${userId}`,
      { headers: activeHeaders }
    );
    
    // Fetch session to get login provider
    let provider = "email"; // Default
    try {
      const { getCurrentSession } = await import("@/lib/auth/session.server");
      const session = await getCurrentSession();
      
      if (session?.user) {
        type SessionUserWithProvider = typeof session.user & { provider?: string };
        const sessionUser = session.user as SessionUserWithProvider;
        // 1. Try to get from session/user if provided by backend
        if (sessionUser.provider) {
          provider = sessionUser.provider;
        } 
        // 2. Heuristic check: Social logins usually have an image (avatar)
        // while native logins on this system might not, unless uploaded.
        // Google avatars usually start with googleusercontent.com
        else if (session.user.image?.includes("googleusercontent.com")) {
          provider = "google";
        }
        else if (session.user.image?.includes("line-cdn.net") || session.user.image?.includes("static.line-scdn.net")) {
          provider = "line";
        }
      }
      console.log("[ProfileAction] Determined provider from session/metadata:", provider);
    } catch (e) {
      console.warn("[ProfileAction] Failed to fetch session info:", e);
    }

    // Fallback: Read from BetterAuth's last login cookie if SSR
    if (provider === "email" && typeof window === "undefined") {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        
        // Try various cookie names just in case
        const lastUsed = cookieStore.get("better-auth.last_used_login_method")?.value ||
                         cookieStore.get("__Host-better-auth.last_used_login_method")?.value;
        
        if (lastUsed) {
          provider = lastUsed;
          console.log("[ProfileAction] Fallback provider from cookie:", provider);
        }
      } catch {
        // ignore
      }
    }

    return { 
      ...response.data,
      provider
    };
  }
  static async updateCurrentUser(
    data: UpdateUserDto,
  ): Promise<UserResponse> {
    const userId = await getCurrentUserId();
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    const response = await axios.patch(
      `${this.ACTION_ENDPOINT}/${userId}`,
      data,
      { headers: activeHeaders }
    );
    return response.data;
  }

  static async changePassword(data: ChangePasswordDto): Promise<void> {
    const backendUrl = EnvConfig.BACKEND_ENDPOINT || "";
    let activeHeaders = undefined;
    if (typeof window === 'undefined') {
      const { getForwardHeaders } = await import("@/lib/auth/header-utils.server");
      activeHeaders = await getForwardHeaders();
    }
    
    // BetterAuth change-password endpoint
    await axios.post(
      `${backendUrl}/api/auth/change-password`,
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      },
      { headers: activeHeaders }
    );
  }
}
